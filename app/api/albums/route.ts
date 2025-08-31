import { NextRequest, NextResponse } from "next/server";
import albumsData from "@/app/data/albums.json";
import usersData from "@/app/data/users.json";

type Album = {
  id: number;
  userId: number;
  title: string;
};

// In-memory copy for mutations (binding never reassigned)
const albums: Album[] = [...(albumsData as Album[])];

// Helper function to add CORS headers
function withCORS(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return response;
}

// Helper function to format JSON response
function prettyJSON<T>(data: T, status = 200) {
  // For pretty dev output, you could switch to manual JSON.stringify with indentation.
  return withCORS(NextResponse.json(data, { status }));
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const limit = Number(searchParams.get("limit") ?? "10");
  const offset = Number(searchParams.get("offset") ?? "0");
  const q = searchParams.get("q");

  let filteredAlbums = [...albums];

  // Filter by userId
  if (userId) {
    const uid = Number(userId);
    filteredAlbums = filteredAlbums.filter(album => album.userId === uid);
  }

  // Search by title
  if (q) {
    const qLower = q.toLowerCase();
    filteredAlbums = filteredAlbums.filter(album =>
      album.title.toLowerCase().includes(qLower)
    );
  }

  // Apply pagination
  const total = filteredAlbums.length;
  const results = filteredAlbums.slice(offset, offset + limit);

  return prettyJSON({ total, limit, offset, results });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body?.userId || !body?.title) {
      return prettyJSON({ errors: ["userId and title are required"] }, 400);
    }

    // Validate userId exists
    if (typeof body.userId !== "number" || body.userId < 1) {
      return prettyJSON({ errors: ["userId must be a positive number"] }, 400);
    }

    // Validate that userId exists in users data
    if (!usersData.find(user => user.id === body.userId)) {
      return prettyJSON({ errors: ["Invalid userId: user does not exist"] }, 400);
    }

    // Robust id generation (handles empty array)
    const nextId = albums.length === 0 ? 1 : Math.max(...albums.map(a => a.id)) + 1;

    // Create new album
    const newAlbum: Album = {
      id: nextId,
      userId: body.userId,
      title: body.title,
    };

    albums.push(newAlbum);

    return prettyJSON(newAlbum, 201);
  } catch {
    return prettyJSON({ errors: ["Invalid JSON payload"] }, 400);
  }
}

export async function OPTIONS() {
  return withCORS(new NextResponse(null, { status: 200 }));
}
