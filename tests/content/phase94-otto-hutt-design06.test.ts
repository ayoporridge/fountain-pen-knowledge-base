import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import { applyPhase94OttoHuttDesign06Content } from "../../scripts/apply-phase94-otto-hutt-design06-content";
import {
  PHASE92_DESIGN04_ID,
  PHASE92_OTTO_HUTT_ID,
} from "../../scripts/data/phase92-otto-hutt-design04";
import { PHASE93_DESIGN07_ID } from "../../scripts/data/phase93-otto-hutt-design07";
import { PHASE94_DESIGN06_ID } from "../../scripts/data/phase94-otto-hutt-design06";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd(),
  REAL = path.join(ROOT, "data", "fpkg.db");
async function count(client: Client, sql: string, args: string[]) {
  const result = await client.execute({ sql, args });
  return Number(result.rows[0]?.value ?? 0);
}
test("Phase 94 publishes Otto Hutt design06 and full brand navigation on an owned checkpoint", async () => {
  const snapshot = snapshotCatalogFiles(REAL),
    ownedRoot = fs.realpathSync.native(
      fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase94-otto-hutt-")),
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
    reviewer: "phase94-otto-hutt-test",
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
      applyPhase94OttoHuttDesign06Content(client, {
        ...options,
        env: { ...options.env, TURSO_DATABASE_URL: "libsql://remote" },
      }),
      /refuses inherited remote selection: TURSO_DATABASE_URL/,
    );
    const first = await applyPhase94OttoHuttDesign06Content(client, options);
    assert.deepEqual(
      first.entities.map((item) => item.outcome),
      ["published", "published"],
    );
    const row = await client.execute({
      sql: "SELECT length(body_md) AS size, body_md FROM public_entities WHERE id=?",
      args: [PHASE94_DESIGN06_ID],
    });
    assert.equal(row.rows.length, 1);
    assert.ok(Number(row.rows[0]?.size) >= 2000);
    const body = String(row.rows[0]?.body_md ?? "");
    assert.match(body, /实心铝[\s\S]*(?:finish|版本|样本)[\s\S]*(?:45\.5|46)/i);
    assert.doesNotMatch(
      body,
      /\b(?:canonical|made_by|market_sku|retired)\b|数据库|仓库/i,
    );
    assert.equal(
      await count(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
        [PHASE94_DESIGN06_ID, PHASE92_OTTO_HUTT_ID],
      ),
      1,
    );
    assert.equal(
      await count(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND link_type='reverse' AND target_id IN (?, ?, ?)",
        [
          PHASE92_OTTO_HUTT_ID,
          PHASE92_DESIGN04_ID,
          PHASE93_DESIGN07_ID,
          PHASE94_DESIGN06_ID,
        ],
      ),
      3,
    );
    const replay = await applyPhase94OttoHuttDesign06Content(client, options);
    assert.deepEqual(
      replay.entities.map((item) => item.outcome),
      ["noop", "noop"],
    );
    assertCatalogSnapshotUnchanged(snapshot);
  } finally {
    client.close();
  }
});
