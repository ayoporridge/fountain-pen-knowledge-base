import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase619BrandModelDedup } from "../../scripts/apply-phase619-brand-model-dedup";
import { PHASE619_BRAND_IDS } from "../../scripts/data/phase619-brand-model-dedup";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

test("Phase 619 rewrites only six brand bodies and replays as noop on an owned copy", {
  timeout: 900_000,
}, async () => {
  const sourceSnapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase619-brand-dedup-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: sourceSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  try {
    await migrateDatabase(client);
    const snapshot = snapshotCatalogFiles(REAL);
    const options = {
      workspaceRoot: ROOT,
      reviewer: "phase619-brand-model-dedup-test",
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
    const beforeModel = await client.execute({
      sql: "SELECT body_md FROM entities WHERE slug=?",
      args: ["hongdian-n7-rabbit"],
    });
    const first = await applyPhase619BrandModelDedup(client, options);
    assert.deepEqual(
      first.entities.map((item) => item.entityId),
      Object.values(PHASE619_BRAND_IDS),
    );
    for (const id of Object.values(PHASE619_BRAND_IDS)) {
      const row = (
        await client.execute({
          sql: "SELECT type,slug,body_md,source FROM public_entities WHERE id=?",
          args: [id],
        })
      ).rows[0];
      assert.equal(String(row?.type), "brand");
      assert.ok(Array.from(String(row?.body_md ?? "")).length >= 2_600, id);
      assert.match(String(row?.source ?? ""), /^curated-content:/);
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
    const afterModel = await client.execute({
      sql: "SELECT body_md FROM entities WHERE slug=?",
      args: ["hongdian-n7-rabbit"],
    });
    assert.deepEqual(afterModel.rows, beforeModel.rows);
    const replay = await applyPhase619BrandModelDedup(client, options);
    assert.ok(replay.entities.every((item) => item.outcome === "noop"));
    assertCatalogSnapshotUnchanged(snapshot, snapshotCatalogFiles(REAL));
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
});
