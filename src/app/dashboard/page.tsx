"use client";

import React, { useEffect, useState, useCallback } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { KpiGrid, KpiData } from "@/components/dashboard/KpiGrid";
import {
  DailyReportView,
  ReportItem,
  FullReport,
} from "@/components/dashboard/DailyReportView";
import { BusinessAdvisorChat } from "@/components/dashboard/BusinessAdvisorChat";
import { RestockModal } from "@/components/common/RestockModal";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function DashboardPage() {
  const [kpis, setKpis] = useState<KpiData | null>(null);
  const [reportsList, setReportsList] = useState<ReportItem[]>([]);
  const [currentReport, setCurrentReport] = useState<FullReport | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<string>("");

  const [loadingStats, setLoadingStats] = useState<boolean>(true);
  const [loadingReport, setLoadingReport] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState<boolean>(false);
  const [restockSuccessNotice, setRestockSuccessNotice] = useState<string | null>(null);

  // 1. Fetch initial dashboard statistics and reports
  const fetchDashboardStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      setErrorMessage(null);
      const res = await fetch("/api/dashboard/stats");
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load dashboard data");
      }

      setKpis(data.kpis);
      setReportsList(data.reportsList || []);

      if (data.latestReport) {
        setCurrentReport(data.latestReport);
        setSelectedReportId(data.latestReport.id);
      }
    } catch (err: unknown) {
      console.error("Dashboard data load error:", err);
      const msg = err instanceof Error ? err.message : "Error loading dashboard metrics";
      setErrorMessage(msg);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  // 2. Handler to switch report when dropdown changes
  const handleSelectReport = async (reportId: string) => {
    if (!reportId || reportId === selectedReportId) return;

    setSelectedReportId(reportId);
    setLoadingReport(true);

    try {
      const res = await fetch(`/api/dashboard/reports/${reportId}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch report details");
      }

      setCurrentReport(data.report);
    } catch (err: unknown) {
      console.error("Failed to load historical report:", err);
      const msg = err instanceof Error ? err.message : "Error loading selected report";
      setErrorMessage(msg);
    } finally {
      setLoadingReport(false);
    }
  };

  // 3. Handler to generate a new report on-demand
  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/generate-report", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to generate report");
      }

      // Re-fetch dashboard stats to get updated reports list and KPIs
      await fetchDashboardStats();
    } catch (err: unknown) {
      console.error("Generate report error:", err);
      const msg = err instanceof Error ? err.message : "Error generating daily report";
      setErrorMessage(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex flex-col selection:bg-emerald-500 selection:text-white dark:selection:text-black transition-colors duration-200">
      {/* Header */}
      <DashboardHeader onOpenRestock={() => setIsRestockModalOpen(true)} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Restock success notification */}
        {restockSuccessNotice && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 p-4 rounded-2xl flex items-center gap-3 text-xs shadow-sm animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <div className="flex-1">
              <strong className="font-bold">Inventory Restocked:</strong> {restockSuccessNotice}
            </div>
            <button
              onClick={() => setRestockSuccessNotice(null)}
              className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-bold px-2 py-1 rounded cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Error notification banner if any */}
        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400 p-4 rounded-2xl flex items-center gap-3 text-xs shadow-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div className="flex-1">
              <strong className="font-bold">Dashboard Notice:</strong> {errorMessage}
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-red-700 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-bold px-2 py-1 rounded cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Section 1: KPI Cards */}
        <section aria-label="Store KPIs">
          <KpiGrid data={kpis} loading={loadingStats} />
        </section>

        {/* Section 2: Two-column split: Left = Daily AI Report, Right = Advisor Chat */}
        <section
          aria-label="Daily AI Report & Advisor Chat"
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch"
        >
          {/* Left Column: Daily AI Report */}
          <div className="h-full">
            <DailyReportView
              reportsList={reportsList}
              currentReport={currentReport}
              selectedReportId={selectedReportId}
              onSelectReport={handleSelectReport}
              onGenerateReport={handleGenerateReport}
              isGenerating={isGenerating}
              isLoadingReport={loadingReport}
            />
          </div>

          {/* Right Column: Chat with Your Business Advisor */}
          <div className="h-full">
            <BusinessAdvisorChat />
          </div>
        </section>
      </main>

      {/* Restock Inventory Modal */}
      <RestockModal
        isOpen={isRestockModalOpen}
        onClose={() => setIsRestockModalOpen(false)}
        onRestockSuccess={(updatedProd, addedQty) => {
          fetchDashboardStats();
          setRestockSuccessNotice(
            `Added +${addedQty} units to "${updatedProd.name}". New stock: ${updatedProd.stock_qty}.`
          );
        }}
      />
    </div>
  );
}
