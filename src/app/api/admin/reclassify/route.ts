import { type NextRequest, NextResponse } from "next/server";
import { queryAll, queryOne, execute } from "@/lib/db";
import { verifyAdminToken } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  const deny = verifyAdminToken(request);
  if (deny) return deny;
  // Step 1: Reclassify concepts to articles
  const concepts = await queryAll(
    "SELECT id, slug, name, summary, source_file, source_url FROM entities WHERE type = 'concept'"
  ) as Array<{
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
      /^\d+[:\-]/.test(entity.name) ||
      entity.slug.match(/^\d+-/) ||
      (entity.summary && entity.summary.includes("来源：")) ||
      (entity.summary && entity.summary.startsWith("> 来源"));

    if (isArticle) {
      await execute("UPDATE entities SET type = ? WHERE id = ?", ["article", entity.id]);
      reclassified++;
    } else {
      keptAsConcept++;
    }
  }

  // Step 2: Get summary
  const stats = await queryAll(
    "SELECT type, COUNT(*) as cnt FROM entities GROUP BY type ORDER BY cnt DESC"
  ) as Array<{ type: string; cnt: number }>;

  return NextResponse.json({
    reclassified,
    keptAsConcept,
    stats,
  });
}
