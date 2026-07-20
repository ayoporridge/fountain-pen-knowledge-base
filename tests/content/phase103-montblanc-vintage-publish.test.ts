import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase103MontblancVintagePublishContent } from "../../scripts/apply-phase103-montblanc-vintage-publish-content";
import {
  PHASE103_22_ID,
  PHASE103_22_OLD_SLUG,
  PHASE103_22_SLUG,
  PHASE103_144_ID,
  PHASE103_144_OLD_SLUG,
  PHASE103_144_SLUG,
  PHASE103_MONTBLANC_BRAND_ID,
} from "../../scripts/data/phase103-montblanc-vintage-publish";
import {
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");
test("Phase 103 publishes sourced Montblanc No. 144 and No. 22 pages on an owned copy", async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase103-")),
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
    reviewer: "phase103-test",
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
    const first = await applyPhase103MontblancVintagePublishContent(
      client,
      options,
    );
    assert.deepEqual(
      first.entities.map((entry) => entry.outcome),
      ["published", "published", "published"],
    );
    for (const [id, slug, needle] of [
      [PHASE103_144_ID, PHASE103_144_SLUG, "celluloid"],
      [PHASE103_22_ID, PHASE103_22_SLUG, "1960"],
    ] as const) {
      const page = await client.execute({
        sql: "SELECT type, slug, body_md FROM public_entities WHERE id = ?",
        args: [id],
      });
      assert.equal(page.rows.length, 1);
      assert.equal(String(page.rows[0]?.type), "pen");
      assert.equal(String(page.rows[0]?.slug), slug);
      assert.ok(Array.from(String(page.rows[0]?.body_md)).length >= 2_000);
      assert.match(String(page.rows[0]?.body_md), new RegExp(needle, "i"));
      const media = await client.execute({
        sql: "SELECT local_path FROM media_assets WHERE entity_id=? AND usage_status='primary'",
        args: [id],
      });
      assert.equal(media.rows.length, 1);
      assert.match(
        String(media.rows[0]?.local_path),
        /montblanc-vintage\/montblanc-no-/,
      );
      const link = await client.execute({
        sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
        args: [id, PHASE103_MONTBLANC_BRAND_ID],
      });
      assert.equal(Number(link.rows[0]?.value), 1);
    }
    const redirects = await client.execute({
      sql: "SELECT source_path,target_path,redirect_kind FROM entity_redirects WHERE source_path IN (?,?) ORDER BY source_path",
      args: [`/pen/${PHASE103_144_OLD_SLUG}`, `/pen/${PHASE103_22_OLD_SLUG}`],
    });
    assert.deepEqual(redirects.rows, [
      {
        source_path: `/pen/${PHASE103_144_OLD_SLUG}`,
        target_path: `/pen/${PHASE103_144_SLUG}`,
        redirect_kind: "permanent",
      },
      {
        source_path: `/pen/${PHASE103_22_OLD_SLUG}`,
        target_path: `/pen/${PHASE103_22_SLUG}`,
        redirect_kind: "permanent",
      },
    ]);
    const replay = await applyPhase103MontblancVintagePublishContent(
      client,
      options,
    );
    assert.ok(replay.entities.every((entry) => entry.outcome === "noop"));
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assert.deepEqual(snapshotCatalogFiles(REAL), snapshot);
});
