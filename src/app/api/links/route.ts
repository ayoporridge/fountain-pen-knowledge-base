import { type NextRequest, NextResponse } from "next/server";
import { queryAll, queryOne, execute } from "@/lib/db";
import { nanoid } from "nanoid";

// GET /api/links?entity_id=xxx — get all links for an entity
export async function GET(request: NextRequest) {
  const entityId = request.nextUrl.searchParams.get("entity_id");

  if (!entityId) {
    return NextResponse.json(
      { error: "entity_id is required" },
      { status: 400 },
    );
  }

  // Forward links: entity is source
  const forward = await queryAll(
    `SELECT el.*, e.slug as target_slug, e.name as target_name, e.type as target_type
     FROM entity_links el
     JOIN entities e ON e.id = el.target_id
     WHERE el.source_id = ? AND el.link_type != 'reverse'
     ORDER BY el.created_at`,
    [entityId]
  );

  // Backlinks: entity is target
  const backlinks = await queryAll(
    `SELECT el.*, e.slug as source_slug, e.name as source_name, e.type as source_type
     FROM entity_links el
     JOIN entities e ON e.id = el.source_id
     WHERE el.target_id = ? AND el.link_type != 'reverse'
     ORDER BY el.created_at`,
    [entityId]
  );

  return NextResponse.json({ forward, backlinks });
}

// POST /api/links — create a link
export async function POST(request: NextRequest) {
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
  const source = await queryOne("SELECT id FROM entities WHERE id = ?", [source_id]);
  const target = await queryOne("SELECT id FROM entities WHERE id = ?", [target_id]);

  if (!source || !target) {
    return NextResponse.json(
      { error: "Source or target entity not found" },
      { status: 404 },
    );
  }

  const id = nanoid(12);

  try {
    await execute(
      "INSERT INTO entity_links (id, source_id, target_id, link_type) VALUES (?, ?, ?, ?)",
      [id, source_id, target_id, link_type || "related"]
    );

    const link = await queryOne("SELECT * FROM entity_links WHERE id = ?", [id]);
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

// DELETE /api/links?id=xxx — delete a link
export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  // Check if link exists
  const link = await queryOne("SELECT id FROM entity_links WHERE id = ?", [id]);
  if (!link) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }

  await execute("DELETE FROM entity_links WHERE id = ?", [id]);
  return NextResponse.json({ success: true });
}
