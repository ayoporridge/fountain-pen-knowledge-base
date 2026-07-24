import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase168MooreFingertip } from "../../scripts/apply-phase168-moore-fingertip-content";
import {
  PHASE168_FINGERTIP_ID,
  PHASE168_MOORE_BRAND_ID,
} from "../../scripts/data/phase168-moore-fingertip";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

test("Phase 168 publishes Moore Fingertip on an owned copy", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const root = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase168-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(root, "catalog.db"),
    root,
    { expectedSourceSnapshot: snapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options = {
    workspaceRoot: ROOT,
    reviewer: "phase168-moore-fingertip-test",
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
      applyPhase168MooreFingertip(client, {
        ...options,
        env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
      }),
      /refuses inherited remote database selection/,
    );
    const first = await applyPhase168MooreFingertip(client, options);
    assert.deepEqual(
      first.entities.map((item) => item.entityId),
      [PHASE168_MOORE_BRAND_ID, PHASE168_FINGERTIP_ID],
    );
    for (const [id, minimum, marker] of [
      [PHASE168_MOORE_BRAND_ID, 1200, /Moore|Fingertip/i],
      [PHASE168_FINGERTIP_ID, 2000, /Fingertip|内嵌式|1946/i],
    ] as const) {
      assert.equal(
        first.entities.find((item) => item.entityId === id)?.outcome,
        "published",
      );
      const row = await client.execute({
        sql: "SELECT body_md,source FROM public_entities WHERE id=?",
        args: [id],
      });
      const body = String(row.rows[0]?.body_md ?? "");
      assert.ok(Array.from(body).length >= minimum, `${id} body too short`);
      assert.match(body, marker);
      assert.ok(
        !/canonical|made_by|market_sku|retired|数据库|仓库/i.test(body),
      );
      assert.match(
        String(row.rows[0]?.source ?? ""),
        /curated-content:phase168-moore/,
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
    }
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
          args: [PHASE168_FINGERTIP_ID, PHASE168_MOORE_BRAND_ID],
        })
      ).rows[0]?.value,
      1,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
          args: [PHASE168_MOORE_BRAND_ID, PHASE168_FINGERTIP_ID],
        })
      ).rows[0]?.value,
      1,
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS value FROM media_assets WHERE entity_id IN (?,?) AND usage_status='primary'",
          args: [PHASE168_MOORE_BRAND_ID, PHASE168_FINGERTIP_ID],
        })
      ).rows[0]?.value,
      2,
    );
    assert.ok(
      (await applyPhase168MooreFingertip(client, options)).entities.every(
        (item) => item.outcome === "noop",
      ),
    );
    assertCatalogSnapshotUnchanged(snapshot);
  } finally {
    client.close();
    fs.rmSync(root, { recursive: true, force: true });
  }
});
