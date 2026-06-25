import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createClient, type Client, type InArgs } from "@libsql/client";

const MIGRATIONS_DIR = path.join(process.cwd(), "migrations");
const WRITE = process.argv.includes("--write");
const LIMIT_ARG = process.argv.find((arg) => arg.startsWith("--limit="));
const execFileAsync = promisify(execFile);
const USER_AGENT = "fountain-pen-graph-library/0.1 local enrichment script";

type BrandQuery = {
  slug: string;
  type: "brand";
  search: string;
  qid?: string;
};

const BRAND_QUERIES: BrandQuery[] = [
  { slug: "pilot", type: "brand", search: "Pilot Corporation", qid: "Q1356034" },
  { slug: "lamy", type: "brand", search: "Lamy", qid: "Q637707" },
  { slug: "pelikan", type: "brand", search: "Pelikan Holding", qid: "Q202133" },
  { slug: "parker", type: "brand", search: "Parker Pen Company", qid: "Q546004" },
  { slug: "sailor", type: "brand", search: "Sailor Pen", qid: "Q11314885" },
  { slug: "platinum", type: "brand", search: "Platinum Pen", qid: "Q11335482" },
  {
    slug: "montblanc",
    type: "brand",
    search: "Montblanc International",
    qid: "Q142691",
  },
  { slug: "waterman", type: "brand", search: "Waterman Pen Company", qid: "Q998257" },
  { slug: "sheaffer", type: "brand", search: "Sheaffer", qid: "Q3481686" },
  {
    slug: "aurora",
    type: "brand",
    search: "Aurora pen manufacturer",
    qid: "Q1070672",
  },
  { slug: "kaweco", type: "brand", search: "Kaweco", qid: "Q573333" },
  {
    slug: "faber-castell",
    type: "brand",
    search: "Faber-Castell",
    qid: "Q455476",
  },
  {
    slug: "cross",
    type: "brand",
    search: "A. T. Cross Company",
    qid: "Q4119347",
  },
  { slug: "mg", type: "brand", search: "M&G Stationery", qid: "Q16460137" },
  {
    slug: "schneider",
    type: "brand",
    search: "Schneider Schreibgeräte",
    qid: "Q1722637",
  },
  {
    slug: "visconti",
    type: "brand",
    search: "Visconti pen manufacturer",
    qid: "Q7935670",
  },
];

const LIMIT = LIMIT_ARG ? Number(LIMIT_ARG.split("=")[1]) : BRAND_QUERIES.length;

type EntityRow = {
  id: string;
  slug: string;
  name: string;
};

type SearchResult = {
  id: string;
  label?: string;
  description?: string;
  concepturi?: string;
};

type WikidataEntity = {
  id: string;
  labels?: Record<string, { value: string }>;
  descriptions?: Record<string, { value: string }>;
  aliases?: Record<string, Array<{ value: string }>>;
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

async function execute(db: Client, sql: string, args: unknown[] = []) {
  await db.execute({ sql, args: args as InArgs });
}

async function runMigrations(db: Client) {
  await execute(
    db,
    `CREATE TABLE IF NOT EXISTS migrations (
      name TEXT PRIMARY KEY NOT NULL,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
  );

  if (!fs.existsSync(MIGRATIONS_DIR)) return;

  const appliedRows = await db.execute("SELECT name FROM migrations");
  const applied = new Set(appliedRows.rows.map((row) => String(row.name)));
  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith(".sql"))
    .sort();
  const hasLegacySchema =
    (
      await db.execute(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'entities'",
      )
    ).rows.length > 0;

  for (const file of files) {
    if (applied.has(file)) continue;
    if (hasLegacySchema && file !== "011_library_schema.sql") {
      await execute(
        db,
        "INSERT OR IGNORE INTO migrations (name, applied_at) VALUES (?, datetime('now'))",
        [file],
      );
      continue;
    }
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf-8");
    await db.executeMultiple(sql);
    await execute(
      db,
      "INSERT INTO migrations (name, applied_at) VALUES (?, datetime('now'))",
      [file],
    );
    console.log(`Applied migration: ${file}`);
  }
}

async function findLocalEntity(
  db: Client,
  slug: string,
  type: string,
): Promise<EntityRow | null> {
  const result = await db.execute({
    sql: "SELECT id, slug, name FROM entities WHERE slug = ? AND type = ? LIMIT 1",
    args: [slug, type],
  });
  return (result.rows[0] as EntityRow | undefined) || null;
}

async function searchWikidata(query: string): Promise<SearchResult[]> {
  const url = new URL("https://www.wikidata.org/w/api.php");
  url.searchParams.set("action", "wbsearchentities");
  url.searchParams.set("format", "json");
  url.searchParams.set("language", "en");
  url.searchParams.set("type", "item");
  url.searchParams.set("limit", "5");
  url.searchParams.set("search", query);

  const payload = (await fetchJson(url.toString())) as { search?: SearchResult[] };
  return payload.search || [];
}

async function fetchEntity(qid: string): Promise<WikidataEntity> {
  const payload = (await fetchJson(
    `https://www.wikidata.org/wiki/Special:EntityData/${qid}.json`,
  )) as {
    entities: Record<string, WikidataEntity>;
  };
  return payload.entities[qid];
}

async function fetchJson(url: string) {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const { stdout } = await execFileAsync(
        "curl",
        ["-fsSL", "--compressed", "-A", USER_AGENT, url],
        { maxBuffer: 20 * 1024 * 1024 },
      );
      return JSON.parse(stdout);
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);
      if (!/429|503|502/.test(message) || attempt === 3) break;
      await sleep(attempt * 1500);
    }
  }
  throw lastError;
}

function scoreResult(result: SearchResult) {
  const text = `${result.label || ""} ${result.description || ""}`.toLowerCase();
  let score = 0;
  if (text.includes("pen")) score += 4;
  if (text.includes("stationery")) score += 3;
  if (text.includes("manufacturer")) score += 3;
  if (text.includes("company")) score += 2;
  if (text.includes("writing")) score += 2;
  if (text.includes("fountain")) score += 2;
  return score;
}

function selectBest(results: SearchResult[]) {
  const best = [...results].sort((a, b) => scoreResult(b) - scoreResult(a))[0] || null;
  if (!best || scoreResult(best) < 2) return null;
  return best;
}

function uniqueAliases(entity: WikidataEntity) {
  const values = new Set<string>();
  for (const lang of ["zh", "zh-hans", "zh-hant", "en", "ja", "de"]) {
    const label = entity.labels?.[lang]?.value;
    if (label) values.add(label);
    for (const alias of entity.aliases?.[lang] || []) {
      if (alias.value) values.add(alias.value);
    }
  }
  return [...values].slice(0, 20);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function writeWikidataBootstrap(
  db: Client,
  local: EntityRow,
  entity: WikidataEntity,
) {
  const label =
    entity.labels?.zh?.value ||
    entity.labels?.["zh-hans"]?.value ||
    entity.labels?.en?.value ||
    entity.id;
  const description = entity.descriptions?.en?.value || entity.descriptions?.zh?.value || "";
  const url = `https://www.wikidata.org/wiki/${entity.id}`;
  const sourceItemId = `source-wikidata-${entity.id}`;

  await execute(
    db,
    `INSERT INTO source_items
      (id, source_id, title, url, item_type, license, allowed_use, summary, review_status, retrieved_at, updated_at)
     VALUES (?, 'wikidata', ?, ?, 'wikidata_item', 'CC0', 'store_full', ?, 'approved', date('now'), datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      url = excluded.url,
      summary = excluded.summary,
      retrieved_at = excluded.retrieved_at,
      updated_at = datetime('now')`,
    [sourceItemId, `Wikidata: ${label}`, url, description || null],
  );

  await execute(
    db,
    `INSERT INTO external_ids
      (id, entity_id, provider, external_id, url, metadata_json, updated_at)
     VALUES (?, ?, 'wikidata', ?, ?, ?, datetime('now'))
     ON CONFLICT(entity_id, provider, external_id) DO UPDATE SET
      url = excluded.url,
      metadata_json = excluded.metadata_json,
      updated_at = datetime('now')`,
    [
      `external-wikidata-${local.id}-${entity.id}`,
      local.id,
      entity.id,
      url,
      JSON.stringify({ label, description }),
    ],
  );

  for (const alias of uniqueAliases(entity)) {
    await execute(
      db,
      `INSERT OR IGNORE INTO entity_aliases
        (id, entity_id, alias, language, source_id)
       VALUES (?, ?, ?, 'und', 'wikidata')`,
      [`alias-${local.id}-${alias}`.slice(0, 120), local.id, alias],
    );
  }

  if (description) {
    await execute(
      db,
      `INSERT INTO claims
        (id, subject_entity_id, predicate, object_text, source_item_id, confidence, review_status, updated_at)
       VALUES (?, ?, 'wikidata_description', ?, ?, 0.6, 'pending', datetime('now'))
       ON CONFLICT(id) DO UPDATE SET
        object_text = excluded.object_text,
        source_item_id = excluded.source_item_id,
        updated_at = datetime('now')`,
      [`claim-wikidata-description-${local.id}`, local.id, description, sourceItemId],
    );
  }

  await execute(
    db,
    `INSERT INTO entity_references
      (id, entity_id, source_item_id, relation_type, note, review_status)
     VALUES (?, ?, ?, 'reference', ?, 'approved')
     ON CONFLICT(entity_id, source_item_id, relation_type) DO UPDATE SET
      note = excluded.note,
      review_status = excluded.review_status`,
    [
      `reference-wikidata-${local.id}-${entity.id}`,
      local.id,
      sourceItemId,
      "Wikidata structured item used for entity bootstrap, aliases, external ID, and basic description.",
    ],
  );
}

async function main() {
  const db = getClient();
  await execute(db, "PRAGMA foreign_keys = ON");
  if (WRITE) await runMigrations(db);

  const rows = BRAND_QUERIES.slice(0, LIMIT);
  console.log(WRITE ? "Wikidata brand import: write mode" : "Wikidata brand import: dry run");

  for (const brand of rows) {
    const local = await findLocalEntity(db, brand.slug, brand.type);
    if (!local) {
      console.warn(`Skip ${brand.slug}: local entity not found`);
      continue;
    }

    const best = brand.qid
      ? ({ id: brand.qid, label: brand.search } satisfies SearchResult)
      : selectBest(await searchWikidata(brand.search));
    if (!best) {
      console.warn(`No reliable Wikidata result for ${brand.slug}`);
      continue;
    }

    const entity = await fetchEntity(best.id);
    const label = entity.labels?.en?.value || best.label || best.id;
    const description = entity.descriptions?.en?.value || best.description || "";
    console.log(
      `${local.name} -> ${best.id} | ${label} | ${description}${brand.qid ? " | pinned" : ""}`,
    );

    if (WRITE) {
      await writeWikidataBootstrap(db, local, entity);
    }

    await sleep(250);
  }

  if (!WRITE) {
    console.log("Dry run only. Re-run with --write to store aliases, external IDs, and seed claims.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
