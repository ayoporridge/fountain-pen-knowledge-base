import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { Client, Transaction } from "@libsql/client";
import {
  assertCatalogSnapshotUnchanged,
  snapshotCatalogFiles,
} from "../src/lib/audit/read-only-catalog";
import {
  applyCuratedContentPacks,
  type ApplyPhase22Options,
  type ApplyPhase22Result,
} from "./apply-phase22-content";
import {
  PHASE69_ESTERBROOK_BRAND_ID,
} from "./data/phase69-esterbrook-estie";
import {
  PHASE82_ESTERBROOK_J_FALLBACK_ID,
  PHASE82_ESTERBROOK_J_SLUG,
  phase82EsterbrookJPacks,
} from "./data/phase82-esterbrook-j";

export type ApplyPhase82Options = ApplyPhase22Options;
export type ApplyPhase82Result = ApplyPhase22Result;

function digest(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function stableId(prefix: string, value: string): string {
  return `${prefix}-${digest(value).slice(0, 24)}`;
}

function isInside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function assertNoRemoteSelection(env: NodeJS.ProcessEnv): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (env[key]?.trim()) throw new Error(`Phase 82 refuses inherited remote database selection: ${key}.`);
  }
}

async function assertOwned(client: Client, options: ApplyPhase82Options): Promise<void> {
  assertNoRemoteSelection(options.env ?? process.env);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const root = fs.realpathSync.native(options.ownedRoot);
  const database = fs.realpathSync.native(options.databasePath);
  const protectedCatalog = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(root).isDirectory() || !fs.statSync(database).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !isInside(database, root)) {
    throw new Error("Phase 82 owned catalog authority check failed.");
  }
  const own = fs.statSync(database, { bigint: true });
  const protectedStat = fs.statSync(protectedCatalog, { bigint: true });
  if (database === protectedCatalog || (own.dev === protectedStat.dev && own.ino === protectedStat.ino)) {
    throw new Error("Phase 82 refuses protected catalog or hard-link alias.");
  }
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) {
    throw new Error("Phase 82 client is not bound to owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 AS ok FROM migrations WHERE name = ? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) throw new Error("Phase 82 owned copy must be migrated through 032.");
}

type ResolvedJ = { id: string; sourceSlug: string; created: boolean };

async function resolveHistoricJ(tx: Transaction): Promise<ResolvedJ> {
  const matches = await tx.execute({
    sql: `SELECT id, type, slug, name
          FROM entities
          WHERE type = 'pen'
            AND (slug IN (?, 'esterbrook-j-series', 'esterbrook-j', 'esterbrook-j-double-jewel')
              OR lower(name) IN (
                'esterbrook j',
                'esterbrook j series',
                'esterbrook double jewel j',
                'esterbrook j/lj/sj',
                'esterbrook j lj sj'
              ))
          ORDER BY id`,
    args: [PHASE82_ESTERBROOK_J_SLUG],
  });
  if (matches.rows.length > 1) {
    throw new Error("Phase 82 historic J lookup is ambiguous; do not merge modern Model J, Estie, JR, LJ or SJ placeholders blindly.");
  }
  if (matches.rows.length === 0) {
    const collision = await tx.execute({ sql: "SELECT id, type FROM entities WHERE slug = ?", args: [PHASE82_ESTERBROOK_J_SLUG] });
    if (collision.rows.length) throw new Error("Phase 82 cannot create historic J because the canonical route is occupied.");
    await tx.execute({
      sql: "INSERT INTO entities (id, type, slug, name) VALUES (?, 'pen', ?, ?)",
      args: [PHASE82_ESTERBROOK_J_FALLBACK_ID, PHASE82_ESTERBROOK_J_SLUG, "Esterbrook J Series（Double Jewel，约 1948 年后）"],
    });
    return { id: PHASE82_ESTERBROOK_J_FALLBACK_ID, sourceSlug: PHASE82_ESTERBROOK_J_SLUG, created: true };
  }
  const row = matches.rows[0]!;
  const id = String(row.id);
  const sourceSlug = String(row.slug);
  const collision = await tx.execute({ sql: "SELECT id FROM entities WHERE slug = ? AND id <> ?", args: [PHASE82_ESTERBROOK_J_SLUG, id] });
  if (collision.rows.length) throw new Error("Phase 82 historic J canonical route collides.");
  await tx.execute({
    sql: "UPDATE entities SET slug = ?, name = ?, updated_at = datetime('now') WHERE id = ?",
    args: [PHASE82_ESTERBROOK_J_SLUG, "Esterbrook J Series（Double Jewel，约 1948 年后）", id],
  });
  return { id, sourceSlug, created: false };
}

async function installRenameRedirect(tx: Transaction, penId: string, sourceSlug: string): Promise<void> {
  if (sourceSlug === PHASE82_ESTERBROOK_J_SLUG) return;
  const source = `/pen/${sourceSlug}`;
  const target = `/pen/${PHASE82_ESTERBROOK_J_SLUG}`;
  const existing = await tx.execute({ sql: "SELECT target_path, redirect_kind FROM entity_redirects WHERE source_path = ?", args: [source] });
  if (existing.rows.length === 1) {
    if (String(existing.rows[0]?.target_path) !== target || String(existing.rows[0]?.redirect_kind) !== "permanent") {
      throw new Error(`Phase 82 historic J route has a conflicting redirect: ${source}.`);
    }
    return;
  }
  if (existing.rows.length > 1) throw new Error(`Phase 82 historic J route has duplicate redirects: ${source}.`);
  const key = `${penId}:${source}->${target}`;
  const batchId = stableId("phase82-batch", key);
  const actionId = stableId("phase82-action", key);
  await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_batches (id, source_key, source_checksum, status, note) VALUES (?, ?, ?, 'applied', ?)", args: [batchId, key, digest(key), "Canonicalize only an exact historical Esterbrook J family pen route; never redirect modern Model J, Estie or JR."] });
  await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_actions (id, batch_id, source_row_key, action_kind, action_checksum, source_entity_id, target_entity_id, status, note) VALUES (?, ?, ?, 'rename', ?, ?, ?, 'applied', ?)", args: [actionId, batchId, sourceSlug, digest(key), penId, penId, "Phase 82 exact historic J route normalization."] });
  await tx.execute({ sql: "INSERT OR IGNORE INTO entity_lineage (id, batch_id, action_id, source_entity_id, target_entity_id, lineage_kind, fallback_reason) VALUES (?, ?, ?, ?, ?, 'rename', NULL)", args: [stableId("phase82-lineage", penId), batchId, actionId, penId, penId] });
  await tx.execute({ sql: "INSERT INTO entity_redirects (id, batch_id, action_id, source_path, target_path, redirect_kind, fallback_reason) VALUES (?, ?, ?, ?, ?, 'permanent', 'canonical_slug_rename')", args: [stableId("phase82-redirect", source), batchId, actionId, source, target] });
}

async function ensureTopology(client: Client): Promise<{ brandId: string; penId: string }> {
  const tx = await client.transaction("write");
  try {
    const brand = await tx.execute({ sql: "SELECT type, slug, name FROM entities WHERE id = ?", args: [PHASE69_ESTERBROOK_BRAND_ID] });
    if (brand.rows.length !== 1 || String(brand.rows[0]?.type) !== "brand" || String(brand.rows[0]?.slug) !== "esterbrook") {
      throw new Error("Phase 82 requires the exact pre-existing Esterbrook brand identity.");
    }
    const historicJ = await resolveHistoricJ(tx);
    if (!historicJ.created) await installRenameRedirect(tx, historicJ.id, historicJ.sourceSlug);
    await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id = ? AND link_type = 'made_by' AND target_id <> ?", args: [historicJ.id, PHASE69_ESTERBROOK_BRAND_ID] });
    await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'made_by', ?)", args: [stableId("phase82-made-by", `${historicJ.id}:${PHASE69_ESTERBROOK_BRAND_ID}`), historicJ.id, PHASE69_ESTERBROOK_BRAND_ID, "Phase 82 exact historic Esterbrook Double Jewel J family maker topology"] });
    await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'reverse', ?)", args: [stableId("phase82-reverse", `${PHASE69_ESTERBROOK_BRAND_ID}:${historicJ.id}`), PHASE69_ESTERBROOK_BRAND_ID, historicJ.id, "Phase 82 Esterbrook-to-historic-J family navigation"] });
    const makers = await tx.execute({ sql: "SELECT target_id FROM entity_links WHERE source_id = ? AND link_type = 'made_by'", args: [historicJ.id] });
    if (makers.rows.length !== 1 || String(makers.rows[0]?.target_id) !== PHASE69_ESTERBROOK_BRAND_ID) throw new Error("Phase 82 historic J maker topology remains ambiguous.");
    await tx.commit();
    return { brandId: PHASE69_ESTERBROOK_BRAND_ID, penId: historicJ.id };
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
}

async function ensurePublicBrandNavigation(client: Client): Promise<void> {
  const pens = await client.execute({
    sql: `SELECT pen.id FROM public_entities pen
          JOIN entity_links maker ON maker.source_id = pen.id AND maker.target_id = ? AND maker.link_type = 'made_by'
          WHERE pen.type = 'pen' ORDER BY pen.id`,
    args: [PHASE69_ESTERBROOK_BRAND_ID],
  });
  const tx = await client.transaction("write");
  try {
    for (const pen of pens.rows) {
      const penId = String(pen.id);
      await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'reverse', ?)", args: [stableId("phase82-all-reverse", `${PHASE69_ESTERBROOK_BRAND_ID}:${penId}`), PHASE69_ESTERBROOK_BRAND_ID, penId, "Phase 82 Esterbrook public-model navigation repair"] });
    }
    await tx.commit();
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
  const missing = await client.execute({
    sql: `SELECT pen.slug FROM public_entities pen
          JOIN entity_links maker ON maker.source_id = pen.id AND maker.target_id = ? AND maker.link_type = 'made_by'
          LEFT JOIN entity_links reverse ON reverse.source_id = ? AND reverse.target_id = pen.id AND reverse.link_type = 'reverse'
          WHERE pen.type = 'pen' GROUP BY pen.id, pen.slug HAVING count(reverse.id) <> 1 ORDER BY pen.slug`,
    args: [PHASE69_ESTERBROOK_BRAND_ID, PHASE69_ESTERBROOK_BRAND_ID],
  });
  if (missing.rows.length) throw new Error(`Phase 82 Esterbrook has incomplete public model navigation: ${missing.rows.map((row) => String(row.slug)).join(", ")}.`);
}

export async function applyPhase82EsterbrookJContent(client: Client, options: ApplyPhase82Options): Promise<ApplyPhase82Result> {
  await assertOwned(client, options);
  const ids = await ensureTopology(client);
  const result = await applyCuratedContentPacks(client, options, structuredClone(phase82EsterbrookJPacks(ids.brandId, ids.penId)));
  await ensurePublicBrandNavigation(client);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return result;
}

function cliValue(name: string): string | null {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : (process.argv[index + 1] ?? null);
}

async function main(): Promise<void> {
  const database = cliValue("--database");
  const ownedRoot = cliValue("--owned-root");
  const protectedCatalog = cliValue("--protected-catalog");
  if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase82-esterbrook-j-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  const { createClient } = await import("@libsql/client");
  const client = createClient({ url: `file:${path.resolve(database)}` });
  try {
    const result = await applyPhase82EsterbrookJContent(client, { workspaceRoot: process.cwd(), reviewer: cliValue("--reviewer") ?? "phase82-esterbrook-j", databasePath: path.resolve(database), ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: path.resolve(protectedCatalog), protectedCatalogSnapshot: snapshotCatalogFiles(path.resolve(protectedCatalog)), env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } });
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } finally {
    client.close();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  void main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
