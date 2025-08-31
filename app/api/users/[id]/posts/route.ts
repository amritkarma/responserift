import { NextRequest, NextResponse } from "next/server";
import postsData from "@/app/data/posts.json";
import usersData from "@/app/data/users.json";

type Post = {
  id: number;
  userId: number;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  category: string;
  slug: string;
};

// Shape of raw JSON items (some fields optional)
type PostSeed = {
  id: number;
  userId: number;
  title: string;
  body: string;
  createdAt?: string;
  updatedAt?: string;
  tags?: string[];
  category?: string;
  slug?: string;
};

// Slug helper
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

// In-memory copy for mutations (normalize JSON -> Post)
const posts: Post[] = (postsData as PostSeed[]).map((p) => {
  const created = p.createdAt ?? new Date().toISOString();
  return {
    id: p.id,
    userId: p.userId,
    title: p.title,
    body: p.body,
    tags: p.tags ?? [],
    category: p.category ?? "General",
    createdAt: created,
    updatedAt: p.updatedAt ?? created,
    slug: p.slug ?? generateSlug(p.title),
  };
});

// CORS
function withCORS(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return response;
}

// Pretty JSON (dev pretty, prod compact)
function prettyJSON<T>(data: T, status = 200) {
  const json = JSON.stringify(
    data,
    null,
    process.env.NODE_ENV === "development" ? 2 : 0
  );
  const response = new NextResponse(json, {
    status,
    headers: { "Content-Type": "application/json" },
  });
  return withCORS(response);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = Number(id);

  if (!usersData.find((u) => u.id === userId)) {
    return prettyJSON({ error: "User not found" }, 404);
  }

  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") ?? "10");
  const offset = Number(searchParams.get("offset") ?? "0");
  const tag = searchParams.get("tag");
  const category = searchParams.get("category");

  let filtered = posts.filter((p) => p.userId === userId);

  if (tag) {
    filtered = filtered.filter((p) => p.tags.includes(tag));
  }

  if (category) {
    filtered = filtered.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase()
    );
  }

  const total = filtered.length;
  const results = filtered.slice(offset, offset + limit);

  return prettyJSON({ total, limit, offset, results });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = Number(id);

    if (!usersData.find((u) => u.id === userId)) {
      return prettyJSON({ error: "User not found" }, 404);
    }

    const body = await request.json();

    if (!body.title || !body.body) {
      return prettyJSON({ errors: ["title and body are required"] }, 400);
    }

    const now = new Date().toISOString();
    const nextId = (posts.length ? Math.max(...posts.map((p) => p.id)) : 0) + 1;

    const newPost: Post = {
      id: nextId,
      userId,
      title: body.title,
      body: body.body,
      tags: Array.isArray(body.tags) ? body.tags : [],
      category: body.category ?? "General",
      slug: generateSlug(body.title),
      createdAt: now,
      updatedAt: now,
    };

    posts.push(newPost);

    return prettyJSON(newPost, 201);
  } catch {
    return prettyJSON({ errors: ["Invalid JSON payload"] }, 400);
  }
}

export async function OPTIONS() {
  return withCORS(new NextResponse(null, { status: 200 }));
}

