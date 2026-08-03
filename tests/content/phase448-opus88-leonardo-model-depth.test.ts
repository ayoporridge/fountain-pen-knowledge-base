import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase448ModelDepth } from "../../scripts/apply-phase448-opus88-leonardo-model-depth";
import {
  PHASE448_MODEL_IDS,
  phase448Opus88LeonardoModelPacks,
} from "../../scripts/data/phase448-opus88-leonardo-model-depth";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { computePublicationContentHash } from "../../src/lib/publication";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");
const BASE_CHECKPOINT = path.join(
  ROOT,
  ".planning/quick/260804-61n-picasso-platinum-montblanc-brand-depth-owned-checkpoint/checkpoint.db",
);

test("Phase 448 deepens Opus 88 and Leonardo models on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  const realSnapshot = snapshotCatalogFiles(REAL);
  const baseSnapshot = snapshotCatalogFiles(BASE_CHECKPOINT);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase448-model-depth-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    BASE_CHECKPOINT,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: baseSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options = {
    workspaceRoot: ROOT,
    reviewer: "phase448-opus88-leonardo-test",
    databasePath: copy.destinationPath,
    ownedRoot,
    protectedCatalogPath: REAL,
    protectedCatalogSnapshot: realSnapshot,
    env: {
      ...process.env,
      TURSO_DATABASE_URL: "",
      TURSO_AUTH_TOKEN: "",
      FPKG_DATABASE_URL: "",
    },
  } as const;
  try {
    await migrateDatabase(client);
    assert.equal(phase448Opus88LeonardoModelPacks.length, 4);
    for (const pack of phase448Opus88LeonardoModelPacks) {
      assert.equal(pack.expectedType, "pen");
      assert.ok(
        fs.readFileSync(path.join(ROOT, pack.markdownFile), "utf8").length >=
          3_500,
      );
      assert.ok(
        new Set(pack.sources.map((source) => source.independenceGroup)).size >=
          3,
      );
    }
    await assert.rejects(
      applyPhase448ModelDepth(client, {
        ...options,
        env: { ...options.env, TURSO_DATABASE_URL: "libsql://remote" },
      }),
      /refuses inherited remote database selection/,
    );
    const first = await applyPhase448ModelDepth(client, options);
    assert.deepEqual(
      first.entities.map((item) => item.entityId),
      Object.values(PHASE448_MODEL_IDS),
    );
    for (const [label, modelId] of Object.entries(PHASE448_MODEL_IDS)) {
      const entity = (
        await client.execute({
          sql: "SELECT id,type,slug,body_md FROM public_entities WHERE id=?",
          args: [modelId],
        })
      ).rows[0];
      assert.equal(String(entity?.id), modelId);
      assert.equal(String(entity?.type), "pen");
      const body = String(entity?.body_md ?? "");
      assert.ok(
        Array.from(body).length >= 2_600,
        `${label} published body is too short`,
      );
      assert.equal(
        body.match(/made_by|数据库|仓库/i),
        null,
        `${label} contains internal wording`,
      );
      const references = (
        await client.execute({
          sql: "SELECT count(*) AS n FROM entity_references WHERE entity_id=? AND review_status='approved'",
          args: [modelId],
        })
      ).rows[0];
      assert.ok(Number(references?.n) >= 4);
      const media = (
        await client.execute({
          sql: "SELECT count(*) AS n FROM media_assets WHERE entity_id=? AND review_status='approved' AND usage_status='primary'",
          args: [modelId],
        })
      ).rows[0];
      assert.equal(Number(media?.n), 1);
      const pack = phase448Opus88LeonardoModelPacks.find(
        (item) => item.entityId === modelId,
      );
      assert.ok(pack?.spec?.brandEntityId);
      const maker = (
        await client.execute({
          sql: "SELECT count(*) AS n FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
          args: [modelId, pack?.spec?.brandEntityId],
        })
      ).rows[0];
      assert.equal(Number(maker?.n), 1);
      const reverse = (
        await client.execute({
          sql: "SELECT count(*) AS n FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
          args: [pack?.spec?.brandEntityId, modelId],
        })
      ).rows[0];
      assert.equal(Number(reverse?.n), 1);
      const hash = await computePublicationContentHash(client, modelId);
      const reviews = (
        await client.execute({
          sql: "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind",
          args: [modelId, hash],
        })
      ).rows.map((row) => [String(row.review_kind), String(row.status)]);
      assert.deepEqual(reviews, [
        ["fact", "approved"],
        ["language", "approved"],
        ["media", "approved"],
        ["publication", "approved"],
      ]);
      const publication = (
        await client.execute({
          sql: "SELECT status,reviewed_content_revision,content_revision,reviewed_contract_version,approved_content_hash FROM entity_publications WHERE entity_id=?",
          args: [modelId],
        })
      ).rows[0];
      assert.equal(String(publication?.status), "published");
      assert.equal(
        Number(publication?.reviewed_content_revision),
        Number(publication?.content_revision),
      );
      assert.equal(Number(publication?.reviewed_contract_version), 3);
      assert.equal(String(publication?.approved_content_hash), hash);
    }
    const replay = await applyPhase448ModelDepth(client, options);
    assert.ok(replay.entities.every((item) => item.outcome === "noop"));
    assertCatalogSnapshotUnchanged(realSnapshot, snapshotCatalogFiles(REAL));
  } finally {
    client.close();
  }
});
