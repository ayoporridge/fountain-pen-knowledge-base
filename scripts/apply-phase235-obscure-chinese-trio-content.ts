import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient, type Client, type Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import { loadCuratedEntityPack, type LoadedCuratedEntityPack } from "./lib/curated-content-pack";
import { PHASE235_TARGETS, phase235ObscureChineseTrioPacks } from "./data/phase235-obscure-chinese-trio";

export type ApplyPhase235Options = ApplyPhase22Options;
export type ApplyPhase235Result = ApplyPhase22Result;

function inside(candidate: string, root: string): boolean { const relative = path.relative(root, candidate); return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative); }
function assertNoRemote(options: ApplyPhase235Options): void { for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) if (options.env?.[key]?.trim()) throw new Error(`Phase 235 refuses inherited remote database selection: ${key}.`); }
async function rows(client: Client | Transaction, sql: string, args: unknown[] = []) { return (await client.execute({ sql, args: args as never[] })).rows.map((row) => ({ ...row })); }

async function assertAuthority(client: Client, options: ApplyPhase235Options): Promise<void> {
  assertNoRemote(options); assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const ownedRoot = fs.realpathSync.native(options.ownedRoot); const database = fs.realpathSync.native(options.databasePath); const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(ownedRoot).isDirectory() || !fs.statSync(database).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !inside(database, ownedRoot)) throw new Error("Phase 235 owned catalog authority check failed.");
  const own = fs.statSync(database, { bigint: true }); const real = fs.statSync(protectedPath, { bigint: true });
  if (database === protectedPath || (own.dev === real.dev && own.ino === real.ino)) throw new Error("Phase 235 refuses protected catalog or hard-link alias.");
  const listed = await client.execute("PRAGMA database_list"); const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) throw new Error("Phase 235 client is not bound to owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 AS ok FROM migrations WHERE name=? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  if (migration.rows.length !== 1) throw new Error("Phase 235 owned copy must be migrated through 032.");
}

async function preflight(client: Client, packs: LoadedCuratedEntityPack[]): Promise<void> {
  for (const pack of packs) {
    const existing = await rows(client, "SELECT id,type,slug,name FROM entities WHERE id=? OR slug=?", [pack.entityId, pack.expectedSlug]);
    if (existing.length === 0) continue;
    const row = existing[0];
    if (existing.length !== 1 || row?.id !== pack.entityId || row.type !== pack.expectedType || row.slug !== pack.expectedSlug || row.name !== pack.canonicalName) throw new Error(`Phase 235 identity collision: ${JSON.stringify(existing)}`);
  }
  for (const target of PHASE235_TARGETS) {
    const brand = await rows(client, "SELECT id,type,slug,name FROM entities WHERE id=?", [target.brandId]);
    const pen = await rows(client, "SELECT id,type,slug,name FROM entities WHERE id=?", [target.penId]);
    if (brand.length !== 1 || brand[0]?.type !== "brand" || brand[0]?.slug !== target.brandSlug || brand[0]?.name !== target.brandName) throw new Error(`Phase 235 brand prerequisite mismatch: ${target.brandSlug}`);
    if (pen.length !== 1 || pen[0]?.type !== "pen" || pen[0]?.slug !== target.penSlug || pen[0]?.name !== target.penName) throw new Error(`Phase 235 pen prerequisite mismatch: ${target.penSlug}`);
  }
}

async function prepareTopology(client: Client): Promise<void> {
  const tx = await client.transaction("write");
  try {
    for (const target of PHASE235_TARGETS) {
      await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id=? AND link_type='made_by' AND target_id<>?", args: [target.penId, target.brandId] });
      await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by',?)", args: [`phase235-made-by-${target.penId}`, target.penId, target.brandId, `Phase 235 verified ${target.penName} maker relation`] });
      await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'reverse',?)", args: [`phase235-reverse-${target.penId}`, target.brandId, target.penId, `Phase 235 ${target.brandName} public model navigation`] });
    }
    await tx.commit();
  } catch (error) { if (!tx.closed) await tx.rollback(); throw error; }
}

export async function applyPhase235ObscureChineseTrioContent(client: Client, options: ApplyPhase235Options): Promise<ApplyPhase235Result> {
  if (!options.reviewer.trim()) throw new Error("Phase 235 reviewer must not be empty.");
  await assertAuthority(client, options);
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot);
  const curatedPacks = phase235ObscureChineseTrioPacks();
  const packs = curatedPacks.map((pack) => loadCuratedEntityPack(workspaceRoot, pack));
  await preflight(client, packs); await prepareTopology(client);
  const entities: ApplyPhase235Result["entities"] = [];
  for (const target of PHASE235_TARGETS) {
    const group = curatedPacks.filter((pack) => pack.entityId === target.brandId || pack.entityId === target.penId);
    const result = await applyCuratedContentPacks(client, options, group);
    entities.push(...result.entities);
  }
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot); return { entities };
}

function cliValue(name: string): string | null { const index = process.argv.indexOf(name); return index === -1 ? null : process.argv[index + 1] ?? null; }
async function main(): Promise<void> {
  const database = cliValue("--database"); const ownedRoot = cliValue("--owned-root"); const protectedCatalog = cliValue("--protected-catalog");
  if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase235-obscure-chinese-trio-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  const resolvedDatabase = path.resolve(database); const resolvedProtected = path.resolve(protectedCatalog); const client = createClient({ url: `file:${resolvedDatabase}` });
  try { process.stdout.write(`${JSON.stringify(await applyPhase235ObscureChineseTrioContent(client, { workspaceRoot: process.cwd(), reviewer: cliValue("--reviewer") ?? "phase235-obscure-chinese-trio", databasePath: resolvedDatabase, ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: resolvedProtected, protectedCatalogSnapshot: snapshotCatalogFiles(resolvedProtected), env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } }), null, 2)}\n`); } finally { client.close(); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
