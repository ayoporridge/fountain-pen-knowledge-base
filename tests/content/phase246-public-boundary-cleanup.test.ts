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
  const seed = await client.transaction("write");
  try {
    const invalidEntities = await seed.execute(`
      SELECT entity.id
      FROM entities entity
      WHERE entity.type!='pen'
        AND NOT EXISTS (SELECT 1 FROM model_specs spec WHERE spec.entity_id=entity.id)
        AND NOT EXISTS (SELECT 1 FROM public_entities public_entity WHERE public_entity.id=entity.id)
      ORDER BY entity.id
      LIMIT 6
    `);
    assert.equal(invalidEntities.rows.length, 6);
    for (let index = 0; index < invalidEntities.rows.length; index += 1) {
      await seed.execute({
        sql: `INSERT INTO model_specs(id,entity_id,review_status,created_at,updated_at)
              VALUES(?,?, 'approved', datetime('now'), datetime('now'))`,
        args: [
          [
            "spec-wancher-dream-pen",
            "spec-montblanc-patron-of-art-888",
            "spec-montblanc-writers-edition",
            "spec-sailor-1911-profit-research",
            "spec-hongdian-black-forest-pro-research",
            "curated-model-spec-b8071e1d767a0c35a3c67e56",
          ][index],
          String(invalidEntities.rows[index]?.id),
        ],
      });
    }

    const articles = await seed.execute(
      "SELECT id FROM entities WHERE type='article' ORDER BY id LIMIT 103",
    );
    const brand = await seed.execute(
      "SELECT id FROM entities WHERE type='brand' ORDER BY id LIMIT 1",
    );
    const targetId = String(brand.rows[0]?.id);
    assert.equal(articles.rows.length, 103);
    assert.ok(targetId);
    for (let index = 0; index < 103; index += 1) {
      const linkId = `phase246-fixture-link-${index}`;
      const linkType = `phase246-fixture-${index}`;
      const sourceId = String(articles.rows[index]?.id);
      await seed.execute({
        sql: `INSERT INTO entity_links(id,source_id,target_id,link_type,created_at)
              VALUES(?,?,?, ?, datetime('now'))`,
        args: [linkId, sourceId, targetId, linkType],
      });
      await seed.execute({
        sql: "DELETE FROM entity_links WHERE id=? AND link_type='reverse'",
        args: [`rev-${linkId}`],
      });
    }

    const markerBrands = await seed.execute(
      "SELECT id FROM public_entities WHERE type='brand' ORDER BY id LIMIT 2",
    );
    assert.equal(markerBrands.rows.length, 2);
    await seed.execute({
      sql: `UPDATE entity_publications SET review_notes='[phase246-pending]'
            WHERE entity_id IN (?,?)`,
      args: markerBrands.rows.map((row) => String(row.id)),
    });
    await seed.commit();
  } catch (error) {
    if (!seed.closed) await seed.rollback();
    client.close();
    throw error;
  }
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
