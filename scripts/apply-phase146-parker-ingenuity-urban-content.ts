import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { type Client, type Transaction, createClient } from "@libsql/client";
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
  PHASE146_IDS,
  PHASE146_SLUGS,
  phase146ParkerIngenuityUrbanPacks,
} from "./data/phase146-parker-ingenuity-urban-batch";

export type ApplyPhase146Options = ApplyPhase22Options;
export type ApplyPhase146Result = ApplyPhase22Result;

function stableId(prefix: string, value: string): string {
  return `${prefix}-${createHash("sha256").update(value).digest("hex").slice(0, 24)}`;
}

function inside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function assertNoRemote(options: ApplyPhase146Options): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (options.env?.[key]?.trim()) {
      throw new Error(`Phase 146 refuses inherited remote database selection: ${key}.`);
    }
  }
}

async function rows(client: Client | Transaction, sql: string, args: unknown[] = []) {
  return (await client.execute({ sql, args: args as never[] })).rows.map((row) => ({ ...row }));
}

async function assertAuthority(client: Client, options: ApplyPhase146Options): Promise<void> {
  assertNoRemote(options);
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
    throw new Error("Phase 146 owned catalog authority check failed.");
  }
  const own = fs.statSync(database, { bigint: true });
  const real = fs.statSync(protectedPath, { bigint: true });
  if (database === protectedPath || (own.dev === real.dev && own.ino === real.ino)) {
    throw new Error("Phase 146 refuses protected catalog or hard-link alias.");
  }
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) {
    throw new Error("Phase 146 client is not bound to owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 AS ok FROM migrations WHERE name=? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) throw new Error("Phase 146 owned copy must be migrated through 032.");
}

async function preflight(client: Client, packs: LoadedCuratedEntityPack[]): Promise<void> {
  for (const pack of packs) {
    const existing = await rows(
      client,
      "SELECT id,type,slug FROM entities WHERE id=? OR slug=? ORDER BY id",
      [pack.entityId, pack.expectedSlug],
    );
    if (existing.length === 0) {
      if (pack.expectedType === "brand") {
        throw new Error(`Phase 146 Parker brand disappeared: ${pack.entityId}`);
      }
      continue;
    }
    if (
      existing.length !== 1 ||
      existing[0]?.id !== pack.entityId ||
      existing[0]?.type !== pack.expectedType ||
      existing[0]?.slug !== pack.expectedSlug
    ) {
      throw new Error(`Phase 146 Parker identity collision: ${JSON.stringify(existing)}`);
    }
  }
}

async function assertBrand(transaction: Transaction): Promise<void> {
  const result = await transaction.execute({
    sql: "SELECT type,slug FROM entities WHERE id=?",
    args: [PHASE146_IDS.brand],
  });
  if (
    result.rows.length !== 1 ||
    String(result.rows[0]?.type) !== "brand" ||
    String(result.rows[0]?.slug) !== PHASE146_SLUGS.brand
  ) {
    throw new Error("Phase 146 Parker brand identity mismatch.");
  }
}

async function topology(client: Client, packs: LoadedCuratedEntityPack[]): Promise<void> {
  const transaction = await client.transaction("write");
  try {
    await assertBrand(transaction);
    for (const pack of packs.filter((candidate) => candidate.expectedType === "pen")) {
      await transaction.execute({
        sql: "INSERT OR IGNORE INTO entities(id,type,slug,name) VALUES(?, 'pen', ?, ?)",
        args: [pack.entityId, pack.expectedSlug, pack.canonicalName],
      });
      await transaction.execute({
        sql: "DELETE FROM entity_links WHERE source_id=? AND link_type='made_by' AND target_id<>?",
        args: [pack.entityId, PHASE146_IDS.brand],
      });
      await transaction.execute({
        sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by',?)",
        args: [
          stableId("phase146-made-by", `${pack.entityId}:${PHASE146_IDS.brand}`),
          pack.entityId,
          PHASE146_IDS.brand,
          "Phase 146 verified Parker maker relation",
        ],
      });
      const reverseId = stableId("phase146-reverse", `${PHASE146_IDS.brand}:${pack.entityId}`);
      await transaction.execute({
        sql: "DELETE FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse' AND id<>?",
        args: [PHASE146_IDS.brand, pack.entityId, reverseId],
      });
      await transaction.execute({
        sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'reverse',?)",
        args: [
          reverseId,
          PHASE146_IDS.brand,
          pack.entityId,
          "Phase 146 Parker brand model navigation",
        ],
      });
    }
    await transaction.commit();
  } catch (error) {
    if (!transaction.closed) await transaction.rollback();
    throw error;
  }
}

export async function applyPhase146ParkerIngenuityUrbanContent(
  client: Client,
  options: ApplyPhase146Options,
): Promise<ApplyPhase146Result> {
  if (!options.reviewer.trim()) throw new Error("Phase 146 reviewer must not be empty.");
  await assertAuthority(client, options);
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot);
  const packs = phase146ParkerIngenuityUrbanPacks.map((pack) =>
    loadCuratedEntityPack(workspaceRoot, pack),
  );
  await preflight(client, packs);
  await topology(client, packs);
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
    throw new Error(
      "Usage: tsx scripts/apply-phase146-parker-ingenuity-urban-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]",
    );
  }
  const client = createClient({ url: `file:${path.resolve(database)}` });
  try {
    const result = await applyPhase146ParkerIngenuityUrbanContent(client, {
      workspaceRoot: process.cwd(),
      reviewer: cliValue("--reviewer") ?? "phase146-parker",
      databasePath: path.resolve(database),
      ownedRoot: path.resolve(ownedRoot),
      protectedCatalogPath: path.resolve(protectedCatalog),
      protectedCatalogSnapshot: snapshotCatalogFiles(path.resolve(protectedCatalog)),
      env: {
        ...process.env,
        TURSO_DATABASE_URL: "",
        TURSO_AUTH_TOKEN: "",
        FPKG_DATABASE_URL: "",
      },
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
