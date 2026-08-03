import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient, type Client, type Transaction } from "@libsql/client";
import {
  assertCatalogSnapshotUnchanged,
  snapshotCatalogFiles,
} from "../src/lib/audit/read-only-catalog";
import {
  applyCuratedContentPacks,
  type ApplyPhase22Options,
  type ApplyPhase22Result,
} from "./apply-phase22-content";
import {
  loadCuratedEntityPack,
  type LoadedCuratedEntityPack,
} from "./lib/curated-content-pack";
import {
  PHASE375_BASIS_ID,
  PHASE375_BASIS_SLUG,
  PHASE375_CASUAL_ID,
  PHASE375_CASUAL_SLUG,
  PHASE375_SAILOR_BRAND_ID,
  PHASE375_STABLE_ID,
  PHASE375_STABLE_SLUG,
  phase375SailorProfitCasualLPacks,
} from "./data/phase375-sailor-profit-casual-l";

export type ApplyPhase375Options = ApplyPhase22Options;
export type ApplyPhase375Result = ApplyPhase22Result;

function inside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function rejectRemote(env: NodeJS.ProcessEnv): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (env[key]?.trim()) throw new Error(`Phase 375 refuses inherited remote database selection: ${key}.`);
  }
}

async function rows(client: Client | Transaction, sql: string, args: unknown[] = []) {
  return (await client.execute({ sql, args: args as never[] })).rows.map((row) => ({ ...row }));
}

async function assertAuthority(client: Client, options: ApplyPhase375Options): Promise<void> {
  rejectRemote(options.env ?? process.env);
  if (!options.reviewer.trim()) throw new Error("Phase 375 reviewer must not be empty.");
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const database = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (
    !fs.statSync(ownedRoot).isDirectory() ||
    !fs.statSync(database).isFile() ||
    fs.lstatSync(options.databasePath).isSymbolicLink() ||
    !inside(database, ownedRoot)
  ) {
    throw new Error("Phase 375 requires an owned, non-symlink catalog copy.");
  }
  const own = fs.statSync(database, { bigint: true });
  const protectedStat = fs.statSync(protectedPath, { bigint: true });
  if (
    database === protectedPath ||
    Number(own.nlink) !== 1 ||
    (own.dev === protectedStat.dev && own.ino === protectedStat.ino)
  ) {
    throw new Error("Phase 375 refuses the protected catalog or hard-link alias.");
  }
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) {
    throw new Error("Phase 375 client is not bound to the authorized owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) throw new Error("Phase 375 owned copy must be migrated through 032.");
}

async function assertIdentity(client: Client, packs: LoadedCuratedEntityPack[]): Promise<void> {
  const brand = await rows(client, "SELECT id,type,slug,name FROM entities WHERE id=?", [PHASE375_SAILOR_BRAND_ID]);
  if (
    brand.length !== 1 ||
    brand[0]?.type !== "brand" ||
    brand[0]?.slug !== "sailor" ||
    brand[0]?.name !== "写乐 Sailor"
  ) {
    throw new Error(`Phase 375 Sailor brand identity mismatch: ${JSON.stringify(brand)}`);
  }
  for (const [entityId, slug] of [
    [PHASE375_CASUAL_ID, PHASE375_CASUAL_SLUG],
    [PHASE375_BASIS_ID, PHASE375_BASIS_SLUG],
    [PHASE375_STABLE_ID, PHASE375_STABLE_SLUG],
  ] as const) {
    const modelPack = packs.find((pack) => pack.entityId === entityId);
    if (!modelPack) throw new Error(`Phase 375 pack missing: ${entityId}`);
    const existing = await rows(
      client,
      "SELECT id,type,slug,name FROM entities WHERE id=? OR slug=? ORDER BY id",
      [entityId, slug],
    );
    if (
      existing.length > 1 ||
      (existing.length === 1 &&
        (existing[0]?.id !== entityId ||
          existing[0]?.type !== modelPack.expectedType ||
          existing[0]?.slug !== modelPack.expectedSlug ||
          existing[0]?.name !== modelPack.canonicalName))
    ) {
      throw new Error(`Phase 375 identity collision: ${JSON.stringify(existing)}`);
    }
    const names = await rows(
      client,
      "SELECT id,type,slug,name FROM entities WHERE lower(name)=lower(?) AND id<>?",
      [modelPack.canonicalName, entityId],
    );
    if (names.length > 0) throw new Error(`Phase 375 name collision: ${JSON.stringify(names)}`);
  }
}

async function prepareTopology(client: Client): Promise<void> {
  const tx = await client.transaction("write");
  try {
    const models = [
      {
        id: PHASE375_CASUAL_ID,
        slug: PHASE375_CASUAL_SLUG,
        name: "写乐 Sailor Profit Casual L Gold Trim（11-0820）",
        suffix: "casual-l",
      },
      {
        id: PHASE375_BASIS_ID,
        slug: PHASE375_BASIS_SLUG,
        name: "写乐 Sailor Profit Casual L Basis Gold Trim（11-0822）",
        suffix: "basis",
      },
      {
        id: PHASE375_STABLE_ID,
        slug: PHASE375_STABLE_SLUG,
        name: "写乐 Sailor Profit Casual L Stable Gold Trim（11-0825）",
        suffix: "stable",
      },
    ];
    for (const model of models) {
      await tx.execute({
        sql: "INSERT OR IGNORE INTO entities(id,type,slug,name) VALUES(?, 'pen', ?, ?)",
        args: [model.id, model.slug, model.name],
      });
      await tx.execute({
        sql: "DELETE FROM entity_links WHERE source_id=? AND link_type='made_by' AND target_id<>?",
        args: [model.id, PHASE375_SAILOR_BRAND_ID],
      });
      await tx.execute({
        sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by',?)",
        args: [model.id + "-maker", model.id, PHASE375_SAILOR_BRAND_ID, `Phase 375 verified Sailor Profit Casual L ${model.suffix} maker relation`],
      });
      await tx.execute({
        sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'reverse',?)",
        args: ["phase375-reverse-sailor-" + model.suffix, PHASE375_SAILOR_BRAND_ID, model.id, `Phase 375 Sailor brand navigation to Profit Casual L ${model.suffix}`],
      });
      const maker = await tx.execute({
        sql: "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='made_by'",
        args: [model.id],
      });
      if (maker.rows.length !== 1 || String(maker.rows[0]?.target_id) !== PHASE375_SAILOR_BRAND_ID) {
        throw new Error(`Phase 375 ${model.suffix} maker topology is ambiguous.`);
      }
      const reverse = await tx.execute({
        sql: "SELECT source_id FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
        args: [PHASE375_SAILOR_BRAND_ID, model.id],
      });
      if (reverse.rows.length !== 1) throw new Error(`Phase 375 ${model.suffix} reverse navigation is ambiguous.`);
    }
    await tx.commit();
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
}

export async function applyPhase375SailorProfitCasualLContent(
  client: Client,
  options: ApplyPhase375Options,
): Promise<ApplyPhase375Result> {
  await assertAuthority(client, options);
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot);
  const packs = phase375SailorProfitCasualLPacks.map((pack) => loadCuratedEntityPack(workspaceRoot, pack));
  await assertIdentity(client, packs);
  await prepareTopology(client);
  const result = await applyCuratedContentPacks(client, options, phase375SailorProfitCasualLPacks);
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
  if (!database || !ownedRoot || !protectedCatalog) {
    throw new Error("Usage: tsx scripts/apply-phase375-sailor-profit-casual-l-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <catalog> [--reviewer <name>]");
  }
  const resolvedDatabase = path.resolve(database);
  const resolvedProtected = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase375SailorProfitCasualLContent(client, {
      workspaceRoot: process.cwd(),
      reviewer: value("--reviewer") ?? "phase375-sailor-profit-casual-l",
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
