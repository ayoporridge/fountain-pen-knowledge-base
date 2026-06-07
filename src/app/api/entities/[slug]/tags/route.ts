import { type NextRequest, NextResponse } from "next/server";
import { queryOne, queryAll, execute } from "@/lib/db";
import { nanoid } from "nanoid";

// GET /api/entities/[slug]/tags
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const entity = await queryOne(
    "SELECT id FROM entities WHERE slug = ?",
    [slug]
  ) as { id: string } | undefined;

  if (!entity) {
    return NextResponse.json({ error: "Entity not found" }, { status: 404 });
  }

  const tags = await queryAll(
    `SELECT t.* FROM tags t
     JOIN entity_tags et ON et.tag_id = t.id
     WHERE et.entity_id = ?
     ORDER BY t.dimension, t.name`,
    [entity.id]
  );

  return NextResponse.json(tags);
}

// POST /api/entities/[slug]/tags  — add tags (body: { tag_ids: [...] })
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const body = await request.json();

  const entity = await queryOne(
    "SELECT id FROM entities WHERE slug = ?",
    [slug]
  ) as { id: string } | undefined;

  if (!entity) {
    return NextResponse.json({ error: "Entity not found" }, { status: 404 });
  }

  const { tag_ids } = body;
  if (!Array.isArray(tag_ids)) {
    return NextResponse.json({ error: "tag_ids array required" }, { status: 400 });
  }

  const added: string[] = [];
  for (const tagId of tag_ids) {
    try {
      await execute(
        "INSERT OR IGNORE INTO entity_tags (id, entity_id, tag_id) VALUES (?, ?, ?)",
        [nanoid(12), entity.id, tagId]
      );
      added.push(tagId);
    } catch {
      // Ignore duplicates
    }
  }

  return NextResponse.json({ added });
}

// DELETE /api/entities/[slug]/tags — remove tags (body: { tag_ids: [...] })
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const body = await request.json();

  const entity = await queryOne(
    "SELECT id FROM entities WHERE slug = ?",
    [slug]
  ) as { id: string } | undefined;

  if (!entity) {
    return NextResponse.json({ error: "Entity not found" }, { status: 404 });
  }

  const { tag_ids } = body;
  if (!Array.isArray(tag_ids)) {
    return NextResponse.json({ error: "tag_ids array required" }, { status: 400 });
  }

  for (const tagId of tag_ids) {
    await execute(
      "DELETE FROM entity_tags WHERE entity_id = ? AND tag_id = ?",
      [entity.id, tagId]
    );
  }

  return NextResponse.json({ removed: tag_ids });
}
