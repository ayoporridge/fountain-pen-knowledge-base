import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { Client, Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import { PHASE42_LAMY_BRAND_ID, phase42LamyPlatinumPacks } from "./data/phase42-lamy-platinum";
import { createPhase68LamySafariAlstarPacks, PHASE68_ALSTAR_RAW_SLUG, PHASE68_ALSTAR_SLUG, PHASE68_SAFARI_RAW_SLUG, PHASE68_SAFARI_SLUG } from "./data/phase68-lamy-safari-alstar";

export type ApplyPhase68Options = ApplyPhase22Options;
export type ApplyPhase68Result = ApplyPhase22Result;

const TARGETS = [
  { key: "safari", oldSlug: PHASE68_SAFARI_RAW_SLUG, slug: PHASE68_SAFARI_SLUG, name: "LAMY Safari" },
  { key: "alstar", oldSlug: PHASE68_ALSTAR_RAW_SLUG, slug: PHASE68_ALSTAR_SLUG, name: "LAMY AL-star" },
] as const;

function digest(value: string): string { return createHash("sha256").update(value).digest("hex"); }
function stableId(prefix: string, value: string): string { return `${prefix}-${digest(value).slice(0, 24)}`; }
function isInside(candidate: string, root: string): boolean { const relative = path.relative(root, candidate); return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative); }
function assertNoRemoteSelection(env: NodeJS.ProcessEnv): void { for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) if (env[key]?.trim()) throw new Error(`Phase 68 refuses inherited remote database selection: ${key}.`); }

async function assertOwned(client: Client, options: ApplyPhase68Options): Promise<void> {
  assertNoRemoteSelection(options.env ?? process.env);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const database = fs.realpathSync.native(options.databasePath);
  const protectedCatalog = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(ownedRoot).isDirectory() || !fs.statSync(database).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !isInside(database, ownedRoot)) throw new Error("Phase 68 owned catalog authority check failed.");
  const own = fs.statSync(database, { bigint: true }); const protectedStat = fs.statSync(protectedCatalog, { bigint: true });
  if (database === protectedCatalog || (own.dev === protectedStat.dev && own.ino === protectedStat.ino)) throw new Error("Phase 68 refuses protected catalog or hard-link alias.");
  const listed = await client.execute("PRAGMA database_list"); const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) throw new Error("Phase 68 client is not bound to owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 AS ok FROM migrations WHERE name = ? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  if (migration.rows.length !== 1) throw new Error("Phase 68 owned copy must be migrated through 032.");
}

async function installRedirect(tx: Transaction, input: { source: string; target: string; batchId: string; actionId: string }): Promise<void> {
  const existing = await tx.execute({ sql: "SELECT target_path, redirect_kind FROM entity_redirects WHERE source_path = ?", args: [input.source] });
  if (existing.rows.length > 0) {
    if (existing.rows.length !== 1 || String(existing.rows[0]?.target_path ?? "") !== input.target || String(existing.rows[0]?.redirect_kind) !== "permanent") throw new Error(`Phase 68 redirect collision: ${input.source}`);
    return;
  }
  await tx.execute({ sql: "INSERT INTO entity_redirects (id, batch_id, action_id, source_path, target_path, redirect_kind, fallback_reason) VALUES (?, ?, ?, ?, ?, 'permanent', 'canonical_slug_rename')", args: [stableId("phase68-redirect", input.source), input.batchId, input.actionId, input.source, input.target] });
}

async function resolveExistingRawId(tx: Transaction, target: (typeof TARGETS)[number]): Promise<string> {
  const canonical = await tx.execute({ sql: "SELECT id, type FROM entities WHERE slug = ? ORDER BY id", args: [target.slug] });
  if (canonical.rows.length === 1) {
    if (String(canonical.rows[0]?.type) !== "pen") throw new Error(`Phase 68 canonical slug has wrong type: ${target.slug}`);
    return String(canonical.rows[0]?.id);
  }
  if (canonical.rows.length > 1) throw new Error(`Phase 68 canonical slug is ambiguous: ${target.slug}`);
  const raw = await tx.execute({ sql: "SELECT id, type, slug FROM entities WHERE slug = ? ORDER BY id", args: [target.oldSlug] });
  if (raw.rows.length !== 1) throw new Error(`Phase 68 strict old-slug lookup failed: ${target.oldSlug}`);
  if (String(raw.rows[0]?.type) !== "pen" || String(raw.rows[0]?.slug) !== target.oldSlug) throw new Error(`Phase 68 old-slug entity type mismatch: ${target.oldSlug}`);
  return String(raw.rows[0]?.id);
}

async function prepareIdentity(client: Client): Promise<{ safari: string; alstar: string }> {
  const tx = await client.transaction("write");
  try {
    const brand = await tx.execute({ sql: "SELECT type, slug FROM entities WHERE id = ?", args: [PHASE42_LAMY_BRAND_ID] });
    if (brand.rows.length !== 1 || String(brand.rows[0]?.type) !== "brand" || String(brand.rows[0]?.slug) !== "lamy") throw new Error("Phase 68 LAMY brand identity mismatch.");
    const ids = {
      safari: await resolveExistingRawId(tx, TARGETS[0]),
      alstar: await resolveExistingRawId(tx, TARGETS[1]),
    };
    if (ids.safari === ids.alstar) throw new Error("Phase 68 Safari and AL-star resolve to one entity; identity split required.");
    const batchKey = "phase68-lamy-safari-alstar-canonical-v1"; const batchId = stableId("phase68-batch", batchKey);
    await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_batches (id, source_key, source_checksum, status, note) VALUES (?, ?, ?, 'applied', ?)", args: [batchId, batchKey, digest(batchKey), "Canonicalize separately verified LAMY Safari and AL-star raw records; keep material, grip and exact-SKU specs distinct."] });
    for (const target of TARGETS) {
      const id = ids[target.key];
      const row = await tx.execute({ sql: "SELECT type, slug FROM entities WHERE id = ?", args: [id] });
      if (row.rows.length !== 1 || String(row.rows[0]?.type) !== "pen") throw new Error(`Phase 68 pen disappeared: ${target.key}`);
      const oldSlug = String(row.rows[0]?.slug);
      if (oldSlug !== target.oldSlug && oldSlug !== target.slug) throw new Error(`Phase 68 unexpected current slug for ${target.key}: ${oldSlug}`);
      const actionId = stableId("phase68-action", id);
      await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_actions (id, batch_id, source_row_key, action_kind, action_checksum, source_entity_id, target_entity_id, status, note) VALUES (?, ?, ?, 'rename', ?, ?, ?, 'applied', ?)", args: [actionId, batchId, target.oldSlug, digest(`${id}:${target.oldSlug}:${target.slug}`), id, id, `Canonicalized ${target.oldSlug} to ${target.slug}; exact source-backed model boundary retained.`] });
      await tx.execute({ sql: "INSERT OR IGNORE INTO entity_lineage (id, batch_id, action_id, source_entity_id, target_entity_id, lineage_kind, fallback_reason) VALUES (?, ?, ?, ?, ?, 'rename', NULL)", args: [stableId("phase68-lineage", id), batchId, actionId, id, id] });
      if (oldSlug === target.oldSlug) await tx.execute({ sql: "UPDATE entities SET slug = ?, name = ?, updated_at = datetime('now') WHERE id = ?", args: [target.slug, target.name, id] });
      await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id = ? AND link_type = 'made_by' AND target_id <> ?", args: [id, PHASE42_LAMY_BRAND_ID] });
      await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'made_by', ?)", args: [stableId("phase68-made-by", id), id, PHASE42_LAMY_BRAND_ID, "Phase 68 verified LAMY model maker relation"] });
      await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'reverse', ?)", args: [stableId("phase68-reverse", id), PHASE42_LAMY_BRAND_ID, id, "Phase 68 LAMY model navigation"] });
      const maker = await tx.execute({ sql: "SELECT target_id FROM entity_links WHERE source_id = ? AND link_type = 'made_by'", args: [id] });
      if (maker.rows.length !== 1 || String(maker.rows[0]?.target_id) !== PHASE42_LAMY_BRAND_ID) throw new Error(`Phase 68 maker topology is ambiguous: ${target.key}`);
      await installRedirect(tx, { source: `/pen/${target.oldSlug}`, target: `/pen/${target.slug}`, batchId, actionId });
    }
    await tx.commit();
    return ids;
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
}

export async function applyPhase68LamySafariAlstarContent(client: Client, options: ApplyPhase68Options): Promise<ApplyPhase68Result> {
  await assertOwned(client, options);
  const ids = await prepareIdentity(client);
  const brand = phase42LamyPlatinumPacks.find((pack) => pack.entityId === PHASE42_LAMY_BRAND_ID);
  if (!brand) throw new Error("Phase 68 LAMY brand prerequisite pack is missing.");
  const freshBrand = structuredClone(brand); freshBrand.key = "phase68-lamy-brand-v1";
  const result = await applyCuratedContentPacks(client, options, [freshBrand, ...createPhase68LamySafariAlstarPacks(ids)]);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return result;
}

function cliValue(name: string): string | null { const index = process.argv.indexOf(name); return index === -1 ? null : process.argv[index + 1] ?? null; }
async function main(): Promise<void> {
  const database = cliValue("--database"); const ownedRoot = cliValue("--owned-root"); const protectedCatalog = cliValue("--protected-catalog");
  if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase68-lamy-safari-alstar-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  const { createClient } = await import("@libsql/client"); const client = createClient({ url: `file:${path.resolve(database)}` });
  try { const result = await applyPhase68LamySafariAlstarContent(client, { workspaceRoot: process.cwd(), reviewer: cliValue("--reviewer") ?? "phase68-lamy-safari-alstar", databasePath: path.resolve(database), ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: path.resolve(protectedCatalog), protectedCatalogSnapshot: snapshotCatalogFiles(path.resolve(protectedCatalog)), env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } }); process.stdout.write(`${JSON.stringify(result, null, 2)}\n`); } finally { client.close(); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
