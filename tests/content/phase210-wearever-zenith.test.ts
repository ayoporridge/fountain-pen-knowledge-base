import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase210WeareverZenithContent } from "../../scripts/apply-phase210-wearever-zenith-content";
import {
  PHASE210_WEAREVER_BRAND_ID,
  PHASE210_ZENITH_ID,
} from "../../scripts/data/phase210-wearever-zenith";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

test("Phase 210 publishes Wearever Zenith on an owned copy", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.mkdtempSync(
    path.join(os.tmpdir(), "fpkg-phase210-wearever-"),
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
    reviewer: "phase210-wearever-zenith-test",
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
        applyPhase210WeareverZenithContent(client, {
          ...options,
          env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
        }),
      /refuses inherited remote database selection/,
    );
    const first = await applyPhase210WeareverZenithContent(client, options);
    assert.deepEqual(
      first.entities.map((item) => item.entityId),
      [PHASE210_WEAREVER_BRAND_ID, PHASE210_ZENITH_ID],
    );
    assert.equal(
      first.entities.find((item) => item.entityId === PHASE210_ZENITH_ID)
        ?.outcome,
      "published",
    );
    const row = await client.execute({
      sql: "SELECT body_md,source FROM public_entities WHERE id=?",
      args: [PHASE210_ZENITH_ID],
    });
    const body = String(row.rows[0]?.body_md ?? "");
    assert.ok(Array.from(body).length >= 2200, "Zenith body too short");
    assert.match(body, /注塑|维护|选购|墨囊|战时/);
    assert.ok(!/canonical|made_by|market_sku|retired|数据库|仓库/i.test(body));
    assert.match(
      String(row.rows[0]?.source ?? ""),
      /curated-content:phase210-wearever-zenith/,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT status FROM entity_publications WHERE entity_id=?",
          args: [PHASE210_ZENITH_ID],
        })
      ).rows[0]?.status,
      "published",
    );
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS value FROM media_assets WHERE entity_id=? AND usage_status='primary'",
            args: [PHASE210_ZENITH_ID],
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
            args: [PHASE210_ZENITH_ID, PHASE210_WEAREVER_BRAND_ID],
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
            args: [PHASE210_WEAREVER_BRAND_ID, PHASE210_ZENITH_ID],
          })
        ).rows[0]?.value,
      ),
      1,
    );
    const replay = await applyPhase210WeareverZenithContent(client, options);
    assert.ok(
      replay.entities.every((item) => item.outcome === "noop"),
      JSON.stringify(replay),
    );
    assertCatalogSnapshotUnchanged(snapshot);
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
});
