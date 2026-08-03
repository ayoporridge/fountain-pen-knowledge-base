import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase376SailorHiroshima115thContent } from "../../scripts/apply-phase376-sailor-hiroshima-115th-content";
import {
  PHASE376_MOMIJI_ID,
  PHASE376_MOMIJI_SLUG,
  PHASE376_SAILOR_BRAND_ID,
  PHASE376_YOSEGI_ID,
  PHASE376_YOSEGI_SLUG,
  phase376SailorHiroshima115thPacks,
} from "../../scripts/data/phase376-sailor-hiroshima-115th";
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
    id: PHASE376_YOSEGI_ID,
    slug: PHASE376_YOSEGI_SLUG,
    patterns: [
      /寄木细工/,
      /枫木/,
      /银杏/,
      /阿部槲/,
      /34\.0 g/,
      /限量 115/,
      /2026-08-06/,
      /维护/,
      /选购/,
    ],
    material: /寄木细工/,
    weight: /34\.0/,
  },
  {
    id: PHASE376_MOMIJI_ID,
    slug: PHASE376_MOMIJI_SLUG,
    patterns: [
      /モミジ/,
      /枫木/,
      /油仕上/,
      /34\.5 g/,
      /1,150/,
      /34 g/,
      /冲突/,
      /2026-08-06/,
      /维护/,
      /选购/,
    ],
    material: /枫木/,
    weight: /34\.5/,
  },
] as const;

test("Phase 376 publishes Sailor HIROSHIMA 115th models on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase376-sailor-hiroshima-")),
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
    reviewer: "phase376-sailor-hiroshima-115th-test",
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
    for (const pack of phase376SailorHiroshima115thPacks.filter(
      (item) => item.expectedType === "pen",
    )) {
      const markdown = fs.readFileSync(
        path.join(ROOT, pack.markdownFile),
        "utf8",
      );
      assert.ok(markdown.length >= 5_000);
      assert.ok(
        new Set(pack.sources.map((source) => source.independenceGroup)).size >=
          6,
      );
      assert.equal(pack.variants?.length, 1);
      const localPath = pack.media[0]?.localPath;
      assert.ok(localPath);
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
      applyPhase376SailorHiroshima115thContent(client, {
        ...options,
        env: {
          ...options.env,
          TURSO_DATABASE_URL: "https://remote.invalid/catalog",
        },
      }),
      /refuses inherited remote database selection/,
    );

    const first = await applyPhase376SailorHiroshima115thContent(
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
      assert.equal(String(spec?.brand_entity_id), PHASE376_SAILOR_BRAND_ID);
      assert.match(String(spec?.nib), /21金.*MF/);
      assert.match(String(spec?.fill_system), /墨囊／转换器/);
      assert.match(String(spec?.material), model.material);
      assert.match(String(spec?.dimensions), /18\.5.*134/);
      assert.match(String(spec?.weight), model.weight);
      assert.match(String(spec?.status), /2026-08-06/);
      assert.equal(
        Number(
          (
            await client.execute({
              sql: "SELECT count(*) AS n FROM model_variants WHERE model_entity_id=?",
              args: [model.id],
            })
          ).rows[0]?.n,
        ),
        1,
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
      const pack = phase376SailorHiroshima115thPacks.find(
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
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS n FROM fact_conflicts WHERE entity_id=?",
            args: [PHASE376_MOMIJI_ID],
          })
        ).rows[0]?.n,
      ),
      2,
    );
    for (const model of MODEL_CASES) {
      assert.equal(
        Number(
          (
            await client.execute({
              sql: "SELECT count(*) AS n FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
              args: [model.id, PHASE376_SAILOR_BRAND_ID],
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
              args: [PHASE376_SAILOR_BRAND_ID, model.id],
            })
          ).rows[0]?.n,
        ),
        1,
      );
    }
    const replay = await applyPhase376SailorHiroshima115thContent(
      client,
      options,
    );
    for (const entityId of [
      PHASE376_SAILOR_BRAND_ID,
      PHASE376_YOSEGI_ID,
      PHASE376_MOMIJI_ID,
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
