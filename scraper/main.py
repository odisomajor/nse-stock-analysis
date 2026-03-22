import os
from datetime import datetime, timedelta
import psycopg2
from psycopg2.extras import execute_values
from dotenv import load_dotenv
import yfinance as yf
import pandas as pd

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Top Nairobi Securities Exchange (Kenya) tickers available on Yahoo Finance
KENYA_TICKERS = [
    "SCOM.NR", # Safaricom
    "EQTY.NR", # Equity Group
    "KCB.NR",  # KCB Group
    "EABL.NR", # East African Breweries
    "COOP.NR", # Co-operative Bank
    "NCBA.NR", # NCBA Group
    "BAT.NR",  # BAT Kenya
    "ABSA.NR", # ABSA Bank Kenya
    "SCBK.NR", # Standard Chartered Kenya
    "DTK.NR",  # Diamond Trust Bank
    "I&M.NR",  # I&M Holdings
    "KEGN.NR", # KenGen
    "BAMB.NR", # Bamburi Cement
    "CTUM.NR", # Centum Investment
    "NSE.NR",  # Nairobi Securities Exchange
]

def fetch_kenyan_stocks():
    """Fetch the latest stock data for Kenyan tickers using yfinance."""
    print(f"Fetching data for {len(KENYA_TICKERS)} Kenyan stocks...")
    
    stocks = []
    
    # Download data for the last 5 days to ensure we get the latest trading day
    data = yf.download(KENYA_TICKERS, period="5d", group_by="ticker", auto_adjust=False)
    
    if data.empty:
        print("Failed to download any data from Yahoo Finance.")
        return []
        
    for ticker in KENYA_TICKERS:
        try:
            # Check if we have data for this ticker
            if ticker not in data.columns.levels[0]:
                continue
                
            ticker_data = data[ticker].dropna()
            if ticker_data.empty:
                continue
                
            # Get the last two days to calculate changes
            latest_row = ticker_data.iloc[-1]
            
            prev_close = latest_row['Close']
            if len(ticker_data) > 1:
                prev_close = ticker_data.iloc[-2]['Close']
                
            close_price = latest_row['Close']
            change = close_price - prev_close
            p_change = (change / prev_close) * 100 if prev_close > 0 else 0
            
            # Clean ticker symbol (remove .NR)
            clean_symbol = ticker.replace(".NR", "")
            
            stock = {
                'symbol': clean_symbol,
                'companyName': clean_symbol, # yfinance bulk download doesn't give names easily
                'date': latest_row.name.date(),
                'open': float(latest_row['Open']),
                'high': float(latest_row['High']),
                'low': float(latest_row['Low']),
                'close': float(close_price),
                'prevClose': float(prev_close),
                'volume': int(latest_row['Volume']),
                'deliveryVolume': 0,
                'deliveryPercent': 0.0,
                'vwap': float(close_price) # approximation
            }
            
            stock['change'] = float(change)
            stock['pChange'] = float(p_change)
            
            stocks.append(stock)
            
        except Exception as e:
            print(f"Error processing {ticker}: {e}")
            
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
            ON CONFLICT (symbol, date) 
            DO UPDATE SET 
                open = EXCLUDED.open,
                high = EXCLUDED.high,
                low = EXCLUDED.low,
                close = EXCLUDED.close,
                "prevClose" = EXCLUDED."prevClose",
                change = EXCLUDED.change,
                "pChange" = EXCLUDED."pChange",
                volume = EXCLUDED.volume,
                vwap = EXCLUDED.vwap,
                "updatedAt" = EXCLUDED."updatedAt";
        """
        
        # Format the data for execute_values
        now = datetime.now()
        values = [
            (
                s['symbol'], s['companyName'], s['date'], s['open'], s['high'], 
                s['low'], s['close'], s['prevClose'], s['change'], s['pChange'], 
                s['volume'], s['deliveryVolume'], s['deliveryPercent'], s['vwap'], now
            ) 
            for s in stocks
        ]
        
        execute_values(cur, query, values)
        conn.commit()
        print("Successfully saved to database!")
        
    except Exception as e:
        print(f"Database error: {e}")
    finally:
        if 'conn' in locals() and conn:
            cur.close()
            conn.close()

def main():
    print("Starting Nairobi Securities Exchange Scraper...")
    
    # We use yfinance which handles the dates automatically based on market hours
    stocks = fetch_kenyan_stocks()
    save_to_database(stocks)

if __name__ == "__main__":
    main()
