import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient, type Client, type Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import { loadCuratedEntityPack, type LoadedCuratedEntityPack } from "./lib/curated-content-pack";
import {
  PHASE238_BRAND_ID,
  PHASE238_LEGACY_ID,
  PHASE238_PEN_ID,
  PHASE238_SLUGS,
  phase238SkbRs501iPacks,
} from "./data/phase238-skb-rs501i";

export type ApplyPhase238Options = ApplyPhase22Options;
export type ApplyPhase238Result = ApplyPhase22Result;

function inside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}
function assertNoRemote(options: ApplyPhase238Options): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (options.env?.[key]?.trim()) {
      throw new Error(`Phase 238 refuses inherited remote database selection: ${key}.`);
    }
  }
}

async function rows(client: Client | Transaction, sql: string, args: unknown[] = []) {
  return (await client.execute({ sql, args: args as never[] })).rows.map((row) => ({ ...row }));
}

async function assertAuthority(client: Client, options: ApplyPhase238Options): Promise<void> {
  assertNoRemote(options);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const database = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (
    !fs.statSync(ownedRoot).isDirectory()
    || !fs.statSync(database).isFile()
    || fs.lstatSync(options.databasePath).isSymbolicLink()
    || !inside(database, ownedRoot)
  ) {
    throw new Error("Phase 238 owned catalog authority check failed.");
  }
  const own = fs.statSync(database, { bigint: true });
  const real = fs.statSync(protectedPath, { bigint: true });
  if (database === protectedPath || (own.dev === real.dev && own.ino === real.ino)) {
    throw new Error("Phase 238 refuses protected catalog or hard-link alias.");
  }
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) {
    throw new Error("Phase 238 client is not bound to owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 AS ok FROM migrations WHERE name=? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) {
    throw new Error("Phase 238 owned copy must be migrated through 032.");
  }
}

async function preflight(client: Client, packs: LoadedCuratedEntityPack[]): Promise<void> {
  const brand = await rows(client, "SELECT id,type,slug FROM entities WHERE id=? OR slug=?", [PHASE238_BRAND_ID, PHASE238_SLUGS.brand]);
  if (brand.length !== 1 || brand[0]?.id !== PHASE238_BRAND_ID || brand[0]?.type !== "brand" || brand[0]?.slug !== PHASE238_SLUGS.brand) {
    throw new Error(`Phase 238 SKB brand identity mismatch: ${JSON.stringify(brand)}`);
  }
  const legacy = await rows(client, "SELECT id,type,slug,name FROM entities WHERE id=?", [PHASE238_LEGACY_ID]);
  if (legacy.length !== 1 || legacy[0]?.type !== "pen" || legacy[0]?.slug !== PHASE238_SLUGS.legacy || legacy[0]?.name !== "SKB派顿 F10 / F21") {
    throw new Error(`Phase 238 mixed SKB/Penton identity changed: ${JSON.stringify(legacy)}`);
  }
  for (const pack of packs.filter((candidate) => candidate.entityId === PHASE238_PEN_ID)) {
    const existing = await rows(client, "SELECT id,type,slug,name FROM entities WHERE id=? OR slug=?", [pack.entityId, pack.expectedSlug]);
    if (existing.length === 0) continue;
    const row = existing[0];
    if (existing.length !== 1 || row?.id !== pack.entityId || row.type !== pack.expectedType || row.slug !== pack.expectedSlug || row.name !== pack.canonicalName) {
      throw new Error(`Phase 238 RS-501i identity collision: ${JSON.stringify(existing)}`);
    }
  }
}

async function prepareTopology(client: Client, packs: LoadedCuratedEntityPack[]): Promise<void> {
  const tx = await client.transaction("write");
  try {
    const pen = packs.find((pack) => pack.entityId === PHASE238_PEN_ID);
    if (!pen) throw new Error("Phase 238 RS-501i pen pack is missing.");
    await tx.execute({
      sql: "INSERT OR IGNORE INTO entities(id,type,slug,name) VALUES(?, 'pen', ?, ?)",
      args: [pen.entityId, pen.expectedSlug, pen.canonicalName],
    });
    await tx.execute({
      sql: "DELETE FROM entity_links WHERE source_id=? AND link_type='made_by' AND target_id<>?",
      args: [pen.entityId, PHASE238_BRAND_ID],
    });
    await tx.execute({
      sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by',?)",
      args: [`phase238-made-by-${pen.entityId}`, pen.entityId, PHASE238_BRAND_ID, "Phase 238 verified SKB RS-501i maker relation"],
    });
    await tx.execute({
      sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'reverse',?)",
      args: [`phase238-reverse-${pen.entityId}`, PHASE238_BRAND_ID, pen.entityId, "Phase 238 SKB public RS-501i model navigation"],
    });
    await tx.commit();
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
}

export async function applyPhase238SkbRs501iContent(client: Client, options: ApplyPhase238Options): Promise<ApplyPhase238Result> {
  if (!options.reviewer.trim()) throw new Error("Phase 238 reviewer must not be empty.");
  await assertAuthority(client, options);
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot);
  const packs = phase238SkbRs501iPacks.map((pack) => loadCuratedEntityPack(workspaceRoot, pack));
  await preflight(client, packs);
  await prepareTopology(client, packs);
  const result = await applyCuratedContentPacks(client, options, packs);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return result;
}

function cliValue(name: string): string | null {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1] ?? null;
}

async function main(): Promise<void> {
  const database = cliValue("--database");
  const ownedRoot = cliValue("--owned-root");
  const protectedCatalog = cliValue("--protected-catalog");
  if (!database || !ownedRoot || !protectedCatalog) {
    throw new Error("Usage: tsx scripts/apply-phase238-skb-rs501i-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  }
  const resolvedDatabase = path.resolve(database);
  const resolvedProtected = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase238SkbRs501iContent(client, {
      workspaceRoot: process.cwd(),
      reviewer: cliValue("--reviewer") ?? "phase238-skb-rs501i",
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
  void main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
