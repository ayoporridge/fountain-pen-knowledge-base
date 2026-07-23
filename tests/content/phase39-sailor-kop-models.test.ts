import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase37SailorKopNaginataContent } from "../../scripts/apply-phase37-sailor-kop-naginata-content";
import { applyPhase39SailorKopModelsContent } from "../../scripts/apply-phase39-sailor-kop-models-content";
import {
  PHASE39_KING_PROFIT_EBONITE_ID,
  PHASE39_KING_PROFIT_ST_ID,
  PHASE39_NAGINATA_7121_ID,
  PHASE39_PRO_GEAR_KOP_ID,
  PHASE39_SAILOR_BRAND_ID,
} from "../../scripts/data/phase39-sailor-kop-models";
import {
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL_CATALOG = path.join(ROOT, "data", "fpkg.db");
const PEN_IDS = [
  PHASE39_KING_PROFIT_ST_ID,
  PHASE39_KING_PROFIT_EBONITE_ID,
  PHASE39_PRO_GEAR_KOP_ID,
  PHASE39_NAGINATA_7121_ID,
] as const;
async function scalar(
  client: ReturnType<typeof createClient>,
  sql: string,
  args: string[] = [],
): Promise<number> {
  const result = await client.execute({ sql, args });
  return Number(result.rows[0]?.value ?? 0);
}

test("Phase 39 publishes four exact Sailor KOP model pages on an owned copy", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase39-sailor-")),
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
    reviewer: "phase39-sailor-kop-models",
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
    await applyPhase37SailorKopNaginataContent(client, options);
    await applyPhase39SailorKopModelsContent(client, options);
    const rows = await client.execute({
      sql: "SELECT id, type, slug, length(summary) AS summary_length, length(body_md) AS body_length FROM entities WHERE id IN (?, ?, ?, ?) ORDER BY id",
      args: [...PEN_IDS],
    });
    assert.equal(rows.rows.length, 4);
    for (const row of rows.rows) {
      assert.equal(String(row.type), "pen");
      assert.ok(Number(row.summary_length) >= 60);
      assert.ok(Number(row.body_length) >= 2000);
    }
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM public_entities WHERE id IN (?, ?, ?, ?)",
        [...PEN_IDS],
      ),
      4,
    );
    for (const id of PEN_IDS) {
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'",
          [id, PHASE39_SAILOR_BRAND_ID],
        ),
        1,
      );
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'reverse'",
          [PHASE39_SAILOR_BRAND_ID, id],
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
        "SELECT count(*) AS value FROM entity_aliases WHERE entity_id = ? AND alias = 'Sailor KOP'",
        [PHASE39_KING_PROFIT_ST_ID],
      ),
      0,
    );
    const replay = await applyPhase39SailorKopModelsContent(client, options);
    assert.deepEqual(
      replay.entities.map((entity) => entity.outcome),
      ["noop", "noop", "noop", "noop", "noop"],
    );
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assert.deepEqual(snapshotCatalogFiles(REAL_CATALOG), protectedSnapshot);
});
