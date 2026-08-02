import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase369SailorLecouleClearContent } from "../../scripts/apply-phase369-sailor-lecoule-clear-content";
import {
  PHASE369_LECOULE_CLEAR_ID,
  PHASE369_LECOULE_CLEAR_SLUG,
  PHASE369_SAILOR_BRAND_ID,
  phase369SailorLecouleClearPacks,
} from "../../scripts/data/phase369-sailor-lecoule-clear";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

test("Phase 369 publishes Sailor Lecoule Clear 11-0313 on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(
      path.join(os.tmpdir(), "fpkg-phase369-sailor-lecoule-clear-"),
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
    reviewer: "phase369-sailor-lecoule-clear-test",
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
    const modelPack = phase369SailorLecouleClearPacks.find(
      (pack) => pack.entityId === PHASE369_LECOULE_CLEAR_ID,
    );
    assert.ok(modelPack);
    const localPath = modelPack.media[0]?.localPath;
    assert.ok(localPath);
    assert.ok(modelPack.media[0]?.sourceUrl);
    assert.ok(
      fs.readFileSync(path.join(ROOT, modelPack.markdownFile), "utf8").length >=
        4_000,
    );
    assert.ok(
      new Set(modelPack.sources.map((source) => source.independenceGroup))
        .size >= 4,
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
    await assert.rejects(
      applyPhase369SailorLecouleClearContent(client, {
        ...options,
        env: { ...options.env, TURSO_DATABASE_URL: "libsql://remote" },
      }),
      /refuses inherited remote database selection/,
    );

    const first = await applyPhase369SailorLecouleClearContent(client, options);
    assert.deepEqual(
      first.entities.map((item) => item.entityId),
      [PHASE369_SAILOR_BRAND_ID, PHASE369_LECOULE_CLEAR_ID],
    );
    assert.equal(
      first.entities.find((item) => item.entityId === PHASE369_LECOULE_CLEAR_ID)
        ?.outcome,
      "published",
    );

    const entity = (
      await client.execute({
        sql: "SELECT id,type,slug,name,body_md FROM public_entities WHERE id=?",
        args: [PHASE369_LECOULE_CLEAR_ID],
      })
    ).rows[0];
    assert.deepEqual(
      [entity?.id, entity?.type, entity?.slug, entity?.name],
      [
        PHASE369_LECOULE_CLEAR_ID,
        "pen",
        PHASE369_LECOULE_CLEAR_SLUG,
        "写乐 Sailor Lecoule Clear（11-0313）",
      ],
    );
    const body = String(entity?.body_md ?? "");
    for (const pattern of [
      /11-0313/,
      /透明 PMMA/,
      /不锈钢 MF/,
      /墨囊／转换器/,
      /φ17/,
      /123 mm/,
      /12\.4 g/,
      /Power Stone/,
      /清洗/,
      /选购/,
    ]) {
      assert.match(body, pattern);
    }
    assert.doesNotMatch(body, /canonical|made_by|数据库|仓库/i);

    const spec = (
      await client.execute({
        sql: "SELECT brand_entity_id,nib,fill_system,material,dimensions,weight,status FROM model_specs WHERE entity_id=?",
        args: [PHASE369_LECOULE_CLEAR_ID],
      })
    ).rows[0];
    assert.equal(String(spec?.brand_entity_id), PHASE369_SAILOR_BRAND_ID);
    assert.match(String(spec?.nib), /不锈钢 MF/);
    assert.match(String(spec?.fill_system), /墨囊／转换器/);
    assert.match(String(spec?.material), /PMMA/);
    assert.match(String(spec?.dimensions), /123/);
    assert.equal(String(spec?.weight), "12.4 g");
    assert.match(String(spec?.status), /11-0313/);

    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS n FROM model_variants WHERE model_entity_id=?",
            args: [PHASE369_LECOULE_CLEAR_ID],
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
            args: [PHASE369_LECOULE_CLEAR_ID],
          })
        ).rows[0]?.n,
      ),
      7,
    );
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS n FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
            args: [PHASE369_LECOULE_CLEAR_ID, PHASE369_SAILOR_BRAND_ID],
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
            args: [PHASE369_SAILOR_BRAND_ID, PHASE369_LECOULE_CLEAR_ID],
          })
        ).rows[0]?.n,
      ),
      1,
    );
    const media = (
      await client.execute({
        sql: "SELECT local_path,source_url,usage_status FROM media_assets WHERE entity_id=?",
        args: [PHASE369_LECOULE_CLEAR_ID],
      })
    ).rows[0];
    assert.equal(String(media?.local_path), modelPack.media[0]?.localPath);
    assert.equal(String(media?.source_url), modelPack.media[0]?.sourceUrl);
    assert.equal(String(media?.usage_status), "primary");

    const replay = await applyPhase369SailorLecouleClearContent(
      client,
      options,
    );
    assert.equal(
      replay.entities.find(
        (item) => item.entityId === PHASE369_LECOULE_CLEAR_ID,
      )?.outcome,
      "noop",
    );
    assertCatalogSnapshotUnchanged(snapshot, snapshotCatalogFiles(REAL));
  } finally {
    client.close();
  }
});
