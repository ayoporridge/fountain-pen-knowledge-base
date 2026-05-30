import { type NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { nanoid } from "nanoid";
import { recomputeAllConceptMatches } from "@/lib/concept-engine";

// GET /api/concepts — list all concept rules with match counts
export async function GET() {
  const db = getDb();

  const concepts = db
    .prepare(
      `SELECT cr.*, COUNT(cm.id) as match_count
       FROM concept_rules cr
       LEFT JOIN concept_matches cm ON cm.concept_id = cr.id
       GROUP BY cr.id
       ORDER BY cr.name`,
    )
    .all();

  return NextResponse.json(concepts);
}

// POST /api/concepts — create a new concept rule
export async function POST(request: NextRequest) {
  const db = getDb();
  const body = await request.json();
  const { name, slug, description, conditions } = body;

  if (!name || !slug || !conditions) {
    return NextResponse.json(
      { error: "name, slug, and conditions are required" },
      { status: 400 },
    );
  }

  const id = nanoid(12);

  try {
    db.prepare(
      "INSERT INTO concept_rules (id, name, slug, description, conditions) VALUES (?, ?, ?, ?, ?)",
    ).run(id, name, slug, description || null, JSON.stringify(conditions));

    // Recompute matches
    recomputeAllConceptMatches();

    const concept = db.prepare("SELECT * FROM concept_rules WHERE id = ?").get(id);
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
  const db = getDb();
  const id = request.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const result = db.prepare("DELETE FROM concept_rules WHERE id = ?").run(id);
  if (result.changes === 0) {
    return NextResponse.json({ error: "Concept not found" }, { status: 404 });
  }

  recomputeAllConceptMatches();
  return NextResponse.json({ success: true });
}
