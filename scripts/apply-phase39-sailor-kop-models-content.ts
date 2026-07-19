import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { Client } from "@libsql/client";
import { assertCatalogSnapshotUnchanged } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import { PHASE39_KING_PROFIT_EBONITE_ID, PHASE39_KING_PROFIT_ST_ID, PHASE39_NAGINATA_7121_ID, PHASE39_PRO_GEAR_KOP_ID, PHASE39_SAILOR_BRAND_ID, phase39SailorKopModelPacks } from "./data/phase39-sailor-kop-models";

export type ApplyPhase39Options = ApplyPhase22Options;
export type ApplyPhase39Result = ApplyPhase22Result;
const PENS = [
  { id: PHASE39_KING_PROFIT_ST_ID, slug: "sailor-king-profit-st-11-6001", name: "写乐 Sailor King Profit ST（11-6001）" },
  { id: PHASE39_KING_PROFIT_EBONITE_ID, slug: "sailor-king-profit-ebonite-11-7002", name: "写乐 Sailor King Profit Ebonite（11-7002）" },
  { id: PHASE39_PRO_GEAR_KOP_ID, slug: "sailor-professional-gear-kop-10-9618", name: "写乐 Sailor Professional Gear KOP（10-9618）" },
  { id: PHASE39_NAGINATA_7121_ID, slug: "sailor-naginata-togi-10-7121", name: "写乐 Sailor Naginata Togi 长刀研（10-7121）" },
] as const;
function digest(value: string): string { return createHash("sha256").update(value).digest("hex"); }
function stableId(prefix: string, value: string): string { return `${prefix}-${digest(value).slice(0, 24)}`; }
function isInside(candidate: string, root: string): boolean { const relative = path.relative(root, candidate); return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative); }
function assertNoRemoteSelection(env: NodeJS.ProcessEnv): void { for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) if (env[key]?.trim()) throw new Error(`Phase 39 refuses inherited remote selection: ${key}.`); }
async function assertOwned(client: Client, options: ApplyPhase39Options): Promise<void> {
  assertNoRemoteSelection(options.env ?? process.env); assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const ownedRoot = fs.realpathSync.native(options.ownedRoot); const databasePath = fs.realpathSync.native(options.databasePath); const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(ownedRoot).isDirectory() || !fs.statSync(databasePath).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !isInside(databasePath, ownedRoot)) throw new Error("Phase 39 owned catalog authority check failed.");
  const own = fs.statSync(databasePath, { bigint: true }); const real = fs.statSync(protectedPath, { bigint: true }); if (databasePath === protectedPath || (own.dev === real.dev && own.ino === real.ino)) throw new Error("Phase 39 refuses protected catalog or hard-link alias.");
  const listed = await client.execute("PRAGMA database_list"); const main = listed.rows.find((row) => String(row.name) === "main"); if (!main?.file || fs.realpathSync.native(String(main.file)) !== databasePath) throw new Error("Phase 39 client is not bound to owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 AS ok FROM migrations WHERE name = ? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] }); if (migration.rows.length !== 1) throw new Error("Phase 39 owned copy must be migrated through 032.");
}
async function ensureTopology(client: Client): Promise<void> {
  const tx = await client.transaction("write");
  try {
    const brand = await tx.execute({ sql: "SELECT type, slug FROM entities WHERE id = ?", args: [PHASE39_SAILOR_BRAND_ID] }); if (brand.rows.length !== 1 || String(brand.rows[0]?.type) !== "brand" || String(brand.rows[0]?.slug) !== "sailor") throw new Error("Phase 39 Sailor brand identity mismatch.");
    for (const pen of PENS) {
      const existing = await tx.execute({ sql: "SELECT id, type, slug FROM entities WHERE id = ? OR slug = ? ORDER BY id", args: [pen.id, pen.slug] });
      if (existing.rows.length === 0) await tx.execute({ sql: "INSERT INTO entities (id, type, slug, name) VALUES (?, 'pen', ?, ?)", args: [pen.id, pen.slug, pen.name] });
      else if (existing.rows.length !== 1 || String(existing.rows[0]?.id) !== pen.id || String(existing.rows[0]?.type) !== "pen" || String(existing.rows[0]?.slug) !== pen.slug) throw new Error(`Phase 39 entity/slug collision: ${pen.slug}`);
      await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id = ? AND link_type = 'made_by' AND target_id <> ?", args: [pen.id, PHASE39_SAILOR_BRAND_ID] });
      await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'made_by', ?)", args: [stableId("phase39-link", `${pen.id}:made_by:${PHASE39_SAILOR_BRAND_ID}`), pen.id, PHASE39_SAILOR_BRAND_ID, "Phase 39 canonical Sailor KOP model maker"] });
      const maker = await tx.execute({ sql: "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'", args: [pen.id, PHASE39_SAILOR_BRAND_ID] }); if (Number(maker.rows[0]?.value ?? 0) !== 1) throw new Error(`Phase 39 maker topology failed: ${pen.slug}`);
    }
    await tx.commit();
  } catch (error) { if (!tx.closed) await tx.rollback(); throw error; }
}
export async function applyPhase39SailorKopModelsContent(client: Client, options: ApplyPhase39Options): Promise<ApplyPhase39Result> { await assertOwned(client, options); await ensureTopology(client); const result = await applyCuratedContentPacks(client, options, structuredClone(phase39SailorKopModelPacks)); assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot); return result; }
