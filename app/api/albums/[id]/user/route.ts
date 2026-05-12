import { NextResponse } from "next/server";
import albumsData from "@/app/data/albums.json";
import usersData from "@/app/data/users.json";

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
  const album = albumsData.find((item) => item.id === Number(id));

  if (!album) {
    return json({ error: "Album not found" }, 404);
  }

  return json(usersData.find((user) => user.id === album.userId) ?? null);
}
