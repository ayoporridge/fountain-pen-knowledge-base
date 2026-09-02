import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import {
  type ApplyPhase614Options,
  applyPhase614DuplicateBrandStoryCleanup,
  PHASE614_BRAND_STORY_TARGETS,
} from "../../scripts/apply-phase614-duplicate-brand-story-cleanup";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import {
  computePublicationContentHash,
  publishEntity,
} from "../../src/lib/publication";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

function sha256(file: string): string {
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(file))
    .digest("hex");
}

async function rows(
  client: ReturnType<typeof createClient>,
  sql: string,
  args: unknown[] = [],
): Promise<Array<Record<string, unknown>>> {
  return (await client.execute({ sql, args: args as never[] })).rows.map(
    (row) => ({
      ...row,
    }),
  );
}

async function relationFingerprint(
  client: ReturnType<typeof createClient>,
  entityId: string,
  modelEntityId: string,
): Promise<string> {
  const links = await rows(
    client,
    `SELECT id,source_id,target_id,link_type,reason
       FROM entity_links
      WHERE source_id IN (?,?) OR target_id IN (?,?)
      ORDER BY id`,
    [entityId, modelEntityId, entityId, modelEntityId],
  );
  const references = await rows(
    client,
    `SELECT id,entity_id,source_item_id,relation_type,note,review_status
       FROM entity_references
      WHERE entity_id IN (?,?)
      ORDER BY id`,
    [entityId, modelEntityId],
  );
  return JSON.stringify({ links, references });
}

test("Phase 614 gives three duplicate brand stories distinct sourced copy on an owned catalog", {
  timeout: 900_000,
}, async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const protectedHash = sha256(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase614-brand-stories-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase614Options = {
    workspaceRoot: ROOT,
    reviewer: "phase614-duplicate-brand-story-cleanup-test",
    databasePath: copy.destinationPath,
    ownedRoot,
    protectedCatalogPath: REAL,
    protectedCatalogSnapshot: protectedSnapshot,
    env: {
      ...process.env,
      NODE_ENV: "test",
      TURSO_DATABASE_URL: "",
      TURSO_AUTH_TOKEN: "",
      FPKG_DATABASE_URL: "",
    },
  };

  try {
    await migrateDatabase(client);
    const relationBefore = new Map<string, string>();
    const modelBodiesBefore = new Map<string, string>();
    for (const target of PHASE614_BRAND_STORY_TARGETS) {
      relationBefore.set(
        target.entityId,
        await relationFingerprint(
          client,
          target.entityId,
          target.modelEntityId,
        ),
      );
      const model = (
        await rows(client, "SELECT body_md FROM entities WHERE id=?", [
          target.modelEntityId,
        ])
      )[0];
      modelBodiesBefore.set(target.entityId, String(model?.body_md));
      const duplicate = (
        await rows(
          client,
          `SELECT count(*) AS count FROM public_entities
              WHERE body_md=(SELECT body_md FROM entities WHERE id=?)`,
          [target.entityId],
        )
      )[0];
      assert.equal(Number(duplicate?.count), 2);
    }

    const beforePublishAttemptHash = await computePublicationContentHash(
      client,
      PHASE614_BRAND_STORY_TARGETS[0].entityId,
    );
    await assert.rejects(
      publishEntity(client, {
        entityId: PHASE614_BRAND_STORY_TARGETS[0].entityId,
        reviewer: options.reviewer,
        contentHash: `${beforePublishAttemptHash}-unreviewed`,
      }),
      /current-hash reviews missing/,
    );

    await assert.rejects(
      applyPhase614DuplicateBrandStoryCleanup(client, {
        ...options,
        env: {
          ...options.env,
          TURSO_DATABASE_URL: "libsql://remote.invalid",
        } as NodeJS.ProcessEnv,
      }),
      /refuses inherited remote database selection/,
    );

    const first = await applyPhase614DuplicateBrandStoryCleanup(
      client,
      options,
    );
    assert.deepEqual(first.affected, { entities: 3, changed: 3, noop: 0 });
    assert.equal(first.entities.length, 3);
    assert.ok(first.entities.every((entity) => entity.outcome === "published"));

    const duplicateGroups = await rows(
      client,
      `SELECT body_md,count(*) AS count FROM public_entities
          GROUP BY body_md HAVING count(*) > 1`,
    );
    assert.equal(duplicateGroups.length, 0);

    const revisionsBeforeReplay = new Map<string, number>();
    for (const target of PHASE614_BRAND_STORY_TARGETS) {
      const current = (
        await rows(
          client,
          `SELECT brand.body_md,story.body_md AS story_body,
                    model.body_md AS model_body,
                    publication.status,publication.content_revision,
                    publication.reviewed_content_revision,
                    publication.approved_content_hash,
                    readiness.blocker_count,readiness.publishable,
                    CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public
               FROM entities brand
               JOIN stories story ON story.entity_id=brand.id
                AND story.story_type='brand_story' AND story.status='published'
               JOIN entities model ON model.id=?
               JOIN entity_publications publication ON publication.entity_id=brand.id
               LEFT JOIN public_entity_readiness readiness
                ON readiness.entity_id=brand.id AND readiness.contract_version=3
               LEFT JOIN public_entities public ON public.id=brand.id
              WHERE brand.id=?`,
          [target.modelEntityId, target.entityId],
        )
      )[0];
      assert.ok(current);
      assert.notEqual(String(current.body_md), String(current.model_body));
      assert.equal(String(current.body_md), String(current.story_body));
      assert.equal(String(current.status), "published");
      assert.equal(
        Number(current.content_revision),
        Number(current.reviewed_content_revision),
      );
      assert.equal(Number(current.blocker_count), 0);
      assert.equal(Number(current.publishable), 1);
      assert.equal(Number(current.is_public), 1);
      const hash = await computePublicationContentHash(client, target.entityId);
      assert.equal(String(current.approved_content_hash), hash);
      assert.deepEqual(
        await rows(
          client,
          `SELECT review_kind,status FROM entity_content_reviews
              WHERE entity_id=? AND content_hash=? ORDER BY review_kind`,
          [target.entityId, hash],
        ),
        [
          { review_kind: "fact", status: "approved" },
          { review_kind: "language", status: "approved" },
          { review_kind: "media", status: "approved" },
          { review_kind: "publication", status: "approved" },
        ],
      );
      assert.equal(
        await relationFingerprint(
          client,
          target.entityId,
          target.modelEntityId,
        ),
        relationBefore.get(target.entityId),
      );
      const model = (
        await rows(client, "SELECT body_md FROM entities WHERE id=?", [
          target.modelEntityId,
        ])
      )[0];
      assert.equal(
        String(model?.body_md),
        modelBodiesBefore.get(target.entityId),
      );
      revisionsBeforeReplay.set(
        target.entityId,
        Number(current.content_revision),
      );
    }

    const replay = await applyPhase614DuplicateBrandStoryCleanup(
      client,
      options,
    );
    assert.deepEqual(replay.affected, { entities: 3, changed: 0, noop: 3 });
    assert.ok(replay.entities.every((entity) => entity.outcome === "noop"));
    for (const target of PHASE614_BRAND_STORY_TARGETS) {
      const row = (
        await rows(
          client,
          "SELECT content_revision FROM entity_publications WHERE entity_id=?",
          [target.entityId],
        )
      )[0];
      assert.equal(
        Number(row?.content_revision),
        revisionsBeforeReplay.get(target.entityId),
      );
    }

    assertCatalogSnapshotUnchanged(protectedSnapshot);
    assert.equal(sha256(REAL), protectedHash);
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
});
