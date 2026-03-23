import React from 'react';
import Link from 'next/link';
import { PrismaClient } from '@prisma/client';
import { ArrowLeft, ArrowUpRight, ArrowDownRight, TrendingUp, Newspaper, BarChart3, Activity } from 'lucide-react';
import StockChart from '@/components/StockChart';

const prisma = new PrismaClient();

// Disable caching to always show the latest data
export const revalidate = 0;

export default async function CompanyPage({ params }: { params: { symbol: string } }) {
  const { symbol } = params;

  // Fetch all historical data for this symbol to build the chart
  const stockHistory = await prisma.stockData.findMany({
    where: { symbol: symbol.toUpperCase() },
    orderBy: { date: 'asc' },
  });

  if (!stockHistory || stockHistory.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-sm text-center max-w-md">
          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Company Not Found</h2>
          <p className="text-gray-500 mb-6">We couldn't find any trading data for ticker symbol "{symbol}".</p>
          <Link href="/" className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const latestData = stockHistory[stockHistory.length - 1];
  const isPositive = latestData.change >= 0;

  // Format data for the chart
  const chartData = stockHistory.map(d => ({
    date: d.date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
    close: d.close,
    volume: d.volume
  }));

  // Generate some realistic-looking mock news based on the company symbol
  const MOCK_NEWS = [
    { id: 1, title: `${symbol} announces strategic expansion plans across East Africa region`, source: "Business Daily", date: "2 hours ago" },
    { id: 2, title: `Market analysts upgrade ${symbol} to 'Strong Buy' following Q3 performance`, source: "Capital News", date: "1 day ago" },
    { id: 3, title: `${symbol} CEO discusses future outlook and digital transformation initiatives`, source: "The Standard", date: "2 days ago" },
    { id: 4, title: `Foreign investors show increased interest in ${symbol} shares`, source: "Reuters", date: "4 days ago" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              <span className="font-bold text-xl tracking-tight text-blue-900">NSE Analytics</span>
            </Link>
            <div className="hidden sm:flex space-x-8">
              <Link href="/" className="text-gray-500 hover:text-gray-900 px-1 py-5 text-sm font-medium">Dashboard</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button & Header */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Overview
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                {latestData.companyName || symbol}
                <span className="text-sm font-normal px-2 py-1 bg-gray-100 text-gray-600 rounded-md border border-gray-200">
                  {symbol}
                </span>
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Data as of {latestData.date.toLocaleDateString()}
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 min-w-[200px] text-right">
              <div className="text-sm text-gray-500 font-medium mb-1">Current Price</div>
              <div className="text-3xl font-bold text-gray-900">KES {latestData.close.toFixed(2)}</div>
              <div className={`flex items-center justify-end font-medium mt-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? <ArrowUpRight className="h-4 w-4 mr-1" /> : <ArrowDownRight className="h-4 w-4 mr-1" />}
                {isPositive ? '+' : ''}{latestData.change.toFixed(2)} ({isPositive ? '+' : ''}{latestData.pChange.toFixed(2)}%)
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart & Stats Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Chart Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-blue-500" />
                  Price History
                </h2>
              </div>
              <div className="p-6">
                <StockChart data={chartData} />
              </div>
            </div>

            {/* Key Statistics */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="font-semibold text-gray-800">Key Statistics</h2>
              </div>
              <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-6">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Previous Close</div>
                  <div className="font-semibold text-gray-900">KES {latestData.prevClose.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Open</div>
                  <div className="font-semibold text-gray-900">KES {latestData.open.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Day's High</div>
                  <div className="font-semibold text-gray-900">KES {latestData.high.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Day's Low</div>
                  <div className="font-semibold text-gray-900">KES {latestData.low.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Volume</div>
                  <div className="font-semibold text-gray-900">{latestData.volume.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">VWAP</div>
                  <div className="font-semibold text-gray-900">KES {latestData.vwap.toFixed(2)}</div>
                </div>
              </div>
            </div>

          </div>

          {/* News Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Newspaper className="h-4 w-4 text-blue-500" />
                  Company News
                </h2>
              </div>
              <div className="divide-y divide-gray-100 p-4 space-y-4">
                {MOCK_NEWS.map((news) => (
                  <div key={news.id} className="pt-4 first:pt-0 group cursor-pointer">
                    <h3 className="font-medium text-gray-900 group-hover:text-blue-600 line-clamp-3 leading-snug">{news.title}</h3>
                    <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                      <span>{news.source}</span>
                      <span>{news.date}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-gray-100 bg-gray-50 text-center">
                <button className="text-sm text-blue-600 font-medium hover:text-blue-800">
                  Load more news
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}