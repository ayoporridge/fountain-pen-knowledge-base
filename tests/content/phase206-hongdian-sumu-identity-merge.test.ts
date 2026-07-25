import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase163HongdianModels } from "../../scripts/apply-phase163-hongdian-models-content";
import { applyPhase206HongdianSumuIdentityMerge } from "../../scripts/apply-phase206-hongdian-sumu-identity-merge";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");
test("Phase 206 merges the retired HongDian Sumu placeholder into canonical 1866", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.mkdtempSync(
    path.join(os.tmpdir(), "fpkg-phase206-hongdian-"),
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
    reviewer: "phase206-hongdian-sumu-test",
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
    await applyPhase163HongdianModels(client, options);
    await assert.rejects(
      () =>
        applyPhase206HongdianSumuIdentityMerge(client, {
          ...options,
          env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
        }),
      /refuses inherited remote database selection/,
    );
    await applyPhase206HongdianSumuIdentityMerge(client, options);
    assert.equal(
      (
        await client.execute({
          sql: "SELECT status FROM entity_publications WHERE entity_id='km3uuSerw-AL'",
          args: [],
        })
      ).rows[0]?.status,
      "retired",
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT status FROM entity_publications WHERE entity_id='4yRpvovXFoWh'",
          args: [],
        })
      ).rows[0]?.status,
      "published",
    );
    assert.equal(
      (
        await client.execute({
          sql: "SELECT status FROM entity_publications WHERE entity_id='1cA0oEMF7d1u'",
          args: [],
        })
      ).rows[0]?.status,
      "published",
    );
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS value FROM entity_links WHERE source_id='4yRpvovXFoWh' AND target_id='km3uuSerw-AL' AND link_type='reverse'",
            args: [],
          })
        ).rows[0]?.value,
      ),
      0,
    );
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS value FROM entity_aliases WHERE entity_id='1cA0oEMF7d1u' AND alias='弘典 苏木' AND review_status='approved'",
            args: [],
          })
        ).rows[0]?.value,
      ),
      1,
    );
    const redirect = await client.execute({
      sql: "SELECT target_path,redirect_kind FROM entity_redirects WHERE source_path='/pen/弘典-hongdian-苏木'",
      args: [],
    });
    assert.deepEqual(redirect.rows[0], {
      target_path: "/pen/弘典-hongdian-1866",
      redirect_kind: "permanent",
    });
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS value FROM entity_lineage WHERE source_entity_id='km3uuSerw-AL' AND target_entity_id='1cA0oEMF7d1u' AND lineage_kind='merge'",
            args: [],
          })
        ).rows[0]?.value,
      ),
      1,
    );
    await applyPhase206HongdianSumuIdentityMerge(client, options);
    assertCatalogSnapshotUnchanged(snapshot);
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
});
