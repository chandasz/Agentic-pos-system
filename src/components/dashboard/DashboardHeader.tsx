"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Store, Clock, ArrowLeft, Sparkles, PackagePlus } from "lucide-react";
import { ThemeToggle } from "@/components/common/ThemeToggle";

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
    <header className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white px-4 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30 shadow-sm dark:shadow-md transition-colors duration-200">
      {/* Brand Logo & Mode */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2.5 group cursor-pointer" title="Back to Home">
          <div className="relative w-9 h-9 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 p-1 shadow-sm flex items-center justify-center shrink-0">
            <Image
              src="/logo.png"
              alt="Smart කඩේ Logo"
              width={32}
              height={32}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Smart කඩේ Owner Dashboard
              </h1>
              <span className="text-[10px] sm:text-[11px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                Executive AI Suite
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              Real-time shop analytics, daily AI diagnostic report, & commercial advisory
            </p>
          </div>
        </Link>
      </div>

      {/* Date & Live Clock */}
      <div className="hidden sm:flex items-center gap-2.5 bg-slate-100 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700/60 px-3.5 py-1.5 rounded-lg text-xs font-mono text-slate-700 dark:text-zinc-300">
        <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-400" />
        <span>{currentDate}</span>
        <span className="text-slate-300 dark:text-zinc-600">|</span>
        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{currentTime}</span>
      </div>

      {/* Navigation Buttons & Theme Toggle */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {onOpenRestock && (
          <button
            onClick={onOpenRestock}
            className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-750 text-slate-700 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 hover:border-emerald-500/50 transition-all duration-150 active:scale-95 cursor-pointer shadow-sm"
            title="Restock Product Inventory"
          >
            <PackagePlus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Restock</span>
          </button>
        )}

        <Link
          href="/pos"
          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg shadow-sm hover:shadow transition-all duration-150 active:scale-95 border border-emerald-400/30 cursor-pointer"
        >
          <Store className="w-3.5 h-3.5" />
          <span>Launch POS</span>
        </Link>

        {/* Theme Toggle Button */}
        <ThemeToggle />

        <Link
          href="/"
          className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 transition cursor-pointer"
          title="Return to Home Landing"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Home</span>
        </Link>
      </div>
    </header>
  );
}
