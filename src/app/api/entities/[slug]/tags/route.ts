import { type NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { nanoid } from "nanoid";

// GET /api/entities/[slug]/tags
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const db = getDb();
  const { slug } = await params;

  const entity = db
    .prepare("SELECT id FROM entities WHERE slug = ?")
    .get(slug) as { id: string } | undefined;

  if (!entity) {
    return NextResponse.json({ error: "Entity not found" }, { status: 404 });
  }

  const tags = db
    .prepare(
      `SELECT t.* FROM tags t
       JOIN entity_tags et ON et.tag_id = t.id
       WHERE et.entity_id = ?
       ORDER BY t.dimension, t.name`,
    )
    .all(entity.id);

  return NextResponse.json(tags);
}

// POST /api/entities/[slug]/tags  — add tags (body: { tag_ids: [...] })
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const db = getDb();
  const { slug } = await params;
  const body = await request.json();

  const entity = db
    .prepare("SELECT id FROM entities WHERE slug = ?")
    .get(slug) as { id: string } | undefined;

  if (!entity) {
    return NextResponse.json({ error: "Entity not found" }, { status: 404 });
  }

  const { tag_ids } = body;
  if (!Array.isArray(tag_ids)) {
    return NextResponse.json({ error: "tag_ids array required" }, { status: 400 });
  }

  const stmt = db.prepare(
    "INSERT OR IGNORE INTO entity_tags (id, entity_id, tag_id) VALUES (?, ?, ?)",
  );
  const added: string[] = [];
  for (const tagId of tag_ids) {
    const result = stmt.run(nanoid(12), entity.id, tagId);
    if (result.changes > 0) added.push(tagId);
  }

  return NextResponse.json({ added });
}

// DELETE /api/entities/[slug]/tags — remove tags (body: { tag_ids: [...] })
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const db = getDb();
  const { slug } = await params;
  const body = await request.json();

  const entity = db
    .prepare("SELECT id FROM entities WHERE slug = ?")
    .get(slug) as { id: string } | undefined;

  if (!entity) {
    return NextResponse.json({ error: "Entity not found" }, { status: 404 });
  }

  const { tag_ids } = body;
  if (!Array.isArray(tag_ids)) {
    return NextResponse.json({ error: "tag_ids array required" }, { status: 400 });
  }

  const stmt = db.prepare(
    "DELETE FROM entity_tags WHERE entity_id = ? AND tag_id = ?",
  );
  for (const tagId of tag_ids) {
    stmt.run(entity.id, tagId);
  }

  return NextResponse.json({ removed: tag_ids });
}
