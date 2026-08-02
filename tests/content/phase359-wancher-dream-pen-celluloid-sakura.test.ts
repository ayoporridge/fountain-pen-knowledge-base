import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase359WancherDreamPenCelluloidSakuraContent } from "../../scripts/apply-phase359-wancher-dream-pen-celluloid-sakura-content";
import {
  PHASE359_TARGET_ID,
  PHASE359_TARGET_SLUG,
  PHASE359_WANCHER_BRAND_ID,
  phase359WancherDreamPenCelluloidSakuraPacks,
} from "../../scripts/data/phase359-wancher-dream-pen-celluloid-sakura";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { computePublicationContentHash } from "../../src/lib/publication";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

test("Phase 359 publishes Wancher Dream Pen Celluloid SAKURA on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase359-wancher-sakura-")),
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
    reviewer: "phase359-wancher-sakura-test",
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
    const pack = phase359WancherDreamPenCelluloidSakuraPacks.find(
      (candidate) => candidate.entityId === PHASE359_TARGET_ID,
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
      applyPhase359WancherDreamPenCelluloidSakuraContent(client, {
        ...options,
        env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
      }),
      /refuses inherited remote database selection/,
    );

    const first = await applyPhase359WancherDreamPenCelluloidSakuraContent(
      client,
      options,
    );
    assert.deepEqual(
      first.entities.map((item) => item.entityId),
      [PHASE359_WANCHER_BRAND_ID, PHASE359_TARGET_ID],
    );
    assert.equal(
      first.entities.find((item) => item.entityId === PHASE359_TARGET_ID)
        ?.outcome,
      "published",
    );

    const entity = (
      await client.execute({
        sql: "SELECT id,type,slug,name,body_md FROM public_entities WHERE id=?",
        args: [PHASE359_TARGET_ID],
      })
    ).rows[0];
    assert.deepEqual(
      [entity?.id, entity?.type, entity?.slug, entity?.name],
      [
        PHASE359_TARGET_ID,
        "pen",
        PHASE359_TARGET_SLUG,
        "Wancher Dream Pen Celluloid SAKURA",
      ],
    );
    const body = String(entity?.body_md ?? "");
    for (const pattern of [
      /Dream Pen Celluloid/i,
      /SAKURA/,
      /2025/,
      /Kyoto/,
      /Roll Up/i,
      /titanium/i,
      /925/,
      /146 mm/,
      /128 mm/,
      /21 g/,
      /converter/i,
      /Sailor/,
      /18K/,
      /Kingyo|Bekko|Momiji|Seto/i,
      /维护/,
      /选购/,
    ])
      assert.match(body, pattern);
    assert.doesNotMatch(body, /canonical|made_by|数据库|仓库/i);

    const brand = (
      await client.execute({
        sql: "SELECT body_md FROM public_entities WHERE id=?",
        args: [PHASE359_WANCHER_BRAND_ID],
      })
    ).rows[0];
    assert.match(String(brand?.body_md ?? ""), /Celluloid/);
    assert.match(String(brand?.body_md ?? ""), /SAKURA/);
    const spec = (
      await client.execute({
        sql: "SELECT brand_entity_id,nib,fill_system,material,dimensions,status FROM model_specs WHERE entity_id=?",
        args: [PHASE359_TARGET_ID],
      })
    ).rows[0];
    assert.equal(String(spec?.brand_entity_id), PHASE359_WANCHER_BRAND_ID);
    assert.match(String(spec?.nib), /JoWo|18K|Keiryu/i);
    assert.match(String(spec?.fill_system), /cartridge\/converter/i);
    assert.match(String(spec?.material), /Celluloid/i);
    assert.match(String(spec?.dimensions), /146/);
    assert.match(String(spec?.status), /current|vary/i);
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS n FROM model_variants WHERE model_entity_id=?",
            args: [PHASE359_TARGET_ID],
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
            args: [PHASE359_TARGET_ID, PHASE359_WANCHER_BRAND_ID],
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
            args: [PHASE359_WANCHER_BRAND_ID, PHASE359_TARGET_ID],
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
            args: [PHASE359_TARGET_ID],
          })
        ).rows[0]?.n,
      ) >= 8,
    );
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS n FROM media_assets WHERE entity_id=? AND usage_status='primary'",
            args: [PHASE359_TARGET_ID],
          })
        ).rows[0]?.n,
      ),
      1,
    );
    const hash = await computePublicationContentHash(
      client,
      PHASE359_TARGET_ID,
    );
    assert.deepEqual(
      (
        await client.execute({
          sql: "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind",
          args: [PHASE359_TARGET_ID, hash],
        })
      ).rows.map((row) => [String(row.review_kind), String(row.status)]),
      [
        ["fact", "approved"],
        ["language", "approved"],
        ["media", "approved"],
        ["publication", "approved"],
      ],
    );
    const replay = await applyPhase359WancherDreamPenCelluloidSakuraContent(
      client,
      options,
    );
    assert.equal(
      replay.entities.find((item) => item.entityId === PHASE359_TARGET_ID)
        ?.outcome,
      "noop",
    );
    assertCatalogSnapshotUnchanged(snapshot, snapshotCatalogFiles(REAL));
  } finally {
    client.close();
  }
});
