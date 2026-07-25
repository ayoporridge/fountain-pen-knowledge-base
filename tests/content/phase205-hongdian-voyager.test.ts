import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase205HongdianVoyagerContent } from "../../scripts/apply-phase205-hongdian-voyager-content";
import {
  PHASE205_HONGDIAN_BRAND_ID,
  PHASE205_VOYAGER_ID,
} from "../../scripts/data/phase205-hongdian-voyager";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");
test("Phase 205 publishes HongDian 1843 Voyager on an owned copy", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.mkdtempSync(
    path.join(os.tmpdir(), "fpkg-phase205-hongdian-"),
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
    reviewer: "phase205-hongdian-voyager-test",
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
      () =>
        applyPhase205HongdianVoyagerContent(client, {
          ...options,
          env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
        }),
      /refuses inherited remote database selection/,
    );
    const first = await applyPhase205HongdianVoyagerContent(client, options);
    assert.deepEqual(
      first.entities.map((item) => item.entityId),
      [PHASE205_HONGDIAN_BRAND_ID, PHASE205_VOYAGER_ID],
    );
    const row = await client.execute({
      sql: "SELECT body_md,source FROM public_entities WHERE id=?",
      args: [PHASE205_VOYAGER_ID],
    });
    const body = String(row.rows[0]?.body_md ?? "");
    assert.ok(Array.from(body).length >= 2000, "Voyager body too short");
    assert.match(body, /维护|选购|清洗|漏墨/);
    assert.ok(!/canonical|made_by|market_sku|retired|数据库|仓库/i.test(body));
    assert.match(
      String(row.rows[0]?.source ?? ""),
      /curated-content:phase205-hongdian-voyager/,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT status FROM entity_publications WHERE entity_id=?",
          args: [PHASE205_VOYAGER_ID],
        })
      ).rows[0]?.status,
      "published",
    );
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS value FROM media_assets WHERE entity_id=? AND usage_status='primary'",
            args: [PHASE205_VOYAGER_ID],
          })
        ).rows[0]?.value,
      ),
      1,
    );
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
            args: [PHASE205_VOYAGER_ID, PHASE205_HONGDIAN_BRAND_ID],
          })
        ).rows[0]?.value,
      ),
      1,
    );
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
            args: [PHASE205_HONGDIAN_BRAND_ID, PHASE205_VOYAGER_ID],
          })
        ).rows[0]?.value,
      ),
      1,
    );
    assert.ok(
      (
        await applyPhase205HongdianVoyagerContent(client, options)
      ).entities.every((item) => item.outcome === "noop"),
    );
    assertCatalogSnapshotUnchanged(snapshot);
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
});
