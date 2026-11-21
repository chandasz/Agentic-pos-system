import Image from "next/image";
import Link from "next/link";
import { Store, UserCheck, ShoppingBag, LayoutDashboard, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/common/ThemeToggle";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 p-6 selection:bg-emerald-500 selection:text-white dark:selection:text-black transition-colors duration-200 relative">
      {/* Top Bar with Theme Toggle */}
      <div className="absolute top-5 right-5 sm:top-6 sm:right-8 z-20">
        <ThemeToggle showLabel />
      </div>

      <main className="w-full max-w-xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-3xl p-8 shadow-xl dark:shadow-2xl flex flex-col items-center text-center transition-colors duration-200">
        {/* Brand Logo Container - Crisp on both Light & Dark backgrounds */}
        <div className="relative w-20 h-20 rounded-2xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 p-2.5 shadow-md flex items-center justify-center mb-4 transition-colors">
          <Image
            src="/logo.png"
            alt="Smart කඩේ Logo"
            width={72}
            height={72}
            className="w-full h-full object-contain drop-shadow-sm"
            priority
          />
        </div>

        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Smart කඩේ
          </h1>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            POS & Intelligence
          </span>
        </div>

        <p className="text-sm text-slate-600 dark:text-zinc-400 max-w-md mb-8">
          Smart කඩේ Next-generation Point-of-Sale terminal with live inventory synchronization, database-backed sales, and AI business intelligence dashboard.
        </p>

        {/* Feature Pills */}
        <div className="grid grid-cols-3 gap-3 w-full mb-8 text-left">
          <div className="bg-slate-50 dark:bg-zinc-950/60 border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl p-3.5 transition-colors">
            <ShoppingBag className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mb-1.5" />
            <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-200">Live Inventory</h3>
            <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
              Instant stock deductions & transaction tracking.
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-zinc-950/60 border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl p-3.5 transition-colors">
            <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 mb-1.5" />
            <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-200">Staff Shifts</h3>
            <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
              4-digit PIN clock-in & punctuality monitoring.
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-zinc-950/60 border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl p-3.5 transition-colors">
            <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400 mb-1.5" />
            <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-200">AI Advisor</h3>
            <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
              Daily reports & Gemini turnaround chat.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Link
            href="/pos"
            className="flex-1 py-3.5 px-5 rounded-2xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/20 dark:shadow-emerald-950/60 transition active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Store className="w-4 h-4" />
            <span>Launch POS Terminal</span>
          </Link>
          <Link
            href="/dashboard"
            className="flex-1 py-3.5 px-5 rounded-2xl font-bold text-sm bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-750 border border-slate-300 dark:border-zinc-700 text-slate-800 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 shadow-sm dark:shadow-lg transition active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Owner Dashboard</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
