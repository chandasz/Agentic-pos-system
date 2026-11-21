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

    // 1. Determine date boundaries for today and 14 days ago
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // 2. Query today's sales with sold line items and product costs
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
    for (const sale of todaySales) {
      for (const item of sale.sale_items) {
        const cost = item.product.cost_price;
        const sellingPrice = item.price_at_sale;
        totalProfit += item.quantity * (sellingPrice - cost);
      }
    }

    // 3. Query all products to identify Low-Stock items and Dead-Stock items
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

    // Low-stock items: stock_qty <= reorder_level
    const lowStockItems = allProducts
      .filter((p) => p.stock_qty <= p.reorder_level)
      .map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        stock_qty: p.stock_qty,
        reorder_level: p.reorder_level,
        unit_cost: p.cost_price,
        selling_price: p.selling_price,
      }));

    // Dead stock: items with 0 sales in the last 14 days
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
        selling_price: p.selling_price,
        tied_up_capital: Number((p.stock_qty * p.cost_price).toFixed(2)),
      }));

    // 4. Query today's employee attendance (including late arrivals)
    const todayAttendance = await prisma.attendance.findMany({
      where: {
        clock_in: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: { clock_in: "asc" },
    });

    const attendanceSummary = todayAttendance.map((record) => {
      const clockInDate = new Date(record.clock_in);
      const isLate =
        record.status === "LATE" ||
        clockInDate.getHours() > 9 ||
        (clockInDate.getHours() === 9 && clockInDate.getMinutes() > 15);

      return {
        employee: record.employee.name,
        role: record.employee.role,
        clock_in: record.clock_in.toISOString(),
        clock_out: record.clock_out ? record.clock_out.toISOString() : null,
        status: record.status,
        isLate,
      };
    });

    const lateArrivals = attendanceSummary.filter((a) => a.isLate);

    // 5. Build structured payload for the LLM
    const storeData = {
      date: now.toISOString().split("T")[0],
      financials: {
        total_revenue: Number(totalRevenue.toFixed(2)),
        total_profit: Number(totalProfit.toFixed(2)),
        gross_margin_percentage:
          totalRevenue > 0 ? Number(((totalProfit / totalRevenue) * 100).toFixed(2)) : 0,
        customer_count: customerCount,
        average_order_value:
          customerCount > 0 ? Number((totalRevenue / customerCount).toFixed(2)) : 0,
      },
      inventory: {
        low_stock_count: lowStockItems.length,
        low_stock_items: lowStockItems,
        dead_stock_count: deadStockItems.length,
        dead_stock_tied_capital: Number(
          deadStockItems.reduce((acc, item) => acc + item.tied_up_capital, 0).toFixed(2)
        ),
        dead_stock_items: deadStockItems,
      },
      staffing: {
        total_shifts_today: attendanceSummary.length,
        late_arrivals_count: lateArrivals.length,
        late_arrivals: lateArrivals,
        all_attendance: attendanceSummary,
      },
    };

    // 6. Call Google Gen AI SDK
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are an elite retail business turnaround advisor. Analyze the following store operational and financial metrics for today and deliver a concise, brutally honest, and commercially actionable advisory report.

STORE DATA (JSON):
${JSON.stringify(storeData, null, 2)}

Provide your output in Markdown with the following exact 4 sections:
# 1) Daily Health Summary
- Evaluate today's revenue, profit margin, customer count, and average order value. Give an honest rating of overall store health.

# 2) Inventory & Cash-Flow Warnings
- Highlight urgent stockout risks from low-stock items.
- Detail the dead stock holding locked-up cash capital and recommend immediate clearance or liquidation actions.

# 3) Staff Performance Notes
- Assess attendance, punctual vs late arrivals, staffing coverage, and impact on register throughput.

# 4) 3 Practical Tips to Increase Tomorrow's Profit
- Provide exactly 3 high-impact, immediately executable actions the store manager and staff should implement tomorrow morning to drive up sales, basket size, and margins.`;

    let generatedMarkdown = "";
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      generatedMarkdown = response.text || "";
    } catch (primaryErr: unknown) {
      console.warn("Primary model gemini-2.5-flash failed, attempting fallback:", primaryErr);
      // Fallback in case gemini-2.5-flash is phased out or throttled in this region
      const fallbackModels = ["gemini-3.8-flash", "gemini-3.1-flash-lite"];
      for (const fallbackModel of fallbackModels) {
        try {
          const fbResponse = await ai.models.generateContent({
            model: fallbackModel,
            contents: prompt,
          });
          generatedMarkdown = fbResponse.text || "";
          if (generatedMarkdown) break;
        } catch (fbErr) {
          console.warn(`Fallback ${fallbackModel} failed:`, fbErr);
        }
      }

      if (!generatedMarkdown) {
        throw primaryErr;
      }
    }

    // 7. Save report to DailyAIReports table
    const reportDate = new Date(startOfDay);
    const savedReport = await prisma.dailyAIReport.upsert({
      where: { date: reportDate },
      update: {
        summary_json: JSON.stringify(storeData),
        markdown_report: generatedMarkdown,
      },
      create: {
        date: reportDate,
        summary_json: JSON.stringify(storeData),
        markdown_report: generatedMarkdown,
      },
    });

    return NextResponse.json({
      success: true,
      reportId: savedReport.id,
      date: storeData.date,
      metrics: storeData,
      report: generatedMarkdown,
    });
  } catch (error: unknown) {
    console.error("Report generation error:", error);
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
  // Allow GET requests for straightforward browser or monitoring invocations
  return POST(req);
}
