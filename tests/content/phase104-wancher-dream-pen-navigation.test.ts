import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import {
  applyPhase104WancherDreamPenNavigationContent,
  PHASE104_DREAM_ID,
  PHASE104_DREAM_SLUG,
} from "../../scripts/apply-phase104-wancher-dream-pen-navigation-content";
import {
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { getReclassifiedArticlePath } from "../../src/lib/entity-redirects";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");
test("Phase 104 turns Wancher Dream Pen shell into sourced article navigation", async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase104-")),
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
    reviewer: "phase104-test",
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
    await applyPhase104WancherDreamPenNavigationContent(client, options);
    const page = await client.execute({
      sql: "SELECT type, slug, body_md FROM public_entities WHERE id = ?",
      args: [PHASE104_DREAM_ID],
    });
    assert.equal(page.rows.length, 1);
    assert.equal(String(page.rows[0]?.type), "article");
    assert.equal(String(page.rows[0]?.slug), PHASE104_DREAM_SLUG);
    assert.ok(Array.from(String(page.rows[0]?.body_md)).length >= 1_800);
    const refs = await client.execute({
      sql: "SELECT count(*) AS value FROM entity_references WHERE entity_id = ? AND review_status = 'approved'",
      args: [PHASE104_DREAM_ID],
    });
    assert.equal(Number(refs.rows[0]?.value), 5);
    const media = await client.execute({
      sql: "SELECT count(*) AS value FROM media_assets WHERE entity_id = ? AND usage_status = 'primary'",
      args: [PHASE104_DREAM_ID],
    });
    assert.equal(Number(media.rows[0]?.value), 1);
    const models = await client.execute({
      sql: "SELECT count(*) AS value FROM entity_links WHERE (source_id = ? OR target_id = ?) AND link_type IN ('made_by', 'reverse')",
      args: [PHASE104_DREAM_ID, PHASE104_DREAM_ID],
    });
    assert.equal(Number(models.rows[0]?.value), 0);
    const publication = await client.execute({
      sql: "SELECT count(*) AS value FROM entity_publications WHERE entity_id = ?",
      args: [PHASE104_DREAM_ID],
    });
    assert.equal(Number(publication.rows[0]?.value), 0);
    assert.equal(
      getReclassifiedArticlePath("pen", "wancher万佳-dream-pen"),
      "/article/wancher-dream-pen",
    );
    await applyPhase104WancherDreamPenNavigationContent(client, options);
    const replayRefs = await client.execute({
      sql: "SELECT count(*) AS value FROM entity_references WHERE entity_id = ?",
      args: [PHASE104_DREAM_ID],
    });
    const replayMedia = await client.execute({
      sql: "SELECT count(*) AS value FROM media_assets WHERE entity_id = ?",
      args: [PHASE104_DREAM_ID],
    });
    assert.equal(Number(replayRefs.rows[0]?.value), 5);
    assert.equal(Number(replayMedia.rows[0]?.value), 1);
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assert.deepEqual(snapshotCatalogFiles(REAL), snapshot);
});
