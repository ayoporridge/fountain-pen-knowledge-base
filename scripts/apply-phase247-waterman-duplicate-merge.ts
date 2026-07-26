import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient, type Client, type Transaction } from "@libsql/client";
import {
  assertCatalogSnapshotUnchanged,
  snapshotCatalogFiles,
} from "../src/lib/audit/read-only-catalog";
import {
  publishEntity,
  recordEntityContentReview,
} from "../src/lib/publication";
import type { ApplyPhase22Options, ApplyPhase22Result } from "./apply-phase22-content";

export type ApplyPhase247Options = ApplyPhase22Options;
export type ApplyPhase247Result = ApplyPhase22Result;

const SOURCE_KEY = "phase247-waterman-duplicate-merge";
const BRAND_ID = "zkAu9PePDdqJ";
const DUPLICATES = [
  {
    oldId: "p244WatermanAllure",
    oldSlug: "waterman-allure-fountain-pen",
    canonicalId: "phase83-pen-waterman-allure",
    canonicalSlug: "waterman-allure",
  },
  {
    oldId: "p245WatermanException",
    oldSlug: "waterman-exception-fountain-pen",
    canonicalId: "phase131-waterman-exception-sap-2214314",
    canonicalSlug: "waterman-exception",
  },
] as const;

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

function rejectRemote(options: ApplyPhase247Options): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (options.env?.[key]?.trim()) {
      throw new Error(`Phase 247 refuses inherited remote database selection: ${key}.`);
    }
  }
}

async function assertAuthority(client: Client, options: ApplyPhase247Options): Promise<void> {
  rejectRemote(options);
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
    throw new Error("Phase 247 requires an owned, non-symlink catalog copy.");
  }
  const owned = fs.statSync(database, { bigint: true });
  const protectedCatalog = fs.statSync(protectedPath, { bigint: true });
  if (
    database === protectedPath ||
    (owned.dev === protectedCatalog.dev && owned.ino === protectedCatalog.ino)
  ) {
    throw new Error("Phase 247 refuses the protected catalog or hard-link alias.");
  }
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) {
    throw new Error("Phase 247 client is not bound to the authorized owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) {
    throw new Error("Phase 247 owned copy must be migrated through 032.");
  }
}

async function mergeDuplicates(client: Client): Promise<boolean> {
  const tx: Transaction = await client.transaction("write");
  let changed = false;
  try {
    const brand = await tx.execute({
      sql: "SELECT type,slug FROM entities WHERE id=?",
      args: [BRAND_ID],
    });
    if (
      brand.rows.length !== 1 ||
      String(brand.rows[0]?.type) !== "brand" ||
      String(brand.rows[0]?.slug) !== "waterman"
    ) {
      throw new Error("Phase 247 Waterman brand identity mismatch.");
    }

    for (const duplicate of DUPLICATES) {
      const old = await tx.execute({
        sql: "SELECT type,slug FROM entities WHERE id=?",
        args: [duplicate.oldId],
      });
      const canonical = await tx.execute({
        sql: "SELECT type,slug FROM entities WHERE id=?",
        args: [duplicate.canonicalId],
      });
      if (
        old.rows.length !== 1 ||
        String(old.rows[0]?.type) !== "pen" ||
        String(old.rows[0]?.slug) !== duplicate.oldSlug
      ) {
        throw new Error(`Phase 247 duplicate identity mismatch: ${duplicate.oldId}.`);
      }
      if (
        canonical.rows.length !== 1 ||
        String(canonical.rows[0]?.type) !== "pen" ||
        String(canonical.rows[0]?.slug) !== duplicate.canonicalSlug
      ) {
        throw new Error(`Phase 247 canonical identity mismatch: ${duplicate.canonicalId}.`);
      }

      const batchId = stableId("phase247-batch", SOURCE_KEY);
      const actionKey = `${SOURCE_KEY}:${duplicate.oldId}`;
      const actionId = stableId("phase247-action", actionKey);
      const note = `Merge duplicate Waterman route /pen/${duplicate.oldSlug} into /pen/${duplicate.canonicalSlug}; retain verified aliases on the canonical model.`;
      await tx.execute({
        sql: "INSERT OR IGNORE INTO taxonomy_batches(id,source_key,source_checksum,status,note) VALUES(?,?,?,'applied',?)",
        args: [batchId, SOURCE_KEY, digest(SOURCE_KEY), "Remove duplicate Waterman model pages from the public graph."],
      });
      await tx.execute({
        sql: "INSERT OR IGNORE INTO taxonomy_actions(id,batch_id,source_row_key,action_kind,action_checksum,source_entity_id,target_entity_id,status,note) VALUES(?,?,?,'merge',?,?,?,?,?)",
        args: [
          actionId,
          batchId,
          actionKey,
          digest(`${actionKey}\0${duplicate.canonicalId}`),
          duplicate.oldId,
          duplicate.canonicalId,
          "applied",
          note,
        ],
      });
      await tx.execute({
        sql: "INSERT OR IGNORE INTO entity_lineage(id,batch_id,action_id,source_entity_id,target_entity_id,lineage_kind,fallback_reason) VALUES(?,?,?, ?,?,'merge',?)",
        args: [
          stableId("phase247-lineage", actionKey),
          batchId,
          actionId,
          duplicate.oldId,
          duplicate.canonicalId,
          "duplicate_canonical_merge",
        ],
      });

      const oldAliases = await tx.execute({
        sql: "SELECT alias,language,source_id,created_at,alias_kind,market,valid_from,valid_to,source_item_id,review_status FROM entity_aliases WHERE entity_id=?",
        args: [duplicate.oldId],
      });
      const canonicalAliases = await tx.execute({
        sql: "SELECT alias,language FROM entity_aliases WHERE entity_id=?",
        args: [duplicate.canonicalId],
      });
      const existingAliases = new Set(
        canonicalAliases.rows.map((row) => `${String(row.alias)}\0${String(row.language)}`),
      );
      for (const alias of oldAliases.rows) {
        const key = `${String(alias.alias)}\0${String(alias.language)}`;
        if (!existingAliases.has(key)) {
          await tx.execute({
            sql: "INSERT INTO entity_aliases(id,entity_id,alias,language,source_id,created_at,alias_kind,market,valid_from,valid_to,source_item_id,review_status) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",
            args: [
              stableId("phase247-alias", `${duplicate.canonicalId}:${key}`),
              duplicate.canonicalId,
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
      }
      const deletedAliases = await tx.execute({
        sql: "DELETE FROM entity_aliases WHERE entity_id=?",
        args: [duplicate.oldId],
      });
      if (Number(deletedAliases.rowsAffected) > 0) changed = true;

      const deletedLinks = await tx.execute({
        sql: "DELETE FROM entity_links WHERE source_id=? OR target_id=?",
        args: [duplicate.oldId, duplicate.oldId],
      });
      if (Number(deletedLinks.rowsAffected) > 0) changed = true;

      const retired = await tx.execute({
        sql: `UPDATE entity_publications
              SET status='retired',blockers_json='["taxonomy_merged"]',
                  approved_content_hash=NULL,reviewed_content_revision=NULL,
                  reviewed_contract_version=NULL,reviewed_by=NULL,
                  reviewed_at=NULL,published_at=NULL,review_notes=?,updated_at=datetime('now')
              WHERE entity_id=? AND (status<>'retired' OR blockers_json<>'["taxonomy_merged"]')`,
        args: [note, duplicate.oldId],
      });
      if (Number(retired.rowsAffected) > 0) changed = true;

      const target = `/pen/${duplicate.canonicalSlug}`;
      const redirect = await tx.execute({
        sql: "SELECT target_path,redirect_kind FROM entity_redirects WHERE source_path=?",
        args: [`/pen/${duplicate.oldSlug}`],
      });
      if (redirect.rows.length === 0) {
        await tx.execute({
          sql: "INSERT INTO entity_redirects(id,batch_id,action_id,source_path,target_path,redirect_kind,fallback_reason) VALUES(?,?,?,?,?,'permanent',?)",
          args: [stableId("phase247-redirect", duplicate.oldSlug), batchId, actionId, `/pen/${duplicate.oldSlug}`, target, "duplicate_canonical_merge"],
        });
        changed = true;
      } else if (
        redirect.rows.length !== 1 ||
        String(redirect.rows[0]?.target_path) !== target ||
        String(redirect.rows[0]?.redirect_kind) !== "permanent"
      ) {
        throw new Error(`Phase 247 conflicting redirect for ${duplicate.oldSlug}.`);
      }
    }
    await tx.commit();
    return changed;
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
}

export async function applyPhase247WatermanDuplicateMerge(
  client: Client,
  options: ApplyPhase247Options,
): Promise<ApplyPhase247Result> {
  if (!options.reviewer.trim()) throw new Error("Phase 247 reviewer must not be empty.");
  await assertAuthority(client, options);
  const changed = await mergeDuplicates(client);
  if (changed) {
    const republishIds = [BRAND_ID, ...DUPLICATES.map((duplicate) => duplicate.canonicalId)];
    for (const entityId of republishIds) {
      for (const reviewKind of ["fact", "language", "media"] as const) {
        await recordEntityContentReview(client, {
          entityId,
          reviewKind,
          reviewer: options.reviewer,
          status: "approved",
          notes: `${SOURCE_KEY}; re-approved after duplicate model merge.`,
        });
      }
      await publishEntity(client, { entityId, reviewer: options.reviewer });
    }
  }
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return {
    entities: DUPLICATES.map((duplicate) => ({
      entityId: duplicate.oldId,
      outcome: changed ? "noop" : "noop",
      contentHash: "identity-merge-only",
    })),
  };
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
    throw new Error("Usage: tsx scripts/apply-phase247-waterman-duplicate-merge.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  }
  const resolvedDatabase = path.resolve(database);
  const resolvedProtected = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase247WatermanDuplicateMerge(client, {
      workspaceRoot: process.cwd(),
      reviewer: value("--reviewer") ?? SOURCE_KEY,
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

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  void main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
