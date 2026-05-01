import { NextRequest, NextResponse } from "next/server";
import { loadMockData } from "@/lib/mock-api/loadMockData";

export const runtime = "nodejs";


function normalizeCollection(data: any, resource: string) {
  let collection = data[resource];

  if (collection && !Array.isArray(collection)) {
    if (Array.isArray(collection[resource])) {
      collection = collection[resource];
    }
  }

  return collection;
}


function prettyJson(data: any, status = 200) {
  return new NextResponse(
    JSON.stringify(data, null, 2),
    {
      status,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}


// helper: auto-increment ID
function getNextId(collection: any[]) {
  if (!collection.length) return 1;

  const maxId = Math.max(
    ...collection.map((item: any) =>
      typeof item.id === "number" ? item.id : 0
    )
  );

  return maxId + 1;
}


export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await context.params;
  const [resource, id] = slug || [];

  const data = loadMockData();
  const collection = normalizeCollection(data, resource);

  if (!collection || !Array.isArray(collection)) {
    return prettyJson({ error: "Invalid or missing data" }, 404);
  }

  // GET /item/:id
  if (id) {
    const item = collection.find((i: any) => i.id === Number(id));
    return prettyJson(item || null);
  }

  // 👉 GET /api/profiles
  return prettyJson(collection);
}


// POST
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await context.params;
  const [resource] = slug || [];

  const data = loadMockData();
  const body = await req.json();

  let collection = normalizeCollection(data, resource);

  if (!collection) {
    collection = [];
  }

  if (!Array.isArray(collection)) {
    return prettyJson({ error: "Invalid data format" }, 400);
  }

  // AUTO-INCREMENT ID
  const newItem = {
    id: getNextId(collection),
    ...body,
  };

  collection.push(newItem);

  return prettyJson(newItem, 201);
}


// PUT
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await context.params;
  const [resource, id] = slug || [];

  const data = loadMockData();
  const body = await req.json();

  const collection = normalizeCollection(data, resource);

  if (!collection || !Array.isArray(collection)) {
    return prettyJson({ error: "Invalid or missing data" }, 404);
  }

  const index = collection.findIndex((i: any) => i.id === Number(id));

  if (index === -1) {
    return prettyJson({ error: "Item not found" }, 404);
  }

  collection[index] = { ...collection[index], ...body };

  return prettyJson(collection[index]);
}


//  DELETE
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await context.params;
  const [resource, id] = slug || [];

  const data = loadMockData();
  const collection = normalizeCollection(data, resource);

  if (!collection || !Array.isArray(collection)) {
    return prettyJson({ error: "Invalid or missing data" }, 404);
  }

  const filtered = collection.filter(
    (i: any) => i.id !== Number(id)
  );

  return prettyJson({
    success: true,
    deletedId: Number(id),
    remaining: filtered.length,
  });
}