import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient, type Client, type Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import { loadCuratedEntityPack, type LoadedCuratedEntityPack } from "./lib/curated-content-pack";
import { PHASE153_IDS, PHASE153_SLUGS, phase153ParkerCurrentTrioPacks } from "./data/phase153-parker-current-trio";

export type ApplyPhase153Options = ApplyPhase22Options;
export type ApplyPhase153Result = ApplyPhase22Result;

function stableId(prefix: string, value: string): string {
  return `${prefix}-${createHash("sha256").update(value).digest("hex").slice(0, 24)}`;
}

function inside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function assertNoRemote(options: ApplyPhase153Options): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (options.env?.[key]?.trim()) throw new Error(`Phase 153 refuses inherited remote database selection: ${key}.`);
  }
}

async function rows(client: Client | Transaction, sql: string, args: unknown[] = []) {
  return (await client.execute({ sql, args: args as never[] })).rows.map((row) => ({ ...row }));
}

async function assertAuthority(client: Client, options: ApplyPhase153Options): Promise<void> {
  assertNoRemote(options);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const database = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(ownedRoot).isDirectory() || !fs.statSync(database).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !inside(database, ownedRoot)) {
    throw new Error("Phase 153 requires an owned, non-symlink catalog copy.");
  }
  const own = fs.statSync(database, { bigint: true });
  const real = fs.statSync(protectedPath, { bigint: true });
  if (database === protectedPath || (own.dev === real.dev && own.ino === real.ino)) throw new Error("Phase 153 refuses the protected catalog or hard-link alias.");
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) throw new Error("Phase 153 client is not bound to the authorized owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  if (migration.rows.length !== 1) throw new Error("Phase 153 owned copy must be migrated through 032.");
}

async function preflight(client: Client, packs: LoadedCuratedEntityPack[]): Promise<void> {
  for (const pack of packs) {
    const existing = await rows(client, "SELECT id,type,slug FROM entities WHERE id=? OR slug=? ORDER BY id", [pack.entityId, pack.expectedSlug]);
    if (existing.length !== 1 || existing[0]?.id !== pack.entityId || existing[0]?.type !== pack.expectedType || existing[0]?.slug !== pack.expectedSlug) {
      throw new Error(`Phase 153 canonical Parker identity mismatch: ${pack.entityId} ${JSON.stringify(existing)}`);
    }
  }
}

async function topology(client: Client, packs: LoadedCuratedEntityPack[]): Promise<void> {
  const tx = await client.transaction("write");
  try {
    const brand = await rows(tx, "SELECT type,slug FROM entities WHERE id=?", [PHASE153_IDS.brand]);
    if (brand.length !== 1 || brand[0]?.type !== "brand" || brand[0]?.slug !== PHASE153_SLUGS.brand) throw new Error("Phase 153 Parker brand identity mismatch.");
    for (const pack of packs.filter((candidate) => candidate.expectedType === "pen")) {
      await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id=? AND link_type='made_by' AND target_id<>?", args: [pack.entityId, PHASE153_IDS.brand] });
      await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by',?)", args: [stableId("phase153-made-by", `${pack.entityId}:${PHASE153_IDS.brand}`), pack.entityId, PHASE153_IDS.brand, "Phase 153 verified Parker maker relation"] });
      const reverseId = stableId("phase153-reverse", `${PHASE153_IDS.brand}:${pack.entityId}`);
      await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse' AND id<>?", args: [PHASE153_IDS.brand, pack.entityId, reverseId] });
      await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'reverse',?)", args: [reverseId, PHASE153_IDS.brand, pack.entityId, "Phase 153 Parker brand model navigation"] });
      const maker = await rows(tx, "SELECT count(*) AS n FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'", [pack.entityId, PHASE153_IDS.brand]);
      const reverse = await rows(tx, "SELECT count(*) AS n FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'", [PHASE153_IDS.brand, pack.entityId]);
      if (Number(maker[0]?.n) !== 1 || Number(reverse[0]?.n) !== 1) throw new Error(`Phase 153 Parker topology failed: ${pack.entityId}`);
    }
    await tx.commit();
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
}

export async function applyPhase153ParkerCurrentTrioContent(client: Client, options: ApplyPhase153Options): Promise<ApplyPhase153Result> {
  if (!options.reviewer.trim()) throw new Error("Phase 153 reviewer must not be empty.");
  await assertAuthority(client, options);
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot);
  const packs = phase153ParkerCurrentTrioPacks.map((pack) => loadCuratedEntityPack(workspaceRoot, pack));
  await preflight(client, packs);
  await topology(client, packs);
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
  if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase153-parker-current-trio-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  const resolvedDatabase = path.resolve(database);
  const resolvedProtected = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase153ParkerCurrentTrioContent(client, {
      workspaceRoot: process.cwd(),
      reviewer: value("--reviewer") ?? "phase153-parker-current-trio",
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

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
