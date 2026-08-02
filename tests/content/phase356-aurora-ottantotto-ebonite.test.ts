import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase356AuroraOttantottoEbaniteContent } from "../../scripts/apply-phase356-aurora-ottantotto-ebonite-content";
import {
  PHASE356_AURORA_BRAND_ID,
  PHASE356_TARGET_ID,
  PHASE356_TARGET_SLUG,
  phase356AuroraOttantottoEbanitePacks,
} from "../../scripts/data/phase356-aurora-ottantotto-ebonite";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

test("Phase 356 publishes Aurora Ottantotto Ebanite on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase356-aurora-ebonite-")),
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
    reviewer: "phase356-aurora-ottantotto-ebonite-test",
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
    const pack = phase356AuroraOttantottoEbanitePacks.find(
      (candidate) => candidate.entityId === PHASE356_TARGET_ID,
    );
    assert.ok(pack);
    const mediaPack = pack.media[0];
    assert.ok(mediaPack);
    assert.ok(mediaPack.localPath);
    assert.ok(mediaPack.sourceUrl);
    assert.ok(
      fs.readFileSync(path.join(ROOT, pack.markdownFile), "utf8").length >=
        3_000,
    );
    assert.ok(
      new Set(pack.sources.map((source) => source.independenceGroup)).size >= 3,
    );
    const svg = fs.readFileSync(
      path.join(ROOT, "public", mediaPack.localPath.replace(/^\//, "")),
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
      applyPhase356AuroraOttantottoEbaniteContent(client, {
        ...options,
        env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
      }),
      /refuses inherited remote database selection/,
    );

    const first = await applyPhase356AuroraOttantottoEbaniteContent(
      client,
      options,
    );
    assert.deepEqual(
      first.entities.map((item) => item.entityId),
      [PHASE356_AURORA_BRAND_ID, PHASE356_TARGET_ID],
    );
    assert.equal(
      first.entities.find((item) => item.entityId === PHASE356_TARGET_ID)
        ?.outcome,
      "published",
    );

    const entity = (
      await client.execute({
        sql: "SELECT id,type,slug,name,body_md FROM public_entities WHERE id=?",
        args: [PHASE356_TARGET_ID],
      })
    ).rows[0];
    assert.deepEqual(
      [entity?.id, entity?.type, entity?.slug, entity?.name],
      [
        PHASE356_TARGET_ID,
        "pen",
        PHASE356_TARGET_SLUG,
        "Aurora Ottantotto Ebanite（88 Ebanite）",
      ],
    );
    const body = String(entity?.body_md ?? "");
    for (const pattern of [
      /Ottantotto Ebanite/,
      /88 Resin|Resina 800/,
      /Millerighe/,
      /ebonite/,
      /大理石纹理/,
      /18K/,
      /活塞/,
      /蓝/,
      /洋红/,
      /cognac/,
      /三种颜色/,
      /四种|四色/,
      /133 mm/,
      /维护/,
      /选购/,
    ]) {
      assert.match(body, pattern);
    }
    assert.doesNotMatch(body, /canonical|made_by|数据库|仓库/i);

    const brandEntity = (
      await client.execute({
        sql: "SELECT body_md FROM public_entities WHERE id=?",
        args: [PHASE356_AURORA_BRAND_ID],
      })
    ).rows[0];
    assert.match(String(brandEntity?.body_md ?? ""), /Ottantotto Ebanite/);

    const spec = (
      await client.execute({
        sql: "SELECT brand_entity_id,nib,fill_system,material,dimensions,weight FROM model_specs WHERE entity_id=?",
        args: [PHASE356_TARGET_ID],
      })
    ).rows[0];
    assert.equal(String(spec?.brand_entity_id), PHASE356_AURORA_BRAND_ID);
    assert.match(String(spec?.nib), /18K/);
    assert.match(String(spec?.fill_system), /piston/);
    assert.match(String(spec?.material), /ebonite/);
    assert.match(String(spec?.dimensions), /133/);
    assert.match(String(spec?.weight), /not published/);
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS n FROM model_variants WHERE model_entity_id=?",
            args: [PHASE356_TARGET_ID],
          })
        ).rows[0]?.n,
      ),
      4,
    );
    assert.ok(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS n FROM entity_references WHERE entity_id=?",
            args: [PHASE356_TARGET_ID],
          })
        ).rows[0]?.n,
      ) >= 7,
    );
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS n FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
            args: [PHASE356_TARGET_ID, PHASE356_AURORA_BRAND_ID],
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
            args: [PHASE356_AURORA_BRAND_ID, PHASE356_TARGET_ID],
          })
        ).rows[0]?.n,
      ),
      1,
    );
    const media = (
      await client.execute({
        sql: "SELECT local_path,source_url,usage_status FROM media_assets WHERE entity_id=?",
        args: [PHASE356_TARGET_ID],
      })
    ).rows[0];
    assert.equal(String(media?.local_path), mediaPack.localPath);
    assert.equal(String(media?.source_url), mediaPack.sourceUrl);
    assert.equal(String(media?.usage_status), "primary");

    const replay = await applyPhase356AuroraOttantottoEbaniteContent(
      client,
      options,
    );
    assert.equal(
      replay.entities.find((item) => item.entityId === PHASE356_TARGET_ID)
        ?.outcome,
      "noop",
    );
    assertCatalogSnapshotUnchanged(snapshot, snapshotCatalogFiles(REAL));
  } finally {
    client.close();
  }
});
