import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase346JinhaoX450X750Content } from "../../scripts/apply-phase346-jinhao-x450-x750-content";
import { PHASE63_JINHAO_BRAND_ID } from "../../scripts/data/phase63-jinhao-split";
import {
  PHASE346_X450_ID,
  PHASE346_X450_SLUG,
  PHASE346_X750_ID,
  PHASE346_X750_SLUG,
  phase346JinhaoX450X750Packs,
} from "../../scripts/data/phase346-jinhao-x450-x750";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { computePublicationContentHash } from "../../src/lib/publication";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

test("Phase 346 publishes Jinhao X450 and X750 on an owned copy", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase346-jinhao-")),
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
    reviewer: "phase346-jinhao-x450-x750-test",
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
    assert.equal(phase346JinhaoX450X750Packs.length, 3);
    const x450Pack = phase346JinhaoX450X750Packs.find(
      (pack) => pack.entityId === PHASE346_X450_ID,
    );
    const x750Pack = phase346JinhaoX450X750Packs.find(
      (pack) => pack.entityId === PHASE346_X750_ID,
    );
    assert.ok(x450Pack);
    assert.ok(x750Pack);
    for (const pack of [x450Pack, x750Pack]) {
      assert.ok(
        fs.readFileSync(path.join(ROOT, pack.markdownFile), "utf8").length >=
          2_000,
      );
      assert.ok(
        new Set(pack.sources.map((source) => source.independenceGroup)).size >=
          5,
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
    }
    const brandBefore = (
      await client.execute({
        sql: "SELECT body_md,summary FROM entities WHERE id=?",
        args: [PHASE63_JINHAO_BRAND_ID],
      })
    ).rows[0];
    await assert.rejects(
      applyPhase346JinhaoX450X750Content(client, {
        ...options,
        env: { ...options.env, TURSO_DATABASE_URL: "libsql://remote" },
      }),
      /inherited remote database selection/,
    );
    assert.deepEqual(
      (await applyPhase346JinhaoX450X750Content(client, options)).entities.map(
        (item) => [item.entityId, item.outcome],
      ),
      [
        [PHASE63_JINHAO_BRAND_ID, "published"],
        [PHASE346_X450_ID, "published"],
        [PHASE346_X750_ID, "published"],
      ],
    );
    const rows = (
      await client.execute({
        sql: "SELECT id,type,slug,name,body_md FROM public_entities WHERE id IN (?,?) ORDER BY id",
        args: [PHASE346_X450_ID, PHASE346_X750_ID],
      })
    ).rows;
    assert.equal(rows.length, 2);
    const x450 = rows.find((row) => String(row.id) === PHASE346_X450_ID);
    const x750 = rows.find((row) => String(row.id) === PHASE346_X750_ID);
    assert.deepEqual([x450?.type, x450?.slug], ["pen", PHASE346_X450_SLUG]);
    assert.deepEqual([x750?.type, x750?.slug], ["pen", PHASE346_X750_SLUG]);
    const bodyChecks: Array<[unknown, RegExp[]]> = [
      [x450?.body_md, [/X450/, /三角/, /#6/, /转换器/, /141/, /42/, /仿品/]],
      [x750?.body_md, [/X750/, /卡扣/, /#6/, /标准国际/, /141/, /158/, /36/]],
    ];
    for (const [value, patterns] of bodyChecks) {
      const body = String(value ?? "");
      assert.ok(body.length >= 2_000);
      for (const pattern of patterns) assert.match(body, pattern);
      assert.doesNotMatch(body, /数据库|canonical|made_by/i);
    }
    for (const [modelId, variantCount] of [
      [PHASE346_X450_ID, 4],
      [PHASE346_X750_ID, 4],
    ] as const) {
      assert.equal(
        (
          await client.execute({
            sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
            args: [modelId, PHASE63_JINHAO_BRAND_ID],
          })
        ).rows[0]?.value,
        1,
      );
      assert.equal(
        (
          await client.execute({
            sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
            args: [PHASE63_JINHAO_BRAND_ID, modelId],
          })
        ).rows[0]?.value,
        1,
      );
      assert.equal(
        (
          await client.execute({
            sql: "SELECT count(*) AS value FROM model_variants WHERE model_entity_id=?",
            args: [modelId],
          })
        ).rows[0]?.value,
        variantCount,
      );
      assert.equal(
        (
          await client.execute({
            sql: "SELECT count(*) AS value FROM model_specs WHERE entity_id=?",
            args: [modelId],
          })
        ).rows[0]?.value,
        1,
      );
      assert.equal(
        (
          await client.execute({
            sql: "SELECT count(*) AS value FROM spec_field_evidence evidence JOIN model_specs spec ON spec.id=evidence.model_spec_id WHERE spec.entity_id=? AND evidence.review_status='approved'",
            args: [modelId],
          })
        ).rows[0]?.value,
        10,
      );
      const pack: (typeof phase346JinhaoX450X750Packs)[number] =
        modelId === PHASE346_X450_ID ? x450Pack : x750Pack;
      const localPath = pack.media[0]?.localPath;
      assert.ok(localPath);
      assert.equal(
        (
          await client.execute({
            sql: "SELECT count(*) AS value FROM media_assets WHERE entity_id=? AND usage_status='primary' AND local_path=?",
            args: [modelId, localPath],
          })
        ).rows[0]?.value,
        1,
      );
      const hash = await computePublicationContentHash(client, modelId);
      assert.deepEqual(
        (
          await client.execute({
            sql: "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind",
            args: [modelId, hash],
          })
        ).rows.map((item) => [String(item.review_kind), String(item.status)]),
        [
          ["fact", "approved"],
          ["language", "approved"],
          ["media", "approved"],
          ["publication", "approved"],
        ],
      );
    }
    assert.deepEqual(
      (
        await client.execute({
          sql: "SELECT body_md,summary FROM entities WHERE id=?",
          args: [PHASE63_JINHAO_BRAND_ID],
        })
      ).rows[0],
      brandBefore,
    );
    assert.deepEqual(
      (await applyPhase346JinhaoX450X750Content(client, options)).entities.map(
        (item) => item.outcome,
      ),
      ["noop", "noop", "noop"],
    );
    assertCatalogSnapshotUnchanged(snapshot);
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
});
