import { NextRequest, NextResponse } from "next/server";
import albumsData from "@/app/data/albums.json";

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
  return withCORS(NextResponse.json(data, { status }));
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const albumId = Number(id);
  const album = albums.find(a => a.id === albumId);

  if (!album) {
    return prettyJSON({ error: "Album not found" }, 404);
  }

  return prettyJSON(album);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const albumId = Number(id);
    const body = await request.json();

    const albumIndex = albums.findIndex(a => a.id === albumId);

    if (albumIndex === -1) {
      return prettyJSON({ error: "Album not found" }, 404);
    }

    // Validate required fields
    if (!body.userId || !body.title) {
      return prettyJSON({ errors: ["userId and title are required"] }, 400);
    }

    // Update album (keep id stable)
    const updatedAlbum: Album = {
      ...albums[albumIndex],
      ...body,
      id: albumId,
    };

    albums[albumIndex] = updatedAlbum;

    return prettyJSON(updatedAlbum);
  } catch {
    return prettyJSON({ errors: ["Invalid JSON payload"] }, 400);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const albumId = Number(id);
  const albumIndex = albums.findIndex(a => a.id === albumId);

  if (albumIndex === -1) {
    return prettyJSON({ error: "Album not found" }, 404);
  }

  const deletedAlbum = albums[albumIndex];
  albums.splice(albumIndex, 1);

  return prettyJSON(deletedAlbum);
}

export async function OPTIONS() {
  return withCORS(new NextResponse(null, { status: 200 }));
}
