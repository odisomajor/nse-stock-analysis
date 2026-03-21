import os
import zipfile
import io
import csv
from datetime import datetime, timedelta
import psycopg2
from psycopg2.extras import execute_values
from dotenv import load_dotenv
from curl_cffi import requests as cffi_requests

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

def get_latest_trading_date():
    """Get the latest likely trading date (skipping weekends)."""
    date = datetime.now()
    if date.hour < 18:  # NSE publishes bhavcopy around 6 PM IST
        date = date - timedelta(days=1)
    
    # Adjust for weekends
    if date.weekday() == 5:  # Saturday
        date = date - timedelta(days=1)
    elif date.weekday() == 6:  # Sunday
        date = date - timedelta(days=2)
        
    return date

def download_and_extract_bhavcopy(date):
    """Download the NSE bhavcopy using curl_cffi to bypass bot protections."""
    date_str_yyyyMMdd = date.strftime("%Y%m%d")
    date_str_ddMMMyyyy = date.strftime("%d%b%Y").upper()
    
    # Old and New NSE website URL formats
    url_new = f"https://nsearchives.nseindia.com/content/equities/BhavCopy_NSE_CM_0_0_0_{date_str_yyyyMMdd}_F_0000.csv.zip"
    url_old = f"https://archives.nseindia.com/content/historical/EQUITIES/{date.strftime('%Y')}/{date.strftime('%b').upper()}/cm{date_str_ddMMMyyyy}bhav.csv.zip"
    
    urls_to_try = [url_new, url_old]
    
    print(f"Downloading Bhavcopy for {date.strftime('%d-%b-%Y')} via curl_cffi...")
    
    # Create a session that impersonates Chrome perfectly
    session = cffi_requests.Session(impersonate="chrome120")
    
    # First get cookies
    try:
        session.get("https://www.nseindia.com", timeout=15)
    except Exception as e:
        print(f"  Warning: Homepage load issue: {e}")
        
    for url in urls_to_try:
        print(f"  Requesting zip file: {url}")
        try:
            response = session.get(url, timeout=15)
            if response.status_code == 200:
                # Extract zip
                z = zipfile.ZipFile(io.BytesIO(response.content))
                filename = z.namelist()[0]
                with z.open(filename) as f:
                    content = f.read().decode('utf-8')
                return content, date
            elif response.status_code == 404:
                print(f"  File not found on server (404).")
            else:
                print(f"  Failed. Status code: {response.status_code}")
        except Exception as e:
            print(f"  Failed to download file from this URL: {e}")
            
    return None, date

def parse_bhavcopy(csv_content, date):
    """Parse the bhavcopy CSV and return a list of stock records."""
    if not csv_content:
        return []
        
    reader = csv.DictReader(io.StringIO(csv_content))
    stocks = []
    
    for row in reader:
        # Check which format it is based on column names
        is_new_format = 'TKT_NM' in row
        
        series = row.get('SERIES', row.get(' SERIES', '')).strip()
        
        # Only process EQ (Equity) series
        if series == 'EQ':
            try:
                if is_new_format:
                    symbol = row['TKT_NM']
                    open_price = float(row['OPN_PRC'])
                    high = float(row['HGH_PRC'])
                    low = float(row['LW_PRC'])
                    close = float(row['CLS_PRC'])
                    prev_close = float(row['PRVS_CLS_PRC'])
                    volume = int(row['TTL_TRD_QNTY'])
                    trade_val = float(row['TTL_TRD_VAL'])
                else:
                    symbol = row['SYMBOL']
                    open_price = float(row['OPEN'])
                    high = float(row['HIGH'])
                    low = float(row['LOW'])
                    close = float(row['CLOSE'])
                    prev_close = float(row['PREVCLOSE'])
                    volume = int(row['TOTTRDQTY'])
                    trade_val = float(row['TOTTRDVAL'])

                stock = {
                    'symbol': symbol,
                    'companyName': symbol, # We don't get full company name in this file easily
                    'date': date.date(),
                    'open': open_price,
                    'high': high,
                    'low': low,
                    'close': close,
                    'prevClose': prev_close,
                    'volume': volume,
                    # These might not be in the new format exactly, using defaults if missing
                    'deliveryVolume': 0,
                    'deliveryPercent': 0.0,
                    'vwap': trade_val / volume if volume > 0 else 0
                }
                
                # Calculate change
                stock['change'] = stock['close'] - stock['prevClose']
                stock['pChange'] = (stock['change'] / stock['prevClose']) * 100 if stock['prevClose'] > 0 else 0
                
                stocks.append(stock)
            except (ValueError, KeyError) as e:
                # Skip rows with invalid numeric data or missing expected columns
                pass
                
    return stocks

def save_to_database(stocks):
    """Save the parsed stocks to the PostgreSQL database."""
    if not stocks:
        print("No stocks to save.")
        return
        
    print(f"Saving {len(stocks)} records to database...")
    
    try:
        # Connect to your postgres DB
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        
        # Ensure table exists
        cur.execute("""
            CREATE TABLE IF NOT EXISTS "StockData" (
                id TEXT NOT NULL DEFAULT gen_random_uuid()::text,
                symbol TEXT NOT NULL,
                "companyName" TEXT,
                date TIMESTAMP(3) NOT NULL,
                open DOUBLE PRECISION NOT NULL,
                high DOUBLE PRECISION NOT NULL,
                low DOUBLE PRECISION NOT NULL,
                close DOUBLE PRECISION NOT NULL,
                "prevClose" DOUBLE PRECISION NOT NULL,
                change DOUBLE PRECISION NOT NULL,
                "pChange" DOUBLE PRECISION NOT NULL,
                volume INTEGER NOT NULL,
                "deliveryVolume" INTEGER,
                "deliveryPercent" DOUBLE PRECISION,
                vwap DOUBLE PRECISION NOT NULL,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL,
                CONSTRAINT "StockData_pkey" PRIMARY KEY (id)
            );
            
            CREATE UNIQUE INDEX IF NOT EXISTS "StockData_symbol_date_key" ON "StockData"(symbol, date);
            CREATE INDEX IF NOT EXISTS "StockData_date_idx" ON "StockData"(date);
            CREATE INDEX IF NOT EXISTS "StockData_symbol_idx" ON "StockData"(symbol);
        """)
        conn.commit()
        
        # Prepare the query
        query = """
            INSERT INTO "StockData" 
            (symbol, "companyName", date, open, high, low, close, "prevClose", change, "pChange", volume, "deliveryVolume", "deliveryPercent", vwap, "updatedAt")
            VALUES %s
            ON CONFLICT (symbol, date) DO UPDATE SET
            open = EXCLUDED.open,
            high = EXCLUDED.high,
            low = EXCLUDED.low,
            close = EXCLUDED.close,
            "prevClose" = EXCLUDED."prevClose",
            change = EXCLUDED.change,
            "pChange" = EXCLUDED."pChange",
            volume = EXCLUDED.volume,
            vwap = EXCLUDED.vwap,
            "updatedAt" = CURRENT_TIMESTAMP
        """
        
        # Prepare the values
        values = [
            (
                s['symbol'], s['companyName'], s['date'], s['open'], s['high'], s['low'], 
                s['close'], s['prevClose'], s['change'], s['pChange'], s['volume'], 
                s['deliveryVolume'], s['deliveryPercent'], s['vwap'], datetime.now()
            ) 
            for s in stocks
        ]
        
        # Execute batch insert
        execute_values(cur, query, values)
        
        # Commit changes
        conn.commit()
        print("Successfully saved to database!")
        
    except Exception as e:
        print(f"Database error: {e}")
        if 'conn' in locals():
            conn.rollback()
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

def main():
    print("Starting NSE Scraper...")
    
    # Try the last 5 days to find the most recent trading day
    for i in range(5):
        date = get_latest_trading_date() - timedelta(days=i)
        csv_content, actual_date = download_and_extract_bhavcopy(date)
        
        if csv_content:
            stocks = parse_bhavcopy(csv_content, actual_date)
            print(f"Parsed {len(stocks)} stocks.")
            save_to_database(stocks)
            break
        else:
            print(f"No data for {date.strftime('%d-%b-%Y')}, trying previous day...")

if __name__ == "__main__":
    main()
