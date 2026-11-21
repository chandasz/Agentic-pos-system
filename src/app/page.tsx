import Link from "next/link";
import { Store, UserCheck, ShoppingBag, LayoutDashboard, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-zinc-100 p-6 selection:bg-emerald-500 selection:text-black">
      <main className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center">
        {/* Terminal Badge */}
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-5 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
          <Store className="w-8 h-8" />
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
          RetailShop System
        </h1>
        <p className="text-sm text-zinc-400 max-w-md mb-8">
          Next-generation Point-of-Sale terminal with live inventory synchronization, database-backed sales, and AI business intelligence dashboard.
        </p>

        {/* Feature Pills */}
        <div className="grid grid-cols-3 gap-3 w-full mb-8 text-left">
          <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-3.5">
            <ShoppingBag className="w-4 h-4 text-emerald-400 mb-1.5" />
            <h3 className="text-xs font-bold text-zinc-200">Live Inventory</h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">
              Instant stock deductions & transaction tracking.
            </p>
          </div>
          <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-3.5">
            <UserCheck className="w-4 h-4 text-blue-400 mb-1.5" />
            <h3 className="text-xs font-bold text-zinc-200">Staff Shifts</h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">
              4-digit PIN clock-in & punctuality monitoring.
            </p>
          </div>
          <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-3.5">
            <Sparkles className="w-4 h-4 text-teal-400 mb-1.5" />
            <h3 className="text-xs font-bold text-zinc-200">AI Advisor</h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">
              Daily reports & Gemini 2.5 turnaround chat.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Link
            href="/pos"
            className="flex-1 py-3.5 px-5 rounded-2xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-950/60 transition active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Store className="w-4 h-4" />
            <span>Launch POS Terminal</span>
          </Link>
          <Link
            href="/dashboard"
            className="flex-1 py-3.5 px-5 rounded-2xl font-bold text-sm bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-emerald-400 hover:text-emerald-300 shadow-lg transition active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Owner Dashboard</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
