import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase291EsterbrookModelJContent } from "../../scripts/apply-phase291-esterbrook-model-j-content";
import {
  PHASE291_ESTERBROOK_BRAND_ID,
  PHASE291_MODEL_J_ID,
  PHASE291_MODEL_J_SLUG,
  phase291EsterbrookModelJPacks,
} from "../../scripts/data/phase291-esterbrook-model-j";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { computePublicationContentHash } from "../../src/lib/publication";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

test("Phase 291 publishes modern Esterbrook Model J without merging historical J or JR", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase291-esterbrook-model-j-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: snapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options = {
    workspaceRoot: ROOT,
    reviewer: "phase291-esterbrook-model-j-test",
    databasePath: copy.destinationPath,
    ownedRoot,
    protectedCatalogPath: REAL,
    protectedCatalogSnapshot: snapshot,
    env: {
      ...process.env,
      TURSO_DATABASE_URL: "",
      TURSO_AUTH_TOKEN: "",
      FPKG_DATABASE_URL: "",
    },
  } as const;
  try {
    await migrateDatabase(client);
    const pack = phase291EsterbrookModelJPacks[0];
    assert.ok(pack);
    assert.ok(
      fs.readFileSync(path.join(ROOT, pack.markdownFile), "utf8").length >=
        3_000,
    );
    assert.ok(
      new Set(pack.sources.map((source) => source.independenceGroup)).size >= 4,
    );
    const localPath = pack.media[0]?.localPath;
    assert.ok(localPath);
    const svg = fs.readFileSync(
      path.join(ROOT, "public", localPath.replace(/^\//, "")),
      "utf8",
    );
    for (const marker of [
      /factual-svg/i,
      /product-photo="false"/i,
      /logo="false"/i,
      /to-scale="false"/i,
      /colour-proof="false"/i,
    ])
      assert.match(svg, marker);
    await assert.rejects(
      applyPhase291EsterbrookModelJContent(client, {
        ...options,
        env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
      }),
      /inherited remote database selection/,
    );
    const firstApply = (
      await applyPhase291EsterbrookModelJContent(client, options)
    ).entities.map((item) => [item.entityId, item.outcome]);
    assert.equal(
      firstApply.find((item) => item[0] === PHASE291_MODEL_J_ID)?.[1],
      "published",
    );
    const row = (
      await client.execute({
        sql: "SELECT id,type,slug,name,body_md FROM public_entities WHERE id=?",
        args: [PHASE291_MODEL_J_ID],
      })
    ).rows[0];
    assert.deepEqual(
      [row?.id, row?.type, row?.slug],
      [PHASE291_MODEL_J_ID, "pen", PHASE291_MODEL_J_SLUG],
    );
    const body = String(row?.body_md ?? "");
    assert.ok(body.length >= 2_000);
    for (const pattern of [
      /历史 J/,
      /现代 Model J/,
      /SEM ebonite/,
      /JoWo #6/,
      /cartridge\/converter/i,
      /螺纹帽/,
      /JR/,
      /Estie/,
    ])
      assert.match(body, pattern);
    assert.doesNotMatch(body, /数据库|canonical|made_by/i);
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
          args: [PHASE291_MODEL_J_ID, PHASE291_ESTERBROOK_BRAND_ID],
        })
      ).rows[0]?.value,
      1,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
          args: [PHASE291_ESTERBROOK_BRAND_ID, PHASE291_MODEL_J_ID],
        })
      ).rows[0]?.value,
      1,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS value FROM model_variants WHERE model_entity_id=?",
          args: [PHASE291_MODEL_J_ID],
        })
      ).rows[0]?.value,
      3,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS value FROM model_specs WHERE entity_id=?",
          args: [PHASE291_MODEL_J_ID],
        })
      ).rows[0]?.value,
      1,
    );
    const specEvidence = Number(
      (
        await client.execute({
          sql: "SELECT count(*) AS value FROM spec_field_evidence evidence JOIN model_specs spec ON spec.id=evidence.model_spec_id WHERE spec.entity_id=? AND evidence.review_status='approved'",
          args: [PHASE291_MODEL_J_ID],
        })
      ).rows[0]?.value,
    );
    assert.ok(
      specEvidence >= 9,
      `expected at least 9 approved spec evidence rows, got ${specEvidence}`,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS value FROM media_assets WHERE entity_id=? AND usage_status='primary' AND local_path=?",
          args: [PHASE291_MODEL_J_ID, localPath],
        })
      ).rows[0]?.value,
      1,
    );
    const hash = await computePublicationContentHash(
      client,
      PHASE291_MODEL_J_ID,
    );
    assert.deepEqual(
      (
        await client.execute({
          sql: "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind",
          args: [PHASE291_MODEL_J_ID, hash],
        })
      ).rows.map((item) => [String(item.review_kind), String(item.status)]),
      [
        ["fact", "approved"],
        ["language", "approved"],
        ["media", "approved"],
        ["publication", "approved"],
      ],
    );
    assert.deepEqual(
      (
        await applyPhase291EsterbrookModelJContent(client, options)
      ).entities.map((item) => item.outcome),
      ["noop", "noop"],
    );
    assertCatalogSnapshotUnchanged(snapshot);
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
});
