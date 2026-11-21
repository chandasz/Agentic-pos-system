import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Cleaning existing data...");
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.dailyAIReport.deleteMany();
  await prisma.product.deleteMany();
  await prisma.employee.deleteMany();

  console.log("📦 Seeding 15 shop products...");
  const sampleProducts = [
    {
      name: "Whole Bean Espresso Roast (1kg)",
      sku: "BEV-ESP-001",
      cost_price: 12.5,
      selling_price: 24.99,
      stock_qty: 45,
      reorder_level: 15,
    },
    {
      name: "Organic Almond Milk (1L)",
      sku: "BEV-ALM-002",
      cost_price: 1.8,
      selling_price: 3.99,
      stock_qty: 60,
      reorder_level: 20,
    },
    {
      name: "Artisan Sourdough Loaf",
      sku: "BAK-SRD-003",
      cost_price: 2.1,
      selling_price: 5.49,
      stock_qty: 25,
      reorder_level: 10,
    },
    {
      name: "Extra Virgin Olive Oil (750ml)",
      sku: "GRO-EVO-004",
      cost_price: 8.2,
      selling_price: 16.99,
      stock_qty: 35,
      reorder_level: 12,
    },
    {
      name: "Himalayan Pink Rock Salt (500g)",
      sku: "GRO-HPS-005",
      cost_price: 1.5,
      selling_price: 4.29,
      stock_qty: 50,
      reorder_level: 15,
    },
    {
      name: "Single-Origin Dark Chocolate 72%",
      sku: "SNK-CHO-006",
      cost_price: 2.0,
      selling_price: 4.99,
      stock_qty: 80,
      reorder_level: 25,
    },
    {
      name: "Salted Roasted Mixed Nuts (300g)",
      sku: "SNK-NUT-007",
      cost_price: 4.5,
      selling_price: 9.99,
      stock_qty: 40,
      reorder_level: 15,
    },
    {
      name: "Cold-Pressed Orange Juice (1L)",
      sku: "BEV-OJ-008",
      cost_price: 2.4,
      selling_price: 5.29,
      stock_qty: 30,
      reorder_level: 10,
    },
    {
      name: "Organic Hass Avocados (Pack of 4)",
      sku: "PRD-AVO-009",
      cost_price: 3.2,
      selling_price: 6.99,
      stock_qty: 28,
      reorder_level: 10,
    },
    {
      name: "Ancient Grain Granola (400g)",
      sku: "BFT-GRA-010",
      cost_price: 3.5,
      selling_price: 7.49,
      stock_qty: 42,
      reorder_level: 15,
    },
    {
      name: "Lavender & Shea Butter Hand Soap",
      sku: "HPC-SOAP-011",
      cost_price: 2.8,
      selling_price: 6.5,
      stock_qty: 55,
      reorder_level: 20,
    },
    {
      name: "Bamboo Eco Paper Towels (2-Pack)",
      sku: "HPC-TOW-012",
      cost_price: 2.2,
      selling_price: 4.99,
      stock_qty: 70,
      reorder_level: 25,
    },
    {
      name: "Italian Penne Rigate (500g)",
      sku: "GRO-PEN-013",
      cost_price: 0.9,
      selling_price: 2.49,
      stock_qty: 90,
      reorder_level: 30,
    },
    {
      name: "San Marzano Tomato Sauce (400g)",
      sku: "GRO-TOM-014",
      cost_price: 1.75,
      selling_price: 3.99,
      stock_qty: 65,
      reorder_level: 20,
    },
    {
      name: "Japanese Ceremonial Matcha (30g)",
      sku: "BEV-MAT-015",
      cost_price: 14.0,
      selling_price: 28.5,
      stock_qty: 22,
      reorder_level: 8,
    },
  ];

  const createdProducts = [];
  for (const prod of sampleProducts) {
    const created = await prisma.product.create({ data: prod });
    createdProducts.push(created);
  }
  console.log(`✅ Created ${createdProducts.length} products.`);

  console.log("👥 Seeding 4 employees...");
  const sampleEmployees = [
    { name: "Elena Vance", role: "Store Manager", pin_code: "1024" },
    { name: "Marcus Chen", role: "Head Cashier", pin_code: "2048" },
    { name: "Aisha Patel", role: "Sales Associate", pin_code: "3141" },
    { name: "David Kim", role: "Inventory Specialist", pin_code: "4096" },
  ];

  const createdEmployees = [];
  for (const emp of sampleEmployees) {
    const created = await prisma.employee.create({ data: emp });
    createdEmployees.push(created);
  }
  console.log(`✅ Created ${createdEmployees.length} employees.`);

  console.log("📅 Generating 14 days of realistic attendance, sales, and AI reports...");
  const baseDate = new Date();
  baseDate.setHours(0, 0, 0, 0);

  let totalSalesCreated = 0;
  let totalSaleItemsCreated = 0;
  let totalAttendanceCreated = 0;

  for (let dayOffset = 13; dayOffset >= 0; dayOffset--) {
    const currentDate = new Date(baseDate);
    currentDate.setDate(currentDate.getDate() - dayOffset);

    const dateStr = currentDate.toISOString().split("T")[0];
    const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;

    // 1. Seed Attendance for this day
    const workingCashiers: string[] = [];
    for (const emp of createdEmployees) {
      let status = "PRESENT";
      let clockInHour = 8;
      let clockInMin = Math.floor(Math.random() * 20) + 40; // 8:40 - 8:59
      let shiftHours = 8.5;

      if (emp.role === "Store Manager") {
        clockInHour = 8;
        clockInMin = 30 + Math.floor(Math.random() * 15);
      } else if (emp.role === "Head Cashier") {
        if (dayOffset % 6 === 2) {
          status = "LATE";
          clockInHour = 9;
          clockInMin = 22;
        } else if (dayOffset % 7 === 5) {
          status = "ON_LEAVE";
        }
      } else if (emp.role === "Sales Associate") {
        clockInHour = 9;
        clockInMin = Math.floor(Math.random() * 25) + 45; // 9:45 - 10:10
        if (dayOffset % 7 === 1) {
          status = "HALF_DAY";
          shiftHours = 4.5;
        }
      } else if (emp.role === "Inventory Specialist") {
        clockInHour = 7;
        clockInMin = 30 + Math.floor(Math.random() * 15);
        if (dayOffset % 7 === 0) {
          status = "ON_LEAVE";
        }
      }

      if (status !== "ON_LEAVE") {
        const clockIn = new Date(currentDate);
        clockIn.setHours(clockInHour, clockInMin, 0, 0);

        const clockOut = new Date(clockIn);
        clockOut.setTime(clockIn.getTime() + shiftHours * 60 * 60 * 1000 + Math.floor(Math.random() * 20) * 60000);

        await prisma.attendance.create({
          data: {
            employee_id: emp.id,
            clock_in: clockIn,
            clock_out: clockOut,
            status,
          },
        });
        totalAttendanceCreated++;

        if (emp.role === "Head Cashier" || emp.role === "Sales Associate" || emp.role === "Store Manager") {
          workingCashiers.push(emp.name);
        }
      }
    }

    if (workingCashiers.length === 0) {
      workingCashiers.push(createdEmployees[0].name);
    }

    // 2. Seed Sales for this day
    const salesCountForDay = (isWeekend ? 14 : 9) + Math.floor(Math.random() * 4); // 9-18 sales
    let dailyRevenue = 0;
    let dailyItemsCount = 0;
    const productSalesCountMap: { [productName: string]: number } = {};

    for (let s = 0; s < salesCountForDay; s++) {
      const saleHour = 9 + Math.floor((s / salesCountForDay) * 11); // between 9:00 and 20:00
      const saleMinute = Math.floor(Math.random() * 60);
      const saleTime = new Date(currentDate);
      saleTime.setHours(saleHour, saleMinute, Math.floor(Math.random() * 60), 0);

      const cashier = workingCashiers[Math.floor(Math.random() * workingCashiers.length)];

      // Pick 1 to 4 distinct items
      const numItems = Math.min(Math.floor(Math.random() * 3) + 1, createdProducts.length);
      const shuffled = [...createdProducts].sort(() => 0.5 - Math.random());
      const selectedProducts = shuffled.slice(0, numItems);

      let saleTotal = 0;
      const saleItemsData = selectedProducts.map((p) => {
        const qty = Math.floor(Math.random() * 2) + 1; // 1-2 units
        const price = p.selling_price;
        saleTotal += qty * price;
        dailyItemsCount += qty;
        productSalesCountMap[p.name] = (productSalesCountMap[p.name] || 0) + qty;

        return {
          product_id: p.id,
          quantity: qty,
          price_at_sale: price,
        };
      });

      saleTotal = Math.round(saleTotal * 100) / 100;
      dailyRevenue += saleTotal;

      const createdSale = await prisma.sale.create({
        data: {
          timestamp: saleTime,
          total_amount: saleTotal,
          cashier_name: cashier,
          sale_items: {
            create: saleItemsData,
          },
        },
      });

      totalSalesCreated++;
      totalSaleItemsCreated += saleItemsData.length;
    }

    dailyRevenue = Math.round(dailyRevenue * 100) / 100;
    const aov = salesCountForDay > 0 ? Math.round((dailyRevenue / salesCountForDay) * 100) / 100 : 0;

    // Find top selling product of the day
    let topProduct = "None";
    let topCount = 0;
    for (const [pName, count] of Object.entries(productSalesCountMap)) {
      if (count > topCount) {
        topCount = count;
        topProduct = pName;
      }
    }

    // 3. Generate Daily AI Report
    const summaryJson = {
      date: dateStr,
      total_revenue: dailyRevenue,
      transactions_count: salesCountForDay,
      items_sold: dailyItemsCount,
      average_order_value: aov,
      top_selling_product: topProduct,
      top_product_units: topCount,
      active_cashiers: workingCashiers,
      attendance_rate_percent: Math.round((workingCashiers.length / createdEmployees.length) * 100),
    };

    const markdownReport = `### 📊 Daily Store Performance Report: ${dateStr}

#### Executive Summary
- **Gross Revenue**: $${dailyRevenue.toFixed(2)}
- **Completed Transactions**: ${salesCountForDay}
- **Average Basket Value**: $${aov.toFixed(2)}
- **Total Units Sold**: ${dailyItemsCount} units
- **Top Performer**: **${topProduct}** (${topCount} units sold)

#### Staffing & Operations
- **Floor Staff Present**: ${workingCashiers.join(", ")}
- **Shift Efficiency**: ${summaryJson.attendance_rate_percent}% staffing capacity
- Peak register activity observed between 12:00 PM - 2:00 PM and 5:30 PM - 7:30 PM.

#### AI Merchandising & Inventory Insights
1. **Demand Velocity**: ${topProduct} saw elevated basket frequency today. Verify inventory buffer against reorder thresholds.
2. **Basket Cross-Selling**: Customers purchasing pantry essentials showed high affinity for fresh bakery and beverage items.
3. **Cashier Speed**: Average checkout cycle handled smoothly with zero reported registry bottlenecks.
`;

    const reportDate = new Date(currentDate);
    reportDate.setHours(23, 59, 59, 0);

    await prisma.dailyAIReport.create({
      data: {
        date: reportDate,
        summary_json: JSON.stringify(summaryJson, null, 2),
        markdown_report: markdownReport,
      },
    });
  }

  console.log(`✅ Seeded ${totalAttendanceCreated} attendance records.`);
  console.log(`✅ Seeded ${totalSalesCreated} sales with ${totalSaleItemsCreated} line items.`);
  console.log(`✅ Seeded 14 daily AI performance reports.`);
  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
