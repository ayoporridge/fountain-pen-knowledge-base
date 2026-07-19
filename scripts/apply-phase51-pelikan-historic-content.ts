import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { Client } from "@libsql/client";
import { assertCatalogSnapshotUnchanged } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import { PHASE51_MODEL_100_ID, PHASE51_MODEL_100N_ID, PHASE51_PELIKANO_ID, PHASE51_PELIKAN_ID, phase51PelikanHistoricPacks } from "./data/phase51-pelikan-historic";

export type ApplyPhase51Options = ApplyPhase22Options;
export type ApplyPhase51Result = ApplyPhase22Result;

const PENS = [
  { id: PHASE51_MODEL_100_ID, slug: "pelikan-model-100", name: "百利金 Pelikan Model 100" },
  { id: PHASE51_MODEL_100N_ID, slug: "pelikan-model-100n", name: "百利金 Pelikan Model 100N" },
  { id: PHASE51_PELIKANO_ID, slug: "pelikan-pelikano", name: "百利金 Pelikan Pelikano" },
] as const;

function digest(value: string): string { return createHash("sha256").update(value).digest("hex"); }
function stableId(prefix: string, value: string): string { return `${prefix}-${digest(value).slice(0, 24)}`; }
function isInside(candidate: string, root: string): boolean { const relative = path.relative(root, candidate); return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative); }
function assertNoRemoteSelection(env: NodeJS.ProcessEnv): void { for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) if (env[key]?.trim()) throw new Error(`Phase 51 refuses inherited remote selection: ${key}.`); }

async function assertOwned(client: Client, options: ApplyPhase51Options): Promise<void> {
  assertNoRemoteSelection(options.env ?? process.env);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const databasePath = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(ownedRoot).isDirectory() || !fs.statSync(databasePath).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !isInside(databasePath, ownedRoot)) throw new Error("Phase 51 owned catalog authority check failed.");
  const own = fs.statSync(databasePath, { bigint: true });
  const real = fs.statSync(protectedPath, { bigint: true });
  if (databasePath === protectedPath || (own.dev === real.dev && own.ino === real.ino)) throw new Error("Phase 51 refuses protected catalog or hard-link alias.");
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== databasePath) throw new Error("Phase 51 client is not bound to owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 AS ok FROM migrations WHERE name = ? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  if (migration.rows.length !== 1) throw new Error("Phase 51 owned copy must be migrated through 032.");
}

async function ensureTopology(client: Client): Promise<void> {
  const tx = await client.transaction("write");
  try {
    const brand = await tx.execute({ sql: "SELECT type, slug FROM entities WHERE id = ?", args: [PHASE51_PELIKAN_ID] });
    if (brand.rows.length !== 1 || String(brand.rows[0]?.type) !== "brand" || String(brand.rows[0]?.slug) !== "pelikan") throw new Error("Phase 51 Pelikan brand identity mismatch.");
    const batchKey = "phase51-pelikan-historic-topology-v1";
    await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_batches (id, source_key, source_checksum, status, note) VALUES (?, ?, ?, 'applied', ?)", args: [stableId("phase51-batch", batchKey), batchKey, digest(batchKey), "Create canonical Pelikan Model 100, 100N and Pelikano entities."] });
    for (const pen of PENS) {
      const existing = await tx.execute({ sql: "SELECT id, type, slug FROM entities WHERE id = ? OR slug = ? ORDER BY id", args: [pen.id, pen.slug] });
      if (existing.rows.length === 0) {
        await tx.execute({ sql: "INSERT INTO entities (id, type, slug, name) VALUES (?, 'pen', ?, ?)", args: [pen.id, pen.slug, pen.name] });
      } else if (existing.rows.length !== 1 || String(existing.rows[0]?.id) !== pen.id || String(existing.rows[0]?.type) !== "pen" || String(existing.rows[0]?.slug) !== pen.slug) {
        throw new Error(`Phase 51 entity/slug collision: ${pen.slug}`);
      }
      await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id = ? AND link_type = 'made_by' AND target_id <> ?", args: [pen.id, PHASE51_PELIKAN_ID] });
      await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'made_by', ?)", args: [stableId("phase51-link", `${pen.id}:made_by:${PHASE51_PELIKAN_ID}`), pen.id, PHASE51_PELIKAN_ID, "Phase 51 canonical Pelikan maker"] });
      const maker = await tx.execute({ sql: "SELECT count(*) AS total FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'", args: [pen.id, PHASE51_PELIKAN_ID] });
      if (Number(maker.rows[0]?.total ?? 0) !== 1) throw new Error(`Phase 51 maker topology failed: ${pen.slug}`);
    }
    await tx.commit();
  } catch (error) { if (!tx.closed) await tx.rollback(); throw error; }
}

export async function applyPhase51PelikanHistoricContent(client: Client, options: ApplyPhase51Options): Promise<ApplyPhase51Result> {
  await assertOwned(client, options);
  await ensureTopology(client);
  const result = await applyCuratedContentPacks(client, options, structuredClone(phase51PelikanHistoricPacks));
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return result;
}
