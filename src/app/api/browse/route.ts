import { type NextRequest, NextResponse } from "next/server";
import { getBrowseData } from "@/lib/browse-data";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const data = await getBrowseData(request.nextUrl.searchParams);
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
