import { NextResponse } from "next/server";
import cartsData from "@/app/data/carts.json";
import productsData from "@/app/data/products.json";

function json(data: unknown, status = 200) {
  return new NextResponse(JSON.stringify(data, null, 2), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cart = cartsData.find((item) => item.id === Number(id));

  if (!cart) {
    return json({ error: "Cart not found" }, 404);
  }

  const results = cart.products
    .map((cartItem) => {
      const product = productsData.find((item) => item.id === cartItem.productId);
      return product ? { ...product, quantity: cartItem.quantity } : null;
    })
    .filter(Boolean);

  return json({ total: results.length, results });
}
