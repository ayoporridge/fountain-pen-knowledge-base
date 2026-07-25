import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
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
  PHASE214_CANONICAL_SLUG,
  PHASE214_NIB_CREAPER_ID,
  PHASE214_NOODLERS_BRAND_ID,
  PHASE214_OLD_SLUG,
  PHASE214_SOURCE_KEY,
  phase214NoodlersNibCreaperPacks,
} from "./data/phase214-noodlers-nib-creaper";

export type ApplyPhase214Options = ApplyPhase22Options;
export type ApplyPhase214Result = ApplyPhase22Result;

function digest(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function stableId(prefix: string, value: string): string {
  return `${prefix}-${digest(value).slice(0, 24)}`;
}

function isInside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function noRemote(options: ApplyPhase214Options): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (options.env?.[key]?.trim()) {
      throw new Error(`Phase 214 refuses inherited remote database selection: ${key}.`);
    }
  }
}

async function authority(client: Client, options: ApplyPhase214Options): Promise<void> {
  noRemote(options);
  if (!options.reviewer.trim()) throw new Error("Phase 214 reviewer must not be empty.");
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const root = fs.realpathSync.native(options.ownedRoot);
  const database = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (
    !fs.statSync(root).isDirectory() ||
    !fs.statSync(database).isFile() ||
    fs.lstatSync(options.databasePath).isSymbolicLink() ||
    !isInside(database, root)
  ) {
    throw new Error("Phase 214 requires an owned, non-symlink catalog copy.");
  }
  const own = fs.statSync(database, { bigint: true });
  const real = fs.statSync(protectedPath, { bigint: true });
  if (
    database === protectedPath ||
    Number(own.nlink) !== 1 ||
    (own.dev === real.dev && own.ino === real.ino)
  ) {
    throw new Error("Phase 214 refuses the protected catalog or hard-link alias.");
  }
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) {
    throw new Error("Phase 214 client is not bound to the authorized owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) {
    throw new Error("Phase 214 owned copy must be migrated through 032.");
  }
}

async function identity(client: Client): Promise<void> {
  const brand = await client.execute({
    sql: "SELECT type,slug FROM entities WHERE id=?",
    args: [PHASE214_NOODLERS_BRAND_ID],
  });
  if (
    brand.rows.length !== 1 ||
    String(brand.rows[0]?.type) !== "brand" ||
    String(brand.rows[0]?.slug) !== "noodlers"
  ) {
    throw new Error("Phase 214 Noodler's brand identity mismatch.");
  }
  const pen = await client.execute({
    sql: "SELECT type,slug,name,source FROM entities WHERE id=?",
    args: [PHASE214_NIB_CREAPER_ID],
  });
  if (pen.rows.length !== 1 || String(pen.rows[0]?.type) !== "pen") {
    throw new Error("Phase 214 Nib Creaper entity identity mismatch.");
  }
  const slug = String(pen.rows[0]?.slug ?? "");
  const source = String(pen.rows[0]?.source ?? "");
  if (slug !== PHASE214_OLD_SLUG && slug !== PHASE214_CANONICAL_SLUG) {
    throw new Error("Phase 214 Nib Creaper legacy or canonical slug is missing.");
  }
  if (slug === PHASE214_CANONICAL_SLUG && source && !source.startsWith(`curated-content:${PHASE214_SOURCE_KEY}:`)) {
    throw new Error("Phase 214 Nib Creaper canonical identity belongs to another pack.");
  }
}

async function prepareIdentity(client: Client): Promise<void> {
  const current = await client.execute({
    sql: "SELECT type,slug,name,source FROM entities WHERE id=?",
    args: [PHASE214_NIB_CREAPER_ID],
  });
  const row = current.rows[0];
  if (!row || String(row.type) !== "pen") throw new Error("Phase 214 raw Nib Creaper row is missing.");
  const slug = String(row.slug);
  const source = String(row.source ?? "");
  if (slug === PHASE214_CANONICAL_SLUG && source.startsWith(`curated-content:${PHASE214_SOURCE_KEY}:`)) return;
  if (slug !== PHASE214_OLD_SLUG || source) {
    throw new Error("Phase 214 refuses a partial or alternate Nib Creaper identity.");
  }
  const collision = await client.execute({
    sql: "SELECT id FROM entities WHERE slug=? AND id<>?",
    args: [PHASE214_CANONICAL_SLUG, PHASE214_NIB_CREAPER_ID],
  });
  if (collision.rows.length !== 0) throw new Error("Phase 214 canonical Nib Creaper slug is occupied.");

  const batchKey = `${PHASE214_SOURCE_KEY}-identity`;
  const batchId = stableId("phase214-batch", batchKey);
  const actionId = stableId("phase214-action", batchKey);
  const sourcePath = `/pen/${PHASE214_OLD_SLUG}`;
  const targetPath = `/pen/${PHASE214_CANONICAL_SLUG}`;
  const transaction: Transaction = await client.transaction("write");
  try {
    await transaction.execute({
      sql: "INSERT OR IGNORE INTO taxonomy_batches(id,source_key,source_checksum,status,note) VALUES(?,?,?,'applied',?)",
      args: [batchId, batchKey, digest(batchKey), "Canonicalize the ambiguous Chinese Noodler's pen placeholder to the sourced Nib Creaper identity."],
    });
    await transaction.execute({
      sql: "INSERT OR IGNORE INTO taxonomy_actions(id,batch_id,source_row_key,action_kind,action_checksum,source_entity_id,target_entity_id,status,note) VALUES(?,?,?,'rename',?,?,?,?,?)",
      args: [actionId, batchId, PHASE214_OLD_SLUG, digest(`${PHASE214_NIB_CREAPER_ID}:${PHASE214_OLD_SLUG}:${PHASE214_CANONICAL_SLUG}`), PHASE214_NIB_CREAPER_ID, PHASE214_NIB_CREAPER_ID, "applied", "Use the precise Nib Creaper route; retain the ambiguous Chinese name as alias."],
    });
    const redirect = await transaction.execute({
      sql: "SELECT target_path,redirect_kind FROM entity_redirects WHERE source_path=?",
      args: [sourcePath],
    });
    if (redirect.rows.length === 0) {
      await transaction.execute({
        sql: "INSERT INTO entity_redirects(id,batch_id,action_id,source_path,target_path,redirect_kind,fallback_reason) VALUES(?,?,?,?,?,'permanent','canonical_slug_rename')",
        args: [stableId("phase214-redirect", PHASE214_OLD_SLUG), batchId, actionId, sourcePath, targetPath],
      });
    } else if (
      redirect.rows.length !== 1 ||
      String(redirect.rows[0]?.target_path) !== targetPath ||
      String(redirect.rows[0]?.redirect_kind) !== "permanent"
    ) {
      throw new Error("Phase 214 found a conflicting Nib Creaper redirect.");
    }
    const renamed = await transaction.execute({
      sql: "UPDATE entities SET slug=?,name=?,updated_at=datetime('now') WHERE id=? AND type='pen' AND slug=? AND source IS NULL",
      args: [PHASE214_CANONICAL_SLUG, "Noodler's Nib Creaper", PHASE214_NIB_CREAPER_ID, PHASE214_OLD_SLUG],
    });
    if (renamed.rowsAffected !== 1) throw new Error("Phase 214 raw Nib Creaper row changed during identity preparation.");
    await transaction.commit();
  } catch (error) {
    if (!transaction.closed) await transaction.rollback();
    throw error;
  }
}

export async function applyPhase214NoodlersNibCreaperContent(
  client: Client,
  options: ApplyPhase214Options,
): Promise<ApplyPhase214Result> {
  await authority(client, options);
  await identity(client);
  await prepareIdentity(client);
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot);
  const packs = phase214NoodlersNibCreaperPacks;
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
    throw new Error("Usage: tsx scripts/apply-phase214-noodlers-nib-creaper-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  }
  const resolvedDatabase = path.resolve(database);
  const resolvedProtected = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase214NoodlersNibCreaperContent(client, {
      workspaceRoot: process.cwd(),
      reviewer: value("--reviewer") ?? "phase214-noodlers-nib-creaper",
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

const invokedPath = process.argv[1] ? fs.realpathSync.native(path.resolve(process.argv[1])) : null;
const modulePath = fs.realpathSync.native(fileURLToPath(import.meta.url));
if (invokedPath === modulePath) void main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
