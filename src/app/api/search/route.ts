import { type NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(request: NextRequest) {
  const db = getDb();
  const q = request.nextUrl.searchParams.get("q")?.trim();
  const page = Number.parseInt(request.nextUrl.searchParams.get("page") || "1", 10);
  const limit = Math.min(Number.parseInt(request.nextUrl.searchParams.get("limit") || "20", 10), 50);
  const offset = (page - 1) * limit;

  if (!q) {
    return NextResponse.json({ results: [], total: 0, page, limit });
  }

  // FTS5 search with snippet highlighting
  const ftsResults = db
    .prepare(
      `SELECT e.id, e.type, e.slug, e.name, e.summary,
              snippet(entities_fts, 0, '<mark>', '</mark>', '…', 32) as name_highlight,
              snippet(entities_fts, 1, '<mark>', '</mark>', '…', 64) as summary_highlight,
              snippet(entities_fts, 2, '<mark>', '</mark>', '…', 64) as body_highlight,
              rank
       FROM entities_fts fts
       JOIN entities e ON e.rowid = fts.rowid
       WHERE entities_fts MATCH ?
       ORDER BY rank
       LIMIT ? OFFSET ?`,
    )
    .all(q, limit, offset) as Array<{
    id: string;
    type: string;
    slug: string;
    name: string;
    summary: string | null;
    name_highlight: string;
    summary_highlight: string;
    body_highlight: string;
    rank: number;
  }>;

  // Total count
  const countResult = db
    .prepare("SELECT COUNT(*) as cnt FROM entities_fts WHERE entities_fts MATCH ?")
    .get(q) as { cnt: number };

  return NextResponse.json({
    results: ftsResults,
    total: countResult.cnt,
    page,
    limit,
    query: q,
  });
}
