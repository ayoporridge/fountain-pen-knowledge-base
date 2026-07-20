import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase98PenBbsContent } from "../../scripts/apply-phase98-penbbs-308-355-content";
import { PHASE72_PENBBS_BRAND_ID } from "../../scripts/data/phase72-delike-duke-penbbs";
import {
  PHASE98_PENBBS_308_ID,
  PHASE98_PENBBS_355_ID,
} from "../../scripts/data/phase98-penbbs-308-355";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");
const PENS = [PHASE98_PENBBS_308_ID, PHASE98_PENBBS_355_ID] as const;

async function count(
  client: ReturnType<typeof createClient>,
  sql: string,
  args: string[],
) {
  const result = await client.execute({ sql, args });
  return Number(result.rows[0]?.value ?? 0);
}

test("Phase 98 publishes PenBBS 308 and 355 as distinct filling systems", async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const root = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase98-penbbs-")),
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
    reviewer: "phase98-penbbs-test",
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
      applyPhase98PenBbsContent(client, {
        ...options,
        env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
      }),
      /refuses inherited remote database selection/,
    );
    assert.deepEqual(
      (await applyPhase98PenBbsContent(client, options)).entities.map(
        (item) => item.outcome,
      ),
      ["published", "published", "published"],
    );
    const brand = await client.execute({
      sql: "SELECT body_md FROM public_entities WHERE id = ?",
      args: [PHASE72_PENBBS_BRAND_ID],
    });
    assert.equal(brand.rows.length, 1);
    const brandBody = String(brand.rows[0]?.body_md);
    assert.ok(brandBody.indexOf("268") < brandBody.indexOf("308"));
    assert.ok(brandBody.indexOf("308") < brandBody.indexOf("355"));
    for (const penId of PENS) {
      const pen = await client.execute({
        sql: "SELECT body_md FROM public_entities WHERE id = ?",
        args: [penId],
      });
      assert.equal(pen.rows.length, 1);
      assert.ok(Array.from(String(pen.rows[0]?.body_md ?? "")).length >= 2_000);
      assert.ok(
        !/canonical|made_by|market_sku|retired|数据库|仓库/i.test(
          String(pen.rows[0]?.body_md),
        ),
      );
      assert.equal(
        await count(
          client,
          "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'",
          [penId, PHASE72_PENBBS_BRAND_ID],
        ),
        1,
      );
    }
    const specs = await count(
      client,
      "SELECT count(*) AS value FROM model_specs WHERE entity_id IN (?, ?)",
      [...PENS],
    );
    assert.equal(specs, 2);
    assert.deepEqual(
      (await applyPhase98PenBbsContent(client, options)).entities.map(
        (item) => item.outcome,
      ),
      ["noop", "noop", "noop"],
    );
    assertCatalogSnapshotUnchanged(snapshot);
  } finally {
    client.close();
  }
});
