import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase36ParkerContent } from "../../scripts/apply-phase36-parker-25-t1-50-falcon-100-content";
import {
  PHASE36_PARKER_25_ID,
  PHASE36_PARKER_50_ID,
  PHASE36_PARKER_100_ID,
  PHASE36_PARKER_ID,
  PHASE36_PARKER_T1_ID,
} from "../../scripts/data/phase36-parker-25-t1-50-falcon-100";
import {
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL_CATALOG = path.join(ROOT, "data", "fpkg.db");
const PEN_IDS = [
  PHASE36_PARKER_25_ID,
  PHASE36_PARKER_T1_ID,
  PHASE36_PARKER_50_ID,
  PHASE36_PARKER_100_ID,
] as const;
async function scalar(
  client: ReturnType<typeof createClient>,
  sql: string,
  args: string[] = [],
): Promise<number> {
  const result = await client.execute({ sql, args });
  return Number(result.rows[0]?.value ?? 0);
}

test("Phase 36 publishes Parker 25/T-1/50/100 on an owned copy and migrates Parker 100 alias", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase36-parker-")),
  );
  const databasePath = path.join(ownedRoot, "catalog.db");
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL_CATALOG,
    databasePath,
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options = {
    workspaceRoot: ROOT,
    reviewer: "phase36-parker-p25-t1-p50-p100",
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
        "SELECT count(*) AS value FROM entity_aliases WHERE alias = 'Parker 100' AND entity_id = ?",
        [PHASE36_PARKER_ID],
      ),
      1,
    );
    await applyPhase36ParkerContent(client, options);
    const rows = await client.execute({
      sql: "SELECT id, slug, name, length(summary) AS summary_length, length(body_md) AS body_length FROM public_entities WHERE id IN (?, ?, ?, ?) ORDER BY id",
      args: [...PEN_IDS],
    });
    assert.equal(rows.rows.length, 4);
    for (const row of rows.rows) {
      assert.ok(Number(row.summary_length) >= 60);
      assert.ok(Number(row.body_length) >= 2000);
    }
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_aliases WHERE alias = 'Parker 100' AND entity_id = ?",
        [PHASE36_PARKER_100_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_aliases WHERE alias = 'Parker 100'",
        [],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_aliases WHERE alias = 'T1' AND entity_id IN (?, ?, ?, ?)",
        [...PEN_IDS],
      ),
      0,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_aliases WHERE alias = 'Falcon' AND entity_id IN (?, ?, ?, ?)",
        [...PEN_IDS],
      ),
      0,
    );
    for (const id of PEN_IDS) {
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'",
          [id, PHASE36_PARKER_ID],
        ),
        1,
      );
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'reverse'",
          [PHASE36_PARKER_ID, id],
        ),
        1,
      );
      const media = await client.execute({
        sql: "SELECT local_path, license, usage_status FROM media_assets WHERE entity_id = ?",
        args: [id],
      });
      assert.equal(media.rows.length, 1);
      assert.equal(String(media.rows[0]?.license), "site-original");
      assert.equal(String(media.rows[0]?.usage_status), "primary");
      const localPath = String(media.rows[0]?.local_path ?? "");
      const svg = fs.readFileSync(
        path.join(ROOT, "public", localPath.slice(1)),
        "utf8",
      );
      assert.match(svg, /<desc id="description">/);
      assert.match(svg, /示意图，非产品照片/);
    }
    const before = await client.execute({
      sql: "SELECT entity_id, status, content_revision, approved_content_hash FROM entity_publications WHERE entity_id IN (?, ?, ?, ?, ?) ORDER BY entity_id",
      args: [PHASE36_PARKER_ID, ...PEN_IDS],
    });
    const replay = await applyPhase36ParkerContent(client, options);
    assert.deepEqual(
      replay.entities.map((entity) => entity.outcome),
      ["noop", "noop", "noop", "noop", "noop"],
    );
    const after = await client.execute({
      sql: "SELECT entity_id, status, content_revision, approved_content_hash FROM entity_publications WHERE entity_id IN (?, ?, ?, ?, ?) ORDER BY entity_id",
      args: [PHASE36_PARKER_ID, ...PEN_IDS],
    });
    assert.deepEqual(after.rows, before.rows);
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assert.deepEqual(snapshotCatalogFiles(REAL_CATALOG), protectedSnapshot);
});
