import { nanoid } from "nanoid";
import { type NextRequest, NextResponse } from "next/server";
import { verifyWriteAccess } from "@/lib/admin-auth";
import { execute, queryOne } from "@/lib/db";

// Tag IDs, slugs and dimensions are editorial implementation details.
export async function GET() {
  return NextResponse.json(
    { error: "This endpoint is not available in the public archive." },
    { status: 410 },
  );
}

// POST /api/tags
export async function POST(request: NextRequest) {
  const deny = verifyWriteAccess(request);
  if (deny) return deny;

  const body = await request.json();
  const { name, slug, dimension, level, description } = body;

  if (!name || !slug || !dimension || !level) {
    return NextResponse.json(
      { error: "name, slug, dimension, and level are required" },
      { status: 400 },
    );
  }

  const id = nanoid(12);

  try {
    await execute(
      "INSERT INTO tags (id, name, slug, dimension, level, description) VALUES (?, ?, ?, ?, ?, ?)",
      [id, name, slug, dimension, level, description || null],
    );

    const tag = await queryOne("SELECT * FROM tags WHERE id = ?", [id]);
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
