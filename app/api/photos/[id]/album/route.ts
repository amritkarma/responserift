import { NextResponse } from "next/server";
import photosData from "@/app/data/photos.json";
import albumsData from "@/app/data/albums.json";

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
  const photo = photosData.find((item) => item.id === Number(id));

  if (!photo) {
    return json({ error: "Photo not found" }, 404);
  }

  return json(albumsData.find((album) => album.id === photo.albumId) ?? null);
}
