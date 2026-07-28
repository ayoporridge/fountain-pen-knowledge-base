import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import {
  applyPhase317PlatinumIzumoPba120000gTakeamiContent,
  PHASE317_PLATINUM_BRAND_ID,
  PHASE317_TAKEAMI_G_ID,
  PHASE317_TAKEAMI_G_SLUG,
} from "../../scripts/apply-phase317-platinum-izumo-pba-120000g-takeami-content";
import { phase317PlatinumIzumoPba120000gTakeamiPacks } from "../../scripts/data/phase317-platinum-izumo-pba-120000g-takeami";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

test("Phase 317 publishes Platinum Izumo PBA-120000G Takeami on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase317-takeami-")),
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
    reviewer: "phase317-takeami-test",
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
    const pack = phase317PlatinumIzumoPba120000gTakeamiPacks.find(
      (candidate) => candidate.entityId === PHASE317_TAKEAMI_G_ID,
    );
    assert.ok(pack);
    assert.ok(
      fs.readFileSync(path.join(ROOT, pack.markdownFile), "utf8").length >=
        3_000,
    );
    assert.ok(
      new Set(pack.sources.map((source) => source.independenceGroup)).size >= 3,
    );
    const svg = fs.readFileSync(
      path.join(
        ROOT,
        "public/images/library/site-original/phase317/platinum/izumo-pba-120000g-takeami.svg",
      ),
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
      applyPhase317PlatinumIzumoPba120000gTakeamiContent(client, {
        ...options,
        env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
      }),
      /refuses inherited remote database selection/,
    );
    const first = await applyPhase317PlatinumIzumoPba120000gTakeamiContent(
      client,
      options,
    );
    assert.equal(first.entities.length, 2);
    assert.ok(
      first.entities.some(
        (item) => item.entityId === PHASE317_PLATINUM_BRAND_ID,
      ),
    );
    assert.ok(
      first.entities.some((item) => item.entityId === PHASE317_TAKEAMI_G_ID),
    );
    assert.equal(
      first.entities.find((item) => item.entityId === PHASE317_TAKEAMI_G_ID)
        ?.outcome,
      "published",
    );
    const entity = (
      await client.execute({
        sql: "SELECT id,type,slug,name,body_md FROM public_entities WHERE id=?",
        args: [PHASE317_TAKEAMI_G_ID],
      })
    ).rows[0];
    assert.deepEqual(
      [entity?.id, entity?.type, entity?.slug, entity?.name],
      [
        PHASE317_TAKEAMI_G_ID,
        "pen",
        PHASE317_TAKEAMI_G_SLUG,
        "Platinum Izumo Takeami PBA-120000G 茣蓙目竹编",
      ],
    );
    const body = String(entity?.body_md ?? "");
    for (const pattern of [
      /PBA-120000G/,
      /茣蓙目/,
      /Gozame/i,
      /Ankokushoku/i,
      /Benikabairo/i,
      /18K/,
      /136\.5 mm/,
      /30 g/,
      /选购/,
      /PBA-120000Y/,
      /PIZ-55000/,
    ])
      assert.match(body, pattern);
    assert.doesNotMatch(body, /canonical|made_by|数据库|仓库/i);
    const spec = (
      await client.execute({
        sql: "SELECT brand_entity_id,nib,fill_system,material,dimensions,weight FROM model_specs WHERE entity_id=?",
        args: [PHASE317_TAKEAMI_G_ID],
      })
    ).rows[0];
    assert.equal(String(spec?.brand_entity_id), PHASE317_PLATINUM_BRAND_ID);
    assert.match(String(spec?.nib), /18K/);
    assert.match(String(spec?.fill_system), /转换器/);
    assert.match(String(spec?.material), /POM/);
    assert.match(String(spec?.dimensions), /136\.5/);
    assert.match(String(spec?.weight), /30/);
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS n FROM model_variants WHERE model_entity_id=?",
            args: [PHASE317_TAKEAMI_G_ID],
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
            args: [PHASE317_TAKEAMI_G_ID],
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
            args: [PHASE317_TAKEAMI_G_ID, PHASE317_PLATINUM_BRAND_ID],
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
            args: [PHASE317_PLATINUM_BRAND_ID, PHASE317_TAKEAMI_G_ID],
          })
        ).rows[0]?.n,
      ),
      1,
    );
    const media = (
      await client.execute({
        sql: "SELECT local_path,source_url,usage_status FROM media_assets WHERE entity_id=?",
        args: [PHASE317_TAKEAMI_G_ID],
      })
    ).rows[0];
    assert.equal(
      String(media?.local_path),
      "/images/library/site-original/phase317/platinum/izumo-pba-120000g-takeami.svg",
    );
    assert.equal(
      String(media?.source_url),
      "/images/library/site-original/phase317/platinum/izumo-pba-120000g-takeami.svg",
    );
    assert.equal(String(media?.usage_status), "primary");
    const replay = await applyPhase317PlatinumIzumoPba120000gTakeamiContent(
      client,
      options,
    );
    assert.equal(
      replay.entities.find((item) => item.entityId === PHASE317_TAKEAMI_G_ID)
        ?.outcome,
      "noop",
    );
    assertCatalogSnapshotUnchanged(snapshot, snapshotCatalogFiles(REAL));
  } finally {
    client.close();
  }
});
