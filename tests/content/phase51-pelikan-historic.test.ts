import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase51PelikanHistoricContent } from "../../scripts/apply-phase51-pelikan-historic-content";
import {
  PHASE51_MODEL_100_ID,
  PHASE51_MODEL_100N_ID,
  PHASE51_PELIKAN_ID,
  PHASE51_PELIKANO_ID,
} from "../../scripts/data/phase51-pelikan-historic";
import {
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL_CATALOG = path.join(ROOT, "data", "fpkg.db");
const PEN_IDS = [
  PHASE51_MODEL_100_ID,
  PHASE51_MODEL_100N_ID,
  PHASE51_PELIKANO_ID,
] as const;

async function scalar(
  client: ReturnType<typeof createClient>,
  sql: string,
  args: string[] = [],
): Promise<number> {
  const result = await client.execute({ sql, args });
  return Number(result.rows[0]?.value ?? 0);
}

test("Phase 51 publishes Pelikan Model 100, 100N and Pelikano on an owned copy", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase51-pelikan-")),
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
    reviewer: "phase51-pelikan-historic",
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
    const result = await applyPhase51PelikanHistoricContent(client, options);
    assert.deepEqual(
      result.entities.map((entity) => entity.outcome),
      ["published", "published", "published", "published"],
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM public_entities WHERE id IN (?, ?, ?, ?)",
        [PHASE51_PELIKAN_ID, ...PEN_IDS],
      ),
      4,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id IN (?, ?, ?) AND target_id = ? AND link_type = 'made_by'",
        [...PEN_IDS, PHASE51_PELIKAN_ID],
      ),
      3,
    );
    const entities = await client.execute({
      sql: "SELECT id, type, slug, length(summary) AS summary_length, length(body_md) AS body_length FROM entities WHERE id IN (?, ?, ?) ORDER BY id",
      args: [...PEN_IDS],
    });
    assert.equal(entities.rows.length, 3);
    for (const row of entities.rows) {
      assert.equal(String(row.type), "pen");
      assert.ok(Number(row.summary_length) >= 80);
      assert.ok(Number(row.body_length) >= 2000);
    }
    assert.deepEqual(entities.rows.map((row) => String(row.slug)).sort(), [
      "pelikan-model-100",
      "pelikan-model-100n",
      "pelikan-pelikano",
    ]);
    for (const id of PEN_IDS) {
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'reverse'",
          [PHASE51_PELIKAN_ID, id],
        ),
        1,
      );
      const media = await client.execute({
        sql: "SELECT local_path, usage_status FROM media_assets WHERE entity_id = ?",
        args: [id],
      });
      assert.equal(media.rows.length, 1);
      assert.equal(String(media.rows[0]?.usage_status), "primary");
      const asset = path.join(
        ROOT,
        "public",
        String(media.rows[0]?.local_path).slice(1),
      );
      assert.match(fs.readFileSync(asset, "utf8"), /示意图，非产品照片/);
    }
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_aliases WHERE entity_id = ? AND alias = 'Pelikan Model 100'",
        [PHASE51_MODEL_100_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_aliases WHERE entity_id = ? AND alias = 'Pelikan Model 100N'",
        [PHASE51_MODEL_100N_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_aliases WHERE entity_id = ? AND alias = 'Pelikan Pelikano'",
        [PHASE51_PELIKANO_ID],
      ),
      1,
    );
    const before = await client.execute({
      sql: "SELECT entity_id, status, content_revision, approved_content_hash FROM entity_publications WHERE entity_id IN (?, ?, ?, ?) ORDER BY entity_id",
      args: [PHASE51_PELIKAN_ID, ...PEN_IDS],
    });
    const replay = await applyPhase51PelikanHistoricContent(client, options);
    assert.ok(replay.entities.every((entity) => entity.outcome === "noop"));
    const after = await client.execute({
      sql: "SELECT entity_id, status, content_revision, approved_content_hash FROM entity_publications WHERE entity_id IN (?, ?, ?, ?) ORDER BY entity_id",
      args: [PHASE51_PELIKAN_ID, ...PEN_IDS],
    });
    assert.deepEqual(after.rows, before.rows);
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assert.deepEqual(snapshotCatalogFiles(REAL_CATALOG), protectedSnapshot);
});
