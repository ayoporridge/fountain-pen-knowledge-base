import { type NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { nanoid } from "nanoid";

// GET /api/entities/[slug]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const db = getDb();
  const { slug } = await params;

  const entity = db
    .prepare("SELECT * FROM entities WHERE slug = ?")
    .get(slug) as Record<string, unknown> | undefined;

  if (!entity) {
    return NextResponse.json({ error: "Entity not found" }, { status: 404 });
  }

  const attrs = db
    .prepare("SELECT key, value FROM entity_attributes WHERE entity_id = ?")
    .all(entity.id) as Array<{ key: string; value: string }>;

  return NextResponse.json({
    ...entity,
    attributes: Object.fromEntries(attrs.map((a) => [a.key, a.value])),
  });
}

// PUT /api/entities/[slug]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const db = getDb();
  const { slug } = await params;
  const body = await request.json();

  const entity = db
    .prepare("SELECT * FROM entities WHERE slug = ?")
    .get(slug) as Record<string, unknown> | undefined;

  if (!entity) {
    return NextResponse.json({ error: "Entity not found" }, { status: 404 });
  }

  const { name, summary, body_md, type, source } = body;
  const now = new Date().toISOString();

  db.prepare(
    "UPDATE entities SET name = ?, summary = ?, body_md = ?, type = ?, source = ?, updated_at = ? WHERE slug = ?",
  ).run(
    name ?? entity.name,
    summary ?? entity.summary,
    body_md ?? entity.body_md,
    type ?? entity.type,
    source ?? entity.source,
    now,
    slug,
  );

  // Update attributes if provided
  if (body.attributes && typeof body.attributes === "object") {
    // Delete existing attributes and re-insert
    db.prepare("DELETE FROM entity_attributes WHERE entity_id = ?").run(
      entity.id,
    );
    const stmt = db.prepare(
      "INSERT INTO entity_attributes (id, entity_id, key, value) VALUES (?, ?, ?, ?)",
    );
    for (const [key, value] of Object.entries(body.attributes)) {
      stmt.run(nanoid(12), entity.id, key, String(value));
    }
  }

  const updated = db
    .prepare("SELECT * FROM entities WHERE slug = ?")
    .get(slug) as Record<string, unknown>;
  const attrs = db
    .prepare("SELECT key, value FROM entity_attributes WHERE entity_id = ?")
    .all(updated.id) as Array<{ key: string; value: string }>;

  return NextResponse.json({
    ...updated,
    attributes: Object.fromEntries(attrs.map((a) => [a.key, a.value])),
  });
}

// DELETE /api/entities/[slug]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const db = getDb();
  const { slug } = await params;

  const result = db
    .prepare("DELETE FROM entities WHERE slug = ?")
    .run(slug);

  if (result.changes === 0) {
    return NextResponse.json({ error: "Entity not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
