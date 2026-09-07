import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import {
  type ApplyPhase616Options,
  applyPhase616ParkerVectorXLReaderRewrite,
  PHASE616_REVIEWER,
  PHASE616_TARGET,
} from "../../scripts/apply-phase616-parker-vector-xl-reader-rewrite";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

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
) {
  return (await client.execute({ sql, args: args as never[] })).rows.map(
    (row) => ({ ...row }),
  );
}

async function relationFingerprint(
  client: ReturnType<typeof createClient>,
): Promise<string> {
  const links = await rows(
    client,
    "SELECT id,source_id,target_id,link_type,reason FROM entity_links WHERE source_id=? OR target_id=? ORDER BY id",
    [PHASE616_TARGET.entityId, PHASE616_TARGET.entityId],
  );
  const references = await rows(
    client,
    "SELECT id,entity_id,source_item_id,relation_type,note,review_status FROM entity_references WHERE entity_id=? ORDER BY id",
    [PHASE616_TARGET.entityId],
  );
  const media = await rows(
    client,
    "SELECT id,title,asset_type,image_url,thumbnail_url,local_path,author,license,attribution_text,source_url,source_item_id,review_status,usage_status FROM media_assets WHERE entity_id=? ORDER BY id",
    [PHASE616_TARGET.entityId],
  );
  const specs = await rows(
    client,
    "SELECT id,brand_entity_id,series_name,release_year,origin_country,nib,fill_system,material,dimensions,weight,price_range,status,review_status FROM model_specs WHERE entity_id=? ORDER BY id",
    [PHASE616_TARGET.entityId],
  );
  const variants = await rows(
    client,
    "SELECT id,variant_name,release_year,notes,source_item_id,review_status,variant_kind,parent_variant_id,product_code,market FROM model_variants WHERE model_entity_id=? ORDER BY id",
    [PHASE616_TARGET.entityId],
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

test("Phase 616 surfaces the approved Teal 2159746 facts on an owned copy", {
  timeout: 900_000,
}, async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const protectedHash = sha256(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase616-vector-xl-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase616Options = {
    workspaceRoot: ROOT,
    reviewer: `${PHASE616_REVIEWER}-test`,
    databasePath: copy.destinationPath,
    ownedRoot,
    protectedCatalogPath: REAL,
    protectedCatalogSnapshot: protectedSnapshot,
    env: localEnv(),
  };
  try {
    await migrateDatabase(client);
    const legacyBody = "Vector XL legacy body before Phase 616.";
    await client.execute({
      sql: "UPDATE entities SET summary=?,body_md=?,source=? WHERE id=?",
      args: [
        "legacy Vector XL summary",
        legacyBody,
        "legacy-phase616-test",
        PHASE616_TARGET.entityId,
      ],
    });
    await client.execute({
      sql: "UPDATE stories SET summary=?,body_md=?,source_notes=? WHERE id=? AND entity_id=?",
      args: [
        "legacy Vector XL summary",
        legacyBody,
        "legacy-phase616-test",
        PHASE616_TARGET.storyId,
        PHASE616_TARGET.entityId,
      ],
    });
    const before = (
      await rows(
        client,
        "SELECT entity.body_md AS entity_body,story.body_md AS story_body FROM entities entity JOIN stories story ON story.id=? AND story.entity_id=entity.id AND story.story_type='model_story' AND story.status='published' WHERE entity.id=?",
        [PHASE616_TARGET.storyId, PHASE616_TARGET.entityId],
      )
    )[0];
    assert.ok(before);
    assert.equal(String(before.entity_body), String(before.story_body));
    const relationsBefore = await relationFingerprint(client);
    const remoteEnv = localEnv();
    remoteEnv.TURSO_DATABASE_URL = "libsql://remote.invalid";
    await assert.rejects(
      applyPhase616ParkerVectorXLReaderRewrite(client, {
        ...options,
        env: remoteEnv,
      }),
      /refuses inherited remote database selection/,
    );

    const first = await applyPhase616ParkerVectorXLReaderRewrite(
      client,
      options,
    );
    assert.equal(first.outcome, "published");
    assert.equal(first.changed, true);
    assert.match(first.contentHash, /^sha256:v3:/);
    const current = (
      await rows(
        client,
        "SELECT entity.body_md AS entity_body,story.body_md AS story_body,entity.source AS entity_source,story.source_notes AS story_source,publication.content_revision,publication.reviewed_content_revision,publication.status,readiness.blocker_count,readiness.publishable,CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public FROM entities entity JOIN stories story ON story.id=? AND story.entity_id=entity.id AND story.story_type='model_story' AND story.status='published' JOIN entity_publications publication ON publication.entity_id=entity.id LEFT JOIN public_entity_readiness readiness ON readiness.entity_id=entity.id AND readiness.contract_version=3 LEFT JOIN public_entities public ON public.id=entity.id WHERE entity.id=?",
        [PHASE616_TARGET.storyId, PHASE616_TARGET.entityId],
      )
    )[0];
    assert.ok(current);
    assert.notEqual(String(current.entity_body), String(before.entity_body));
    assert.equal(String(current.entity_body), String(current.story_body));
    assert.match(
      String(current.entity_body),
      /2159746[\s\S]*135 mm[\s\S]*157 mm[\s\S]*11\.5 mm[\s\S]*20 g/,
    );
    assert.match(
      String(current.entity_body),
      /converter compatible[\s\S]*需另购/,
    );
    assert.match(
      String(current.entity_body),
      /2159744[\s\S]*2159748[\s\S]*2159771Z/,
    );
    assert.doesNotMatch(
      String(current.entity_body),
      /当前页面|当前档案|资料不足|研究队列|型号档案记录了|现有来源包括/,
    );
    assert.equal(String(current.status), "published");
    assert.equal(
      Number(current.content_revision),
      Number(current.reviewed_content_revision),
    );
    assert.equal(Number(current.blocker_count), 0);
    assert.equal(Number(current.publishable), 1);
    assert.equal(Number(current.is_public), 1);
    assert.equal(await relationFingerprint(client), relationsBefore);
    assert.deepEqual(
      await rows(
        client,
        "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind",
        [PHASE616_TARGET.entityId, first.contentHash],
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
    const replay = await applyPhase616ParkerVectorXLReaderRewrite(
      client,
      options,
    );
    assert.equal(replay.outcome, "noop");
    assert.equal(replay.changed, false);
    assert.equal(replay.contentHash, first.contentHash);
    const afterRevision = Number(
      (
        await rows(
          client,
          "SELECT content_revision FROM entity_publications WHERE entity_id=?",
          [PHASE616_TARGET.entityId],
        )
      )[0]?.content_revision,
    );
    assert.equal(afterRevision, revision);
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assertCatalogSnapshotUnchanged(protectedSnapshot);
  assert.equal(sha256(REAL), protectedHash);
});
