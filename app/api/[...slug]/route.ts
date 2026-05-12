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

function toSingular(resource: string) {
  if (resource.endsWith("ies")) return `${resource.slice(0, -3)}y`;
  if (resource.endsWith("s")) return resource.slice(0, -1);
  return resource;
}

function toPlural(resource: string) {
  if (resource.endsWith("y")) return `${resource.slice(0, -1)}ies`;
  if (resource.endsWith("s")) return resource;
  return `${resource}s`;
}

function unique(values: string[]) {
  return [...new Set(values)];
}

function getCollection(data: Record<string, any>, resource: string) {
  const names = unique([resource, toPlural(resource), toSingular(resource)]);

  for (const name of names) {
    const collection = normalizeCollection(data, name);

    if (Array.isArray(collection)) {
      return collection;
    }
  }

  return null;
}

function findById(collection: any[], id: string | number) {
  return collection.find((item: any) => item.id === Number(id));
}

function valuesMatch(left: unknown, right: unknown) {
  return String(left).toLowerCase() === String(right).toLowerCase();
}

function matchTargetItem(target: any, value: unknown) {
  return ["id", "name", "slug", "title", "username"].some((key) =>
    target[key] !== undefined && valuesMatch(target[key], value)
  );
}

function findMatchingTarget(collection: any[], value: unknown) {
  return collection.find((target: any) => matchTargetItem(target, value));
}

function getRelationKeys(relation: string) {
  return unique([relation, toPlural(relation), toSingular(relation)]);
}

function resolveEmbeddedRelation(item: any, relation: string, relationCollection: any[]) {
  const relationSingular = toSingular(relation);
  const relationKeys = getRelationKeys(relation);

  for (const key of relationKeys) {
    const value = item[key];

    if (value === undefined || value === null) continue;

    if (Array.isArray(value)) {
      return value
        .map((entry: any) => {
          if (typeof entry !== "object" || entry === null) {
            return findMatchingTarget(relationCollection, entry) || entry;
          }

          const idValue = entry[`${relationSingular}Id`] ?? entry.id;
          const target =
            idValue !== undefined
              ? findMatchingTarget(relationCollection, idValue)
              : null;

          return target ? { ...target, ...entry } : entry;
        })
        .filter(Boolean);
    }

    return findMatchingTarget(relationCollection, value) || value;
  }

  return undefined;
}

function resolveBelongsTo(item: any, relation: string, relationCollection: any[]) {
  const relationSingular = toSingular(relation);
  const foreignKey = `${relationSingular}Id`;

  if (item[foreignKey] === undefined || item[foreignKey] === null) {
    return undefined;
  }

  return findById(relationCollection, item[foreignKey]) || null;
}

function resolveHasMany(
  item: any,
  resource: string,
  relationCollection: any[]
) {
  const resourceSingular = toSingular(resource);
  const foreignKey = `${resourceSingular}Id`;

  return relationCollection.filter((relationItem: any) =>
    relationItem[foreignKey] !== undefined && valuesMatch(relationItem[foreignKey], item.id)
  );
}

function resolveReverseEmbeddedRelation(
  item: any,
  resource: string,
  relationCollection: any[]
) {
  const resourceSingular = toSingular(resource);
  const resourceKeys = unique([resourceSingular, resource, toPlural(resource)]);
  const matchValues = [item.id, item.name, item.slug, item.title, item.username].filter(
    (value) => value !== undefined && value !== null
  );

  return relationCollection.filter((relationItem: any) =>
    resourceKeys.some((key) => {
      const value = relationItem[key];

      if (Array.isArray(value)) {
        return value.some((entry) =>
          typeof entry === "object" && entry !== null
            ? matchValues.some((matchValue) =>
                [entry.id, entry[`${resourceSingular}Id`], entry.name, entry.slug].some(
                  (entryValue) =>
                    entryValue !== undefined && valuesMatch(entryValue, matchValue)
                )
              )
            : matchValues.some((matchValue) => valuesMatch(entry, matchValue))
        );
      }

      return (
        value !== undefined &&
        matchValues.some((matchValue) => valuesMatch(value, matchValue))
      );
    })
  );
}

function resolveNestedResource(
  data: Record<string, any>,
  resource: string,
  id: string,
  relation: string,
  relationId?: string
) {
  const collection = getCollection(data, resource);

  if (!collection || !Array.isArray(collection)) {
    return { status: 404, data: { error: "Invalid or missing data" } };
  }

  const item = findById(collection, id);

  if (!item) {
    return { status: 404, data: { error: "Item not found" } };
  }

  const relationCollection = getCollection(data, relation);

  if (!relationCollection) {
    const embedded = getRelationKeys(relation)
      .map((key) => item[key])
      .find((value) => value !== undefined);

    return embedded === undefined
      ? { status: 404, data: { error: "Relation not found" } }
      : { status: 200, data: embedded };
  }

  const resolved =
    resolveEmbeddedRelation(item, relation, relationCollection) ??
    resolveBelongsTo(item, relation, relationCollection) ??
    resolveHasMany(item, resource, relationCollection);

  const dataResult = Array.isArray(resolved) && resolved.length === 0
    ? resolveReverseEmbeddedRelation(item, resource, relationCollection)
    : resolved;

  if (relationId) {
    const relationItems = Array.isArray(dataResult) ? dataResult : [dataResult];
    return { status: 200, data: findById(relationItems.filter(Boolean), relationId) || null };
  }

  return {
    status: 200,
    data: dataResult,
  };
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
  const [resource, id, relation, relationId] = slug || [];

  const data = loadMockData();
  const collection = normalizeCollection(data, resource);

  if (!collection || !Array.isArray(collection)) {
    return prettyJson({ error: "Invalid or missing data" }, 404);
  }

  // GET /api/users/:id/posts, /api/posts/:id/categories, etc.
  if (id && relation) {
    const result = resolveNestedResource(data, resource, id, relation, relationId);
    return prettyJson(result.data, result.status);
  }

  // GET /item/:id
  if (id) {
    const item = findById(collection, id);
    return prettyJson(item || null);
  }

  // GET /api/posts
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
