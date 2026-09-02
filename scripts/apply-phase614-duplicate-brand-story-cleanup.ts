import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient, type Client, type Transaction } from "@libsql/client";
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

export const PHASE614_REVIEWER = "phase614-duplicate-brand-story-cleanup";

export interface ApplyPhase614Options {
  workspaceRoot: string;
  reviewer: string;
  databasePath: string;
  ownedRoot: string;
  protectedCatalogPath: string;
  protectedCatalogSnapshot: CatalogSnapshot;
  env?: NodeJS.ProcessEnv;
}

export interface ApplyPhase614Result {
  affected: {
    entities: number;
    changed: number;
    noop: number;
  };
  entities: Array<{
    entityId: string;
    slug: string;
    outcome: "published" | "noop";
    contentHash: string;
  }>;
}

export interface Phase614BrandStoryTarget {
  entityId: string;
  expectedSlug: string;
  expectedName: string;
  modelEntityId: string;
  modelSlug: string;
  markdownFile: string;
  storyTitle: string;
}

export const PHASE614_BRAND_STORY_TARGETS: readonly Phase614BrandStoryTarget[] = [
  {
    entityId: "7ayTZUG4BVgU",
    expectedSlug: "ingersoll",
    expectedName: "Ingersoll",
    modelEntityId: "OwOqThACQI6M",
    modelSlug: "the-ingersoll-dollar-pen",
    markdownFile: ".planning/content-research/ingersoll-brand-story-phase614.md",
    storyTitle: "Ingersoll：从品牌证据到 Dollar Pen 家族",
  },
  {
    entityId: "ncUFilOHTET2",
    expectedSlug: "yiren",
    expectedName: "依人 Yiren",
    modelEntityId: "pJVODqR4jDGw",
    modelSlug: "依人-yiren-878",
    markdownFile: ".planning/content-research/yiren-brand-story-phase614.md",
    storyTitle: "依人 Yiren：品牌入口与 878 型号边界",
  },
  {
    entityId: "yTWZrIZnGyMx",
    expectedSlug: "yongxu",
    expectedName: "永续 (YongXu)",
    modelEntityId: "phase234-yongxu-286",
    modelSlug: "yongxu-286",
    markdownFile: ".planning/content-research/yongxu-brand-story-phase614.md",
    storyTitle: "YongXu：小批量品牌与 286 代表型号",
  },
] as const;

interface ReviewedCopy {
  summary: string;
  bodyMd: string;
}

interface TargetState extends ReviewedCopy {
  target: Phase614BrandStoryTarget;
  storyId: string;
  entityBodyMd: string;
  storyBodyMd: string;
  modelBodyMd: string;
  publicationStatus: string;
  approvedContentHash: string | null;
  relationFingerprint: string;
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
      throw new Error(
        `Phase 614 refuses inherited remote database selection: ${key}.`,
      );
    }
  }
}

async function assertOwnedAuthority(
  client: Client,
  options: ApplyPhase614Options,
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
    throw new Error("Phase 614 requires an owned, non-symlink catalog copy.");
  }
  const owned = fs.statSync(database, { bigint: true });
  const protectedStat = fs.statSync(protectedPath, { bigint: true });
  if (
    database === protectedPath ||
    (owned.dev === protectedStat.dev && owned.ino === protectedStat.ino)
  ) {
    throw new Error("Phase 614 refuses the protected catalog and hard-link aliases.");
  }

  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) {
    throw new Error("Phase 614 client is not bound to the authorized owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 AS ok FROM migrations WHERE name=? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) {
    throw new Error("Phase 614 owned copy must be migrated through 032.");
  }
}

function readReviewedCopy(workspaceRoot: string, relativeFile: string): ReviewedCopy {
  const file = path.resolve(workspaceRoot, relativeFile);
  const root = path.resolve(workspaceRoot);
  if (!inside(file, root)) {
    throw new Error(`Phase 614 reviewed copy escapes workspace: ${relativeFile}`);
  }
  const markdown = fs.readFileSync(file, "utf8").replace(/\r\n?/g, "\n");
  const summaryMatch = /^## summary\s*\n([\s\S]*?)(?=^## body_md\s*$)/m.exec(markdown);
  const bodyMatch = /^## body_md\s*\n([\s\S]*?)(?=^## 来源\s*$)/m.exec(markdown);
  if (!summaryMatch?.[1] || !bodyMatch?.[1]) {
    throw new Error(`Phase 614 reviewed copy is missing summary/body_md: ${relativeFile}`);
  }
  const summary = summaryMatch[1].trim();
  const bodyMd = bodyMatch[1].trim();
  const summaryLength = Array.from(summary).length;
  if (summaryLength < 60 || summaryLength > 160) {
    throw new Error(`Phase 614 summary must contain 60-160 Unicode characters: ${relativeFile}`);
  }
  if (Array.from(bodyMd).length < 1_200) {
    throw new Error(`Phase 614 brand story is shorter than 1,200 characters: ${relativeFile}`);
  }
  return { summary, bodyMd };
}

async function rows(
  db: Client | Transaction,
  sql: string,
  args: unknown[] = [],
): Promise<Array<Record<string, unknown>>> {
  return (await db.execute({ sql, args: args as never[] })).rows.map((row) => ({
    ...row,
  }));
}

async function relationFingerprint(
  client: Client,
  target: Phase614BrandStoryTarget,
): Promise<string> {
  const linkRows = await rows(
    client,
    `SELECT id,source_id,target_id,link_type,reason
       FROM entity_links
      WHERE source_id IN (?,?) OR target_id IN (?,?)
      ORDER BY id`,
    [target.entityId, target.modelEntityId, target.entityId, target.modelEntityId],
  );
  const referenceRows = await rows(
    client,
    `SELECT id,entity_id,source_item_id,relation_type,note,review_status
       FROM entity_references
      WHERE entity_id IN (?,?)
      ORDER BY id`,
    [target.entityId, target.modelEntityId],
  );
  return JSON.stringify({ links: linkRows, references: referenceRows });
}

async function loadTargetState(
  client: Client,
  workspaceRoot: string,
  target: Phase614BrandStoryTarget,
): Promise<TargetState> {
  const reviewed = readReviewedCopy(workspaceRoot, target.markdownFile);
  const entityRows = await rows(
    client,
    `SELECT id,type,slug,name,body_md,summary
       FROM entities
      WHERE id=?`,
    [target.entityId],
  );
  const entity = entityRows[0];
  if (
    !entity ||
    String(entity.type) !== "brand" ||
    String(entity.slug) !== target.expectedSlug ||
    String(entity.name) !== target.expectedName
  ) {
    throw new Error(`Phase 614 brand identity mismatch: ${target.expectedSlug}.`);
  }
  const modelRows = await rows(
    client,
    `SELECT id,type,slug,body_md
       FROM entities
      WHERE id=?`,
    [target.modelEntityId],
  );
  const model = modelRows[0];
  if (
    !model ||
    String(model.type) !== "pen" ||
    String(model.slug) !== target.modelSlug ||
    String(model.body_md).length < 1_000
  ) {
    throw new Error(`Phase 614 model identity mismatch: ${target.modelSlug}.`);
  }
  const storyRows = await rows(
    client,
    `SELECT id,title,summary,body_md,story_type,status
       FROM stories
      WHERE entity_id=? AND story_type='brand_story' AND status='published'`,
    [target.entityId],
  );
  if (storyRows.length !== 1) {
    throw new Error(`Phase 614 expected one published brand story: ${target.expectedSlug}.`);
  }
  const publicationRows = await rows(
    client,
    `SELECT status,approved_content_hash
       FROM entity_publications
      WHERE entity_id=?`,
    [target.entityId],
  );
  if (publicationRows.length !== 1) {
    throw new Error(`Phase 614 publication row missing: ${target.expectedSlug}.`);
  }
  const relation = await relationFingerprint(client, target);
  const madeBy = await rows(
    client,
    `SELECT 1 AS ok FROM entity_links
      WHERE source_id=? AND target_id=? AND link_type='made_by'`,
    [target.modelEntityId, target.entityId],
  );
  const reverse = await rows(
    client,
    `SELECT 1 AS ok FROM entity_links
      WHERE source_id=? AND target_id=? AND link_type='reverse'`,
    [target.entityId, target.modelEntityId],
  );
  if (madeBy.length !== 1 || reverse.length !== 1) {
    throw new Error(`Phase 614 maker/navigation relation mismatch: ${target.expectedSlug}.`);
  }
  return {
    target,
    ...reviewed,
    storyId: String(storyRows[0]?.id),
    entityBodyMd: String(entity.body_md),
    storyBodyMd: String(storyRows[0]?.body_md),
    modelBodyMd: String(model.body_md),
    publicationStatus: String(publicationRows[0]?.status),
    approvedContentHash: publicationRows[0]?.approved_content_hash
      ? String(publicationRows[0].approved_content_hash)
      : null,
    relationFingerprint: relation,
  };
}

function sourceMarker(target: Phase614BrandStoryTarget, copy: ReviewedCopy): string {
  const digest = createHash("sha256")
    .update(`${target.entityId}\0${copy.summary}\0${copy.bodyMd}\0${target.storyTitle}`)
    .digest("hex");
  return `curated-content:phase614-duplicate-brand-story-cleanup:${digest}`;
}

async function updateStories(
  client: Client,
  states: TargetState[],
): Promise<TargetState[]> {
  const changed = states.filter(
    (state) =>
      state.entityBodyMd !== state.bodyMd || state.storyBodyMd !== state.bodyMd,
  );
  if (changed.length === 0) return states;
  const transaction = await client.transaction("write");
  try {
    for (const state of changed) {
      if (state.entityBodyMd !== state.storyBodyMd) {
        throw new Error(`Phase 614 refuses split entity/story body: ${state.target.expectedSlug}.`);
      }
      if (state.entityBodyMd === state.modelBodyMd) {
        // This is the defect this phase is authorized to repair.
      } else if (state.entityBodyMd !== state.bodyMd) {
        throw new Error(`Phase 614 found an unexpected existing brand body: ${state.target.expectedSlug}.`);
      }
      const marker = sourceMarker(state.target, state);
      const entityUpdate = await transaction.execute({
        sql: `UPDATE entities
                 SET summary=?,body_md=?,source=?,updated_at=datetime('now')
               WHERE id=? AND type='brand' AND slug=? AND body_md=?`,
        args: [
          state.summary,
          state.bodyMd,
          marker,
          state.target.entityId,
          state.target.expectedSlug,
          state.entityBodyMd,
        ],
      });
      if (entityUpdate.rowsAffected !== 1) {
        throw new Error(`Phase 614 entity changed concurrently: ${state.target.expectedSlug}.`);
      }
      const storyUpdate = await transaction.execute({
        sql: `UPDATE stories
                 SET title=?,summary=?,body_md=?,source_notes=? ,updated_at=datetime('now')
               WHERE id=? AND entity_id=? AND story_type='brand_story'
                 AND status='published' AND body_md=?`,
        args: [
          state.target.storyTitle,
          state.summary,
          state.bodyMd,
          marker,
          state.storyId,
          state.target.entityId,
          state.storyBodyMd,
        ],
      });
      if (storyUpdate.rowsAffected !== 1) {
        throw new Error(`Phase 614 story changed concurrently: ${state.target.expectedSlug}.`);
      }
    }
    await transaction.commit();
  } catch (error) {
    if (!transaction.closed) await transaction.rollback();
    throw error;
  }
  return states;
}

async function reviewAndPublish(
  client: Client,
  options: ApplyPhase614Options,
  states: TargetState[],
): Promise<ApplyPhase614Result["entities"]> {
  const results: ApplyPhase614Result["entities"] = [];
  for (const state of states) {
    const contentHash = await computePublicationContentHash(
      client,
      state.target.entityId,
    );
    const currentPublication = await rows(
      client,
      `SELECT status,approved_content_hash FROM entity_publications WHERE entity_id=?`,
      [state.target.entityId],
    );
    const reviewRows = await rows(
      client,
      `SELECT review_kind FROM entity_content_reviews
        WHERE entity_id=? AND content_hash=? AND status='approved'
          AND review_kind IN ('fact','language','media')`,
      [state.target.entityId, contentHash],
    );
    const reviewedKinds = new Set(reviewRows.map((row) => String(row.review_kind)));
    const needsPublish =
      String(currentPublication[0]?.status) !== "published" ||
      String(currentPublication[0]?.approved_content_hash ?? "") !== contentHash ||
      ["fact", "language", "media"].some((kind) => !reviewedKinds.has(kind));
    if (!needsPublish) {
      results.push({
        entityId: state.target.entityId,
        slug: state.target.expectedSlug,
        outcome: "noop",
        contentHash,
      });
      continue;
    }
    for (const reviewKind of ["fact", "language", "media"] as const) {
      await recordEntityContentReview(client, {
        entityId: state.target.entityId,
        reviewKind,
        reviewer: options.reviewer,
        status: "approved",
        contentHash,
        notes: `Phase 614 ${reviewKind} review of distinct brand-level story copy; model story retained separately.`,
      });
    }
    const published = await publishEntity(client, {
      entityId: state.target.entityId,
      reviewer: options.reviewer,
      contentHash,
    });
    results.push({
      entityId: state.target.entityId,
      slug: state.target.expectedSlug,
      outcome: "published",
      contentHash: published.contentHash,
    });
  }
  return results;
}

async function verify(
  client: Client,
  states: TargetState[],
): Promise<void> {
  for (const state of states) {
    const row = (
      await rows(
        client,
        `SELECT e.body_md,story.body_md AS story_body,
                publication.status,publication.content_revision,
                publication.reviewed_content_revision,
                publication.approved_content_hash,
                readiness.blocker_count,readiness.publishable,
                CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public
           FROM entities e
           JOIN stories story
             ON story.entity_id=e.id AND story.story_type='brand_story'
            AND story.status='published'
           JOIN entity_publications publication ON publication.entity_id=e.id
           LEFT JOIN public_entity_readiness readiness
             ON readiness.entity_id=e.id AND readiness.contract_version=3
           LEFT JOIN public_entities public ON public.id=e.id
          WHERE e.id=?`,
        [state.target.entityId],
      )
    )[0];
    const hash = await computePublicationContentHash(client, state.target.entityId);
    const reviews = await rows(
      client,
      `SELECT review_kind,status FROM entity_content_reviews
        WHERE entity_id=? AND content_hash=? ORDER BY review_kind`,
      [state.target.entityId, hash],
    );
    const relation = await relationFingerprint(client, state.target);
    if (
      !row ||
      String(row.body_md) !== state.bodyMd ||
      String(row.story_body) !== state.bodyMd ||
      String(row.body_md) === state.modelBodyMd ||
      String(row.status) !== "published" ||
      Number(row.content_revision) !== Number(row.reviewed_content_revision) ||
      String(row.approved_content_hash) !== hash ||
      Number(row.blocker_count) !== 0 ||
      Number(row.publishable) !== 1 ||
      Number(row.is_public) !== 1 ||
      relation !== state.relationFingerprint ||
      JSON.stringify(reviews) !==
        JSON.stringify([
          { review_kind: "fact", status: "approved" },
          { review_kind: "language", status: "approved" },
          { review_kind: "media", status: "approved" },
          { review_kind: "publication", status: "approved" },
        ])
    ) {
      throw new Error(`Phase 614 post-publication verification failed: ${state.target.expectedSlug}.`);
    }
  }
  const duplicates = await rows(
    client,
    `SELECT body_md,count(*) AS count
       FROM public_entities
      GROUP BY body_md
     HAVING count(*) > 1`,
  );
  if (duplicates.length > 0) {
    throw new Error(`Phase 614 still found duplicate public bodies: ${duplicates.length}.`);
  }
}

export async function applyPhase614DuplicateBrandStoryCleanup(
  client: Client,
  options: ApplyPhase614Options,
): Promise<ApplyPhase614Result> {
  if (!options.reviewer.trim()) {
    throw new Error("Phase 614 reviewer must not be empty.");
  }
  await assertOwnedAuthority(client, options);
  const states = await Promise.all(
    PHASE614_BRAND_STORY_TARGETS.map((target) =>
      loadTargetState(client, options.workspaceRoot, target),
    ),
  );
  for (const state of states) {
    if (state.entityBodyMd !== state.storyBodyMd) {
      throw new Error(`Phase 614 requires entity/story body parity: ${state.target.expectedSlug}.`);
    }
    if (state.entityBodyMd !== state.bodyMd && state.entityBodyMd !== state.modelBodyMd) {
      throw new Error(`Phase 614 found an unrecognized brand story state: ${state.target.expectedSlug}.`);
    }
    if (state.entityBodyMd === state.bodyMd && state.entityBodyMd === state.modelBodyMd) {
      throw new Error(`Phase 614 reviewed copy is still identical to model story: ${state.target.expectedSlug}.`);
    }
  }
  await updateStories(client, states);
  const entities = await reviewAndPublish(client, options, states);
  await verify(client, states);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const changed = entities.filter((entity) => entity.outcome === "published").length;
  return {
    affected: {
      entities: entities.length,
      changed,
      noop: entities.length - changed,
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
      "Usage: tsx scripts/apply-phase614-duplicate-brand-story-cleanup.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]",
    );
  }
  const resolvedDatabase = path.resolve(database);
  const resolvedProtected = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase614DuplicateBrandStoryCleanup(client, {
      workspaceRoot: process.cwd(),
      reviewer: value("--reviewer") ?? PHASE614_REVIEWER,
      databasePath: resolvedDatabase,
      ownedRoot: path.resolve(ownedRoot),
      protectedCatalogPath: resolvedProtected,
      protectedCatalogSnapshot: snapshotCatalogFiles(resolvedProtected),
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
