import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase174HongdianM2 } from "../../scripts/apply-phase174-hongdian-m2-content";
import {
  PHASE174_HONGDIAN_BRAND_ID,
  PHASE174_M2_ID,
} from "../../scripts/data/phase174-hongdian-m2";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

test("Phase 174 publishes HongDian M2 on an owned copy", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.mkdtempSync(
    path.join(os.tmpdir(), "fpkg-phase174-hongdian-m2-"),
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
    reviewer: "phase174-hongdian-m2-test",
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
      applyPhase174HongdianM2(client, {
        ...options,
        env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
      }),
      /refuses inherited remote database selection/,
    );
    const first = await applyPhase174HongdianM2(client, options);
    assert.deepEqual(
      first.entities.map((item) => item.entityId),
      [PHASE174_HONGDIAN_BRAND_ID, PHASE174_M2_ID],
    );
    assert.equal(
      first.entities.find((item) => item.entityId === PHASE174_M2_ID)?.outcome,
      "published",
    );
    const row = await client.execute({
      sql: "SELECT body_md,source FROM public_entities WHERE id=?",
      args: [PHASE174_M2_ID],
    });
    const body = String(row.rows[0]?.body_md ?? "");
    assert.ok(Array.from(body).length >= 2200, "M2 body too short");
    assert.match(body, /M2|铝制|converter|维护|选购/i);
    assert.ok(!/canonical|made_by|market_sku|retired|数据库|仓库/i.test(body));
    assert.match(
      String(row.rows[0]?.source ?? ""),
      /curated-content:phase174-hongdian-m2/,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT status FROM entity_publications WHERE entity_id=?",
          args: [PHASE174_M2_ID],
        })
      ).rows[0]?.status,
      "published",
    );
    for (const [sourceId, targetId, linkType] of [
      [PHASE174_M2_ID, PHASE174_HONGDIAN_BRAND_ID, "made_by"],
      [PHASE174_HONGDIAN_BRAND_ID, PHASE174_M2_ID, "reverse"],
    ] as const) {
      assert.equal(
        (
          await client.execute({
            sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type=?",
            args: [sourceId, targetId, linkType],
          })
        ).rows[0]?.value,
        1,
      );
    }
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS value FROM media_assets WHERE entity_id=? AND usage_status='primary'",
          args: [PHASE174_M2_ID],
        })
      ).rows[0]?.value,
      1,
    );
    assert.ok(
      (await applyPhase174HongdianM2(client, options)).entities.every(
        (item) => item.outcome === "noop",
      ),
    );
    assertCatalogSnapshotUnchanged(snapshot);
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
});
