import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import {
  type ApplyPhase613Options,
  applyPhase613LegacyBoundaryCleanup,
  PHASE613_CANDIDATE_SHA256,
  PHASE613_EXPECTED_COUNTS,
  PHASE613_KNOWN_FIELD_REPAIRS,
  PHASE613_REAL_SHA256,
  PHASE613_SOURCE_SHA256,
} from "../../scripts/apply-phase613-legacy-boundary-cleanup";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";

const ROOT = process.cwd();
const CANDIDATE_SOURCE = path.join(
  ROOT,
  ".planning/quick/260813-x80-phase611-33-family-owned-checkpoint-turs/checkpoint-final/catalog.db",
);
const PROTECTED_SOURCE = path.join(
  ROOT,
  ".planning/quick/260813-hhf-740-manifest/checkpoint-final/catalog.db",
);
const REAL = path.join(ROOT, "data", "fpkg.db");

type OwnedCopy = { ownedRoot: string; databasePath: string };

function sha256(filePath: string): string {
  return createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function cleanEnv(): NodeJS.ProcessEnv {
  return {
    ...process.env,
    NODE_ENV: "test",
    TURSO_DATABASE_URL: "",
    TURSO_AUTH_TOKEN: "",
    FPKG_DATABASE_URL: "",
  };
}

function createOwnedCopy(): OwnedCopy {
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase613-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    CANDIDATE_SOURCE,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: snapshotCatalogFiles(CANDIDATE_SOURCE) },
  );
  return { ownedRoot, databasePath: copy.destinationPath };
}

function removeOwnedCopy(copy: OwnedCopy): void {
  fs.rmSync(copy.ownedRoot, { recursive: true, force: true });
}

function optionsFor(
  copy: OwnedCopy,
  sourceSnapshot: ReturnType<typeof snapshotCatalogFiles>,
  realSnapshot: ReturnType<typeof snapshotCatalogFiles>,
  env = cleanEnv(),
): ApplyPhase613Options {
  return {
    workspaceRoot: ROOT,
    reviewer: "phase613-legacy-boundary-cleanup-test",
    databasePath: copy.databasePath,
    ownedRoot: copy.ownedRoot,
    protectedCatalogs: [
      { path: PROTECTED_SOURCE, snapshot: sourceSnapshot },
      { path: REAL, snapshot: realSnapshot },
    ],
    env,
  };
}

async function checkpointAndClose(
  client: Client,
  databasePath: string,
): Promise<void> {
  const checkpoint = await client.execute("PRAGMA wal_checkpoint(TRUNCATE)");
  assert.equal(Number(checkpoint.rows[0]?.busy ?? 0), 0);
  client.close();
  const walPath = `${databasePath}-wal`;
  if (fs.existsSync(walPath)) assert.equal(fs.statSync(walPath).size, 0);
  for (const suffix of ["-wal", "-shm"] as const) {
    fs.rmSync(`${databasePath}${suffix}`, { force: true });
  }
}

async function assertLegacyBoundaryClean(client: Client): Promise<void> {
  const result = await client.execute(`
    SELECT
      (SELECT count(*) FROM model_specs s JOIN entities e ON e.id=s.entity_id
       WHERE e.type != 'pen') AS non_pen_specs,
      (SELECT count(*) FROM model_specs s JOIN public_entities p ON p.id=s.entity_id
       WHERE p.type='pen' AND (s.price_range IS NOT NULL OR s.status IS NOT NULL)) AS public_snapshots,
      (SELECT count(*) FROM entity_links f
       WHERE f.link_type != 'reverse' AND NOT EXISTS (
         SELECT 1 FROM entity_links r WHERE r.id='rev-'||f.id
           AND r.source_id=f.target_id AND r.target_id=f.source_id
           AND r.link_type='reverse')) AS missing_reverse,
       (SELECT count(*) FROM taxonomy_batches
       WHERE source_key='phase613-legacy-boundary-cleanup-v2'
         AND status='applied') AS markers
  `);
  const row = result.rows[0];
  assert.equal(Number(row?.non_pen_specs), 0);
  assert.equal(Number(row?.public_snapshots), 0);
  assert.equal(Number(row?.missing_reverse), 0);
  assert.equal(Number(row?.markers), 1);

  for (const check of PHASE613_KNOWN_FIELD_REPAIRS) {
    const result = await client.execute({
      sql: `SELECT s.${check.field} AS value
            FROM model_specs s JOIN entities e ON e.id=s.entity_id
            WHERE e.slug=? AND e.type='pen'`,
      args: [check.slug],
    });
    assert.equal(result.rows.length, 1);
    assert.equal(
      result.rows[0]?.value,
      check.after,
      `${check.slug}.${check.field}`,
    );
  }
}

test("Phase 613 protects the frozen source and real database families", () => {
  assert.equal(sha256(CANDIDATE_SOURCE), PHASE613_CANDIDATE_SHA256);
  assert.equal(sha256(PROTECTED_SOURCE), PHASE613_SOURCE_SHA256);
  assert.equal(sha256(REAL), PHASE613_REAL_SHA256);
  const sourceSnapshot = snapshotCatalogFiles(PROTECTED_SOURCE);
  const realSnapshot = snapshotCatalogFiles(REAL);
  for (const snapshot of [sourceSnapshot, realSnapshot]) {
    assert.equal(snapshot.main.exists, true);
    assert.equal(snapshot.wal.exists, false);
    assert.equal(snapshot.shm.exists, false);
  }
  assertCatalogSnapshotUnchanged(sourceSnapshot);
  assertCatalogSnapshotUnchanged(realSnapshot);
});

test("Phase 613 applies all legacy cleanup targets and replays as a noop", {
  timeout: 2_400_000,
}, async () => {
  const sourceSnapshot = snapshotCatalogFiles(PROTECTED_SOURCE);
  const realSnapshot = snapshotCatalogFiles(REAL);
  const copy = createOwnedCopy();
  try {
    const firstClient = createClient({ url: `file:${copy.databasePath}` });
    const first = await applyPhase613LegacyBoundaryCleanup(
      firstClient,
      optionsFor(copy, sourceSnapshot, realSnapshot),
    );
    assert.equal(first.outcome, "published");
    assert.deepEqual(first.affected, {
      brands: 2,
      pens: PHASE613_EXPECTED_COUNTS.publicPenSnapshotSpecs,
      deletedBrandSpecs: 2,
      clearedPenSpecs: PHASE613_EXPECTED_COUNTS.publicPenSnapshotSpecs,
      restoredReverseLinks: PHASE613_EXPECTED_COUNTS.missingReverse,
    });
    assert.equal(first.entities.length, 510);
    assert.equal(
      new Set(first.entities.map(({ entityId }) => entityId)).size,
      510,
    );
    await assertLegacyBoundaryClean(firstClient);
    await checkpointAndClose(firstClient, copy.databasePath);

    const afterFirstSha = sha256(copy.databasePath);
    const replayClient = createClient({ url: `file:${copy.databasePath}` });
    const replay = await applyPhase613LegacyBoundaryCleanup(
      replayClient,
      optionsFor(copy, sourceSnapshot, realSnapshot),
    );
    assert.equal(replay.outcome, "noop");
    assert.deepEqual(replay.affected, first.affected);
    assert.equal(replay.entities.length, first.entities.length);
    assert.equal(sha256(copy.databasePath), afterFirstSha);
    await assertLegacyBoundaryClean(replayClient);
    await checkpointAndClose(replayClient, copy.databasePath);
    assert.equal(sha256(copy.databasePath), afterFirstSha);
    assertCatalogSnapshotUnchanged(sourceSnapshot);
    assertCatalogSnapshotUnchanged(realSnapshot);
    assert.equal(sha256(PROTECTED_SOURCE), PHASE613_SOURCE_SHA256);
    assert.equal(sha256(REAL), PHASE613_REAL_SHA256);
  } finally {
    removeOwnedCopy(copy);
  }
});

test("Phase 613 refuses remote selectors before writing", {
  timeout: 900_000,
}, async () => {
  const sourceSnapshot = snapshotCatalogFiles(PROTECTED_SOURCE);
  const realSnapshot = snapshotCatalogFiles(REAL);
  const copy = createOwnedCopy();
  const before = sha256(copy.databasePath);
  const client = createClient({ url: `file:${copy.databasePath}` });
  try {
    await assert.rejects(
      applyPhase613LegacyBoundaryCleanup(
        client,
        optionsFor(copy, sourceSnapshot, realSnapshot, {
          ...cleanEnv(),
          TURSO_DATABASE_URL: "libsql://must-not-be-used.invalid",
        }),
      ),
      /TURSO_DATABASE_URL/,
    );
    assert.equal(sha256(copy.databasePath), before);
    assertCatalogSnapshotUnchanged(sourceSnapshot);
    assertCatalogSnapshotUnchanged(realSnapshot);
  } finally {
    client.close();
    removeOwnedCopy(copy);
  }
});
