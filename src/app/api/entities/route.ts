import { type NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { nanoid } from "nanoid";

// GET /api/entities?type=pen
export async function GET(request: NextRequest) {
  const db = await getDb();
  const type = request.nextUrl.searchParams.get("type");

  let rows;
  if (type) {
    rows = (await db
      .prepare("SELECT * FROM entities WHERE type = ? ORDER BY name")
      .bind(type)
      .all()).results;
  } else {
    rows = (await db.prepare("SELECT * FROM entities ORDER BY name").all()).results;
  }

  // Fetch attributes for each entity
  const entities = [];
  for (const row of rows as Array<Record<string, unknown>>) {
    const attrs = (await db
      .prepare("SELECT key, value FROM entity_attributes WHERE entity_id = ?")
      .bind(row.id)
      .all()).results as Array<{ key: string; value: string }>;
    entities.push({
      ...row,
      attributes: Object.fromEntries(attrs.map((a) => [a.key, a.value])),
    });
  }

  return NextResponse.json(entities);
}

// POST /api/entities
export async function POST(request: NextRequest) {
  const db = await getDb();
  const body = await request.json() as Record<string, unknown>;
  const { type, slug, name, summary, body_md, source, attributes } = body as {
    type?: string; slug?: string; name?: string; summary?: string;
    body_md?: string; source?: string; attributes?: Record<string, unknown>;
  };

  if (!type || !slug || !name) {
    return NextResponse.json(
      { error: "type, slug, and name are required" },
      { status: 400 },
    );
  }

  const id = nanoid(12);
  const now = new Date().toISOString();

  try {
    await db.prepare(
      "INSERT INTO entities (id, type, slug, name, summary, body_md, source, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    ).bind(id, type, slug, name, summary || null, body_md || null, source || null, now, now).run();

    // Insert attributes
    if (attributes && typeof attributes === "object") {
      for (const [key, value] of Object.entries(attributes)) {
        await db.prepare(
          "INSERT INTO entity_attributes (id, entity_id, key, value) VALUES (?, ?, ?, ?)",
        ).bind(nanoid(12), id, key, String(value)).run();
      }
    }

    const entity = await db.prepare("SELECT * FROM entities WHERE id = ?").bind(id).first();
    return NextResponse.json(entity, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("UNIQUE constraint failed: entities.slug")) {
      return NextResponse.json(
        { error: `Slug '${slug}' already exists` },
        { status: 409 },
      );
    }
    throw err;
  }
}
