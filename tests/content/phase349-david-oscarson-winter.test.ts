import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase349DavidOscarsonWinterContent } from "../../scripts/apply-phase349-david-oscarson-winter-content";
import {
  PHASE349_DAVID_OSCARSON_BRAND_ID,
  PHASE349_WINTER_ID,
  PHASE349_WINTER_SLUG,
  phase349DavidOscarsonWinterPacks,
} from "../../scripts/data/phase349-david-oscarson-winter";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { computePublicationContentHash } from "../../src/lib/publication";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

test("Phase 349 publishes David Oscarson and Winter on an owned copy", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(
      path.join(os.tmpdir(), "fpkg-phase349-david-oscarson-winter-"),
    ),
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
    reviewer: "phase349-david-oscarson-winter-test",
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
    assert.equal(phase349DavidOscarsonWinterPacks.length, 2);
    for (const pack of phase349DavidOscarsonWinterPacks) {
      const minimum = pack.expectedType === "brand" ? 1_200 : 2_000;
      assert.ok(
        fs.readFileSync(path.join(ROOT, pack.markdownFile), "utf8").length >=
          minimum,
      );
      assert.ok(
        new Set(pack.sources.map((source) => source.independenceGroup)).size >=
          5,
      );
    }
    const modelPack = phase349DavidOscarsonWinterPacks.find(
      (pack) => pack.entityId === PHASE349_WINTER_ID,
    );
    assert.ok(modelPack);
    const localPath = modelPack.media[0]?.localPath;
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
      applyPhase349DavidOscarsonWinterContent(client, {
        ...options,
        env: { ...options.env, TURSO_DATABASE_URL: "libsql://remote" },
      }),
      /inherited remote database selection/,
    );
    assert.deepEqual(
      (
        await applyPhase349DavidOscarsonWinterContent(client, options)
      ).entities.map((item) => [item.entityId, item.outcome]),
      [
        [PHASE349_DAVID_OSCARSON_BRAND_ID, "published"],
        [PHASE349_WINTER_ID, "published"],
      ],
    );
    const brand = (
      await client.execute({
        sql: "SELECT id,type,slug,name FROM public_entities WHERE id=?",
        args: [PHASE349_DAVID_OSCARSON_BRAND_ID],
      })
    ).rows[0];
    assert.deepEqual(
      [brand?.id, brand?.type, brand?.slug, brand?.name],
      [
        PHASE349_DAVID_OSCARSON_BRAND_ID,
        "brand",
        "david-oscarson",
        "David Oscarson 大卫·奥斯卡森",
      ],
    );
    const row = (
      await client.execute({
        sql: "SELECT id,type,slug,name,body_md FROM public_entities WHERE id=?",
        args: [PHASE349_WINTER_ID],
      })
    ).rows[0];
    assert.deepEqual(
      [row?.id, row?.type, row?.slug],
      [PHASE349_WINTER_ID, "pen", PHASE349_WINTER_SLUG],
    );
    const body = String(row?.body_md ?? "");
    assert.ok(body.length >= 2_000);
    for (const pattern of [
      /Winter/,
      /128/,
      /Guilloché/,
      /珐琅/,
      /18K/,
      /silver|银|贵金属/i,
      /converter/i,
      /eyedropper/i,
      /O-ring/i,
      /roller ball/i,
    ])
      assert.match(body, pattern);
    assert.doesNotMatch(body, /数据库|canonical|made_by/i);
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
          args: [PHASE349_WINTER_ID, PHASE349_DAVID_OSCARSON_BRAND_ID],
        })
      ).rows[0]?.value,
      1,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
          args: [PHASE349_DAVID_OSCARSON_BRAND_ID, PHASE349_WINTER_ID],
        })
      ).rows[0]?.value,
      1,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS value FROM model_variants WHERE model_entity_id=?",
          args: [PHASE349_WINTER_ID],
        })
      ).rows[0]?.value,
      3,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS value FROM model_specs WHERE entity_id=?",
          args: [PHASE349_WINTER_ID],
        })
      ).rows[0]?.value,
      1,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS value FROM spec_field_evidence evidence JOIN model_specs spec ON spec.id=evidence.model_spec_id WHERE spec.entity_id=? AND evidence.review_status='approved'",
          args: [PHASE349_WINTER_ID],
        })
      ).rows[0]?.value,
      10,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS value FROM media_assets WHERE entity_id=? AND usage_status='primary' AND local_path=?",
          args: [PHASE349_WINTER_ID, localPath],
        })
      ).rows[0]?.value,
      1,
    );
    const hash = await computePublicationContentHash(
      client,
      PHASE349_WINTER_ID,
    );
    assert.deepEqual(
      (
        await client.execute({
          sql: "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind",
          args: [PHASE349_WINTER_ID, hash],
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
        await applyPhase349DavidOscarsonWinterContent(client, options)
      ).entities.map((item) => item.outcome),
      ["noop", "noop"],
    );
    assertCatalogSnapshotUnchanged(snapshot);
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
});
