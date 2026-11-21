"use client";

import React, { useState } from "react";
import {
  Printer,
  Sparkles,
  RefreshCw,
  X,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Receipt,
  CheckCircle2,
  Package,
} from "lucide-react";

export interface ImprovementReportData {
  timestamp: string;
  formattedDate: string;
  formattedTime: string;
  metrics: {
    store: string;
    date: string;
    time: string;
    financials: {
      totalRevenue: number;
      totalProfit: number;
      marginPercentage: number;
      customerCount: number;
      averageOrderValue: number;
      sevenDayAvgDailyRevenue: number;
      revenueTrendPercentVsAvg: number;
    };
    productMovement: {
      fastMoversToday: string[];
      lowStockItems: string[];
      deadStockItems: string[];
      totalTiedUpCapital: number;
    };
    staffing: {
      shiftsToday: number;
      lateArrivals: string[];
    };
  };
  advice: {
    rating: "EXCELLENT" | "SOLID" | "NEEDS ATTENTION" | "CRITICAL";
    headline: string;
    revenueDiagnosis: string;
    fastMoversSummary: string;
    restockAction: string;
    deadStockAction: string;
    sellingRateTips: Array<{
      title: string;
      action: string;
    }>;
  };
}

interface ImprovementReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ImprovementReportData | null;
  isLoading: boolean;
  onRegenerate: () => void;
}

export function ImprovementReceiptModal({
  isOpen,
  onClose,
  data,
  isLoading,
  onRegenerate,
}: ImprovementReceiptModalProps) {
  const [isPrinting, setIsPrinting] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 150);
  };

  const financials = data?.metrics.financials;
  const advice = data?.advice;
  const movement = data?.metrics.productMovement;

  const ratingColor =
    advice?.rating === "EXCELLENT"
      ? "text-emerald-700 dark:text-emerald-400 border-emerald-500/40 bg-emerald-500/10"
      : advice?.rating === "SOLID"
      ? "text-blue-700 dark:text-blue-400 border-blue-500/40 bg-blue-500/10"
      : advice?.rating === "NEEDS ATTENTION"
      ? "text-amber-700 dark:text-amber-400 border-amber-500/40 bg-amber-500/10"
      : "text-rose-700 dark:text-rose-400 border-rose-500/40 bg-rose-500/10";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden text-slate-900 dark:text-zinc-100 transition-colors">
        {/* Modal Toolbar Header (Hidden on Print) */}
        <div className="no-print p-4 sm:px-6 bg-slate-50 dark:bg-zinc-950/80 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Daily Improvement Receipt</span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-mono font-bold">
                  80mm POS Slip
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                AI Business Agent Turnaround & Velocity Tips
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRegenerate}
              disabled={isLoading}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 transition cursor-pointer disabled:opacity-50"
              title="Regenerate Report with fresh data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white transition cursor-pointer"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Receipt Body Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/70 dark:bg-zinc-950/90 flex justify-center custom-scrollbar">
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 animate-pulse">
                <Sparkles className="w-7 h-7 animate-spin" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-800 dark:text-zinc-200 font-mono">
                  Synthesizing Store Movement...
                </p>
                <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-xs">
                  Analyzing today&apos;s product velocities, margins, dead-stock capital, and generating selling tips.
                </p>
              </div>
            </div>
          ) : !data ? (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
              <AlertTriangle className="w-8 h-8 text-amber-500" />
              <p className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
                Failed to load improvement report.
              </p>
              <button
                onClick={onRegenerate}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Retry Generation
              </button>
            </div>
          ) : (
            /* Printable POS Receipt Slip */
            <div
              id="printable-receipt"
              className="w-full max-w-[360px] bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-750 shadow-lg rounded-2xl p-5 sm:p-6 font-mono text-xs text-slate-800 dark:text-zinc-200 space-y-3 transition-colors"
            >
              {/* Receipt Header */}
              <div className="text-center pb-3 border-b-2 border-dashed border-slate-300 dark:border-zinc-700 space-y-1">
                <p className="text-base font-black tracking-widest text-slate-950 dark:text-white uppercase">
                  SMART කඩේ POS
                </p>
                <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 tracking-wide uppercase">
                  Daily Improvement & Velocity Report
                </p>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                  {data.formattedDate} • {data.formattedTime}
                </p>
                <div className="pt-1 flex items-center justify-center gap-1.5 text-[10px]">
                  <span className="text-slate-400 dark:text-zinc-500">Store:</span>
                  <span className="font-semibold text-slate-700 dark:text-zinc-300">Main Retail Branch</span>
                  <span className="text-slate-400 dark:text-zinc-500">|</span>
                  <span className="text-slate-400 dark:text-zinc-500">Advisor:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">Gemini Business AI</span>
                </div>
              </div>

              {/* Status / Rating Badge */}
              <div className="py-2 border-b border-dashed border-slate-300 dark:border-zinc-700 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-500 dark:text-zinc-400 uppercase text-[11px]">
                  Store Rating:
                </span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-extrabold border ${ratingColor}`}>
                  {advice?.rating || "SOLID"}
                </span>
              </div>

              {/* Executive Headline */}
              {advice?.headline && (
                <div className="py-2 bg-slate-50 dark:bg-zinc-950/70 p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 text-[11px] leading-relaxed text-slate-700 dark:text-zinc-300">
                  <span className="font-bold text-slate-900 dark:text-white uppercase text-[10px] block mb-0.5">
                    Executive Summary:
                  </span>
                  {advice.headline}
                </div>
              )}

              {/* Financial Metrics Table */}
              <div className="py-2 border-b border-dashed border-slate-300 dark:border-zinc-700 space-y-1.5 text-[11px]">
                <p className="font-bold text-slate-900 dark:text-zinc-100 uppercase text-[10px] tracking-wider mb-1">
                  --- TODAY&apos;S FINANCIAL FLASH ---
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-zinc-400">Total Revenue:</span>
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                    ${financials?.totalRevenue.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-zinc-400">Gross Profit:</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">
                    ${financials?.totalProfit.toFixed(2)} ({financials?.marginPercentage}%)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-zinc-400">Customer Count:</span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">
                    {financials?.customerCount} receipts
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-zinc-400">Avg Basket Size:</span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">
                    ${financials?.averageOrderValue.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-100 dark:border-zinc-800/80 text-[10px]">
                  <span className="text-slate-400 dark:text-zinc-500">7-Day Trend vs Avg:</span>
                  <span
                    className={`font-bold flex items-center gap-0.5 ${
                      (financials?.revenueTrendPercentVsAvg ?? 0) >= 0
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-rose-700 dark:text-rose-400"
                    }`}
                  >
                    {(financials?.revenueTrendPercentVsAvg ?? 0) >= 0 ? (
                      <TrendingUp className="w-3 h-3 inline" />
                    ) : (
                      <TrendingDown className="w-3 h-3 inline" />
                    )}
                    {financials?.revenueTrendPercentVsAvg}%
                  </span>
                </div>
              </div>

              {/* Product Movement Breakdown */}
              <div className="py-2 border-b border-dashed border-slate-300 dark:border-zinc-700 space-y-2 text-[11px]">
                <p className="font-bold text-slate-900 dark:text-zinc-100 uppercase text-[10px] tracking-wider">
                  --- PRODUCT VELOCITY ---
                </p>

                {movement?.fastMoversToday && movement.fastMoversToday.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 block mb-0.5">
                      [FAST MOVERS TODAY]
                    </span>
                    <ul className="space-y-0.5 text-[10px] text-slate-700 dark:text-zinc-300">
                      {movement.fastMoversToday.map((f, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <span className="text-emerald-500">▸</span>
                          <span className="truncate">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {movement?.lowStockItems && movement.lowStockItems.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 block mb-0.5">
                      [RESTOCK ALERT - LOW STOCK]
                    </span>
                    <ul className="space-y-0.5 text-[10px] text-slate-700 dark:text-zinc-300">
                      {movement.lowStockItems.slice(0, 3).map((item, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <span className="text-amber-500">⚠</span>
                          <span className="truncate">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {movement?.deadStockItems && movement.deadStockItems.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 block mb-0.5">
                      [DEAD STOCK - CAPITAL LOCKED: ${movement.totalTiedUpCapital.toFixed(2)}]
                    </span>
                    <p className="text-[10px] text-slate-600 dark:text-zinc-400 leading-tight">
                      {advice?.deadStockAction}
                    </p>
                  </div>
                )}
              </div>

              {/* Actionable Improvement Tips (Heart of the feature) */}
              <div className="py-2 border-b-2 border-dashed border-slate-300 dark:border-zinc-700 space-y-2 text-[11px]">
                <p className="font-bold text-slate-900 dark:text-zinc-100 uppercase text-[10px] tracking-wider">
                  --- ACTION TIPS TO INCREASE SELLING RATE ---
                </p>

                {advice?.sellingRateTips.map((tip, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50/80 dark:bg-zinc-950/60 p-2 rounded-lg border border-slate-200 dark:border-zinc-800 space-y-0.5"
                  >
                    <div className="flex items-center gap-1.5 font-bold text-[11px] text-slate-900 dark:text-white">
                      <span className="px-1.5 py-0.2 rounded bg-emerald-600 text-white text-[9px] font-mono">
                        TIP #{idx + 1}
                      </span>
                      <span className="truncate">{tip.title}</span>
                    </div>
                    <p className="text-[10px] leading-relaxed text-slate-600 dark:text-zinc-300 pl-1">
                      {tip.action}
                    </p>
                  </div>
                ))}
              </div>

              {/* Receipt Footer & Barcode Aesthetic */}
              <div className="pt-2 text-center space-y-1.5">
                <div className="tracking-[0.25em] text-[10px] font-black text-slate-400 dark:text-zinc-600 select-none py-1">
                  ||||| |||| || |||||| | ||||| ||| ||||
                </div>
                <p className="text-[10px] font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-widest">
                  *** SMART කඩේ • SELL SMARTER, GROW FASTER ***
                </p>
                <p className="text-[9px] text-slate-400 dark:text-zinc-500">
                  Automated Diagnostic Slip • Printed from Owner Console
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Footer (Hidden on Print) */}
        <div className="no-print p-4 sm:px-6 bg-slate-50 dark:bg-zinc-950/90 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-100 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-slate-700 dark:text-zinc-300 border border-slate-300 dark:border-zinc-700 transition cursor-pointer shadow-sm"
          >
            Close
          </button>

          <button
            type="button"
            onClick={handlePrint}
            disabled={isLoading || !data || isPrinting}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-700/20 dark:shadow-emerald-950/40 transition active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Printer className="w-4 h-4" />
            <span>Print Improvement Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
}
