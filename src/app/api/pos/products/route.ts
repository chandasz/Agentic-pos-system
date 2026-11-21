import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        sku: true,
        selling_price: true,
        cost_price: true,
        stock_qty: true,
        reorder_level: true,
      },
    });

    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error("Error fetching POS products:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
