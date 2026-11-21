import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // 1. Fetch today's sales
    const todaySales = await prisma.sale.findMany({
      where: {
        timestamp: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        sale_items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { timestamp: "asc" },
    });

    const todaySalesTotal = todaySales.reduce((acc, sale) => acc + sale.total_amount, 0);
    const customerCount = todaySales.length;

    let todayNetProfit = 0;
    for (const sale of todaySales) {
      for (const item of sale.sale_items) {
        const cost = item.product?.cost_price ?? 0;
        const sellingPrice = item.price_at_sale;
        todayNetProfit += item.quantity * (sellingPrice - cost);
      }
    }

    // 2. Fetch all products to identify low stock
    const products = await prisma.product.findMany({
      orderBy: { stock_qty: "asc" },
    });

    const lowStockItems = products.filter((p) => p.stock_qty <= p.reorder_level);
    const lowStockCount = lowStockItems.length;

    // 3. Fetch past AI reports list and the latest report
    const reportsList = await prisma.dailyAIReport.findMany({
      select: {
        id: true,
        date: true,
        createdAt: true,
      },
      orderBy: { date: "desc" },
    });

    const latestReport = await prisma.dailyAIReport.findFirst({
      orderBy: { date: "desc" },
    });

    return NextResponse.json({
      success: true,
      kpis: {
        todaySales: Number(todaySalesTotal.toFixed(2)),
        todayNetProfit: Number(todayNetProfit.toFixed(2)),
        customerCount,
        lowStockCount,
        lowStockItems: lowStockItems.map((p) => ({
          id: p.id,
          name: p.name,
          sku: p.sku,
          stock_qty: p.stock_qty,
          reorder_level: p.reorder_level,
          selling_price: p.selling_price,
        })),
      },
      reportsList,
      latestReport,
    });
  } catch (error: unknown) {
    console.error("Dashboard stats error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
