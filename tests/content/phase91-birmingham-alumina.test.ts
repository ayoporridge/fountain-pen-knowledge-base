import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import { applyPhase91BirminghamAluminaContent } from "../../scripts/apply-phase91-birmingham-alumina-content";
import {
  PHASE91_ALUMINA_MODEL_C_ID,
  PHASE91_BIRMINGHAM_BRAND_ID,
} from "../../scripts/data/phase91-birmingham-alumina";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL_CATALOG = path.join(ROOT, "data", "fpkg.db");

async function scalar(
  client: Client,
  sql: string,
  args: string[] = [],
): Promise<number> {
  const result = await client.execute({ sql, args });
  return Number(result.rows[0]?.value ?? 0);
}

test("Phase 91 publishes Birmingham and exact Alumina Model-C only on an owned checkpoint", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase91-birmingham-")),
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
    reviewer: "phase91-birmingham-test",
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
      applyPhase91BirminghamAluminaContent(client, {
        ...options,
        env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
      }),
      /refuses inherited remote selection: FPKG_DATABASE_URL/,
    );
    const first = await applyPhase91BirminghamAluminaContent(client, options);
    assert.deepEqual(
      first.entities.map((entity) => entity.outcome),
      ["published", "published"],
    );
    const rows = await client.execute({
      sql: "SELECT id, slug, length(body_md) AS body_length, body_md FROM public_entities WHERE id IN (?, ?) ORDER BY id",
      args: [PHASE91_BIRMINGHAM_BRAND_ID, PHASE91_ALUMINA_MODEL_C_ID],
    });
    assert.equal(rows.rows.length, 2);
    for (const row of rows.rows) {
      assert.ok(Number(row.body_length) >= 2_000);
      assert.doesNotMatch(
        String(row.body_md),
        /\b(?:canonical|made_by|market_sku|retired)\b|数据库|仓库/i,
      );
    }
    const alumina = String(
      rows.rows.find((row) => String(row.id) === PHASE91_ALUMINA_MODEL_C_ID)
        ?.body_md ?? "",
    );
    assert.match(
      alumina,
      /141\.8[\s\S]*154\.2[\s\S]*(?:31 g|31g)[\s\S]*(?:不建议|不应).*eyedropper/i,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'",
        [PHASE91_ALUMINA_MODEL_C_ID, PHASE91_BIRMINGHAM_BRAND_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'reverse'",
        [PHASE91_BIRMINGHAM_BRAND_ID, PHASE91_ALUMINA_MODEL_C_ID],
      ),
      1,
    );
    const replay = await applyPhase91BirminghamAluminaContent(client, options);
    assert.deepEqual(
      replay.entities.map((entity) => entity.outcome),
      ["noop", "noop"],
    );
    assertCatalogSnapshotUnchanged(protectedSnapshot);
  } finally {
    client.close();
  }
});
