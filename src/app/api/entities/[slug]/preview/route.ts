import { type NextRequest, NextResponse } from "next/server";
import { queryAll, queryOne } from "@/lib/db";
import { publicEntityFilter } from "@/lib/public-visibility";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const entity = (await queryOne(
    `SELECT e.id, e.type, e.slug, e.name, e.summary,
            (
              SELECT COUNT(*)
              FROM entity_links preview_link
              JOIN entities preview_neighbor ON preview_neighbor.id =
                CASE
                  WHEN preview_link.source_id = e.id THEN preview_link.target_id
                  ELSE preview_link.source_id
                END
              WHERE (preview_link.source_id = e.id OR preview_link.target_id = e.id)
                AND ${publicEntityFilter("preview_neighbor")}
            ) as link_count
     FROM entities e
     WHERE e.slug = ? AND ${publicEntityFilter("e")}`,
    [slug],
  )) as Record<string, string | number | null> | undefined;

  if (!entity) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Top tags
  const tags = (await queryAll(
    `SELECT t.name, t.dimension FROM tags t
     JOIN entity_tags et ON et.tag_id = t.id
     WHERE et.entity_id = ?
     ORDER BY t.dimension, t.name
     LIMIT 6`,
    [entity.id],
  )) as Array<{ name: string; dimension: string }>;

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
