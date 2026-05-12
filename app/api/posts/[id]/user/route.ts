import { NextResponse } from "next/server";
import postsData from "@/app/data/posts.json";
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
  const post = postsData.find((item) => item.id === Number(id));

  if (!post) {
    return json({ error: "Post not found" }, 404);
  }

  return json(usersData.find((user) => user.id === post.userId) ?? null);
}
