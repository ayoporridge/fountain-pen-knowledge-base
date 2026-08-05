import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import {
  type ApplyPhase504Options,
  applyPhase504RetiredPelikanM800Identity,
} from "../../scripts/apply-phase504-retired-pelikan-m800-identity";
import {
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL_CATALOG = path.join(ROOT, "data", "fpkg.db");
const RETIRED_ID = "rKSjyWghpB8Y";
const CANONICAL_ID = "1UzrQA9Rrmqs";

test("Phase 504 closes the retired Pelikan M800 route on an owned copy", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.mkdtempSync(
    path.join(os.tmpdir(), "fpkg-phase504-m800-"),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL_CATALOG,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase504Options = {
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
  };
  try {
    await migrateDatabase(client);
    const applied = await applyPhase504RetiredPelikanM800Identity(
      client,
      options,
    );
    assert.equal(applied.outcome, "applied");
    assert.equal(applied.sourcePath, "/pen/百利金-pelikan-m800");
    assert.equal(applied.targetPath, "/pen/pelikan-souveran-m800");

    const lineage = await client.execute({
      sql: `SELECT source_entity_id, target_entity_id, lineage_kind
        FROM entity_lineage WHERE source_entity_id = ?`,
      args: [RETIRED_ID],
    });
    assert.deepEqual(lineage.rows, [
      {
        source_entity_id: RETIRED_ID,
        target_entity_id: CANONICAL_ID,
        lineage_kind: "merge",
      },
    ]);
    const redirect = await client.execute({
      sql: `SELECT target_path, redirect_kind, fallback_reason
        FROM entity_redirects WHERE source_path = ?`,
      args: ["/pen/百利金-pelikan-m800"],
    });
    assert.deepEqual(redirect.rows, [
      {
        target_path: "/pen/pelikan-souveran-m800",
        redirect_kind: "permanent",
        fallback_reason: "duplicate_canonical_merge",
      },
    ]);
    const publicRows = await client.execute({
      sql: `SELECT id FROM public_entities WHERE id IN (?, ?) ORDER BY id`,
      args: [RETIRED_ID, CANONICAL_ID],
    });
    assert.deepEqual(publicRows.rows, [{ id: CANONICAL_ID }]);

    const replay = await applyPhase504RetiredPelikanM800Identity(
      client,
      options,
    );
    assert.equal(replay.outcome, "noop");
    assert.deepEqual(snapshotCatalogFiles(REAL_CATALOG), protectedSnapshot);
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assert.deepEqual(snapshotCatalogFiles(REAL_CATALOG), protectedSnapshot);
});

test("Phase 504 rejects inherited remote selection", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.mkdtempSync(
    path.join(os.tmpdir(), "fpkg-phase504-remote-"),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL_CATALOG,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  try {
    await migrateDatabase(client);
    await assert.rejects(
      applyPhase504RetiredPelikanM800Identity(client, {
        databasePath: copy.destinationPath,
        ownedRoot,
        protectedCatalogPath: REAL_CATALOG,
        protectedCatalogSnapshot: protectedSnapshot,
        env: {
          ...process.env,
          TURSO_DATABASE_URL: "libsql://remote.invalid",
        },
      }),
      /refuses inherited remote database selection/,
    );
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assert.deepEqual(snapshotCatalogFiles(REAL_CATALOG), protectedSnapshot);
});
