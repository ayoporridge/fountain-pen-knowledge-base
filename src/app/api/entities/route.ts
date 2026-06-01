import { type NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { nanoid } from "nanoid";

// GET /api/entities?type=pen
export async function GET(request: NextRequest) {
  const db = getDb();
  const type = request.nextUrl.searchParams.get("type");

  let rows;
  if (type) {
    rows = db
      .prepare("SELECT * FROM entities WHERE type = ? ORDER BY name")
      .all(type);
  } else {
    rows = db.prepare("SELECT * FROM entities ORDER BY name").all();
  }

  // Fetch attributes for each entity
  const entities = (rows as Array<Record<string, unknown>>).map((row) => {
    const attrs = db
      .prepare("SELECT key, value FROM entity_attributes WHERE entity_id = ?")
      .all(row.id) as Array<{ key: string; value: string }>;
    return {
      ...row,
      attributes: Object.fromEntries(attrs.map((a) => [a.key, a.value])),
    };
  });

  return NextResponse.json(entities);
}

// POST /api/entities
export async function POST(request: NextRequest) {
  const db = getDb();
  const body = await request.json();
  const { type, slug, name, summary, body_md, source, attributes } = body;

  if (!type || !slug || !name) {
    return NextResponse.json(
      { error: "type, slug, and name are required" },
      { status: 400 },
    );
  }

  const id = nanoid(12);
  const now = new Date().toISOString();

  try {
    db.prepare(
      "INSERT INTO entities (id, type, slug, name, summary, body_md, source, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    ).run(id, type, slug, name, summary || null, body_md || null, source || null, now, now);

    // Insert attributes
    if (attributes && typeof attributes === "object") {
      const stmt = db.prepare(
        "INSERT INTO entity_attributes (id, entity_id, key, value) VALUES (?, ?, ?, ?)",
      );
      for (const [key, value] of Object.entries(attributes)) {
        stmt.run(nanoid(12), id, key, String(value));
      }
    }

    const entity = db.prepare("SELECT * FROM entities WHERE id = ?").get(id);
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
