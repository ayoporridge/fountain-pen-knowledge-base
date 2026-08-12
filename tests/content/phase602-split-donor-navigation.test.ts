import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import {
  type ApplyPhase602Options,
  applyPhase602SplitDonorNavigation,
} from "../../scripts/apply-phase602-split-donor-navigation";
import {
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data/fpkg.db");
const SOURCE = path.join(
  ROOT,
  ".planning/quick/260812-tmx-retired-backlog-closure/checkpoint-final/catalog.db",
);
const SOURCE_SHA =
  "7ef7d26e5d377b8c827e8d1c4874fb7d08f7021748163a40ffefaaeb0817492e";
const REAL_SHA =
  "acbb5710050b5c9d6e435666dda909b66055c290a4640f04faa38860ea24d09a";

function sha(file: string): string {
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(file))
    .digest("hex");
}

function owned(prefix: string) {
  const root = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), prefix)),
  );
  const sourceSnapshot = snapshotCatalogFiles(SOURCE);
  const copy = copyCheckpointedCatalogToDisposableCopy(
    SOURCE,
    path.join(root, "catalog.db"),
    root,
    { expectedSourceSnapshot: sourceSnapshot },
  );
  return { root, database: copy.destinationPath, sourceSnapshot };
}

function protectedGuard() {
  const root = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase602-guard-")),
  );
  const database = path.join(root, "real.db");
  fs.copyFileSync(REAL, database, fs.constants.COPYFILE_EXCL);
  return { root, database, snapshot: snapshotCatalogFiles(database) };
}

function options(
  copy: ReturnType<typeof owned>,
  guard: ReturnType<typeof protectedGuard>,
): ApplyPhase602Options {
  return {
    databasePath: copy.database,
    ownedRoot: copy.root,
    protectedCatalogPath: guard.database,
    protectedCatalogSnapshot: guard.snapshot,
    env: {
      ...process.env,
      TURSO_DATABASE_URL: "",
      TURSO_AUTH_TOKEN: "",
      FPKG_DATABASE_URL: "",
    },
  };
}

test("Phase 602 routes mixed split donors through complete brand navigation", async () => {
  assert.equal(sha(SOURCE), SOURCE_SHA);
  assert.equal(sha(REAL), REAL_SHA);
  const sourceBefore = snapshotCatalogFiles(SOURCE);
  const realBefore = snapshotCatalogFiles(REAL);
  const copy = owned("fpkg-phase602-");
  const guard = protectedGuard();
  const client = createClient({ url: `file:${copy.database}` });
  try {
    const first = await applyPhase602SplitDonorNavigation(
      client,
      options(copy, guard),
    );
    assert.equal(first.outcome, "applied");
    assert.deepEqual(
      first.navigations.map((item) => item.outcome),
      ["applied", "applied"],
    );
    assert.equal(first.sheaffer, "preserved_hard_404");

    const routes = await client.execute(
      `SELECT source_path,target_path,redirect_kind,fallback_reason FROM entity_redirects
       WHERE source_path IN (
         '/pen/leonardo-furore-momento-magico',
         '/pen/opus-88-demo-kolora',
         '/pen/sheaffer-s-craftsman'
       ) ORDER BY source_path`,
    );
    assert.deepEqual(routes.rows, [
      {
        source_path: "/pen/leonardo-furore-momento-magico",
        target_path: "/brand/leonardo",
        redirect_kind: "permanent",
        fallback_reason: "mixed_identity_split_brand_navigation",
      },
      {
        source_path: "/pen/opus-88-demo-kolora",
        target_path: "/brand/opus88",
        redirect_kind: "permanent",
        fallback_reason: "mixed_identity_split_brand_navigation",
      },
      {
        source_path: "/pen/sheaffer-s-craftsman",
        target_path: null,
        redirect_kind: "hard_404",
        fallback_reason:
          "generic Craftsman identity was split; choose Balance, 33T lever or Tip-Dip canonical page",
      },
    ]);
    const replay = await applyPhase602SplitDonorNavigation(
      client,
      options(copy, guard),
    );
    assert.equal(replay.outcome, "noop");
    assert.deepEqual(
      replay.navigations.map((item) => item.outcome),
      ["noop", "noop"],
    );

    const remote = options(copy, guard);
    remote.env = {
      ...(remote.env ?? process.env),
      NODE_ENV: remote.env?.NODE_ENV ?? "test",
      TURSO_DATABASE_URL: "libsql://remote.invalid",
    };
    await assert.rejects(
      applyPhase602SplitDonorNavigation(client, remote),
      /refuses inherited remote database selection/,
    );
    assert.deepEqual(snapshotCatalogFiles(SOURCE), sourceBefore);
    assert.deepEqual(snapshotCatalogFiles(REAL), realBefore);
    assert.deepEqual(snapshotCatalogFiles(guard.database), guard.snapshot);
  } finally {
    client.close();
    fs.rmSync(copy.root, { recursive: true, force: true });
    fs.rmSync(guard.root, { recursive: true, force: true });
  }
});
