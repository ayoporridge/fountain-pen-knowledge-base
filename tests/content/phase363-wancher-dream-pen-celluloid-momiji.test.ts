import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase363WancherDreamPenCelluloidMomijiContent } from "../../scripts/apply-phase363-wancher-dream-pen-celluloid-momiji-content";
import {
  PHASE363_TARGET_ID,
  PHASE363_TARGET_SLUG,
  PHASE363_WANCHER_BRAND_ID,
  phase363WancherDreamPenCelluloidMomijiPacks,
} from "../../scripts/data/phase363-wancher-dream-pen-celluloid-momiji";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { computePublicationContentHash } from "../../src/lib/publication";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

test("Phase 363 publishes Wancher Dream Pen Celluloid MOMIJI on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase363-wancher-momiji-")),
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
    reviewer: "phase363-wancher-momiji-test",
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
    const pack = phase363WancherDreamPenCelluloidMomijiPacks.find(
      (candidate) => candidate.entityId === PHASE363_TARGET_ID,
    );
    assert.ok(pack);
    assert.ok(
      fs.readFileSync(path.join(ROOT, pack.markdownFile), "utf8").length >=
        4_000,
    );
    assert.ok(
      new Set(pack.sources.map((source) => source.independenceGroup)).size >= 7,
    );
    const mediaPack = pack.media[0];
    assert.ok(mediaPack?.localPath);
    const svg = fs.readFileSync(
      path.join(ROOT, "public", mediaPack.localPath.replace(/^\//, "")),
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
      applyPhase363WancherDreamPenCelluloidMomijiContent(client, {
        ...options,
        env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
      }),
      /refuses inherited remote database selection/,
    );

    const first = await applyPhase363WancherDreamPenCelluloidMomijiContent(
      client,
      options,
    );
    assert.deepEqual(
      first.entities.map((item) => item.entityId),
      [PHASE363_WANCHER_BRAND_ID, PHASE363_TARGET_ID],
    );
    assert.equal(
      first.entities.find((item) => item.entityId === PHASE363_TARGET_ID)
        ?.outcome,
      "published",
    );

    const entity = (
      await client.execute({
        sql: "SELECT id,type,slug,name,body_md FROM public_entities WHERE id=?",
        args: [PHASE363_TARGET_ID],
      })
    ).rows[0];
    assert.deepEqual(
      [entity?.id, entity?.type, entity?.slug, entity?.name],
      [
        PHASE363_TARGET_ID,
        "pen",
        PHASE363_TARGET_SLUG,
        "Wancher Dream Pen Celluloid MOMIJI",
      ],
    );
    const body = String(entity?.body_md ?? "");
    for (const pattern of [
      /Dream Pen Celluloid/i,
      /MOMIJI/i,
      /Momiji/i,
      /紅葉/,
      /Modern Cellulose/i,
      /cellulose acetate/i,
      /red/i,
      /红与金|gold/i,
      /Kickstarter/i,
      /2025/,
      /2025 年 11 月/,
      /Kyoto Celluloid/i,
      /Roll Up/i,
      /JoWo/i,
      /18K/,
      /Keiryu/i,
      /尺寸[\s\S]*未发布|独立尺寸/,
      /接口[\s\S]*未单列|filling system/i,
      /维护/,
      /选购/,
    ])
      assert.match(body, pattern);
    assert.doesNotMatch(body, /canonical|made_by|数据库|仓库/i);

    const brand = (
      await client.execute({
        sql: "SELECT body_md FROM public_entities WHERE id=?",
        args: [PHASE363_WANCHER_BRAND_ID],
      })
    ).rows[0];
    assert.match(String(brand?.body_md ?? ""), /MOMIJI/);
    const spec = (
      await client.execute({
        sql: "SELECT brand_entity_id,nib,fill_system,material,dimensions,weight,status FROM model_specs WHERE entity_id=?",
        args: [PHASE363_TARGET_ID],
      })
    ).rows[0];
    assert.equal(String(spec?.brand_entity_id), PHASE363_WANCHER_BRAND_ID);
    assert.match(String(spec?.nib), /JoWo|18K|Keiryu/i);
    assert.match(String(spec?.fill_system), /未.*列|not|standalone/i);
    assert.match(String(spec?.material), /Modern Cellulose|cellulose acetate/i);
    assert.match(String(spec?.dimensions), /未发布|not|146\/128/i);
    assert.match(String(spec?.weight), /未发布|not|21 g/i);
    assert.match(String(spec?.status), /project|family|商城/i);
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS n FROM model_variants WHERE model_entity_id=?",
            args: [PHASE363_TARGET_ID],
          })
        ).rows[0]?.n,
      ),
      5,
    );
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS n FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
            args: [PHASE363_TARGET_ID, PHASE363_WANCHER_BRAND_ID],
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
            args: [PHASE363_WANCHER_BRAND_ID, PHASE363_TARGET_ID],
          })
        ).rows[0]?.n,
      ),
      1,
    );
    assert.ok(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS n FROM entity_references WHERE entity_id=?",
            args: [PHASE363_TARGET_ID],
          })
        ).rows[0]?.n,
      ) >= 7,
    );
    assert.ok(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS n FROM spec_field_evidence evidence JOIN model_specs spec ON spec.id=evidence.model_spec_id WHERE spec.entity_id=?",
            args: [PHASE363_TARGET_ID],
          })
        ).rows[0]?.n,
      ) >= 8,
    );
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS n FROM media_assets WHERE entity_id=? AND usage_status='primary'",
            args: [PHASE363_TARGET_ID],
          })
        ).rows[0]?.n,
      ),
      1,
    );
    const hash = await computePublicationContentHash(
      client,
      PHASE363_TARGET_ID,
    );
    assert.deepEqual(
      (
        await client.execute({
          sql: "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind",
          args: [PHASE363_TARGET_ID, hash],
        })
      ).rows.map((row) => [String(row.review_kind), String(row.status)]),
      [
        ["fact", "approved"],
        ["language", "approved"],
        ["media", "approved"],
        ["publication", "approved"],
      ],
    );
    const replay = await applyPhase363WancherDreamPenCelluloidMomijiContent(
      client,
      options,
    );
    assert.equal(
      replay.entities.find((item) => item.entityId === PHASE363_TARGET_ID)
        ?.outcome,
      "noop",
    );
    assertCatalogSnapshotUnchanged(snapshot, snapshotCatalogFiles(REAL));
  } finally {
    client.close();
  }
});
