import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase380SailorShakkyoContent } from "../../scripts/apply-phase380-sailor-shakkyo-content";
import {
  PHASE380_SAILOR_BRAND_ID,
  PHASE380_SHAKKYO_ID,
  PHASE380_SHAKKYO_SLUG,
  phase380SailorShakkyoPacks,
} from "../../scripts/data/phase380-sailor-shakkyo";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

test("Phase 380 publishes Sailor Shakkyo 10-8099 on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase380-sailor-shakkyo-")),
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
    reviewer: "phase380-sailor-shakkyo-test",
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
    const pack = phase380SailorShakkyoPacks.find(
      (candidate) => candidate.expectedType === "pen",
    );
    assert.ok(pack);
    const markdown = fs.readFileSync(
      path.join(ROOT, pack.markdownFile),
      "utf8",
    );
    assert.ok(markdown.length >= 4_500);
    assert.ok(
      new Set(pack.sources.map((source) => source.independenceGroup)).size >= 4,
    );
    assert.equal(pack.variants?.length, 2);
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
    ])
      assert.match(svg, marker);

    await assert.rejects(
      applyPhase380SailorShakkyoContent(client, {
        ...options,
        env: {
          ...options.env,
          TURSO_DATABASE_URL: "https://remote.invalid/catalog",
        },
      }),
      /refuses inherited remote database selection/,
    );
    const first = await applyPhase380SailorShakkyoContent(client, options);
    assert.equal(
      first.entities.find((item) => item.entityId === PHASE380_SHAKKYO_ID)
        ?.outcome,
      "published",
    );
    const entity = (
      await client.execute({
        sql: "SELECT id,type,slug,name,body_md FROM public_entities WHERE id=?",
        args: [PHASE380_SHAKKYO_ID],
      })
    ).rows[0];
    assert.equal(String(entity?.type), "pen");
    assert.equal(String(entity?.slug), PHASE380_SHAKKYO_SLUG);
    assert.equal(
      String(entity?.name),
      "写乐 Sailor King of Pen ‘Shakkyo’（10-8099）",
    );
    const body = String(entity?.body_md ?? "");
    for (const pattern of [
      /Shakkyo/i,
      /10-8099/,
      /Isshu Tamura/,
      /能乐|Noh/i,
      /石桥/,
      /狮子/,
      /牡丹/,
      /硬橡胶|ebonite/i,
      /KOP/,
      /双色/,
      /21K/,
      /墨囊／转换器|converter/i,
      /φ18×153\.5/,
      /箱根寄木/,
      /10-8099-420/,
      /10-8099-620/,
      /维护|清洗|清洁/,
      /选购/,
      /CHF 7,500/,
    ])
      assert.match(body, pattern);
    assert.doesNotMatch(body, /canonical|made_by|数据库|仓库/i);

    const spec = (
      await client.execute({
        sql: "SELECT brand_entity_id,nib,fill_system,material,dimensions,weight,status FROM model_specs WHERE entity_id=?",
        args: [PHASE380_SHAKKYO_ID],
      })
    ).rows[0];
    assert.equal(String(spec?.brand_entity_id), PHASE380_SAILOR_BRAND_ID);
    assert.match(String(spec?.nib), /21K.*KOP|KOP.*21K/i);
    assert.match(String(spec?.fill_system), /墨囊.*转换器|converter/i);
    assert.match(String(spec?.material), /硬橡胶|ebonite/i);
    assert.match(String(spec?.dimensions), /18.*153\.5/);
    assert.match(String(spec?.weight), /未列|not/i);

    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS n FROM model_variants WHERE model_entity_id=?",
            args: [PHASE380_SHAKKYO_ID],
          })
        ).rows[0]?.n,
      ),
      2,
    );
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS n FROM entity_references WHERE entity_id=?",
            args: [PHASE380_SHAKKYO_ID],
          })
        ).rows[0]?.n,
      ),
      pack.sources.length,
    );
    const media = (
      await client.execute({
        sql: "SELECT local_path,source_url,usage_status FROM media_assets WHERE entity_id=?",
        args: [PHASE380_SHAKKYO_ID],
      })
    ).rows[0];
    assert.equal(String(media?.local_path), pack.media[0]?.localPath);
    assert.equal(String(media?.source_url), pack.media[0]?.sourceUrl);
    assert.equal(String(media?.usage_status), "primary");
    const reviewKinds = (
      await client.execute({
        sql: "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? ORDER BY review_kind",
        args: [PHASE380_SHAKKYO_ID],
      })
    ).rows.map((row) => `${String(row.review_kind)}:${String(row.status)}`);
    assert.deepEqual(reviewKinds, [
      "fact:approved",
      "language:approved",
      "media:approved",
      "publication:approved",
    ]);
    const groupCounts = (
      await client.execute({
        sql: "SELECT primary_archive_group_count,professional_secondary_group_count FROM publication_v2_source_group_counts WHERE entity_id=?",
        args: [PHASE380_SHAKKYO_ID],
      })
    ).rows[0];
    assert.ok(Number(groupCounts?.primary_archive_group_count) >= 1);
    assert.ok(Number(groupCounts?.professional_secondary_group_count) >= 1);
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS n FROM fact_conflicts WHERE entity_id=?",
            args: [PHASE380_SHAKKYO_ID],
          })
        ).rows[0]?.n,
      ),
      0,
    );
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS n FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
            args: [PHASE380_SHAKKYO_ID, PHASE380_SAILOR_BRAND_ID],
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
            args: [PHASE380_SAILOR_BRAND_ID, PHASE380_SHAKKYO_ID],
          })
        ).rows[0]?.n,
      ),
      1,
    );
    const replay = await applyPhase380SailorShakkyoContent(client, options);
    assert.equal(
      replay.entities.find((item) => item.entityId === PHASE380_SHAKKYO_ID)
        ?.outcome,
      "noop",
    );
    assertCatalogSnapshotUnchanged(snapshot, snapshotCatalogFiles(REAL));
  } finally {
    client.close();
  }
});
