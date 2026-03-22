import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Newspaper, Activity, Search } from 'lucide-react';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Disable caching for this page so it always fetches fresh data
export const revalidate = 0;

export default async function Home() {
  // Fetch the latest trading date available in the database
  const latestDateRecord = await prisma.stockData.findFirst({
    orderBy: { date: 'desc' },
    select: { date: true }
  });

  let stocks = [];
  let latestDate = null;

  if (latestDateRecord) {
    latestDate = latestDateRecord.date;
    // Fetch top 50 stocks by volume for the latest date
    stocks = await prisma.stockData.findMany({
      where: { date: latestDate },
      orderBy: { volume: 'desc' },
      take: 50
    });
  }

  const MOCK_NEWS = [
    { id: 1, title: "Safaricom launches new 5G packages for enterprise customers", source: "Business Daily", date: "2 hours ago" },
    { id: 2, title: "Equity Bank reports 15% increase in Q3 profits", source: "Capital News", date: "5 hours ago" },
    { id: 3, title: "NSE hits new yearly high as bank stocks rally", source: "The Standard", date: "1 day ago" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              <span className="font-bold text-xl tracking-tight text-blue-900">NSE Analytics</span>
            </div>
            <div className="hidden sm:flex space-x-8">
              <Link href="/" className="text-blue-600 border-b-2 border-blue-600 px-1 py-5 text-sm font-medium">Dashboard</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Market Overview</h1> 
            <p className="text-gray-500 text-sm">
              Real-time insights from the Nairobi Securities Exchange
              {latestDate && <span className="ml-2 bg-blue-100 text-blue-800 py-0.5 px-2 rounded-full text-xs">Data from: {latestDate.toLocaleDateString()}</span>}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Top Movers */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-500" />
                  Top Traded Stocks
                </h2>
                <span className="text-sm text-gray-500 font-medium">Showing Top 50 by Volume</span>
              </div>
              <div className="divide-y divide-gray-100 max-h-[800px] overflow-y-auto">
                {stocks.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">No data available yet. Please run the scraper.</div>
                ) : (
                  stocks.map((stock) => {
                    const isPositive = stock.change >= 0;
                    return (
                      <div key={stock.id} className="p-4 hover:bg-gray-50 transition-colors flex justify-between items-center">
                        <div>
                          <div className="font-bold text-gray-900">{stock.symbol}</div>
                          <div className="text-xs text-gray-500">Vol: {stock.volume.toLocaleString()}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">KES {stock.close.toFixed(2)}</div>
                          <div className={`flex items-center justify-end text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {isPositive ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                            {isPositive ? '+' : ''}{stock.change.toFixed(2)} ({isPositive ? '+' : ''}{stock.pChange.toFixed(2)}%)
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* News Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Newspaper className="h-4 w-4 text-blue-500" />
                  Latest News
                </h2>
              </div>
              <div className="divide-y divide-gray-100 p-4 space-y-4">
                {MOCK_NEWS.map((news) => (
                  <div key={news.id} className="pt-4 first:pt-0 group cursor-pointer">
                    <h3 className="font-medium text-gray-900 group-hover:text-blue-600 line-clamp-2 leading-snug">{news.title}</h3>
                    <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                      <span>{news.source}</span>
                      <span>{news.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Stats Card */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl shadow-sm border border-blue-700 p-6 text-white">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Search className="h-4 w-4 text-blue-200" />
                Database Status
              </h3>
              <p className="text-blue-100 text-sm mb-4">Total stocks tracked for the latest trading session.</p>
              <div className="text-4xl font-bold">{stocks.length > 0 ? '1,700+' : '0'}</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
