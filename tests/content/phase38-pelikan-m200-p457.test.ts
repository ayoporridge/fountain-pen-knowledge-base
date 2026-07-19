import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase38PelikanM200P457Content } from "../../scripts/apply-phase38-pelikan-m200-p457-content";
import {
  PHASE38_M200_ID,
  PHASE38_P457_ID,
  PHASE38_PELIKAN_ID,
} from "../../scripts/data/phase38-pelikan-m200-p457";
import {
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL_CATALOG = path.join(ROOT, "data", "fpkg.db");
const PEN_IDS = [PHASE38_M200_ID, PHASE38_P457_ID] as const;
async function scalar(
  client: ReturnType<typeof createClient>,
  sql: string,
  args: string[] = [],
): Promise<number> {
  const result = await client.execute({ sql, args });
  return Number(result.rows[0]?.value ?? 0);
}

test("Phase 38 publishes Pelikan M200 and Twist P457 on an owned copy", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase38-pelikan-")),
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
    reviewer: "phase38-pelikan-m200-p457",
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
    await applyPhase38PelikanM200P457Content(client, options);
    const rows = await client.execute({
      sql: "SELECT id, type, slug, length(summary) AS summary_length, length(body_md) AS body_length FROM entities WHERE id IN (?, ?) ORDER BY id",
      args: [...PEN_IDS],
    });
    assert.equal(rows.rows.length, 2);
    for (const row of rows.rows) {
      assert.equal(String(row.type), "pen");
      assert.ok(Number(row.summary_length) >= 60);
      assert.ok(Number(row.body_length) >= 2000);
    }
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM public_entities WHERE id IN (?, ?)",
        [...PEN_IDS],
      ),
      2,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE target_id = ? AND link_type = 'reverse' AND source_id IN (?, ?)",
        [PHASE38_PELIKAN_ID, ...PEN_IDS],
      ),
      0,
    );
    for (const id of PEN_IDS) {
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'",
          [id, PHASE38_PELIKAN_ID],
        ),
        1,
      );
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'reverse'",
          [PHASE38_PELIKAN_ID, id],
        ),
        1,
      );
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM media_assets WHERE entity_id = ? AND usage_status = 'primary'",
          [id],
        ),
        1,
      );
      const media = await client.execute({
        sql: "SELECT local_path FROM media_assets WHERE entity_id = ?",
        args: [id],
      });
      const svg = fs.readFileSync(
        path.join(ROOT, "public", String(media.rows[0]?.local_path).slice(1)),
        "utf8",
      );
      assert.match(svg, /示意图，非产品照片/);
    }
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_aliases WHERE entity_id = ? AND alias = 'Pelikan M200'",
        [PHASE38_M200_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_aliases WHERE entity_id = ? AND alias = 'Pelikan Twist P457'",
        [PHASE38_P457_ID],
      ),
      1,
    );
    const replay = await applyPhase38PelikanM200P457Content(client, options);
    assert.deepEqual(
      replay.entities.map((entity) => entity.outcome),
      ["noop", "noop", "noop"],
    );
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assert.deepEqual(snapshotCatalogFiles(REAL_CATALOG), protectedSnapshot);
});
