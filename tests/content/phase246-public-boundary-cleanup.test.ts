import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import {
  type ApplyPhase246Options,
  applyPhase246PublicBoundaryCleanup,
} from "../../scripts/apply-phase246-public-boundary-cleanup";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";

const ROOT = fs.realpathSync.native("/Users/xz/CodeBuddy/fountain-pen-graph");
const REAL = path.join(ROOT, "data", "fpkg.db");

test("Phase 246 cleans the public boundary and resumes from pending markers", {
  timeout: 900_000,
}, async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase246-boundary-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase246Options = {
    workspaceRoot: ROOT,
    reviewer: "phase246-boundary-test",
    databasePath: copy.destinationPath,
    ownedRoot,
    protectedCatalogPath: REAL,
    protectedCatalogSnapshot: protectedSnapshot,
    maxEntities: 1,
    env: {
      ...process.env,
      TURSO_DATABASE_URL: "",
      TURSO_AUTH_TOKEN: "",
      FPKG_DATABASE_URL: "",
    },
  };
  try {
    const first = await applyPhase246PublicBoundaryCleanup(client, options);
    assert.equal(first.outcome, "cleaned");
    assert.equal(first.removedNonPenSpecs, 6);
    assert.equal(first.insertedReverseRows, 103);
    assert.equal(first.refreshedPublications, 1);
    assert.ok(first.pendingPublications > 0);

    const counts = await client.execute(`
      SELECT
        (SELECT count(*) FROM model_specs ms JOIN entities e ON e.id=ms.entity_id WHERE e.type!='pen') AS non_pen_specs,
        (SELECT count(*) FROM model_specs ms JOIN public_entities e ON e.id=ms.entity_id
          WHERE ms.price_range IS NOT NULL OR ms.status IS NOT NULL) AS snapshots,
        (SELECT count(*) FROM entity_links l WHERE l.link_type!='reverse' AND NOT EXISTS (
          SELECT 1 FROM entity_links r
          WHERE r.id='rev-'||l.id AND r.source_id=l.target_id AND r.target_id=l.source_id AND r.link_type='reverse'
        )) AS missing_reverses,
        (SELECT count(*) FROM entity_publications WHERE review_notes LIKE '%[phase246-pending]%') AS pending
    `);
    assert.deepEqual(counts.rows[0], {
      non_pen_specs: 0,
      snapshots: 0,
      missing_reverses: 0,
      pending: first.pendingPublications,
    });

    const second = await applyPhase246PublicBoundaryCleanup(client, options);
    assert.equal(second.outcome, "cleaned");
    assert.equal(second.refreshedPublications, 1);
    assert.equal(second.pendingPublications, first.pendingPublications - 1);
    assertCatalogSnapshotUnchanged(protectedSnapshot);
  } finally {
    client.close();
  }
});
