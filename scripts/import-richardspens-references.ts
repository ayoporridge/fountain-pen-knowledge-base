import { createHash } from "node:crypto";
import { createClient, type Client, type InArgs } from "@libsql/client";

const WRITE = process.argv.includes("--write");
const JSON_OUTPUT = process.argv.includes("--json");
const DB_URL = process.env.TURSO_DATABASE_URL || "file:data/fpkg.db";
const SOURCE_ID = "richardspens";

type DbValue = string | number | null;

type EntitySourceRow = {
  id: string;
  type: string;
  slug: string;
  name: string;
  summary: string | null;
  source_file: string | null;
  source_url: string;
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

function stableId(prefix: string, value: string) {
  return `${prefix}-${createHash("sha1").update(value).digest("hex").slice(0, 16)}`;
}

function cleanSummary(summary: string | null) {
  if (!summary) return null;
  const cleaned = summary
    .replace(/>\s*来源：?\s*\[[^\]]+\]\([^)]+\)/gi, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#*_`|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned ? cleaned.slice(0, 260) : null;
}

function inferItemType(row: EntitySourceRow) {
  const sourceFile = row.source_file || "";
  if (/修复|repair|adventures/i.test(sourceFile)) return "repair_article";
  if (/历史|history/i.test(sourceFile)) return "history_article";
  if (/经典型号档案|profiles/i.test(sourceFile)) return "profile_article";
  if (/笔尖|nib/i.test(sourceFile)) return "nib_reference";
  if (/上墨|fill/i.test(sourceFile)) return "filling_system_reference";
  return `${row.type}_reference`;
}

function inferRelationType(row: EntitySourceRow) {
  const sourceFile = row.source_file || "";
  if (/修复|repair|adventures/i.test(sourceFile)) return "repair";
  if (/历史|history|经典型号档案|profiles/i.test(sourceFile)) return "history";
  return "reference";
}

async function upsertSourceRegistry(db: Client) {
  await execute(
    db,
    `INSERT INTO source_registry
      (id, name, source_type, allowed_use, reliability, license, attribution, homepage_url, fetch_method, notes, last_checked_at, updated_at)
     VALUES (?, ?, 'blog', 'summary_only', 'high_for_model_history', ?, ?, ?, 'local_entity_metadata',
             ?, date('now'), datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      source_type = excluded.source_type,
      allowed_use = excluded.allowed_use,
      reliability = excluded.reliability,
      license = excluded.license,
      attribution = excluded.attribution,
      homepage_url = excluded.homepage_url,
      fetch_method = excluded.fetch_method,
      notes = excluded.notes,
      last_checked_at = excluded.last_checked_at,
      updated_at = datetime('now')`,
    [
      SOURCE_ID,
      "Richard's Pens",
      "copyrighted; summary/link only",
      "Richard Binder / richardspens.com",
      "https://www.richardspens.com/",
      "Imported only URL-level metadata from local entities. Do not copy source text or images; use as citation, summary, and reading-path index.",
    ],
  );
}

async function main() {
  const db = getClient();
  const rows = await db.execute(`
    SELECT id, type, slug, name, summary, source_file, source_url
    FROM entities
    WHERE source_url LIKE 'http%'
      AND source_url LIKE '%richardspens.com%'
    ORDER BY type, name
  `);
  const entities = rows.rows as unknown as EntitySourceRow[];

  const sourceItems = entities.map((entity) => {
    const sourceItemId = stableId("source-richardspens", entity.source_url);
    return {
      entity,
      sourceItemId,
      referenceId: stableId("ref-richardspens", `${entity.id}:${sourceItemId}`),
      itemType: inferItemType(entity),
      relationType: inferRelationType(entity),
      summary: cleanSummary(entity.summary),
    };
  });

  if (WRITE) {
    await upsertSourceRegistry(db);

    for (const item of sourceItems) {
      await execute(
        db,
        `INSERT INTO source_items
          (id, source_id, title, url, item_type, license, author, retrieved_at, summary, allowed_use, review_status, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, date('now'), ?, 'summary_only', 'pending', datetime('now'))
         ON CONFLICT(source_id, url) DO UPDATE SET
          title = excluded.title,
          item_type = excluded.item_type,
          license = excluded.license,
          author = excluded.author,
          retrieved_at = excluded.retrieved_at,
          summary = excluded.summary,
          allowed_use = excluded.allowed_use,
          review_status = excluded.review_status,
          updated_at = datetime('now')`,
        [
          item.sourceItemId,
          SOURCE_ID,
          item.entity.name,
          item.entity.source_url,
          item.itemType,
          "copyrighted; summary/link only",
          "Richard Binder / Richard's Pens",
          item.summary,
        ],
      );

      await execute(
        db,
        `INSERT INTO entity_references
          (id, entity_id, source_item_id, relation_type, note, review_status)
         VALUES (?, ?, ?, ?, ?, 'pending')
         ON CONFLICT(entity_id, source_item_id, relation_type) DO UPDATE SET
          note = excluded.note,
          review_status = excluded.review_status`,
        [
          item.referenceId,
          item.entity.id,
          item.sourceItemId,
          item.relationType,
          `Local entity ${item.entity.type}/${item.entity.slug} was imported from this Richard's Pens reference. Summary/link only; do not mirror source text or images.`,
        ],
      );
    }
  }

  const report = {
    mode: WRITE ? "write" : "dry-run",
    source: SOURCE_ID,
    candidateEntities: entities.length,
    sourceItems: sourceItems.length,
    sample: sourceItems.slice(0, 12).map((item) => ({
      entity: `${item.entity.type}/${item.entity.slug}`,
      title: item.entity.name,
      url: item.entity.source_url,
      itemType: item.itemType,
      relationType: item.relationType,
    })),
  };

  if (JSON_OUTPUT) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log(
    `${WRITE ? "Imported" : "Would import"} ${report.sourceItems} Richard's Pens reference item(s) for ${report.candidateEntities} entity/entities.`,
  );
  for (const item of report.sample) {
    console.log(
      `  - ${item.entity}: ${item.title} [${item.itemType}, ${item.relationType}]`,
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
