"use client";

import React from "react";
import { CheckCircle2, Printer, PlusCircle, Receipt, ArrowRight } from "lucide-react";

interface SaleSuccessModalProps {
  isOpen: boolean;
  saleData: {
    id: string;
    total_amount: number;
    cashier_name: string;
    timestamp: string;
    tendered?: number;
    change?: number;
    paymentMethod?: "CASH" | "CARD";
    items: Array<{
      id: string;
      productName: string;
      quantity: number;
      price: number;
    }>;
  } | null;
  onClose: () => void;
  onNewSale: () => void;
}

export function SaleSuccessModal({
  isOpen,
  saleData,
  onClose,
  onNewSale,
}: SaleSuccessModalProps) {
  if (!isOpen || !saleData) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden text-slate-900 dark:text-zinc-100 flex flex-col transition-colors">
        {/* Success Header */}
        <div className="bg-emerald-50 dark:bg-emerald-950/60 border-b border-emerald-200 dark:border-emerald-800/40 p-6 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Sale Completed!</h2>
          <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1 font-medium">
            Transaction recorded & inventory updated in database.
          </p>
        </div>

        {/* Printable Receipt Paper Container */}
        <div className="p-6 bg-slate-50 dark:bg-zinc-950/70 border-y border-slate-200 dark:border-zinc-800/80 font-mono text-xs space-y-3">
          <div className="text-center pb-2 border-b border-dashed border-slate-300 dark:border-zinc-700">
            <p className="font-extrabold text-sm text-slate-900 dark:text-zinc-100 tracking-wider">SMART කඩේ POS</p>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">Transaction ID: {saleData.id.slice(-8).toUpperCase()}</p>
            <p className="text-[10px] text-slate-400 dark:text-zinc-500">
              {new Date(saleData.timestamp).toLocaleString()} • Cashier: {saleData.cashier_name}
            </p>
          </div>

          {/* Items breakdown */}
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {saleData.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-slate-700 dark:text-zinc-300 text-[11px]">
                <div className="truncate max-w-[220px]">
                  <span>{item.quantity}x </span>
                  <span className="font-medium">{item.productName}</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">
                  ${(item.quantity * item.price).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Financial summary */}
          <div className="pt-2 border-t border-dashed border-slate-300 dark:border-zinc-700 space-y-1 text-xs">
            <div className="flex justify-between text-slate-700 dark:text-zinc-300 font-semibold">
              <span>Total Amount:</span>
              <span className="font-extrabold text-emerald-700 dark:text-emerald-400 text-sm">
                ${saleData.total_amount.toFixed(2)}
              </span>
            </div>

            {saleData.paymentMethod === "CASH" && saleData.tendered !== undefined && (
              <>
                <div className="flex justify-between text-slate-500 dark:text-zinc-400 text-[11px]">
                  <span>Cash Tendered:</span>
                  <span>${saleData.tendered.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-amber-700 dark:text-amber-300 text-[11px] font-bold">
                  <span>Change Due:</span>
                  <span>${(saleData.change || 0).toFixed(2)}</span>
                </div>
              </>
            )}

            {saleData.paymentMethod === "CARD" && (
              <div className="flex justify-between text-slate-500 dark:text-zinc-400 text-[11px]">
                <span>Payment Method:</span>
                <span>Electronic Card / Contactless</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-slate-50 dark:bg-zinc-900 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 border border-slate-300 dark:border-zinc-700 transition cursor-pointer shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>

          <button
            type="button"
            onClick={onNewSale}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition cursor-pointer"
          >
            <span>Next Customer</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
