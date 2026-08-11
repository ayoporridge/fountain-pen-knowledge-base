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

export const PHASE583_REVIEWER = "phase583-public-story-residue-cleanup";

export interface ApplyPhase583Options {
  workspaceRoot: string;
  reviewer: string;
  databasePath: string;
  ownedRoot: string;
  protectedCatalogPath: string;
  protectedCatalogSnapshot: CatalogSnapshot;
  env?: NodeJS.ProcessEnv;
}

export interface ApplyPhase583Result {
  affected: {
    entities: number;
    pens: number;
    brands: number;
    removedBlocks: number;
  };
  entities: Array<{
    entityId: string;
    slug: string;
    type: "brand" | "pen";
    outcome: "published";
    contentHash: string;
  }>;
}

interface StoryTarget {
  entityId: string;
  slug: string;
  type: "brand" | "pen";
  storyId: string;
  bodyMd: string;
  structuredSpecCount: number;
}

const MODEL_SPECS_HEADING = /^## model_specs[ \t]*$/gm;
const JSON_FENCE = /^```json[ \t]*$/gm;
const CLOSING_FENCE = /^```[ \t]*$/gm;

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
        `Phase 583 refuses inherited remote database selection: ${key}.`,
      );
    }
  }
}

async function assertOwnedAuthority(
  client: Client,
  options: ApplyPhase583Options,
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
    throw new Error("Phase 583 requires an owned, non-symlink catalog copy.");
  }
  const owned = fs.statSync(database, { bigint: true });
  const protectedStat = fs.statSync(protectedPath, { bigint: true });
  if (
    database === protectedPath ||
    (owned.dev === protectedStat.dev && owned.ino === protectedStat.ino)
  ) {
    throw new Error("Phase 583 refuses the protected catalog and hard-link aliases.");
  }

  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) {
    throw new Error("Phase 583 client is not bound to the authorized owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 AS ok FROM migrations WHERE name=? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) {
    throw new Error("Phase 583 owned copy must be migrated through 032.");
  }
}

function nextMatch(
  pattern: RegExp,
  input: string,
  fromIndex: number,
): RegExpExecArray | null {
  pattern.lastIndex = fromIndex;
  return pattern.exec(input);
}

export function stripRawModelSpecsSections(bodyMd: string): {
  bodyMd: string;
  removedBlocks: number;
} {
  let output = bodyMd;
  let removedBlocks = 0;

  for (;;) {
    const heading = nextMatch(MODEL_SPECS_HEADING, output, 0);
    if (!heading) break;
    const headingEnd = heading.index + heading[0].length;
    const opening = nextMatch(JSON_FENCE, output, headingEnd);
    if (!opening || output.slice(headingEnd, opening.index).trim() !== "") {
      throw new Error("Malformed model_specs section: expected a JSON fence.");
    }
    const jsonStart = opening.index + opening[0].length;
    const closing = nextMatch(CLOSING_FENCE, output, jsonStart);
    if (!closing) {
      throw new Error("Malformed model_specs section: missing closing fence.");
    }
    const rawJson = output.slice(jsonStart, closing.index).trim();
    try {
      JSON.parse(rawJson);
    } catch (error) {
      throw new Error(
        `Malformed model_specs section: invalid JSON (${error instanceof Error ? error.message : String(error)}).`,
      );
    }

    const before = output.slice(0, heading.index).trimEnd();
    const after = output.slice(closing.index + closing[0].length).trimStart();
    output = after ? `${before}\n\n${after}` : before;
    removedBlocks += 1;
  }

  return { bodyMd: output.trim(), removedBlocks };
}

async function rows(
  db: Client | Transaction,
  sql: string,
  args: unknown[] = [],
): Promise<Array<Record<string, unknown>>> {
  return (
    await db.execute({
      sql,
      args: args as never[],
    })
  ).rows.map((row) => ({ ...row }));
}

async function loadTargets(client: Client): Promise<StoryTarget[]> {
  const result = await rows(
    client,
    `SELECT entity.id AS entity_id,entity.slug,entity.type,story.id AS story_id,
            story.body_md,
            (SELECT count(*) FROM model_specs spec WHERE spec.entity_id=entity.id)
              AS structured_spec_count
     FROM entities entity
     JOIN entity_publications publication ON publication.entity_id=entity.id
     JOIN stories story ON story.entity_id=entity.id AND story.status='published'
     WHERE publication.status='published'
       AND entity.type IN ('brand','pen')
       AND story.body_md LIKE '%## model_specs%'
     ORDER BY entity.type,entity.slug,story.id`,
  );
  const seen = new Set<string>();
  return result.map((row) => {
    const entityId = String(row.entity_id);
    if (seen.has(entityId)) {
      throw new Error(`Phase 583 found multiple affected stories for ${entityId}.`);
    }
    seen.add(entityId);
    const type = String(row.type);
    if (type !== "brand" && type !== "pen") {
      throw new Error(`Phase 583 unsupported entity type: ${type}.`);
    }
    return {
      entityId,
      slug: String(row.slug),
      type,
      storyId: String(row.story_id),
      bodyMd: String(row.body_md),
      structuredSpecCount: Number(row.structured_spec_count),
    };
  });
}

async function cleanStories(
  client: Client,
  targets: StoryTarget[],
): Promise<Map<string, number>> {
  const removedByEntity = new Map<string, number>();
  const transaction = await client.transaction("write");
  try {
    for (const target of targets) {
      const cleaned = stripRawModelSpecsSections(target.bodyMd);
      if (cleaned.removedBlocks < 1 || cleaned.bodyMd.length < 500) {
        throw new Error(`Phase 583 unsafe cleaned story for ${target.slug}.`);
      }
      const update = await transaction.execute({
        sql: `UPDATE stories
              SET body_md=?,updated_at=datetime('now')
              WHERE id=? AND entity_id=? AND body_md=? AND status='published'`,
        args: [cleaned.bodyMd, target.storyId, target.entityId, target.bodyMd],
      });
      if (update.rowsAffected !== 1) {
        throw new Error(`Phase 583 story changed concurrently: ${target.slug}.`);
      }
      removedByEntity.set(target.entityId, cleaned.removedBlocks);
    }
    await transaction.commit();
  } catch (error) {
    if (!transaction.closed) await transaction.rollback();
    throw error;
  }
  return removedByEntity;
}

async function reviewAndPublish(
  client: Client,
  options: ApplyPhase583Options,
  targets: StoryTarget[],
): Promise<ApplyPhase583Result["entities"]> {
  const published: ApplyPhase583Result["entities"] = [];
  for (const target of targets) {
    const contentHash = await computePublicationContentHash(
      client,
      target.entityId,
    );
    for (const reviewKind of ["fact", "language", "media"] as const) {
      await recordEntityContentReview(client, {
        entityId: target.entityId,
        reviewKind,
        reviewer: options.reviewer,
        status: "approved",
        contentHash,
        notes: `Phase 583 ${reviewKind} review after removing reader-visible model_specs JSON residue.`,
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

async function verifyTargets(
  client: Client,
  targets: StoryTarget[],
): Promise<void> {
  const result = await rows(
    client,
    `SELECT entity.id,publication.status,publication.content_revision,
            publication.reviewed_content_revision,
            readiness.blocker_count,readiness.publishable,
            CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public,
            (SELECT count(*) FROM model_specs spec WHERE spec.entity_id=entity.id)
              AS structured_spec_count,
            (SELECT count(*) FROM stories story
             WHERE story.entity_id=entity.id AND story.status='published'
               AND story.body_md LIKE '%## model_specs%') AS residue_count
     FROM entities entity
     JOIN entity_publications publication ON publication.entity_id=entity.id
     LEFT JOIN public_entity_readiness readiness
       ON readiness.entity_id=entity.id AND readiness.contract_version=3
     LEFT JOIN public_entities public ON public.id=entity.id
     WHERE entity.id IN (${targets.map(() => "?").join(",")})`,
    targets.map((target) => target.entityId),
  );
  const resultByEntityId = new Map(
    result.map((row) => [String(row.id), row]),
  );
  for (const target of targets) {
    const row = resultByEntityId.get(target.entityId);
    if (
      !row ||
      String(row?.status) !== "published" ||
      Number(row?.content_revision) !== Number(row?.reviewed_content_revision) ||
      Number(row?.blocker_count) !== 0 ||
      Number(row?.publishable) !== 1 ||
      Number(row?.is_public) !== 1 ||
      Number(row?.structured_spec_count) !== target.structuredSpecCount ||
      Number(row?.residue_count) !== 0
    ) {
      throw new Error(`Phase 583 post-publication verification failed: ${target.slug}.`);
    }
  }
}

export async function applyPhase583PublicStoryResidueCleanup(
  client: Client,
  options: ApplyPhase583Options,
): Promise<ApplyPhase583Result> {
  if (!options.reviewer.trim()) {
    throw new Error("Phase 583 reviewer must not be empty.");
  }
  await assertOwnedAuthority(client, options);
  const targets = await loadTargets(client);
  if (targets.length === 0) {
    assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
    return {
      affected: { entities: 0, pens: 0, brands: 0, removedBlocks: 0 },
      entities: [],
    };
  }
  const removedByEntity = await cleanStories(client, targets);
  const entities = await reviewAndPublish(client, options, targets);
  await verifyTargets(client, targets);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return {
    affected: {
      entities: targets.length,
      pens: targets.filter((target) => target.type === "pen").length,
      brands: targets.filter((target) => target.type === "brand").length,
      removedBlocks: [...removedByEntity.values()].reduce(
        (total, count) => total + count,
        0,
      ),
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
      "Usage: tsx scripts/apply-phase583-public-story-residue-cleanup.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]",
    );
  }
  const resolvedDatabase = path.resolve(database);
  const resolvedProtected = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase583PublicStoryResidueCleanup(client, {
      workspaceRoot: process.cwd(),
      reviewer: value("--reviewer") ?? PHASE583_REVIEWER,
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
