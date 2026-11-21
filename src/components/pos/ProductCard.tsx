"use client";

import React from "react";
import { Plus, Check, AlertTriangle, PackageX, ShoppingBag } from "lucide-react";

export interface Product {
  id: string;
  name: string;
  sku: string;
  cost_price: number;
  selling_price: number;
  stock_qty: number;
  reorder_level: number;
}

interface ProductCardProps {
  product: Product;
  cartQuantity: number;
  onAddToCart: (product: Product) => void;
}

export function ProductCard({
  product,
  cartQuantity,
  onAddToCart,
}: ProductCardProps) {
  const isOutOfStock = product.stock_qty <= 0;
  const isMaxInCart = cartQuantity >= product.stock_qty;
  const isLowStock =
    !isOutOfStock && product.stock_qty <= product.reorder_level;

  const handleClick = () => {
    if (!isOutOfStock && !isMaxInCart) {
      onAddToCart(product);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative flex flex-col justify-between p-4 rounded-xl border transition-all duration-150 select-none ${
        isOutOfStock
          ? "bg-slate-100/70 dark:bg-zinc-900/40 border-slate-200 dark:border-zinc-800/60 opacity-60 cursor-not-allowed"
          : isMaxInCart
          ? "bg-slate-100/90 dark:bg-zinc-900/90 border-slate-300 dark:border-zinc-700/80 cursor-not-allowed"
          : "bg-white dark:bg-zinc-900/90 hover:bg-slate-50 dark:hover:bg-zinc-800/90 border-slate-200/90 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 shadow-sm hover:shadow-md cursor-pointer active:scale-[0.98]"
      }`}
    >
      {/* Top Badges */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="font-mono text-[10px] text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded border border-slate-200 dark:border-zinc-700/50">
          {product.sku}
        </span>

        {/* Stock Badge */}
        {isOutOfStock ? (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
            <PackageX className="w-3 h-3" />
            Out of Stock
          </span>
        ) : isLowStock ? (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
            <AlertTriangle className="w-3 h-3" />
            {product.stock_qty} left (Low)
          </span>
        ) : (
          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            {product.stock_qty} in stock
          </span>
        )}
      </div>

      {/* Product Name */}
      <div className="my-2">
        <h3 className="font-bold text-sm text-slate-800 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
          {product.name}
        </h3>
      </div>

      {/* Price & Action Row */}
      <div className="mt-2 pt-2 border-t border-slate-200/80 dark:border-zinc-800/60 flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-400 dark:text-zinc-400 mr-1">$</span>
          <span className="text-lg font-bold text-slate-900 dark:text-white font-mono">
            {product.selling_price.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {cartQuantity > 0 && (
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                isMaxInCart
                  ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                  : "bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30"
              }`}
              title={`${cartQuantity} in cart`}
            >
              <ShoppingBag className="w-3 h-3" />
              {cartQuantity}
            </span>
          )}

          <button
            type="button"
            disabled={isOutOfStock || isMaxInCart}
            aria-label={`Add ${product.name} to cart`}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
              isOutOfStock || isMaxInCart
                ? "bg-slate-200 dark:bg-zinc-800 text-slate-400 dark:text-zinc-600 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow group-hover:scale-105 active:scale-95"
            }`}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
