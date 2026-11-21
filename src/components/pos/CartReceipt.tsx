"use client";

import React, { useState } from "react";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  CheckCircle2,
  DollarSign,
  CreditCard,
  Banknote,
  Receipt,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Product } from "./ProductCard";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartReceiptProps {
  items: CartItem[];
  activeCashier: string;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onCompleteSale: (paymentDetails: {
    method: "CASH" | "CARD";
    tendered: number;
    change: number;
  }) => Promise<void>;
  processingSale: boolean;
}

export function CartReceipt({
  items,
  activeCashier,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCompleteSale,
  processingSale,
}: CartReceiptProps) {
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CARD">("CASH");
  const [cashTendered, setCashTendered] = useState<string>("");

  // Subtotal & Grand Total
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.selling_price * item.quantity,
    0
  );
  const total = Math.round(subtotal * 100) / 100;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const tenderedAmount = parseFloat(cashTendered) || 0;
  const changeDue = Math.max(0, tenderedAmount - total);
  const isTenderSufficient =
    paymentMethod === "CARD" || tenderedAmount >= total;

  const handleQuickTender = (amount: number) => {
    setCashTendered(amount.toFixed(2));
  };

  const handleExactTender = () => {
    setCashTendered(total.toFixed(2));
  };

  const handleCompleteSaleClick = async () => {
    if (items.length === 0 || processingSale) return;
    await onCompleteSale({
      method: paymentMethod,
      tendered: paymentMethod === "CARD" ? total : tenderedAmount,
      change: paymentMethod === "CARD" ? 0 : changeDue,
    });
    setCashTendered("");
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900 border-l border-zinc-800 text-zinc-100 overflow-hidden shadow-2xl">
      {/* Cart Header */}
      <div className="p-4 border-b border-zinc-800 bg-zinc-950/70 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Receipt className="w-5 h-5 text-emerald-400" />
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide uppercase">
              Current Receipt
            </h2>
            <p className="text-[11px] text-zinc-400">
              Cashier: <span className="text-zinc-200 font-medium">{activeCashier}</span>
            </p>
          </div>
        </div>

        {items.length > 0 && (
          <button
            onClick={onClearCart}
            disabled={processingSale}
            className="text-xs text-zinc-400 hover:text-rose-400 flex items-center gap-1 transition px-2 py-1 rounded hover:bg-zinc-800 cursor-pointer"
            title="Clear all cart items"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Cart Line Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500">
            <div className="w-16 h-16 rounded-full bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center mb-3 text-zinc-400">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <p className="text-sm font-semibold text-zinc-300">Cart is empty</p>
            <p className="text-xs text-zinc-500 max-w-xs mt-1">
              Select products from the catalog on the left to build the customer receipt.
            </p>
          </div>
        ) : (
          items.map(({ product, quantity }) => {
            const lineTotal = product.selling_price * quantity;
            const isAtMaxStock = quantity >= product.stock_qty;

            return (
              <div
                key={product.id}
                className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3 flex flex-col gap-2 hover:border-zinc-700 transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-zinc-100 truncate">
                      {product.name}
                    </h4>
                    <p className="text-[11px] text-zinc-400 font-mono">
                      ${product.selling_price.toFixed(2)} each
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-400 font-mono">
                      ${lineTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Quantity Controls & Remove */}
                <div className="flex items-center justify-between pt-1 border-t border-zinc-800/50">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-zinc-800 rounded-lg border border-zinc-700/70 p-0.5">
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(product.id, -1)}
                        disabled={processingSale}
                        className="w-6 h-6 rounded flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-700 active:scale-90 transition cursor-pointer"
                        title="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold font-mono text-white">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(product.id, 1)}
                        disabled={isAtMaxStock || processingSale}
                        className={`w-6 h-6 rounded flex items-center justify-center transition ${
                          isAtMaxStock
                            ? "text-zinc-600 cursor-not-allowed"
                            : "text-zinc-300 hover:text-white hover:bg-zinc-700 active:scale-90 cursor-pointer"
                        }`}
                        title={
                          isAtMaxStock
                            ? `Maximum available stock reached (${product.stock_qty})`
                            : "Increase quantity"
                        }
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {isAtMaxStock && (
                      <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                        Max Stock ({product.stock_qty})
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveItem(product.id)}
                    disabled={processingSale}
                    className="text-zinc-500 hover:text-rose-400 p-1 rounded transition cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Cart Summary & Payment Panel */}
      {items.length > 0 && (
        <div className="border-t border-zinc-800 bg-zinc-950 p-4 space-y-3">
          {/* Payment Method Selector */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPaymentMethod("CASH")}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                paymentMethod === "CASH"
                  ? "bg-emerald-600/20 text-emerald-400 border-emerald-500/40"
                  : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-850"
              }`}
            >
              <Banknote className="w-3.5 h-3.5" />
              <span>Cash</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("CARD")}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                paymentMethod === "CARD"
                  ? "bg-emerald-600/20 text-emerald-400 border-emerald-500/40"
                  : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-850"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Card / Digital</span>
            </button>
          </div>

          {/* Cash Tendered Calculator (if Cash selected) */}
          {paymentMethod === "CASH" && (
            <div className="space-y-2 bg-zinc-900/80 p-3 rounded-xl border border-zinc-800">
              <div className="flex items-center justify-between">
                <label className="text-[11px] text-zinc-400 font-medium">
                  Amount Tendered ($)
                </label>
                {tenderedAmount > 0 && (
                  <span className="text-[11px] font-mono font-medium text-emerald-400">
                    Change: ${changeDue.toFixed(2)}
                  </span>
                )}
              </div>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-400">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={cashTendered}
                  onChange={(e) => setCashTendered(e.target.value)}
                  placeholder={total.toFixed(2)}
                  className="w-full bg-zinc-950 border border-zinc-700 text-zinc-100 placeholder-zinc-600 rounded-lg pl-7 pr-3 py-1.5 text-sm font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Quick Cash Buttons */}
              <div className="flex items-center gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={handleExactTender}
                  className="flex-1 text-[11px] font-mono py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition cursor-pointer"
                >
                  Exact (${total.toFixed(2)})
                </button>
                {[20, 50, 100].map((amt) => {
                  if (amt < total && total > 50) return null;
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleQuickTender(amt)}
                      className="px-2 py-1 text-[11px] font-mono rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition cursor-pointer"
                    >
                      ${amt}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Subtotal & Total Line */}
          <div className="pt-2 border-t border-zinc-800/80 space-y-1.5 text-xs">
            <div className="flex justify-between text-zinc-400">
              <span>Items Total ({itemCount} units)</span>
              <span className="font-mono">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-baseline pt-1">
              <span className="text-sm font-bold text-white uppercase tracking-wider">
                Total Due
              </span>
              <span className="text-xl font-extrabold text-emerald-400 font-mono">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Complete Sale Button */}
          <button
            type="button"
            onClick={handleCompleteSaleClick}
            disabled={processingSale || !isTenderSufficient}
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all duration-150 cursor-pointer ${
              processingSale || !isTenderSufficient
                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50"
                : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white active:scale-[0.98] shadow-emerald-950/50 border border-emerald-400/30"
            }`}
          >
            {processingSale ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing Sale & Deducting Stock...</span>
              </>
            ) : !isTenderSufficient ? (
              <span>Enter Tender (${total.toFixed(2)} minimum)</span>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Complete Sale (${total.toFixed(2)})</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
