import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient, type Client, type Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import { loadCuratedEntityPack, type LoadedCuratedEntityPack } from "./lib/curated-content-pack";
import { PHASE323_PLATINUM_BRAND_ID, PHASE323_TAKISANSUI_ID, PHASE323_TAKISANSUI_SLUG, phase323PlatinumIzumoPiz600000TakisansuiPacks } from "./data/phase323-platinum-izumo-piz-600000-takisansui";

export type ApplyPhase323Options = ApplyPhase22Options;
export type ApplyPhase323Result = ApplyPhase22Result;
export { PHASE323_PLATINUM_BRAND_ID, PHASE323_TAKISANSUI_ID, PHASE323_TAKISANSUI_SLUG };

function inside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function assertNoRemote(options: ApplyPhase323Options): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (options.env?.[key]?.trim()) throw new Error(`Phase 323 refuses inherited remote database selection: ${key}.`);
  }
}

async function rows(client: Client | Transaction, sql: string, args: unknown[] = []) {
  return (await client.execute({ sql, args: args as never[] })).rows.map((row) => ({ ...row }));
}

async function authority(client: Client, options: ApplyPhase323Options): Promise<void> {
  assertNoRemote(options);
  if (!options.reviewer.trim()) throw new Error("Phase 323 reviewer must not be empty.");
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const database = fs.realpathSync.native(options.databasePath);
  const protectedCatalog = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(ownedRoot).isDirectory() || !fs.statSync(database).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !inside(database, ownedRoot)) throw new Error("Phase 323 requires an owned, non-symlink catalog copy.");
  const ownedStat = fs.statSync(database, { bigint: true });
  const protectedStat = fs.statSync(protectedCatalog, { bigint: true });
  if (database === protectedCatalog || (ownedStat.dev === protectedStat.dev && ownedStat.ino === protectedStat.ino)) throw new Error("Phase 323 refuses the protected catalog or hard-link alias.");
  const migration = await client.execute({ sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  if (migration.rows.length !== 1) throw new Error("Phase 323 owned copy must be migrated through 032.");
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) throw new Error("Phase 323 client is not bound to the authorized owned copy.");
}

async function identity(client: Client, packs: LoadedCuratedEntityPack[]): Promise<void> {
  const brand = await rows(client, "SELECT id,type,slug FROM entities WHERE id=?", [PHASE323_PLATINUM_BRAND_ID]);
  if (brand.length !== 1 || brand[0]?.type !== "brand" || brand[0]?.slug !== "platinum") throw new Error(`Phase 323 Platinum brand identity mismatch: ${JSON.stringify(brand)}`);
  const pack = packs.find((item) => item.entityId === PHASE323_TAKISANSUI_ID);
  if (!pack) throw new Error("Phase 323 Takisansui pack missing.");
  const existing = await rows(client, "SELECT id,type,slug,name FROM entities WHERE id=? OR slug=?", [PHASE323_TAKISANSUI_ID, PHASE323_TAKISANSUI_SLUG]);
  if (existing.length > 1 || (existing.length === 1 && (existing[0]?.id !== PHASE323_TAKISANSUI_ID || existing[0]?.type !== pack.expectedType || existing[0]?.slug !== pack.expectedSlug || existing[0]?.name !== pack.canonicalName))) throw new Error(`Phase 323 Takisansui identity collision: ${JSON.stringify(existing)}`);
}

async function topology(client: Client): Promise<void> {
  const tx = await client.transaction("write");
  try {
    await tx.execute({ sql: "INSERT OR IGNORE INTO entities(id,type,slug,name) VALUES(?, 'pen', ?, ?)", args: [PHASE323_TAKISANSUI_ID, PHASE323_TAKISANSUI_SLUG, "Platinum Izumo PIZ-600000 #56 瀑水 Takisansui"] });
    await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id=? AND link_type='made_by' AND target_id<>?", args: [PHASE323_TAKISANSUI_ID, PHASE323_PLATINUM_BRAND_ID] });
    await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by',?)", args: ["phase323-made-by-platinum-izumo-piz-600000", PHASE323_TAKISANSUI_ID, PHASE323_PLATINUM_BRAND_ID, "Phase 323 verified Platinum Izumo PIZ-600000 #56 maker relation"] });
    await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'reverse',?)", args: ["phase323-reverse-platinum-izumo-piz-600000", PHASE323_PLATINUM_BRAND_ID, PHASE323_TAKISANSUI_ID, "Phase 323 Platinum brand navigation to PIZ-600000 #56 Takisansui"] });
    const maker = await tx.execute({ sql: "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='made_by'", args: [PHASE323_TAKISANSUI_ID] });
    if (maker.rows.length !== 1 || String(maker.rows[0]?.target_id) !== PHASE323_PLATINUM_BRAND_ID) throw new Error("Phase 323 Takisansui maker topology is ambiguous.");
    await tx.commit();
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
}

export async function applyPhase323PlatinumIzumoPiz600000TakisansuiContent(client: Client, options: ApplyPhase323Options): Promise<ApplyPhase323Result> {
  await authority(client, options);
  const packs = phase323PlatinumIzumoPiz600000TakisansuiPacks.map((pack) => loadCuratedEntityPack(fs.realpathSync.native(options.workspaceRoot), pack));
  await identity(client, packs);
  await topology(client);
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
  if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase323-platinum-izumo-piz-600000-takisansui-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  const resolvedDatabase = path.resolve(database);
  const resolvedProtected = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase323PlatinumIzumoPiz600000TakisansuiContent(client, {
      workspaceRoot: process.cwd(),
      reviewer: value("--reviewer") ?? "phase323-platinum-izumo-piz-600000-takisansui",
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
