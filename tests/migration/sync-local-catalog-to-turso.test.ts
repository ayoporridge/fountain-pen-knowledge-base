import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  assertSafeSource,
  buildUpsertSql,
  type TableSchema,
} from "../../scripts/sync-local-catalog-to-turso";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  openReadOnlyCatalog,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";

const ROOT = "/Users/xz/Documents/fountain-pen-graph";
const REAL = path.join(ROOT, "data", "fpkg.db");

test("Turso catalog sync builds guarded upserts without destructive SQL", () => {
  const table: TableSchema = {
    name: "entities",
    columns: [
      { name: "id", type: "TEXT", notnull: 1, pk: 1, dflt_value: null },
      { name: "name", type: "TEXT", notnull: 1, pk: 0, dflt_value: null },
    ],
    primaryKey: ["id"],
    foreignKeys: [],
    uniqueIndexes: [["name"]],
  };
  const sql = buildUpsertSql(table);
  assert.equal((sql.match(/ON CONFLICT/g) ?? []).length, 2);
  assert.match(sql, /ON CONFLICT \("id"\) DO UPDATE SET/);
  assert.match(sql, /ON CONFLICT \("name"\) DO UPDATE SET/);
  assert.match(sql, /WHERE/);
  assert.doesNotMatch(sql, /DROP\s+TABLE/i);
});

test("Turso catalog sync accepts only an owned checkpoint source", () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-turso-sync-test-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  assert.doesNotThrow(() =>
    assertSafeSource({
      sourcePath: copy.destinationPath,
      ownedRoot,
      protectedCatalogPath: REAL,
      apply: false,
      acknowledgeRemoteWrite: false,
      reviewer: "test",
      gateOnly: false,
    }),
  );
  assert.throws(
    () =>
      assertSafeSource({
        sourcePath: REAL,
        ownedRoot,
        protectedCatalogPath: REAL,
        apply: false,
        acknowledgeRemoteWrite: false,
        reviewer: "test",
        gateOnly: false,
      }),
    /owned-root|hard-link alias|data\/fpkg\.db/,
  );
  const readOnly = openReadOnlyCatalog(copy.destinationPath, {
    env: { NODE_ENV: "test", TURSO_DATABASE_URL: "" },
  });
  try {
    const row = readOnly.get<{ count: number }>(
      "SELECT count(*) AS count FROM entities",
    );
    // The protected catalog is intentionally allowed to grow as content packs
    // are formally migrated; this guards against an empty or truncated copy
    // without freezing the test to the pre-migration inventory count.
    assert.ok(Number(row?.count) >= 893);
  } finally {
    readOnly.close();
  }
  assertCatalogSnapshotUnchanged(protectedSnapshot);
});
