import { type NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { nanoid } from "nanoid";
import { recomputeAllConceptMatches } from "@/lib/concept-engine";

// GET /api/concepts — list all concept rules with match counts
export async function GET() {
  const db = await getDb();

  const concepts = (await db
    .prepare(
      `SELECT cr.*, COUNT(cm.id) as match_count
       FROM concept_rules cr
       LEFT JOIN concept_matches cm ON cm.concept_id = cr.id
       GROUP BY cr.id
       ORDER BY cr.name`,
    )
    .all()).results;

  return NextResponse.json(concepts);
}

// POST /api/concepts — create a new concept rule
export async function POST(request: NextRequest) {
  const db = await getDb();
  const body = await request.json() as Record<string, unknown>;
  const { name, slug, description, conditions } = body as {
    name?: string; slug?: string; description?: string; conditions?: unknown;
  };

  if (!name || !slug || !conditions) {
    return NextResponse.json(
      { error: "name, slug, and conditions are required" },
      { status: 400 },
    );
  }

  const id = nanoid(12);

  try {
    await db.prepare(
      "INSERT INTO concept_rules (id, name, slug, description, conditions) VALUES (?, ?, ?, ?, ?)",
    ).bind(id, name, slug, description || null, JSON.stringify(conditions)).run();

    // Recompute matches
    await recomputeAllConceptMatches();

    const concept = await db.prepare("SELECT * FROM concept_rules WHERE id = ?").bind(id).first();
    return NextResponse.json(concept, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("UNIQUE")) {
      return NextResponse.json({ error: "Concept slug already exists" }, { status: 409 });
    }
    throw err;
  }
}

// DELETE /api/concepts?id=xxx
export async function DELETE(request: NextRequest) {
  const db = await getDb();
  const id = request.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const result = await db.prepare("DELETE FROM concept_rules WHERE id = ?").bind(id).run();
  if (result.meta.changes === 0) {
    return NextResponse.json({ error: "Concept not found" }, { status: 404 });
  }

  await recomputeAllConceptMatches();
  return NextResponse.json({ success: true });
}
