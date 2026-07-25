import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase179Jinhao9928510 } from "../../scripts/apply-phase179-jinhao-992-85-10-content";
import {
  PHASE179_IDS,
  PHASE179_JINHAO_BRAND_ID,
} from "../../scripts/data/phase179-jinhao-992-85-10";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");
const PEN_IDS = [
  PHASE179_IDS.model992,
  PHASE179_IDS.model85,
  PHASE179_IDS.model10,
] as const;

test("Phase 179 publishes Jinhao 992, 85 and 10 on an owned copy", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.mkdtempSync(
    path.join(os.tmpdir(), "fpkg-phase179-jinhao-"),
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
    reviewer: "phase179-jinhao-992-85-10-test",
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
      applyPhase179Jinhao9928510(client, {
        ...options,
        env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
      }),
      /refuses inherited remote database selection/,
    );
    const first = await applyPhase179Jinhao9928510(client, options);
    assert.deepEqual(
      first.entities.map((item) => item.entityId),
      [PHASE179_JINHAO_BRAND_ID, ...PEN_IDS],
    );
    for (const [entityId, marker] of [
      [PHASE179_IDS.model992, /992/],
      [PHASE179_IDS.model85, /85/],
      [PHASE179_IDS.model10, /Jinhao 10|按动|converter/i],
    ] as const) {
      assert.equal(
        first.entities.find((item) => item.entityId === entityId)?.outcome,
        "published",
      );
      const row = await client.execute({
        sql: "SELECT body_md,source FROM public_entities WHERE id=?",
        args: [entityId],
      });
      const body = String(row.rows[0]?.body_md ?? "");
      assert.ok(Array.from(body).length >= 2200, `${entityId} body too short`);
      assert.match(body, marker);
      assert.match(body, /converter|维护|选购/i);
      assert.ok(
        !/canonical|made_by|market_sku|retired|数据库|仓库/i.test(body),
      );
      assert.match(
        String(row.rows[0]?.source ?? ""),
        /curated-content:phase179-jinhao-/,
      );
      assert.equal(
        (
          await client.execute({
            sql: "SELECT status FROM entity_publications WHERE entity_id=?",
            args: [entityId],
          })
        ).rows[0]?.status,
        "published",
      );
      assert.equal(
        (
          await client.execute({
            sql: "SELECT count(*) AS value FROM media_assets WHERE entity_id=? AND usage_status='primary'",
            args: [entityId],
          })
        ).rows[0]?.value,
        1,
      );
      assert.equal(
        (
          await client.execute({
            sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
            args: [entityId, PHASE179_JINHAO_BRAND_ID],
          })
        ).rows[0]?.value,
        1,
      );
      assert.equal(
        (
          await client.execute({
            sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
            args: [PHASE179_JINHAO_BRAND_ID, entityId],
          })
        ).rows[0]?.value,
        1,
      );
    }
    assert.ok(
      (await applyPhase179Jinhao9928510(client, options)).entities.every(
        (item) => item.outcome === "noop",
      ),
    );
    assertCatalogSnapshotUnchanged(snapshot);
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
});
