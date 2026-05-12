import { NextResponse } from "next/server";
import postsData from "@/app/data/posts.json";
import tagsData from "@/app/data/tags.json";

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

  const postTags = new Set((post.tags ?? []).map((tag) => String(tag)));
  const results = tagsData.filter(
    (tag) => postTags.has(String(tag.id)) || postTags.has(tag.name)
  );

  return json({ total: results.length, results });
}
