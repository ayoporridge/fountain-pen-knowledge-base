import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase353SailorProfessionalGearSlim14kContent } from "../../scripts/apply-phase353-sailor-professional-gear-slim-14k-content";
import {
  PHASE353_SAILOR_BRAND_ID,
  PHASE353_SLIM14K_ID,
  PHASE353_SLIM14K_SLUG,
  phase353SailorProfessionalGearSlim14kPacks,
} from "../../scripts/data/phase353-sailor-professional-gear-slim-14k";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

test("Phase 353 publishes Sailor Professional Gear Slim 14K 11-1221/11-1222 on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase353-sailor-pgs-slim14k-")),
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
    reviewer: "phase353-sailor-pgs-slim14k-test",
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
    const pack = phase353SailorProfessionalGearSlim14kPacks.find(
      (candidate) => candidate.entityId === PHASE353_SLIM14K_ID,
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
      applyPhase353SailorProfessionalGearSlim14kContent(client, {
        ...options,
        env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
      }),
      /refuses inherited remote database selection/,
    );

    const first = await applyPhase353SailorProfessionalGearSlim14kContent(
      client,
      options,
    );
    assert.deepEqual(
      first.entities.map((item) => item.entityId),
      [PHASE353_SAILOR_BRAND_ID, PHASE353_SLIM14K_ID],
    );
    assert.equal(
      first.entities.find((item) => item.entityId === PHASE353_SLIM14K_ID)
        ?.outcome,
      "published",
    );

    const entity = (
      await client.execute({
        sql: "SELECT id,type,slug,name,body_md FROM public_entities WHERE id=?",
        args: [PHASE353_SLIM14K_ID],
      })
    ).rows[0];
    assert.deepEqual(
      [entity?.id, entity?.type, entity?.slug, entity?.name],
      [
        PHASE353_SLIM14K_ID,
        "pen",
        PHASE353_SLIM14K_SLUG,
        "Sailor Professional Gear Slim 14K（11-1221／11-1222）",
      ],
    );
    const body = String(entity?.body_md ?? "");
    for (const pattern of [
      /11-1221/,
      /11-1222/,
      /14K/,
      /PMMA/,
      /φ17/,
      /124 mm/,
      /16\.8 g/,
      /11-2151/,
      /11-2152/,
      /11-1503/,
      /维护/,
      /选购/,
    ]) {
      assert.match(body, pattern);
    }
    assert.doesNotMatch(body, /canonical|made_by|数据库|仓库/i);

    const spec = (
      await client.execute({
        sql: "SELECT brand_entity_id,nib,fill_system,material,dimensions,weight FROM model_specs WHERE entity_id=?",
        args: [PHASE353_SLIM14K_ID],
      })
    ).rows[0];
    assert.equal(String(spec?.brand_entity_id), PHASE353_SAILOR_BRAND_ID);
    assert.match(String(spec?.nib), /14K/);
    assert.match(String(spec?.fill_system), /墨囊/);
    assert.match(String(spec?.material), /PMMA/);
    assert.match(String(spec?.dimensions), /124/);
    assert.equal(String(spec?.weight), "16.8 g");
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS n FROM model_variants WHERE model_entity_id=?",
            args: [PHASE353_SLIM14K_ID],
          })
        ).rows[0]?.n,
      ),
      3,
    );
    assert.ok(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS n FROM entity_references WHERE entity_id=?",
            args: [PHASE353_SLIM14K_ID],
          })
        ).rows[0]?.n,
      ) >= 7,
    );
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS n FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
            args: [PHASE353_SLIM14K_ID, PHASE353_SAILOR_BRAND_ID],
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
            args: [PHASE353_SAILOR_BRAND_ID, PHASE353_SLIM14K_ID],
          })
        ).rows[0]?.n,
      ),
      1,
    );
    const media = (
      await client.execute({
        sql: "SELECT local_path,source_url,usage_status FROM media_assets WHERE entity_id=?",
        args: [PHASE353_SLIM14K_ID],
      })
    ).rows[0];
    assert.equal(String(media?.local_path), mediaPack.localPath);
    assert.equal(String(media?.source_url), mediaPack.sourceUrl);
    assert.equal(String(media?.usage_status), "primary");

    const replay = await applyPhase353SailorProfessionalGearSlim14kContent(
      client,
      options,
    );
    assert.equal(
      replay.entities.find((item) => item.entityId === PHASE353_SLIM14K_ID)
        ?.outcome,
      "noop",
    );
    assertCatalogSnapshotUnchanged(snapshot, snapshotCatalogFiles(REAL));
  } finally {
    client.close();
  }
});
