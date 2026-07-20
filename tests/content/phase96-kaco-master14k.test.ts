import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase96KacoMaster14kContent } from "../../scripts/apply-phase96-kaco-master14k-content";
import {
  PHASE96_KACO_BRAND_ID,
  PHASE96_KACO_MASTER14K_ID,
} from "../../scripts/data/phase96-kaco-master14k";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd(),
  REAL = path.join(ROOT, "data", "fpkg.db");
async function count(
  client: ReturnType<typeof createClient>,
  sql: string,
  args: string[],
) {
  const result = await client.execute({ sql, args });
  return Number(result.rows[0]?.value ?? 0);
}

test("Phase 96 publishes KACO and historical Master 14K without mixing current Master fields", async () => {
  const snapshot = snapshotCatalogFiles(REAL),
    ownedRoot = fs.realpathSync.native(
      fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase96-kaco-")),
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
    reviewer: "phase96-kaco-test",
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
      applyPhase96KacoMaster14kContent(client, {
        ...options,
        env: { ...options.env, TURSO_DATABASE_URL: "libsql://remote" },
      }),
      /refuses inherited remote selection/,
    );
    assert.deepEqual(
      (await applyPhase96KacoMaster14kContent(client, options)).entities.map(
        (entity) => entity.outcome,
      ),
      ["published", "published"],
    );
    const rows = await client.execute({
      sql: "SELECT id,length(body_md) AS size,body_md FROM public_entities WHERE id IN (?,?) ORDER BY id",
      args: [PHASE96_KACO_BRAND_ID, PHASE96_KACO_MASTER14K_ID],
    });
    assert.equal(rows.rows.length, 2);
    for (const row of rows.rows) {
      assert.ok(Number(row.size) >= 2000);
      assert.doesNotMatch(
        String(row.body_md),
        /\b(?:canonical|made_by|market_sku|retired)\b|数据库|仓库/i,
      );
    }
    const pen = String(
      rows.rows.find((row) => String(row.id) === PHASE96_KACO_MASTER14K_ID)
        ?.body_md ?? "",
    );
    assert.match(pen, /14K[\s\S]*(?:当前|当代)[\s\S]*(?:不能|不是|不)/);
    assert.equal(
      await count(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
        [PHASE96_KACO_MASTER14K_ID, PHASE96_KACO_BRAND_ID],
      ),
      1,
    );
    assert.equal(
      await count(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
        [PHASE96_KACO_BRAND_ID, PHASE96_KACO_MASTER14K_ID],
      ),
      1,
    );
    assert.deepEqual(
      (await applyPhase96KacoMaster14kContent(client, options)).entities.map(
        (entity) => entity.outcome,
      ),
      ["noop", "noop"],
    );
    assertCatalogSnapshotUnchanged(snapshot);
  } finally {
    client.close();
  }
});
