import { NextResponse } from "next/server";
import ordersData from "@/app/data/orders.json";
import cartsData from "@/app/data/carts.json";

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
  const order = ordersData.find((item) => item.id === Number(id));

  if (!order) {
    return json({ error: "Order not found" }, 404);
  }

  return json(cartsData.find((cart) => cart.id === order.cartId) ?? null);
}
