import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import {
  applyPhase311PlatinumIzumoPiz150000PwContent,
  PHASE311_PIZ_ID,
  PHASE311_PIZ_SLUG,
  PHASE311_PLATINUM_BRAND_ID,
} from "../../scripts/apply-phase311-platinum-izumo-piz-150000pw-content";
import { phase311PlatinumIzumoPiz150000PwPacks } from "../../scripts/data/phase311-platinum-izumo-piz-150000pw";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

test("Phase 311 publishes Platinum Izumo Precious Wood PIZ-150000PW on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase311-piz-150000pw-")),
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
    reviewer: "phase311-piz-150000pw-test",
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
    const pack = phase311PlatinumIzumoPiz150000PwPacks.find(
      (candidate) => candidate.entityId === PHASE311_PIZ_ID,
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
      new Set(pack.sources.map((source) => source.independenceGroup)).size >= 2,
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
      applyPhase311PlatinumIzumoPiz150000PwContent(client, {
        ...options,
        env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
      }),
      /refuses inherited remote database selection/,
    );

    const first = await applyPhase311PlatinumIzumoPiz150000PwContent(
      client,
      options,
    );
    assert.deepEqual(
      first.entities.map((item) => item.entityId),
      [PHASE311_PLATINUM_BRAND_ID, PHASE311_PIZ_ID],
    );
    assert.equal(
      first.entities.find((item) => item.entityId === PHASE311_PIZ_ID)?.outcome,
      "published",
    );

    const entity = (
      await client.execute({
        sql: "SELECT id,type,slug,name,body_md FROM public_entities WHERE id=?",
        args: [PHASE311_PIZ_ID],
      })
    ).rows[0];
    assert.deepEqual(
      [entity?.id, entity?.type, entity?.slug, entity?.name],
      [
        PHASE311_PIZ_ID,
        "pen",
        PHASE311_PIZ_SLUG,
        "Platinum Izumo Precious Wood PIZ-150000PW 花梨瘤",
      ],
    );
    const body = String(entity?.body_md ?? "");
    for (const pattern of [
      /PIZ-150000PW/,
      /花梨瘤/,
      /Amboyna burl/i,
      /166 mm/,
      /18\.4 mm/,
      /26\.7 g/,
      /限量 50/,
      /选购/,
      /PIZ-80000N/,
      /无笔夹/,
    ]) {
      assert.match(body, pattern);
    }
    assert.doesNotMatch(body, /canonical|made_by|数据库|仓库/i);

    const spec = (
      await client.execute({
        sql: "SELECT brand_entity_id,nib,fill_system,material,dimensions,weight FROM model_specs WHERE entity_id=?",
        args: [PHASE311_PIZ_ID],
      })
    ).rows[0];
    assert.equal(String(spec?.brand_entity_id), PHASE311_PLATINUM_BRAND_ID);
    assert.match(String(spec?.nib), /18K/);
    assert.match(String(spec?.fill_system), /Converter-800A/);
    assert.match(String(spec?.material), /花梨瘤/);
    assert.match(String(spec?.dimensions), /166/);
    assert.equal(String(spec?.weight), "平均 26.7 g");
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS n FROM model_variants WHERE model_entity_id=?",
            args: [PHASE311_PIZ_ID],
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
            args: [PHASE311_PIZ_ID],
          })
        ).rows[0]?.n,
      ),
      6,
    );
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS n FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
            args: [PHASE311_PIZ_ID, PHASE311_PLATINUM_BRAND_ID],
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
            args: [PHASE311_PLATINUM_BRAND_ID, PHASE311_PIZ_ID],
          })
        ).rows[0]?.n,
      ),
      1,
    );
    const media = (
      await client.execute({
        sql: "SELECT local_path,source_url,usage_status FROM media_assets WHERE entity_id=?",
        args: [PHASE311_PIZ_ID],
      })
    ).rows[0];
    assert.equal(String(media?.local_path), mediaPack.localPath);
    assert.equal(String(media?.source_url), mediaPack.sourceUrl);
    assert.equal(String(media?.usage_status), "primary");

    const replay = await applyPhase311PlatinumIzumoPiz150000PwContent(
      client,
      options,
    );
    assert.equal(
      replay.entities.find((item) => item.entityId === PHASE311_PIZ_ID)
        ?.outcome,
      "noop",
    );
    assertCatalogSnapshotUnchanged(snapshot, snapshotCatalogFiles(REAL));
  } finally {
    client.close();
  }
});
