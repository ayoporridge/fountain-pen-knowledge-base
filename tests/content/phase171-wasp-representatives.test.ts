import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase171WaspRepresentatives } from "../../scripts/apply-phase171-wasp-representatives-content";
import { PHASE171_WASP_IDS } from "../../scripts/data/phase171-wasp-representatives";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");
test("Phase 171 publishes WASP Addipoint and Clipper on an owned copy", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const root = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase171-")),
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
    reviewer: "phase171-wasp-representatives-test",
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
      applyPhase171WaspRepresentatives(client, {
        ...options,
        env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
      }),
      /refuses inherited remote database selection/,
    );
    const first = await applyPhase171WaspRepresentatives(client, options);
    assert.deepEqual(
      first.entities.map((item) => item.entityId),
      [
        PHASE171_WASP_IDS.brand,
        PHASE171_WASP_IDS.addipoint,
        PHASE171_WASP_IDS.clipper,
      ],
    );
    for (const [id, minimum, marker] of [
      [PHASE171_WASP_IDS.brand, 1200, /WASP|Addipoint|Clipper/i],
      [PHASE171_WASP_IDS.addipoint, 2000, /Addipoint|可换尖|1934/i],
      [PHASE171_WASP_IDS.clipper, 2000, /Clipper|Vacuum-Fil|观察窗/i],
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
        /curated-content:phase171-wasp/,
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
    for (const id of [PHASE171_WASP_IDS.addipoint, PHASE171_WASP_IDS.clipper]) {
      assert.equal(
        (
          await client.execute({
            sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
            args: [id, PHASE171_WASP_IDS.brand],
          })
        ).rows[0]?.value,
        1,
      );
      assert.equal(
        (
          await client.execute({
            sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
            args: [PHASE171_WASP_IDS.brand, id],
          })
        ).rows[0]?.value,
        1,
      );
    }
    assert.equal(
      (
        await client.execute({
          sql: "SELECT count(*) AS value FROM media_assets WHERE entity_id IN (?,?,?) AND usage_status='primary'",
          args: Object.values(PHASE171_WASP_IDS),
        })
      ).rows[0]?.value,
      3,
    );
    assert.ok(
      (await applyPhase171WaspRepresentatives(client, options)).entities.every(
        (item) => item.outcome === "noop",
      ),
    );
    assertCatalogSnapshotUnchanged(snapshot);
  } finally {
    client.close();
    fs.rmSync(root, { recursive: true, force: true });
  }
});
