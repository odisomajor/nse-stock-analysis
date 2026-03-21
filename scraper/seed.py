import os
import psycopg2
from psycopg2.extras import execute_values
from dotenv import load_dotenv
import random
from datetime import datetime, timedelta

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# List of popular NSE stocks
STOCKS = [
    {"symbol": "RELIANCE", "name": "Reliance Industries Ltd.", "base_price": 2950.0},
    {"symbol": "TCS", "name": "Tata Consultancy Services Ltd.", "base_price": 4100.0},
    {"symbol": "HDFCBANK", "name": "HDFC Bank Ltd.", "base_price": 1450.0},
    {"symbol": "INFY", "name": "Infosys Ltd.", "base_price": 1650.0},
    {"symbol": "ICICIBANK", "name": "ICICI Bank Ltd.", "base_price": 1050.0},
    {"symbol": "SBIN", "name": "State Bank of India", "base_price": 750.0},
    {"symbol": "BHARTIARTL", "name": "Bharti Airtel Ltd.", "base_price": 1150.0},
    {"symbol": "ITC", "name": "ITC Ltd.", "base_price": 420.0},
    {"symbol": "L&T", "name": "Larsen & Toubro Ltd.", "base_price": 3400.0},
    {"symbol": "BAJFINANCE", "name": "Bajaj Finance Ltd.", "base_price": 6800.0},
    {"symbol": "KOTAKBANK", "name": "Kotak Mahindra Bank Ltd.", "base_price": 1750.0},
    {"symbol": "HUL", "name": "Hindustan Unilever Ltd.", "base_price": 2400.0},
    {"symbol": "AXISBANK", "name": "Axis Bank Ltd.", "base_price": 1050.0},
    {"symbol": "NTPC", "name": "NTPC Ltd.", "base_price": 340.0},
    {"symbol": "MARUTI", "name": "Maruti Suzuki India Ltd.", "base_price": 11500.0},
    {"symbol": "TATASTEEL", "name": "Tata Steel Ltd.", "base_price": 150.0},
    {"symbol": "ASIANPAINT", "name": "Maruti Suzuki India Ltd.", "base_price": 2900.0},
    {"symbol": "WIPRO", "name": "Wipro Ltd.", "base_price": 520.0},
    {"symbol": "HCLTECH", "name": "HCL Technologies Ltd.", "base_price": 1600.0},
    {"symbol": "TITAN", "name": "Titan Company Ltd.", "base_price": 3700.0}
]

def generate_mock_data():
    """Generate realistic mock data for the stocks for today."""
    today = datetime.now().date()
    records = []
    
    for stock in STOCKS:
        # Generate realistic looking numbers
        volatility = stock["base_price"] * 0.03 # 3% volatility
        change = random.uniform(-volatility, volatility)
        
        prev_close = stock["base_price"]
        close = prev_close + change
        open_price = prev_close + random.uniform(-volatility/2, volatility/2)
        
        high = max(open_price, close) + random.uniform(0, volatility/2)
        low = min(open_price, close) - random.uniform(0, volatility/2)
        
        p_change = (change / prev_close) * 100
        
        volume = random.randint(1000000, 25000000)
        delivery_percent = random.uniform(30.0, 75.0)
        delivery_volume = int(volume * (delivery_percent / 100))
        
        vwap = (high + low + close) / 3 # Simplified VWAP calculation
        
        records.append({
            'symbol': stock["symbol"],
            'companyName': stock["name"],
            'date': today,
            'open': round(open_price, 2),
            'high': round(high, 2),
            'low': round(low, 2),
            'close': round(close, 2),
            'prevClose': round(prev_close, 2),
            'change': round(change, 2),
            'pChange': round(p_change, 2),
            'volume': volume,
            'deliveryVolume': delivery_volume,
            'deliveryPercent': round(delivery_percent, 2),
            'vwap': round(vwap, 2)
        })
        
    return records

def save_to_database(stocks):
    """Save the stocks to the PostgreSQL database."""
    print(f"Saving {len(stocks)} records to database...")
    
    try:
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
            "deliveryVolume" = EXCLUDED."deliveryVolume",
            "deliveryPercent" = EXCLUDED."deliveryPercent",
            vwap = EXCLUDED.vwap,
            "updatedAt" = CURRENT_TIMESTAMP
        """
        
        values = [
            (
                s['symbol'], s['companyName'], s['date'], s['open'], s['high'], s['low'], 
                s['close'], s['prevClose'], s['change'], s['pChange'], s['volume'], 
                s['deliveryVolume'], s['deliveryPercent'], s['vwap'], datetime.now()
            ) 
            for s in stocks
        ]
        
        execute_values(cur, query, values)
        conn.commit()
        print("Successfully seeded the database with live-looking data!")
        
    except Exception as e:
        print(f"Database error: {e}")
        if 'conn' in locals():
            conn.rollback()
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    print("Generating initial seed data...")
    mock_data = generate_mock_data()
    save_to_database(mock_data)