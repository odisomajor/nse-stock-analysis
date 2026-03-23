"use client";
import React, { memo } from 'react';
import { AdvancedRealTimeChart } from "react-ts-tradingview-widgets";

// We use React.memo to prevent unnecessary re-renders of the widget
const TradingViewWidget = memo(({ symbol }: { symbol: string }) => {
  // It seems TradingView does not have direct coverage for all Nairobi Securities Exchange stocks
  // using standard prefixes. As a reliable fallback, we will use a global market index 
  // or default to a major African index so the widget always loads gracefully.
  // We'll use a placeholder like "INDEX:NSE20" if they support it, or just default to a standard 
  // emerging markets ETF to ensure the widget never breaks while showing Kenyan stock data outside the widget.
  
  // Actually, many users on TradingView use "BAMB" without a prefix, or it's simply not supported.
  // Let's create a custom TradingView search string, or fallback to an empty chart that doesn't show an error.
  
  // For the Nairobi Securities Exchange, TradingView data is notoriously sparse.
  // Let's use the exact symbol without a prefix first, as sometimes TV auto-resolves it.
  // If we want to prevent the ugly error, we can use a known good emerging market symbol as a placeholder
  // while keeping the title showing the actual stock.
  
  const tvSymbol = symbol; // Trying raw symbol

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