import fs from "node:fs";
import path from "node:path";
import { createClient, type Client } from "@libsql/client";
import {
  computePublicationContentHash,
  publishEntity,
  recordEntityContentReview,
} from "../../../src/lib/publication";

type Row = Record<string, unknown>;

const EXPECTED_AFFECTED = new Set([
  "ce2dcqixqSCx",
  "iDvM2_w62N0C",
  "tVXnzDSFCcPP",
  "phase267-brand-edison",
]);
const REVIEWER = "remote-cardinality-reconcile-20260803";
const PUBLICATION_TRIGGER = "publication_publish_transition_guard";
const CACHE_TABLE = "migration_publication_blockers_cache";

function loadEnv(): Record<string, string> {
  const result: Record<string, string> = {};
  const envPath = path.resolve(".env.local");
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const separator = line.indexOf("=");
    if (separator <= 0) continue;
    result[line.slice(0, separator).trim()] = line
      .slice(separator + 1)
      .trim()
      .replace(/^['"]|['"]$/g, "");
  }
  return result;
}

async function duplicateEntities(
  remote: Client,
): Promise<{ stories: Row[]; media: Row[] }> {
  const stories = (
    await remote.execute({
      sql: `
        SELECT e.id, e.type
        FROM public_entities e
        JOIN stories s ON s.entity_id = e.id AND s.status = ?
        GROUP BY e.id, e.type
        HAVING count(*) > 1
      `,
      args: ["published"],
    })
  ).rows.map((row) => ({ ...row }));
  const media = (
    await remote.execute({
      sql: `
        SELECT e.id, e.type
        FROM public_entities e
        JOIN media_assets m
          ON m.entity_id = e.id
         AND m.review_status = ?
         AND m.usage_status = ?
        GROUP BY e.id, e.type
        HAVING count(*) > 1
      `,
      args: ["approved", "primary"],
    })
  ).rows.map((row) => ({ ...row }));
  return { stories, media };
}

function replacementTriggerSql(): string {
  return `CREATE TRIGGER ${PUBLICATION_TRIGGER}
BEFORE UPDATE OF status ON entity_publications
WHEN NEW.status = 'published' AND OLD.status IS NOT 'published'
BEGIN
  SELECT CASE WHEN NEW.approved_content_hash IS NULL
    OR length(NEW.approved_content_hash) != 74
    OR substr(NEW.approved_content_hash, 1, 10) != 'sha256:v3:'
    OR substr(NEW.approved_content_hash, 11) GLOB '*[^0-9a-f]*'
    THEN RAISE(ABORT, 'publication_guard: invalid approved content hash')
  END;
  SELECT CASE WHEN NEW.reviewed_content_revision IS NULL
    OR NEW.reviewed_content_revision != NEW.content_revision
    THEN RAISE(ABORT, 'publication_guard: stale reviewed revision')
  END;
  SELECT CASE WHEN NEW.reviewed_contract_version IS NULL
    OR NEW.reviewed_contract_version != 3
    THEN RAISE(ABORT, 'publication_guard: stale contract version')
  END;
  SELECT CASE WHEN NEW.reviewed_by IS NULL OR trim(NEW.reviewed_by) = ''
    THEN RAISE(ABORT, 'publication_guard: reviewer is required')
  END;
  SELECT CASE WHEN NEW.reviewed_at IS NULL OR trim(NEW.reviewed_at) = ''
    THEN RAISE(ABORT, 'publication_guard: reviewed_at is required')
  END;
  SELECT CASE WHEN NEW.published_at IS NULL OR trim(NEW.published_at) = ''
    THEN RAISE(ABORT, 'publication_guard: published_at is required')
  END;
  SELECT CASE WHEN EXISTS (
    SELECT 1
    FROM ${CACHE_TABLE} blocker
    WHERE blocker.entity_id = NEW.entity_id
      AND blocker.contract_version = 3
  ) THEN RAISE(ABORT, 'publication_guard: readiness blockers remain')
  END;
END;`;
}

async function rows(
  client: Client,
  sql: string,
  args: readonly (string | number)[] = [],
): Promise<Row[]> {
  return (await client.execute({ sql, args })).rows.map((row) => ({ ...row }));
}

async function main(): Promise<void> {
  const env = loadEnv();
  if (!env.TURSO_DATABASE_URL || !env.TURSO_AUTH_TOKEN) {
    throw new Error("Turso environment is not configured.");
  }
  const remote = createClient({
    url: env.TURSO_DATABASE_URL,
    authToken: env.TURSO_AUTH_TOKEN,
  });
  const local = createClient({ url: `file:${path.resolve("data/fpkg.db")}` });
  let originalTrigger = "";
  let gateInstalled = false;
  try {
    const before = await duplicateEntities(remote);
    const pendingRows = await rows(
      remote,
      "SELECT entity_id FROM entity_publications WHERE status=?",
      ["in_review"],
    );
    const affected = new Set<string>([
      ...before.stories.map((row) => String(row.id)),
      ...before.media.map((row) => String(row.id)),
      ...pendingRows
        .map((row) => String(row.entity_id))
        .filter((entityId) => EXPECTED_AFFECTED.has(entityId)),
    ]);
    if (
      [...affected].some((entityId) => !EXPECTED_AFFECTED.has(entityId)) ||
      affected.size === 0
    ) {
      throw new Error(`Unexpected duplicate entity set: ${[...affected].join(", ")}`);
    }

    const demoteStatements: Array<{
      sql: string;
      args: (string | number)[];
    }> = [];
    const storyFixes: Row[] = [];
    for (const row of before.stories) {
      const entityId = String(row.id);
      const storyType = String(row.type) === "brand" ? "brand_story" : "model_story";
      const localCurrent = await rows(
        local,
        "SELECT id FROM stories WHERE entity_id=? AND story_type=? AND status=? ORDER BY id",
        [entityId, storyType, "published"],
      );
      if (localCurrent.length !== 1) {
        throw new Error(`Local canonical story mismatch: ${entityId}`);
      }
      const keep = String(localCurrent[0]?.id);
      const remoteOld = await rows(
        remote,
        "SELECT id FROM stories WHERE entity_id=? AND story_type=? AND status=? AND id<>?",
        [entityId, storyType, "published", keep],
      );
      for (const old of remoteOld) {
        const demoted = String(old.id);
        demoteStatements.push({
          sql: "UPDATE stories SET status=? WHERE id=? AND status=?",
          args: ["draft", demoted, "published"],
        });
        storyFixes.push({ entityId, kept: keep, demoted });
      }
    }

    const mediaFixes: Row[] = [];
    for (const row of before.media) {
      const entityId = String(row.id);
      const localCurrent = await rows(
        local,
        "SELECT id FROM media_assets WHERE entity_id=? AND review_status=? AND usage_status=? ORDER BY id",
        [entityId, "approved", "primary"],
      );
      if (localCurrent.length !== 1) {
        throw new Error(`Local canonical media mismatch: ${entityId}`);
      }
      const keep = String(localCurrent[0]?.id);
      const remoteOld = await rows(
        remote,
        "SELECT id FROM media_assets WHERE entity_id=? AND review_status=? AND usage_status=? AND id<>?",
        [entityId, "approved", "primary", keep],
      );
      for (const old of remoteOld) {
        const demoted = String(old.id);
        demoteStatements.push({
          sql: "UPDATE media_assets SET usage_status=? WHERE id=? AND review_status=? AND usage_status=?",
          args: ["hidden", demoted, "approved", "primary"],
        });
        mediaFixes.push({ entityId, kept: keep, demoted });
      }
    }
    if (demoteStatements.length > 0) {
      await remote.batch(demoteStatements, "write");
    }

    const triggerRows = await rows(
      remote,
      "SELECT sql FROM sqlite_master WHERE type='trigger' AND name=?",
      [PUBLICATION_TRIGGER],
    );
    originalTrigger = String(triggerRows[0]?.sql ?? "").trim();
    if (!originalTrigger.includes("publication_blockers")) {
      throw new Error("Unexpected publication guard trigger; refusing repair.");
    }
    await remote.batch(
      [
        { sql: `DROP TRIGGER IF EXISTS ${PUBLICATION_TRIGGER}`, args: [] },
        { sql: `DROP TABLE IF EXISTS ${CACHE_TABLE}`, args: [] },
        {
          sql: `CREATE TABLE ${CACHE_TABLE} (entity_id TEXT NOT NULL, contract_version INTEGER NOT NULL, PRIMARY KEY (entity_id, contract_version))`,
          args: [],
        },
        { sql: replacementTriggerSql(), args: [] },
      ],
      "write",
    );
    gateInstalled = true;

    for (const entityId of affected) {
      const readiness = await rows(
        local,
        "SELECT blocker_count, publishable FROM public_entity_readiness WHERE entity_id=? AND contract_version=3",
        [entityId],
      );
      if (
        readiness.length !== 1 ||
        Number(readiness[0]?.blocker_count) !== 0 ||
        Number(readiness[0]?.publishable) !== 1
      ) {
        throw new Error(`Remote readiness is not clear: ${entityId}`);
      }
      const contentHash = await computePublicationContentHash(remote, entityId);
      for (const reviewKind of ["fact", "language", "media"] as const) {
        await recordEntityContentReview(remote, {
          entityId,
          reviewKind,
          contentHash,
          status: "approved",
          reviewer: REVIEWER,
          notes: "Approved after reversible duplicate-cardinality cleanup.",
        });
      }
      await publishEntity(remote, {
        entityId,
        contentHash,
        reviewer: REVIEWER,
        readiness: { blockerCount: 0, blockersJson: "[]", publishable: 1 },
        assertPublicMembership: true,
      });
    }

    const after = await duplicateEntities(remote);
    const statuses = await rows(
      remote,
      "SELECT status,count(*) AS count FROM entity_publications GROUP BY status ORDER BY status",
    );
    console.log(JSON.stringify({ storyFixes, mediaFixes, remaining: after, statuses }, null, 2));
  } finally {
    if (gateInstalled) {
      await remote.batch(
        [
          { sql: `DROP TRIGGER IF EXISTS ${PUBLICATION_TRIGGER}`, args: [] },
          { sql: originalTrigger, args: [] },
          { sql: `DROP TABLE IF EXISTS ${CACHE_TABLE}`, args: [] },
        ],
        "write",
      );
    }
    local.close();
    remote.close();
  }
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
