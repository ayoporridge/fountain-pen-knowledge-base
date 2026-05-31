import { type NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { nanoid } from "nanoid";

// GET /api/entities/[slug]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const db = await getDb();
  const { slug } = await params;

  const entity = await db
    .prepare("SELECT * FROM entities WHERE slug = ?")
    .bind(slug)
    .first() as Record<string, unknown> | null;

  if (!entity) {
    return NextResponse.json({ error: "Entity not found" }, { status: 404 });
  }

  const attrs = (await db
    .prepare("SELECT key, value FROM entity_attributes WHERE entity_id = ?")
    .bind(entity.id)
    .all()).results as Array<{ key: string; value: string }>;

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
  const db = await getDb();
  const { slug } = await params;
  const body = await request.json() as Record<string, unknown>;

  const entity = await db
    .prepare("SELECT * FROM entities WHERE slug = ?")
    .bind(slug)
    .first() as Record<string, unknown> | null;

  if (!entity) {
    return NextResponse.json({ error: "Entity not found" }, { status: 404 });
  }

  const { name, summary, body_md, type, source } = body as {
    name?: string; summary?: string; body_md?: string; type?: string; source?: string;
    attributes?: Record<string, unknown>;
  };
  const now = new Date().toISOString();

  await db.prepare(
    "UPDATE entities SET name = ?, summary = ?, body_md = ?, type = ?, source = ?, updated_at = ? WHERE slug = ?",
  ).bind(
    name ?? entity.name,
    summary ?? entity.summary,
    body_md ?? entity.body_md,
    type ?? entity.type,
    source ?? entity.source,
    now,
    slug,
  ).run();

  // Update attributes if provided
  if (body.attributes && typeof body.attributes === "object") {
    // Delete existing attributes and re-insert
    await db.prepare("DELETE FROM entity_attributes WHERE entity_id = ?").bind(
      entity.id,
    ).run();
    for (const [key, value] of Object.entries(body.attributes)) {
      await db.prepare(
        "INSERT INTO entity_attributes (id, entity_id, key, value) VALUES (?, ?, ?, ?)",
      ).bind(nanoid(12), entity.id, key, String(value)).run();
    }
  }

  const updated = await db
    .prepare("SELECT * FROM entities WHERE slug = ?")
    .bind(slug)
    .first() as Record<string, unknown>;
  const attrs = (await db
    .prepare("SELECT key, value FROM entity_attributes WHERE entity_id = ?")
    .bind(updated.id)
    .all()).results as Array<{ key: string; value: string }>;

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
  const db = await getDb();
  const { slug } = await params;

  const result = await db
    .prepare("DELETE FROM entities WHERE slug = ?")
    .bind(slug)
    .run();

  if (result.meta.changes === 0) {
    return NextResponse.json({ error: "Entity not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
