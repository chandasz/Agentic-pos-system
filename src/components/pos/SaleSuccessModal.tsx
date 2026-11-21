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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden text-zinc-100 flex flex-col">
        {/* Success Header */}
        <div className="bg-emerald-950/60 border-b border-emerald-800/40 p-6 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white">Sale Completed!</h2>
          <p className="text-xs text-emerald-300 mt-1">
            Transaction recorded & inventory updated in database.
          </p>
        </div>

        {/* Printable Receipt Paper Container */}
        <div className="p-6 bg-zinc-950/70 border-y border-zinc-800/80 font-mono text-xs space-y-3">
          <div className="text-center pb-2 border-b border-dashed border-zinc-700">
            <p className="font-bold text-sm text-zinc-100">RETAIL SHOP POS</p>
            <p className="text-[11px] text-zinc-400">Transaction ID: {saleData.id.slice(-8).toUpperCase()}</p>
            <p className="text-[10px] text-zinc-500">
              {new Date(saleData.timestamp).toLocaleString()} • Cashier: {saleData.cashier_name}
            </p>
          </div>

          {/* Items breakdown */}
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {saleData.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-zinc-300 text-[11px]">
                <div className="truncate max-w-[220px]">
                  <span>{item.quantity}x </span>
                  <span>{item.productName}</span>
                </div>
                <span className="font-semibold text-white">
                  ${(item.quantity * item.price).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Financial summary */}
          <div className="pt-2 border-t border-dashed border-zinc-700 space-y-1 text-xs">
            <div className="flex justify-between text-zinc-300">
              <span>Total Amount:</span>
              <span className="font-bold text-emerald-400 text-sm">
                ${saleData.total_amount.toFixed(2)}
              </span>
            </div>

            {saleData.paymentMethod === "CASH" && saleData.tendered !== undefined && (
              <>
                <div className="flex justify-between text-zinc-400 text-[11px]">
                  <span>Cash Tendered:</span>
                  <span>${saleData.tendered.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-amber-300 text-[11px] font-bold">
                  <span>Change Due:</span>
                  <span>${(saleData.change || 0).toFixed(2)}</span>
                </div>
              </>
            )}

            {saleData.paymentMethod === "CARD" && (
              <div className="flex justify-between text-zinc-400 text-[11px]">
                <span>Payment Method:</span>
                <span>Electronic Card / Contactless</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-zinc-900 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>

          <button
            type="button"
            onClick={onNewSale}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition cursor-pointer"
          >
            <span>Next Customer</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
