import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase378SailorDreamscapeCelestialTempleContent } from "../../scripts/apply-phase378-sailor-dreamscape-celestial-temple-content";
import {
  PHASE378_DREAMSCAPE_ID,
  PHASE378_DREAMSCAPE_SLUG,
  PHASE378_SAILOR_BRAND_ID,
  phase378SailorDreamscapeCelestialTemplePacks,
} from "../../scripts/data/phase378-sailor-dreamscape-celestial-temple";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

test("Phase 378 publishes Sailor DREAMSCAPE TRIP CELESTIAL TEMPLE on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase378-sailor-dreamscape-")),
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
    reviewer: "phase378-sailor-dreamscape-test",
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
    const pack = phase378SailorDreamscapeCelestialTemplePacks.find(
      (candidate) => candidate.expectedType === "pen",
    );
    assert.ok(pack);
    const markdown = fs.readFileSync(
      path.join(ROOT, pack.markdownFile),
      "utf8",
    );
    assert.ok(markdown.length >= 4_000);
    assert.ok(
      new Set(pack.sources.map((source) => source.independenceGroup)).size >= 3,
    );
    assert.equal(pack.variants?.length, 3);
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

    await assert.rejects(
      applyPhase378SailorDreamscapeCelestialTempleContent(client, {
        ...options,
        env: {
          ...options.env,
          TURSO_DATABASE_URL: "https://remote.invalid/catalog",
        },
      }),
      /refuses inherited remote database selection/,
    );

    const first = await applyPhase378SailorDreamscapeCelestialTempleContent(
      client,
      options,
    );
    assert.equal(
      first.entities.find((item) => item.entityId === PHASE378_DREAMSCAPE_ID)
        ?.outcome,
      "published",
    );
    const entity = (
      await client.execute({
        sql: "SELECT id,type,slug,name,body_md FROM public_entities WHERE id=?",
        args: [PHASE378_DREAMSCAPE_ID],
      })
    ).rows[0];
    assert.equal(String(entity?.type), "pen");
    assert.equal(String(entity?.slug), PHASE378_DREAMSCAPE_SLUG);
    assert.equal(
      String(entity?.name),
      "写乐 Sailor DREAMSCAPE TRIP CELESTIAL TEMPLE（10-2650）",
    );
    const body = String(entity?.body_md ?? "");
    for (const pattern of [
      /DREAMSCAPE TRIP/i,
      /CELESTIAL TEMPLE/i,
      /10-2650/,
      /不锈钢/,
      /金色 IP/,
      /PMMA/,
      /墨囊／转换器/,
      /23\.5 g/,
      /21\.6 g/,
      /F[\s\S]*MF[\s\S]*M/,
      /2026-12-05/,
      /维护|清洁/,
      /选购/,
    ]) {
      assert.match(body, pattern);
    }
    assert.doesNotMatch(body, /canonical|made_by|数据库|仓库/i);

    const spec = (
      await client.execute({
        sql: "SELECT brand_entity_id,nib,fill_system,material,dimensions,weight,status FROM model_specs WHERE entity_id=?",
        args: [PHASE378_DREAMSCAPE_ID],
      })
    ).rows[0];
    assert.equal(String(spec?.brand_entity_id), PHASE378_SAILOR_BRAND_ID);
    assert.match(String(spec?.nib), /不锈钢/);
    assert.match(String(spec?.fill_system), /墨囊／转换器/);
    assert.match(String(spec?.material), /PMMA.*金色 IP/);
    assert.match(String(spec?.dimensions), /18.*129/);
    assert.match(String(spec?.weight), /23\.5/);
    assert.match(String(spec?.status), /2026-12-05/);

    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS n FROM model_variants WHERE model_entity_id=?",
            args: [PHASE378_DREAMSCAPE_ID],
          })
        ).rows[0]?.n,
      ),
      3,
    );
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS n FROM entity_references WHERE entity_id=?",
            args: [PHASE378_DREAMSCAPE_ID],
          })
        ).rows[0]?.n,
      ),
      pack.sources.length,
    );
    const media = (
      await client.execute({
        sql: "SELECT local_path,source_url,usage_status FROM media_assets WHERE entity_id=?",
        args: [PHASE378_DREAMSCAPE_ID],
      })
    ).rows[0];
    assert.equal(String(media?.local_path), pack.media[0]?.localPath);
    assert.equal(String(media?.source_url), pack.media[0]?.sourceUrl);
    assert.equal(String(media?.usage_status), "primary");
    const reviewKinds = (
      await client.execute({
        sql: "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? ORDER BY review_kind",
        args: [PHASE378_DREAMSCAPE_ID],
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
        args: [PHASE378_DREAMSCAPE_ID],
      })
    ).rows[0];
    assert.ok(Number(groupCounts?.primary_archive_group_count) >= 1);
    assert.ok(Number(groupCounts?.professional_secondary_group_count) >= 1);
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS n FROM fact_conflicts WHERE entity_id=?",
            args: [PHASE378_DREAMSCAPE_ID],
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
            args: [PHASE378_DREAMSCAPE_ID, PHASE378_SAILOR_BRAND_ID],
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
            args: [PHASE378_SAILOR_BRAND_ID, PHASE378_DREAMSCAPE_ID],
          })
        ).rows[0]?.n,
      ),
      1,
    );

    const replay = await applyPhase378SailorDreamscapeCelestialTempleContent(
      client,
      options,
    );
    assert.equal(
      replay.entities.find((item) => item.entityId === PHASE378_DREAMSCAPE_ID)
        ?.outcome,
      "noop",
    );
    assertCatalogSnapshotUnchanged(snapshot, snapshotCatalogFiles(REAL));
  } finally {
    client.close();
  }
});
