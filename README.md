# Nairobi Securities Exchange (NSE) Stock Analysis Platform

A modern stock analysis website focused on the Nairobi Securities Exchange, providing up-to-date charts, company news, and daily scraped data.

## 🏗️ Architecture Overview

The system is split into three main components:

1. **Frontend (Next.js)**: A fast, SEO-friendly React framework. It will host the interactive stock charts, news feeds, and user dashboards.
   - **Styling**: Tailwind CSS
   - **Charts**: Recharts / Chart.js
   - **Data Fetching**: React Query / Server Actions

2. **Daily Scraper (Python)**: A robust background worker that visits company websites and news portals to extract daily stock prices, financial reports, and news.
   - **Framework**: Beautiful Soup 4 / Playwright (for dynamic JS heavy sites)
   - **Orchestration**: Cron jobs / APScheduler
   - **Data Processing**: Pandas

3. **Database (PostgreSQL)**: A relational database optimized for time-series data (stock prices) and structured data (company profiles, news).
   - **ORM**: Prisma (for Next.js) or SQLAlchemy (for Python)

## 🗂️ Project Structure

- `/frontend` - Next.js application codebase
- `/scraper` - Python scraping scripts and scheduling logic
- `/database` - SQL schema migrations and seed data

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (3.10+)
- PostgreSQL

### Setup Instructions

We use Docker to simplify the deployment of the entire stack (Frontend, Scraper, and Database).

1. Ensure you have [Docker](https://www.docker.com/products/docker-desktop/) and Docker Compose installed.
2. Clone the repository and navigate to the root directory.
3. Build and start the services:
   ```bash
   docker-compose up -d --build
   ```
4. Access the web interface at `http://localhost:3000`.

### Deploying to Production (Cloud)

You can easily deploy this full stack to any VPS (like DigitalOcean, AWS EC2, or Hetzner) that supports Docker:

1. Clone your code to the server.
2. Change the default passwords in `docker-compose.yml`.
3. Run `docker-compose up -d --build`.
4. (Optional) Set up an Nginx reverse proxy to serve the frontend over HTTPS.

Alternatively, you can split the deployment:
- **Frontend**: Deploy to **Vercel** or **Netlify** by connecting your GitHub repository. Set `DATABASE_URL` in the Vercel dashboard.
- **Database**: Use a managed PostgreSQL database like **Supabase** or **Neon**.
- **Scraper**: Deploy the Python app to **Render**, **Railway**, or **Heroku** as a background worker.
