import { NextResponse } from "next/server";
import reviewsData from "@/app/data/reviews.json";
import usersData from "@/app/data/users.json";

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
  const review = reviewsData.find((item) => item.id === Number(id));

  if (!review) {
    return json({ error: "Review not found" }, 404);
  }

  return json(usersData.find((user) => user.id === review.userId) ?? null);
}
