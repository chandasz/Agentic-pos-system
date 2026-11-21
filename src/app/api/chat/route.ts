import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";

interface ChatMessage {
  role: "user" | "model";
  content: string;
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "GEMINI_API_KEY is not configured in environment variables." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { message, history } = body as {
      message: string;
      history?: ChatMessage[];
    };

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { success: false, error: "A message string is required." },
        { status: 400 }
      );
    }

    const now = new Date();
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // 1. Load last 14 days of sales
    const salesPast14Days = await prisma.sale.findMany({
      where: {
        timestamp: {
          gte: fourteenDaysAgo,
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

    // Group sales by date (YYYY-MM-DD)
    const salesByDay: Record<
      string,
      {
        date: string;
        totalRevenue: number;
        totalProfit: number;
        transactionCount: number;
        itemsSold: Record<string, { name: string; quantity: number; revenue: number }>;
      }
    > = {};

    for (const sale of salesPast14Days) {
      const dayKey = sale.timestamp.toISOString().split("T")[0];
      if (!salesByDay[dayKey]) {
        salesByDay[dayKey] = {
          date: dayKey,
          totalRevenue: 0,
          totalProfit: 0,
          transactionCount: 0,
          itemsSold: {},
        };
      }

      salesByDay[dayKey].totalRevenue += sale.total_amount;
      salesByDay[dayKey].transactionCount += 1;

      for (const item of sale.sale_items) {
        const cost = item.product?.cost_price ?? 0;
        const profit = item.quantity * (item.price_at_sale - cost);
        salesByDay[dayKey].totalProfit += profit;

        const prodName = item.product?.name ?? "Unknown";
        if (!salesByDay[dayKey].itemsSold[prodName]) {
          salesByDay[dayKey].itemsSold[prodName] = {
            name: prodName,
            quantity: 0,
            revenue: 0,
          };
        }
        salesByDay[dayKey].itemsSold[prodName].quantity += item.quantity;
        salesByDay[dayKey].itemsSold[prodName].revenue += item.quantity * item.price_at_sale;
      }
    }

    const salesSummary14Days = Object.values(salesByDay).map((day) => ({
      date: day.date,
      revenue: Number(day.totalRevenue.toFixed(2)),
      profit: Number(day.totalProfit.toFixed(2)),
      transactions: day.transactionCount,
      avg_ticket: Number((day.totalRevenue / (day.transactionCount || 1)).toFixed(2)),
      top_items: Object.values(day.itemsSold)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 3),
    }));

    // 2. Load current stock levels
    const allProducts = await prisma.product.findMany({
      orderBy: { stock_qty: "asc" },
    });

    const stockLevels = allProducts.map((p) => {
      const isLowStock = p.stock_qty <= p.reorder_level;
      const isOutOfStock = p.stock_qty === 0;
      return {
        id: p.id,
        name: p.name,
        sku: p.sku,
        stock_qty: p.stock_qty,
        reorder_level: p.reorder_level,
        unit_cost: p.cost_price,
        selling_price: p.selling_price,
        gross_margin_percent: Number(
          (((p.selling_price - p.cost_price) / p.selling_price) * 100).toFixed(1)
        ),
        status: isOutOfStock ? "OUT_OF_STOCK" : isLowStock ? "LOW_STOCK" : "HEALTHY",
      };
    });

    const lowStockItems = stockLevels.filter((s) => s.status !== "HEALTHY");

    // 3. Load attendance logs for the past 14 days
    const attendanceLogs = await prisma.attendance.findMany({
      where: {
        clock_in: {
          gte: fourteenDaysAgo,
        },
      },
      include: {
        employee: {
          select: {
            name: true,
            role: true,
          },
        },
      },
      orderBy: { clock_in: "desc" },
    });

    const attendanceSummary = attendanceLogs.map((log) => {
      const clockIn = new Date(log.clock_in);
      const isLate =
        log.status === "LATE" ||
        clockIn.getHours() > 9 ||
        (clockIn.getHours() === 9 && clockIn.getMinutes() > 15);

      return {
        date: clockIn.toISOString().split("T")[0],
        employee: log.employee.name,
        role: log.employee.role,
        clock_in: log.clock_in.toISOString(),
        clock_out: log.clock_out ? log.clock_out.toISOString() : null,
        status: log.status,
        isLate,
      };
    });

    // 4. Load latest AI report
    const latestReport = await prisma.dailyAIReport.findFirst({
      orderBy: { date: "desc" },
    });

    // 5. Construct System Instruction for Gemini
    const systemInstruction = `You are the elite AI Business Advisor for "RetailShop", a physical retail store. You advise the shop owner on sales strategy, profit margins, inventory restocking, dead stock liquidation, and staffing/attendance management.

TODAY'S DATE: ${now.toISOString().split("T")[0]}

REAL-TIME STORE CONTEXT:

=== 1. LAST 14 DAYS SALES SUMMARY ===
${JSON.stringify(salesSummary14Days, null, 2)}

=== 2. CURRENT INVENTORY & STOCK LEVELS ===
Low Stock & Out-of-Stock Items (Urgent):
${JSON.stringify(lowStockItems, null, 2)}

Full Catalog Summary:
Total products: ${allProducts.length}. Low stock count: ${lowStockItems.length}.
${JSON.stringify(stockLevels.slice(0, 20), null, 2)}

=== 3. STAFF ATTENDANCE LOGS (PAST 14 DAYS) ===
Total Shifts Recorded: ${attendanceSummary.length}.
Late Shifts: ${attendanceSummary.filter((a) => a.isLate).length}.
Recent logs:
${JSON.stringify(attendanceSummary.slice(0, 15), null, 2)}

=== 4. LATEST DAILY AI REPORT ===
Date: ${latestReport ? latestReport.date.toISOString().split("T")[0] : "No report generated yet"}
Report Markdown:
${latestReport ? latestReport.markdown_report : "N/A"}

INSTRUCTIONS:
- Deliver precise, commercially savvy, data-backed answers citing exact dollar amounts, SKUs, product names, dates, and employee names when asked.
- When asked "Why were sales low yesterday?" or on specific days, check the sales summary for that day, compare it against previous days or weekends, examine customer transaction count, basket size, and check if staff were late or absent that day.
- When asked "Which items should I restock first?", prioritize products with high margin and high sales velocity that are currently at or below their reorder level.
- Format responses cleanly in markdown with bold key figures, bullet points, and brief tables where appropriate.
- Keep responses direct, actionable, and executive-level. Avoid generic fluff.`;

    // 6. Assemble conversation history and new user prompt
    const ai = new GoogleGenAI({ apiKey });

    // Build the contents array for generateContent
    // If conversation history is provided, include past exchanges
    const contents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];

    if (Array.isArray(history)) {
      for (const msg of history) {
        if (msg.content && (msg.role === "user" || msg.role === "model")) {
          contents.push({
            role: msg.role,
            parts: [{ text: msg.content }],
          });
        }
      }
    }

    // Add current user message
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    let advisorReply = "";
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
        config: {
          systemInstruction: {
            parts: [{ text: systemInstruction }],
          },
        },
      });
      advisorReply = response.text || "";
    } catch (primaryErr: unknown) {
      console.warn("Primary gemini-2.5-flash failed in /api/chat, trying fallback:", primaryErr);
      const fallbackModels = ["gemini-3.8-flash", "gemini-3.1-flash-lite"];
      for (const fbModel of fallbackModels) {
        try {
          const fbResponse = await ai.models.generateContent({
            model: fbModel,
            contents,
            config: {
              systemInstruction: {
                parts: [{ text: systemInstruction }],
              },
            },
          });
          advisorReply = fbResponse.text || "";
          if (advisorReply) break;
        } catch (fbErr) {
          console.warn(`Fallback ${fbModel} failed in /api/chat:`, fbErr);
        }
      }

      if (!advisorReply) {
        throw primaryErr;
      }
    }

    return NextResponse.json({
      success: true,
      reply: advisorReply,
    });
  } catch (error: unknown) {
    console.error("Chat API error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
