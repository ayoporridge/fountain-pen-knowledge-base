import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import { applyPhase92OttoHuttDesign04Content } from "../../scripts/apply-phase92-otto-hutt-design04-content";
import {
  PHASE92_DESIGN04_ID,
  PHASE92_OTTO_HUTT_ID,
} from "../../scripts/data/phase92-otto-hutt-design04";
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
test("Phase 92 publishes Otto Hutt and exact design04 on an owned checkpoint", async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase92-otto-hutt-")),
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
    reviewer: "phase92-otto-hutt-test",
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
      applyPhase92OttoHuttDesign04Content(client, {
        ...options,
        env: { ...options.env, TURSO_DATABASE_URL: "libsql://remote" },
      }),
      /refuses inherited remote selection: TURSO_DATABASE_URL/,
    );
    const first = await applyPhase92OttoHuttDesign04Content(client, options);
    assert.deepEqual(
      first.entities.map((item) => item.outcome),
      ["published", "published"],
    );
    const rows = await client.execute({
      sql: "SELECT id,length(body_md) AS size,body_md FROM public_entities WHERE id IN (?,?) ORDER BY id",
      args: [PHASE92_OTTO_HUTT_ID, PHASE92_DESIGN04_ID],
    });
    assert.equal(rows.rows.length, 2);
    for (const row of rows.rows) {
      assert.ok(
        Number(row.size) >=
          (String(row.id) === PHASE92_OTTO_HUTT_ID ? 1200 : 2000),
      );
      assert.doesNotMatch(
        String(row.body_md),
        /\b(?:canonical|made_by|market_sku|retired)\b|数据库|仓库/i,
      );
    }
    const body = String(
      rows.rows.find((row) => String(row.id) === PHASE92_DESIGN04_ID)
        ?.body_md ?? "",
    );
    assert.match(body, /PVD[\s\S]*18K[\s\S]*(?:finish|版本|型号)/i);
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
        [PHASE92_DESIGN04_ID, PHASE92_OTTO_HUTT_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
        [PHASE92_OTTO_HUTT_ID, PHASE92_DESIGN04_ID],
      ),
      1,
    );
    const replay = await applyPhase92OttoHuttDesign04Content(client, options);
    assert.deepEqual(
      replay.entities.map((item) => item.outcome),
      ["noop", "noop"],
    );
    assertCatalogSnapshotUnchanged(snapshot);
  } finally {
    client.close();
  }
});
