import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

def clear_db():
    print("Clearing old Indian stock data...")
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        
        cur.execute('DELETE FROM "StockData";')
        conn.commit()
        print("Database cleared successfully!")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if 'conn' in locals() and conn:
            cur.close()
            conn.close()

if __name__ == "__main__":
    clear_db()