import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import {
  applyPhase314PlatinumIzumoPiz50000tTagayasanContent,
  PHASE314_PLATINUM_BRAND_ID,
  PHASE314_TAGAYASAN_ID,
  PHASE314_TAGAYASAN_SLUG,
} from "../../scripts/apply-phase314-platinum-izumo-piz-50000t-tagayasan-content";
import { phase314PlatinumIzumoPiz50000tTagayasanPacks } from "../../scripts/data/phase314-platinum-izumo-piz-50000t-tagayasan";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

test("Phase 314 publishes Platinum Izumo Tagayasan PIZ-50000T on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase314-tagayasan-")),
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
    reviewer: "phase314-tagayasan-test",
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
    const pack = phase314PlatinumIzumoPiz50000tTagayasanPacks.find(
      (candidate) => candidate.entityId === PHASE314_TAGAYASAN_ID,
    );
    assert.ok(pack);
    assert.ok(
      fs.readFileSync(path.join(ROOT, pack.markdownFile), "utf8").length >=
        3_000,
    );
    assert.ok(
      new Set(pack.sources.map((source) => source.independenceGroup)).size >= 3,
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
      applyPhase314PlatinumIzumoPiz50000tTagayasanContent(client, {
        ...options,
        env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
      }),
      /refuses inherited remote database selection/,
    );
    const first = await applyPhase314PlatinumIzumoPiz50000tTagayasanContent(
      client,
      options,
    );
    assert.deepEqual(
      first.entities.map((item) => item.entityId),
      [PHASE314_PLATINUM_BRAND_ID, PHASE314_TAGAYASAN_ID],
    );
    assert.equal(
      first.entities.find((item) => item.entityId === PHASE314_TAGAYASAN_ID)
        ?.outcome,
      "published",
    );
    const entity = (
      await client.execute({
        sql: "SELECT id,type,slug,name,body_md FROM public_entities WHERE id=?",
        args: [PHASE314_TAGAYASAN_ID],
      })
    ).rows[0];
    assert.deepEqual(
      [entity?.id, entity?.type, entity?.slug, entity?.name],
      [
        PHASE314_TAGAYASAN_ID,
        "pen",
        PHASE314_TAGAYASAN_SLUG,
        "Platinum Izumo Tagayasan PIZ-50000T 铁刀木",
      ],
    );
    const body = String(entity?.body_md ?? "");
    for (const pattern of [
      /PIZ-50000T/,
      /Tagayasan/i,
      /铁刀木/,
      /Bombay Blackwood/i,
      /#20 Matte/,
      /#21 Gloss/,
      /18K/,
      /164 mm/,
      /18\.2 mm/,
      /38 g/,
      /选购/,
      /PIZ-55000/,
      /PIZ-80000N/,
    ])
      assert.match(body, pattern);
    assert.doesNotMatch(body, /canonical|made_by|数据库|仓库/i);
    const spec = (
      await client.execute({
        sql: "SELECT brand_entity_id,nib,fill_system,material,dimensions,weight FROM model_specs WHERE entity_id=?",
        args: [PHASE314_TAGAYASAN_ID],
      })
    ).rows[0];
    assert.equal(String(spec?.brand_entity_id), PHASE314_PLATINUM_BRAND_ID);
    assert.match(String(spec?.nib), /18K/);
    assert.match(String(spec?.fill_system), /Converter-800A/);
    assert.match(String(spec?.material), /Bombay Blackwood/i);
    assert.match(String(spec?.dimensions), /164/);
    assert.equal(String(spec?.weight), "38 g");
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS n FROM model_variants WHERE model_entity_id=?",
            args: [PHASE314_TAGAYASAN_ID],
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
            args: [PHASE314_TAGAYASAN_ID],
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
            args: [PHASE314_TAGAYASAN_ID, PHASE314_PLATINUM_BRAND_ID],
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
            args: [PHASE314_PLATINUM_BRAND_ID, PHASE314_TAGAYASAN_ID],
          })
        ).rows[0]?.n,
      ),
      1,
    );
    const media = (
      await client.execute({
        sql: "SELECT local_path,source_url,usage_status FROM media_assets WHERE entity_id=?",
        args: [PHASE314_TAGAYASAN_ID],
      })
    ).rows[0];
    assert.equal(String(media?.local_path), mediaPack.localPath);
    assert.equal(String(media?.source_url), mediaPack.sourceUrl);
    assert.equal(String(media?.usage_status), "primary");
    const replay = await applyPhase314PlatinumIzumoPiz50000tTagayasanContent(
      client,
      options,
    );
    assert.equal(
      replay.entities.find((item) => item.entityId === PHASE314_TAGAYASAN_ID)
        ?.outcome,
      "noop",
    );
    assertCatalogSnapshotUnchanged(snapshot, snapshotCatalogFiles(REAL));
  } finally {
    client.close();
  }
});
