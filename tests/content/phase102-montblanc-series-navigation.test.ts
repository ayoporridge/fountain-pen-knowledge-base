import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import {
  applyPhase102MontblancSeriesNavigationContent,
  PHASE102_PATRON_ID,
  PHASE102_PATRON_SLUG,
  PHASE102_WRITERS_ID,
  PHASE102_WRITERS_SLUG,
} from "../../scripts/apply-phase102-montblanc-series-navigation-content";
import {
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { getReclassifiedArticlePath } from "../../src/lib/entity-redirects";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");
test("Phase 102 turns Montblanc limited-series shells into sourced article navigation", async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase102-")),
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
    reviewer: "phase102-test",
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
    await applyPhase102MontblancSeriesNavigationContent(client, options);
    for (const [id, slug] of [
      [PHASE102_WRITERS_ID, PHASE102_WRITERS_SLUG],
      [PHASE102_PATRON_ID, PHASE102_PATRON_SLUG],
    ] as const) {
      const page = await client.execute({
        sql: "SELECT type, slug, body_md FROM public_entities WHERE id = ?",
        args: [id],
      });
      assert.equal(page.rows.length, 1);
      assert.equal(String(page.rows[0]?.type), "article");
      assert.equal(String(page.rows[0]?.slug), slug);
      assert.ok(Array.from(String(page.rows[0]?.body_md)).length >= 1_800);
      const refs = await client.execute({
        sql: "SELECT count(*) AS value FROM entity_references WHERE entity_id = ? AND review_status = 'approved'",
        args: [id],
      });
      assert.equal(Number(refs.rows[0]?.value), 3);
      const models = await client.execute({
        sql: "SELECT count(*) AS value FROM entity_links WHERE (source_id = ? OR target_id = ?) AND link_type IN ('made_by', 'reverse')",
        args: [id, id],
      });
      assert.equal(Number(models.rows[0]?.value), 0);
      const publication = await client.execute({
        sql: "SELECT count(*) AS value FROM entity_publications WHERE entity_id = ?",
        args: [id],
      });
      assert.equal(Number(publication.rows[0]?.value), 0);
    }
    const redirects = await client.execute({
      sql: "SELECT count(*) AS value FROM entity_redirects WHERE source_path IN (?, ?)",
      args: [
        "/pen/万宝龙-montblanc-大文豪系列-writers-edition",
        "/pen/万宝龙-montblanc-patron-of-art-888",
      ],
    });
    assert.equal(Number(redirects.rows[0]?.value), 0);
    assert.equal(
      getReclassifiedArticlePath(
        "pen",
        "万宝龙-montblanc-大文豪系列-writers-edition",
      ),
      "/article/montblanc-writers-edition",
    );
    assert.equal(
      getReclassifiedArticlePath("pen", "万宝龙-montblanc-patron-of-art-888"),
      "/article/montblanc-patron-of-art",
    );
    await applyPhase102MontblancSeriesNavigationContent(client, options);
    for (const id of [PHASE102_WRITERS_ID, PHASE102_PATRON_ID]) {
      const references = await client.execute({
        sql: "SELECT count(*) AS value FROM entity_references WHERE entity_id = ?",
        args: [id],
      });
      const media = await client.execute({
        sql: "SELECT count(*) AS value FROM media_assets WHERE entity_id = ?",
        args: [id],
      });
      assert.equal(Number(references.rows[0]?.value), 3);
      assert.equal(Number(media.rows[0]?.value), 1);
    }
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assert.deepEqual(snapshotCatalogFiles(REAL), snapshot);
});
