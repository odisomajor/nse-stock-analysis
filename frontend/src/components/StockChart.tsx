"use client";
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function StockChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return <div className="h-full w-full flex items-center justify-center text-gray-500">No chart data available</div>;
  }

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            stroke="#9ca3af" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            minTickGap={30}
          />
          <YAxis 
            domain={['auto', 'auto']} 
            stroke="#9ca3af" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            tickFormatter={(value) => value.toFixed(2)} 
          />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            formatter={(value: any) => [`KES ${Number(value).toFixed(2)}`, 'Price']}
            labelStyle={{ color: '#6b7280', marginBottom: '4px' }}
          />
          <Line 
            type="monotone" 
            dataKey="close" 
            stroke="#2563eb" 
            strokeWidth={2} 
            dot={false} 
            activeDot={{ r: 6, strokeWidth: 0, fill: '#2563eb' }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}