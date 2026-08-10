import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient, type Client, type Transaction } from "@libsql/client";
import {
  insertPack,
  uniqueSources,
  upsertSources,
  validatePack,
  type ApplyPhase22Options,
  type ApplyPhase22Result,
} from "./apply-phase22-content";
import {
  computePublicationContentHash,
  publishEntity,
  recordEntityContentReview,
} from "../src/lib/publication";
import {
  assertCatalogSnapshotUnchanged,
  snapshotCatalogFiles,
} from "../src/lib/audit/read-only-catalog";
import type { CatalogSnapshot } from "../src/lib/audit/audit-contracts";
import {
  loadCuratedEntityPack,
  type LoadedCuratedEntityPack,
} from "./lib/curated-content-pack";
import {
  PHASE581_CANONICAL_SLUG,
  PHASE581_DUPLICATE_ID,
  PHASE581_DUPLICATE_SLUG,
  PHASE581_REVIEWER,
  PHASE581_TARGET_ID,
  PHASE581_WANCHER_BRAND_ID,
  phase581WancherZoganMomijiGreenTamamushiPacks,
} from "./data/phase581-wancher-zogan-momiji-green-tamamushi-depth";

export type ApplyPhase581Options = ApplyPhase22Options;

export type ApplyPhase581Result = ApplyPhase22Result & {
  retiredDuplicate: {
    entityId: string;
    sourcePath: string;
    targetPath: string;
    outcome: "retired" | "noop";
  };
};

const SOURCE_KEY = "phase581-wancher-momiji-identity-v1";
const RETIRED_BLOCKERS = '["canonical_redirect"]';
const RETIRED_NOTE =
  "Phase 581 retired duplicate Wancher Green Tamamushi identity; permanent redirect to the Phase 543 exact product route; no payload migrated.";

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
  for (const key of [
    "TURSO_DATABASE_URL",
    "TURSO_AUTH_TOKEN",
    "FPKG_DATABASE_URL",
  ] as const) {
    if (env[key]?.trim()) {
      throw new Error(`Phase 581 refuses inherited remote database selection: ${key}.`);
    }
  }
}

async function assertOwnedAuthority(
  client: Client,
  options: ApplyPhase581Options,
): Promise<void> {
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
    throw new Error("Phase 581 requires an owned, non-symlink catalog copy.");
  }
  const owned = fs.statSync(database, { bigint: true });
  const protectedStat = fs.statSync(protectedPath, { bigint: true });
  if (
    database === protectedPath ||
    (owned.dev === protectedStat.dev && owned.ino === protectedStat.ino)
  ) {
    throw new Error("Phase 581 refuses the protected catalog and hard-link aliases.");
  }
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) {
    throw new Error("Phase 581 client is not bound to the authorized owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 AS ok FROM migrations WHERE name=? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) {
    throw new Error("Phase 581 owned copy must be migrated through 032.");
  }
}

async function assertIdentity(transaction: Transaction): Promise<void> {
  const rows = await transaction.execute({
    sql: "SELECT id,type,slug,name FROM entities WHERE id IN (?,?) OR slug IN (?,?) ORDER BY id",
    args: [
      PHASE581_TARGET_ID,
      PHASE581_DUPLICATE_ID,
      PHASE581_CANONICAL_SLUG,
      PHASE581_DUPLICATE_SLUG,
    ],
  });
  const byId = new Map(rows.rows.map((row) => [String(row.id), row]));
  const canonical = byId.get(PHASE581_TARGET_ID);
  if (
    !canonical ||
    String(canonical.type) !== "pen" ||
    String(canonical.slug) !== PHASE581_CANONICAL_SLUG
  ) {
    throw new Error("Phase 581 canonical Green Tamamushi identity is missing or drifted.");
  }
  const duplicate = byId.get(PHASE581_DUPLICATE_ID);
  if (
    !duplicate ||
    String(duplicate.type) !== "pen" ||
    String(duplicate.slug) !== PHASE581_DUPLICATE_SLUG
  ) {
    throw new Error("Phase 581 expected the old duplicate Green Tamamushi identity.");
  }
  const brand = await transaction.execute({
    sql: "SELECT type,slug,name FROM entities WHERE id=?",
    args: [PHASE581_WANCHER_BRAND_ID],
  });
  if (
    brand.rows.length !== 1 ||
    String(brand.rows[0]?.type) !== "brand" ||
    String(brand.rows[0]?.slug) !== "wancher"
  ) {
    throw new Error("Phase 581 Wancher brand identity is not the approved row.");
  }
}

async function installRedirect(
  transaction: Transaction,
  input: {
    id: string;
    batchId: string;
    actionId: string;
    sourcePath: string;
    targetPath: string;
  },
): Promise<void> {
  const existing = await transaction.execute({
    sql: "SELECT redirect_kind,target_path FROM entity_redirects WHERE source_path=?",
    args: [input.sourcePath],
  });
  if (existing.rows.length > 0) {
    if (
      existing.rows.length !== 1 ||
      String(existing.rows[0]?.redirect_kind) !== "permanent" ||
      String(existing.rows[0]?.target_path) !== input.targetPath
    ) {
      throw new Error(`Phase 581 conflicting redirect for ${input.sourcePath}.`);
    }
    return;
  }
  await transaction.execute({
    sql: `INSERT INTO entity_redirects(
            id,batch_id,action_id,source_path,target_path,redirect_kind,fallback_reason
          ) VALUES(?,?,?,?,?,'permanent',NULL)`,
    args: [input.id, input.batchId, input.actionId, input.sourcePath, input.targetPath],
  });
}

async function retireDuplicate(client: Client): Promise<ApplyPhase581Result["retiredDuplicate"]> {
  const sourcePath = `/pen/${PHASE581_DUPLICATE_SLUG}`;
  const targetPath = `/pen/${PHASE581_CANONICAL_SLUG}`;
  const transaction = await client.transaction("write");
  try {
    await assertIdentity(transaction);
    const batchId = stableId("taxonomy-batch", SOURCE_KEY);
    const actionId = stableId("taxonomy-action", SOURCE_KEY);
    const actionChecksum = digest(
      `${PHASE581_DUPLICATE_ID}\0${PHASE581_TARGET_ID}\0retire\0${sourcePath}\0${targetPath}`,
    );
    const existingPublication = await transaction.execute({
      sql: "SELECT status,blockers_json,review_notes FROM entity_publications WHERE entity_id=?",
      args: [PHASE581_DUPLICATE_ID],
    });
    if (existingPublication.rows.length !== 1) {
      throw new Error("Phase 581 duplicate publication row is missing.");
    }
    const alreadyRetired =
      String(existingPublication.rows[0]?.status) === "retired" &&
      String(existingPublication.rows[0]?.blockers_json) === RETIRED_BLOCKERS &&
      String(existingPublication.rows[0]?.review_notes) === RETIRED_NOTE;

    await transaction.execute({
      sql: `INSERT OR IGNORE INTO taxonomy_batches(id,source_key,source_checksum,status,note)
            VALUES(?,?,?,'applied',?)`,
      args: [
        batchId,
        SOURCE_KEY,
        digest(SOURCE_KEY),
        "Retire the duplicate Dream Pen route and preserve the Phase 543 exact product identity.",
      ],
    });
    await transaction.execute({
      sql: `INSERT OR IGNORE INTO taxonomy_actions(
              id,batch_id,source_row_key,action_kind,action_checksum,
              source_entity_id,target_entity_id,status,note
            ) VALUES(?,?,?,'retire',?,?,?,?,?)`,
      args: [
        actionId,
        batchId,
        PHASE581_DUPLICATE_ID,
        actionChecksum,
        PHASE581_DUPLICATE_ID,
        PHASE581_TARGET_ID,
        "applied",
        "Retire duplicate Green Tamamushi identity; do not migrate its payload because the Phase 543 entity carries the same official product id.",
      ],
    });
    await transaction.execute({
      sql: `INSERT OR IGNORE INTO entity_lineage(
              id,batch_id,action_id,source_entity_id,target_entity_id,lineage_kind,fallback_reason
            ) VALUES(?,?,?,?,?,'retire',?)`,
      args: [
        stableId("taxonomy-lineage", actionChecksum),
        batchId,
        actionId,
        PHASE581_DUPLICATE_ID,
        PHASE581_TARGET_ID,
        "Duplicate retired with permanent redirect; payload remains on the exact Phase 543 entity.",
      ],
    });
    await installRedirect(transaction, {
      id: stableId("taxonomy-redirect", actionChecksum),
      batchId,
      actionId,
      sourcePath,
      targetPath,
    });

    if (!alreadyRetired) {
      await transaction.execute({
        sql: `UPDATE entity_publications
              SET status='retired',blockers_json=?,approved_content_hash=NULL,
                  reviewed_content_revision=NULL,reviewed_contract_version=NULL,
                  reviewed_by=NULL,reviewed_at=NULL,published_at=NULL,
                  review_notes=?,updated_at=datetime('now')
              WHERE entity_id=?`,
        args: [RETIRED_BLOCKERS, RETIRED_NOTE, PHASE581_DUPLICATE_ID],
      });
    }
    await transaction.execute({
      sql: "DELETE FROM entity_links WHERE source_id=? AND link_type='made_by'",
      args: [PHASE581_DUPLICATE_ID],
    });
    await transaction.execute({
      sql: "DELETE FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
      args: [PHASE581_WANCHER_BRAND_ID, PHASE581_DUPLICATE_ID],
    });
    await transaction.commit();
    return {
      entityId: PHASE581_DUPLICATE_ID,
      sourcePath,
      targetPath,
      outcome: alreadyRetired ? "noop" : "retired",
    };
  } catch (error) {
    if (!transaction.closed) await transaction.rollback();
    throw error;
  }
}

async function refreshBrandIfNeeded(client: Client, reviewer: string): Promise<void> {
  const publication = await client.execute({
    sql: "SELECT status FROM entity_publications WHERE entity_id=?",
    args: [PHASE581_WANCHER_BRAND_ID],
  });
  if (String(publication.rows[0]?.status) === "published") return;
  const contentHash = await computePublicationContentHash(
    client,
    PHASE581_WANCHER_BRAND_ID,
  );
  for (const reviewKind of ["fact", "language", "media"] as const) {
    await recordEntityContentReview(client, {
      entityId: PHASE581_WANCHER_BRAND_ID,
      reviewKind,
      reviewer,
      status: "approved",
      notes: `Phase 581 ${reviewKind} review after retiring the duplicate Green Tamamushi route.`,
      contentHash,
    });
  }
  await publishEntity(client, {
    entityId: PHASE581_WANCHER_BRAND_ID,
    reviewer,
  });
}

async function applyDepthPack(
  client: Client,
  options: ApplyPhase581Options,
  pack: LoadedCuratedEntityPack,
): Promise<ApplyPhase22Result> {
  validatePack(options.workspaceRoot, pack);
  const current = await client.execute({
    sql: `SELECT entity.source,publication.status,readiness.blocker_count,
                 readiness.publishable,CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public
          FROM entities entity
          JOIN entity_publications publication ON publication.entity_id=entity.id
          LEFT JOIN public_entity_readiness readiness
            ON readiness.entity_id=entity.id AND readiness.contract_version=3
          LEFT JOIN public_entities public ON public.id=entity.id
          WHERE entity.id=?`,
    args: [pack.entityId],
  });
  const row = current.rows[0];
  if (
    row &&
    String(row.source ?? "") === pack.sourceMarker &&
    String(row.status) === "published" &&
    Number(row.blocker_count) === 0 &&
    Number(row.publishable) === 1 &&
    Number(row.is_public) === 1
  ) {
    return {
      entities: [
        {
          entityId: pack.entityId,
          outcome: "noop",
          contentHash: await computePublicationContentHash(client, pack.entityId),
        },
      ],
    };
  }
  const transaction = await client.transaction("write");
  try {
    const sourceItemIds = await upsertSources(transaction, uniqueSources([pack]));
    await insertPack(transaction, pack, sourceItemIds);
    await transaction.commit();
  } catch (error) {
    if (!transaction.closed) await transaction.rollback();
    throw error;
  }
  for (const reviewKind of ["fact", "language", "media"] as const) {
    await recordEntityContentReview(client, {
      entityId: pack.entityId,
      reviewKind,
      reviewer: options.reviewer,
      status: "approved",
      notes: `${pack.sourceMarker}; ${reviewKind} review of the deepened Green Tamamushi copy.`,
    });
  }
  const published = await publishEntity(client, {
    entityId: pack.entityId,
    reviewer: options.reviewer,
  });
  return {
    entities: [
      {
        entityId: pack.entityId,
        outcome: "published",
        contentHash: published.contentHash,
      },
    ],
  };
}

export async function applyPhase581WancherZoganMomijiGreenTamamushi(
  client: Client,
  options: ApplyPhase581Options,
): Promise<ApplyPhase581Result> {
  if (!options.reviewer.trim()) throw new Error("Phase 581 reviewer must not be empty.");
  await assertOwnedAuthority(client, options);
  const retiredDuplicate = await retireDuplicate(client);
  await refreshBrandIfNeeded(client, options.reviewer);
  const rawPack = phase581WancherZoganMomijiGreenTamamushiPacks[0];
  if (!rawPack) throw new Error("Phase 581 Green Tamamushi pack is missing.");
  const pack = loadCuratedEntityPack(
    fs.realpathSync.native(options.workspaceRoot),
    rawPack,
  );
  const content = await applyDepthPack(client, options, pack);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return { ...content, retiredDuplicate };
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
      "Usage: tsx scripts/apply-phase581-wancher-zogan-momiji-green-tamamushi-depth.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]",
    );
  }
  const resolvedDatabase = path.resolve(database);
  const resolvedProtected = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase581WancherZoganMomijiGreenTamamushi(
      client,
      {
        workspaceRoot: process.cwd(),
        reviewer: value("--reviewer") ?? PHASE581_REVIEWER,
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
      },
    );
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
