import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient, type Client, type Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged } from "../src/lib/audit/read-only-catalog";
import type { CatalogSnapshot } from "../src/lib/audit/audit-contracts";

const RETIRED_M800_ID = "rKSjyWghpB8Y";
const CANONICAL_M800_ID = "1UzrQA9Rrmqs";
const RETIRED_M800_SLUG = "百利金-pelikan-m800";
const CANONICAL_M800_SLUG = "pelikan-souveran-m800";
const SOURCE_KEY = "phase504-retired-pelikan-m800-canonical-merge-v1";
const SOURCE_PATH = `/pen/${RETIRED_M800_SLUG}`;
const TARGET_PATH = `/pen/${CANONICAL_M800_SLUG}`;

export type ApplyPhase504Options = {
  databasePath: string;
  ownedRoot: string;
  protectedCatalogPath: string;
  protectedCatalogSnapshot: CatalogSnapshot;
  env?: NodeJS.ProcessEnv;
};

export type ApplyPhase504Result = {
  outcome: "applied" | "noop";
  sourceId: string;
  targetId: string;
  sourcePath: string;
  targetPath: string;
};

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

function assertNoRemoteSelection(env: NodeJS.ProcessEnv): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (env[key]?.trim()) {
      throw new Error(`Phase 504 refuses inherited remote database selection: ${key}.`);
    }
  }
}

async function assertOwned(client: Client, options: ApplyPhase504Options): Promise<void> {
  assertNoRemoteSelection(options.env ?? process.env);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const databasePath = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (
    !fs.statSync(ownedRoot).isDirectory() ||
    !fs.statSync(databasePath).isFile() ||
    fs.lstatSync(options.databasePath).isSymbolicLink() ||
    !isInside(databasePath, ownedRoot)
  ) {
    throw new Error("Phase 504 owned catalog authority check failed.");
  }
  const own = fs.statSync(databasePath, { bigint: true });
  const real = fs.statSync(protectedPath, { bigint: true });
  if (
    databasePath === protectedPath ||
    (own.dev === real.dev && own.ino === real.ino)
  ) {
    throw new Error("Phase 504 refuses protected catalog or hard-link alias.");
  }
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== databasePath) {
    throw new Error("Phase 504 client is not bound to owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 AS ok FROM migrations WHERE name = ? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) {
    throw new Error("Phase 504 owned copy must be migrated through 032.");
  }
}

async function recordTaxonomyAction(
  tx: Transaction,
): Promise<{ batchId: string; actionId: string }> {
  const batchId = stableId("phase504-batch", SOURCE_KEY);
  const actionId = stableId("phase504-action", SOURCE_KEY);
  const note =
    "Retired duplicate Pelikan M800 donor now points to the researched canonical Souverän M800 page; the donor remains non-public.";
  await tx.execute({
    sql: `INSERT OR IGNORE INTO taxonomy_batches
      (id, source_key, source_checksum, status, note)
      VALUES (?, ?, ?, 'applied', ?)`,
    args: [batchId, SOURCE_KEY, digest(SOURCE_KEY), note],
  });
  await tx.execute({
    sql: `INSERT OR IGNORE INTO taxonomy_actions
      (id, batch_id, source_row_key, action_kind, action_checksum,
       source_entity_id, target_entity_id, status, note)
      VALUES (?, ?, ?, 'merge', ?, ?, ?, 'applied', ?)`,
    args: [
      actionId,
      batchId,
      SOURCE_KEY,
      digest(`${SOURCE_KEY}\0${RETIRED_M800_ID}\0${CANONICAL_M800_ID}`),
      RETIRED_M800_ID,
      CANONICAL_M800_ID,
      note,
    ],
  });
  return { batchId, actionId };
}

async function ensureLineage(
  tx: Transaction,
  batchId: string,
  actionId: string,
): Promise<boolean> {
  const existing = await tx.execute({
    sql: `SELECT id, batch_id, action_id, target_entity_id, lineage_kind
      FROM entity_lineage
      WHERE source_entity_id = ? AND lineage_kind = 'merge'`,
    args: [RETIRED_M800_ID],
  });
  if (existing.rows.length > 1) {
    throw new Error("Phase 504 found multiple merge lineages for retired Pelikan M800.");
  }
  if (existing.rows.length === 1) {
    const row = existing.rows[0];
    if (
      String(row?.target_entity_id) !== CANONICAL_M800_ID ||
      String(row?.lineage_kind) !== "merge"
    ) {
      throw new Error("Phase 504 found a conflicting Pelikan M800 merge lineage.");
    }
    return false;
  }
  const inserted = await tx.execute({
    sql: `INSERT INTO entity_lineage
      (id, batch_id, action_id, source_entity_id, target_entity_id,
       lineage_kind, fallback_reason)
      VALUES (?, ?, ?, ?, ?, 'merge', NULL)`,
    args: [
      stableId("phase504-lineage", SOURCE_KEY),
      batchId,
      actionId,
      RETIRED_M800_ID,
      CANONICAL_M800_ID,
    ],
  });
  return Number(inserted.rowsAffected) === 1;
}

async function ensureRedirect(
  tx: Transaction,
  batchId: string,
  actionId: string,
): Promise<boolean> {
  const existing = await tx.execute({
    sql: `SELECT id, target_path, redirect_kind, fallback_reason
      FROM entity_redirects WHERE source_path = ?`,
    args: [SOURCE_PATH],
  });
  if (existing.rows.length > 1) {
    throw new Error("Phase 504 found duplicate redirects for retired Pelikan M800.");
  }
  if (existing.rows.length === 1) {
    const row = existing.rows[0];
    if (
      String(row?.target_path) !== TARGET_PATH ||
      String(row?.redirect_kind) !== "permanent"
    ) {
      throw new Error("Phase 504 found a conflicting Pelikan M800 redirect.");
    }
    return false;
  }
  const inserted = await tx.execute({
    sql: `INSERT INTO entity_redirects
      (id, batch_id, action_id, source_path, target_path,
       redirect_kind, fallback_reason)
      VALUES (?, ?, ?, ?, ?, 'permanent', 'duplicate_canonical_merge')`,
    args: [
      stableId("phase504-redirect", SOURCE_PATH),
      batchId,
      actionId,
      SOURCE_PATH,
      TARGET_PATH,
    ],
  });
  return Number(inserted.rowsAffected) === 1;
}

export async function applyPhase504RetiredPelikanM800Identity(
  client: Client,
  options: ApplyPhase504Options,
): Promise<ApplyPhase504Result> {
  await assertOwned(client, options);
  const tx = await client.transaction("write");
  try {
    const identities = await tx.execute({
      sql: `SELECT id, type, slug FROM entities WHERE id IN (?, ?)`,
      args: [RETIRED_M800_ID, CANONICAL_M800_ID],
    });
    if (
      identities.rows.length !== 2 ||
      identities.rows.some((row) => String(row?.type) !== "pen")
    ) {
      throw new Error("Phase 504 Pelikan M800 identity set is incomplete.");
    }
    const source = identities.rows.find((row) => String(row.id) === RETIRED_M800_ID);
    const target = identities.rows.find((row) => String(row.id) === CANONICAL_M800_ID);
    if (
      String(source?.slug) !== RETIRED_M800_SLUG ||
      String(target?.slug) !== CANONICAL_M800_SLUG
    ) {
      throw new Error("Phase 504 Pelikan M800 slug identities do not match the approved mapping.");
    }
    const publications = await tx.execute({
      sql: `SELECT entity_id, status FROM entity_publications WHERE entity_id IN (?, ?)`,
      args: [RETIRED_M800_ID, CANONICAL_M800_ID],
    });
    const sourcePublication = publications.rows.find(
      (row) => String(row.entity_id) === RETIRED_M800_ID,
    );
    const targetPublication = publications.rows.find(
      (row) => String(row.entity_id) === CANONICAL_M800_ID,
    );
    if (String(sourcePublication?.status) !== "retired") {
      throw new Error("Phase 504 refuses to merge a non-retired Pelikan M800 donor.");
    }
    if (String(targetPublication?.status) !== "published") {
      throw new Error("Phase 504 canonical Pelikan Souverän M800 is not published.");
    }
    const action = await recordTaxonomyAction(tx);
    const lineageChanged = await ensureLineage(tx, action.batchId, action.actionId);
    const redirectChanged = await ensureRedirect(tx, action.batchId, action.actionId);
    await tx.commit();
    assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
    return {
      outcome: lineageChanged || redirectChanged ? "applied" : "noop",
      sourceId: RETIRED_M800_ID,
      targetId: CANONICAL_M800_ID,
      sourcePath: SOURCE_PATH,
      targetPath: TARGET_PATH,
    };
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
}

function value(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main(): Promise<void> {
  const database = value("--database");
  const ownedRoot = value("--owned-root");
  const protectedCatalog = value("--protected-catalog");
  if (!database || !ownedRoot || !protectedCatalog) {
    throw new Error(
      "Usage: tsx scripts/apply-phase504-retired-pelikan-m800-identity.ts --database <owned-copy> --owned-root <root> --protected-catalog <data/fpkg.db>",
    );
  }
  const protectedModule = await import("../src/lib/audit/read-only-catalog");
  const protectedSnapshot = protectedModule.snapshotCatalogFiles(protectedCatalog);
  const client = createClient({ url: `file:${path.resolve(database)}` });
  try {
    const result = await applyPhase504RetiredPelikanM800Identity(client, {
      databasePath: path.resolve(database),
      ownedRoot: path.resolve(ownedRoot),
      protectedCatalogPath: path.resolve(protectedCatalog),
      protectedCatalogSnapshot: protectedSnapshot,
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
