import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { Client } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import {
  PHASE59_BENU_BRAND_ID,
  PHASE59_BRIOLETTE_ID,
  PHASE59_NAHVALUR_BRAND_ID,
  PHASE59_ORIGINAL_PLUS_ID,
  PHASE59_SCHUYLKILL_ID,
  PHASE59_TRUE_UNICORN_ID,
  phase59BenuNahvalurPacks,
} from "./data/phase59-benu-nahvalur";

export type ApplyPhase59Options = ApplyPhase22Options;
export type ApplyPhase59Result = ApplyPhase22Result;

const BRAND_ROWS = [
  { id: PHASE59_BENU_BRAND_ID, slug: "benu", name: "BENU" },
  { id: PHASE59_NAHVALUR_BRAND_ID, slug: "nahvalur", name: "Nahvalur（原 Narwhal）" },
] as const;
const PEN_ROWS = [
  { id: PHASE59_BRIOLETTE_ID, slug: "benu-briolette", name: "BENU Briolette", brandId: PHASE59_BENU_BRAND_ID },
  { id: PHASE59_TRUE_UNICORN_ID, slug: "benu-talisman-true-unicorn", name: "BENU Talisman True Unicorn", brandId: PHASE59_BENU_BRAND_ID },
  { id: PHASE59_ORIGINAL_PLUS_ID, slug: "nahvalur-original-plus", name: "Nahvalur Original Plus（原 Narwhal）", brandId: PHASE59_NAHVALUR_BRAND_ID },
  { id: PHASE59_SCHUYLKILL_ID, slug: "nahvalur-schuylkill", name: "Nahvalur Schuylkill（原 Narwhal）", brandId: PHASE59_NAHVALUR_BRAND_ID },
] as const;

function digest(value: string): string { return createHash("sha256").update(value).digest("hex"); }
function stableId(prefix: string, value: string): string { return `${prefix}-${digest(value).slice(0, 24)}`; }
function isInside(candidate: string, root: string): boolean { const relative = path.relative(root, candidate); return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative); }

function assertNoRemoteSelection(env: NodeJS.ProcessEnv): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (env[key]?.trim()) throw new Error(`Phase 59 refuses inherited remote selection: ${key}.`);
  }
}

async function assertOwned(client: Client, options: ApplyPhase59Options): Promise<void> {
  assertNoRemoteSelection(options.env ?? process.env);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const databasePath = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(ownedRoot).isDirectory() || !fs.statSync(databasePath).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !isInside(databasePath, ownedRoot)) throw new Error("Phase 59 database must be a non-symlink file inside the owned root.");
  const own = fs.statSync(databasePath, { bigint: true });
  const real = fs.statSync(protectedPath, { bigint: true });
  if (databasePath === protectedPath || (own.dev === real.dev && own.ino === real.ino)) throw new Error("Phase 59 refuses protected catalog or hard-link alias.");
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== databasePath) throw new Error("Phase 59 client is not bound to the authorized owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 AS ok FROM migrations WHERE name = ? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  if (migration.rows.length !== 1) throw new Error("Phase 59 owned copy must be migrated through 032.");
}

async function ensureTopology(client: Client): Promise<void> {
  const tx = await client.transaction("write");
  try {
    const batchKey = "phase59-benu-nahvalur-topology-v1";
    await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_batches (id, source_key, source_checksum, status, note) VALUES (?, ?, ?, 'applied', ?)", args: [stableId("phase59-batch", batchKey), batchKey, digest(batchKey), "Create BENU and Nahvalur canonical brand/model topology."] });
    for (const brand of BRAND_ROWS) {
      const existing = await tx.execute({ sql: "SELECT id, type, slug, name FROM entities WHERE id = ? OR slug = ? ORDER BY id", args: [brand.id, brand.slug] });
      if (existing.rows.length === 0) {
        await tx.execute({ sql: "INSERT INTO entities (id, type, slug, name) VALUES (?, 'brand', ?, ?)", args: [brand.id, brand.slug, brand.name] });
      } else if (existing.rows.length !== 1 || String(existing.rows[0]?.id) !== brand.id || String(existing.rows[0]?.type) !== "brand" || String(existing.rows[0]?.slug) !== brand.slug) {
        throw new Error(`Phase 59 brand identity/slug collision: ${brand.slug}`);
      }
    }
    for (const pen of PEN_ROWS) {
      const existing = await tx.execute({ sql: "SELECT id, type, slug FROM entities WHERE id = ? OR slug = ? ORDER BY id", args: [pen.id, pen.slug] });
      if (existing.rows.length === 0) {
        await tx.execute({ sql: "INSERT INTO entities (id, type, slug, name) VALUES (?, 'pen', ?, ?)", args: [pen.id, pen.slug, pen.name] });
      } else if (existing.rows.length !== 1 || String(existing.rows[0]?.id) !== pen.id || String(existing.rows[0]?.type) !== "pen" || String(existing.rows[0]?.slug) !== pen.slug) {
        throw new Error(`Phase 59 pen identity/slug collision: ${pen.slug}`);
      }
      await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id = ? AND link_type = 'made_by' AND target_id <> ?", args: [pen.id, pen.brandId] });
      await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'made_by', ?)", args: [stableId("phase59-link", `${pen.id}:made_by:${pen.brandId}`), pen.id, pen.brandId, "Phase 59 canonical maker topology"] });
      const maker = await tx.execute({ sql: "SELECT count(*) AS total FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'", args: [pen.id, pen.brandId] });
      if (Number(maker.rows[0]?.total ?? 0) !== 1) throw new Error(`Phase 59 maker topology failed: ${pen.slug}`);
    }
    await tx.commit();
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
}

export async function applyPhase59BenuNahvalurContent(client: Client, options: ApplyPhase59Options): Promise<ApplyPhase59Result> {
  await assertOwned(client, options);
  await ensureTopology(client);
  const benuIds = new Set([PHASE59_BENU_BRAND_ID, PHASE59_BRIOLETTE_ID, PHASE59_TRUE_UNICORN_ID]);
  const nahvalurIds = new Set([PHASE59_NAHVALUR_BRAND_ID, PHASE59_ORIGINAL_PLUS_ID, PHASE59_SCHUYLKILL_ID]);
  const entities: ApplyPhase59Result["entities"] = [];
  for (const group of [phase59BenuNahvalurPacks.filter((pack) => benuIds.has(pack.entityId)), phase59BenuNahvalurPacks.filter((pack) => nahvalurIds.has(pack.entityId))]) {
    const result = await applyCuratedContentPacks(client, options, structuredClone(group));
    entities.push(...result.entities);
  }
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return { entities };
}

function cliValue(name: string): string | null { const index = process.argv.indexOf(name); return index === -1 ? null : process.argv[index + 1] ?? null; }

async function main(): Promise<void> {
  const workspaceRoot = process.cwd();
  const databasePath = cliValue("--database");
  const ownedRoot = cliValue("--owned-root");
  const protectedCatalogPath = cliValue("--protected-catalog");
  if (!databasePath || !ownedRoot || !protectedCatalogPath) throw new Error("Usage: tsx scripts/apply-phase59-benu-nahvalur-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  const { createClient } = await import("@libsql/client");
  const client = createClient({ url: `file:${path.resolve(databasePath)}` });
  try {
    const result = await applyPhase59BenuNahvalurContent(client, { workspaceRoot, reviewer: cliValue("--reviewer") ?? "phase59-benu-nahvalur-curated-content", databasePath: path.resolve(databasePath), ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: path.resolve(protectedCatalogPath), protectedCatalogSnapshot: snapshotCatalogFiles(path.resolve(protectedCatalogPath)), env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } });
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } finally { client.close(); }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
