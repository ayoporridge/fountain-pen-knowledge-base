import { nanoid } from "nanoid";
import { type NextRequest, NextResponse } from "next/server";
import { verifyWriteAccess } from "@/lib/admin-auth";
import { execute, queryAll, queryOne } from "@/lib/db";
import { cleanPublicText } from "@/lib/publicText";

export const dynamic = "force-dynamic";

const NO_STORE_HEADERS = { "Cache-Control": "no-store" } as const;

// GET /api/entities?type=pen
export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type");

  let rows: unknown[];
  if (type) {
    rows = await queryAll(
      `SELECT type, slug, name, summary
       FROM public_entities
       WHERE type = ?
       ORDER BY name`,
      [type],
    );
  } else {
    rows = await queryAll(
      `SELECT type, slug, name, summary
       FROM public_entities
       ORDER BY name`,
    );
  }

  const entities = (rows as Array<Record<string, unknown>>).map((row) => ({
    type: row.type,
    slug: row.slug,
    name: row.name,
    summary: ["pen", "brand"].includes(String(row.type))
      ? null
      : cleanPublicText(row.summary),
  }));

  return NextResponse.json(entities, { headers: NO_STORE_HEADERS });
}

// POST /api/entities
export async function POST(request: NextRequest) {
  const deny = verifyWriteAccess(request);
  if (deny) return deny;

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
      [
        id,
        type,
        slug,
        name,
        summary || null,
        body_md || null,
        source || null,
        now,
        now,
      ],
    );

    // Insert attributes
    if (attributes && typeof attributes === "object") {
      for (const [key, value] of Object.entries(attributes)) {
        await execute(
          "INSERT INTO entity_attributes (id, entity_id, key, value) VALUES (?, ?, ?, ?)",
          [nanoid(12), id, key, String(value)],
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
