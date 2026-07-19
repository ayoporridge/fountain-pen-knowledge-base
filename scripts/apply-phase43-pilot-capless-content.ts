import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { Client } from "@libsql/client";
import { assertCatalogSnapshotUnchanged } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import { PHASE43_CAPLESS_ID, PHASE43_CAPLESS_LS_ID, PHASE43_DECIMO_ID, PHASE43_PILOT_BRAND_ID, PHASE43_PILOT_UMBRELLA_ID, phase43PilotCaplessPacks } from "./data/phase43-pilot-capless";

export type ApplyPhase43Options = ApplyPhase22Options;
export type ApplyPhase43Result = ApplyPhase22Result;
const OLD_UMBRELLA_SLUG = "百乐-pilot-capless-decimo";
function digest(value: string): string { return createHash("sha256").update(value).digest("hex"); }
function stableId(prefix: string, value: string): string { return `${prefix}-${digest(value).slice(0, 24)}`; }
function isInside(candidate: string, root: string): boolean { const relative = path.relative(root, candidate); return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative); }
function assertNoRemoteSelection(env: NodeJS.ProcessEnv): void { for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) if (env[key]?.trim()) throw new Error(`Phase 43 refuses inherited remote selection: ${key}.`); }
async function assertOwned(client: Client, options: ApplyPhase43Options): Promise<void> {
  assertNoRemoteSelection(options.env ?? process.env); assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const ownedRoot = fs.realpathSync.native(options.ownedRoot); const databasePath = fs.realpathSync.native(options.databasePath); const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(ownedRoot).isDirectory() || !fs.statSync(databasePath).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !isInside(databasePath, ownedRoot)) throw new Error("Phase 43 owned catalog authority check failed.");
  const own = fs.statSync(databasePath, { bigint: true }); const real = fs.statSync(protectedPath, { bigint: true }); if (databasePath === protectedPath || (own.dev === real.dev && own.ino === real.ino)) throw new Error("Phase 43 refuses protected catalog or hard-link alias.");
  const listed = await client.execute("PRAGMA database_list"); const main = listed.rows.find((row) => String(row.name) === "main"); if (!main?.file || fs.realpathSync.native(String(main.file)) !== databasePath) throw new Error("Phase 43 client is not bound to owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 AS ok FROM migrations WHERE name = ? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] }); if (migration.rows.length !== 1) throw new Error("Phase 43 owned copy must be migrated through 032.");
}
async function installRedirect(tx: Awaited<ReturnType<Client["transaction"]>>, input: { sourcePath: string; targetPath: string; actionId: string; batchId: string }): Promise<void> {
  const existing = await tx.execute({ sql: "SELECT target_path, redirect_kind FROM entity_redirects WHERE source_path = ?", args: [input.sourcePath] });
  if (existing.rows.length > 0) { if (String(existing.rows[0]?.target_path ?? "") !== input.targetPath || String(existing.rows[0]?.redirect_kind ?? "") !== "permanent") throw new Error(`Phase 43 conflicting redirect for ${input.sourcePath}.`); return; }
  await tx.execute({ sql: "INSERT INTO entity_redirects (id, batch_id, action_id, source_path, target_path, redirect_kind, fallback_reason) VALUES (?, ?, ?, ?, ?, 'permanent', 'collection_identity_split')", args: [stableId("phase43-redirect", input.sourcePath), input.batchId, input.actionId, input.sourcePath, input.targetPath] });
}
async function retireUmbrella(client: Client): Promise<void> {
  const tx = await client.transaction("write");
  try {
    const row = await tx.execute({ sql: "SELECT id, type, slug FROM entities WHERE id = ?", args: [PHASE43_PILOT_UMBRELLA_ID] });
    if (row.rows.length !== 1 || String(row.rows[0]?.type) !== "pen" || String(row.rows[0]?.slug) !== OLD_UMBRELLA_SLUG) throw new Error("Phase 43 Pilot Capless umbrella identity mismatch.");
    const batchId = stableId("phase43-batch", "pilot-capless-umbrella-retire"); const actionId = stableId("phase43-action", "pilot-capless-umbrella-retire");
    await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_batches (id, source_key, source_checksum, status, note) VALUES (?, ?, ?, 'applied', ?)", args: [batchId, "pilot-capless-umbrella-retire", digest("pilot-capless-umbrella-retire"), "Retire mixed Capless/Decimo umbrella; publish concrete full-size, Decimo and LS pages."] });
    await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_actions (id, batch_id, source_row_key, action_kind, action_checksum, source_entity_id, target_entity_id, status, note) VALUES (?, ?, ?, 'retire', ?, ?, ?, 'applied', ?)", args: [actionId, batchId, "pilot-capless-umbrella-retire", digest(`${PHASE43_PILOT_UMBRELLA_ID}\0${PHASE43_PILOT_BRAND_ID}`), PHASE43_PILOT_UMBRELLA_ID, PHASE43_PILOT_BRAND_ID, "Retire mixed Capless/Decimo umbrella identity."] });
    await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id = ?", args: [PHASE43_PILOT_UMBRELLA_ID] });
    await tx.execute({ sql: "UPDATE entity_publications SET status = 'retired', blockers_json = ?, approved_content_hash = NULL, reviewed_content_revision = NULL, reviewed_contract_version = NULL, reviewed_by = NULL, reviewed_at = NULL, published_at = NULL, review_notes = ?, updated_at = datetime('now') WHERE entity_id = ? AND status <> 'retired'", args: ['["taxonomy_split"]', "Mixed Capless/Decimo umbrella retired; use concrete Capless, Decimo or Capless LS pages.", PHASE43_PILOT_UMBRELLA_ID] });
    await installRedirect(tx, { sourcePath: `/pen/${OLD_UMBRELLA_SLUG}`, targetPath: "/brand/pilot", actionId, batchId });
    await tx.commit();
  } catch (error) { if (!tx.closed) await tx.rollback(); throw error; }
}
async function ensureTopology(client: Client): Promise<void> {
  const tx = await client.transaction("write");
  try {
    const brand = await tx.execute({ sql: "SELECT type, slug FROM entities WHERE id = ?", args: [PHASE43_PILOT_BRAND_ID] }); if (brand.rows.length !== 1 || String(brand.rows[0]?.type) !== "brand" || String(brand.rows[0]?.slug) !== "pilot") throw new Error("Phase 43 Pilot brand identity missing.");
    const pens = [{ id: PHASE43_CAPLESS_ID, slug: "pilot-capless", name: "百乐 Pilot Capless" }, { id: PHASE43_DECIMO_ID, slug: "pilot-capless-decimo", name: "百乐 Pilot Capless Decimo" }, { id: PHASE43_CAPLESS_LS_ID, slug: "pilot-capless-ls", name: "百乐 Pilot Capless LS" }];
    for (const pen of pens) {
      const existing = await tx.execute({ sql: "SELECT id, type, slug FROM entities WHERE id = ? OR slug = ? ORDER BY id", args: [pen.id, pen.slug] });
      if (existing.rows.length === 0) await tx.execute({ sql: "INSERT INTO entities (id, type, slug, name) VALUES (?, 'pen', ?, ?)", args: [pen.id, pen.slug, pen.name] });
      else if (existing.rows.length !== 1 || String(existing.rows[0]?.id) !== pen.id || String(existing.rows[0]?.type) !== "pen" || String(existing.rows[0]?.slug) !== pen.slug) throw new Error(`Phase 43 entity/slug collision: ${pen.slug}`);
      await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id = ? AND link_type = 'made_by' AND target_id <> ?", args: [pen.id, PHASE43_PILOT_BRAND_ID] });
      await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'made_by', ?)", args: [stableId("phase43-link", `${pen.id}:made_by:${PHASE43_PILOT_BRAND_ID}`), pen.id, PHASE43_PILOT_BRAND_ID, "Phase 43 concrete Pilot Capless family maker"] });
    }
    await tx.commit();
  } catch (error) { if (!tx.closed) await tx.rollback(); throw error; }
}
export async function applyPhase43PilotCaplessContent(client: Client, options: ApplyPhase43Options): Promise<ApplyPhase43Result> {
  await assertOwned(client, options); await retireUmbrella(client); await ensureTopology(client);
  const result = await applyCuratedContentPacks(client, options, structuredClone(phase43PilotCaplessPacks));
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot); return result;
}

