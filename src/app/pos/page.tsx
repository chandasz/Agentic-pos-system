"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Header } from "@/components/pos/Header";
import { ProductGrid } from "@/components/pos/ProductGrid";
import { CartReceipt, CartItem } from "@/components/pos/CartReceipt";
import { AttendanceModal } from "@/components/pos/AttendanceModal";
import { SaleSuccessModal } from "@/components/pos/SaleSuccessModal";
import { RestockModal } from "@/components/common/RestockModal";
import { Product } from "@/components/pos/ProductCard";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";

interface Employee {
  id: string;
  name: string;
  role: string;
}

interface SaleSuccessData {
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
}

export default function PosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [activeCashier, setActiveCashier] = useState<string>("Elena Vance");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);
  const [processingSale, setProcessingSale] = useState<boolean>(false);

  // Modals
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState<boolean>(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState<boolean>(false);
  const [lastSaleData, setLastSaleData] = useState<SaleSuccessData | null>(null);

  // Toast notifications
  const [toast, setToast] = useState<{
    id: number;
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  const showToast = useCallback(
    (message: string, type: "success" | "error" | "info" = "info") => {
      const id = Date.now();
      setToast({ id, type, message });
      setTimeout(() => {
        setToast((current) => (current?.id === id ? null : current));
      }, 3500);
    },
    []
  );

  // 1. Fetch initial products & employees
  const loadInitialData = useCallback(async () => {
    try {
      setLoadingProducts(true);
      const [prodRes, empRes] = await Promise.all([
        fetch("/api/pos/products"),
        fetch("/api/pos/employees"),
      ]);

      const prodData = await prodRes.json();
      const empData = await empRes.json();

      if (prodData.success && Array.isArray(prodData.products)) {
        setProducts(prodData.products);
      }

      if (empData.success && Array.isArray(empData.employees) && empData.employees.length > 0) {
        setEmployees(empData.employees);
        // Default to first employee if not set
        setActiveCashier((prev) => prev || empData.employees[0].name);
      }
    } catch (err) {
      console.error("Failed to load POS data:", err);
      showToast("Failed to connect to POS database. Please refresh.", "error");
    } finally {
      setLoadingProducts(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Cart quantities lookup map
  const cartQuantities = useMemo(() => {
    const map: Record<string, number> = {};
    for (const item of cart) {
      map[item.product.id] = item.quantity;
    }
    return map;
  }, [cart]);

  // Add Product to Cart
  const handleAddToCart = useCallback(
    (product: Product) => {
      // Find latest stock in state
      const currentProduct = products.find((p) => p.id === product.id) || product;
      if (currentProduct.stock_qty <= 0) {
        showToast(`"${product.name}" is currently out of stock.`, "error");
        return;
      }

      setCart((prevCart) => {
        const existingIndex = prevCart.findIndex(
          (item) => item.product.id === product.id
        );

        if (existingIndex > -1) {
          const currentQty = prevCart[existingIndex].quantity;
          if (currentQty >= currentProduct.stock_qty) {
            showToast(
              `Cannot add more. Reached maximum available stock (${currentProduct.stock_qty}) for "${product.name}".`,
              "error"
            );
            return prevCart;
          }

          const updated = [...prevCart];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: currentQty + 1,
          };
          return updated;
        } else {
          return [...prevCart, { product: currentProduct, quantity: 1 }];
        }
      });
    },
    [products, showToast]
  );

  // Update Item Quantity (+1 / -1)
  const handleUpdateQuantity = useCallback(
    (productId: string, delta: number) => {
      setCart((prevCart) => {
        return prevCart
          .map((item) => {
            if (item.product.id === productId) {
              const newQty = item.quantity + delta;
              const productInCatalog =
                products.find((p) => p.id === productId) || item.product;

              if (newQty > productInCatalog.stock_qty) {
                showToast(
                  `Cannot exceed available stock (${productInCatalog.stock_qty}).`,
                  "error"
                );
                return item;
              }
              return { ...item, quantity: newQty };
            }
            return item;
          })
          .filter((item) => item.quantity > 0);
      });
    },
    [products, showToast]
  );

  // Remove Item from Cart
  const handleRemoveItem = useCallback((productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  }, []);

  // Clear Cart
  const handleClearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Complete Sale and deduct stock from database
  const handleCompleteSale = async (paymentDetails: {
    method: "CASH" | "CARD";
    tendered: number;
    change: number;
  }) => {
    if (cart.length === 0) return;

    setProcessingSale(true);
    try {
      const payload = {
        cashierName: activeCashier,
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.selling_price,
        })),
      };

      const res = await fetch("/api/pos/sale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success && data.sale) {
        // Update local catalog stock immediately with refreshed products from server
        if (data.updatedProducts) {
          setProducts(data.updatedProducts);
        } else {
          // Fallback optimistic stock decrement
          setProducts((prev) =>
            prev.map((p) => {
              const sold = cart.find((c) => c.product.id === p.id);
              if (sold) {
                return { ...p, stock_qty: Math.max(0, p.stock_qty - sold.quantity) };
              }
              return p;
            })
          );
        }

        // Prepare receipt data
        const itemsSummary = cart.map((c) => ({
          id: c.product.id,
          productName: c.product.name,
          quantity: c.quantity,
          price: c.product.selling_price,
        }));

        setLastSaleData({
          id: data.sale.id,
          total_amount: data.sale.total_amount,
          cashier_name: data.sale.cashier_name,
          timestamp: data.sale.timestamp,
          paymentMethod: paymentDetails.method,
          tendered: paymentDetails.tendered,
          change: paymentDetails.change,
          items: itemsSummary,
        });

        // Reset cart and show success modal
        setCart([]);
        setIsSuccessModalOpen(true);
        showToast("Sale completed! Stock updated in database.", "success");
      } else {
        showToast(data.error || "Failed to complete sale.", "error");
      }
    } catch (err) {
      console.error("Sale completion error:", err);
      showToast("Network error while completing sale. Please retry.", "error");
    } finally {
      setProcessingSale(false);
    }
  };

  // When staff clocks in from the modal
  const handleClockInSuccess = (employee: Employee) => {
    setActiveCashier(employee.name);
    showToast(
      `Welcome, ${employee.name}! Active register cashier set to ${employee.name}.`,
      "success"
    );
  };

  // When a restock is completed successfully
  const handleRestockSuccess = useCallback(
    (updatedProduct: Product, addedQty: number) => {
      loadInitialData();
      showToast(
        `Restocked +${addedQty} units for "${updatedProduct.name}". New stock: ${updatedProduct.stock_qty}`,
        "success"
      );
    },
    [loadInitialData, showToast]
  );

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-zinc-950 font-sans select-none">
      {/* Top Header Bar */}
      <Header
        activeCashier={activeCashier}
        employees={employees}
        onSelectCashier={setActiveCashier}
        onOpenAttendance={() => setIsAttendanceModalOpen(true)}
        onOpenRestock={() => setIsRestockModalOpen(true)}
      />

      {/* Main Dual-Pane POS Layout */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left Pane: Searchable Catalog Grid (~62%) */}
        <div className="w-full md:w-7/12 lg:w-3/5 h-full overflow-hidden border-r border-zinc-800">
          <ProductGrid
            products={products}
            cartQuantities={cartQuantities}
            onAddToCart={handleAddToCart}
            loading={loadingProducts}
          />
        </div>

        {/* Right Pane: Receipt Cart (~38%) */}
        <div className="w-full md:w-5/12 lg:w-2/5 h-full overflow-hidden">
          <CartReceipt
            items={cart}
            activeCashier={activeCashier}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onCompleteSale={handleCompleteSale}
            processingSale={processingSale}
          />
        </div>
      </main>

      {/* Employee Attendance Modal */}
      <AttendanceModal
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
        onClockInSuccess={handleClockInSuccess}
      />

      {/* Post-Sale Receipt Modal */}
      <SaleSuccessModal
        isOpen={isSuccessModalOpen}
        saleData={lastSaleData}
        onClose={() => setIsSuccessModalOpen(false)}
        onNewSale={() => {
          setIsSuccessModalOpen(false);
          setLastSaleData(null);
        }}
      />

      {/* Inventory Restock Modal */}
      <RestockModal
        isOpen={isRestockModalOpen}
        onClose={() => setIsRestockModalOpen(false)}
        products={products}
        onRestockSuccess={handleRestockSuccess}
      />

      {/* Transient Toast Alerts */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl border animate-in slide-in-from-bottom duration-200 bg-zinc-900 text-zinc-100 max-w-sm">
          {toast.type === "success" && (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          )}
          {toast.type === "error" && (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          {toast.type === "info" && (
            <Info className="w-5 h-5 text-blue-400 shrink-0" />
          )}
          <span className="text-xs font-medium leading-relaxed">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
