import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase339EsterbrookJSeriesContent } from "../../scripts/apply-phase339-esterbrook-j-series-content";
import {
  PHASE339_ESTERBROOK_BRAND_ID,
  PHASE339_ESTERBROOK_J_IDS,
  PHASE339_ESTERBROOK_J_SLUGS,
  phase339EsterbrookJSeriesPacks,
} from "../../scripts/data/phase339-esterbrook-j-series";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { computePublicationContentHash } from "../../src/lib/publication";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");
const TARGETS = [
  {
    id: PHASE339_ESTERBROOK_J_IDS.j,
    slug: PHASE339_ESTERBROOK_J_SLUGS.j,
    name: "Vintage Esterbrook Double Jewel J",
    patterns: [/全尺寸/, /Double Jewel/, /Renew-Point/, /杠杆/, /现代 Model J/],
  },
  {
    id: PHASE339_ESTERBROOK_J_IDS.lj,
    slug: PHASE339_ESTERBROOK_J_SLUGS.lj,
    name: "Vintage Esterbrook Double Jewel LJ",
    patterns: [/Long Slender/, /Double Jewel/, /Renew-Point/, /杠杆/, /Icicle/],
  },
  {
    id: PHASE339_ESTERBROOK_J_IDS.sj,
    slug: PHASE339_ESTERBROOK_J_SLUGS.sj,
    name: "Vintage Esterbrook Double Jewel SJ",
    patterns: [
      /Short Slender/,
      /Double Jewel/,
      /Renew-Point/,
      /杠杆/,
      /护士笔/,
    ],
  },
] as const;

test("Phase 339 publishes historical Esterbrook Double Jewel J/LJ/SJ without merging modern Model J", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(
      path.join(os.tmpdir(), "fpkg-phase339-esterbrook-j-series-"),
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
    reviewer: "phase339-esterbrook-j-series-test",
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
    assert.equal(phase339EsterbrookJSeriesPacks.length, 3);
    for (const pack of phase339EsterbrookJSeriesPacks) {
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
    await assert.rejects(
      applyPhase339EsterbrookJSeriesContent(client, {
        ...options,
        env: { ...options.env, TURSO_DATABASE_URL: "libsql://remote" },
      }),
      /inherited remote database selection/,
    );
    const first = await applyPhase339EsterbrookJSeriesContent(client, options);
    assert.deepEqual(
      first.entities.map((item) => item.entityId),
      [PHASE339_ESTERBROOK_BRAND_ID, ...TARGETS.map((target) => target.id)],
    );
    assert.ok(first.entities.every((item) => item.outcome === "published"));

    for (const target of TARGETS) {
      const row = (
        await client.execute({
          sql: "SELECT id,type,slug,name,body_md FROM public_entities WHERE id=?",
          args: [target.id],
        })
      ).rows[0];
      assert.deepEqual(
        [row?.id, row?.type, row?.slug, row?.name],
        [target.id, "pen", target.slug, target.name],
      );
      const body = String(row?.body_md ?? "");
      assert.ok(body.length >= 2_000);
      for (const pattern of target.patterns) assert.match(body, pattern);
      assert.doesNotMatch(body, /数据库|canonical|made_by/i);
      assert.equal(
        Number(
          (
            await client.execute({
              sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
              args: [target.id, PHASE339_ESTERBROOK_BRAND_ID],
            })
          ).rows[0]?.value,
        ),
        1,
      );
      assert.equal(
        Number(
          (
            await client.execute({
              sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
              args: [PHASE339_ESTERBROOK_BRAND_ID, target.id],
            })
          ).rows[0]?.value,
        ),
        1,
      );
      assert.equal(
        Number(
          (
            await client.execute({
              sql: "SELECT count(*) AS value FROM model_specs WHERE entity_id=?",
              args: [target.id],
            })
          ).rows[0]?.value,
        ),
        1,
      );
      assert.ok(
        Number(
          (
            await client.execute({
              sql: "SELECT count(*) AS value FROM spec_field_evidence evidence JOIN model_specs spec ON spec.id=evidence.model_spec_id WHERE spec.entity_id=? AND evidence.review_status='approved'",
              args: [target.id],
            })
          ).rows[0]?.value,
        ) >= 9,
      );
      assert.equal(
        Number(
          (
            await client.execute({
              sql: "SELECT count(*) AS value FROM media_assets WHERE entity_id=? AND usage_status='primary'",
              args: [target.id],
            })
          ).rows[0]?.value,
        ),
        1,
      );
      const hash = await computePublicationContentHash(client, target.id);
      assert.deepEqual(
        (
          await client.execute({
            sql: "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind",
            args: [target.id, hash],
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

    const modern = (
      await client.execute({
        sql: "SELECT type,slug,name,body_md FROM public_entities WHERE slug='esterbrook-model-j'",
        args: [],
      })
    ).rows[0];
    assert.deepEqual(
      [modern?.type, modern?.slug, modern?.name],
      ["pen", "esterbrook-model-j", "Esterbrook Model J"],
    );
    assert.match(String(modern?.body_md ?? ""), /现代 Model J/);
    assert.deepEqual(
      (
        await applyPhase339EsterbrookJSeriesContent(client, options)
      ).entities.map((item) => item.outcome),
      ["noop", "noop", "noop", "noop"],
    );
    assertCatalogSnapshotUnchanged(snapshot);
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
});
