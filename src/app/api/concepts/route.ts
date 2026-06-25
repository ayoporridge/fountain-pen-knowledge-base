import { nanoid } from "nanoid";
import { type NextRequest, NextResponse } from "next/server";
import { verifyWriteAccess } from "@/lib/admin-auth";
import { recomputeAllConceptMatches } from "@/lib/concept-engine";
import { execute, queryAll, queryOne } from "@/lib/db";

// GET /api/concepts — list all concept rules with match counts
export async function GET() {
  const concepts = await queryAll(
    `SELECT cr.*, COUNT(cm.id) as match_count
     FROM concept_rules cr
     LEFT JOIN concept_matches cm ON cm.concept_id = cr.id
     GROUP BY cr.id
     ORDER BY cr.name`,
  );

  return NextResponse.json(concepts);
}

// POST /api/concepts — create a new concept rule
export async function POST(request: NextRequest) {
  const deny = verifyWriteAccess(request);
  if (deny) return deny;

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
    await execute(
      "INSERT INTO concept_rules (id, name, slug, description, conditions) VALUES (?, ?, ?, ?, ?)",
      [id, name, slug, description || null, JSON.stringify(conditions)],
    );

    // Recompute matches
    await recomputeAllConceptMatches();

    const concept = await queryOne("SELECT * FROM concept_rules WHERE id = ?", [
      id,
    ]);
    return NextResponse.json(concept, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("UNIQUE")) {
      return NextResponse.json(
        { error: "Concept slug already exists" },
        { status: 409 },
      );
    }
    throw err;
  }
}

// DELETE /api/concepts?id=xxx
export async function DELETE(request: NextRequest) {
  const deny = verifyWriteAccess(request);
  if (deny) return deny;

  const id = request.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  // Check if concept exists
  const concept = await queryOne("SELECT id FROM concept_rules WHERE id = ?", [
    id,
  ]);
  if (!concept) {
    return NextResponse.json({ error: "Concept not found" }, { status: 404 });
  }

  await execute("DELETE FROM concept_rules WHERE id = ?", [id]);
  await recomputeAllConceptMatches();
  return NextResponse.json({ success: true });
}
