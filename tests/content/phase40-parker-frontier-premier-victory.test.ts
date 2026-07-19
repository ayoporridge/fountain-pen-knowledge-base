import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase40ParkerFrontierPremierVictoryContent } from "../../scripts/apply-phase40-parker-frontier-premier-victory-content";
import {
  PHASE40_FRONTIER_ID,
  PHASE40_PARKER_ID,
  PHASE40_PREMIER_MODERN_ID,
  PHASE40_PREMIER_VINTAGE_ID,
  PHASE40_VICTORY_ID,
} from "../../scripts/data/phase40-parker-frontier-premier-victory";
import {
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL_CATALOG = path.join(ROOT, "data", "fpkg.db");
const PEN_IDS = [
  PHASE40_FRONTIER_ID,
  PHASE40_PREMIER_VINTAGE_ID,
  PHASE40_PREMIER_MODERN_ID,
  PHASE40_VICTORY_ID,
] as const;
async function scalar(
  client: ReturnType<typeof createClient>,
  sql: string,
  args: string[] = [],
): Promise<number> {
  const result = await client.execute({ sql, args });
  return Number(result.rows[0]?.value ?? 0);
}

test("Phase 40 publishes Parker Frontier, split Premier generations and Victory on an owned copy", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase40-parker-")),
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
    reviewer: "phase40-parker-frontier-premier-victory",
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
    await applyPhase40ParkerFrontierPremierVictoryContent(client, options);
    const rows = await client.execute({
      sql: "SELECT id, slug, length(summary) AS summary_length, length(body_md) AS body_length FROM public_entities WHERE id IN (?, ?, ?, ?) ORDER BY id",
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
        "SELECT count(*) AS value FROM entity_links WHERE target_id = ? AND link_type = 'made_by' AND source_id IN (?, ?, ?, ?)",
        [PHASE40_PARKER_ID, ...PEN_IDS],
      ),
      4,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_aliases WHERE alias = 'Parker Premier' AND entity_id IN (?, ?)",
        [PHASE40_PREMIER_VINTAGE_ID, PHASE40_PREMIER_MODERN_ID],
      ),
      0,
    );
    for (const id of PEN_IDS) {
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
      args: [PHASE40_PARKER_ID, ...PEN_IDS],
    });
    const replay = await applyPhase40ParkerFrontierPremierVictoryContent(
      client,
      options,
    );
    assert.deepEqual(
      replay.entities.map((entity) => entity.outcome),
      ["noop", "noop", "noop", "noop", "noop"],
    );
    const after = await client.execute({
      sql: "SELECT entity_id, status, content_revision, approved_content_hash FROM entity_publications WHERE entity_id IN (?, ?, ?, ?, ?) ORDER BY entity_id",
      args: [PHASE40_PARKER_ID, ...PEN_IDS],
    });
    assert.deepEqual(after.rows, before.rows);
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assert.deepEqual(snapshotCatalogFiles(REAL_CATALOG), protectedSnapshot);
});
