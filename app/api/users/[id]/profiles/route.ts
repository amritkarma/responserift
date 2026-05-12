import { NextResponse } from "next/server";
import usersData from "@/app/data/users.json";
import profilesData from "@/app/data/profiles.json";

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
  const userId = Number(id);

  if (!usersData.find((user) => user.id === userId)) {
    return json({ error: "User not found" }, 404);
  }

  const results = profilesData.filter((profile) => profile.userId === userId);

  return json({ total: results.length, results });
}
