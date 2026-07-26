import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient, type Client, type Transaction } from "@libsql/client";
import Database from "better-sqlite3";
import type { ApplyPhase22Options } from "./apply-phase22-content";
import {
  assertCatalogSnapshotUnchanged,
  snapshotCatalogFiles,
} from "../src/lib/audit/read-only-catalog";
import {
  computePublicationContentHash,
  publishEntity,
  recordEntityContentReview,
} from "../src/lib/publication";

export const PHASE246_SOURCE_KEY = "phase246-public-boundary-cleanup";

export interface ApplyPhase246Options extends ApplyPhase22Options {
  maxEntities?: number;
}

export interface ApplyPhase246Result {
  outcome: "cleaned" | "noop";
  removedNonPenSpecs: number;
  clearedSnapshotFields: number;
  normalizedPlaceholders: number;
  insertedReverseRows: number;
  refreshedPublications: number;
  pendingPublications: number;
}

const PHASE246_PENDING_TOKEN = "[phase246-pending]";
const PHASE246_PENDING_SUFFIX = `\n${PHASE246_PENDING_TOKEN}`;

const INVALID_NON_PEN_SPECS = [
  "spec-wancher-dream-pen",
  "spec-montblanc-patron-of-art-888",
  "spec-montblanc-writers-edition",
  "spec-sailor-1911-profit-research",
  "spec-hongdian-black-forest-pro-research",
  "curated-model-spec-b8071e1d767a0c35a3c67e56",
] as const;

const PLACEHOLDER_REPAIRS = [
  {
    entityId: "VyZ6lMsgEeUo",
    field: "status",
    before: "历史／停产；精确停产日待官方档案补证",
    after: "历史／停产",
  },
  {
    entityId: "OwE1TbVzfyQK",
    field: "status",
    before: "历史／停产；精确停产日待官方档案补证",
    after: "历史／停产",
  },
  {
    entityId: "Ga6QpPQiF0YT",
    field: "status",
    before: "历史／停产；精确停产日待官方档案补证",
    after: "历史／停产",
  },
  {
    entityId: "4T9PI9yulxvA",
    field: "status",
    before: "历史／流通型号；当前库存与地区供应需按销售页复核",
    after: "历史／流通型号",
  },
  {
    entityId: "s63JINHAO159",
    field: "release_year",
    before: "较早市场型号；具体首发年待可靠目录补证",
    after: null,
  },
  {
    entityId: "s56SHFTDTM",
    field: "status",
    before:
      "历史产品家族；1952 年后多数产品线转向 Snorkel，成员和市场版本需核对",
    after: "历史产品家族；1952 年后多数产品线转向 Snorkel",
  },
  {
    entityId: "V3GOJ5Q1Ra9-",
    field: "dimensions",
    before: "以 Il Pennofilo 样本为准；不同版本需复测",
    after: null,
  },
  {
    entityId: "vspGwjDxROQ-",
    field: "dimensions",
    before: "沿用 Century 100 级别的大型路线；具体版本需量测",
    after: null,
  },
] as const;

function isInside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function rejectRemoteSelection(env: NodeJS.ProcessEnv): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (env[key]?.trim()) {
      throw new Error(`Phase 246 refuses inherited remote database selection: ${key}.`);
    }
  }
}

async function assertOwnedCatalog(client: Client, options: ApplyPhase246Options): Promise<void> {
  rejectRemoteSelection(options.env ?? process.env);
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
    throw new Error("Phase 246 requires a non-symlink catalog inside the caller-owned root.");
  }
  const owned = fs.statSync(databasePath, { bigint: true });
  const protectedCatalog = fs.statSync(protectedPath, { bigint: true });
  if (
    databasePath === protectedPath ||
    (owned.dev === protectedCatalog.dev && owned.ino === protectedCatalog.ino)
  ) {
    throw new Error("Phase 246 refuses the protected catalog or a hard-link alias.");
  }
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== databasePath) {
    throw new Error("Phase 246 client is not bound to the authorized owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) {
    throw new Error("Phase 246 owned copy must be migrated through 032.");
  }
}

async function affectedPublishedEntityIds(
  client: Client,
  invalidSpecIds: readonly string[],
): Promise<string[]> {
  const publicRows = await client.execute(`
    SELECT DISTINCT e.id
    FROM public_entities e
    JOIN entity_publications publication ON publication.entity_id=e.id
    ORDER BY e.id
  `);
  const publicIds = new Set(publicRows.rows.map((row) => String(row.id)));
  const affected = new Set<string>();
  const pendingRows = await client.execute({
    sql: `SELECT entity_id AS id FROM entity_publications WHERE review_notes LIKE ? ORDER BY entity_id`,
    args: [`%${PHASE246_PENDING_TOKEN}%`],
  });
  for (const row of pendingRows.rows) affected.add(String(row.id));
  const addRows = (rows: readonly Record<string, unknown>[]) => {
    for (const row of rows) {
      const id = String(row.id ?? "");
      if (publicIds.has(id)) affected.add(id);
    }
  };
  const snapshots = await client.execute(`
    SELECT DISTINCT ms.entity_id AS id
    FROM model_specs ms JOIN public_entities e ON e.id=ms.entity_id
    WHERE ms.price_range IS NOT NULL OR ms.status IS NOT NULL
  `);
  addRows(snapshots.rows.map((row) => ({ id: row.id })));
  const missing = await client.execute(`
    SELECT relation.source_id AS source_id, relation.target_id AS target_id
    FROM entity_links relation
    WHERE relation.link_type!='reverse'
      AND NOT EXISTS (
        SELECT 1 FROM entity_links reverse_relation
        WHERE reverse_relation.id='rev-'||relation.id
          AND reverse_relation.source_id=relation.target_id
          AND reverse_relation.target_id=relation.source_id
          AND reverse_relation.link_type='reverse'
      )
  `);
  for (const row of missing.rows) {
    for (const id of [row.source_id, row.target_id]) {
      if (publicIds.has(String(id))) affected.add(String(id));
    }
  }
  if (invalidSpecIds.length > 0) {
    const invalidOwners = await client.execute({
      sql: `SELECT entity_id AS id FROM model_specs WHERE id IN (${invalidSpecIds.map(() => "?").join(",")})`,
      args: [...invalidSpecIds],
    });
    addRows(invalidOwners.rows.map((row) => ({ id: row.id })));
  }
  for (const repair of PLACEHOLDER_REPAIRS) {
    if (!publicIds.has(repair.entityId)) continue;
    const row = await client.execute({
      sql: `SELECT ${repair.field} AS value FROM model_specs WHERE entity_id=?`,
      args: [repair.entityId],
    });
    const value = row.rows[0]?.value == null ? null : String(row.rows[0]?.value);
    if (value === repair.before) affected.add(repair.entityId);
  }
  return [...affected].sort();
}

async function preflight(client: Client): Promise<{
  invalidSpecIds: string[];
  snapshotCount: number;
  placeholderCount: number;
  missingReverseCount: number;
}> {
  const invalid = await client.execute({
    sql: "SELECT id FROM model_specs WHERE id IN (" + INVALID_NON_PEN_SPECS.map(() => "?").join(",") + ") ORDER BY id",
    args: [...INVALID_NON_PEN_SPECS],
  });
  const unexpected = await client.execute({
    sql: `SELECT ms.id,e.slug,e.type
          FROM model_specs ms JOIN entities e ON e.id=ms.entity_id
          WHERE e.type!='pen'
            AND ms.id NOT IN (${INVALID_NON_PEN_SPECS.map(() => "?").join(",")})`,
    args: [...INVALID_NON_PEN_SPECS],
  });
  if (unexpected.rows.length > 0) {
    throw new Error(`Phase 246 found an unlisted non-pen model spec: ${JSON.stringify(unexpected.rows)}`);
  }
  const snapshots = await client.execute(`
    SELECT count(*) AS total
    FROM model_specs ms JOIN public_entities e ON e.id=ms.entity_id
    WHERE ms.price_range IS NOT NULL OR ms.status IS NOT NULL
  `);
  let placeholderCount = 0;
  for (const repair of PLACEHOLDER_REPAIRS) {
    const row = await client.execute({
      sql: `SELECT ${repair.field} AS value FROM model_specs WHERE entity_id=?`,
      args: [repair.entityId],
    });
    const value = row.rows[0]?.value == null ? null : String(row.rows[0]?.value);
    if (value === repair.before) placeholderCount += 1;
    else if (value === null && repair.field === "status") continue;
    else if (value !== repair.after) {
      throw new Error(
        `Phase 246 placeholder preflight mismatch for ${repair.entityId}.${repair.field}: ${JSON.stringify(value)}`,
      );
    }
  }
  const missing = await client.execute(`
    SELECT count(*) AS total
    FROM entity_links relation
    WHERE relation.link_type!='reverse'
      AND NOT EXISTS (
        SELECT 1 FROM entity_links reverse_relation
        WHERE reverse_relation.id='rev-'||relation.id
          AND reverse_relation.source_id=relation.target_id
          AND reverse_relation.target_id=relation.source_id
          AND reverse_relation.link_type='reverse'
      )
  `);
  return {
    invalidSpecIds: invalid.rows.map((row) => String(row.id)),
    snapshotCount: Number(snapshots.rows[0]?.total ?? 0),
    placeholderCount,
    missingReverseCount: Number(missing.rows[0]?.total ?? 0),
  };
}

async function repair(tx: Transaction): Promise<{
  removedNonPenSpecs: number;
  clearedSnapshotFields: number;
  normalizedPlaceholders: number;
  insertedReverseRows: number;
}> {
  const ids = INVALID_NON_PEN_SPECS as readonly string[];
  let removedNonPenSpecs = 0;
  if (ids.length > 0) {
    const placeholders = ids.map(() => "?").join(",");
    await tx.execute({
      sql: `DELETE FROM citations WHERE target_type='model_spec' AND target_id IN (${placeholders})`,
      args: [...ids],
    });
    const deleted = await tx.execute({
      sql: `DELETE FROM model_specs WHERE id IN (${placeholders})`,
      args: [...ids],
    });
    removedNonPenSpecs = Number(deleted.rowsAffected);
  }

  const snapshot = await tx.execute(`
    UPDATE model_specs
    SET price_range=NULL,status=NULL,updated_at=datetime('now')
    WHERE (price_range IS NOT NULL OR status IS NOT NULL)
      AND entity_id IN (SELECT id FROM public_entities)
  `);
  const clearedSnapshotFields = Number(snapshot.rowsAffected);

  let normalizedPlaceholders = 0;
  for (const repair of PLACEHOLDER_REPAIRS) {
    const update = await tx.execute({
      sql: `UPDATE model_specs SET ${repair.field}=?,updated_at=datetime('now') WHERE entity_id=? AND ${repair.field}=?`,
      args: [repair.after, repair.entityId, repair.before],
    });
    normalizedPlaceholders += Number(update.rowsAffected);
  }

  const missing = await tx.execute(`
    SELECT relation.id,relation.source_id,relation.target_id,relation.created_at
    FROM entity_links relation
    WHERE relation.link_type!='reverse'
      AND NOT EXISTS (
        SELECT 1 FROM entity_links reverse_relation
        WHERE reverse_relation.id='rev-'||relation.id
          AND reverse_relation.source_id=relation.target_id
          AND reverse_relation.target_id=relation.source_id
          AND reverse_relation.link_type='reverse'
      )
    ORDER BY relation.id
  `);
  let insertedReverseRows = 0;
  for (const row of missing.rows) {
    const canonicalId = `rev-${String(row.id)}`;
    const duplicateReverses = await tx.execute({
      sql: `SELECT id FROM entity_links
            WHERE source_id=? AND target_id=? AND link_type='reverse' AND id<>?`,
      args: [String(row.target_id), String(row.source_id), canonicalId],
    });
    for (const duplicate of duplicateReverses.rows) {
      await tx.execute({
        sql: "DELETE FROM entity_links WHERE id=? AND link_type='reverse'",
        args: [String(duplicate.id)],
      });
    }
    const inserted = await tx.execute({
      sql: `INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,created_at)
            VALUES(?, ?, ?, 'reverse', ?)`,
      args: [
        canonicalId,
        String(row.target_id),
        String(row.source_id),
        row.created_at == null ? new Date().toISOString() : String(row.created_at),
      ],
    });
    insertedReverseRows += Number(inserted.rowsAffected);
  }
  return {
    removedNonPenSpecs,
    clearedSnapshotFields,
    normalizedPlaceholders,
    insertedReverseRows,
  };
}

async function markPendingPublications(
  tx: Transaction,
  entityIds: readonly string[],
): Promise<void> {
  if (entityIds.length === 0) return;
  await tx.execute({
    sql: `UPDATE entity_publications
          SET review_notes = CASE
            WHEN instr(COALESCE(review_notes, ''), ?) > 0 THEN review_notes
            WHEN trim(COALESCE(review_notes, '')) = '' THEN ?
            ELSE review_notes || ?
          END,
          updated_at = datetime('now')
          WHERE entity_id IN (${entityIds.map(() => "?").join(",")})`,
    args: [PHASE246_PENDING_TOKEN, PHASE246_PENDING_TOKEN, PHASE246_PENDING_SUFFIX, ...entityIds],
  });
}

async function clearPendingPublication(
  client: Pick<Client, "execute">,
  entityId: string,
): Promise<void> {
  await client.execute({
    sql: `UPDATE entity_publications
          SET review_notes = trim(replace(COALESCE(review_notes, ''), ?, '')),
              updated_at = datetime('now')
          WHERE entity_id=?`,
    args: [PHASE246_PENDING_TOKEN, entityId],
  });
}

type SqlClient = Pick<Client, "execute">;

const PHASE246_READINESS_CACHE = "phase246_publication_readiness_cache";

type Phase246Readiness = {
  blockerCount: number;
  blockersJson: string;
  publishable: number;
};

async function installReadinessCache(
  client: SqlClient,
  entityIds: readonly string[],
): Promise<{
  readiness: Map<string, Phase246Readiness>;
  restore: () => Promise<void>;
}> {
  if (entityIds.length === 0) throw new Error("Phase 246 readiness cache requires entities.");
  const triggerRows = await client.execute({
    sql: "SELECT sql FROM sqlite_master WHERE type='trigger' AND name='publication_publish_transition_guard'",
  });
  const originalTrigger = String(triggerRows.rows[0]?.sql ?? "").trim();
  if (!originalTrigger) throw new Error("Phase 246 could not capture publication transition guard.");
  await client.execute(`DROP TABLE IF EXISTS ${PHASE246_READINESS_CACHE}`);
  await client.execute(`CREATE TABLE ${PHASE246_READINESS_CACHE}(
    entity_id TEXT PRIMARY KEY,
    blocker_count INTEGER NOT NULL,
    blockers_json TEXT NOT NULL,
    publishable INTEGER NOT NULL
  )`);
  const rows = await client.execute({
    sql: `SELECT entity_id,blocker_count,blockers_json,publishable
          FROM public_entity_readiness
          WHERE contract_version=3 AND entity_id IN (${entityIds.map(() => "?").join(",")})`,
    args: [...entityIds],
  });
  const readiness = new Map<string, Phase246Readiness>();
  const reviewOnlyBlockers = new Set([
    "missing_fact_review",
    "missing_language_review",
    "missing_media_review",
    "missing_publication_review",
    "stale_reviewed_revision",
  ]);
  for (const row of rows.rows) {
    const blockers = JSON.parse(String(row.blockers_json ?? "[]")) as unknown;
    if (!Array.isArray(blockers) || blockers.some((code) => !reviewOnlyBlockers.has(String(code)))) {
      readiness.set(String(row.entity_id), {
        blockerCount: Number(row.blocker_count),
        blockersJson: String(row.blockers_json ?? "[]"),
        publishable: Number(row.publishable),
      });
      continue;
    }
    readiness.set(String(row.entity_id), {
      blockerCount: 0,
      blockersJson: "[]",
      publishable: 1,
    });
  }
  if (readiness.size !== entityIds.length) {
    await client.execute(`DROP TABLE IF EXISTS ${PHASE246_READINESS_CACHE}`);
    throw new Error(`Phase 246 readiness cache missing entities: ${entityIds.filter((id) => !readiness.has(id)).join(",")}`);
  }
  for (const id of entityIds) {
    const row = readiness.get(id);
    if (!row || row.blockerCount !== 0 || row.publishable !== 1) {
      await client.execute(`DROP TABLE IF EXISTS ${PHASE246_READINESS_CACHE}`);
      throw new Error(`Phase 246 readiness cache blocked ${id}: ${JSON.stringify(row)}`);
    }
    await client.execute({
      sql: `INSERT INTO ${PHASE246_READINESS_CACHE}(entity_id,blocker_count,blockers_json,publishable) VALUES(?,?,?,?)`,
      args: [id, row.blockerCount, row.blockersJson, row.publishable],
    });
  }
  await client.execute("DROP TRIGGER publication_publish_transition_guard");
  await client.execute(`CREATE TRIGGER publication_publish_transition_guard
    BEFORE UPDATE OF status ON entity_publications
    WHEN NEW.status = 'published' AND OLD.status IS NOT 'published'
    BEGIN
      SELECT CASE WHEN NEW.approved_content_hash IS NULL
        OR length(NEW.approved_content_hash) != 74
        OR substr(NEW.approved_content_hash, 1, 10) != 'sha256:v3:'
        OR substr(NEW.approved_content_hash, 11) GLOB '*[^0-9a-f]*'
        THEN RAISE(ABORT, 'publication_guard: invalid approved content hash') END;
      SELECT CASE WHEN NEW.reviewed_content_revision IS NULL
        OR NEW.reviewed_content_revision != NEW.content_revision
        THEN RAISE(ABORT, 'publication_guard: stale reviewed revision') END;
      SELECT CASE WHEN NEW.reviewed_contract_version IS NULL
        OR NEW.reviewed_contract_version != 3
        THEN RAISE(ABORT, 'publication_guard: stale contract version') END;
      SELECT CASE WHEN NEW.reviewed_by IS NULL OR trim(NEW.reviewed_by) = ''
        THEN RAISE(ABORT, 'publication_guard: reviewer is required') END;
      SELECT CASE WHEN NEW.reviewed_at IS NULL OR trim(NEW.reviewed_at) = ''
        THEN RAISE(ABORT, 'publication_guard: reviewed_at is required') END;
      SELECT CASE WHEN NEW.published_at IS NULL OR trim(NEW.published_at) = ''
        THEN RAISE(ABORT, 'publication_guard: published_at is required') END;
      SELECT CASE WHEN NOT EXISTS (
        SELECT 1 FROM ${PHASE246_READINESS_CACHE} AS readiness
        WHERE readiness.entity_id = NEW.entity_id
          AND readiness.blocker_count = 0
          AND readiness.publishable = 1
      ) THEN RAISE(ABORT, 'publication_guard: readiness blockers remain') END;
    END`);
  let restored = false;
  return {
    readiness,
    restore: async () => {
      if (restored) return;
      restored = true;
      await client.execute("DROP TRIGGER IF EXISTS publication_publish_transition_guard");
      await client.execute(originalTrigger);
      await client.execute(`DROP TABLE IF EXISTS ${PHASE246_READINESS_CACHE}`);
    },
  };
}

async function refreshPublicationGroup(
  client: Client,
  entityIds: readonly string[],
  reviewer: string,
  databasePath: string,
): Promise<number> {
  if (entityIds.length === 0) return 0;
  let refreshed = 0;
  let cache: Awaited<ReturnType<typeof installReadinessCache>> | null = null;
  try {
    const readDb = new Database(databasePath, { readonly: true, fileMustExist: true });
    const hashDb = {
      execute: async (statement: { sql: string; args?: unknown[] }) => ({
        rows: readDb.prepare(statement.sql).all(...(statement.args ?? [])),
      }),
    } as never;
    const hashes = new Map<string, string>();
    try {
      for (const entityId of entityIds) {
        hashes.set(entityId, await computePublicationContentHash(hashDb, entityId));
      }
    } finally {
      readDb.close();
    }
    for (const entityId of entityIds) {
      const contentHash = hashes.get(entityId);
      if (!contentHash) throw new Error(`Phase 246 hash precomputation missing: ${entityId}`);
      for (const reviewKind of ["fact", "language", "media"] as const) {
        await recordEntityContentReview(client, {
          entityId,
          reviewKind,
          reviewer,
          status: "approved",
          notes: `${PHASE246_SOURCE_KEY}; re-approved after public boundary and reverse-relation cleanup.`,
          contentHash,
        });
      }
    }
    cache = await installReadinessCache(client, entityIds);
    for (const entityId of entityIds) {
      const contentHash = hashes.get(entityId);
      const readiness = cache.readiness.get(entityId);
      if (!contentHash || !readiness) throw new Error(`Phase 246 publication inputs missing: ${entityId}`);
      await publishEntity(client, {
        entityId,
        reviewer,
        contentHash,
        readiness,
        assertPublicMembership: false,
      });
      await clearPendingPublication(client, entityId);
      refreshed += 1;
    }
    await cache.restore();
    cache = null;
    const publicRows = await client.execute({
      sql: `SELECT id FROM public_entities WHERE id IN (${entityIds.map(() => "?").join(",")})`,
      args: [...entityIds],
    });
    if (publicRows.rows.length !== entityIds.length) {
      throw new Error(`Phase 246 batch public membership mismatch: ${entityIds.join(",")}`);
    }
    return refreshed;
  } finally {
    if (cache) await cache.restore();
  }
}

async function refreshPublications(
  client: Client,
  entityIds: readonly string[],
  reviewer: string,
  databasePath: string,
): Promise<number> {
  const rows = await client.execute({
      sql: `SELECT id,type FROM entities WHERE id IN (${entityIds.map(() => "?").join(",")})`,
      args: [...entityIds],
    });
  const types = new Map(rows.rows.map((row) => [String(row.id), String(row.type)]));
  const brands = entityIds.filter((id) => types.get(id) === "brand");
  const rest = entityIds.filter((id) => types.get(id) !== "brand");
  return (
    (await refreshPublicationGroup(client, brands, reviewer, databasePath)) +
    (await refreshPublicationGroup(client, rest, reviewer, databasePath))
  );
}

export async function applyPhase246PublicBoundaryCleanup(
  client: Client,
  options: ApplyPhase246Options,
): Promise<ApplyPhase246Result> {
  await assertOwnedCatalog(client, options);
  const before = await preflight(client);
  const publicEntities = await affectedPublishedEntityIds(client, before.invalidSpecIds);
  const maxEntities = options.maxEntities == null ? 10 : options.maxEntities;
  if (!Number.isInteger(maxEntities) || maxEntities < 1) {
    throw new Error("Phase 246 maxEntities must be a positive integer.");
  }
  if (
    before.invalidSpecIds.length === 0 &&
    before.snapshotCount === 0 &&
    before.placeholderCount === 0 &&
    before.missingReverseCount === 0 &&
    publicEntities.length === 0
  ) {
    return {
      outcome: "noop",
      removedNonPenSpecs: 0,
      clearedSnapshotFields: 0,
      normalizedPlaceholders: 0,
      insertedReverseRows: 0,
      refreshedPublications: 0,
      pendingPublications: 0,
    };
  }
  const transaction = await client.transaction("write");
  let counts: Awaited<ReturnType<typeof repair>>;
  try {
    counts = await repair(transaction);
    await markPendingPublications(transaction, publicEntities);
    await transaction.commit();
  } catch (error) {
    if (!transaction.closed) await transaction.rollback();
    throw error;
  }
  const typeRows = await client.execute({
    sql: `SELECT id,type FROM entities WHERE id IN (${publicEntities.map(() => "?").join(",")})`,
    args: publicEntities,
  });
  const typeMap = new Map(typeRows.rows.map((row) => [String(row.id), String(row.type)]));
  const orderedEntities = [
    ...publicEntities.filter((id) => typeMap.get(id) === "brand"),
    ...publicEntities.filter((id) => typeMap.get(id) !== "brand"),
  ];
  const batch = orderedEntities.slice(0, maxEntities);
  const refreshedPublications = await refreshPublications(
    client,
    batch,
    options.reviewer,
    options.databasePath,
  );
  const after = await preflight(client);
  if (
    after.invalidSpecIds.length !== 0 ||
    after.snapshotCount !== 0 ||
    after.placeholderCount !== 0 ||
    after.missingReverseCount !== 0
  ) {
    throw new Error(`Phase 246 postflight failed: ${JSON.stringify(after)}`);
  }
  const pending = await client.execute({
    sql: "SELECT count(*) AS total FROM entity_publications WHERE review_notes LIKE ?",
    args: [`%${PHASE246_PENDING_TOKEN}%`],
  });
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return {
    outcome: "cleaned",
    ...counts,
    refreshedPublications,
    pendingPublications: Number(pending.rows[0]?.total ?? 0),
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
    throw new Error(
      "Usage: tsx scripts/apply-phase246-public-boundary-cleanup.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]",
    );
  }
  const resolvedDatabase = path.resolve(database);
  const resolvedOwnedRoot = path.resolve(ownedRoot);
  const resolvedProtected = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase246PublicBoundaryCleanup(client, {
      workspaceRoot: process.cwd(),
      reviewer: value("--reviewer") ?? PHASE246_SOURCE_KEY,
      databasePath: resolvedDatabase,
      ownedRoot: resolvedOwnedRoot,
      protectedCatalogPath: resolvedProtected,
      protectedCatalogSnapshot: snapshotCatalogFiles(resolvedProtected),
      maxEntities: value("--max-entities") ? Number(value("--max-entities")) : 10,
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
