import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Newspaper, Activity } from 'lucide-react';

// Mock Data
const MOCK_STOCKS = [
  { id: 1, ticker: "SCOM", name: "Safaricom Plc", price: 15.45, change: 0.25, percentChange: 1.64 },
  { id: 2, ticker: "EQTY", name: "Equity Group Holdings", price: 38.50, change: -0.50, percentChange: -1.28 },
  { id: 3, ticker: "KCB", name: "KCB Group Plc", price: 22.10, change: 0.10, percentChange: 0.45 },
  { id: 4, ticker: "EABL", name: "East African Breweries", price: 112.00, change: 1.50, percentChange: 1.36 },
];

const MOCK_NEWS = [
  { id: 1, title: "Safaricom launches new 5G packages for enterprise customers", source: "Business Daily", date: "2 hours ago" },
  { id: 2, title: "Equity Bank reports 15% increase in Q3 profits", source: "Capital News", date: "5 hours ago" },
  { id: 3, title: "NSE hits new yearly high as bank stocks rally", source: "The Standard", date: "1 day ago" },
];

export default function Home() {
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
              <Link href="/stocks" className="text-gray-500 hover:text-gray-700 px-1 py-5 text-sm font-medium">Stocks</Link>
              <Link href="/news" className="text-gray-500 hover:text-gray-700 px-1 py-5 text-sm font-medium">News</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Market Overview</h1>
          <p className="text-gray-500 text-sm">Real-time insights from the Nairobi Securities Exchange</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Top Movers */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-500" />
                  Market Watch
                </h2>
                <Link href="/stocks" className="text-sm text-blue-600 hover:text-blue-800 font-medium">View All</Link>
              </div>
              <div className="divide-y divide-gray-100">
                {MOCK_STOCKS.map((stock) => {
                  const isPositive = stock.change >= 0;
                  return (
                    <div key={stock.id} className="p-4 hover:bg-gray-50 transition-colors flex justify-between items-center">
                      <div>
                        <div className="font-bold text-gray-900">{stock.ticker}</div>
                        <div className="text-sm text-gray-500">{stock.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">KES {stock.price.toFixed(2)}</div>
                        <div className={`flex items-center justify-end text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                          {isPositive ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                          {isPositive ? '+' : ''}{stock.change.toFixed(2)} ({isPositive ? '+' : ''}{stock.percentChange.toFixed(2)}%)
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Placeholder for Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-64 flex flex-col items-center justify-center text-gray-400">
              <TrendingUp className="h-8 w-8 mb-2 opacity-50" />
              <p>NSE 20 Share Index Chart (Coming Soon)</p>
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
              <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
                <Link href="/news" className="text-sm font-medium text-blue-600 hover:text-blue-800">Read more news</Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
