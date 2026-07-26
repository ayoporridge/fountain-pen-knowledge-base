import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase254StDupontLineDContent } from "../../scripts/apply-phase254-st-dupont-line-d-content";
import {
  PHASE254_BRAND_SLUG,
  PHASE254_LINE_D_ID,
  PHASE254_LINE_D_SLUG,
  PHASE254_ST_DUPONT_BRAND_ID,
  phase254StDupontPacks,
} from "../../scripts/data/phase254-st-dupont-line-d-eternity";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { computePublicationContentHash } from "../../src/lib/publication";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

test("Phase 254 publishes S.T. Dupont Line D Eternity with exact topology", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase254-st-dupont-")),
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
    reviewer: "phase254-st-dupont-test",
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
    assert.equal(phase254StDupontPacks.length, 2);
    const brandPack = phase254StDupontPacks.find(
      (item) => item.entityId === PHASE254_ST_DUPONT_BRAND_ID,
    );
    const modelPack = phase254StDupontPacks.find(
      (item) => item.entityId === PHASE254_LINE_D_ID,
    );
    assert.ok(brandPack);
    assert.ok(modelPack);
    assert.ok(
      fs.readFileSync(path.join(ROOT, brandPack.markdownFile), "utf8").length >=
        1_200,
    );
    assert.ok(
      fs.readFileSync(path.join(ROOT, modelPack.markdownFile), "utf8").length >=
        2_000,
    );
    assert.ok(
      new Set(modelPack.sources.map((source) => source.independenceGroup))
        .size >= 4,
    );
    const localPath = modelPack.media[0]?.localPath;
    assert.ok(localPath);
    const svg = fs.readFileSync(
      path.join(ROOT, "public", localPath.replace(/^\//, "")),
      "utf8",
    );
    assert.match(svg, /non-photo/i);
    assert.match(svg, /non-logo/i);
    assert.match(svg, /not-to-scale/i);
    assert.match(svg, /non-colour-proof/i);
    await assert.rejects(
      applyPhase254StDupontLineDContent(client, {
        ...options,
        env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
      }),
      /inherited remote database selection/,
    );
    assert.deepEqual(
      (await applyPhase254StDupontLineDContent(client, options)).entities.map(
        (item) => item.outcome,
      ),
      ["published", "published"],
    );
    const rows = (
      await client.execute({
        sql: "SELECT id,type,slug,name,body_md FROM public_entities WHERE id IN (?,?)",
        args: [PHASE254_ST_DUPONT_BRAND_ID, PHASE254_LINE_D_ID],
      })
    ).rows;
    assert.equal(rows.length, 2);
    const body = String(
      rows.find((row) => row.id === PHASE254_LINE_D_ID)?.body_md ?? "",
    );
    assert.ok(body.length >= 2_000);
    for (const pattern of [
      /Line D/i,
      /420216L/,
      /14K/,
      /Wings/,
      /plunger/i,
      /Faverges/,
      /剑形夹/,
    ])
      assert.match(body, pattern);
    assert.doesNotMatch(body, /数据库|canonical|made_by/i);
    assert.equal(
      (
        await client.execute({
          sql: "SELECT slug FROM entities WHERE id=?",
          args: [PHASE254_ST_DUPONT_BRAND_ID],
        })
      ).rows[0]?.slug,
      PHASE254_BRAND_SLUG,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT slug FROM entities WHERE id=?",
          args: [PHASE254_LINE_D_ID],
        })
      ).rows[0]?.slug,
      PHASE254_LINE_D_SLUG,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
          args: [PHASE254_LINE_D_ID, PHASE254_ST_DUPONT_BRAND_ID],
        })
      ).rows[0]?.value,
      1,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
          args: [PHASE254_ST_DUPONT_BRAND_ID, PHASE254_LINE_D_ID],
        })
      ).rows[0]?.value,
      1,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS value FROM model_variants WHERE model_entity_id=?",
          args: [PHASE254_LINE_D_ID],
        })
      ).rows[0]?.value,
      2,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS value FROM model_specs WHERE entity_id=?",
          args: [PHASE254_LINE_D_ID],
        })
      ).rows[0]?.value,
      1,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS value FROM spec_field_evidence evidence JOIN model_specs spec ON spec.id=evidence.model_spec_id WHERE spec.entity_id=? AND evidence.review_status='approved'",
          args: [PHASE254_LINE_D_ID],
        })
      ).rows[0]?.value,
      9,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS value FROM media_assets WHERE entity_id=? AND usage_status='primary' AND local_path=?",
          args: [PHASE254_LINE_D_ID, localPath],
        })
      ).rows[0]?.value,
      1,
    );
    const hash = await computePublicationContentHash(
      client,
      PHASE254_LINE_D_ID,
    );
    assert.deepEqual(
      (
        await client.execute({
          sql: "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind",
          args: [PHASE254_LINE_D_ID, hash],
        })
      ).rows.map((row) => [String(row.review_kind), String(row.status)]),
      [
        ["fact", "approved"],
        ["language", "approved"],
        ["media", "approved"],
        ["publication", "approved"],
      ],
    );
    assert.deepEqual(
      (await applyPhase254StDupontLineDContent(client, options)).entities.map(
        (item) => item.outcome,
      ),
      ["noop", "noop"],
    );
    assertCatalogSnapshotUnchanged(snapshot);
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
});
