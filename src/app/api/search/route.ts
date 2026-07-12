import { type NextRequest, NextResponse } from "next/server";
import { searchPublicEntities } from "@/lib/search";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") || "";
  const page = Number.parseInt(
    request.nextUrl.searchParams.get("page") || "1",
    10,
  );
  const limit = Number.parseInt(
    request.nextUrl.searchParams.get("limit") || "20",
    10,
  );
  const response = await searchPublicEntities({ query, page, limit });
  return NextResponse.json(response, {
    headers: {
      "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600",
    },
  });
}
