import { NextResponse } from "next/server";
import productsData from "@/app/data/products.json";
import categoriesData from "@/app/data/categories.json";

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
  const product = productsData.find((item) => item.id === Number(id));

  if (!product) {
    return json({ error: "Product not found" }, 404);
  }

  const category = categoriesData.find(
    (item) => item.name.toLowerCase() === product.category.toLowerCase()
  );

  return json(category ?? null);
}
