"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  X,
  PackagePlus,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  TrendingUp,
  Tag,
  DollarSign,
  Boxes,
} from "lucide-react";
import { Product } from "@/components/pos/ProductCard";

export interface RestockModalProps {
  isOpen: boolean;
  onClose: () => void;
  products?: Product[];
  onRestockSuccess?: (updatedProduct: Product, addedQty: number) => void;
}

export function RestockModal({
  isOpen,
  onClose,
  products: initialProducts,
  onRestockSuccess,
}: RestockModalProps) {
  const [internalProducts, setInternalProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(false);

  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [quantityToAdd, setQuantityToAdd] = useState<string>("10");
  const [costPrice, setCostPrice] = useState<string>("");
  const [sellingPrice, setSellingPrice] = useState<string>("");
  const [searchFilter, setSearchFilter] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Use provided products if available, otherwise fetch
  const allProducts = initialProducts && initialProducts.length > 0 ? initialProducts : internalProducts;

  const fetchProducts = useCallback(async () => {
    try {
      setLoadingProducts(true);
      const res = await fetch("/api/pos/products");
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        setInternalProducts(data.products);
      }
    } catch (err) {
      console.error("Error fetching products for restock modal:", err);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  // Fetch products if modal is open and no initial products provided
  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setSuccessMessage(null);
      if (!initialProducts || initialProducts.length === 0) {
        fetchProducts();
      }
    }
  }, [isOpen, initialProducts, fetchProducts]);

  // Selected product object
  const selectedProduct = useMemo(() => {
    return allProducts.find((p) => p.id === selectedProductId) || null;
  }, [allProducts, selectedProductId]);

  // Set default selection when products load or change
  useEffect(() => {
    if (isOpen && allProducts.length > 0 && !selectedProductId) {
      const first = allProducts[0];
      setSelectedProductId(first.id);
      setCostPrice(first.cost_price.toFixed(2));
      setSellingPrice(first.selling_price.toFixed(2));
    }
  }, [isOpen, allProducts, selectedProductId]);

  // Handle product selection change
  const handleProductSelect = (id: string) => {
    setSelectedProductId(id);
    setErrorMessage(null);
    setSuccessMessage(null);
    const prod = allProducts.find((p) => p.id === id);
    if (prod) {
      setCostPrice(prod.cost_price.toFixed(2));
      setSellingPrice(prod.selling_price.toFixed(2));
    }
  };

  // Filtered products for dropdown search
  const filteredProducts = useMemo(() => {
    if (!searchFilter.trim()) return allProducts;
    const q = searchFilter.toLowerCase();
    return allProducts.filter(
      (p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
    );
  }, [allProducts, searchFilter]);

  // Calculations for preview
  const numQtyToAdd = parseInt(quantityToAdd, 10);
  const isValidQty = !isNaN(numQtyToAdd) && numQtyToAdd > 0;
  const projectedStock = selectedProduct && isValidQty ? selectedProduct.stock_qty + numQtyToAdd : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) {
      setErrorMessage("Please select a product to restock.");
      return;
    }

    if (!isValidQty) {
      setErrorMessage("Please enter a valid quantity greater than zero.");
      return;
    }

    const parsedCost = costPrice !== "" ? parseFloat(costPrice) : undefined;
    if (parsedCost !== undefined && (isNaN(parsedCost) || parsedCost < 0)) {
      setErrorMessage("Cost price must be a valid positive number.");
      return;
    }

    const parsedSelling = sellingPrice !== "" ? parseFloat(sellingPrice) : undefined;
    if (parsedSelling !== undefined && (isNaN(parsedSelling) || parsedSelling < 0)) {
      setErrorMessage("Selling price must be a valid positive number.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/inventory/restock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProductId,
          addQuantity: numQtyToAdd,
          costPrice: parsedCost,
          sellingPrice: parsedSelling,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update inventory.");
      }

      setSuccessMessage(
        `Restocked +${numQtyToAdd} units for "${data.product.name}". New stock: ${data.product.stock_qty}.`
      );

      // Update internal state list if we hold it
      setInternalProducts((prev) =>
        prev.map((p) => (p.id === data.product.id ? data.product : p))
      );

      // Trigger parent callback
      if (onRestockSuccess) {
        onRestockSuccess(data.product, numQtyToAdd);
      }

      // Close after short delay if desired, or let user continue restocking
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error restocking inventory.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-zinc-900 border border-zinc-700/80 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="restock-modal-title"
      >
        {/* Modal Header */}
        <div className="bg-zinc-950 px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/20 text-emerald-400 p-2.5 rounded-xl border border-emerald-500/30 flex items-center justify-center">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h2 id="restock-modal-title" className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                Inventory Restock
              </h2>
              <p className="text-xs text-zinc-400">
                Receive new inventory, adjust stock levels, & optionally update pricing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-zinc-800 transition-colors"
            aria-label="Close restock modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Notification Banners */}
          {errorMessage && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3.5 rounded-xl flex items-center gap-2.5 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3.5 rounded-xl flex items-center gap-2.5 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Product Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="product-search" className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                1. Select Product to Restock
              </label>
              {loadingProducts && (
                <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin text-emerald-400" />
                  Loading catalog...
                </span>
              )}
            </div>

            {/* Quick search input if product list is long */}
            {allProducts.length > 5 && (
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="product-search"
                  type="text"
                  placeholder="Filter by name or SKU..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full bg-zinc-950/70 border border-zinc-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            )}

            <select
              id="product-select"
              value={selectedProductId}
              onChange={(e) => handleProductSelect(e.target.value)}
              disabled={loadingProducts || allProducts.length === 0}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition cursor-pointer"
            >
              {allProducts.length === 0 && (
                <option value="">{loadingProducts ? "Loading products..." : "No products available"}</option>
              )}
              {filteredProducts.map((p) => (
                <option key={p.id} value={p.id} className="bg-zinc-900 py-1">
                  {p.name} (SKU: {p.sku}) — Stock: {p.stock_qty}
                </option>
              ))}
            </select>
          </div>

          {/* Selected Product Information Card */}
          {selectedProduct && (
            <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-sm text-zinc-200">{selectedProduct.name}</h4>
                  <p className="text-xs font-mono text-zinc-400">SKU: {selectedProduct.sku}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-zinc-400 block uppercase">Current Stock</span>
                  <span
                    className={`text-sm font-bold font-mono px-2 py-0.5 rounded ${
                      selectedProduct.stock_qty <= selectedProduct.reorder_level
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : "bg-zinc-800 text-zinc-100"
                    }`}
                  >
                    {selectedProduct.stock_qty} units
                  </span>
                </div>
              </div>

              {selectedProduct.stock_qty <= selectedProduct.reorder_level && (
                <p className="text-[11px] text-amber-400/90 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  At or below reorder threshold ({selectedProduct.reorder_level} units). Restock recommended.
                </p>
              )}
            </div>
          )}

          {/* Quantity to Add & Live Projection */}
          <div className="space-y-2">
            <label htmlFor="quantity-to-add" className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
              2. Quantity to Add
            </label>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Boxes className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="quantity-to-add"
                  type="number"
                  min="1"
                  step="1"
                  value={quantityToAdd}
                  onChange={(e) => setQuantityToAdd(e.target.value)}
                  placeholder="e.g. 20"
                  required
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl pl-9 pr-3.5 py-2.5 text-sm font-mono text-zinc-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                />
              </div>

              {/* Quick quantity increments */}
              <div className="flex gap-1.5">
                {[10, 25, 50].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setQuantityToAdd(String(amt))}
                    className={`px-2.5 py-2 text-xs font-medium rounded-lg border transition ${
                      quantityToAdd === String(amt)
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                        : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-750"
                    }`}
                  >
                    +{amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Projected Stock Preview */}
            {selectedProduct && projectedStock !== null && (
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-2.5 flex items-center justify-between text-xs text-zinc-300">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Projected Stock:
                </span>
                <span className="font-mono">
                  {selectedProduct.stock_qty} (current) + {numQtyToAdd} (adding) ={" "}
                  <strong className="text-emerald-400 font-bold">{projectedStock} units</strong>
                </span>
              </div>
            )}
          </div>

          {/* Pricing Adjustments (Optional) */}
          <div className="pt-2 border-t border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-emerald-400" />
                3. Update Prices (Optional)
              </label>
              <span className="text-[11px] text-zinc-500">Edit only if prices have changed</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Cost Price */}
              <div className="space-y-1.5">
                <label htmlFor="cost-price" className="text-xs text-zinc-400 flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-zinc-500" />
                  Supplier Cost Price ($)
                </label>
                <input
                  id="cost-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs font-mono text-zinc-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                />
              </div>

              {/* Selling Price */}
              <div className="space-y-1.5">
                <label htmlFor="selling-price" className="text-xs text-zinc-400 flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-zinc-500" />
                  Retail Selling Price ($)
                </label>
                <input
                  id="selling-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs font-mono text-zinc-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-xl transition cursor-pointer"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedProductId || !isValidQty}
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:pointer-events-none rounded-xl shadow-md transition-all active:scale-95 cursor-pointer border border-emerald-400/30"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Restock...</span>
                </>
              ) : (
                <>
                  <PackagePlus className="w-4 h-4" />
                  <span>Confirm Restock</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
