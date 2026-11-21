"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { Search, X, Filter, AlertCircle, Sparkles } from "lucide-react";
import { Product, ProductCard } from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  cartQuantities: Record<string, number>;
  onAddToCart: (product: Product) => void;
  loading: boolean;
}

export function ProductGrid({
  products,
  cartQuantities,
  onAddToCart,
  loading,
}: ProductGridProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterType, setFilterType] = useState<"all" | "in_stock" | "low_stock">("all");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut '/' to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filter and search logic
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        query === "" ||
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      if (filterType === "in_stock") {
        return product.stock_qty > 0;
      }
      if (filterType === "low_stock") {
        return product.stock_qty > 0 && product.stock_qty <= product.reorder_level;
      }
      return true;
    });
  }, [products, searchQuery, filterType]);

  return (
    <div className="flex flex-col h-full bg-zinc-950 p-4 lg:p-6 overflow-hidden">
      {/* Search Bar & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by name or SKU... (Press '/' to search)"
            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-500 rounded-xl pl-10 pr-9 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-0.5 rounded cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 p-1 rounded-xl shrink-0">
          <button
            type="button"
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              filterType === "all"
                ? "bg-zinc-800 text-white shadow"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            All Items ({products.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("in_stock")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              filterType === "in_stock"
                ? "bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 shadow"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            In Stock
          </button>
          <button
            type="button"
            onClick={() => setFilterType("low_stock")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              filterType === "low_stock"
                ? "bg-amber-600/30 text-amber-400 border border-amber-500/30 shadow"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Low Stock
          </button>
        </div>
      </div>

      {/* Grid Container */}
      <div className="flex-1 overflow-y-auto pr-1">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center text-zinc-500">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-sm">Loading inventory catalog...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-zinc-500 border border-dashed border-zinc-800 rounded-2xl p-6 text-center">
            <AlertCircle className="w-8 h-8 text-zinc-600 mb-2" />
            <p className="text-sm font-medium text-zinc-400">No products match your criteria</p>
            <p className="text-xs text-zinc-600 mt-1">
              Try adjusting your search terms or filter selection.
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-3 text-xs text-emerald-400 hover:underline cursor-pointer"
              >
                Clear search query
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pb-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                cartQuantity={cartQuantities[product.id] || 0}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
