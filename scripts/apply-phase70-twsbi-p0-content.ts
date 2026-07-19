import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { Client, Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import { phase24TwsbiPacks } from "./data/phase24-twsbi";
import { createPhase70TwsbiPacks, PHASE70_GO_RAW_SLUG, PHASE70_GO_SLUG, PHASE70_MINI_AL_RAW_SLUG, PHASE70_MINI_AL_SLUG, PHASE70_TWSBI_BRAND_ID, PHASE70_VAC700R_RAW_SLUG, PHASE70_VAC700R_SLUG } from "./data/phase70-twsbi-p0";

export type ApplyPhase70Options = ApplyPhase22Options;
export type ApplyPhase70Result = ApplyPhase22Result;

const TARGETS = [
  { key: "mini", expectedId: "4fJHjzNt8KfK", oldSlug: PHASE70_MINI_AL_RAW_SLUG, slug: PHASE70_MINI_AL_SLUG, name: "三文堂 TWSBI Diamond Mini AL" },
  { key: "go", expectedId: "LRlvQscC9w-i", oldSlug: PHASE70_GO_RAW_SLUG, slug: PHASE70_GO_SLUG, name: "三文堂 TWSBI GO" },
  { key: "vac", expectedId: "16So7O06Q6K1", oldSlug: PHASE70_VAC700R_RAW_SLUG, slug: PHASE70_VAC700R_SLUG, name: "三文堂 TWSBI VAC700R" },
] as const;

function digest(value: string): string { return createHash("sha256").update(value).digest("hex"); }
function stableId(prefix: string, value: string): string { return `${prefix}-${digest(value).slice(0, 24)}`; }
function isInside(candidate: string, root: string): boolean { const relative = path.relative(root, candidate); return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative); }
function assertNoRemoteSelection(env: NodeJS.ProcessEnv): void { for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) if (env[key]?.trim()) throw new Error(`Phase 70 refuses inherited remote database selection: ${key}.`); }

async function assertOwned(client: Client, options: ApplyPhase70Options): Promise<void> {
  assertNoRemoteSelection(options.env ?? process.env); assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const root = fs.realpathSync.native(options.ownedRoot); const database = fs.realpathSync.native(options.databasePath); const protectedCatalog = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(root).isDirectory() || !fs.statSync(database).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !isInside(database, root)) throw new Error("Phase 70 owned catalog authority check failed.");
  const own = fs.statSync(database, { bigint: true }); const protectedStat = fs.statSync(protectedCatalog, { bigint: true });
  if (database === protectedCatalog || (own.dev === protectedStat.dev && own.ino === protectedStat.ino)) throw new Error("Phase 70 refuses protected catalog or hard-link alias.");
  const listed = await client.execute("PRAGMA database_list"); const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) throw new Error("Phase 70 client is not bound to owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 AS ok FROM migrations WHERE name = ? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  if (migration.rows.length !== 1) throw new Error("Phase 70 owned copy must be migrated through 032.");
}

async function installRedirect(tx: Transaction, input: { source: string; target: string; batchId: string; actionId: string }): Promise<void> {
  const existing = await tx.execute({ sql: "SELECT target_path, redirect_kind FROM entity_redirects WHERE source_path = ?", args: [input.source] });
  if (existing.rows.length > 0) { if (existing.rows.length !== 1 || String(existing.rows[0]?.target_path) !== input.target || String(existing.rows[0]?.redirect_kind) !== "permanent") throw new Error(`Phase 70 redirect collision: ${input.source}`); return; }
  await tx.execute({ sql: "INSERT INTO entity_redirects (id, batch_id, action_id, source_path, target_path, redirect_kind, fallback_reason) VALUES (?, ?, ?, ?, ?, 'permanent', 'canonical_slug_rename')", args: [stableId("phase70-redirect", input.source), input.batchId, input.actionId, input.source, input.target] });
}

async function resolveExistingRawId(tx: Transaction, target: (typeof TARGETS)[number]): Promise<string> {
  const byCanonical = await tx.execute({ sql: "SELECT id, type FROM entities WHERE slug = ? ORDER BY id", args: [target.slug] });
  const rows = byCanonical.rows.length === 1 ? byCanonical.rows : (await tx.execute({ sql: "SELECT id, type FROM entities WHERE slug = ? ORDER BY id", args: [target.oldSlug] })).rows;
  if (rows.length !== 1 || String(rows[0]?.type) !== "pen") throw new Error(`Phase 70 strict identity lookup failed: ${target.oldSlug}`);
  const id = String(rows[0]?.id); if (id !== target.expectedId) throw new Error(`Phase 70 checkpoint identity mismatch for ${target.slug}: expected ${target.expectedId}, got ${id}`);
  return id;
}

async function prepareIdentity(client: Client): Promise<{ mini: string; go: string; vac: string }> {
  const tx = await client.transaction("write");
  try {
    const brand = await tx.execute({ sql: "SELECT type, slug FROM entities WHERE id = ?", args: [PHASE70_TWSBI_BRAND_ID] });
    if (brand.rows.length !== 1 || String(brand.rows[0]?.type) !== "brand" || String(brand.rows[0]?.slug) !== "twsbi") throw new Error("Phase 70 TWSBI brand identity mismatch.");
    const ids = { mini: await resolveExistingRawId(tx, TARGETS[0]), go: await resolveExistingRawId(tx, TARGETS[1]), vac: await resolveExistingRawId(tx, TARGETS[2]) };
    if (new Set(Object.values(ids)).size !== TARGETS.length) throw new Error("Phase 70 distinct TWSBI models resolved to one entity.");
    const batchKey = "phase70-twsbi-mini-go-vac700r-canonical-v1"; const batchId = stableId("phase70-batch", batchKey);
    await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_batches (id, source_key, source_checksum, status, note) VALUES (?, ?, ?, 'applied', ?)", args: [batchId, batchKey, digest(batchKey), "Canonicalize three separately sourced TWSBI models; keep Mini AL, GO and VAC700R filling systems and measurements distinct."] });
    for (const target of TARGETS) {
      const id = ids[target.key]; const row = await tx.execute({ sql: "SELECT type, slug FROM entities WHERE id = ?", args: [id] });
      if (row.rows.length !== 1 || String(row.rows[0]?.type) !== "pen") throw new Error(`Phase 70 pen disappeared: ${target.key}`);
      const oldSlug = String(row.rows[0]?.slug); if (oldSlug !== target.oldSlug && oldSlug !== target.slug) throw new Error(`Phase 70 unexpected current slug for ${target.key}: ${oldSlug}`);
      const actionId = stableId("phase70-action", id);
      await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_actions (id, batch_id, source_row_key, action_kind, action_checksum, source_entity_id, target_entity_id, status, note) VALUES (?, ?, ?, 'rename', ?, ?, ?, 'applied', ?)", args: [actionId, batchId, target.oldSlug, digest(`${id}:${target.oldSlug}:${target.slug}`), id, id, `Canonicalized ${target.oldSlug} to ${target.slug}; exact source-backed model boundary retained.`] });
      await tx.execute({ sql: "INSERT OR IGNORE INTO entity_lineage (id, batch_id, action_id, source_entity_id, target_entity_id, lineage_kind, fallback_reason) VALUES (?, ?, ?, ?, ?, 'rename', NULL)", args: [stableId("phase70-lineage", id), batchId, actionId, id, id] });
      if (oldSlug === target.oldSlug) await tx.execute({ sql: "UPDATE entities SET slug = ?, name = ?, updated_at = datetime('now') WHERE id = ?", args: [target.slug, target.name, id] });
      await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id = ? AND link_type = 'made_by' AND target_id <> ?", args: [id, PHASE70_TWSBI_BRAND_ID] });
      await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'made_by', ?)", args: [stableId("phase70-made-by", id), id, PHASE70_TWSBI_BRAND_ID, "Phase 70 verified TWSBI model maker relation"] });
      await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'reverse', ?)", args: [stableId("phase70-reverse", id), PHASE70_TWSBI_BRAND_ID, id, "Phase 70 TWSBI model navigation"] });
      const maker = await tx.execute({ sql: "SELECT target_id FROM entity_links WHERE source_id = ? AND link_type = 'made_by'", args: [id] });
      if (maker.rows.length !== 1 || String(maker.rows[0]?.target_id) !== PHASE70_TWSBI_BRAND_ID) throw new Error(`Phase 70 maker topology is ambiguous: ${target.key}`);
      await installRedirect(tx, { source: `/pen/${target.oldSlug}`, target: `/pen/${target.slug}`, batchId, actionId });
    }
    await tx.commit(); return ids;
  } catch (error) { if (!tx.closed) await tx.rollback(); throw error; }
}

export async function applyPhase70TwsbiP0Content(client: Client, options: ApplyPhase70Options): Promise<ApplyPhase70Result> {
  await assertOwned(client, options); const ids = await prepareIdentity(client);
  const brand = phase24TwsbiPacks.find((pack) => pack.entityId === PHASE70_TWSBI_BRAND_ID); if (!brand) throw new Error("Phase 70 TWSBI brand prerequisite pack is missing.");
  const freshBrand = structuredClone(brand); freshBrand.key = "phase70-twsbi-brand-v1";
  const result = await applyCuratedContentPacks(client, options, [freshBrand, ...createPhase70TwsbiPacks(ids)]); assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot); return result;
}

function cliValue(name: string): string | null { const index = process.argv.indexOf(name); return index === -1 ? null : process.argv[index + 1] ?? null; }
async function main(): Promise<void> {
  const database = cliValue("--database"); const ownedRoot = cliValue("--owned-root"); const protectedCatalog = cliValue("--protected-catalog");
  if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase70-twsbi-p0-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  const { createClient } = await import("@libsql/client"); const client = createClient({ url: `file:${path.resolve(database)}` });
  try { const result = await applyPhase70TwsbiP0Content(client, { workspaceRoot: process.cwd(), reviewer: cliValue("--reviewer") ?? "phase70-twsbi-p0", databasePath: path.resolve(database), ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: path.resolve(protectedCatalog), protectedCatalogSnapshot: snapshotCatalogFiles(path.resolve(protectedCatalog)), env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } }); process.stdout.write(`${JSON.stringify(result, null, 2)}\n`); } finally { client.close(); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
