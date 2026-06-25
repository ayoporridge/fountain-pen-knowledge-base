import { createClient } from "@libsql/client";
import {
  getArticleLikeReasons,
  normalizeEntityName,
} from "../src/lib/entity-quality";

const LIMIT_ARG = process.argv.find((arg) => arg.startsWith("--limit="));
const LIMIT = LIMIT_ARG ? Number(LIMIT_ARG.split("=")[1]) : 20;
const JSON_OUTPUT = process.argv.includes("--json");

type EntityRow = {
  id: string;
  type: string;
  slug: string;
  name: string;
  summary: string | null;
  body_md: string | null;
  source_file: string | null;
  source_url: string | null;
  story_count: number;
  claim_count: number;
};

type DuplicateGroup = {
  key: string;
  entities: EntityRow[];
};

type SuspiciousEntity = {
  entity: EntityRow;
  reasons: string[];
};

function getClient() {
  if (process.env.TURSO_DATABASE_URL) {
    return createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return createClient({ url: "file:data/fpkg.db" });
}

function toEntity(row: EntityRow): EntityRow {
  return {
    ...row,
    story_count: Number(row.story_count || 0),
    claim_count: Number(row.claim_count || 0),
  };
}

function shortContentReasons(entity: EntityRow) {
  if (!["brand", "pen"].includes(entity.type)) return [];

  const reasons: string[] = [];
  const summaryLength = entity.summary?.trim().length || 0;
  const bodyLength = entity.body_md?.trim().length || 0;

  if (summaryLength < 12) reasons.push("short_summary");
  if (bodyLength < 80 && entity.story_count === 0) reasons.push("no_detail_body_or_story");
  if (entity.claim_count === 0) reasons.push("no_claims");

  return reasons;
}

function findDuplicateGroups(entities: EntityRow[]) {
  const groups = new Map<string, EntityRow[]>();

  for (const entity of entities) {
    const key = `${entity.type}:${normalizeEntityName(entity.name)}`;
    if (!key.endsWith(":")) {
      groups.set(key, [...(groups.get(key) || []), entity]);
    }
  }

  return [...groups.entries()]
    .filter(([, rows]) => rows.length > 1)
    .map(([key, rows]) => ({ key, entities: rows }))
    .sort((a, b) => b.entities.length - a.entities.length || a.key.localeCompare(b.key));
}

async function main() {
  const db = getClient();
  const limit = Number.isFinite(LIMIT) && LIMIT > 0 ? LIMIT : 20;
  const rows = await db.execute(`
    SELECT e.id, e.type, e.slug, e.name, e.summary, e.body_md, e.source_file, e.source_url,
           COUNT(DISTINCT s.id) as story_count,
           COUNT(DISTINCT c.id) as claim_count
    FROM entities e
    LEFT JOIN stories s ON s.entity_id = e.id
    LEFT JOIN claims c ON c.subject_entity_id = e.id
    GROUP BY e.id
    ORDER BY e.type, e.name
  `);
  const entities = rows.rows.map((row) => toEntity(row as unknown as EntityRow));

  const duplicateGroups = findDuplicateGroups(entities);
  const suspiciousPenArticles = entities
    .map((entity): SuspiciousEntity => ({ entity, reasons: getArticleLikeReasons(entity) }))
    .filter((item) => item.reasons.length > 0)
    .sort(
      (a, b) =>
        b.reasons.length - a.reasons.length ||
        b.entity.name.length - a.entity.name.length ||
        a.entity.name.localeCompare(b.entity.name),
    );
  const thinEntities = entities
    .map((entity): SuspiciousEntity => ({ entity, reasons: shortContentReasons(entity) }))
    .filter((item) => item.reasons.length >= 2)
    .sort(
      (a, b) =>
        b.reasons.length - a.reasons.length ||
        a.entity.type.localeCompare(b.entity.type) ||
        a.entity.name.localeCompare(b.entity.name),
    );
  const brokenLinks = await db.execute(`
    SELECT COUNT(*) as value
    FROM entity_links el
    LEFT JOIN entities se ON se.id = el.source_id
    LEFT JOIN entities te ON te.id = el.target_id
    WHERE se.id IS NULL OR te.id IS NULL OR el.source_id = el.target_id
  `);

  const report = {
    counts: {
      entities: entities.length,
      duplicateGroups: duplicateGroups.length,
      suspiciousPenArticles: suspiciousPenArticles.length,
      thinEntities: thinEntities.length,
      brokenLinks: Number(brokenLinks.rows[0]?.value || 0),
    },
    duplicateGroups: duplicateGroups.slice(0, limit),
    suspiciousPenArticles: suspiciousPenArticles.slice(0, limit),
    thinEntities: thinEntities.slice(0, limit),
  };

  if (JSON_OUTPUT) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log("Entity quality audit:");
  console.log(`  entities: ${report.counts.entities}`);
  console.log(`  duplicate name groups: ${report.counts.duplicateGroups}`);
  console.log(`  suspicious pen articles: ${report.counts.suspiciousPenArticles}`);
  console.log(`  thin brand/model entities: ${report.counts.thinEntities}`);
  console.log(`  broken/self links: ${report.counts.brokenLinks}`);

  console.log("\nSuspicious pen articles:");
  for (const item of report.suspiciousPenArticles) {
    console.log(
      `  - ${item.entity.name} (${item.entity.slug}) [${item.reasons.join(", ")}]`,
    );
  }

  console.log("\nDuplicate name groups:");
  for (const group of report.duplicateGroups) {
    console.log(`  - ${group.key}:`);
    for (const entity of group.entities) {
      console.log(`      ${entity.type}/${entity.slug} ${entity.name}`);
    }
  }

  console.log("\nThin brand/model entities:");
  for (const item of report.thinEntities) {
    console.log(
      `  - ${item.entity.type}/${item.entity.slug} ${item.entity.name} [${item.reasons.join(", ")}]`,
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
