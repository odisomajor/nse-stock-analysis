import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/nse_db")
    # Base URL for NSE or data providers
    NSE_BASE_URL = "https://www.nse.co.ke"
    # User agent to avoid blocking
    USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
