import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import { applyPhase93OttoHuttDesign07Content } from "../../scripts/apply-phase93-otto-hutt-design07-content";
import {
  PHASE92_DESIGN04_ID,
  PHASE92_OTTO_HUTT_ID,
} from "../../scripts/data/phase92-otto-hutt-design04";
import { PHASE93_DESIGN07_ID } from "../../scripts/data/phase93-otto-hutt-design07";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");
async function scalar(client: Client, sql: string, args: string[]) {
  const result = await client.execute({ sql, args });
  return Number(result.rows[0]?.value ?? 0);
}

test("Phase 93 publishes exact Otto Hutt design07 after its brand prerequisite on an owned checkpoint", async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase93-otto-hutt-")),
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
    reviewer: "phase93-otto-hutt-test",
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
      applyPhase93OttoHuttDesign07Content(client, {
        ...options,
        env: { ...options.env, TURSO_DATABASE_URL: "libsql://remote" },
      }),
      /refuses inherited remote selection: TURSO_DATABASE_URL/,
    );
    const first = await applyPhase93OttoHuttDesign07Content(client, options);
    assert.deepEqual(
      first.entities.map((item) => item.outcome),
      ["published", "published"],
    );
    const row = await client.execute({
      sql: "SELECT length(body_md) AS size,body_md FROM public_entities WHERE id=?",
      args: [PHASE93_DESIGN07_ID],
    });
    assert.equal(row.rows.length, 1);
    assert.ok(Number(row.rows[0]?.size) >= 2000);
    const body = String(row.rows[0]?.body_md ?? "");
    assert.match(
      body,
      /sterling silver[\s\S]*(?:黑漆|lacquer)[\s\S]*(?:样本|版本|SKU)/i,
    );
    assert.doesNotMatch(
      body,
      /\b(?:canonical|made_by|market_sku|retired)\b|数据库|仓库/i,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
        [PHASE93_DESIGN07_ID, PHASE92_OTTO_HUTT_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
        [PHASE92_OTTO_HUTT_ID, PHASE93_DESIGN07_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND link_type='reverse' AND target_id IN (?, ?)",
        [PHASE92_OTTO_HUTT_ID, PHASE92_DESIGN04_ID, PHASE93_DESIGN07_ID],
      ),
      2,
    );
    const replay = await applyPhase93OttoHuttDesign07Content(client, options);
    assert.deepEqual(
      replay.entities.map((item) => item.outcome),
      ["noop", "noop"],
    );
    assertCatalogSnapshotUnchanged(snapshot);
  } finally {
    client.close();
  }
});
