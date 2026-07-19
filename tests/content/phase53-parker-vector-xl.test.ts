import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import { applyPhase53ParkerVectorXLContent } from "../../scripts/apply-phase53-parker-vector-xl-content";
import {
  PHASE53_PARKER_ID,
  PHASE53_VECTOR_ID,
  PHASE53_VECTOR_XL_ID,
  phase53ParkerVectorXLPacks,
} from "../../scripts/data/phase53-parker-vector-xl";
import {
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL_CATALOG = path.join(ROOT, "data", "fpkg.db");

async function scalar(
  client: Client,
  sql: string,
  args: string[] = [],
): Promise<number> {
  const result = await client.execute({ sql, args });
  return Number(result.rows[0]?.value ?? 0);
}

test("Phase 53 publishes classic Vector and separate current Vector XL from checkpoint copy", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase53-parker-vector-")),
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
    reviewer: "phase53-parker-vector-xl",
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
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entities WHERE id = ? AND type = 'brand' AND slug = 'parker'",
        [PHASE53_PARKER_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entities WHERE id = ? AND type = 'pen'",
        [PHASE53_VECTOR_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entities WHERE id = ?",
        [PHASE53_VECTOR_XL_ID],
      ),
      0,
    );

    const first = await applyPhase53ParkerVectorXLContent(client, options);
    assert.deepEqual(
      first.entities.map((entity) => [entity.entityId, entity.outcome]),
      [
        [PHASE53_PARKER_ID, "published"],
        [PHASE53_VECTOR_ID, "published"],
        [PHASE53_VECTOR_XL_ID, "published"],
      ],
    );
    assert.deepEqual(
      phase53ParkerVectorXLPacks.map((pack) => pack.entityId).sort(),
      [PHASE53_VECTOR_ID, PHASE53_VECTOR_XL_ID].sort(),
    );

    const rows = await client.execute({
      sql: "SELECT id, slug, name, length(summary) AS summary_length, length(body_md) AS body_length, body_md FROM public_entities WHERE id IN (?, ?) ORDER BY id",
      args: [PHASE53_VECTOR_ID, PHASE53_VECTOR_XL_ID],
    });
    assert.equal(rows.rows.length, 2);
    for (const row of rows.rows) {
      assert.ok(Number(row.summary_length) >= 60);
      assert.ok(Number(row.summary_length) <= 160);
      assert.ok(Number(row.body_length) >= 2_000);
      assert.match(String(row.body_md), /示意图，非产品照片/);
      assert.doesNotMatch(
        String(row.body_md),
        /数据库|仓库|canonical|made_by/i,
      );
    }
    const body = new Map(
      rows.rows.map((row) => [String(row.id), String(row.body_md)]),
    );
    assert.match(
      body.get(PHASE53_VECTOR_ID) ?? "",
      /1984 年 2 月[\s\S]*FP-1[\s\S]*PenHero[\s\S]*ballpoint[\s\S]*不属于本页/,
    );
    assert.match(
      body.get(PHASE53_VECTOR_ID) ?? "",
      /S0029690[\s\S]*1870805[\s\S]*S0881041/,
    );
    assert.match(
      body.get(PHASE53_VECTOR_XL_ID) ?? "",
      /2159746[\s\S]*135 mm[\s\S]*157 mm[\s\S]*11\.5 mm[\s\S]*20 g/,
    );
    assert.match(
      body.get(PHASE53_VECTOR_XL_ID) ?? "",
      /2159744[\s\S]*2159748[\s\S]*2159771Z/,
    );
    assert.match(
      body.get(PHASE53_VECTOR_XL_ID) ?? "",
      /2003 更新[\s\S]*ballpoint[\s\S]*不能证明 Vector XL/,
    );

    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entities WHERE id = ? AND type = 'pen' AND slug = 'parker-vector-xl-fountain-pen'",
        [PHASE53_VECTOR_XL_ID],
      ),
      1,
    );
    for (const entityId of [PHASE53_VECTOR_ID, PHASE53_VECTOR_XL_ID]) {
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'",
          [entityId, PHASE53_PARKER_ID],
        ),
        1,
      );
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'reverse'",
          [PHASE53_PARKER_ID, entityId],
        ),
        1,
      );
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM media_assets WHERE entity_id = ? AND usage_status = 'primary'",
          [entityId],
        ),
        1,
      );
    }
    assert.ok(
      await scalar(
        client,
        "SELECT count(*) AS value FROM source_items WHERE url LIKE '%penhero.com%'",
      ),
    );
    assert.ok(
      await scalar(
        client,
        "SELECT count(*) AS value FROM source_items WHERE title LIKE '%2024 A4 EMEA%'",
      ),
    );

    const replay = await applyPhase53ParkerVectorXLContent(client, options);
    assert.ok(replay.entities.every((entity) => entity.outcome === "noop"));
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assert.deepEqual(snapshotCatalogFiles(REAL_CATALOG), protectedSnapshot);
});
