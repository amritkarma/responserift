import { NextRequest, NextResponse } from "next/server";
import photosData from "@/app/data/photos.json";
import albumsData from "@/app/data/albums.json";

type Photo = {
  id: number;
  albumId: number;
  title: string;
  url: string;
  thumbnailUrl: string;
};

// In-memory copy for mutations (binding never reassigned)
const photos: Photo[] = [...(photosData as Photo[])];

// Helper function to add CORS headers
function withCORS(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return response;
}

// Helper function to format JSON response
function prettyJSON<T>(data: T, status = 200) {
  return withCORS(NextResponse.json(data, { status }));
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const albumId = Number(id);

  // Check if album exists
  if (!albumsData.find(album => album.id === albumId)) {
    return prettyJSON({ error: "Album not found" }, 404);
  }

  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") ?? "10");
  const offset = Number(searchParams.get("offset") ?? "0");
  const q = searchParams.get("q");

  let filteredPhotos = photos.filter(photo => photo.albumId === albumId);

  // Search by title
  if (q) {
    const qLower = q.toLowerCase();
    filteredPhotos = filteredPhotos.filter(photo =>
      photo.title.toLowerCase().includes(qLower)
    );
  }

  // Apply pagination
  const total = filteredPhotos.length;
  const results = filteredPhotos.slice(offset, offset + limit);

  return prettyJSON({ total, limit, offset, results });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const albumId = Number(id);

    // Check if album exists
    if (!albumsData.find(album => album.id === albumId)) {
      return prettyJSON({ error: "Album not found" }, 404);
    }

    const body = await request.json();

    // Validate required fields (albumId comes from URL param)
    if (!body.title || !body.url || !body.thumbnailUrl) {
      return prettyJSON({ errors: ["title, url, and thumbnailUrl are required"] }, 400);
    }

    // Safe id generation (handles empty array)
    const nextId = photos.length === 0 ? 1 : Math.max(...photos.map(p => p.id)) + 1;

    // Create new photo
    const newPhoto: Photo = {
      id: nextId,
      albumId,
      title: body.title,
      url: body.url,
      thumbnailUrl: body.thumbnailUrl,
    };

    photos.push(newPhoto);

    return prettyJSON(newPhoto, 201);
  } catch {
    return prettyJSON({ errors: ["Invalid JSON payload"] }, 400);
  }
}

export async function OPTIONS() {
  return withCORS(new NextResponse(null, { status: 200 }));
}

