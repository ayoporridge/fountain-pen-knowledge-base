import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { Client, Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import { PHASE38_M200_ID, PHASE38_P457_ID, PHASE38_PELIKAN_ID, phase38PelikanM200P457Packs } from "./data/phase38-pelikan-m200-p457";

export type ApplyPhase38Options = ApplyPhase22Options;
export type ApplyPhase38Result = ApplyPhase22Result;

const PENS = [{ id: PHASE38_M200_ID, slug: "pelikan-m200", legacySlug: "百利金-pelikan-m200", name: "百利金 Pelikan M200" }, { id: PHASE38_P457_ID, slug: "pelikan-twist-p457", legacySlug: "百利金-pelikan-p457", name: "百利金 Pelikan Twist P457" }] as const;
function digest(value: string): string { return createHash("sha256").update(value).digest("hex"); }
function stableId(prefix: string, value: string): string { return `${prefix}-${digest(value).slice(0, 24)}`; }
function isInside(candidate: string, root: string): boolean { const relative = path.relative(root, candidate); return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative); }
function assertNoRemoteSelection(env: NodeJS.ProcessEnv): void { for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) if (env[key]?.trim()) throw new Error(`Phase 38 refuses inherited remote selection: ${key}.`); }
async function assertOwned(client: Client, options: ApplyPhase38Options): Promise<void> {
  assertNoRemoteSelection(options.env ?? process.env); assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const ownedRoot = fs.realpathSync.native(options.ownedRoot); const databasePath = fs.realpathSync.native(options.databasePath); const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(ownedRoot).isDirectory() || !fs.statSync(databasePath).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !isInside(databasePath, ownedRoot)) throw new Error("Phase 38 owned catalog authority check failed.");
  const own = fs.statSync(databasePath, { bigint: true }); const real = fs.statSync(protectedPath, { bigint: true }); if (databasePath === protectedPath || (own.dev === real.dev && own.ino === real.ino)) throw new Error("Phase 38 refuses protected catalog or hard-link alias.");
  const listed = await client.execute("PRAGMA database_list"); const main = listed.rows.find((row) => String(row.name) === "main"); if (!main?.file || fs.realpathSync.native(String(main.file)) !== databasePath) throw new Error("Phase 38 client is not bound to owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 AS ok FROM migrations WHERE name = ? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] }); if (migration.rows.length !== 1) throw new Error("Phase 38 owned copy must be migrated through 032.");
}
async function ensureTopology(client: Client): Promise<void> {
  const tx = await client.transaction("write");
  try {
    const taxonomyKey = "phase38-pelikan-m200-p457-identity-v1"; const batchId = stableId("taxonomy-batch", taxonomyKey);
    await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_batches (id, source_key, source_checksum, status, note) VALUES (?, ?, ?, 'applied', ?)", args: [batchId, taxonomyKey, digest(taxonomyKey), "Canonicalize Pelikan M200 and Twist P457 slugs from imported Chinese slugs."] });
    const brand = await tx.execute({ sql: "SELECT type, slug FROM entities WHERE id = ?", args: [PHASE38_PELIKAN_ID] }); if (brand.rows.length !== 1 || String(brand.rows[0]?.type) !== "brand" || String(brand.rows[0]?.slug) !== "pelikan") throw new Error("Phase 38 Pelikan brand identity mismatch.");
    for (const pen of PENS) {
      const existing = await tx.execute({ sql: "SELECT id, type, slug FROM entities WHERE id = ? OR slug = ? ORDER BY id", args: [pen.id, pen.slug] });
      const actualSlug = String(existing.rows[0]?.slug ?? ""); if (existing.rows.length !== 1 || String(existing.rows[0]?.id) !== pen.id || String(existing.rows[0]?.type) !== "pen" || (actualSlug !== pen.slug && actualSlug !== pen.legacySlug)) throw new Error(`Phase 38 entity/slug identity mismatch: ${pen.slug}`);
      const collision = await tx.execute({ sql: "SELECT id FROM entities WHERE slug = ? AND id <> ?", args: [pen.slug, pen.id] }); if (collision.rows.length > 0) throw new Error(`Phase 38 canonical slug collision: ${pen.slug}`);
      const actionId = stableId("taxonomy-action", `${pen.id}:${pen.legacySlug}:${pen.slug}`);
      await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_actions (id, batch_id, source_row_key, action_kind, action_checksum, source_entity_id, target_entity_id, status, note) VALUES (?, ?, ?, 'rename', ?, ?, ?, 'applied', ?)", args: [actionId, batchId, pen.id, digest(`${pen.id}\0${pen.legacySlug}\0${pen.slug}`), pen.id, pen.id, "Canonicalize imported slug without changing model identity."] });
      if (actualSlug === pen.legacySlug) {
        await tx.execute({ sql: "UPDATE entities SET slug = ?, name = ? WHERE id = ?", args: [pen.slug, pen.name, pen.id] });
        await tx.execute({ sql: "INSERT OR IGNORE INTO entity_redirects (id, batch_id, action_id, source_path, target_path, redirect_kind, fallback_reason) VALUES (?, ?, ?, ?, ?, 'permanent', NULL)", args: [stableId("phase38-redirect", pen.legacySlug), batchId, actionId, `/pen/${pen.legacySlug}`, `/pen/${pen.slug}`] });
      }
      await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id = ? AND link_type = 'made_by' AND target_id <> ?", args: [pen.id, PHASE38_PELIKAN_ID] });
      await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'made_by', ?)", args: [stableId("phase38-link", `${pen.id}:made_by:${PHASE38_PELIKAN_ID}`), pen.id, PHASE38_PELIKAN_ID, "Phase 38 canonical Pelikan maker"] });
      const maker = await tx.execute({ sql: "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'", args: [pen.id, PHASE38_PELIKAN_ID] }); if (Number(maker.rows[0]?.value ?? 0) !== 1) throw new Error(`Phase 38 maker topology failed: ${pen.slug}`);
    }
    await tx.commit();
  } catch (error) { if (!tx.closed) await tx.rollback(); throw error; }
}
export async function applyPhase38PelikanM200P457Content(client: Client, options: ApplyPhase38Options): Promise<ApplyPhase38Result> { await assertOwned(client, options); await ensureTopology(client); const result = await applyCuratedContentPacks(client, options, structuredClone(phase38PelikanM200P457Packs)); assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot); return result; }
