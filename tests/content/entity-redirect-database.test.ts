import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import {
  getCanonicalEntityPath,
  HARD_404_ENTITY_PATHS,
} from "../../src/lib/entity-redirects";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

test("database redirects resolve only permanent internal targets on an owned copy", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-redirects-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const previousDatabaseUrl = process.env.FPKG_DATABASE_URL;
  const previousTursoUrl = process.env.TURSO_DATABASE_URL;
  try {
    process.env.FPKG_DATABASE_URL = `file:${copy.destinationPath}`;
    process.env.TURSO_DATABASE_URL = "";
    const { getDatabaseCanonicalEntityPath } = await import(
      "../../src/lib/entity-redirects"
    );
    assert.equal(
      await getDatabaseCanonicalEntityPath(
        "pen",
        "wancher-oita-urushi-kurozan",
      ),
      "/pen/wancher-oita-urushi-kurozan-fountain-pen",
    );
    assert.equal(
      await getDatabaseCanonicalEntityPath("pen", "does-not-exist"),
      null,
    );
    assert.equal(getCanonicalEntityPath("pen", "奥罗拉-aurora"), null);
    assert.equal(HARD_404_ENTITY_PATHS.has("/pen/奥罗拉-aurora"), true);
    assert.equal(
      await getDatabaseCanonicalEntityPath("pen", "奥罗拉-aurora"),
      null,
    );
    assertCatalogSnapshotUnchanged(
      protectedSnapshot,
      snapshotCatalogFiles(REAL),
    );
  } finally {
    if (previousDatabaseUrl === undefined) delete process.env.FPKG_DATABASE_URL;
    else process.env.FPKG_DATABASE_URL = previousDatabaseUrl;
    if (previousTursoUrl === undefined) delete process.env.TURSO_DATABASE_URL;
    else process.env.TURSO_DATABASE_URL = previousTursoUrl;
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
});
