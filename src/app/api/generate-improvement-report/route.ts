import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "GEMINI_API_KEY is not defined in environment variables." },
        { status: 500 }
      );
    }

    // 1. Date boundaries
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // 2. Query today's sales
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

    const totalRevenue = todaySales.reduce((acc, sale) => acc + sale.total_amount, 0);
    const customerCount = todaySales.length;

    let totalProfit = 0;
    const productSalesToday: Record<string, { name: string; quantity: number; revenue: number }> = {};

    for (const sale of todaySales) {
      for (const item of sale.sale_items) {
        const cost = item.product?.cost_price ?? 0;
        const sellingPrice = item.price_at_sale;
        totalProfit += item.quantity * (sellingPrice - cost);

        const prodId = item.product_id;
        const prodName = item.product?.name ?? "Unknown Item";
        if (!productSalesToday[prodId]) {
          productSalesToday[prodId] = { name: prodName, quantity: 0, revenue: 0 };
        }
        productSalesToday[prodId].quantity += item.quantity;
        productSalesToday[prodId].revenue += item.quantity * sellingPrice;
      }
    }

    // 3. Fast movers today sorted by quantity
    const fastMoversToday = Object.values(productSalesToday)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // 4. Query last 7 days sales for trend comparison
    const recentSales = await prisma.sale.findMany({
      where: {
        timestamp: {
          gte: sevenDaysAgo,
          lt: startOfDay,
        },
      },
      select: {
        total_amount: true,
        timestamp: true,
      },
    });

    const recentDailyAverage = recentSales.length > 0
      ? recentSales.reduce((acc, s) => acc + s.total_amount, 0) / 7
      : totalRevenue;

    const revenueTrend = recentDailyAverage > 0
      ? Number((((totalRevenue - recentDailyAverage) / recentDailyAverage) * 100).toFixed(1))
      : 0;

    // 5. Query all products for low stock and dead stock
    const allProducts = await prisma.product.findMany({
      include: {
        sale_items: {
          include: {
            sale: {
              select: { timestamp: true },
            },
          },
        },
      },
    });

    const lowStockItems = allProducts
      .filter((p) => p.stock_qty <= p.reorder_level)
      .map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        stock_qty: p.stock_qty,
        reorder_level: p.reorder_level,
        cost_price: p.cost_price,
        selling_price: p.selling_price,
      }));

    const deadStockItems = allProducts
      .filter((p) => {
        const salesInPast14Days = p.sale_items.filter(
          (si) => new Date(si.sale.timestamp) >= fourteenDaysAgo
        );
        return salesInPast14Days.length === 0;
      })
      .map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        stock_qty: p.stock_qty,
        cost_price: p.cost_price,
        tied_up_capital: Number((p.stock_qty * p.cost_price).toFixed(2)),
      }));

    // 6. Query staff attendance
    const todayAttendance = await prisma.attendance.findMany({
      where: {
        clock_in: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        employee: {
          select: { name: true, role: true },
        },
      },
    });

    const lateStaff = todayAttendance.filter((a) => {
      const clockIn = new Date(a.clock_in);
      return a.status === "LATE" || clockIn.getHours() > 9 || (clockIn.getHours() === 9 && clockIn.getMinutes() > 15);
    });

    // 7. Structured store metrics payload for AI
    const metricsPayload = {
      store: "Smart කඩේ (Smart Kade Retail)",
      date: now.toISOString().split("T")[0],
      time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      financials: {
        totalRevenue: Number(totalRevenue.toFixed(2)),
        totalProfit: Number(totalProfit.toFixed(2)),
        marginPercentage: totalRevenue > 0 ? Number(((totalProfit / totalRevenue) * 100).toFixed(1)) : 0,
        customerCount,
        averageOrderValue: customerCount > 0 ? Number((totalRevenue / customerCount).toFixed(2)) : 0,
        sevenDayAvgDailyRevenue: Number(recentDailyAverage.toFixed(2)),
        revenueTrendPercentVsAvg: revenueTrend,
      },
      productMovement: {
        fastMoversToday: fastMoversToday.map((m) => `${m.name} (${m.quantity} units, $${m.revenue.toFixed(2)})`),
        lowStockItems: lowStockItems.map((p) => `${p.name} (Stock: ${p.stock_qty}, Min: ${p.reorder_level})`),
        deadStockItems: deadStockItems.map((d) => `${d.name} (Stock: ${d.stock_qty}, Capital Locked: $${d.tied_up_capital})`),
        totalTiedUpCapital: Number(deadStockItems.reduce((acc, d) => acc + d.tied_up_capital, 0).toFixed(2)),
      },
      staffing: {
        shiftsToday: todayAttendance.length,
        lateArrivals: lateStaff.map((s) => s.employee.name),
      },
    };

    // 8. Prompt Gemini for Smart කඩේ Improvement Advisory
    const prompt = `You are the executive AI Business Advisor for "Smart කඩේ" (a modern high-turnover grocery and retail shop).
Analyze today's live store metrics below and produce a pragmatic Daily Improvement & Selling Rate Optimization Report formatted cleanly for a POS receipt / thermal slip.

STORE METRICS DATA:
${JSON.stringify(metricsPayload, null, 2)}

Provide your response in JSON format matching this exact schema:
{
  "rating": "EXCELLENT" | "SOLID" | "NEEDS ATTENTION" | "CRITICAL",
  "headline": "A sharp, honest 1-sentence assessment of today's commercial performance",
  "revenueDiagnosis": "1-2 sentences analyzing sales volume, basket size, and margins vs trends",
  "fastMoversSummary": "Brief commentary on what moved best today and why to double down",
  "restockAction": "Urgent restock warning naming top 1-2 critical low items",
  "deadStockAction": "Specific, practical clearance/bundling tactic to unlock tied-up dead stock cash",
  "sellingRateTips": [
    {
      "title": "Short title (e.g. Counter Impulse Upsell)",
      "action": "Clear, specific step the cashier/staff must execute tomorrow to boost basket size or sell-through rate"
    },
    {
      "title": "Short title (e.g. Fast-Mover Front Stacking)",
      "action": "Clear physical or pricing adjustment to increase unit velocity"
    },
    {
      "title": "Short title (e.g. Bundle Stagnant Stock)",
      "action": "Practical pairing of a slow-moving item with a daily grocery staple"
    }
  ]
}

Ensure the tips are practical, highly specific to retail store operations, and directly address the actual data provided.`;

    const ai = new GoogleGenAI({ apiKey });
    let rawAiText = "";

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });
      rawAiText = response.text || "";
    } catch (primaryErr) {
      console.warn("gemini-2.5-flash failed, attempting fallback models:", primaryErr);
      const fallbackModels = ["gemini-3.8-flash", "gemini-3.1-flash-lite"];
      for (const fallbackModel of fallbackModels) {
        try {
          const fbResponse = await ai.models.generateContent({
            model: fallbackModel,
            contents: prompt,
            config: {
              responseMimeType: "application/json",
            },
          });
          rawAiText = fbResponse.text || "";
          if (rawAiText) break;
        } catch (fbErr) {
          console.warn(`Fallback ${fallbackModel} failed:`, fbErr);
        }
      }
    }

    let parsedAdvice = {
      rating: totalRevenue > 200 ? "SOLID" : "NEEDS ATTENTION",
      headline: `Today generated $${totalRevenue.toFixed(2)} across ${customerCount} transactions.`,
      revenueDiagnosis: `Average basket size stands at $${(customerCount > 0 ? totalRevenue / customerCount : 0).toFixed(2)} with a ${metricsPayload.financials.marginPercentage}% margin.`,
      fastMoversSummary: fastMoversToday.length > 0 ? `Fastest moving: ${fastMoversToday.map(f => f.name).join(", ")}.` : "No major product spikes recorded today.",
      restockAction: lowStockItems.length > 0 ? `Restock ${lowStockItems.slice(0, 2).map(l => l.name).join(", ")} immediately to avoid stockouts.` : "Stock levels are healthy.",
      deadStockAction: deadStockItems.length > 0 ? `Bundle ${deadStockItems[0].name} with a high-velocity item to recover locked capital.` : "Dead stock is under control.",
      sellingRateTips: [
        {
          title: "Counter Impulse Upsell",
          action: "Train cashier to suggest everyday essentials or snacks at checkout to raise basket value.",
        },
        {
          title: "Promote High-Margin Fast Movers",
          action: "Place the top 3 selling items in high-traffic end-caps at eye level.",
        },
        {
          title: "Clear Slow Stock With Pairings",
          action: "Pair slow-moving stock with breakfast or cooking staples at a 10% promotional bundle price.",
        },
      ],
    };

    if (rawAiText) {
      try {
        const cleanJsonStr = rawAiText.replace(/```json/g, "").replace(/```/g, "").trim();
        parsedAdvice = { ...parsedAdvice, ...JSON.parse(cleanJsonStr) };
      } catch (parseErr) {
        console.error("JSON parse error for AI advice:", parseErr, rawAiText);
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      formattedDate: now.toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" }),
      formattedTime: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      metrics: metricsPayload,
      advice: parsedAdvice,
    });
  } catch (error: unknown) {
    console.error("Generate improvement report error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  return POST(req);
}
