import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient, type Client, type Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import { loadCuratedEntityPack, type LoadedCuratedEntityPack } from "./lib/curated-content-pack";
import {
  PHASE343_KARAS_BRAND_ID,
  PHASE343_KARAS_BRAND_SLUG,
  PHASE343_KARAS_IDS,
  PHASE343_KARAS_SLUGS,
  phase343KarasPenCoPacks,
} from "./data/phase343-karas-pen-co";

export type ApplyPhase343Options = ApplyPhase22Options;
export type ApplyPhase343Result = ApplyPhase22Result;

const TARGETS = [
  { key: "ink", id: PHASE343_KARAS_IDS.ink, slug: PHASE343_KARAS_SLUGS.ink, name: "Karas Pen Co INK Fountain Pen" },
  { key: "vertex", id: PHASE343_KARAS_IDS.vertex, slug: PHASE343_KARAS_SLUGS.vertex, name: "Karas Pen Co Vertex Fountain Pen" },
  { key: "decograph", id: PHASE343_KARAS_IDS.decograph, slug: PHASE343_KARAS_SLUGS.decograph, name: "Karas Pen Co Decograph Fountain Pen" },
] as const;

function inside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}
function rejectRemote(env: NodeJS.ProcessEnv): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (env[key]?.trim()) throw new Error(`Phase 343 refuses inherited remote database selection: ${key}.`);
  }
}
async function rows(client: Client | Transaction, sql: string, args: unknown[] = []) {
  return (await client.execute({ sql, args: args as never[] })).rows.map((row) => ({ ...row }));
}
async function assertAuthority(client: Client, options: ApplyPhase343Options): Promise<void> {
  rejectRemote(options.env ?? process.env);
  if (!options.reviewer.trim()) throw new Error("Phase 343 reviewer must not be empty.");
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const database = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(ownedRoot).isDirectory() || !fs.statSync(database).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !inside(database, ownedRoot)) throw new Error("Phase 343 requires an owned, non-symlink catalog copy.");
  const own = fs.statSync(database, { bigint: true });
  const protectedStat = fs.statSync(protectedPath, { bigint: true });
  if (database === protectedPath || Number(own.nlink) !== 1 || (own.dev === protectedStat.dev && own.ino === protectedStat.ino)) throw new Error("Phase 343 refuses the protected catalog or hard-link alias.");
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) throw new Error("Phase 343 client is not bound to the authorized owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  if (migration.rows.length !== 1) throw new Error("Phase 343 owned copy must be migrated through 032.");
}
async function assertIdentity(client: Client, packs: LoadedCuratedEntityPack[]): Promise<void> {
  const brand = await rows(client, "SELECT id,type,slug,name FROM entities WHERE id=? OR slug=?", [PHASE343_KARAS_BRAND_ID, PHASE343_KARAS_BRAND_SLUG]);
  if (brand.length > 1 || (brand.length === 1 && (brand[0]?.id !== PHASE343_KARAS_BRAND_ID || brand[0]?.type !== "brand" || brand[0]?.slug !== PHASE343_KARAS_BRAND_SLUG || brand[0]?.name !== "Karas Pen Co"))) throw new Error(`Phase 343 Karas brand identity collision: ${JSON.stringify(brand)}.`);
  const brandPack = packs.find((pack) => pack.entityId === PHASE343_KARAS_BRAND_ID);
  if (!brandPack || brandPack.expectedType !== "brand") throw new Error("Phase 343 Karas brand pack missing.");
  for (const target of TARGETS) {
    const pack = packs.find((candidate) => candidate.entityId === target.id);
    if (!pack) throw new Error(`Phase 343 Karas pack missing: ${target.id}`);
    const existing = await rows(client, "SELECT id,type,slug,name FROM entities WHERE id=? OR slug=? ORDER BY id", [target.id, target.slug]);
    if (existing.length > 1 || (existing.length === 1 && (existing[0]?.id !== target.id || existing[0]?.type !== pack.expectedType || existing[0]?.slug !== pack.expectedSlug || existing[0]?.name !== pack.canonicalName))) throw new Error(`Phase 343 Karas identity collision: ${JSON.stringify(existing)}.`);
    const nameCollision = await rows(client, "SELECT id,type,slug,name FROM entities WHERE lower(name)=lower(?) AND id<>?", [target.name, target.id]);
    if (nameCollision.length > 0) throw new Error(`Phase 343 Karas name collision: ${JSON.stringify(nameCollision)}.`);
  }
}
async function prepareTopology(client: Client): Promise<void> {
  const tx = await client.transaction("write");
  try {
    await tx.execute({ sql: "INSERT OR IGNORE INTO entities(id,type,slug,name) VALUES(?, 'brand', ?, ?)", args: [PHASE343_KARAS_BRAND_ID, PHASE343_KARAS_BRAND_SLUG, "Karas Pen Co"] });
    for (const target of TARGETS) {
      await tx.execute({ sql: "INSERT OR IGNORE INTO entities(id,type,slug,name) VALUES(?, 'pen', ?, ?)", args: [target.id, target.slug, target.name] });
      await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id=? AND link_type='made_by' AND target_id<>?", args: [target.id, PHASE343_KARAS_BRAND_ID] });
      await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by',?)", args: [`phase343-made-by-${target.key}`, target.id, PHASE343_KARAS_BRAND_ID, `Phase 343 verified Karas Pen Co ${target.name} maker relation`] });
      await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'", args: [PHASE343_KARAS_BRAND_ID, target.id] });
      await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'reverse',?)", args: [`phase343-reverse-${target.key}`, PHASE343_KARAS_BRAND_ID, target.id, `Phase 343 Karas navigation to ${target.name}`] });
      const maker = await tx.execute({ sql: "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='made_by'", args: [target.id] });
      if (maker.rows.length !== 1 || String(maker.rows[0]?.target_id) !== PHASE343_KARAS_BRAND_ID) throw new Error(`Phase 343 ${target.name} maker topology is ambiguous.`);
      const reverse = await tx.execute({ sql: "SELECT source_id FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'", args: [PHASE343_KARAS_BRAND_ID, target.id] });
      if (reverse.rows.length !== 1) throw new Error(`Phase 343 ${target.name} reverse navigation is ambiguous.`);
    }
    await tx.commit();
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
}
export async function applyPhase343KarasPenCoContent(client: Client, options: ApplyPhase343Options): Promise<ApplyPhase343Result> {
  await assertAuthority(client, options);
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot);
  const rawPacks = phase343KarasPenCoPacks;
  const packs = rawPacks.map((pack) => loadCuratedEntityPack(workspaceRoot, pack));
  await assertIdentity(client, packs);
  await prepareTopology(client);
  const result = await applyCuratedContentPacks(client, options, rawPacks);
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
  if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase343-karas-pen-co-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <catalog> [--reviewer <name>]");
  const resolvedDatabase = path.resolve(database);
  const resolvedProtected = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase343KarasPenCoContent(client, { workspaceRoot: process.cwd(), reviewer: value("--reviewer") ?? "phase343-karas-pen-co", databasePath: resolvedDatabase, ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: resolvedProtected, protectedCatalogSnapshot: snapshotCatalogFiles(resolvedProtected), env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } });
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
