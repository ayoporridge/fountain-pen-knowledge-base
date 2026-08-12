import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import {
  type ApplyPhase601Options,
  applyPhase601RetiredBacklogClosure,
} from "../../scripts/apply-phase601-retired-backlog-closure";
import {
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");
const SOURCE = path.join(
  ROOT,
  ".planning/quick/260812-p9u-ystudio-portable-desk-resin-yakihaku-kaz",
  "checkpoint-final/catalog.db",
);
const SOURCE_SHA =
  "083442c32cdace53b72330b5682c24612ec5326ecfce8727a01db1e4b2e960ac";
const REAL_SHA =
  "acbb5710050b5c9d6e435666dda909b66055c290a4640f04faa38860ea24d09a";

function sha(file: string): string {
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(file))
    .digest("hex");
}

function createOwned(prefix: string) {
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), prefix)),
  );
  const sourceSnapshot = snapshotCatalogFiles(SOURCE);
  const copy = copyCheckpointedCatalogToDisposableCopy(
    SOURCE,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: sourceSnapshot },
  );
  return { ownedRoot, databasePath: copy.destinationPath, sourceSnapshot };
}

function guard() {
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase601-guard-")),
  );
  const databasePath = path.join(ownedRoot, "real.db");
  fs.copyFileSync(REAL, databasePath, fs.constants.COPYFILE_EXCL);
  return {
    ownedRoot,
    databasePath,
    snapshot: snapshotCatalogFiles(databasePath),
  };
}

function options(
  copy: ReturnType<typeof createOwned>,
  protectedGuard: ReturnType<typeof guard>,
  env: NodeJS.ProcessEnv = process.env,
): ApplyPhase601Options {
  return {
    databasePath: copy.databasePath,
    ownedRoot: copy.ownedRoot,
    protectedCatalogPath: protectedGuard.databasePath,
    protectedCatalogSnapshot: protectedGuard.snapshot,
    env: {
      ...env,
      TURSO_DATABASE_URL: "",
      TURSO_AUTH_TOKEN: "",
      FPKG_DATABASE_URL: "",
    },
  };
}

test("Phase 601 closes deterministic retired routes on an owned Phase 600 checkpoint", {
  timeout: 180_000,
}, async () => {
  assert.equal(sha(SOURCE), SOURCE_SHA);
  assert.equal(sha(REAL), REAL_SHA);
  const realBefore = snapshotCatalogFiles(REAL);
  const copy = createOwned("fpkg-phase601-");
  const protectedGuard = guard();
  const client = createClient({ url: `file:${copy.databasePath}` });
  try {
    const retired = await client.execute(
      "SELECT e.type,COUNT(*) AS count FROM entities e JOIN entity_publications ep ON ep.entity_id=e.id WHERE ep.status='retired' GROUP BY e.type",
    );
    assert.deepEqual(retired.rows, [
      { type: "brand", count: 4 },
      { type: "nib", count: 1 },
      { type: "pen", count: 20 },
    ]);

    const first = await applyPhase601RetiredBacklogClosure(
      client,
      options(copy, protectedGuard),
    );
    assert.equal(first.outcome, "applied");
    assert.equal(first.pelikanM800.outcome, "applied");
    assert.equal(first.aurora.outcome, "applied");

    const routes = await client.execute(
      `SELECT source_path,target_path,redirect_kind FROM entity_redirects
         WHERE source_path IN ('/pen/百利金-pelikan-m800','/pen/奥罗拉-aurora')
         ORDER BY source_path`,
    );
    assert.deepEqual(routes.rows, [
      {
        source_path: "/pen/奥罗拉-aurora",
        target_path: null,
        redirect_kind: "hard_404",
      },
      {
        source_path: "/pen/百利金-pelikan-m800",
        target_path: "/pen/pelikan-souveran-m800",
        redirect_kind: "permanent",
      },
    ]);
    const lineage = await client.execute(
      `SELECT source_entity_id,target_entity_id,lineage_kind FROM entity_lineage
         WHERE source_entity_id IN ('G9ptvLpfyzNQ','rKSjyWghpB8Y')
         ORDER BY source_entity_id`,
    );
    assert.deepEqual(lineage.rows, [
      {
        source_entity_id: "G9ptvLpfyzNQ",
        target_entity_id: "CJXe8UpnkHLJ",
        lineage_kind: "retire",
      },
      {
        source_entity_id: "rKSjyWghpB8Y",
        target_entity_id: "1UzrQA9Rrmqs",
        lineage_kind: "merge",
      },
    ]);
    const publicDonors = await client.execute(
      "SELECT id FROM public_entities WHERE id IN ('G9ptvLpfyzNQ','rKSjyWghpB8Y')",
    );
    assert.deepEqual(publicDonors.rows, []);

    const replay = await applyPhase601RetiredBacklogClosure(
      client,
      options(copy, protectedGuard),
    );
    assert.equal(replay.outcome, "noop");
    assert.equal(replay.pelikanM800.outcome, "noop");
    assert.equal(replay.aurora.outcome, "noop");

    for (const key of [
      "TURSO_DATABASE_URL",
      "TURSO_AUTH_TOKEN",
      "FPKG_DATABASE_URL",
    ] as const) {
      const remoteCopy = createOwned(`fpkg-phase601-${key.toLowerCase()}-`);
      const remoteClient = createClient({
        url: `file:${remoteCopy.databasePath}`,
      });
      try {
        const remoteOptions = options(remoteCopy, protectedGuard);
        remoteOptions.env = {
          ...(remoteOptions.env ?? process.env),
          NODE_ENV: remoteOptions.env?.NODE_ENV ?? "test",
          [key]: "libsql://remote.invalid",
        };
        await assert.rejects(
          applyPhase601RetiredBacklogClosure(remoteClient, remoteOptions),
          /refuses inherited remote database selection/,
        );
      } finally {
        remoteClient.close();
        fs.rmSync(remoteCopy.ownedRoot, { recursive: true, force: true });
      }
    }

    assert.deepEqual(snapshotCatalogFiles(SOURCE), copy.sourceSnapshot);
    assert.deepEqual(snapshotCatalogFiles(REAL), realBefore);
    assert.deepEqual(
      snapshotCatalogFiles(protectedGuard.databasePath),
      protectedGuard.snapshot,
    );
  } finally {
    client.close();
    fs.rmSync(copy.ownedRoot, { recursive: true, force: true });
    fs.rmSync(protectedGuard.ownedRoot, { recursive: true, force: true });
  }
  assert.deepEqual(snapshotCatalogFiles(REAL), realBefore);
});
