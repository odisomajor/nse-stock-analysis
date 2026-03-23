"use client";
import React, { memo } from 'react';
import { AdvancedRealTimeChart } from "react-ts-tradingview-widgets";

// We use React.memo to prevent unnecessary re-renders of the widget
const TradingViewWidget = memo(({ symbol }: { symbol: string }) => {
  // TradingView uses "KE" as the prefix for Nairobi Securities Exchange.
  // For example, Safaricom is "KE:SCOM" on TradingView.
  // We need to strip out the "NSE" prefix if it exists in our database, or handle special cases.
  
  let tvSymbol = '';
  
  if (symbol === 'NSE') {
    // The Nairobi Securities Exchange itself
    tvSymbol = 'KE:NSE';
  } else {
    // Other stocks (e.g., BAMB becomes KE:BAMB)
    tvSymbol = `KE:${symbol}`;
  }

  return (
    <AdvancedRealTimeChart
      symbol={tvSymbol}
      theme="light"
      autosize
      hide_top_toolbar={false}
      hide_legend={false}
      save_image={false}
      allow_symbol_change={false}
      details={true}
      calendar={false}
      show_popup_button={true}
      popup_width="1000"
      popup_height="650"
    />
  );
});

TradingViewWidget.displayName = 'TradingViewWidget';

export default TradingViewWidget;