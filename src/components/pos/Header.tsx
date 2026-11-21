"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { UserCheck, Clock, Store, ShieldCheck, User, LayoutDashboard, PackagePlus } from "lucide-react";

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
    <header className="bg-zinc-900 border-b border-zinc-800 text-white px-4 lg:px-6 py-3 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30 shadow-md">
      {/* Brand & Terminal Identifier */}
      <div className="flex items-center gap-3">
        <div className="bg-emerald-600/20 text-emerald-400 p-2 rounded-xl border border-emerald-500/30 flex items-center justify-center">
          <Store className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-lg tracking-tight text-zinc-100">
              RetailShop POS
            </h1>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
              Terminal #01
            </span>
          </div>
          <p className="text-xs text-zinc-400">Cashier Checkout & Inventory Sync</p>
        </div>
      </div>

      {/* Date & Live Clock */}
      <div className="hidden sm:flex items-center gap-2 bg-zinc-800/70 border border-zinc-700/60 px-3.5 py-1.5 rounded-lg text-xs font-mono text-zinc-300">
        <Clock className="w-3.5 h-3.5 text-zinc-400" />
        <span>{currentDate}</span>
        <span className="text-zinc-500">|</span>
        <span className="text-emerald-400 font-semibold">{currentTime}</span>
      </div>

      {/* Actions: Cashier selector & Attendance Button */}
      <div className="flex items-center gap-3">
        {/* Active Cashier Selector */}
        <div className="flex items-center gap-2 bg-zinc-800/80 border border-zinc-700 px-3 py-1.5 rounded-lg">
          <User className="w-4 h-4 text-emerald-400" />
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-400 leading-none">Active Cashier</span>
            <select
              value={activeCashier}
              onChange={(e) => onSelectCashier(e.target.value)}
              className="bg-transparent text-xs font-medium text-zinc-100 focus:outline-none cursor-pointer pr-1"
            >
              {employees.length > 0 ? (
                employees.map((emp) => (
                  <option key={emp.id} value={emp.name} className="bg-zinc-900 text-white">
                    {emp.name} ({emp.role})
                  </option>
                ))
              ) : (
                <option value={activeCashier} className="bg-zinc-900 text-white">
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
            className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 hover:text-white text-xs font-semibold px-3.5 py-2 rounded-lg border border-zinc-700 hover:border-emerald-500/50 transition-all duration-150 active:scale-95 cursor-pointer shadow-sm"
            title="Restock Product Inventory"
          >
            <PackagePlus className="w-4 h-4 text-emerald-400" />
            <span>Restock</span>
          </button>
        )}

        {/* Employee Attendance Button */}
        <button
          onClick={onOpenAttendance}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all duration-150 active:scale-95 cursor-pointer border border-blue-400/30"
          title="Staff Clock In / Clock Out with 4-digit PIN"
        >
          <UserCheck className="w-4 h-4" />
          <span>Employee Attendance</span>
        </button>

        {/* Owner Dashboard Link */}
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-emerald-400 hover:text-emerald-300 text-xs font-semibold px-3.5 py-2 rounded-lg border border-zinc-700 transition-all duration-150 active:scale-95 cursor-pointer"
          title="View Owner Dashboard & AI Business Advisor"
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </Link>
      </div>
    </header>
  );
}
