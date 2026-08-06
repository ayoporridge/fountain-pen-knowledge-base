import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient, type Client, type Transaction } from "@libsql/client";
import {
  assertCatalogSnapshotUnchanged,
  snapshotCatalogFiles,
} from "../src/lib/audit/read-only-catalog";
import type { CatalogSnapshot } from "../src/lib/audit/audit-contracts";
import {
  publishEntity,
  recordEntityContentReview,
} from "../src/lib/publication";

const SOURCE_KEY = "phase545-wancher-oita-kurozan-identity-merge";
const WANCHER_BRAND_ID = "eOfD77nOeENN";
const DUPLICATE_ID = "phase524-wancher-oita-urushi-kurozan";
const DUPLICATE_SLUG = "wancher-oita-urushi-kurozan";
const CANONICAL_ID = "phase521-wancher-oita-urushi-kurozan";
const CANONICAL_SLUG = "wancher-oita-urushi-kurozan-fountain-pen";
const DUPLICATE_PATH = `/pen/${DUPLICATE_SLUG}`;
const CANONICAL_PATH = `/pen/${CANONICAL_SLUG}`;

export type ApplyPhase545Options = {
  databasePath: string;
  ownedRoot: string;
  protectedCatalogPath: string;
  protectedCatalogSnapshot: CatalogSnapshot;
  reviewer: string;
  workspaceRoot?: string;
  env?: NodeJS.ProcessEnv;
};

export type ApplyPhase545Result = {
  outcome: "retired" | "noop";
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

function inside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function rejectRemote(env: NodeJS.ProcessEnv): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (env[key]?.trim()) {
      throw new Error(`Phase 545 refuses inherited remote database selection: ${key}.`);
    }
  }
}

async function assertAuthority(client: Client, options: ApplyPhase545Options): Promise<void> {
  if (!options.reviewer.trim()) throw new Error("Phase 545 reviewer must not be empty.");
  rejectRemote(options.env ?? process.env);
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
    throw new Error("Phase 545 requires an owned, non-symlink catalog copy.");
  }
  const owned = fs.statSync(database, { bigint: true });
  const protectedCatalog = fs.statSync(protectedPath, { bigint: true });
  if (
    database === protectedPath ||
    Number(owned.nlink) !== 1 ||
    (owned.dev === protectedCatalog.dev && owned.ino === protectedCatalog.ino)
  ) {
    throw new Error("Phase 545 refuses the protected catalog or hard-link alias.");
  }
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) {
    throw new Error("Phase 545 client is not bound to the authorized owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) {
    throw new Error("Phase 545 owned copy must be migrated through 032.");
  }
}

async function mergeDuplicate(client: Client): Promise<boolean> {
  const tx: Transaction = await client.transaction("write");
  let changed = false;
  try {
    const brand = await tx.execute({
      sql: "SELECT type,slug FROM entities WHERE id=?",
      args: [WANCHER_BRAND_ID],
    });
    if (
      brand.rows.length !== 1 ||
      String(brand.rows[0]?.type) !== "brand" ||
      String(brand.rows[0]?.slug) !== "wancher"
    ) {
      throw new Error("Phase 545 Wancher brand identity mismatch.");
    }

    const identities = await tx.execute({
      sql: "SELECT id,type,slug,name FROM entities WHERE id IN (?,?)",
      args: [DUPLICATE_ID, CANONICAL_ID],
    });
    const duplicate = identities.rows.find((row) => String(row.id) === DUPLICATE_ID);
    const canonical = identities.rows.find((row) => String(row.id) === CANONICAL_ID);
    if (
      !duplicate ||
      String(duplicate.type) !== "pen" ||
      String(duplicate.slug) !== DUPLICATE_SLUG ||
      !canonical ||
      String(canonical.type) !== "pen" ||
      String(canonical.slug) !== CANONICAL_SLUG ||
      String(canonical.name) !== String(duplicate.name)
    ) {
      throw new Error("Phase 545 Wancher Oita Kurozan identity set is incomplete or conflicting.");
    }

    const batchId = stableId("phase545-batch", SOURCE_KEY);
    const actionId = stableId("phase545-action", SOURCE_KEY);
    const note = `Merge duplicate /pen/${DUPLICATE_SLUG} into canonical /pen/${CANONICAL_SLUG}; both rows refer to Wancher product id 9241757057239.`;
    await tx.execute({
      sql: "INSERT OR IGNORE INTO taxonomy_batches(id,source_key,source_checksum,status,note) VALUES(?,?,?,'applied',?)",
      args: [batchId, SOURCE_KEY, digest(SOURCE_KEY), note],
    });
    await tx.execute({
      sql: "INSERT OR IGNORE INTO taxonomy_actions(id,batch_id,source_row_key,action_kind,action_checksum,source_entity_id,target_entity_id,status,note) VALUES(?,?,?,'merge',?,?,?,?,?)",
      args: [
        actionId,
        batchId,
        SOURCE_KEY,
        digest(`${SOURCE_KEY}\0${DUPLICATE_ID}\0${CANONICAL_ID}`),
        DUPLICATE_ID,
        CANONICAL_ID,
        "applied",
        note,
      ],
    });
    const lineage = await tx.execute({
      sql: "SELECT target_entity_id,lineage_kind FROM entity_lineage WHERE source_entity_id=? AND lineage_kind='merge'",
      args: [DUPLICATE_ID],
    });
    if (lineage.rows.length > 1) throw new Error("Phase 545 found multiple Oita Kurozan merge lineages.");
    if (lineage.rows.length === 0) {
      await tx.execute({
        sql: "INSERT INTO entity_lineage(id,batch_id,action_id,source_entity_id,target_entity_id,lineage_kind,fallback_reason) VALUES(?,?,?, ?,?,'merge',?)",
        args: [stableId("phase545-lineage", SOURCE_KEY), batchId, actionId, DUPLICATE_ID, CANONICAL_ID, "duplicate_canonical_merge"],
      });
      changed = true;
    } else if (
      String(lineage.rows[0]?.target_entity_id) !== CANONICAL_ID ||
      String(lineage.rows[0]?.lineage_kind) !== "merge"
    ) {
      throw new Error("Phase 545 found a conflicting Oita Kurozan merge lineage.");
    }

    const oldAliases = await tx.execute({
      sql: "SELECT alias,language,source_id,created_at,alias_kind,market,valid_from,valid_to,source_item_id,review_status FROM entity_aliases WHERE entity_id=?",
      args: [DUPLICATE_ID],
    });
    const canonicalAliases = await tx.execute({
      sql: "SELECT alias,language FROM entity_aliases WHERE entity_id=?",
      args: [CANONICAL_ID],
    });
    const existingAliases = new Set(
      canonicalAliases.rows.map((row) => `${String(row.alias)}\0${String(row.language)}`),
    );
    for (const alias of oldAliases.rows) {
      const key = `${String(alias.alias)}\0${String(alias.language)}`;
      if (existingAliases.has(key)) continue;
      await tx.execute({
        sql: "INSERT INTO entity_aliases(id,entity_id,alias,language,source_id,created_at,alias_kind,market,valid_from,valid_to,source_item_id,review_status) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",
        args: [
          stableId("phase545-alias", `${CANONICAL_ID}:${key}`),
          CANONICAL_ID,
          alias.alias,
          alias.language,
          alias.source_id,
          alias.created_at,
          alias.alias_kind,
          alias.market,
          alias.valid_from,
          alias.valid_to,
          alias.source_item_id,
          alias.review_status,
        ],
      });
      existingAliases.add(key);
      changed = true;
    }
    const deletedAliases = await tx.execute({
      sql: "DELETE FROM entity_aliases WHERE entity_id=?",
      args: [DUPLICATE_ID],
    });
    if (Number(deletedAliases.rowsAffected) > 0) changed = true;

    const deletedLinks = await tx.execute({
      sql: "DELETE FROM entity_links WHERE source_id=? OR target_id=?",
      args: [DUPLICATE_ID, DUPLICATE_ID],
    });
    if (Number(deletedLinks.rowsAffected) > 0) changed = true;

    const retired = await tx.execute({
      sql: `UPDATE entity_publications
            SET status='retired',blockers_json='["taxonomy_merged"]',
                approved_content_hash=NULL,reviewed_content_revision=NULL,
                reviewed_contract_version=NULL,reviewed_by=NULL,
                reviewed_at=NULL,published_at=NULL,review_notes=?,updated_at=datetime('now')
            WHERE entity_id=? AND (status<>'retired' OR blockers_json<>'["taxonomy_merged"]')`,
      args: [note, DUPLICATE_ID],
    });
    if (Number(retired.rowsAffected) > 0) changed = true;

    const redirect = await tx.execute({
      sql: "SELECT target_path,redirect_kind FROM entity_redirects WHERE source_path=?",
      args: [DUPLICATE_PATH],
    });
    if (redirect.rows.length === 0) {
      await tx.execute({
        sql: "INSERT INTO entity_redirects(id,batch_id,action_id,source_path,target_path,redirect_kind,fallback_reason) VALUES(?,?,?,?,?,'permanent','duplicate_canonical_merge')",
        args: [stableId("phase545-redirect", DUPLICATE_PATH), batchId, actionId, DUPLICATE_PATH, CANONICAL_PATH],
      });
      changed = true;
    } else if (
      redirect.rows.length !== 1 ||
      String(redirect.rows[0]?.target_path) !== CANONICAL_PATH ||
      String(redirect.rows[0]?.redirect_kind) !== "permanent"
    ) {
      throw new Error("Phase 545 found a conflicting Oita Kurozan redirect.");
    }

    await tx.commit();
    return changed;
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
}

export async function applyPhase545WancherOitaKurozanIdentityMerge(
  client: Client,
  options: ApplyPhase545Options,
): Promise<ApplyPhase545Result> {
  await assertAuthority(client, options);
  const changed = await mergeDuplicate(client);
  if (changed) {
    for (const entityId of [WANCHER_BRAND_ID, CANONICAL_ID]) {
      for (const reviewKind of ["fact", "language", "media"] as const) {
        await recordEntityContentReview(client, {
          entityId,
          reviewKind,
          reviewer: options.reviewer,
          status: "approved",
          notes: `${SOURCE_KEY}; re-approved after duplicate identity merge.`,
        });
      }
      await publishEntity(client, { entityId, reviewer: options.reviewer });
    }
  }
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return {
    outcome: changed ? "retired" : "noop",
    sourceId: DUPLICATE_ID,
    targetId: CANONICAL_ID,
    sourcePath: DUPLICATE_PATH,
    targetPath: CANONICAL_PATH,
  };
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
    throw new Error("Usage: tsx scripts/apply-phase545-wancher-oita-kurozan-identity-merge.ts --database <owned-copy> --owned-root <root> --protected-catalog <data/fpkg.db> [--reviewer <name>]");
  }
  const resolvedDatabase = path.resolve(database);
  const resolvedProtected = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase545WancherOitaKurozanIdentityMerge(client, {
      databasePath: resolvedDatabase,
      ownedRoot: path.resolve(ownedRoot),
      protectedCatalogPath: resolvedProtected,
      protectedCatalogSnapshot: snapshotCatalogFiles(resolvedProtected),
      reviewer: value("--reviewer") ?? "phase545-wancher-oita-kurozan-identity-merge",
      workspaceRoot: process.cwd(),
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
