import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
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
import { loadCuratedEntityPack } from "./lib/curated-content-pack";
import {
  PHASE175_CLASSIC_KO_ID,
  PHASE175_SAILOR_BRAND_ID,
  phase175SailorClassicKoPacks,
} from "./data/phase175-sailor-classic-ko";

export type ApplyPhase175Options = ApplyPhase22Options;
export type ApplyPhase175Result = ApplyPhase22Result;

const TARGETS = [
  {
    id: PHASE175_SAILOR_BRAND_ID,
    type: "brand",
    slug: "sailor",
    name: "Sailor",
  },
  {
    id: PHASE175_CLASSIC_KO_ID,
    type: "pen",
    slug: "写乐-sailor-classic-ko",
    name: "写乐 Sailor Classic Ko",
  },
] as const;

function syncStableId(prefix: string, value: string): string {
  return `${prefix}-${createHash("sha256").update(`${prefix}\0${value}`).digest("hex").slice(0, 24)}`;
}

function inside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function noRemote(options: ApplyPhase175Options): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (options.env?.[key]?.trim()) {
      throw new Error(`Phase 175 refuses inherited remote database selection: ${key}.`);
    }
  }
}

async function authority(client: Client, options: ApplyPhase175Options): Promise<void> {
  noRemote(options);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const root = fs.realpathSync.native(options.ownedRoot);
  const database = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (
    !fs.statSync(root).isDirectory() ||
    !fs.statSync(database).isFile() ||
    fs.lstatSync(options.databasePath).isSymbolicLink() ||
    !inside(database, root)
  ) {
    throw new Error("Phase 175 requires an owned, non-symlink catalog copy.");
  }
  const own = fs.statSync(database, { bigint: true });
  const real = fs.statSync(protectedPath, { bigint: true });
  if (database === protectedPath || (own.dev === real.dev && own.ino === real.ino)) {
    throw new Error("Phase 175 refuses the protected catalog or hard-link alias.");
  }
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) {
    throw new Error("Phase 175 client is not bound to the authorized owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) {
    throw new Error("Phase 175 owned copy must be migrated through 032.");
  }
}

async function identity(client: Client): Promise<void> {
  for (const target of TARGETS) {
    const row = await client.execute({
      sql: "SELECT type,slug,name FROM entities WHERE id=?",
      args: [target.id],
    });
    if (
      row.rows.length !== 1 ||
      String(row.rows[0]?.type) !== target.type ||
      String(row.rows[0]?.slug) !== target.slug
    ) {
      throw new Error(`Phase 175 identity mismatch for ${target.name}: ${JSON.stringify(row.rows)}`);
    }
  }
}

async function topology(client: Client): Promise<void> {
  const tx: Transaction = await client.transaction("write");
  try {
    const madeById = syncStableId("phase175-made-by", PHASE175_CLASSIC_KO_ID);
    const reverseId = syncStableId("phase175-reverse", PHASE175_CLASSIC_KO_ID);
    await tx.execute({
      sql: "DELETE FROM entity_links WHERE source_id=? AND link_type='made_by' AND target_id<>?",
      args: [PHASE175_CLASSIC_KO_ID, PHASE175_SAILOR_BRAND_ID],
    });
    await tx.execute({
      sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by',?)",
      args: [
        madeById,
        PHASE175_CLASSIC_KO_ID,
        PHASE175_SAILOR_BRAND_ID,
        "Phase 175 verified Sailor Classic Ko maker relation",
      ],
    });
    await tx.execute({
      sql: "DELETE FROM entity_links WHERE source_id=? AND link_type='reverse' AND target_id=? AND id<>?",
      args: [PHASE175_SAILOR_BRAND_ID, PHASE175_CLASSIC_KO_ID, reverseId],
    });
    await tx.execute({
      sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'reverse',?)",
      args: [
        reverseId,
        PHASE175_SAILOR_BRAND_ID,
        PHASE175_CLASSIC_KO_ID,
        "Phase 175 Sailor brand navigation to Classic Ko Dot's",
      ],
    });
    await tx.commit();
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
}

export async function applyPhase175SailorClassicKo(
  client: Client,
  options: ApplyPhase175Options,
): Promise<ApplyPhase175Result> {
  await authority(client, options);
  await identity(client);
  await topology(client);
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot);
  const packs = phase175SailorClassicKoPacks.map((pack) =>
    loadCuratedEntityPack(workspaceRoot, pack),
  );
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
  if (!database || !ownedRoot || !protectedCatalog) {
    throw new Error(
      "Usage: tsx scripts/apply-phase175-sailor-classic-ko-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]",
    );
  }
  const resolvedDatabase = path.resolve(database);
  const resolvedProtected = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase175SailorClassicKo(client, {
      workspaceRoot: process.cwd(),
      reviewer: value("--reviewer") ?? "phase175-sailor-classic-ko",
      databasePath: resolvedDatabase,
      ownedRoot: path.resolve(ownedRoot),
      protectedCatalogPath: resolvedProtected,
      protectedCatalogSnapshot: snapshotCatalogFiles(resolvedProtected),
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

const invokedPath = process.argv[1]
  ? fs.realpathSync.native(path.resolve(process.argv[1]))
  : null;
const modulePath = fs.realpathSync.native(fileURLToPath(import.meta.url));
if (invokedPath === modulePath) {
  void main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
