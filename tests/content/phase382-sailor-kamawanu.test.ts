import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase382SailorKamawanuContent } from "../../scripts/apply-phase382-sailor-kamawanu-content";
import {
  PHASE382_KAMAWANU_ID,
  PHASE382_KAMAWANU_SLUG,
  PHASE382_SAILOR_BRAND_ID,
  phase382SailorKamawanuPacks,
} from "../../scripts/data/phase382-sailor-kamawanu";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

test("Phase 382 publishes Sailor x Kamawanu 10-9895 on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase382-sailor-kamawanu-")),
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
    reviewer: "phase382-sailor-kamawanu-test",
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
    const pack = phase382SailorKamawanuPacks.find(
      (candidate) => candidate.expectedType === "pen",
    );
    assert.ok(pack);
    const markdown = fs.readFileSync(
      path.join(ROOT, pack.markdownFile),
      "utf8",
    );
    assert.ok(markdown.length >= 4_300);
    assert.ok(
      new Set(pack.sources.map((source) => source.independenceGroup)).size >= 4,
    );
    assert.equal(pack.variants?.length, 10);
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
      applyPhase382SailorKamawanuContent(client, {
        ...options,
        env: {
          ...options.env,
          TURSO_DATABASE_URL: "https://remote.invalid/catalog",
        },
      }),
      /refuses inherited remote database selection/,
    );
    const first = await applyPhase382SailorKamawanuContent(client, options);
    assert.equal(
      first.entities.find((item) => item.entityId === PHASE382_KAMAWANU_ID)
        ?.outcome,
      "published",
    );
    const entity = (
      await client.execute({
        sql: "SELECT id,type,slug,name,body_md FROM public_entities WHERE id=?",
        args: [PHASE382_KAMAWANU_ID],
      })
    ).rows[0];
    assert.equal(String(entity?.type), "pen");
    assert.equal(String(entity?.slug), PHASE382_KAMAWANU_SLUG);
    assert.equal(String(entity?.name), "写乐 Sailor x Kamawanu（10-9895）");
    const body = String(entity?.body_md ?? "");
    for (const pattern of [
      /Sailor x Kamawanu/i,
      /Kamawanu/i,
      /10-9895/,
      /TSURUMARU-UME/,
      /FUGU-TATEOKE/,
      /手拭巾|tenugui/i,
      /全球 400 支/,
      /PMMA Resin/i,
      /墨囊／转换器|converter/i,
      /φ18×129/,
      /21\.6 g/,
      /不锈钢|stainless steel/i,
      /10-9895-117/,
      /10-9895-642/,
      /EF[\s\S]*F[\s\S]*MF[\s\S]*M[\s\S]*B/,
      /维护|清洗|保存/,
      /选购/,
    ])
      assert.match(body, pattern);
    assert.doesNotMatch(body, /canonical|made_by|数据库|仓库/i);
    const spec = (
      await client.execute({
        sql: "SELECT brand_entity_id,nib,fill_system,material,dimensions,weight,price_range,status FROM model_specs WHERE entity_id=?",
        args: [PHASE382_KAMAWANU_ID],
      })
    ).rows[0];
    assert.equal(String(spec?.brand_entity_id), PHASE382_SAILOR_BRAND_ID);
    assert.match(String(spec?.nib), /官方.*未列|EF.*F.*MF/i);
    assert.match(String(spec?.fill_system), /墨囊.*转换器|converter/i);
    assert.match(String(spec?.material), /PMMA/i);
    assert.match(String(spec?.dimensions), /18.*129/);
    assert.match(String(spec?.weight), /21\.6/);
    assert.match(String(spec?.price_range), /Appelboom|254\.10/i);
    assert.match(String(spec?.status), /400/);
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS n FROM model_variants WHERE model_entity_id=?",
            args: [PHASE382_KAMAWANU_ID],
          })
        ).rows[0]?.n,
      ),
      10,
    );
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS n FROM entity_references WHERE entity_id=?",
            args: [PHASE382_KAMAWANU_ID],
          })
        ).rows[0]?.n,
      ),
      pack.sources.length,
    );
    const media = (
      await client.execute({
        sql: "SELECT local_path,source_url,usage_status FROM media_assets WHERE entity_id=?",
        args: [PHASE382_KAMAWANU_ID],
      })
    ).rows[0];
    assert.equal(String(media?.local_path), pack.media[0]?.localPath);
    assert.equal(String(media?.source_url), pack.media[0]?.sourceUrl);
    assert.equal(String(media?.usage_status), "primary");
    const reviewKinds = (
      await client.execute({
        sql: "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? ORDER BY review_kind",
        args: [PHASE382_KAMAWANU_ID],
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
        args: [PHASE382_KAMAWANU_ID],
      })
    ).rows[0];
    assert.ok(Number(groupCounts?.primary_archive_group_count) >= 1);
    assert.ok(Number(groupCounts?.professional_secondary_group_count) >= 1);
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS n FROM fact_conflicts WHERE entity_id=?",
            args: [PHASE382_KAMAWANU_ID],
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
            args: [PHASE382_KAMAWANU_ID, PHASE382_SAILOR_BRAND_ID],
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
            args: [PHASE382_SAILOR_BRAND_ID, PHASE382_KAMAWANU_ID],
          })
        ).rows[0]?.n,
      ),
      1,
    );
    const replay = await applyPhase382SailorKamawanuContent(client, options);
    assert.equal(
      replay.entities.find((item) => item.entityId === PHASE382_KAMAWANU_ID)
        ?.outcome,
      "noop",
    );
    assertCatalogSnapshotUnchanged(snapshot, snapshotCatalogFiles(REAL));
  } finally {
    client.close();
  }
});
