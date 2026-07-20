import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { Client } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import {
  PHASE91_ALUMINA_MODEL_C_ID,
  PHASE91_ALUMINA_MODEL_C_SLUG,
  PHASE91_BIRMINGHAM_BRAND_ID,
  PHASE91_BIRMINGHAM_SLUG,
  phase91BirminghamAluminaPacks,
} from "./data/phase91-birmingham-alumina";

export type ApplyPhase91Options = ApplyPhase22Options;
export type ApplyPhase91Result = ApplyPhase22Result;

function digest(value: string): string { return createHash("sha256").update(value).digest("hex"); }
function stableId(prefix: string, value: string): string { return `${prefix}-${digest(value).slice(0, 24)}`; }
function isInside(candidate: string, root: string): boolean { const relative = path.relative(root, candidate); return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative); }

function assertNoRemoteSelection(env: NodeJS.ProcessEnv): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (env[key]?.trim()) throw new Error(`Phase 91 refuses inherited remote selection: ${key}.`);
  }
}

async function assertOwned(client: Client, options: ApplyPhase91Options): Promise<void> {
  assertNoRemoteSelection(options.env ?? process.env);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const databasePath = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(ownedRoot).isDirectory() || !fs.statSync(databasePath).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !isInside(databasePath, ownedRoot)) throw new Error("Phase 91 database must be a non-symlink file inside the owned root.");
  const own = fs.statSync(databasePath, { bigint: true });
  const real = fs.statSync(protectedPath, { bigint: true });
  if (databasePath === protectedPath || (own.dev === real.dev && own.ino === real.ino)) throw new Error("Phase 91 refuses protected catalog or hard-link alias.");
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== databasePath) throw new Error("Phase 91 client is not bound to the authorized owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 AS ok FROM migrations WHERE name = ? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  if (migration.rows.length !== 1) throw new Error("Phase 91 owned copy must be migrated through 032.");
}

async function ensureTopology(client: Client): Promise<void> {
  const tx = await client.transaction("write");
  try {
    const brand = await tx.execute({ sql: "SELECT id, type, slug FROM entities WHERE id = ? OR slug = ?", args: [PHASE91_BIRMINGHAM_BRAND_ID, PHASE91_BIRMINGHAM_SLUG] });
    if (brand.rows.length === 0) await tx.execute({ sql: "INSERT INTO entities (id, type, slug, name) VALUES (?, 'brand', ?, ?)", args: [PHASE91_BIRMINGHAM_BRAND_ID, PHASE91_BIRMINGHAM_SLUG, "Birmingham Pen Company"] });
    else if (brand.rows.length !== 1 || String(brand.rows[0]?.id) !== PHASE91_BIRMINGHAM_BRAND_ID || String(brand.rows[0]?.type) !== "brand" || String(brand.rows[0]?.slug) !== PHASE91_BIRMINGHAM_SLUG) throw new Error("Phase 91 Birmingham brand identity collision.");

    const pen = await tx.execute({ sql: "SELECT id, type, slug FROM entities WHERE id = ? OR slug = ?", args: [PHASE91_ALUMINA_MODEL_C_ID, PHASE91_ALUMINA_MODEL_C_SLUG] });
    if (pen.rows.length === 0) await tx.execute({ sql: "INSERT INTO entities (id, type, slug, name) VALUES (?, 'pen', ?, ?)", args: [PHASE91_ALUMINA_MODEL_C_ID, PHASE91_ALUMINA_MODEL_C_SLUG, "Birmingham Pen Company Alumina Model-C"] });
    else if (pen.rows.length !== 1 || String(pen.rows[0]?.id) !== PHASE91_ALUMINA_MODEL_C_ID || String(pen.rows[0]?.type) !== "pen" || String(pen.rows[0]?.slug) !== PHASE91_ALUMINA_MODEL_C_SLUG) throw new Error("Phase 91 Alumina Model-C identity collision.");

    await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_batches (id, source_key, source_checksum, status, note) VALUES (?, ?, ?, 'applied', ?)", args: [stableId("phase91-batch", "birmingham-alumina-topology-v1"), "phase91-birmingham-alumina-topology-v1", digest("birmingham-alumina-topology-v1"), "applied", "Create Birmingham Pen Company and current Alumina Model-C topology."] });
    await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id = ? AND link_type = 'made_by' AND target_id <> ?", args: [PHASE91_ALUMINA_MODEL_C_ID, PHASE91_BIRMINGHAM_BRAND_ID] });
    await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'made_by', ?)", args: [stableId("phase91-made-by", `${PHASE91_ALUMINA_MODEL_C_ID}:${PHASE91_BIRMINGHAM_BRAND_ID}`), PHASE91_ALUMINA_MODEL_C_ID, PHASE91_BIRMINGHAM_BRAND_ID, "Phase 91 exact Birmingham maker relation"] });
    await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'reverse', ?)", args: [stableId("phase91-reverse", `${PHASE91_BIRMINGHAM_BRAND_ID}:${PHASE91_ALUMINA_MODEL_C_ID}`), PHASE91_BIRMINGHAM_BRAND_ID, PHASE91_ALUMINA_MODEL_C_ID, "Phase 91 Birmingham-to-Alumina public model navigation"] });
    const makers = await tx.execute({ sql: "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'", args: [PHASE91_ALUMINA_MODEL_C_ID, PHASE91_BIRMINGHAM_BRAND_ID] });
    const reverse = await tx.execute({ sql: "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'reverse'", args: [PHASE91_BIRMINGHAM_BRAND_ID, PHASE91_ALUMINA_MODEL_C_ID] });
    if (Number(makers.rows[0]?.value ?? 0) !== 1 || Number(reverse.rows[0]?.value ?? 0) !== 1) throw new Error("Phase 91 Birmingham model topology is incomplete.");
    await tx.commit();
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
}

export async function applyPhase91BirminghamAluminaContent(client: Client, options: ApplyPhase91Options): Promise<ApplyPhase91Result> {
  await assertOwned(client, options);
  await ensureTopology(client);
  const result = await applyCuratedContentPacks(client, options, structuredClone(phase91BirminghamAluminaPacks));
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return result;
}

function cliValue(name: string): string | null { const index = process.argv.indexOf(name); return index === -1 ? null : process.argv[index + 1] ?? null; }

async function main(): Promise<void> {
  const database = cliValue("--database"); const ownedRoot = cliValue("--owned-root"); const protectedCatalog = cliValue("--protected-catalog");
  if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase91-birmingham-alumina-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  const { createClient } = await import("@libsql/client"); const client = createClient({ url: `file:${path.resolve(database)}` });
  try { process.stdout.write(`${JSON.stringify(await applyPhase91BirminghamAluminaContent(client, { workspaceRoot: process.cwd(), reviewer: cliValue("--reviewer") ?? "phase91-birmingham-alumina", databasePath: path.resolve(database), ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: path.resolve(protectedCatalog), protectedCatalogSnapshot: snapshotCatalogFiles(path.resolve(protectedCatalog)), env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } }), null, 2)}\n`); } finally { client.close(); }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
