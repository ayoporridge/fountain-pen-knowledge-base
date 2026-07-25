import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient, type Client, type Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import type { ApplyPhase22Options, ApplyPhase22Result } from "./apply-phase22-content";

export type ApplyPhase203Options = ApplyPhase22Options;
export type ApplyPhase203Result = ApplyPhase22Result;

const OLD_ID = "fuB0SU-om1z5";
const OLD_SLUG = "百乐-pilot-capless-decimo";
const CANONICAL_ID = "s43PILOTDECI";
const CANONICAL_SLUG = "pilot-capless-decimo";
const SOURCE_KEY = "phase203-pilot-capless-decimo-route-correction";

function digest(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function stableId(prefix: string, value: string): string {
  return `${prefix}-${digest(value).slice(0, 24)}`;
}

function inside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function noRemote(options: ApplyPhase203Options): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (options.env?.[key]?.trim()) throw new Error(`Phase 203 refuses inherited remote database selection: ${key}.`);
  }
}

async function authority(client: Client, options: ApplyPhase203Options): Promise<void> {
  noRemote(options);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const root = fs.realpathSync.native(options.ownedRoot);
  const database = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(root).isDirectory() || !fs.statSync(database).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !inside(database, root)) {
    throw new Error("Phase 203 requires an owned, non-symlink catalog copy.");
  }
  const own = fs.statSync(database, { bigint: true });
  const real = fs.statSync(protectedPath, { bigint: true });
  if (database === protectedPath || (own.dev === real.dev && own.ino === real.ino)) throw new Error("Phase 203 refuses the protected catalog or hard-link alias.");
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) throw new Error("Phase 203 client is not bound to the authorized owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  if (migration.rows.length !== 1) throw new Error("Phase 203 owned copy must be migrated through 032.");
}

async function correctRoute(client: Client): Promise<void> {
  const old = await client.execute({ sql: "SELECT type,slug FROM entities WHERE id=?", args: [OLD_ID] });
  if (old.rows.length !== 1 || String(old.rows[0]?.type) !== "pen" || String(old.rows[0]?.slug) !== OLD_SLUG) throw new Error("Phase 203 retired Capless umbrella identity mismatch.");
  const canonical = await client.execute({ sql: "SELECT type,slug FROM entities WHERE id=?", args: [CANONICAL_ID] });
  if (canonical.rows.length !== 1 || String(canonical.rows[0]?.type) !== "pen" || String(canonical.rows[0]?.slug) !== CANONICAL_SLUG) throw new Error("Phase 203 Decimo canonical identity mismatch.");
  const publication = await client.execute({ sql: "SELECT status FROM entity_publications WHERE entity_id=?", args: [CANONICAL_ID] });
  if (String(publication.rows[0]?.status ?? "") !== "published") throw new Error("Phase 203 canonical Decimo must already be published.");
  const tx: Transaction = await client.transaction("write");
  try {
    const batchId = stableId("phase203-batch", SOURCE_KEY);
    const actionId = stableId("phase203-action", SOURCE_KEY);
    await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_batches(id,source_key,source_checksum,status,note) VALUES(?,?,?,'applied',?)", args: [batchId, SOURCE_KEY, digest(SOURCE_KEY), "Correct the retired mixed Capless/Decimo route to the canonical Decimo model page."] });
    await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_actions(id,batch_id,source_row_key,action_kind,action_checksum,source_entity_id,target_entity_id,status,note) VALUES(?,?,?,'alias',?,?,?,?,?)", args: [actionId, batchId, SOURCE_KEY, digest(`${SOURCE_KEY}\0${OLD_ID}\0${CANONICAL_ID}`), OLD_ID, CANONICAL_ID, "applied", "The retired mixed route is retained only as a permanent alias to the concrete Decimo page."] });
    const redirect = await tx.execute({ sql: "SELECT target_path,redirect_kind FROM entity_redirects WHERE source_path=?", args: [`/pen/${OLD_SLUG}`] });
    const target = `/pen/${CANONICAL_SLUG}`;
    if (redirect.rows.length === 0) {
      await tx.execute({ sql: "INSERT INTO entity_redirects(id,batch_id,action_id,source_path,target_path,redirect_kind,fallback_reason) VALUES(?,?,?,? ,?,'permanent',?)", args: [stableId("phase203-redirect", OLD_SLUG), batchId, actionId, `/pen/${OLD_SLUG}`, target, "corrected_canonical_route"] });
    } else if (redirect.rows.length === 1 && String(redirect.rows[0]?.target_path ?? "") === target && String(redirect.rows[0]?.redirect_kind ?? "") === "permanent") {
      await tx.execute({ sql: "UPDATE entity_redirects SET batch_id=?,action_id=?,fallback_reason=? WHERE source_path=?", args: [batchId, actionId, "corrected_canonical_route", `/pen/${OLD_SLUG}`] });
    } else if (redirect.rows.length === 1) {
      await tx.execute({ sql: "UPDATE entity_redirects SET batch_id=?,action_id=?,target_path=?,redirect_kind='permanent',fallback_reason=? WHERE source_path=?", args: [batchId, actionId, target, "corrected_canonical_route", `/pen/${OLD_SLUG}`] });
    } else {
      throw new Error("Phase 203 found duplicate redirects for the retired Capless route.");
    }
    await tx.commit();
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
}

export async function applyPhase203PilotCaplessRouteCorrection(client: Client, options: ApplyPhase203Options): Promise<ApplyPhase203Result> {
  await authority(client, options);
  await correctRoute(client);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return { entities: [{ entityId: CANONICAL_ID, outcome: "noop", contentHash: "route-correction-only" }] };
}

function value(name: string): string | null {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1] ?? null;
}

async function main(): Promise<void> {
  const database = value("--database");
  const ownedRoot = value("--owned-root");
  const protectedCatalog = value("--protected-catalog");
  if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase203-pilot-capless-route-correction.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  const resolvedDatabase = path.resolve(database);
  const resolvedProtected = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase203PilotCaplessRouteCorrection(client, {
      workspaceRoot: process.cwd(),
      reviewer: value("--reviewer") ?? "phase203-pilot-capless-route-correction",
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

const invokedPath = process.argv[1] ? fs.realpathSync.native(path.resolve(process.argv[1])) : null;
const modulePath = fs.realpathSync.native(fileURLToPath(import.meta.url));
if (invokedPath === modulePath) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
