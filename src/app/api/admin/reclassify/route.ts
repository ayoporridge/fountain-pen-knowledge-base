import { type NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/admin-auth";
import { execute, queryAll } from "@/lib/db";
import { shouldReclassifyPenArticle } from "@/lib/entity-quality";

export async function POST(request: NextRequest) {
  const deny = verifyAdminToken(request);
  if (deny) return deny;
  // Step 1: Reclassify concepts to articles
  const concepts = (await queryAll(
    "SELECT id, slug, name, summary, source_file, source_url FROM entities WHERE type = 'concept'",
  )) as Array<{
    id: string;
    slug: string;
    name: string;
    summary: string | null;
    source_file: string | null;
    source_url: string | null;
  }>;

  let reclassified = 0;
  let keptAsConcept = 0;

  for (const entity of concepts) {
    const isArticle =
      entity.source_file !== null ||
      entity.source_url !== null ||
      /^\d+[:-]/.test(entity.name) ||
      entity.slug.match(/^\d+-/) ||
      entity.summary?.includes("来源：") ||
      entity.summary?.startsWith("> 来源");

    if (isArticle) {
      await execute("UPDATE entities SET type = ? WHERE id = ?", [
        "article",
        entity.id,
      ]);
      reclassified++;
    } else {
      keptAsConcept++;
    }
  }

  const pens = (await queryAll(
    "SELECT id, slug, name, source_file, source_url FROM entities WHERE type = 'pen'",
  )) as Array<{
    id: string;
    slug: string;
    name: string;
    source_file: string | null;
    source_url: string | null;
  }>;

  let reclassifiedPens = 0;
  let keptAsPens = 0;

  for (const entity of pens) {
    if (shouldReclassifyPenArticle({ ...entity, type: "pen" })) {
      await execute(
        "UPDATE entities SET type = ?, updated_at = datetime('now') WHERE id = ?",
        ["article", entity.id],
      );
      await execute("DELETE FROM model_specs WHERE entity_id = ?", [entity.id]);
      reclassifiedPens++;
    } else {
      keptAsPens++;
    }
  }

  // Step 2: Get summary
  const stats = (await queryAll(
    "SELECT type, COUNT(*) as cnt FROM entities GROUP BY type ORDER BY cnt DESC",
  )) as Array<{ type: string; cnt: number }>;

  return NextResponse.json({
    reclassified,
    keptAsConcept,
    reclassifiedPens,
    keptAsPens,
    stats,
  });
}
