import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient, type Client } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import { PHASE231_YIREN_878_ID, PHASE231_YIREN_878_SLUG, PHASE231_YIREN_BRAND_ID, PHASE231_YIREN_BRAND_SLUG, phase231Yiren878Packs } from "./data/phase231-yiren-878";

export type ApplyPhase231Options = ApplyPhase22Options;
export type ApplyPhase231Result = ApplyPhase22Result;

function isInside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function assertNoRemote(env: NodeJS.ProcessEnv): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (env[key]?.trim()) throw new Error(`Phase 231 refuses inherited remote selection: ${key}.`);
  }
}

async function assertOwned(client: Client, options: ApplyPhase231Options): Promise<void> {
  assertNoRemote(options.env ?? process.env);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const database = fs.realpathSync.native(options.databasePath);
  const protectedCatalog = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(ownedRoot).isDirectory() || !fs.statSync(database).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !isInside(database, ownedRoot)) {
    throw new Error("Phase 231 owned catalog authority check failed.");
  }
  const own = fs.statSync(database, { bigint: true });
  const real = fs.statSync(protectedCatalog, { bigint: true });
  if (database === protectedCatalog || (own.dev === real.dev && own.ino === real.ino)) throw new Error("Phase 231 refuses protected catalog or hard-link alias.");
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) throw new Error("Phase 231 client is not bound to owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 AS ok FROM migrations WHERE name = ? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  if (migration.rows.length !== 1) throw new Error("Phase 231 owned copy must be migrated through 032.");
}

async function ensureTopology(client: Client): Promise<void> {
  const transaction = await client.transaction("write");
  try {
    const brand = await transaction.execute({ sql: "SELECT type, slug FROM entities WHERE id = ?", args: [PHASE231_YIREN_BRAND_ID] });
    const pen = await transaction.execute({ sql: "SELECT type, slug FROM entities WHERE id = ?", args: [PHASE231_YIREN_878_ID] });
    if (brand.rows.length !== 1 || String(brand.rows[0]?.type) !== "brand" || String(brand.rows[0]?.slug) !== PHASE231_YIREN_BRAND_SLUG) throw new Error("Phase 231 YiRen brand identity mismatch.");
    if (pen.rows.length !== 1 || String(pen.rows[0]?.type) !== "pen" || String(pen.rows[0]?.slug) !== PHASE231_YIREN_878_SLUG) throw new Error("Phase 231 YiRen 878 identity mismatch.");
    await transaction.execute({ sql: "DELETE FROM entity_links WHERE source_id = ? AND link_type = 'made_by' AND target_id <> ?", args: [PHASE231_YIREN_878_ID, PHASE231_YIREN_BRAND_ID] });
    await transaction.execute({ sql: "DELETE FROM entity_links WHERE source_id = ? AND link_type = 'reverse' AND target_id <> ?", args: [PHASE231_YIREN_BRAND_ID, PHASE231_YIREN_878_ID] });
    await transaction.execute({ sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'made_by', ?)", args: ["phase231-yiren-878-made-by", PHASE231_YIREN_878_ID, PHASE231_YIREN_BRAND_ID, "Phase 231 exact YiRen 878 maker topology"] });
    await transaction.execute({ sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'reverse', ?)", args: ["phase231-yiren-878-reverse", PHASE231_YIREN_BRAND_ID, PHASE231_YIREN_878_ID, "Phase 231 YiRen brand-to-model navigation"] });
    const makers = await transaction.execute({ sql: "SELECT target_id FROM entity_links WHERE source_id = ? AND link_type = 'made_by'", args: [PHASE231_YIREN_878_ID] });
    if (makers.rows.length !== 1 || String(makers.rows[0]?.target_id) !== PHASE231_YIREN_BRAND_ID) throw new Error("Phase 231 YiRen 878 maker topology remains ambiguous.");
    await transaction.commit();
  } catch (error) {
    if (!transaction.closed) await transaction.rollback();
    throw error;
  }
}

export async function applyPhase231Yiren878Content(client: Client, options: ApplyPhase231Options): Promise<ApplyPhase231Result> {
  await assertOwned(client, options);
  await ensureTopology(client);
  const result = await applyCuratedContentPacks(client, options, structuredClone(phase231Yiren878Packs));
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return result;
}

function value(name: string): string | null {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1] ?? null;
}

async function main(): Promise<void> {
  const database = value("--database");
  const ownedRoot = value("--owned-root");
  const protectedCatalog = value("--protected-catalog");
  if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase231-yiren-878-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  const client = createClient({ url: `file:${path.resolve(database)}` });
  try {
    const result = await applyPhase231Yiren878Content(client, {
      workspaceRoot: process.cwd(),
      reviewer: value("--reviewer") ?? "phase231-yiren-878-curated-content",
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

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
