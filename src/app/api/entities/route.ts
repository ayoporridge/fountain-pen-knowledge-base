import { type NextRequest, NextResponse } from "next/server";
import { queryAll, queryOne, execute } from "@/lib/db";
import { nanoid } from "nanoid";

// GET /api/entities?type=pen
export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type");

  // Single JOIN query instead of N+1
  let rows;
  if (type) {
    rows = await queryAll(
      `SELECT e.*, GROUP_CONCAT(ea.key || '::' || ea.value, '||') as attrs_raw
       FROM entities e
       LEFT JOIN entity_attributes ea ON ea.entity_id = e.id
       WHERE e.type = ?
       GROUP BY e.id
       ORDER BY e.name`,
      [type]
    );
  } else {
    rows = await queryAll(
      `SELECT e.*, GROUP_CONCAT(ea.key || '::' || ea.value, '||') as attrs_raw
       FROM entities e
       LEFT JOIN entity_attributes ea ON ea.entity_id = e.id
       GROUP BY e.id
       ORDER BY e.name`
    );
  }

  const entities = (rows as Array<Record<string, unknown>>).map((row) => {
    const raw = row.attrs_raw as string | null;
    const attributes: Record<string, string> = {};
    if (raw) {
      for (const pair of raw.split("||")) {
        const idx = pair.indexOf("::");
        if (idx > 0) {
          attributes[pair.slice(0, idx)] = pair.slice(idx + 2);
        }
      }
    }
    const { attrs_raw, ...rest } = row;
    return { ...rest, attributes };
  });

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
