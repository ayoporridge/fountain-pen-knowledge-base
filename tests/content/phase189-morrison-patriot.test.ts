import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase189MorrisonPatriotContent } from "../../scripts/apply-phase189-morrison-patriot-content";
import {
  PHASE189_MORRISON_BRAND_ID,
  PHASE189_PATRIOT_ID,
} from "../../scripts/data/phase189-morrison-patriot";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");
test("Phase 189 publishes Morrison and Patriot on an owned copy", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.mkdtempSync(
    path.join(os.tmpdir(), "fpkg-phase189-morrison-"),
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
    reviewer: "phase189-morrison-patriot-test",
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
      applyPhase189MorrisonPatriotContent(client, {
        ...options,
        env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
      }),
      /refuses inherited remote database selection/,
    );
    const first = await applyPhase189MorrisonPatriotContent(client, options);
    assert.deepEqual(
      first.entities.map((item) => item.entityId),
      [PHASE189_MORRISON_BRAND_ID, PHASE189_PATRIOT_ID],
    );
    for (const id of [PHASE189_MORRISON_BRAND_ID, PHASE189_PATRIOT_ID]) {
      const row = await client.execute({
        sql: "SELECT body_md,source FROM public_entities WHERE id=?",
        args: [id],
      });
      const body = String(row.rows[0]?.body_md ?? "");
      assert.ok(Array.from(body).length >= 2000, `${id} body too short`);
      assert.match(body, /维护|选购|清洗|修复/);
      assert.ok(
        !/canonical|made_by|market_sku|retired|数据库|仓库/i.test(body),
      );
      assert.match(
        String(row.rows[0]?.source ?? ""),
        /curated-content:phase189-morrison/,
      );
      assert.equal(
        (
          await client.execute({
            sql: "SELECT status FROM entity_publications WHERE entity_id=?",
            args: [id],
          })
        ).rows[0]?.status,
        "published",
      );
      assert.equal(
        Number(
          (
            await client.execute({
              sql: "SELECT count(*) AS value FROM media_assets WHERE entity_id=? AND usage_status='primary'",
              args: [id],
            })
          ).rows[0]?.value,
        ),
        1,
      );
    }
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
            args: [PHASE189_PATRIOT_ID, PHASE189_MORRISON_BRAND_ID],
          })
        ).rows[0]?.value,
      ),
      1,
    );
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
            args: [PHASE189_MORRISON_BRAND_ID, PHASE189_PATRIOT_ID],
          })
        ).rows[0]?.value,
      ),
      1,
    );
    assert.ok(
      (
        await applyPhase189MorrisonPatriotContent(client, options)
      ).entities.every((item) => item.outcome === "noop"),
    );
    assertCatalogSnapshotUnchanged(snapshot);
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
});
