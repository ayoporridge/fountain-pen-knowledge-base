import { type NextRequest, NextResponse } from "next/server";
import { queryAll, queryOne, execute } from "@/lib/db";
import { nanoid } from "nanoid";

// GET /api/entities?type=pen
export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type");

  let rows;
  if (type) {
    rows = await queryAll("SELECT * FROM entities WHERE type = ? ORDER BY name", [type]);
  } else {
    rows = await queryAll("SELECT * FROM entities ORDER BY name");
  }

  // Fetch attributes for each entity
  const entities = [];
  for (const row of rows as Array<Record<string, unknown>>) {
    const attrs = await queryAll(
      "SELECT key, value FROM entity_attributes WHERE entity_id = ?",
      [row.id]
    ) as Array<{ key: string; value: string }>;
    entities.push({
      ...row,
      attributes: Object.fromEntries(attrs.map((a) => [a.key, a.value])),
    });
  }

  return NextResponse.json(entities);
}

// POST /api/entities
export async function POST(request: NextRequest) {
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
    await execute(
      "INSERT INTO entities (id, type, slug, name, summary, body_md, source, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [id, type, slug, name, summary || null, body_md || null, source || null, now, now]
    );

    // Insert attributes
    if (attributes && typeof attributes === "object") {
      for (const [key, value] of Object.entries(attributes)) {
        await execute(
          "INSERT INTO entity_attributes (id, entity_id, key, value) VALUES (?, ?, ?, ?)",
          [nanoid(12), id, key, String(value)]
        );
      }
    }

    const entity = await queryOne("SELECT * FROM entities WHERE id = ?", [id]);
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
