import { type NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const db = await getDb();

  const entity = await db
    .prepare(
      `SELECT e.id, e.type, e.slug, e.name, e.summary,
              (SELECT COUNT(*) FROM entity_links WHERE source_id = e.id OR target_id = e.id) as link_count
       FROM entities e WHERE e.slug = ?`,
    )
    .bind(slug)
    .first() as Record<string, string | number | null> | null;

  if (!entity) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Top tags
  const tags = (await db
    .prepare(
      `SELECT t.name, t.dimension FROM tags t
       JOIN entity_tags et ON et.tag_id = t.id
       WHERE et.entity_id = ?
       ORDER BY t.dimension, t.name
       LIMIT 6`,
    )
    .bind(entity.id)
    .all()).results as Array<{ name: string; dimension: string }>;

  return NextResponse.json({
    id: entity.id,
    type: entity.type,
    slug: entity.slug,
    name: entity.name,
    summary: entity.summary,
    link_count: entity.link_count,
    tags,
  });
}
