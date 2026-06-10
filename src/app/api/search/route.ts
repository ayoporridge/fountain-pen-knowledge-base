import { type NextRequest, NextResponse } from "next/server";
import { queryAll, queryOne } from "@/lib/db";

function highlightText(text: string, query: string): string {
  if (!text || !query) return text;
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return parts.map((part, i) => 
    i % 2 === 1 ? `<mark>${part}</mark>` : part
  ).join('');
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  const page = Number.parseInt(request.nextUrl.searchParams.get("page") || "1", 10);
  const limit = Math.min(Number.parseInt(request.nextUrl.searchParams.get("limit") || "20", 10), 50);
  const offset = (page - 1) * limit;

  if (!q) {
    return NextResponse.json({ results: [], total: 0, page, limit });
  }

  // Sanitize FTS5 query: strip characters that have special meaning in FTS5
  // (" * + - AND OR NOT) and replace with space to avoid syntax errors / injection
  const sanitized = q.replace(/["*+\-()]/g, " ").replace(/\b(AND|OR|NOT)\b/gi, " ").trim();

  if (!sanitized) {
    return NextResponse.json({ results: [], total: 0, page, limit, query: q });
  }

  // Try FTS5 search first
  let ftsResults: Array<{
    id: string;
    type: string;
    slug: string;
    name: string;
    summary: string | null;
    name_highlight: string;
    summary_highlight: string;
    body_highlight: string;
    rank: number;
  }> = [];

  try {
    ftsResults = await queryAll(
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
      [sanitized, limit, offset]
    ) as typeof ftsResults;
  } catch {
    // FTS query might fail for some patterns
  }

  // Fallback to LIKE search
  if (ftsResults.length === 0) {
    const likePattern = `%${q}%`;
    const likeResults = await queryAll(
      `SELECT id, type, slug, name, summary
       FROM entities
       WHERE name LIKE ? OR summary LIKE ? OR body_md LIKE ?
       ORDER BY
         CASE WHEN name LIKE ? THEN 0 ELSE 1 END,
         name
       LIMIT ? OFFSET ?`,
      [likePattern, likePattern, likePattern, likePattern, limit, offset]
    ) as Array<{ id: string; type: string; slug: string; name: string; summary: string | null }>;

    ftsResults = likeResults.map((r) => ({
      ...r,
      name_highlight: highlightText(r.name, sanitized),
      summary_highlight: r.summary ? highlightText(r.summary, sanitized) : '',
      body_highlight: '',
      rank: 0,
    }));
  }

  // Total count
  let total = 0;
  try {
    const countResult = await queryOne(
      "SELECT COUNT(*) as cnt FROM entities_fts WHERE entities_fts MATCH ?",
      [sanitized]
    ) as { cnt: number };
    total = countResult.cnt;
  } catch {
    // ignore
  }

  // Fallback count for LIKE
  if (total === 0) {
    const likePattern = `%${q}%`;
    const likeCount = await queryOne(
      "SELECT COUNT(*) as cnt FROM entities WHERE name LIKE ? OR summary LIKE ? OR body_md LIKE ?",
      [likePattern, likePattern, likePattern]
    ) as { cnt: number };
    total = likeCount.cnt;
  }

  return NextResponse.json({
    results: ftsResults,
    total,
    page,
    limit,
    query: q,
  });
}
