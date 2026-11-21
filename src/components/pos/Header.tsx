"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { UserCheck, Clock, User, LayoutDashboard, PackagePlus } from "lucide-react";
import { ThemeToggle } from "@/components/common/ThemeToggle";

interface Employee {
  id: string;
  name: string;
  role: string;
}

interface HeaderProps {
  activeCashier: string;
  employees: Employee[];
  onSelectCashier: (name: string) => void;
  onOpenAttendance: () => void;
  onOpenRestock?: () => void;
}

export function Header({
  activeCashier,
  employees,
  onSelectCashier,
  onOpenAttendance,
  onOpenRestock,
}: HeaderProps) {
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
    <header className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white px-4 lg:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-30 shadow-sm dark:shadow-md transition-colors duration-200">
      {/* Brand Logo & Terminal Identifier */}
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
              <h1 className="font-extrabold text-base tracking-tight text-slate-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Smart කඩේ POS
              </h1>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">
                Terminal #01
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">Checkout & Inventory Sync</p>
          </div>
        </Link>
      </div>

      {/* Date & Live Clock */}
      <div className="hidden sm:flex items-center gap-2 bg-slate-100 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700/60 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-700 dark:text-zinc-300">
        <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-400" />
        <span>{currentDate}</span>
        <span className="text-slate-300 dark:text-zinc-600">|</span>
        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{currentTime}</span>
      </div>

      {/* Actions: Cashier selector, Restock, Attendance, Theme Toggle, Dashboard */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Active Cashier Selector */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 px-2.5 py-1.5 rounded-lg">
          <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[9px] text-slate-500 dark:text-zinc-400 leading-none">Cashier</span>
            <select
              value={activeCashier}
              onChange={(e) => onSelectCashier(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 dark:text-zinc-100 focus:outline-none cursor-pointer pr-1"
            >
              {employees.length > 0 ? (
                employees.map((emp) => (
                  <option key={emp.id} value={emp.name} className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-white">
                    {emp.name} ({emp.role})
                  </option>
                ))
              ) : (
                <option value={activeCashier} className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-white">
                  {activeCashier}
                </option>
              )}
            </select>
          </div>
        </div>

        {/* Inventory Restock Button */}
        {onOpenRestock && (
          <button
            onClick={onOpenRestock}
            className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-750 text-slate-700 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 hover:border-emerald-500/50 transition-all duration-150 active:scale-95 cursor-pointer shadow-sm"
            title="Restock Product Inventory"
          >
            <PackagePlus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden md:inline">Restock</span>
          </button>
        )}

        {/* Employee Attendance Button */}
        <button
          onClick={onOpenAttendance}
          className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm hover:shadow transition-all duration-150 active:scale-95 cursor-pointer border border-blue-400/30"
          title="Staff Clock In / Clock Out with 4-digit PIN"
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Attendance</span>
        </button>

        {/* Theme Toggle Button */}
        <ThemeToggle />

        {/* Owner Dashboard Link */}
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 transition-all duration-150 active:scale-95 cursor-pointer"
          title="View Owner Dashboard & AI Business Advisor"
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Dashboard</span>
        </Link>
      </div>
    </header>
  );
}
