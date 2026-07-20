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
import { PHASE69_ESTERBROOK_BRAND_ID } from "./data/phase69-esterbrook-estie";
import {
  PHASE100_ESTERBROOK_DOLLAR_PEN_ID,
  PHASE100_ESTERBROOK_DOLLAR_PEN_SLUG,
  phase100EsterbrookDollarPenPacks,
} from "./data/phase100-esterbrook-dollar-pen";

export type ApplyPhase100Options = ApplyPhase22Options;
export type ApplyPhase100Result = ApplyPhase22Result;

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
    if (env[key]?.trim()) throw new Error(`Phase 100 refuses inherited remote database selection: ${key}.`);
  }
}

async function assertOwned(client: Client, options: ApplyPhase100Options): Promise<void> {
  assertNoRemoteSelection(options.env ?? process.env);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const root = fs.realpathSync.native(options.ownedRoot);
  const database = fs.realpathSync.native(options.databasePath);
  const protectedCatalog = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(root).isDirectory() || !fs.statSync(database).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !isInside(database, root)) {
    throw new Error("Phase 100 database must be a non-symlink file inside the owned root.");
  }
  const own = fs.statSync(database, { bigint: true });
  const protectedStat = fs.statSync(protectedCatalog, { bigint: true });
  if (database === protectedCatalog || (own.dev === protectedStat.dev && own.ino === protectedStat.ino)) {
    throw new Error("Phase 100 refuses protected catalog or hard-link alias.");
  }
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) {
    throw new Error("Phase 100 client is not bound to the authorized owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 AS ok FROM migrations WHERE name = ? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) throw new Error("Phase 100 owned copy must be migrated through 032.");
}

async function installRenameRedirect(tx: Transaction, sourceSlug: string): Promise<void> {
  if (sourceSlug === PHASE100_ESTERBROOK_DOLLAR_PEN_SLUG) return;
  const source = `/pen/${sourceSlug}`;
  const target = `/pen/${PHASE100_ESTERBROOK_DOLLAR_PEN_SLUG}`;
  const existing = await tx.execute({
    sql: "SELECT target_path, redirect_kind FROM entity_redirects WHERE source_path = ?",
    args: [source],
  });
  if (existing.rows.length === 1) {
    if (String(existing.rows[0]?.target_path) !== target || String(existing.rows[0]?.redirect_kind) !== "permanent") {
      throw new Error(`Phase 100 Dollar Pen route has a conflicting redirect: ${source}.`);
    }
    return;
  }
  if (existing.rows.length > 1) throw new Error(`Phase 100 Dollar Pen route has duplicate redirects: ${source}.`);
  const key = `${PHASE100_ESTERBROOK_DOLLAR_PEN_ID}:${source}->${target}`;
  const batchId = stableId("phase100-batch", key);
  const actionId = stableId("phase100-action", key);
  await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_batches (id, source_key, source_checksum, status, note) VALUES (?, ?, ?, 'applied', ?)", args: [batchId, key, digest(key), "Canonicalize the exact historical Esterbrook Dollar Pen route without absorbing J or modern lines."] });
  await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_actions (id, batch_id, source_row_key, action_kind, action_checksum, source_entity_id, target_entity_id, status, note) VALUES (?, ?, ?, 'rename', ?, ?, ?, 'applied', ?)", args: [actionId, batchId, sourceSlug, digest(key), PHASE100_ESTERBROOK_DOLLAR_PEN_ID, PHASE100_ESTERBROOK_DOLLAR_PEN_ID, "Phase 100 exact Dollar Pen route normalization."] });
  await tx.execute({ sql: "INSERT OR IGNORE INTO entity_lineage (id, batch_id, action_id, source_entity_id, target_entity_id, lineage_kind, fallback_reason) VALUES (?, ?, ?, ?, ?, 'rename', NULL)", args: [stableId("phase100-lineage", key), batchId, actionId, PHASE100_ESTERBROOK_DOLLAR_PEN_ID, PHASE100_ESTERBROOK_DOLLAR_PEN_ID] });
  await tx.execute({ sql: "INSERT INTO entity_redirects (id, batch_id, action_id, source_path, target_path, redirect_kind, fallback_reason) VALUES (?, ?, ?, ?, ?, 'permanent', 'canonical_slug_rename')", args: [stableId("phase100-redirect", source), batchId, actionId, source, target] });
}

async function ensureTopology(client: Client): Promise<void> {
  const tx = await client.transaction("write");
  try {
    const brand = await tx.execute({ sql: "SELECT type, slug FROM entities WHERE id = ?", args: [PHASE69_ESTERBROOK_BRAND_ID] });
    if (brand.rows.length !== 1 || String(brand.rows[0]?.type) !== "brand" || String(brand.rows[0]?.slug) !== "esterbrook") {
      throw new Error("Phase 100 requires the exact pre-existing Esterbrook brand identity.");
    }
    const pen = await tx.execute({ sql: "SELECT type, slug FROM entities WHERE id = ?", args: [PHASE100_ESTERBROOK_DOLLAR_PEN_ID] });
    if (pen.rows.length !== 1 || String(pen.rows[0]?.type) !== "pen") {
      throw new Error("Phase 100 requires the exact pre-existing Esterbrook Dollar Pen entity.");
    }
    const sourceSlug = String(pen.rows[0]?.slug);
    const collision = await tx.execute({ sql: "SELECT id FROM entities WHERE slug = ? AND id <> ?", args: [PHASE100_ESTERBROOK_DOLLAR_PEN_SLUG, PHASE100_ESTERBROOK_DOLLAR_PEN_ID] });
    if (collision.rows.length) throw new Error("Phase 100 Dollar Pen canonical route collides.");
    await tx.execute({ sql: "UPDATE entities SET slug = ?, name = ?, updated_at = datetime('now') WHERE id = ?", args: [PHASE100_ESTERBROOK_DOLLAR_PEN_SLUG, "Esterbrook Dollar Pen（B／A／H，约 1934–1942）", PHASE100_ESTERBROOK_DOLLAR_PEN_ID] });
    await installRenameRedirect(tx, sourceSlug);
    await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id = ? AND link_type = 'made_by' AND target_id <> ?", args: [PHASE100_ESTERBROOK_DOLLAR_PEN_ID, PHASE69_ESTERBROOK_BRAND_ID] });
    await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'made_by', ?)", args: [stableId("phase100-made-by", `${PHASE100_ESTERBROOK_DOLLAR_PEN_ID}:${PHASE69_ESTERBROOK_BRAND_ID}`), PHASE100_ESTERBROOK_DOLLAR_PEN_ID, PHASE69_ESTERBROOK_BRAND_ID, "Phase 100 exact historical Esterbrook Dollar Pen maker topology"] });
    await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'reverse', ?)", args: [stableId("phase100-reverse", `${PHASE69_ESTERBROOK_BRAND_ID}:${PHASE100_ESTERBROOK_DOLLAR_PEN_ID}`), PHASE69_ESTERBROOK_BRAND_ID, PHASE100_ESTERBROOK_DOLLAR_PEN_ID, "Phase 100 Esterbrook-to-Dollar Pen navigation"] });
    const makers = await tx.execute({ sql: "SELECT target_id FROM entity_links WHERE source_id = ? AND link_type = 'made_by'", args: [PHASE100_ESTERBROOK_DOLLAR_PEN_ID] });
    if (makers.rows.length !== 1 || String(makers.rows[0]?.target_id) !== PHASE69_ESTERBROOK_BRAND_ID) {
      throw new Error("Phase 100 Dollar Pen maker topology remains ambiguous.");
    }
    await tx.commit();
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
      await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'reverse', ?)", args: [stableId("phase100-all-reverse", `${PHASE69_ESTERBROOK_BRAND_ID}:${penId}`), PHASE69_ESTERBROOK_BRAND_ID, penId, "Phase 100 Esterbrook public-model navigation repair"] });
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
  if (missing.rows.length) throw new Error(`Phase 100 Esterbrook has incomplete public model navigation: ${missing.rows.map((row) => String(row.slug)).join(", ")}.`);
}

export async function applyPhase100EsterbrookDollarPenContent(client: Client, options: ApplyPhase100Options): Promise<ApplyPhase100Result> {
  await assertOwned(client, options);
  await ensureTopology(client);
  const result = await applyCuratedContentPacks(client, options, structuredClone(phase100EsterbrookDollarPenPacks()));
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
  if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase100-esterbrook-dollar-pen-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  const { createClient } = await import("@libsql/client");
  const client = createClient({ url: `file:${path.resolve(database)}` });
  try {
    const result = await applyPhase100EsterbrookDollarPenContent(client, {
      workspaceRoot: process.cwd(),
      reviewer: cliValue("--reviewer") ?? "phase100-esterbrook-dollar-pen",
      databasePath: path.resolve(database),
      ownedRoot: path.resolve(ownedRoot),
      protectedCatalogPath: path.resolve(protectedCatalog),
      protectedCatalogSnapshot: snapshotCatalogFiles(path.resolve(protectedCatalog)),
      env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" },
    });
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
