"use client";

import React from "react";
import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className = "", showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme, mounted } = useTheme();

  // Prevent mismatched rendering during initial hydration
  const isDark = mounted ? theme === "dark" : true;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
      title={isDark ? "Switch to Light Theme (Slate/White)" : "Switch to Dark Theme (Zinc/Black)"}
      className={`inline-flex items-center justify-center gap-1.5 p-2 rounded-xl transition-all duration-150 active:scale-95 cursor-pointer border shadow-sm ${
        isDark
          ? "bg-zinc-800 hover:bg-zinc-750 text-amber-400 border-zinc-700 hover:border-zinc-600"
          : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300 hover:border-slate-400"
      } ${className}`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-90 duration-200" />
      ) : (
        <Moon className="w-4 h-4 text-slate-700 animate-in spin-in-90 duration-200" />
      )}
      {showLabel && (
        <span className="text-xs font-semibold select-none">
          {isDark ? "Light" : "Dark"}
        </span>
      )}
    </button>
  );
}
