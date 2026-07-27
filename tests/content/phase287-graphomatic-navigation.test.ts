import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import {
  applyPhase287GraphomaticNavigationContent,
  PHASE287_GRAPHOMATIC_ID,
  PHASE287_GRAPHOMATIC_SOURCE,
} from "../../scripts/apply-phase287-graphomatic-navigation-content";
import {
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { getReclassifiedArticlePath } from "../../src/lib/entity-redirects";
import { computePublicationContentHash } from "../../src/lib/publication";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

test("Phase 287 reclassifies Graphomatic navigation without publishing a fake model list", async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase287-")),
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
    reviewer: "phase287-test",
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
    // The real catalog is formally migrated by this phase before the test is
    // run. Recreate the pre-phase brand state only inside the owned fixture so
    // the regression still exercises the guarded type transition.
    await client.execute({
      sql: "UPDATE entities SET type = 'brand', source = ? WHERE id = ?",
      args: [
        "curated-content:phase213-graphomatic:test-baseline",
        PHASE287_GRAPHOMATIC_ID,
      ],
    });
    const first = await applyPhase287GraphomaticNavigationContent(
      client,
      options,
    );
    assert.equal(first.entities[0]?.outcome, "published");

    const entity = await client.execute({
      sql: "SELECT type, slug, source, body_md FROM entities WHERE id = ?",
      args: [PHASE287_GRAPHOMATIC_ID],
    });
    assert.equal(entity.rows.length, 1);
    assert.equal(String(entity.rows[0]?.type), "article");
    assert.equal(String(entity.rows[0]?.slug), "graphomatic");
    assert.equal(String(entity.rows[0]?.source), PHASE287_GRAPHOMATIC_SOURCE);
    assert.ok(Array.from(String(entity.rows[0]?.body_md)).length > 1_800);

    const topology = await client.execute({
      sql: `
        SELECT count(*) AS value
        FROM entity_links
        WHERE (source_id = ? OR target_id = ?)
          AND link_type IN ('made_by', 'reverse')
      `,
      args: [PHASE287_GRAPHOMATIC_ID, PHASE287_GRAPHOMATIC_ID],
    });
    assert.equal(Number(topology.rows[0]?.value), 0);

    const publication = await client.execute({
      sql: `
        SELECT status, reviewed_contract_version, approved_content_hash
        FROM entity_publications
        WHERE entity_id = ?
      `,
      args: [PHASE287_GRAPHOMATIC_ID],
    });
    assert.equal(String(publication.rows[0]?.status), "published");
    assert.equal(Number(publication.rows[0]?.reviewed_contract_version), 3);
    const contentHash = await computePublicationContentHash(
      client,
      PHASE287_GRAPHOMATIC_ID,
    );
    assert.equal(
      String(publication.rows[0]?.approved_content_hash),
      contentHash,
    );

    const reviews = await client.execute({
      sql: `
        SELECT review_kind, status
        FROM entity_content_reviews
        WHERE entity_id = ? AND content_hash = ?
        ORDER BY review_kind
      `,
      args: [PHASE287_GRAPHOMATIC_ID, contentHash],
    });
    assert.deepEqual(
      reviews.rows.map(
        (row) => `${String(row.review_kind)}:${String(row.status)}`,
      ),
      [
        "fact:approved",
        "language:approved",
        "media:approved",
        "publication:approved",
      ],
    );

    const publicArticle = await client.execute({
      sql: "SELECT type, slug FROM public_entities WHERE id = ?",
      args: [PHASE287_GRAPHOMATIC_ID],
    });
    assert.deepEqual(
      publicArticle.rows.map(
        (row) => `${String(row.type)}/${String(row.slug)}`,
      ),
      ["article/graphomatic"],
    );
    assert.equal(
      getReclassifiedArticlePath("brand", "graphomatic"),
      "/article/graphomatic",
    );

    const second = await applyPhase287GraphomaticNavigationContent(
      client,
      options,
    );
    assert.equal(second.entities[0]?.outcome, "noop");
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assert.deepEqual(snapshotCatalogFiles(REAL), snapshot);
});
