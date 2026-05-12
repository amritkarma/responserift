import { NextResponse } from "next/server";
import productsData from "@/app/data/products.json";
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
  const productId = Number(id);

  if (!productsData.find((product) => product.id === productId)) {
    return json({ error: "Product not found" }, 404);
  }

  const results = cartsData.filter((cart) =>
    cart.products.some((item) => item.productId === productId)
  );

  return json({ total: results.length, results });
}
