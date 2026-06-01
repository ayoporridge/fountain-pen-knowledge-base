import { type NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { nanoid } from "nanoid";

// GET /api/links?entity_id=xxx — get all links for an entity
export async function GET(request: NextRequest) {
  const db = getDb();
  const entityId = request.nextUrl.searchParams.get("entity_id");

  if (!entityId) {
    return NextResponse.json(
      { error: "entity_id is required" },
      { status: 400 },
    );
  }

  // Forward links: entity is source
  const forward = db
    .prepare(
      `SELECT el.*, e.slug as target_slug, e.name as target_name, e.type as target_type
       FROM entity_links el
       JOIN entities e ON e.id = el.target_id
       WHERE el.source_id = ? AND el.link_type != 'reverse'
       ORDER BY el.created_at`,
    )
    .all(entityId);

  // Backlinks: entity is target (exclude reverse auto-generated)
  const backlinks = db
    .prepare(
      `SELECT el.*, e.slug as source_slug, e.name as source_name, e.type as source_type
       FROM entity_links el
       JOIN entities e ON e.id = el.source_id
       WHERE el.target_id = ? AND el.link_type != 'reverse'
       ORDER BY el.created_at`,
    )
    .all(entityId);

  return NextResponse.json({ forward, backlinks });
}

// POST /api/links — create a link
export async function POST(request: NextRequest) {
  const db = getDb();
  const body = await request.json();
  const { source_id, target_id, link_type } = body;

  if (!source_id || !target_id) {
    return NextResponse.json(
      { error: "source_id and target_id are required" },
      { status: 400 },
    );
  }

  if (source_id === target_id) {
    return NextResponse.json(
      { error: "Cannot create self-link" },
      { status: 400 },
    );
  }

  // Verify both entities exist
  const source = db.prepare("SELECT id FROM entities WHERE id = ?").get(source_id);
  const target = db.prepare("SELECT id FROM entities WHERE id = ?").get(target_id);

  if (!source || !target) {
    return NextResponse.json(
      { error: "Source or target entity not found" },
      { status: 404 },
    );
  }

  const id = nanoid(12);

  try {
    db.prepare(
      "INSERT INTO entity_links (id, source_id, target_id, link_type) VALUES (?, ?, ?, ?)",
    ).run(id, source_id, target_id, link_type || "related");

    const link = db.prepare("SELECT * FROM entity_links WHERE id = ?").get(id);
    return NextResponse.json(link, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("UNIQUE constraint failed")) {
      return NextResponse.json(
        { error: "Link already exists" },
        { status: 409 },
      );
    }
    if (message.includes("Cannot create self-link")) {
      return NextResponse.json(
        { error: "Cannot create self-link" },
        { status: 400 },
      );
    }
    throw err;
  }
}

// DELETE /api/links?id=xxx — delete a link (and its reverse)
export async function DELETE(request: NextRequest) {
  const db = getDb();
  const id = request.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const result = db.prepare("DELETE FROM entity_links WHERE id = ?").run(id);

  if (result.changes === 0) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
