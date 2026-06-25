import { createClient, type Client, type InArgs } from "@libsql/client";
import {
  getArticleLikeReasons,
  shouldReclassifyPenArticle,
} from "../src/lib/entity-quality";

const WRITE = process.argv.includes("--write");
const JSON_OUTPUT = process.argv.includes("--json");
const DB_URL = process.env.TURSO_DATABASE_URL || "file:data/fpkg.db";

type DbValue = string | number | null;

type EntityRow = {
  id: string;
  type: string;
  slug: string;
  name: string;
  source_file: string | null;
  source_url: string | null;
  model_spec_count: number;
};

function getClient() {
  if (process.env.TURSO_DATABASE_URL) {
    return createClient({
      url: DB_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return createClient({ url: DB_URL });
}

async function execute(db: Client, sql: string, args: DbValue[] = []) {
  await db.execute({ sql, args: args as InArgs });
}

async function main() {
  const db = getClient();
  const rows = await db.execute(`
    SELECT e.id, e.type, e.slug, e.name, e.source_file, e.source_url,
           COUNT(DISTINCT ms.id) as model_spec_count
    FROM entities e
    LEFT JOIN model_specs ms ON ms.entity_id = e.id
    WHERE e.type = 'pen'
    GROUP BY e.id
    ORDER BY e.name
  `);

  const candidates = rows.rows
    .map((row) => {
      const entity = {
        ...row,
        model_spec_count: Number(row.model_spec_count || 0),
      } as unknown as EntityRow;
      return {
        entity,
        reasons: getArticleLikeReasons(entity),
        reclassify: shouldReclassifyPenArticle(entity),
      };
    })
    .filter((item) => item.reclassify);

  if (WRITE) {
    for (const item of candidates) {
      await execute(
        db,
        "UPDATE entities SET type = 'article', updated_at = datetime('now') WHERE id = ? AND type = 'pen'",
        [item.entity.id],
      );
      if (item.entity.model_spec_count > 0) {
        await execute(db, "DELETE FROM model_specs WHERE entity_id = ?", [
          item.entity.id,
        ]);
      }
    }
  }

  const report = {
    mode: WRITE ? "write" : "dry-run",
    candidates: candidates.map((item) => ({
      slug: item.entity.slug,
      name: item.entity.name,
      source_file: item.entity.source_file,
      source_url: item.entity.source_url,
      model_spec_count: item.entity.model_spec_count,
      reasons: item.reasons,
    })),
  };

  if (JSON_OUTPUT) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log(
    `${WRITE ? "Reclassified" : "Would reclassify"} ${candidates.length} pen article candidate(s).`,
  );
  for (const candidate of report.candidates) {
    console.log(
      `  - ${candidate.name} (${candidate.slug}) [${candidate.reasons.join(", ")}]`,
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
