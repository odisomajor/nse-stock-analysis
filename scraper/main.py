import os
import time
from dotenv import load_dotenv
from apscheduler.schedulers.blocking import BlockingScheduler
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

def scrape_daily_data():
    """
    Main job that will be executed daily to scrape stock prices and news.
    """
    logger.info("Starting daily scrape job...")
    try:
        # TODO: Implement scraping logic here
        # 1. Fetch stock prices
        # 2. Fetch company news
        # 3. Process and save to database
        logger.info("Daily scrape job completed successfully.")
    except Exception as e:
        logger.error(f"Error during daily scrape: {e}")

if __name__ == "__main__":
    logger.info("Initializing NSE Scraper Service...")
    
    # Run once on startup
    scrape_daily_data()
    
    # Schedule to run every day at a specific time (e.g., 6:00 PM after market closes)
    # Market closes at 3:00 PM EAT, so 6:00 PM is a good time to get End of Day data.
    scheduler = BlockingScheduler()
    scheduler.add_job(scrape_daily_data, 'cron', hour=18, minute=0)
    
    logger.info("Scheduler started. Waiting for jobs...")
    try:
        scheduler.start()
    except (KeyboardInterrupt, SystemExit):
        logger.info("Scheduler stopped.")
