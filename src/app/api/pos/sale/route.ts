import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface CartSaleItem {
  productId: string;
  quantity: number;
  price: number;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { cashierName, items } = body as {
      cashierName?: string;
      items: CartSaleItem[];
    };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Cart is empty" },
        { status: 400 }
      );
    }

    // Run atomically inside transaction
    const result = await prisma.$transaction(async (tx) => {
      let calculatedTotal = 0;
      const verifiedItems: Array<{
        productId: string;
        quantity: number;
        priceAtSale: number;
      }> = [];

      // 1. Validate stocks and calculate exact total
      for (const item of items) {
        if (!item.productId || !item.quantity || item.quantity <= 0) {
          throw new Error("Invalid item format in cart");
        }

        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new Error(`Product not found (ID: ${item.productId})`);
        }

        if (product.stock_qty < item.quantity) {
          throw new Error(
            `Insufficient stock for "${product.name}". Available: ${product.stock_qty}, Requested: ${item.quantity}`
          );
        }

        const itemTotal = product.selling_price * item.quantity;
        calculatedTotal += itemTotal;

        verifiedItems.push({
          productId: product.id,
          quantity: item.quantity,
          priceAtSale: product.selling_price,
        });
      }

      calculatedTotal = Math.round(calculatedTotal * 100) / 100;

      // 2. Create the Sale and associated SaleItems
      const createdSale = await tx.sale.create({
        data: {
          cashier_name: cashierName?.trim() || "Register Cashier",
          total_amount: calculatedTotal,
          sale_items: {
            create: verifiedItems.map((v) => ({
              product_id: v.productId,
              quantity: v.quantity,
              price_at_sale: v.priceAtSale,
            })),
          },
        },
        include: {
          sale_items: {
            include: {
              product: true,
            },
          },
        },
      });

      // 3. Atomically decrement stock quantity for each sold item
      for (const v of verifiedItems) {
        await tx.product.update({
          where: { id: v.productId },
          data: {
            stock_qty: {
              decrement: v.quantity,
            },
          },
        });
      }

      // 4. Fetch refreshed products
      const updatedProducts = await tx.product.findMany({
        orderBy: { name: "asc" },
      });

      return {
        sale: createdSale,
        updatedProducts,
      };
    });

    return NextResponse.json({
      success: true,
      sale: result.sale,
      updatedProducts: result.updatedProducts,
      message: "Sale completed successfully",
    });
  } catch (error: unknown) {
    console.error("Sale processing error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to process sale";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 400 }
    );
  }
}
