import { type NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { nanoid } from "nanoid";

// GET /api/tags?dimension=nib_type
export async function GET(request: NextRequest) {
  const db = await getDb();
  const dimension = request.nextUrl.searchParams.get("dimension");
  const level = request.nextUrl.searchParams.get("level");

  let sql = "SELECT * FROM tags";
  const conditions: string[] = [];
  const bindParams: string[] = [];

  if (dimension) {
    conditions.push("dimension = ?");
    bindParams.push(dimension);
  }
  if (level) {
    conditions.push("level = ?");
    bindParams.push(level);
  }

  if (conditions.length > 0) {
    sql += " WHERE " + conditions.join(" AND ");
  }
  sql += " ORDER BY dimension, name";

  const stmt = db.prepare(sql);
  const bound = bindParams.length > 0 ? stmt.bind(...bindParams) : stmt;
  const tags = (await bound.all()).results;
  return NextResponse.json(tags);
}

// POST /api/tags
export async function POST(request: NextRequest) {
  const db = await getDb();
  const body = await request.json() as Record<string, unknown>;
  const { name, slug, dimension, level, description } = body as {
    name?: string; slug?: string; dimension?: string; level?: string; description?: string;
  };

  if (!name || !slug || !dimension || !level) {
    return NextResponse.json(
      { error: "name, slug, dimension, and level are required" },
      { status: 400 },
    );
  }

  const id = nanoid(12);

  try {
    await db.prepare(
      "INSERT INTO tags (id, name, slug, dimension, level, description) VALUES (?, ?, ?, ?, ?, ?)",
    ).bind(id, name, slug, dimension, level, description || null).run();

    const tag = await db.prepare("SELECT * FROM tags WHERE id = ?").bind(id).first();
    return NextResponse.json(tag, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("UNIQUE constraint failed: tags.slug")) {
      return NextResponse.json(
        { error: `Tag slug '${slug}' already exists` },
        { status: 409 },
      );
    }
    throw err;
  }
}
