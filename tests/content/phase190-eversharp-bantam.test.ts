import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase190EversharpBantamContent } from "../../scripts/apply-phase190-eversharp-bantam-content";
import {
  PHASE190_BANTAM_ID,
  PHASE190_EVERSHARP_BRAND_ID,
} from "../../scripts/data/phase190-eversharp-bantam";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

test("Phase 190 publishes Eversharp Bantam on an owned copy", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.mkdtempSync(
    path.join(os.tmpdir(), "fpkg-phase190-eversharp-"),
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
    reviewer: "phase190-eversharp-bantam-test",
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
      applyPhase190EversharpBantamContent(client, {
        ...options,
        env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
      }),
      /refuses inherited remote database selection/,
    );
    const first = await applyPhase190EversharpBantamContent(client, options);
    assert.deepEqual(
      first.entities.map((item) => item.entityId),
      [PHASE190_EVERSHARP_BRAND_ID, PHASE190_BANTAM_ID],
    );
    const row = await client.execute({
      sql: "SELECT body_md,source FROM public_entities WHERE id=?",
      args: [PHASE190_BANTAM_ID],
    });
    const body = String(row.rows[0]?.body_md ?? "");
    assert.ok(Array.from(body).length >= 2000, "Bantam body too short");
    assert.match(body, /维护|选购|清洗|修复/);
    assert.ok(!/canonical|made_by|market_sku|retired|数据库|仓库/i.test(body));
    assert.match(
      String(row.rows[0]?.source ?? ""),
      /curated-content:phase190-eversharp-bantam/,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT status FROM entity_publications WHERE entity_id=?",
          args: [PHASE190_BANTAM_ID],
        })
      ).rows[0]?.status,
      "published",
    );
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS value FROM media_assets WHERE entity_id=? AND usage_status='primary'",
            args: [PHASE190_BANTAM_ID],
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
            args: [PHASE190_BANTAM_ID, PHASE190_EVERSHARP_BRAND_ID],
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
            args: [PHASE190_EVERSHARP_BRAND_ID, PHASE190_BANTAM_ID],
          })
        ).rows[0]?.value,
      ),
      1,
    );
    assert.ok(
      (
        await applyPhase190EversharpBantamContent(client, options)
      ).entities.every((item) => item.outcome === "noop"),
    );
    assertCatalogSnapshotUnchanged(snapshot);
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
});
