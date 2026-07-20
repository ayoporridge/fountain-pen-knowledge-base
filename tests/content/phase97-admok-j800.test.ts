import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase97AdmokJ800Content } from "../../scripts/apply-phase97-admok-j800-content";
import {
  PHASE97_ADMOK_BRAND_ID,
  PHASE97_ADMOK_J800_ID,
} from "../../scripts/data/phase97-admok-j800";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

async function count(
  client: ReturnType<typeof createClient>,
  sql: string,
  args: string[],
) {
  const result = await client.execute({ sql, args });
  return Number(result.rows[0]?.value ?? 0);
}

test("Phase 97 publishes Admok J800 without conflating it with Pelikan M800", async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const root = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase97-admok-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(root, "catalog.db"),
    root,
    {
      expectedSourceSnapshot: snapshot,
    },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options = {
    workspaceRoot: ROOT,
    reviewer: "phase97-admok-test",
    databasePath: copy.destinationPath,
    ownedRoot: root,
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
      applyPhase97AdmokJ800Content(client, {
        ...options,
        env: { ...options.env, TURSO_DATABASE_URL: "libsql://remote" },
      }),
      /refuses inherited remote selection/,
    );
    assert.deepEqual(
      (await applyPhase97AdmokJ800Content(client, options)).entities.map(
        (item) => item.outcome,
      ),
      ["published", "published"],
    );
    const rows = await client.execute({
      sql: "SELECT id,length(body_md) AS size,body_md FROM public_entities WHERE id IN (?,?) ORDER BY id",
      args: [PHASE97_ADMOK_BRAND_ID, PHASE97_ADMOK_J800_ID],
    });
    assert.equal(rows.rows.length, 2);
    for (const row of rows.rows) {
      const minimum = String(row.id) === PHASE97_ADMOK_BRAND_ID ? 1200 : 2000;
      assert.ok(Number(row.size) >= minimum);
      assert.doesNotMatch(
        String(row.body_md),
        /\b(?:canonical|made_by|market_sku|retired)\b|数据库|仓库/i,
      );
    }
    const pen = String(
      rows.rows.find((row) => String(row.id) === PHASE97_ADMOK_J800_ID)
        ?.body_md ?? "",
    );
    assert.match(pen, /J800[\s\S]*M800[\s\S]*(?:不是|不能|不属于)/);
    assert.equal(
      await count(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
        [PHASE97_ADMOK_J800_ID, PHASE97_ADMOK_BRAND_ID],
      ),
      1,
    );
    assert.deepEqual(
      (await applyPhase97AdmokJ800Content(client, options)).entities.map(
        (item) => item.outcome,
      ),
      ["noop", "noop"],
    );
    assertCatalogSnapshotUnchanged(snapshot);
  } finally {
    client.close();
  }
});
