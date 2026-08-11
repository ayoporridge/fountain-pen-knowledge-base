import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient, type Client, type Transaction } from "@libsql/client";
import Database from "better-sqlite3";
import type { CatalogSnapshot } from "../src/lib/audit/audit-contracts";
import {
  assertCatalogSnapshotUnchanged,
  snapshotCatalogFiles,
} from "../src/lib/audit/read-only-catalog";
import {
  computePublicationContentHash,
  publishEntity,
  recordEntityContentReview,
} from "../src/lib/publication";
import { stripRawModelSpecsSections } from "./apply-phase583-public-story-residue-cleanup";

export const PHASE585_REVIEWER = "phase585-public-entity-body-residue-cleanup";

export interface ApplyPhase585Options {
  workspaceRoot: string;
  reviewer: string;
  databasePath: string;
  ownedRoot: string;
  protectedCatalogPath: string;
  protectedCatalogSnapshot: CatalogSnapshot;
  env?: NodeJS.ProcessEnv;
}

export interface ApplyPhase585Result {
  affected: {
    entities: number;
    pens: number;
    brands: number;
    removedBlocks: number;
    retiredResiduePreserved: number;
  };
  entities: Array<{
    entityId: string;
    slug: string;
    type: "brand" | "pen";
    outcome: "published";
    contentHash: string;
  }>;
}

interface EntityTarget {
  entityId: string;
  slug: string;
  type: "brand" | "pen";
  bodyMd: string;
  cleanedBodyMd: string;
  removedBlocks: number;
  structuredSpecCount: number;
  storyId: string;
  storyBodyMd: string;
}

interface CatalogBaseline {
  publishedCount: number;
  publicCount: number;
  retiredResidueCount: number;
}

function inside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return (
    relative !== "" &&
    !relative.startsWith("..") &&
    !path.isAbsolute(relative)
  );
}

function rejectRemote(env: NodeJS.ProcessEnv): void {
  for (const key of [
    "TURSO_DATABASE_URL",
    "TURSO_AUTH_TOKEN",
    "FPKG_DATABASE_URL",
  ] as const) {
    if (env[key]?.trim()) {
      throw new Error(
        `Phase 585 refuses inherited remote database selection: ${key}.`,
      );
    }
  }
}

async function rows(
  database: Client | Transaction,
  sql: string,
  args: unknown[] = [],
): Promise<Array<Record<string, unknown>>> {
  const result = await database.execute({ sql, args: args as never[] });
  return result.rows.map((row) => ({ ...row }));
}

async function assertOwnedAuthority(
  client: Client,
  options: ApplyPhase585Options,
): Promise<void> {
  rejectRemote(options.env ?? process.env);
  if (!options.reviewer.trim()) {
    throw new Error("Phase 585 reviewer must not be empty.");
  }
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
    throw new Error("Phase 585 requires an owned, non-symlink catalog copy.");
  }
  const owned = fs.statSync(database, { bigint: true });
  const protectedCatalog = fs.statSync(protectedPath, { bigint: true });
  if (owned.nlink !== BigInt(1)) {
    throw new Error("Phase 585 refuses catalog files with multiple hard links.");
  }
  if (
    database === protectedPath ||
    (owned.dev === protectedCatalog.dev && owned.ino === protectedCatalog.ino)
  ) {
    throw new Error("Phase 585 refuses the protected catalog and hard-link aliases.");
  }

  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) {
    throw new Error("Phase 585 client is not bound to the authorized owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 AS ok FROM migrations WHERE name=? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) {
    throw new Error("Phase 585 owned copy must be migrated through 032.");
  }
}

async function loadBaseline(client: Client): Promise<CatalogBaseline> {
  const result = (
    await rows(
      client,
      `SELECT
         (SELECT count(*) FROM entity_publications
          WHERE status='published') AS published_count,
         (SELECT count(*) FROM public_entities) AS public_count,
         (SELECT count(*) FROM entities entity
          JOIN entity_publications publication ON publication.entity_id=entity.id
          WHERE publication.status='retired'
            AND entity.body_md LIKE '%## model_specs%') AS retired_residue_count`,
    )
  )[0];
  if (!result) throw new Error("Phase 585 could not read the catalog baseline.");
  return {
    publishedCount: Number(result.published_count),
    publicCount: Number(result.public_count),
    retiredResidueCount: Number(result.retired_residue_count),
  };
}

async function loadTargets(client: Client): Promise<EntityTarget[]> {
  const candidateCount = Number(
    (
      await rows(
        client,
        `SELECT count(*) AS n FROM entities entity
         JOIN entity_publications publication ON publication.entity_id=entity.id
         WHERE publication.status='published'
           AND entity.type IN ('brand','pen')
           AND entity.body_md LIKE '%## model_specs%'`,
      )
    )[0]?.n,
  );
  const result = await rows(
    client,
    `SELECT entity.id AS entity_id,entity.slug,entity.type,entity.body_md,
            story.id AS story_id,story.body_md AS story_body_md,
            (SELECT count(*) FROM model_specs spec WHERE spec.entity_id=entity.id)
              AS structured_spec_count
     FROM entities entity
     JOIN entity_publications publication ON publication.entity_id=entity.id
     JOIN stories story ON story.entity_id=entity.id AND story.status='published'
     WHERE publication.status='published'
       AND entity.type IN ('brand','pen')
       AND entity.body_md LIKE '%## model_specs%'
     ORDER BY entity.type,entity.slug,story.id`,
  );

  const seen = new Set<string>();
  const targets = result.map((row) => {
    const entityId = String(row.entity_id);
    if (seen.has(entityId)) {
      throw new Error(`Phase 585 found multiple published stories for ${entityId}.`);
    }
    seen.add(entityId);
    const rawType = String(row.type);
    if (rawType !== "brand" && rawType !== "pen") {
      throw new Error(`Phase 585 unsupported entity type: ${rawType}.`);
    }
    const type: "brand" | "pen" = rawType;
    const structuredSpecCount = Number(row.structured_spec_count);
    if (
      (type === "pen" && structuredSpecCount !== 1) ||
      (type === "brand" && structuredSpecCount !== 0)
    ) {
      throw new Error(
        `Phase 585 structured spec boundary mismatch for ${String(row.slug)}.`,
      );
    }
    const bodyMd = String(row.body_md);
    const cleaned = stripRawModelSpecsSections(bodyMd);
    const minimumLength = type === "brand" ? 2_000 : 1_400;
    if (
      cleaned.removedBlocks < 1 ||
      Array.from(cleaned.bodyMd).length < minimumLength ||
      /^## model_specs[ \t]*$/m.test(cleaned.bodyMd)
    ) {
      throw new Error(`Phase 585 unsafe cleaned body for ${String(row.slug)}.`);
    }
    return {
      entityId,
      slug: String(row.slug),
      type,
      bodyMd,
      cleanedBodyMd: cleaned.bodyMd,
      removedBlocks: cleaned.removedBlocks,
      structuredSpecCount,
      storyId: String(row.story_id),
      storyBodyMd: String(row.story_body_md),
    };
  });
  if (targets.length !== candidateCount) {
    throw new Error(
      `Phase 585 target/story cardinality mismatch: ${targets.length}/${candidateCount}.`,
    );
  }
  return targets;
}

async function cleanEntityBodies(
  client: Client,
  targets: EntityTarget[],
): Promise<void> {
  const transaction = await client.transaction("write");
  try {
    for (const target of targets) {
      const update = await transaction.execute({
        sql: `UPDATE entities
              SET body_md=?,updated_at=datetime('now')
              WHERE id=? AND type=? AND slug=? AND body_md=?`,
        args: [
          target.cleanedBodyMd,
          target.entityId,
          target.type,
          target.slug,
          target.bodyMd,
        ],
      });
      if (update.rowsAffected !== 1) {
        throw new Error(`Phase 585 entity changed concurrently: ${target.slug}.`);
      }
    }
    await transaction.commit();
  } catch (error) {
    if (!transaction.closed) await transaction.rollback();
    throw error;
  }
}

async function reviewAndPublish(
  client: Client,
  options: ApplyPhase585Options,
  targets: EntityTarget[],
): Promise<ApplyPhase585Result["entities"]> {
  const readDb = new Database(options.databasePath, {
    readonly: true,
    fileMustExist: true,
  });
  const hashDb = {
    execute: async (statement: { sql: string; args?: unknown[] }) => ({
      rows: readDb.prepare(statement.sql).all(...(statement.args ?? [])),
    }),
  } as never;
  const hashes = new Map<string, string>();
  try {
    for (const target of targets) {
      hashes.set(
        target.entityId,
        await computePublicationContentHash(hashDb, target.entityId),
      );
    }
  } finally {
    readDb.close();
  }

  const published: ApplyPhase585Result["entities"] = [];
  for (const target of targets) {
    const contentHash = hashes.get(target.entityId);
    if (!contentHash?.startsWith("sha256:v3:")) {
      throw new Error(`Phase 585 content hash precomputation failed: ${target.slug}.`);
    }
    for (const reviewKind of ["fact", "language", "media"] as const) {
      await recordEntityContentReview(client, {
        entityId: target.entityId,
        reviewKind,
        reviewer: options.reviewer,
        status: "approved",
        contentHash,
        notes: `Phase 585 ${reviewKind} review after removing the redundant entity-body model_specs JSON section; structured specs and published story are unchanged.`,
      });
    }
    const result = await publishEntity(client, {
      entityId: target.entityId,
      reviewer: options.reviewer,
      contentHash,
    });
    published.push({
      entityId: target.entityId,
      slug: target.slug,
      type: target.type,
      outcome: "published",
      contentHash: result.contentHash,
    });
  }
  return published;
}

async function verifyResult(
  client: Client,
  baseline: CatalogBaseline,
  targets: EntityTarget[],
): Promise<void> {
  const global = (
    await rows(
      client,
      `SELECT
         (SELECT count(*) FROM entity_publications
          WHERE status='published') AS published_count,
         (SELECT count(*) FROM public_entities) AS public_count,
         (SELECT count(*) FROM entities entity
          JOIN entity_publications publication ON publication.entity_id=entity.id
          WHERE publication.status='retired'
            AND entity.body_md LIKE '%## model_specs%') AS retired_residue_count,
         (SELECT count(*) FROM public_entity_readiness readiness
          JOIN entity_publications publication ON publication.entity_id=readiness.entity_id
          WHERE publication.status='published' AND readiness.contract_version=3
            AND (readiness.blocker_count<>0 OR readiness.publishable<>1))
            AS published_blockers`,
    )
  )[0];
  if (
    !global ||
    Number(global.published_count) !== baseline.publishedCount ||
    Number(global.public_count) !== baseline.publicCount ||
    Number(global.retired_residue_count) !== baseline.retiredResidueCount ||
    Number(global.published_blockers) !== 0
  ) {
    throw new Error("Phase 585 changed the public catalog or retired lineage.");
  }

  const result = await rows(
    client,
    `SELECT entity.id,entity.body_md,publication.status,
            publication.approved_content_hash,publication.content_revision,
            publication.reviewed_content_revision,
            publication.reviewed_contract_version,
            readiness.blocker_count,readiness.publishable,
            CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public,
            story.id AS story_id,story.body_md AS story_body_md,
            (SELECT count(*) FROM model_specs spec WHERE spec.entity_id=entity.id)
              AS structured_spec_count
     FROM entities entity
     JOIN entity_publications publication ON publication.entity_id=entity.id
     JOIN stories story ON story.entity_id=entity.id AND story.status='published'
     LEFT JOIN public_entity_readiness readiness
       ON readiness.entity_id=entity.id AND readiness.contract_version=3
     LEFT JOIN public_entities public ON public.id=entity.id
     WHERE entity.id IN (${targets.map(() => "?").join(",")})`,
    targets.map((target) => target.entityId),
  );
  const resultById = new Map(result.map((row) => [String(row.id), row]));
  for (const target of targets) {
    const row = resultById.get(target.entityId);
    if (
      !row ||
      String(row.body_md) !== target.cleanedBodyMd ||
      /^## model_specs[ \t]*$/m.test(String(row.body_md)) ||
      String(row.status) !== "published" ||
      Number(row.content_revision) !== Number(row.reviewed_content_revision) ||
      Number(row.reviewed_contract_version) !== 3 ||
      Number(row.blocker_count) !== 0 ||
      Number(row.publishable) !== 1 ||
      Number(row.is_public) !== 1 ||
      String(row.story_id) !== target.storyId ||
      String(row.story_body_md) !== target.storyBodyMd ||
      Number(row.structured_spec_count) !== target.structuredSpecCount
    ) {
      throw new Error(`Phase 585 post-publication mismatch: ${target.slug}.`);
    }
    const reviews = await rows(
      client,
      `SELECT review_kind,status FROM entity_content_reviews
       WHERE entity_id=? AND content_hash=? ORDER BY review_kind`,
      [target.entityId, row.approved_content_hash],
    );
    if (
      reviews.length !== 4 ||
      reviews.some((review) => review.status !== "approved") ||
      reviews.map((review) => String(review.review_kind)).join(",") !==
        "fact,language,media,publication"
    ) {
      throw new Error(`Phase 585 current review set is incomplete: ${target.slug}.`);
    }
  }
}

export async function applyPhase585PublicEntityBodyResidueCleanup(
  client: Client,
  options: ApplyPhase585Options,
): Promise<ApplyPhase585Result> {
  await assertOwnedAuthority(client, options);
  const baseline = await loadBaseline(client);
  const targets = await loadTargets(client);
  if (targets.length === 0) {
    assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
    return {
      affected: {
        entities: 0,
        pens: 0,
        brands: 0,
        removedBlocks: 0,
        retiredResiduePreserved: baseline.retiredResidueCount,
      },
      entities: [],
    };
  }

  await cleanEntityBodies(client, targets);
  const entities = await reviewAndPublish(client, options, targets);
  await verifyResult(client, baseline, targets);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return {
    affected: {
      entities: targets.length,
      pens: targets.filter((target) => target.type === "pen").length,
      brands: targets.filter((target) => target.type === "brand").length,
      removedBlocks: targets.reduce(
        (total, target) => total + target.removedBlocks,
        0,
      ),
      retiredResiduePreserved: baseline.retiredResidueCount,
    },
    entities,
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
      "Usage: tsx scripts/apply-phase585-public-entity-body-residue-cleanup.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]",
    );
  }
  const databasePath = path.resolve(database);
  const protectedCatalogPath = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${databasePath}` });
  try {
    const result = await applyPhase585PublicEntityBodyResidueCleanup(client, {
      workspaceRoot: process.cwd(),
      reviewer: value("--reviewer") ?? PHASE585_REVIEWER,
      databasePath,
      ownedRoot: path.resolve(ownedRoot),
      protectedCatalogPath,
      protectedCatalogSnapshot: snapshotCatalogFiles(protectedCatalogPath),
      env: process.env,
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
