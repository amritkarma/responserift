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
  // If you want pretty output in dev, swap to manual JSON.stringify with indentation.
  return withCORS(NextResponse.json(data, { status }));
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const albumId = searchParams.get("albumId");
  const limit = Number(searchParams.get("limit") ?? "10");
  const offset = Number(searchParams.get("offset") ?? "0");
  const q = searchParams.get("q");

  let filteredPhotos = [...photos];

  // Filter by albumId
  if (albumId) {
    const aid = Number(albumId);
    filteredPhotos = filteredPhotos.filter(photo => photo.albumId === aid);
  }

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.albumId || !body.title || !body.url || !body.thumbnailUrl) {
      return prettyJSON(
        { errors: ["albumId, title, url, and thumbnailUrl are required"] },
        400
      );
    }

    // Validate albumId exists
    if (typeof body.albumId !== "number" || body.albumId < 1) {
      return prettyJSON({ errors: ["albumId must be a positive number"] }, 400);
    }

    // Validate that albumId exists in albums data
    if (!albumsData.find(album => album.id === body.albumId)) {
      return prettyJSON({ errors: ["Invalid albumId: album does not exist"] }, 400);
    }

    // Robust id generation (handles empty array)
    const nextId = photos.length === 0 ? 1 : Math.max(...photos.map(p => p.id)) + 1;

    // Create new photo
    const newPhoto: Photo = {
      id: nextId,
      albumId: body.albumId,
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
