import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import { applyPhase66AsvineP36Content } from "../../scripts/apply-phase66-asvine-p36-content";
import { applyPhase88AsvineVacuumContent } from "../../scripts/apply-phase88-asvine-vacuum-content";
import { PHASE66_P36_ID } from "../../scripts/data/phase66-asvine-p36";
import {
  PHASE88_V126_ID,
  PHASE88_V126_SLUG,
  PHASE88_V200_ID,
  PHASE88_V200_SLUG,
} from "../../scripts/data/phase88-asvine-vacuum";
import {
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL_CATALOG = path.join(ROOT, "data", "fpkg.db");

async function count(
  client: Client,
  sql: string,
  args: string[] = [],
): Promise<number> {
  const result = await client.execute({ sql, args });
  return Number(result.rows[0]?.value ?? 0);
}

test("Phase 88 publishes exact Asvine V126/V200 pages and restores public brand navigation on an owned copy", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase88-asvine-vacuum-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL_CATALOG,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options = {
    workspaceRoot: ROOT,
    reviewer: "phase88-asvine-vacuum-test",
    databasePath: copy.destinationPath,
    ownedRoot,
    protectedCatalogPath: REAL_CATALOG,
    protectedCatalogSnapshot: protectedSnapshot,
    env: {
      ...process.env,
      TURSO_DATABASE_URL: "",
      TURSO_AUTH_TOKEN: "",
      FPKG_DATABASE_URL: "",
    },
  } as const;
  try {
    await migrateDatabase(client);
    await applyPhase66AsvineP36Content(client, {
      ...options,
      reviewer: "phase88-asvine-phase66-prerequisite",
    });
    const first = await applyPhase88AsvineVacuumContent(client, options);
    assert.deepEqual(
      first.entities.map((entity) => entity.outcome),
      ["published", "published", "published"],
    );

    const brand = await client.execute({
      sql: "SELECT id, length(summary) AS summary_length, length(body_md) AS body_length FROM public_entities WHERE type = 'brand' AND slug = 'asvine'",
      args: [],
    });
    assert.equal(brand.rows.length, 1);
    const brandId = String(brand.rows[0]?.id);
    assert.ok(Number(brand.rows[0]?.summary_length) >= 60);
    assert.ok(Number(brand.rows[0]?.body_length) >= 1_200);

    for (const [id, slug, terms] of [
      [
        PHASE88_V126_ID,
        PHASE88_V126_SLUG,
        [/真空上墨/, /止墨阀/, /P36/, /示意图，非产品照片/],
      ],
      [
        PHASE88_V200_ID,
        PHASE88_V200_SLUG,
        [/透明 acrylic/, /钛部件/, /真空上墨/, /示意图，非产品照片/],
      ],
    ] as const) {
      const page = await client.execute({
        sql: "SELECT body_md, length(summary) AS summary_length FROM public_entities WHERE id = ? AND slug = ?",
        args: [id, slug],
      });
      assert.equal(page.rows.length, 1);
      const body = String(page.rows[0]?.body_md ?? "");
      assert.ok(Array.from(body).length >= 2_000);
      assert.ok(Number(page.rows[0]?.summary_length) >= 60);
      for (const term of terms) assert.match(body, term);
      assert.doesNotMatch(body, /数据库|仓库|canonical|made_by|retired/i);
      assert.equal(
        await count(
          client,
          "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'",
          [id, brandId],
        ),
        1,
      );
      assert.equal(
        await count(
          client,
          "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND link_type = 'made_by'",
          [id],
        ),
        1,
      );
      const media = await client.execute({
        sql: "SELECT local_path FROM media_assets WHERE entity_id = ? AND usage_status = 'primary'",
        args: [id],
      });
      assert.equal(media.rows.length, 1);
      assert.match(
        fs.readFileSync(
          path.join(ROOT, "public", String(media.rows[0]?.local_path).slice(1)),
          "utf8",
        ),
        /示意图，非产品照片/,
      );
    }

    for (const penId of [PHASE66_P36_ID, PHASE88_V126_ID, PHASE88_V200_ID]) {
      assert.equal(
        await count(
          client,
          "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'reverse'",
          [brandId, penId],
        ),
        1,
      );
    }
    const publicAsvine = await count(
      client,
      "SELECT count(*) AS value FROM public_entities pen JOIN entity_links maker ON maker.source_id = pen.id AND maker.target_id = ? AND maker.link_type = 'made_by' WHERE pen.type = 'pen'",
      [brandId],
    );
    const publicReverse = await count(
      client,
      "SELECT count(*) AS value FROM public_entities pen JOIN entity_links reverse ON reverse.target_id = pen.id AND reverse.source_id = ? AND reverse.link_type = 'reverse' WHERE pen.type = 'pen'",
      [brandId],
    );
    assert.equal(publicReverse, publicAsvine);

    const replay = await applyPhase88AsvineVacuumContent(client, options);
    assert.ok(replay.entities.every((entity) => entity.outcome === "noop"));
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assert.deepEqual(snapshotCatalogFiles(REAL_CATALOG), protectedSnapshot);
});
