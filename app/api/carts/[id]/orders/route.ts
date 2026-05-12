import { NextResponse } from "next/server";
import cartsData from "@/app/data/carts.json";
import ordersData from "@/app/data/orders.json";

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
  const cartId = Number(id);

  if (!cartsData.find((cart) => cart.id === cartId)) {
    return json({ error: "Cart not found" }, 404);
  }

  const results = ordersData.filter((order) => order.cartId === cartId);

  return json({ total: results.length, results });
}
