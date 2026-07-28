import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import {
  applyPhase315PelikanTwistP457Content,
  PHASE315_PELIKAN_ID,
  PHASE315_TWIST_ID,
  PHASE315_TWIST_SLUG,
} from "../../scripts/apply-phase315-pelikan-twist-p457-content";
import { phase315PelikanTwistP457Packs } from "../../scripts/data/phase315-pelikan-twist-p457";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

test("Phase 315 enriches existing Pelikan Twist as P457 on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase315-twist-")),
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
    reviewer: "phase315-twist-test",
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
    const pack = phase315PelikanTwistP457Packs.find(
      (candidate) => candidate.entityId === PHASE315_TWIST_ID,
    );
    assert.ok(pack);
    assert.ok(
      fs.readFileSync(path.join(ROOT, pack.markdownFile), "utf8").length >=
        3_000,
    );
    assert.ok(
      new Set(pack.sources.map((source) => source.independenceGroup)).size >= 4,
    );
    const mediaPack = pack.media[0];
    assert.ok(mediaPack?.localPath);
    const svg = fs.readFileSync(
      path.join(ROOT, "public", mediaPack.localPath.replace(/^\//, "")),
      "utf8",
    );
    for (const marker of [
      /非产品照片|non-photo/i,
      /非.*商标|non-logo/i,
      /不表现真实比例|not-to-scale/i,
      /不表现真实比例、颜色|colour-proof/i,
    ])
      assert.match(svg, marker);
    await assert.rejects(
      applyPhase315PelikanTwistP457Content(client, {
        ...options,
        env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
      }),
      /refuses inherited remote database selection/,
    );
    const first = await applyPhase315PelikanTwistP457Content(client, options);
    assert.deepEqual(
      first.entities.map((item) => item.entityId),
      [PHASE315_PELIKAN_ID, PHASE315_TWIST_ID],
    );
    assert.equal(
      first.entities.find((item) => item.entityId === PHASE315_TWIST_ID)
        ?.outcome,
      "published",
    );
    const entity = (
      await client.execute({
        sql: "SELECT id,type,slug,name,body_md FROM public_entities WHERE id=?",
        args: [PHASE315_TWIST_ID],
      })
    ).rows[0];
    assert.deepEqual(
      [entity?.id, entity?.type, entity?.slug, entity?.name],
      [
        PHASE315_TWIST_ID,
        "pen",
        PHASE315_TWIST_SLUG,
        "百利金 Pelikan Twist P457",
      ],
    );
    const body = String(entity?.body_md ?? "");
    for (const pattern of [
      /P457/,
      /2013/,
      /扭转三角/,
      /软握区/,
      /墨囊/,
      /R457/,
      /P450/,
      /M400/,
      /P10/,
      /选购/,
    ])
      assert.match(body, pattern);
    assert.doesNotMatch(body, /canonical|made_by|数据库|仓库/i);
    const spec = (
      await client.execute({
        sql: "SELECT brand_entity_id,nib,fill_system,material,dimensions,weight FROM model_specs WHERE entity_id=?",
        args: [PHASE315_TWIST_ID],
      })
    ).rows[0];
    assert.equal(String(spec?.brand_entity_id), PHASE315_PELIKAN_ID);
    assert.match(String(spec?.nib), /不锈钢/);
    assert.match(String(spec?.fill_system), /墨囊/);
    assert.match(String(spec?.dimensions), /140/);
    assert.equal(String(spec?.weight), "档案参考约 19 g");
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS n FROM model_variants WHERE model_entity_id=?",
            args: [PHASE315_TWIST_ID],
          })
        ).rows[0]?.n,
      ),
      5,
    );
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS n FROM entity_references WHERE entity_id=?",
            args: [PHASE315_TWIST_ID],
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
            args: [PHASE315_TWIST_ID, PHASE315_PELIKAN_ID],
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
            args: [PHASE315_PELIKAN_ID, PHASE315_TWIST_ID],
          })
        ).rows[0]?.n,
      ),
      1,
    );
    const media = (
      await client.execute({
        sql: "SELECT local_path,source_url,usage_status FROM media_assets WHERE entity_id=?",
        args: [PHASE315_TWIST_ID],
      })
    ).rows[0];
    assert.equal(String(media?.local_path), mediaPack.localPath);
    assert.equal(String(media?.source_url), mediaPack.sourceUrl);
    assert.equal(String(media?.usage_status), "primary");
    const replay = await applyPhase315PelikanTwistP457Content(client, options);
    assert.equal(
      replay.entities.find((item) => item.entityId === PHASE315_TWIST_ID)
        ?.outcome,
      "noop",
    );
    assertCatalogSnapshotUnchanged(snapshot, snapshotCatalogFiles(REAL));
  } finally {
    client.close();
  }
});
