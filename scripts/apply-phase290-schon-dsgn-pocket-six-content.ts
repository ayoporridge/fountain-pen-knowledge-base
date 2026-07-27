import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient, type Client, type Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import { loadCuratedEntityPack } from "./lib/curated-content-pack";
import {
  PHASE290_POCKET_SIX_ID,
  PHASE290_POCKET_SIX_SLUG,
  PHASE290_SCHON_BRAND_ID,
  phase290SchonDsgnPocketSixPacks,
} from "./data/phase290-schon-dsgn-pocket-six";

export type ApplyPhase290Options = ApplyPhase22Options;
export type ApplyPhase290Result = ApplyPhase22Result;

function inside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function rejectRemote(env: NodeJS.ProcessEnv): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (env[key]?.trim()) throw new Error(`Phase 290 refuses inherited remote database selection: ${key}.`);
  }
}

async function authority(client: Client, options: ApplyPhase290Options): Promise<void> {
  rejectRemote(options.env ?? process.env);
  if (!options.reviewer.trim()) throw new Error("Phase 290 reviewer must not be empty.");
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const root = fs.realpathSync.native(options.ownedRoot);
  const database = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(root).isDirectory() || !fs.statSync(database).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !inside(database, root)) {
    throw new Error("Phase 290 requires an owned, non-symlink catalog copy.");
  }
  const own = fs.statSync(database, { bigint: true });
  const protectedStat = fs.statSync(protectedPath, { bigint: true });
  if (database === protectedPath || Number(own.nlink) !== 1 || (own.dev === protectedStat.dev && own.ino === protectedStat.ino)) {
    throw new Error("Phase 290 refuses the protected catalog or hard-link alias.");
  }
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) throw new Error("Phase 290 client is not bound to the authorized owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  if (migration.rows.length !== 1) throw new Error("Phase 290 owned copy must be migrated through 032.");
}

async function identity(client: Client): Promise<void> {
  const tx: Transaction = await client.transaction("write");
  try {
    const brand = await tx.execute({ sql: "SELECT id,type,slug,name FROM entities WHERE id=? OR slug='schon-dsgn' ORDER BY id", args: [PHASE290_SCHON_BRAND_ID] });
    if (brand.rows.length === 0) {
      await tx.execute({ sql: "INSERT INTO entities(id,type,slug,name) VALUES(?, 'brand', 'schon-dsgn', 'Schon DSGN')", args: [PHASE290_SCHON_BRAND_ID] });
    } else if (brand.rows.length !== 1 || String(brand.rows[0]?.id) !== PHASE290_SCHON_BRAND_ID || String(brand.rows[0]?.type) !== "brand" || String(brand.rows[0]?.slug) !== "schon-dsgn") {
      throw new Error(`Phase 290 Schon DSGN identity collision: ${JSON.stringify(brand.rows)}`);
    }
    const model = await tx.execute({ sql: "SELECT id,type,slug,name FROM entities WHERE id=? OR slug=? ORDER BY id", args: [PHASE290_POCKET_SIX_ID, PHASE290_POCKET_SIX_SLUG] });
    if (model.rows.length === 0) {
      await tx.execute({ sql: "INSERT INTO entities(id,type,slug,name) VALUES(?, 'pen', ?, 'Schon DSGN Pocket Six')", args: [PHASE290_POCKET_SIX_ID, PHASE290_POCKET_SIX_SLUG] });
    } else if (model.rows.length !== 1 || String(model.rows[0]?.id) !== PHASE290_POCKET_SIX_ID || String(model.rows[0]?.type) !== "pen" || String(model.rows[0]?.slug) !== PHASE290_POCKET_SIX_SLUG || String(model.rows[0]?.name) !== "Schon DSGN Pocket Six") {
      throw new Error(`Phase 290 Pocket Six identity collision: ${JSON.stringify(model.rows)}`);
    }
    await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id=? AND link_type='made_by' AND target_id<>?", args: [PHASE290_POCKET_SIX_ID, PHASE290_SCHON_BRAND_ID] });
    await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?, ?, ?, 'made_by', ?)", args: [`phase290-made-by-${PHASE290_POCKET_SIX_ID}`, PHASE290_POCKET_SIX_ID, PHASE290_SCHON_BRAND_ID, "Phase 290 exact Schon DSGN Pocket Six maker relation"] });
    await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?, ?, ?, 'reverse', ?)", args: [`phase290-reverse-${PHASE290_POCKET_SIX_ID}`, PHASE290_SCHON_BRAND_ID, PHASE290_POCKET_SIX_ID, "Phase 290 Schon DSGN brand-to-model navigation"] });
    const makers = await tx.execute({ sql: "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='made_by'", args: [PHASE290_POCKET_SIX_ID] });
    if (makers.rows.length !== 1 || String(makers.rows[0]?.target_id) !== PHASE290_SCHON_BRAND_ID) throw new Error(`Phase 290 maker topology remains ambiguous: ${JSON.stringify(makers.rows)}`);
    await tx.commit();
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
}

export async function applyPhase290SchonDsgnPocketSixContent(client: Client, options: ApplyPhase290Options): Promise<ApplyPhase290Result> {
  await authority(client, options);
  await identity(client);
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot);
  const packs = phase290SchonDsgnPocketSixPacks.map((pack) => loadCuratedEntityPack(workspaceRoot, pack));
  const result = await applyCuratedContentPacks(client, options, packs);
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
  if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase290-schon-dsgn-pocket-six-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <catalog> [--reviewer <name>]");
  const resolvedDatabase = path.resolve(database);
  const resolvedProtected = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase290SchonDsgnPocketSixContent(client, {
      workspaceRoot: process.cwd(),
      reviewer: value("--reviewer") ?? "phase290-schon-dsgn-pocket-six",
      databasePath: resolvedDatabase,
      ownedRoot: path.resolve(ownedRoot),
      protectedCatalogPath: resolvedProtected,
      protectedCatalogSnapshot: snapshotCatalogFiles(resolvedProtected),
      env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" },
    });
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } finally {
    client.close();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
}
