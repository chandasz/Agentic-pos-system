"use client";

import React from "react";
import {
  FileText,
  Calendar,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Activity,
  ShieldAlert,
  Users2,
  Lightbulb,
  Printer,
  Receipt,
} from "lucide-react";

export interface ReportItem {
  id: string;
  date: string | Date;
  createdAt?: string | Date;
}

export interface FullReport {
  id: string;
  date: string | Date;
  summary_json: string;
  markdown_report: string;
  createdAt?: string | Date;
}

interface DailyReportViewProps {
  reportsList: ReportItem[];
  currentReport: FullReport | null;
  selectedReportId: string;
  onSelectReport: (id: string) => void;
  onGenerateReport: () => void;
  isGenerating: boolean;
  isLoadingReport: boolean;
  onOpenImprovementReport?: () => void;
}

export function DailyReportView({
  reportsList,
  currentReport,
  selectedReportId,
  onSelectReport,
  onGenerateReport,
  isGenerating,
  isLoadingReport,
  onOpenImprovementReport,
}: DailyReportViewProps) {
  // Format the report's date
  const formattedDate = currentReport?.date
    ? new Date(currentReport.date).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <div className="bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 lg:p-6 shadow-md dark:shadow-xl flex flex-col h-full transition-colors">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <FileText className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
              Daily AI Advisory Report
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Automated executive intelligence and turnaround advisory
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {onOpenImprovementReport && (
            <button
              onClick={onOpenImprovementReport}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-slate-800 dark:text-zinc-200 border border-slate-300 dark:border-zinc-700 hover:border-emerald-500/50 rounded-xl text-xs font-bold shadow-sm transition active:scale-95 cursor-pointer"
              title="Print POS-Style Improvement Slip"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Print Improvement Slip</span>
            </button>
          )}

          <button
            onClick={onGenerateReport}
            disabled={isGenerating}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-700/20 dark:shadow-emerald-950/40 hover:shadow-emerald-800/30 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
            <span>{isGenerating ? "Analyzing Store Data..." : "Generate Full Advisory"}</span>
          </button>
        </div>
      </div>

      {/* Selector & Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-3 px-4 bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800/80 rounded-2xl my-4 text-xs">
        <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-400 font-medium">
          <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-400" />
          <span>View Report For:</span>
          <select
            value={selectedReportId}
            onChange={(e) => onSelectReport(e.target.value)}
            disabled={isLoadingReport || isGenerating || reportsList.length === 0}
            className="bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-slate-800 dark:text-zinc-100 rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer disabled:opacity-50 shadow-sm"
          >
            {reportsList.length === 0 ? (
              <option value="">No past reports found</option>
            ) : (
              reportsList.map((r, idx) => {
                const d = new Date(r.date).toISOString().split("T")[0];
                return (
                  <option key={r.id} value={r.id}>
                    {d} {idx === 0 ? "(Latest)" : ""}
                  </option>
                );
              })
            )}
          </select>
        </div>

        {formattedDate && (
          <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold">
            <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>{formattedDate}</span>
          </div>
        )}
      </div>

      {/* Report Content Body */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-4 max-h-[620px] custom-scrollbar">
        {isLoadingReport ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
            <RefreshCw className="w-7 h-7 text-emerald-600 dark:text-emerald-400 animate-spin" />
            <p className="text-xs text-slate-500 dark:text-zinc-400">Loading requested report...</p>
          </div>
        ) : isGenerating ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 animate-pulse">
                <Sparkles className="w-6 h-6" />
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                Gemini is analyzing your store...
              </p>
              <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1 max-w-xs">
                Scanning sales margins, calculating dead-stock capital, and reviewing clock-in punctuality.
              </p>
            </div>
          </div>
        ) : !currentReport ? (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 bg-slate-50 dark:bg-zinc-950/40 border border-dashed border-slate-300 dark:border-zinc-800 rounded-2xl p-8">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-400 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="max-w-sm">
              <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200">No Daily Report Available</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1">
                There is no AI advisory report generated yet for today. Click the button above to synthesize sales, inventory, and attendance data.
              </p>
            </div>
            <button
              onClick={onGenerateReport}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow transition cursor-pointer"
            >
              Generate First Report
            </button>
          </div>
        ) : (
          <FormattedReportContent markdown={currentReport.markdown_report} />
        )}
      </div>
    </div>
  );
}

/**
 * Formats markdown reports cleanly with customized cards for the 4 core sections
 */
function FormattedReportContent({ markdown }: { markdown: string }) {
  if (!markdown) {
    return <p className="text-xs text-zinc-500 italic">Report content is empty.</p>;
  }

  // Split markdown into main sections based on `# 1)`, `# 2)`, etc. or `# `
  const sections = splitReportSections(markdown);

  if (sections.length === 0) {
    return (
      <div className="bg-zinc-950/60 border border-zinc-800 rounded-2xl p-5 text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed font-sans">
        {markdown}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sections.map((sec, idx) => {
        const Icon = getSectionIcon(sec.title);
        const colorClass = getSectionColor(idx);

        return (
          <div
            key={idx}
            className={`border rounded-2xl p-4.5 bg-slate-50/80 dark:bg-zinc-950/70 shadow-sm transition hover:border-slate-300 dark:hover:border-zinc-700 ${colorClass.border}`}
          >
            <div className="flex items-center gap-2.5 mb-3 pb-2.5 border-b border-slate-200 dark:border-zinc-800/80">
              <div className={`p-1.5 rounded-lg border ${colorClass.badge}`}>
                <Icon className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
                {sec.title}
              </h3>
            </div>
            <div className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed space-y-2">
              {sec.content.split("\n\n").map((para, pIdx) => {
                if (para.startsWith("- ") || para.startsWith("* ")) {
                  const bulletItems = para.split("\n").filter((l) => l.trim().length > 0);
                  return (
                    <ul key={pIdx} className="space-y-1.5 my-2 pl-2">
                      {bulletItems.map((item, bIdx) => (
                        <li key={bIdx} className="flex items-start gap-2 text-slate-700 dark:text-zinc-300">
                          <span className={`inline-block w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${colorClass.dot}`} />
                          <span>{renderFormattedText(item.replace(/^[-*]\s*/, ""))}</span>
                        </li>
                      ))}
                    </ul>
                  );
                }
                return <p key={pIdx}>{renderFormattedText(para)}</p>;
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function renderFormattedText(text: string) {
  // Bold pattern replacement: **bold**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="text-slate-900 dark:text-white font-bold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

function splitReportSections(md: string): Array<{ title: string; content: string }> {
  const lines = md.split("\n");
  const sections: Array<{ title: string; content: string }> = [];
  let currentTitle = "";
  let currentContent: string[] = [];

  for (const line of lines) {
    if (line.startsWith("# ") || line.startsWith("## ")) {
      if (currentTitle || currentContent.length > 0) {
        sections.push({
          title: currentTitle || "Overview",
          content: currentContent.join("\n").trim(),
        });
        currentContent = [];
      }
      currentTitle = line.replace(/^#+\s*/, "").trim();
    } else {
      currentContent.push(line);
    }
  }

  if (currentTitle || currentContent.length > 0) {
    sections.push({
      title: currentTitle || "Summary",
      content: currentContent.join("\n").trim(),
    });
  }

  return sections;
}

function getSectionIcon(title: string) {
  const lower = title.toLowerCase();
  if (lower.includes("health") || lower.includes("summary")) return Activity;
  if (lower.includes("inventory") || lower.includes("warning") || lower.includes("cash"))
    return ShieldAlert;
  if (lower.includes("staff") || lower.includes("performance") || lower.includes("attendance"))
    return Users2;
  return Lightbulb;
}

function getSectionColor(idx: number) {
  switch (idx % 4) {
    case 0:
      return {
        border: "border-emerald-500/20",
        badge: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
        dot: "bg-emerald-400",
      };
    case 1:
      return {
        border: "border-amber-500/20",
        badge: "bg-amber-500/10 border-amber-500/30 text-amber-400",
        dot: "bg-amber-400",
      };
    case 2:
      return {
        border: "border-blue-500/20",
        badge: "bg-blue-500/10 border-blue-500/30 text-blue-400",
        dot: "bg-blue-400",
      };
    default:
      return {
        border: "border-teal-500/20",
        badge: "bg-teal-500/10 border-teal-500/30 text-teal-400",
        dot: "bg-teal-400",
      };
  }
}
