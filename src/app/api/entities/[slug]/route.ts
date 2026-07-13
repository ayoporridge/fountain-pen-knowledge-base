import { nanoid } from "nanoid";
import { type NextRequest, NextResponse } from "next/server";
import { verifyAdminToken, verifyWriteAccess } from "@/lib/admin-auth";
import { execute, queryAll, queryOne } from "@/lib/db";
import { publicEntityFilter } from "@/lib/public-visibility";
import { cleanPublicText } from "@/lib/publicText";

// GET /api/entities/[slug]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const entity = (await queryOne(
    `SELECT e.id, e.type, e.slug, e.name, e.summary FROM entities e
     WHERE e.slug = ? AND ${publicEntityFilter("e")}`,
    [slug],
  )) as Record<string, unknown> | undefined;

  if (!entity) {
    return NextResponse.json({ error: "Entity not found" }, { status: 404 });
  }

  return NextResponse.json({
    type: entity.type,
    slug: entity.slug,
    name: entity.name,
    summary: ["pen", "brand"].includes(String(entity.type))
      ? null
      : cleanPublicText(entity.summary),
  });
}

// PUT /api/entities/[slug]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const deny = verifyWriteAccess(request);
  if (deny) return deny;

  const { slug } = await params;
  const body = await request.json();

  const entity = (await queryOne("SELECT * FROM entities WHERE slug = ?", [
    slug,
  ])) as Record<string, unknown> | undefined;

  if (!entity) {
    return NextResponse.json({ error: "Entity not found" }, { status: 404 });
  }

  const { name, summary, body_md, type, source } = body;
  const now = new Date().toISOString();

  await execute(
    "UPDATE entities SET name = ?, summary = ?, body_md = ?, type = ?, source = ?, updated_at = ? WHERE slug = ?",
    [
      name ?? entity.name,
      summary ?? entity.summary,
      body_md ?? entity.body_md,
      type ?? entity.type,
      source ?? entity.source,
      now,
      slug,
    ],
  );

  // Update attributes if provided
  if (body.attributes && typeof body.attributes === "object") {
    await execute("DELETE FROM entity_attributes WHERE entity_id = ?", [
      entity.id,
    ]);
    for (const [key, value] of Object.entries(body.attributes)) {
      await execute(
        "INSERT INTO entity_attributes (id, entity_id, key, value) VALUES (?, ?, ?, ?)",
        [nanoid(12), entity.id, key, String(value)],
      );
    }
  }

  const updated = (await queryOne("SELECT * FROM entities WHERE slug = ?", [
    slug,
  ])) as Record<string, unknown>;
  const attrs = (await queryAll(
    "SELECT key, value FROM entity_attributes WHERE entity_id = ?",
    [updated.id],
  )) as Array<{ key: string; value: string }>;

  return NextResponse.json({
    ...updated,
    attributes: Object.fromEntries(attrs.map((a) => [a.key, a.value])),
  });
}

// DELETE /api/entities/[slug]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const deny = verifyAdminToken(request);
  if (deny) return deny;

  const { slug } = await params;

  // Check if entity exists first
  const entity = await queryOne("SELECT id FROM entities WHERE slug = ?", [
    slug,
  ]);
  if (!entity) {
    return NextResponse.json({ error: "Entity not found" }, { status: 404 });
  }

  await execute("DELETE FROM entities WHERE slug = ?", [slug]);
  return NextResponse.json({ success: true });
}
