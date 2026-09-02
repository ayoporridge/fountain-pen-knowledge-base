import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import {
  type ApplyPhase615Options,
  applyPhase615PilotCustom823ReaderRewrite,
  PHASE615_REVIEWER,
  PHASE615_TARGET,
} from "../../scripts/apply-phase615-pilot-custom-823-reader-rewrite";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { computePublicationContentHash } from "../../src/lib/publication";

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
    (row) => ({ ...row }),
  );
}

async function relationFingerprint(
  client: ReturnType<typeof createClient>,
): Promise<string> {
  const links = await rows(
    client,
    `SELECT id,source_id,target_id,link_type,reason
       FROM entity_links
      WHERE source_id=? OR target_id=?
      ORDER BY id`,
    [PHASE615_TARGET.entityId, PHASE615_TARGET.entityId],
  );
  const references = await rows(
    client,
    `SELECT id,entity_id,source_item_id,relation_type,note,review_status
       FROM entity_references
      WHERE entity_id=?
      ORDER BY id`,
    [PHASE615_TARGET.entityId],
  );
  const media = await rows(
    client,
    `SELECT id,title,asset_type,image_url,thumbnail_url,local_path,author,license,
            attribution_text,source_url,source_item_id,review_status,usage_status
       FROM media_assets
      WHERE entity_id=?
      ORDER BY id`,
    [PHASE615_TARGET.entityId],
  );
  const specs = await rows(
    client,
    `SELECT id,brand_entity_id,series_name,release_year,origin_country,nib,
            fill_system,material,dimensions,weight,price_range,status,review_status
       FROM model_specs
      WHERE entity_id=?
      ORDER BY id`,
    [PHASE615_TARGET.entityId],
  );
  const variants = await rows(
    client,
    `SELECT id,variant_name,release_year,notes,source_item_id,review_status,
            variant_kind,parent_variant_id,product_code,market
       FROM model_variants
      WHERE model_entity_id=?
      ORDER BY id`,
    [PHASE615_TARGET.entityId],
  );
  return JSON.stringify({ links, references, media, specs, variants });
}

function localEnv(): NodeJS.ProcessEnv {
  return {
    ...process.env,
    NODE_ENV: "test",
    TURSO_DATABASE_URL: "",
    TURSO_AUTH_TOKEN: "",
    FPKG_DATABASE_URL: "",
  };
}

test("Phase 615 rewrites Pilot Custom 823 reader copy and publishes only on an owned copy", {
  timeout: 900_000,
}, async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const protectedHash = sha256(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase615-pilot823-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase615Options = {
    workspaceRoot: ROOT,
    reviewer: `${PHASE615_REVIEWER}-test`,
    databasePath: copy.destinationPath,
    ownedRoot,
    protectedCatalogPath: REAL,
    protectedCatalogSnapshot: protectedSnapshot,
    env: localEnv(),
  };

  try {
    await migrateDatabase(client);
    const before = (
      await rows(
        client,
        `SELECT entity.body_md AS entity_body,story.body_md AS story_body,
                  duplicate.body_md AS duplicate_body
             FROM entities entity
             JOIN stories story ON story.id=? AND story.entity_id=entity.id
              AND story.story_type='model_story' AND story.status='published'
             JOIN entities duplicate ON duplicate.slug='百乐-pilot-custom-823'
              AND duplicate.type='pen'
            WHERE entity.id=?`,
        [PHASE615_TARGET.storyId, PHASE615_TARGET.entityId],
      )
    )[0];
    assert.ok(before);
    const relationBefore = await relationFingerprint(client);
    const duplicateId = String(
      (
        await rows(
          client,
          "SELECT id FROM entities WHERE slug='百乐-pilot-custom-823' AND type='pen'",
        )
      )[0]?.id,
    );

    const remoteEnv = localEnv();
    remoteEnv.TURSO_DATABASE_URL = "libsql://remote.invalid";
    await assert.rejects(
      applyPhase615PilotCustom823ReaderRewrite(client, {
        ...options,
        env: remoteEnv,
      }),
      /refuses inherited remote database selection/,
    );

    const first = await applyPhase615PilotCustom823ReaderRewrite(
      client,
      options,
    );
    assert.equal(first.outcome, "published");
    assert.equal(first.changed, true);
    assert.match(first.contentHash, /^sha256:v3:/);

    const current = (
      await rows(
        client,
        `SELECT entity.body_md AS entity_body,entity.source AS entity_source,
                  entity.summary AS entity_summary,
                  story.body_md AS story_body,story.title AS story_title,
                  story.summary AS story_summary,story.source_notes AS story_source,
                  duplicate.body_md AS duplicate_body,
                  publication.status,publication.content_revision,
                  publication.reviewed_content_revision,
                  publication.approved_content_hash,
                  readiness.blocker_count,readiness.publishable,
                  CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public,
                  CASE WHEN duplicate_public.id IS NULL THEN 0 ELSE 1 END AS duplicate_public
             FROM entities entity
             JOIN stories story ON story.id=? AND story.entity_id=entity.id
              AND story.story_type='model_story' AND story.status='published'
             JOIN entities duplicate ON duplicate.id=?
             JOIN entity_publications publication ON publication.entity_id=entity.id
             LEFT JOIN public_entity_readiness readiness
              ON readiness.entity_id=entity.id AND readiness.contract_version=3
             LEFT JOIN public_entities public ON public.id=entity.id
             LEFT JOIN public_entities duplicate_public ON duplicate_public.id=duplicate.id
            WHERE entity.id=?`,
        [PHASE615_TARGET.storyId, duplicateId, PHASE615_TARGET.entityId],
      )
    )[0];
    assert.ok(current);
    assert.notEqual(String(current.entity_body), String(before.entity_body));
    assert.notEqual(String(current.entity_body), String(before.duplicate_body));
    assert.equal(String(current.entity_body), String(current.story_body));
    assert.equal(String(current.story_title), PHASE615_TARGET.storyTitle);
    assert.equal(String(current.entity_source), String(current.story_source));
    assert.match(
      String(current.entity_source),
      /^curated-content:phase615-pilot-custom-823-reader-rewrite:/,
    );
    assert.equal(String(current.entity_summary), String(current.story_summary));
    assert.match(String(current.entity_body), /## 先把 823 认清/);
    assert.match(String(current.entity_body), /## 清洗和运输/);
    assert.match(String(current.entity_body), /FKK-3MRP/);
    assert.doesNotMatch(
      String(current.entity_body),
      /当前页面|当前档案|资料不足|研究队列|型号档案记录了|现有来源包括/,
    );
    assert.equal(String(current.duplicate_body), String(before.duplicate_body));
    assert.equal(String(current.status), "published");
    assert.equal(
      Number(current.content_revision),
      Number(current.reviewed_content_revision),
    );
    assert.equal(Number(current.blocker_count), 0);
    assert.equal(Number(current.publishable), 1);
    assert.equal(Number(current.is_public), 1);
    assert.equal(Number(current.duplicate_public), 0);
    assert.equal(
      String(current.approved_content_hash),
      await computePublicationContentHash(client, PHASE615_TARGET.entityId),
    );
    assert.equal(await relationFingerprint(client), relationBefore);

    const duplicatePublication = (
      await rows(
        client,
        "SELECT status FROM entity_publications WHERE entity_id=?",
        [duplicateId],
      )
    )[0];
    assert.equal(String(duplicatePublication?.status), "retired");
    assert.deepEqual(
      await rows(
        client,
        `SELECT review_kind,status FROM entity_content_reviews
            WHERE entity_id=? AND content_hash=? ORDER BY review_kind`,
        [PHASE615_TARGET.entityId, first.contentHash],
      ),
      [
        { review_kind: "fact", status: "approved" },
        { review_kind: "language", status: "approved" },
        { review_kind: "media", status: "approved" },
        { review_kind: "publication", status: "approved" },
      ],
    );
    assert.equal(
      (
        await rows(
          client,
          "SELECT count(*) AS count FROM public_entities GROUP BY body_md HAVING count(*)>1",
        )
      ).length,
      0,
    );

    const revision = Number(current.content_revision);
    const replay = await applyPhase615PilotCustom823ReaderRewrite(
      client,
      options,
    );
    assert.equal(replay.outcome, "noop");
    assert.equal(replay.changed, false);
    assert.equal(replay.contentHash, first.contentHash);
    const replayPublication = (
      await rows(
        client,
        "SELECT content_revision FROM entity_publications WHERE entity_id=?",
        [PHASE615_TARGET.entityId],
      )
    )[0];
    assert.equal(Number(replayPublication?.content_revision), revision);
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }

  assertCatalogSnapshotUnchanged(protectedSnapshot);
  assert.equal(sha256(REAL), protectedHash);
});
