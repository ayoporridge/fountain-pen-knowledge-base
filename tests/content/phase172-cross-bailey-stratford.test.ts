import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase172CrossBaileyStratford } from "../../scripts/apply-phase172-cross-bailey-stratford-content";
import { PHASE172_CROSS_IDS } from "../../scripts/data/phase172-cross-bailey-stratford";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

test("Phase 172 publishes Cross, Bailey Light, and bounded Stratford alias on an owned copy", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.mkdtempSync(
    path.join(os.tmpdir(), "fpkg-phase172-cross-"),
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
    reviewer: "phase172-cross-bailey-stratford-test",
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
    await assert.rejects(
      applyPhase172CrossBaileyStratford(client, {
        ...options,
        env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
      }),
      /refuses inherited remote database selection/,
    );
    const first = await applyPhase172CrossBaileyStratford(client, options);
    assert.deepEqual(
      first.entities.map((item) => item.entityId),
      Object.values(PHASE172_CROSS_IDS),
    );
    for (const [id, minimum, marker] of [
      [PHASE172_CROSS_IDS.brand, 1200, /Cross|1846|Peerless/i],
      [PHASE172_CROSS_IDS.baileyLight, 2000, /Bailey Light|8921|8751|树脂/i],
      [PHASE172_CROSS_IDS.stratfordAlias, 2000, /Stratford|莎士比亚|未核实/i],
    ] as const) {
      assert.equal(
        first.entities.find((item) => item.entityId === id)?.outcome,
        "published",
      );
      const row = await client.execute({
        sql: "SELECT body_md,source FROM public_entities WHERE id=?",
        args: [id],
      });
      const body = String(row.rows[0]?.body_md ?? "");
      assert.ok(Array.from(body).length >= minimum, `${id} body too short`);
      assert.match(body, marker);
      assert.ok(
        !/canonical|made_by|market_sku|retired|数据库|仓库/i.test(body),
      );
      assert.match(
        String(row.rows[0]?.source ?? ""),
        /curated-content:phase172-cross/,
      );
      assert.equal(
        (
          await client.execute({
            sql: "SELECT status FROM entity_publications WHERE entity_id=?",
            args: [id],
          })
        ).rows[0]?.status,
        "published",
      );
    }
    for (const id of [
      PHASE172_CROSS_IDS.baileyLight,
      PHASE172_CROSS_IDS.stratfordAlias,
    ]) {
      assert.equal(
        (
          await client.execute({
            sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
            args: [id, PHASE172_CROSS_IDS.brand],
          })
        ).rows[0]?.value,
        1,
      );
      assert.equal(
        (
          await client.execute({
            sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
            args: [PHASE172_CROSS_IDS.brand, id],
          })
        ).rows[0]?.value,
        1,
      );
    }
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS value FROM media_assets WHERE entity_id IN (?,?,?) AND usage_status='primary'",
          args: Object.values(PHASE172_CROSS_IDS),
        })
      ).rows[0]?.value,
      3,
    );
    assert.ok(
      (await applyPhase172CrossBaileyStratford(client, options)).entities.every(
        (item) => item.outcome === "noop",
      ),
    );
    assertCatalogSnapshotUnchanged(snapshot);
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
});
