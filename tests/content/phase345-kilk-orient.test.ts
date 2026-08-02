import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase345KilkOrientContent } from "../../scripts/apply-phase345-kilk-orient-content";
import {
  PHASE345_KILK_BRAND_ID,
  PHASE345_ORIENT_ID,
  PHASE345_ORIENT_SLUG,
  phase345KilkOrientPacks,
} from "../../scripts/data/phase345-kilk-orient";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { computePublicationContentHash } from "../../src/lib/publication";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

test("Phase 345 publishes Kilk and Orient on an owned copy", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase345-kilk-orient-")),
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
    reviewer: "phase345-kilk-orient-test",
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
    assert.equal(phase345KilkOrientPacks.length, 2);
    for (const pack of phase345KilkOrientPacks) {
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
    const modelPack = phase345KilkOrientPacks.find(
      (pack) => pack.entityId === PHASE345_ORIENT_ID,
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
      applyPhase345KilkOrientContent(client, {
        ...options,
        env: { ...options.env, TURSO_DATABASE_URL: "libsql://remote" },
      }),
      /inherited remote database selection/,
    );
    assert.deepEqual(
      (await applyPhase345KilkOrientContent(client, options)).entities.map(
        (item) => [item.entityId, item.outcome],
      ),
      [
        [PHASE345_KILK_BRAND_ID, "published"],
        [PHASE345_ORIENT_ID, "published"],
      ],
    );
    const brand = (
      await client.execute({
        sql: "SELECT id,type,slug FROM public_entities WHERE id=?",
        args: [PHASE345_KILK_BRAND_ID],
      })
    ).rows[0];
    assert.deepEqual(
      [brand?.id, brand?.type, brand?.slug],
      [PHASE345_KILK_BRAND_ID, "brand", "kilk"],
    );
    const row = (
      await client.execute({
        sql: "SELECT id,type,slug,name,body_md FROM public_entities WHERE id=?",
        args: [PHASE345_ORIENT_ID],
      })
    ).rows[0];
    assert.deepEqual(
      [row?.id, row?.type, row?.slug],
      [PHASE345_ORIENT_ID, "pen", PHASE345_ORIENT_SLUG],
    );
    const body = String(row?.body_md ?? "");
    assert.ok(body.length >= 2_000);
    for (const pattern of [
      /Kilk/,
      /Orient/,
      /925/,
      /Bock/i,
      /#6/,
      /converter/i,
      /国际/,
      /树脂/,
      /140/,
      /20\.5/,
      /向日葵/,
    ])
      assert.match(body, pattern);
    assert.doesNotMatch(body, /数据库|canonical|made_by/i);
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
          args: [PHASE345_ORIENT_ID, PHASE345_KILK_BRAND_ID],
        })
      ).rows[0]?.value,
      1,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
          args: [PHASE345_KILK_BRAND_ID, PHASE345_ORIENT_ID],
        })
      ).rows[0]?.value,
      1,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS value FROM model_variants WHERE model_entity_id=?",
          args: [PHASE345_ORIENT_ID],
        })
      ).rows[0]?.value,
      4,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS value FROM model_specs WHERE entity_id=?",
          args: [PHASE345_ORIENT_ID],
        })
      ).rows[0]?.value,
      1,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS value FROM spec_field_evidence evidence JOIN model_specs spec ON spec.id=evidence.model_spec_id WHERE spec.entity_id=? AND evidence.review_status='approved'",
          args: [PHASE345_ORIENT_ID],
        })
      ).rows[0]?.value,
      10,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS value FROM media_assets WHERE entity_id=? AND usage_status='primary' AND local_path=?",
          args: [PHASE345_ORIENT_ID, localPath],
        })
      ).rows[0]?.value,
      1,
    );
    const hash = await computePublicationContentHash(
      client,
      PHASE345_ORIENT_ID,
    );
    assert.deepEqual(
      (
        await client.execute({
          sql: "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind",
          args: [PHASE345_ORIENT_ID, hash],
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
      (await applyPhase345KilkOrientContent(client, options)).entities.map(
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
