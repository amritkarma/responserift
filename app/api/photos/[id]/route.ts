import { NextRequest, NextResponse } from "next/server";
import photosData from "@/app/data/photos.json";

type Photo = {
  id: number;
  albumId: number;
  title: string;
  url: string;
  thumbnailUrl: string;
};

// In-memory copy for mutations
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
  const photoId = Number(id);
  const photo = photos.find(p => p.id === photoId);

  if (!photo) {
    return prettyJSON({ error: "Photo not found" }, 404);
  }

  return prettyJSON(photo);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const photoId = Number(id);
    const body = await request.json();

    const photoIndex = photos.findIndex(p => p.id === photoId);

    if (photoIndex === -1) {
      return prettyJSON({ error: "Photo not found" }, 404);
    }

    // Validate required fields
    if (!body.albumId || !body.title || !body.url || !body.thumbnailUrl) {
      return prettyJSON(
        { errors: ["albumId, title, url, and thumbnailUrl are required"] },
        400
      );
    }

    // Update photo (keep id stable)
    const updatedPhoto: Photo = {
      ...photos[photoIndex],
      ...body,
      id: photoId,
    };

    photos[photoIndex] = updatedPhoto;

    return prettyJSON(updatedPhoto);
  } catch {
    return prettyJSON({ errors: ["Invalid JSON payload"] }, 400);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const photoId = Number(id);
  const photoIndex = photos.findIndex(p => p.id === photoId);

  if (photoIndex === -1) {
    return prettyJSON({ error: "Photo not found" }, 404);
  }

  const deletedPhoto = photos[photoIndex];
  photos.splice(photoIndex, 1);

  return prettyJSON(deletedPhoto);
}

export async function OPTIONS() {
  return withCORS(new NextResponse(null, { status: 200 }));
}
