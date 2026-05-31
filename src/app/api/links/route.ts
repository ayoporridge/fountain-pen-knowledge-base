import { type NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { nanoid } from "nanoid";

// GET /api/links?entity_id=xxx — get all links for an entity
export async function GET(request: NextRequest) {
  const db = await getDb();
  const entityId = request.nextUrl.searchParams.get("entity_id");

  if (!entityId) {
    return NextResponse.json(
      { error: "entity_id is required" },
      { status: 400 },
    );
  }

  // Forward links: entity is source
  const forward = (await db
    .prepare(
      `SELECT el.*, e.slug as target_slug, e.name as target_name, e.type as target_type
       FROM entity_links el
       JOIN entities e ON e.id = el.target_id
       WHERE el.source_id = ? AND el.link_type != 'reverse'
       ORDER BY el.created_at`,
    )
    .bind(entityId)
    .all()).results;

  // Backlinks: entity is target (exclude reverse auto-generated)
  const backlinks = (await db
    .prepare(
      `SELECT el.*, e.slug as source_slug, e.name as source_name, e.type as source_type
       FROM entity_links el
       JOIN entities e ON e.id = el.source_id
       WHERE el.target_id = ? AND el.link_type != 'reverse'
       ORDER BY el.created_at`,
    )
    .bind(entityId)
    .all()).results;

  return NextResponse.json({ forward, backlinks });
}

// POST /api/links — create a link
export async function POST(request: NextRequest) {
  const db = await getDb();
  const body = await request.json() as Record<string, unknown>;
  const { source_id, target_id, link_type } = body as {
    source_id?: string; target_id?: string; link_type?: string;
  };

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
  const source = await db.prepare("SELECT id FROM entities WHERE id = ?").bind(source_id).first();
  const target = await db.prepare("SELECT id FROM entities WHERE id = ?").bind(target_id).first();

  if (!source || !target) {
    return NextResponse.json(
      { error: "Source or target entity not found" },
      { status: 404 },
    );
  }

  const id = nanoid(12);

  try {
    await db.prepare(
      "INSERT INTO entity_links (id, source_id, target_id, link_type) VALUES (?, ?, ?, ?)",
    ).bind(id, source_id, target_id, link_type || "related").run();

    const link = await db.prepare("SELECT * FROM entity_links WHERE id = ?").bind(id).first();
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
  const db = await getDb();
  const id = request.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const result = await db.prepare("DELETE FROM entity_links WHERE id = ?").bind(id).run();

  if (result.meta.changes === 0) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
