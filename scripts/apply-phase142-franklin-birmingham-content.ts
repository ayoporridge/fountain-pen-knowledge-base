import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { type Client, type Transaction, createClient } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import { loadCuratedEntityPack, type LoadedCuratedEntityPack } from "./lib/curated-content-pack";
import { loadPhase142Packs, PHASE142_BRANDS, PHASE142_IDS, PHASE142_SLUGS, phase142Groups } from "./data/phase142-franklin-birmingham-batch";

export type ApplyPhase142Options = ApplyPhase22Options;
export type ApplyPhase142Result = ApplyPhase22Result;

function inside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

async function rows(client: Client | Transaction, sql: string, args: unknown[] = []) {
  return (await client.execute({ sql, args: args as never[] })).rows.map((row) => ({ ...row }));
}

function assertNoRemote(options: ApplyPhase142Options): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (options.env?.[key]?.trim()) throw new Error(`Phase 142 refuses inherited remote database selection: ${key}.`);
  }
}

async function assertAuthority(client: Client, options: ApplyPhase142Options): Promise<void> {
  assertNoRemote(options);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const databasePath = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!inside(databasePath, ownedRoot) || fs.lstatSync(options.databasePath).isSymbolicLink()) throw new Error("Phase 142 owned catalog authority check failed.");
  const own = fs.statSync(databasePath, { bigint: true });
  const protectedStat = fs.statSync(protectedPath, { bigint: true });
  if (databasePath === protectedPath || (own.dev === protectedStat.dev && own.ino === protectedStat.ino)) throw new Error("Phase 142 refuses protected catalog or hard-link alias.");
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== databasePath) throw new Error("Phase 142 client is not bound to owned copy.");
}

async function assertIdentityPreflight(client: Client, packs: LoadedCuratedEntityPack[]): Promise<void> {
  const targetIds = new Set(packs.map((pack) => pack.entityId));
  const tokens = ["franklin", "christoph", "marietta", "pocket 20", "birmingham", "alumina", "model-c"];
  const matches = await rows(client, `SELECT id,type,slug,name FROM entities WHERE ${tokens.map(() => "lower(name) LIKE ? OR lower(slug) LIKE ?").join(" OR ")}`, tokens.flatMap((token) => [`%${token}%`, `%${token.replaceAll(" ", "-")}%`]));
  for (const match of matches) {
    if (!targetIds.has(String(match.id))) throw new Error(`Phase 142 semantic identity collision: ${JSON.stringify(match)}`);
  }
  for (const pack of packs) {
    const existing = await rows(client, "SELECT id,type,slug,name FROM entities WHERE id=?", [pack.entityId]);
    if (existing.length > 1) throw new Error(`Phase 142 duplicate entity id: ${pack.entityId}`);
    if (existing.length === 1 && (existing[0]?.type !== pack.expectedType || existing[0]?.slug !== pack.expectedSlug || existing[0]?.name !== pack.canonicalName)) throw new Error(`Phase 142 entity identity mismatch: ${pack.entityId}`);
  }
}

function relationId(kind: string, source: string, target: string): string {
  const input = `${kind}:${source}:${target}`;
  let hash = 2166136261;
  for (const char of input) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return `phase142-${kind}-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

async function prepareTopology(client: Client, packs: LoadedCuratedEntityPack[]): Promise<void> {
  const tx = await client.transaction("write");
  try {
    const brands = packs.filter((pack) => pack.expectedType === "brand");
    for (const pack of brands) {
      const existing = await rows(tx, "SELECT id,type,slug,name FROM entities WHERE id=?", [pack.entityId]);
      if (existing.length === 0) await tx.execute({ sql: "INSERT INTO entities(id,type,slug,name) VALUES(?, 'brand', ?, ?)", args: [pack.entityId, pack.expectedSlug, pack.canonicalName] });
      else if (existing.length !== 1 || existing[0]?.type !== "brand" || existing[0]?.slug !== pack.expectedSlug || existing[0]?.name !== pack.canonicalName) throw new Error(`Phase 142 brand identity collision: ${pack.entityId}`);
    }
    const brandIds = new Set(brands.map((pack) => pack.entityId));
    for (const pack of packs.filter((candidate) => candidate.expectedType === "pen")) {
      const brandId = pack.spec?.brandEntityId;
      if (!brandId || !brandIds.has(brandId)) throw new Error(`Phase 142 missing maker for ${pack.entityId}`);
      const existing = await rows(tx, "SELECT id,type,slug,name FROM entities WHERE id=?", [pack.entityId]);
      if (existing.length === 0) await tx.execute({ sql: "INSERT INTO entities(id,type,slug,name) VALUES(?, 'pen', ?, ?)", args: [pack.entityId, pack.expectedSlug, pack.canonicalName] });
      else if (existing.length !== 1 || existing[0]?.type !== "pen" || existing[0]?.slug !== pack.expectedSlug || existing[0]?.name !== pack.canonicalName) throw new Error(`Phase 142 model identity collision: ${pack.entityId}`);
      await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id=? AND link_type='made_by' AND target_id<>?", args: [pack.entityId, brandId] });
      await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by',?)", args: [relationId("made-by", pack.entityId, brandId), pack.entityId, brandId, "Phase 142 verified maker relation"] });
      await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'reverse',?)", args: [relationId("reverse", brandId, pack.entityId), brandId, pack.entityId, "Phase 142 representative model navigation"] });
    }
    await tx.commit();
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
}

export async function applyPhase142FranklinBirminghamContent(client: Client, options: ApplyPhase142Options): Promise<ApplyPhase142Result> {
  await assertAuthority(client, options);
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot);
  const packs = loadPhase142Packs(workspaceRoot).map((pack) => loadCuratedEntityPack(workspaceRoot, pack));
  await assertIdentityPreflight(client, packs);
  await prepareTopology(client, packs);
  const entities: ApplyPhase22Result["entities"] = [];
  for (const group of phase142Groups) {
    const brand = packs.find((pack) => pack.entityId === group.brand.entityId);
    const pen = packs.find((pack) => pack.entityId === group.pens[0]?.entityId);
    if (!brand || !pen) throw new Error(`Phase 142 group pack missing: ${group.brand.entityId}`);
    const result = await applyCuratedContentPacks(client, options, [brand, pen]);
    entities.push(...result.entities);
  }
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return { entities };
}

void PHASE142_BRANDS;
void PHASE142_IDS;
void PHASE142_SLUGS;

function cliValue(name: string): string | null {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1] ?? null;
}

async function main(): Promise<void> {
  const database = cliValue("--database");
  const ownedRoot = cliValue("--owned-root");
  const protectedCatalog = cliValue("--protected-catalog");
  if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase142-franklin-birmingham-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  const client = createClient({ url: `file:${path.resolve(database)}` });
  try {
    const result = await applyPhase142FranklinBirminghamContent(client, { workspaceRoot: process.cwd(), reviewer: cliValue("--reviewer") ?? "phase142-franklin-birmingham", databasePath: path.resolve(database), ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: path.resolve(protectedCatalog), protectedCatalogSnapshot: snapshotCatalogFiles(path.resolve(protectedCatalog)), env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } });
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } finally {
    client.close();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
