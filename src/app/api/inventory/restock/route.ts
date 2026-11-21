import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId, addQuantity, costPrice, sellingPrice } = body;

    if (!productId || typeof productId !== "string") {
      return NextResponse.json(
        { success: false, error: "Product ID is required." },
        { status: 400 }
      );
    }

    const qtyToAdd = Number(addQuantity);
    if (!addQuantity || isNaN(qtyToAdd) || qtyToAdd <= 0) {
      return NextResponse.json(
        { success: false, error: "Quantity to add must be a positive number greater than 0." },
        { status: 400 }
      );
    }

    // Verify product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: "Product not found." },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: {
      stock_qty: { increment: number };
      cost_price?: number;
      selling_price?: number;
    } = {
      stock_qty: { increment: Math.floor(qtyToAdd) },
    };

    if (costPrice !== undefined && costPrice !== null && costPrice !== "") {
      const parsedCost = Number(costPrice);
      if (isNaN(parsedCost) || parsedCost < 0) {
        return NextResponse.json(
          { success: false, error: "Cost price must be a valid non-negative number." },
          { status: 400 }
        );
      }
      updateData.cost_price = Math.round(parsedCost * 100) / 100;
    }

    if (sellingPrice !== undefined && sellingPrice !== null && sellingPrice !== "") {
      const parsedSelling = Number(sellingPrice);
      if (isNaN(parsedSelling) || parsedSelling < 0) {
        return NextResponse.json(
          { success: false, error: "Selling price must be a valid non-negative number." },
          { status: 400 }
        );
      }
      updateData.selling_price = Math.round(parsedSelling * 100) / 100;
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: `Successfully restocked ${Math.floor(qtyToAdd)} unit(s) of "${updatedProduct.name}".`,
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error restocking product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to restock product. Please try again." },
      { status: 500 }
    );
  }
}
