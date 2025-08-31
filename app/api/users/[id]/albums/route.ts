import { NextRequest, NextResponse } from "next/server";
import albumsData from "@/app/data/albums.json";
import usersData from "@/app/data/users.json";

type Album = {
  id: number;
  userId: number;
  title: string;
};

// In-memory copy for mutations
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
  // If you want pretty output in dev only, swap to JSON.stringify like in earlier message.
  return withCORS(NextResponse.json(data, { status }));
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = Number(id);

  // Check if user exists
  if (!usersData.find(user => user.id === userId)) {
    return prettyJSON({ error: "User not found" }, 404);
  }

  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") ?? "10");
  const offset = Number(searchParams.get("offset") ?? "0");
  const q = searchParams.get("q");

  let filteredAlbums = albums.filter(album => album.userId === userId);

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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = Number(id);

    // Check if user exists
    if (!usersData.find(user => user.id === userId)) {
      return prettyJSON({ error: "User not found" }, 404);
    }

    const body = await request.json();

    // Validate required fields (userId is set from URL)
    if (!body.title) {
      return prettyJSON({ errors: ["title is required"] }, 400);
    }

    // Robust id generation (handles empty array)
    const nextId =
      albums.length === 0 ? 1 : Math.max(...albums.map(a => a.id)) + 1;

    // Create new album
    const newAlbum: Album = {
      id: nextId,
      userId, // Set from URL parameter
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

