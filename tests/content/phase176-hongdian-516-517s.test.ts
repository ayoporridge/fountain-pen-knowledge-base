import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase176Hongdian516517s } from "../../scripts/apply-phase176-hongdian-516-517s-content";
import {
  PHASE176_HONGDIAN_BRAND_ID,
  PHASE176_IDS,
} from "../../scripts/data/phase176-hongdian-516-517s";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

test("Phase 176 publishes HongDian 516 and 517S on an owned copy", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.mkdtempSync(
    path.join(os.tmpdir(), "fpkg-phase176-hongdian-516-517s-"),
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
    reviewer: "phase176-hongdian-516-517s-test",
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
      applyPhase176Hongdian516517s(client, {
        ...options,
        env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
      }),
      /refuses inherited remote database selection/,
    );
    const first = await applyPhase176Hongdian516517s(client, options);
    assert.deepEqual(
      first.entities.map((item) => item.entityId),
      [
        PHASE176_HONGDIAN_BRAND_ID,
        PHASE176_IDS.model516,
        PHASE176_IDS.model517s,
      ],
    );
    for (const entityId of [PHASE176_IDS.model516, PHASE176_IDS.model517s]) {
      assert.equal(
        first.entities.find((item) => item.entityId === entityId)?.outcome,
        "published",
      );
      const row = await client.execute({
        sql: "SELECT body_md,source FROM public_entities WHERE id=?",
        args: [entityId],
      });
      const body = String(row.rows[0]?.body_md ?? "");
      assert.ok(Array.from(body).length >= 2200, `${entityId} body too short`);
      assert.match(body, /HongDian|不锈钢|converter|维护|选购/i);
      assert.ok(
        !/canonical|made_by|market_sku|retired|数据库|仓库/i.test(body),
      );
      assert.match(
        String(row.rows[0]?.source ?? ""),
        /curated-content:phase176-hongdian-/,
      );
      assert.equal(
        (
          await client.execute({
            sql: "SELECT status FROM entity_publications WHERE entity_id=?",
            args: [entityId],
          })
        ).rows[0]?.status,
        "published",
      );
      assert.equal(
        (
          await client.execute({
            sql: "SELECT count(*) AS value FROM media_assets WHERE entity_id=? AND usage_status='primary'",
            args: [entityId],
          })
        ).rows[0]?.value,
        1,
      );
      for (const linkType of ["made_by", "reverse"] as const) {
        const [sourceId, targetId] =
          linkType === "made_by"
            ? [entityId, PHASE176_HONGDIAN_BRAND_ID]
            : [PHASE176_HONGDIAN_BRAND_ID, entityId];
        assert.equal(
          (
            await client.execute({
              sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type=?",
              args: [sourceId, targetId, linkType],
            })
          ).rows[0]?.value,
          1,
        );
      }
    }
    assert.ok(
      (await applyPhase176Hongdian516517s(client, options)).entities.every(
        (item) => item.outcome === "noop",
      ),
    );
    assertCatalogSnapshotUnchanged(snapshot);
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
});
