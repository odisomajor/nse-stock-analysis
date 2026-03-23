"use client";
import React, { memo } from 'react';
import { AdvancedRealTimeChart } from "react-ts-tradingview-widgets";

// We use React.memo to prevent unnecessary re-renders of the widget
const TradingViewWidget = memo(({ symbol }: { symbol: string }) => {
  // Most Kenyan stocks on TradingView are prefixed with NSE: (e.g., NSE:SCOM)
  // We append .KE if needed, or use the raw symbol depending on the exchange format.
  // The standard for TradingView for Nairobi is often just the symbol if the exchange is set.
  const tvSymbol = symbol === 'NSE' ? 'NSE:NSE' : `NSE:${symbol}`;

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