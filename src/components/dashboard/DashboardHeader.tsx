"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutDashboard, Store, Clock, ArrowLeft, Sparkles, PackagePlus } from "lucide-react";

interface DashboardHeaderProps {
  onOpenRestock?: () => void;
}

export function DashboardHeader({ onOpenRestock }: DashboardHeaderProps = {}) {
  const [currentTime, setCurrentTime] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
      setCurrentDate(
        now.toLocaleDateString([], {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-zinc-900 border-b border-zinc-800 text-white px-4 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30 shadow-md">
      {/* Brand & Mode */}
      <div className="flex items-center gap-3">
        <div className="bg-emerald-500/20 text-emerald-400 p-2.5 rounded-xl border border-emerald-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.15)]">
          <LayoutDashboard className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-lg tracking-tight text-zinc-100">
              RetailShop Owner Dashboard
            </h1>
            <span className="text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              Executive AI Suite
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Real-time shop analytics, daily AI diagnostic report, & commercial advisory
          </p>
        </div>
      </div>

      {/* Date & Live Clock */}
      <div className="hidden sm:flex items-center gap-2.5 bg-zinc-800/70 border border-zinc-700/60 px-3.5 py-1.5 rounded-lg text-xs font-mono text-zinc-300">
        <Clock className="w-3.5 h-3.5 text-zinc-400" />
        <span>{currentDate}</span>
        <span className="text-zinc-500">|</span>
        <span className="text-emerald-400 font-semibold">{currentTime}</span>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-2.5">
        {onOpenRestock && (
          <button
            onClick={onOpenRestock}
            className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 hover:text-white text-xs font-semibold px-3.5 py-2 rounded-lg border border-zinc-700 hover:border-emerald-500/50 transition-all duration-150 active:scale-95 cursor-pointer shadow-sm"
            title="Restock Product Inventory"
          >
            <PackagePlus className="w-4 h-4 text-emerald-400" />
            <span>Restock Inventory</span>
          </button>
        )}

        <Link
          href="/pos"
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all duration-150 active:scale-95 border border-emerald-400/30 cursor-pointer"
        >
          <Store className="w-4 h-4" />
          <span>Launch POS Terminal</span>
        </Link>
        <Link
          href="/"
          className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-medium px-3 py-2 rounded-lg border border-zinc-700 transition cursor-pointer"
          title="Return to Home Landing"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
      </div>
    </header>
  );
}
