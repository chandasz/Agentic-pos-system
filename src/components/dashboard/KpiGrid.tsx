"use client";

import React from "react";
import { DollarSign, TrendingUp, Users, AlertTriangle } from "lucide-react";

export interface KpiData {
  todaySales: number;
  todayNetProfit: number;
  customerCount: number;
  lowStockCount: number;
  lowStockItems?: Array<{
    id: string;
    name: string;
    sku: string;
    stock_qty: number;
    reorder_level: number;
    selling_price: number;
  }>;
}

interface KpiGridProps {
  data: KpiData | null;
  loading: boolean;
}

export function KpiGrid({ data, loading }: KpiGridProps) {
  const marginPercentage =
    data && data.todaySales > 0
      ? Number(((data.todayNetProfit / data.todaySales) * 100).toFixed(1))
      : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Today's Sales */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-zinc-700 transition">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/10 transition" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-zinc-400">Today&apos;s Sales</span>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
          {loading ? (
            <div className="h-8 w-24 bg-zinc-800 animate-pulse rounded" />
          ) : (
            `$${(data?.todaySales ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          )}
        </div>
        <p className="text-[11px] text-zinc-500 mt-2 flex items-center gap-1">
          Gross revenue from today&apos;s register sales
        </p>
      </div>

      {/* 2. Today's Net Profit */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-zinc-700 transition">
        <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-teal-500/10 transition" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-zinc-400">Today&apos;s Net Profit</span>
          <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl lg:text-3xl font-extrabold text-teal-400 tracking-tight">
          {loading ? (
            <div className="h-8 w-24 bg-zinc-800 animate-pulse rounded" />
          ) : (
            `$${(data?.todayNetProfit ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          )}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[11px] bg-teal-500/10 border border-teal-500/20 text-teal-300 px-1.5 py-0.5 rounded font-mono font-medium">
            {marginPercentage}% margin
          </span>
          <span className="text-[11px] text-zinc-500">Revenue minus item costs</span>
        </div>
      </div>

      {/* 3. Customer Count */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-zinc-700 transition">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-500/10 transition" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-zinc-400">Customer Count</span>
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
          {loading ? (
            <div className="h-8 w-16 bg-zinc-800 animate-pulse rounded" />
          ) : (
            data?.customerCount ?? 0
          )}
        </div>
        <p className="text-[11px] text-zinc-500 mt-2">
          {data && data.customerCount > 0
            ? `Avg. ticket: $${(data.todaySales / data.customerCount).toFixed(2)}`
            : "No register transactions today"}
        </p>
      </div>

      {/* 4. Low Stock Alerts */}
      <div className={`bg-zinc-900/90 border rounded-2xl p-5 shadow-lg relative overflow-hidden group transition ${
        (data?.lowStockCount ?? 0) > 0 ? "border-amber-500/40 bg-amber-950/10" : "border-zinc-800 hover:border-zinc-700"
      }`}>
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/10 transition" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-zinc-400">Low Stock Alerts</span>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
            (data?.lowStockCount ?? 0) > 0
              ? "bg-amber-500/20 border-amber-500/30 text-amber-400 animate-pulse"
              : "bg-zinc-800 border-zinc-700 text-zinc-400"
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className={`text-2xl lg:text-3xl font-extrabold tracking-tight ${
            (data?.lowStockCount ?? 0) > 0 ? "text-amber-400" : "text-white"
          }`}>
            {loading ? (
              <span className="inline-block h-8 w-14 bg-zinc-800 animate-pulse rounded" />
            ) : (
              data?.lowStockCount ?? 0
            )}
          </span>
          <span className="text-xs text-zinc-400">items below reorder level</span>
        </div>
        <p className={`text-[11px] mt-2 ${
          (data?.lowStockCount ?? 0) > 0 ? "text-amber-400/90 font-medium" : "text-zinc-500"
        }`}>
          {(data?.lowStockCount ?? 0) > 0
            ? "Urgent restock needed to prevent stockouts"
            : "All inventory levels are healthy"}
        </p>
      </div>
    </div>
  );
}
