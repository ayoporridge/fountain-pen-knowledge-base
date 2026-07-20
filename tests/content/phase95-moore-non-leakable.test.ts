import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase95MooreContent } from "../../scripts/apply-phase95-moore-non-leakable-content";
import {
  PHASE95_MOORE_BRAND_ID,
  PHASE95_MOORE_NON_LEAKABLE_ID,
} from "../../scripts/data/phase95-moore-non-leakable";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL_CATALOG = path.join(ROOT, "data", "fpkg.db");

async function scalar(
  client: ReturnType<typeof createClient>,
  sql: string,
  args: string[],
): Promise<number> {
  const result = await client.execute({ sql, args });
  return Number(result.rows[0]?.value ?? 0);
}

test("Phase 95 replaces copied Moore material with a sourced brand and Non-Leakable page on an owned checkpoint", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase95-moore-")),
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
    reviewer: "phase95-moore-test",
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
    await assert.rejects(
      applyPhase95MooreContent(client, {
        ...options,
        env: { ...options.env, TURSO_DATABASE_URL: "libsql://remote" },
      }),
      /refuses inherited remote selection: TURSO_DATABASE_URL/,
    );
    const first = await applyPhase95MooreContent(client, options);
    assert.deepEqual(
      first.entities.map((entity) => entity.outcome),
      ["published", "published"],
    );
    const rows = await client.execute({
      sql: "SELECT id, length(body_md) AS body_length, body_md FROM public_entities WHERE id IN (?, ?) ORDER BY id",
      args: [PHASE95_MOORE_BRAND_ID, PHASE95_MOORE_NON_LEAKABLE_ID],
    });
    assert.equal(rows.rows.length, 2);
    for (const row of rows.rows) {
      assert.ok(Number(row.body_length) >= 2_000);
      assert.doesNotMatch(
        String(row.body_md),
        /richardspens\.com\/images|\b(?:canonical|made_by|market_sku|retired)\b|数据库|仓库/i,
      );
    }
    const penBody = String(
      rows.rows.find((row) => String(row.id) === PHASE95_MOORE_NON_LEAKABLE_ID)
        ?.body_md ?? "",
    );
    assert.match(
      penBody,
      /1894[\s\S]*1896[\s\S]*(?:收尖|安全笔)[\s\S]*(?:滑套|旋帽)/,
    );
    assert.match(penBody, /杠杆上墨[\s\S]*(?:不能共享|不同的上墨结构)/);
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'",
        [PHASE95_MOORE_NON_LEAKABLE_ID, PHASE95_MOORE_BRAND_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'reverse'",
        [PHASE95_MOORE_BRAND_ID, PHASE95_MOORE_NON_LEAKABLE_ID],
      ),
      1,
    );
    const replay = await applyPhase95MooreContent(client, options);
    assert.deepEqual(
      replay.entities.map((entity) => entity.outcome),
      ["noop", "noop"],
    );
    assertCatalogSnapshotUnchanged(protectedSnapshot);
  } finally {
    client.close();
  }
});
