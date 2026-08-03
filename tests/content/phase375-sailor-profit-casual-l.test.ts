import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase375SailorProfitCasualLContent } from "../../scripts/apply-phase375-sailor-profit-casual-l-content";
import {
  PHASE375_BASIS_ID,
  PHASE375_BASIS_SLUG,
  PHASE375_CASUAL_ID,
  PHASE375_CASUAL_SLUG,
  PHASE375_SAILOR_BRAND_ID,
  PHASE375_STABLE_ID,
  PHASE375_STABLE_SLUG,
  phase375SailorProfitCasualLPacks,
} from "../../scripts/data/phase375-sailor-profit-casual-l";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

const MODEL_CASES = [
  {
    id: PHASE375_CASUAL_ID,
    slug: PHASE375_CASUAL_SLUG,
    patterns: [
      /11-0820-220/,
      /11-0820-660/,
      /不锈钢/,
      /Gold IP/,
      /PMMA/,
      /19\.8 g/,
      /维护/,
      /选购/,
    ],
    weight: /19\.8/,
  },
  {
    id: PHASE375_BASIS_ID,
    slug: PHASE375_BASIS_SLUG,
    patterns: [
      /11-0822-220/,
      /11-0822-660/,
      /帽环/,
      /不锈钢/,
      /Gold IP/,
      /PMMA/,
      /19\.8 g/,
      /维护/,
      /选购/,
    ],
    weight: /19\.8/,
  },
  {
    id: PHASE375_STABLE_ID,
    slug: PHASE375_STABLE_SLUG,
    patterns: [
      /11-0825-220/,
      /11-0825-660/,
      /黄铜/,
      /低重心/,
      /Gold IP/,
      /PMMA/,
      /23\.9 g/,
      /维护/,
      /选购/,
    ],
    weight: /23\.9/,
  },
] as const;

test("Phase 375 publishes Sailor Profit Casual L models on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(
      path.join(os.tmpdir(), "fpkg-phase375-sailor-profit-casual-l-"),
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
    reviewer: "phase375-sailor-profit-casual-l-test",
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
    for (const pack of phase375SailorProfitCasualLPacks.filter(
      (item) => item.expectedType === "pen",
    )) {
      const localPath = pack.media[0]?.localPath;
      assert.ok(localPath);
      assert.ok(pack.media[0]?.sourceUrl);
      const markdown = fs.readFileSync(
        path.join(ROOT, pack.markdownFile),
        "utf8",
      );
      assert.ok(markdown.length >= 4_000);
      assert.ok(
        new Set(pack.sources.map((source) => source.independenceGroup)).size >=
          6,
      );
      const svg = fs.readFileSync(
        path.join(ROOT, "public", localPath.replace(/^\//, "")),
        "utf8",
      );
      for (const marker of [
        /non-photo/i,
        /non-logo/i,
        /not-to-scale/i,
        /non-colour-proof/i,
      ]) {
        assert.match(svg, marker);
      }
    }
    await assert.rejects(
      applyPhase375SailorProfitCasualLContent(client, {
        ...options,
        env: {
          ...options.env,
          FPKG_DATABASE_URL: "https://remote.invalid/catalog",
        },
      }),
      /refuses inherited remote database selection/,
    );

    const first = await applyPhase375SailorProfitCasualLContent(
      client,
      options,
    );
    for (const model of MODEL_CASES) {
      assert.equal(
        first.entities.find((item) => item.entityId === model.id)?.outcome,
        "published",
      );
      const entity = (
        await client.execute({
          sql: "SELECT id,type,slug,name,body_md FROM public_entities WHERE id=?",
          args: [model.id],
        })
      ).rows[0];
      assert.equal(String(entity?.type), "pen");
      assert.equal(String(entity?.slug), model.slug);
      const body = String(entity?.body_md ?? "");
      for (const pattern of model.patterns) assert.match(body, pattern);
      assert.doesNotMatch(body, /canonical|made_by|数据库|仓库/i);
      const spec = (
        await client.execute({
          sql: "SELECT brand_entity_id,nib,fill_system,material,dimensions,weight,status FROM model_specs WHERE entity_id=?",
          args: [model.id],
        })
      ).rows[0];
      assert.equal(String(spec?.brand_entity_id), PHASE375_SAILOR_BRAND_ID);
      assert.match(String(spec?.fill_system), /墨囊／转换器/);
      assert.match(String(spec?.nib), /不锈钢/);
      assert.match(String(spec?.material), /PMMA/);
      assert.match(String(spec?.dimensions), /141/);
      assert.match(String(spec?.weight), model.weight);
      assert.equal(
        Number(
          (
            await client.execute({
              sql: "SELECT count(*) AS n FROM model_variants WHERE model_entity_id=?",
              args: [model.id],
            })
          ).rows[0]?.n,
        ),
        4,
      );
      assert.equal(
        Number(
          (
            await client.execute({
              sql: "SELECT count(*) AS n FROM entity_references WHERE entity_id=?",
              args: [model.id],
            })
          ).rows[0]?.n,
        ),
        9,
      );
      const media = (
        await client.execute({
          sql: "SELECT local_path,source_url,usage_status FROM media_assets WHERE entity_id=?",
          args: [model.id],
        })
      ).rows[0];
      const pack = phase375SailorProfitCasualLPacks.find(
        (item) => item.entityId === model.id,
      );
      assert.equal(String(media?.local_path), pack?.media[0]?.localPath);
      assert.equal(String(media?.source_url), pack?.media[0]?.sourceUrl);
      assert.equal(String(media?.usage_status), "primary");
      const reviewKinds = (
        await client.execute({
          sql: "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? ORDER BY review_kind",
          args: [model.id],
        })
      ).rows.map((row) => `${String(row.review_kind)}:${String(row.status)}`);
      assert.deepEqual(reviewKinds, [
        "fact:approved",
        "language:approved",
        "media:approved",
        "publication:approved",
      ]);
    }
    for (const model of MODEL_CASES) {
      assert.equal(
        Number(
          (
            await client.execute({
              sql: "SELECT count(*) AS n FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
              args: [model.id, PHASE375_SAILOR_BRAND_ID],
            })
          ).rows[0]?.n,
        ),
        1,
      );
      assert.equal(
        Number(
          (
            await client.execute({
              sql: "SELECT count(*) AS n FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
              args: [PHASE375_SAILOR_BRAND_ID, model.id],
            })
          ).rows[0]?.n,
        ),
        1,
      );
    }
    const replay = await applyPhase375SailorProfitCasualLContent(
      client,
      options,
    );
    for (const entityId of [
      PHASE375_SAILOR_BRAND_ID,
      PHASE375_CASUAL_ID,
      PHASE375_BASIS_ID,
      PHASE375_STABLE_ID,
    ]) {
      assert.equal(
        replay.entities.find((item) => item.entityId === entityId)?.outcome,
        "noop",
      );
    }
    assertCatalogSnapshotUnchanged(snapshot, snapshotCatalogFiles(REAL));
  } finally {
    client.close();
  }
});
