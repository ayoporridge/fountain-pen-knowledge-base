import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { Client, Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import { PHASE60_CUSTOM_742_ID, PHASE60_CUSTOM_743_ID, PHASE60_CUSTOM_845_ID, PHASE60_CUSTOM_912_ID, PHASE60_ELITE_95S_ID, PHASE60_PILOT_BRAND_ID, phase60PilotP0Packs } from "./data/phase60-pilot-p0";

export type ApplyPhase60Options = ApplyPhase22Options;
export type ApplyPhase60Result = ApplyPhase22Result;
function digest(value: string) { return createHash("sha256").update(value).digest("hex"); }
function stableId(prefix: string, value: string) { return `${prefix}-${digest(value).slice(0, 24)}`; }
function inside(candidate: string, root: string) { const relative = path.relative(root, candidate); return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative); }
function assertNoRemote(env: NodeJS.ProcessEnv) { for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) if (env[key]?.trim()) throw new Error(`Phase 60 refuses inherited remote selection: ${key}.`); }
async function assertOwned(client: Client, options: ApplyPhase60Options) {
  assertNoRemote(options.env ?? process.env); assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const root = fs.realpathSync.native(options.ownedRoot); const database = fs.realpathSync.native(options.databasePath); const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(root).isDirectory() || !fs.statSync(database).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !inside(database, root)) throw new Error("Phase 60 owned catalog authority check failed.");
  const own = fs.statSync(database, { bigint: true }); const real = fs.statSync(protectedPath, { bigint: true });
  if (database === protectedPath || (own.dev === real.dev && own.ino === real.ino)) throw new Error("Phase 60 refuses protected catalog or hard-link alias.");
  const listed = await client.execute("PRAGMA database_list"); const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) throw new Error("Phase 60 client is not bound to owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 AS ok FROM migrations WHERE name = ? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  if (migration.rows.length !== 1) throw new Error("Phase 60 owned copy must be migrated through 032.");
}
const TARGETS = [
  { id: PHASE60_CUSTOM_845_ID, oldSlug: "百乐-pilot-845-urushi", slug: "pilot-custom-845", name: "百乐 Pilot Custom 845" },
  { id: PHASE60_CUSTOM_742_ID, oldSlug: "百乐-pilot-custom-742", slug: "pilot-custom-742", name: "百乐 Pilot Custom 742" },
  { id: PHASE60_CUSTOM_743_ID, oldSlug: "百乐-pilot-custom-743", slug: "pilot-custom-743", name: "百乐 Pilot Custom 743" },
  { id: PHASE60_CUSTOM_912_ID, oldSlug: "百乐-pilot-912", slug: "pilot-custom-heritage-912", name: "百乐 Pilot Custom Heritage 912" },
  { id: PHASE60_ELITE_95S_ID, oldSlug: "百乐-pilot-elite-95s", slug: "pilot-elite-95s", name: "百乐 Pilot Elite 95S" },
] as const;
async function installRedirect(tx: Transaction, source: string, target: string) {
  const old = await tx.execute({ sql: "SELECT target_path, redirect_kind FROM entity_redirects WHERE source_path = ?", args: [source] });
  if (old.rows.length) { if (String(old.rows[0]?.target_path) !== target || String(old.rows[0]?.redirect_kind) !== "permanent") throw new Error(`Phase 60 conflicting redirect ${source}`); return; }
  const key = `${source}->${target}`; const batchId = stableId("phase60-batch", key); const actionId = stableId("phase60-action", key);
  await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_batches (id, source_key, source_checksum, status, note) VALUES (?, ?, ?, 'applied', ?)", args: [batchId, key, digest(key), "Phase 60 Pilot raw slug canonicalization"] });
  await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_actions (id, batch_id, source_row_key, action_kind, action_checksum, status, note) VALUES (?, ?, ?, 'rename', ?, 'applied', ?)", args: [actionId, batchId, key, digest(key), "Canonical Pilot model slug"] });
  await tx.execute({ sql: "INSERT INTO entity_redirects (id, batch_id, action_id, source_path, target_path, redirect_kind, fallback_reason) VALUES (?, ?, ?, ?, ?, 'permanent', 'canonical_slug_rename')", args: [stableId("phase60-redirect", key), batchId, actionId, source, target] });
}
async function topology(client: Client) {
  const tx = await client.transaction("write");
  try {
    const brand = await tx.execute({ sql: "SELECT type, slug FROM entities WHERE id = ?", args: [PHASE60_PILOT_BRAND_ID] });
    if (brand.rows.length !== 1 || String(brand.rows[0]?.type) !== "brand" || String(brand.rows[0]?.slug) !== "pilot") throw new Error("Phase 60 Pilot brand identity mismatch.");
    for (const target of TARGETS) {
      const entity = await tx.execute({ sql: "SELECT type, slug FROM entities WHERE id = ?", args: [target.id] });
      if (entity.rows.length !== 1 || String(entity.rows[0]?.type) !== "pen") throw new Error(`Phase 60 missing raw Pilot entity: ${target.id}`);
      const current = String(entity.rows[0]?.slug);
      if (current !== target.oldSlug && current !== target.slug) throw new Error(`Phase 60 unexpected Pilot slug: ${current}`);
      if (current === target.oldSlug) { await tx.execute({ sql: "UPDATE entities SET slug = ?, name = ? WHERE id = ?", args: [target.slug, target.name, target.id] }); await installRedirect(tx, `/pen/${target.oldSlug}`, `/pen/${target.slug}`); }
      await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id = ? AND link_type = 'made_by' AND target_id <> ?", args: [target.id, PHASE60_PILOT_BRAND_ID] });
      await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'made_by', ?)", args: [stableId("phase60-link", `${target.id}:made_by`), target.id, PHASE60_PILOT_BRAND_ID, "Phase 60 Pilot canonical maker topology"] });
      const makers = await tx.execute({ sql: "SELECT target_id FROM entity_links WHERE source_id = ? AND link_type = 'made_by'", args: [target.id] });
      if (makers.rows.length !== 1 || String(makers.rows[0]?.target_id) !== PHASE60_PILOT_BRAND_ID) throw new Error(`Phase 60 ambiguous Pilot maker: ${target.id}`);
    }
    await tx.commit();
  } catch (error) { if (!tx.closed) await tx.rollback(); throw error; }
}
export async function applyPhase60PilotP0Content(client: Client, options: ApplyPhase60Options): Promise<ApplyPhase60Result> {
  await assertOwned(client, options); await topology(client); const result = await applyCuratedContentPacks(client, options, structuredClone(phase60PilotP0Packs)); assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot); return result;
}
