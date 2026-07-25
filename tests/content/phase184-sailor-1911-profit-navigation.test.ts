import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import {
  applyPhase184SailorNavigation,
  PHASE184_SERIES_ID,
  PHASE184_SERIES_SLUG,
} from "../../scripts/apply-phase184-sailor-1911-profit-navigation-content";
import {
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { getReclassifiedArticlePath } from "../../src/lib/entity-redirects";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");
test("Phase 184 reclassifies Sailor 1911/Profit shell as article navigation", {
  timeout: 900_000,
}, async () => {
  const snapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.mkdtempSync(
    path.join(os.tmpdir(), "fpkg-phase184-sailor-"),
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
    reviewer: "phase184-sailor-test",
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
    await assert.rejects(
      applyPhase184SailorNavigation(client, {
        ...options,
        env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
      }),
      /refuses remote database selection/,
    );
    await applyPhase184SailorNavigation(client, options);
    const page = await client.execute({
      sql: "SELECT type,slug,body_md,source FROM public_entities WHERE id=?",
      args: [PHASE184_SERIES_ID],
    });
    assert.equal(page.rows.length, 1);
    assert.equal(String(page.rows[0]?.type), "article");
    assert.equal(String(page.rows[0]?.slug), PHASE184_SERIES_SLUG);
    assert.ok(Array.from(String(page.rows[0]?.body_md ?? "")).length >= 1_800);
    assert.match(
      String(page.rows[0]?.source ?? ""),
      /curated:phase184:sailor-1911-profit/,
    );
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS value FROM entity_publications WHERE entity_id=?",
            args: [PHASE184_SERIES_ID],
          })
        ).rows[0]?.value,
      ),
      0,
    );
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS value FROM entity_references WHERE entity_id=? AND review_status='approved'",
            args: [PHASE184_SERIES_ID],
          })
        ).rows[0]?.value,
      ),
      6,
    );
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS value FROM media_assets WHERE entity_id=? AND usage_status='primary'",
            args: [PHASE184_SERIES_ID],
          })
        ).rows[0]?.value,
      ),
      1,
    );
    assert.ok(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND link_type='related'",
            args: [PHASE184_SERIES_ID],
          })
        ).rows[0]?.value,
      ) >= 5,
    );
    assert.equal(
      getReclassifiedArticlePath("pen", "写乐-sailor-1911-profit系列"),
      "/article/sailor-1911-profit",
    );
    await applyPhase184SailorNavigation(client, options);
    assert.equal(
      Number(
        (
          await client.execute({
            sql: "SELECT count(*) AS value FROM entity_references WHERE entity_id=?",
            args: [PHASE184_SERIES_ID],
          })
        ).rows[0]?.value,
      ),
      6,
    );
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assert.deepEqual(snapshotCatalogFiles(REAL), snapshot);
});
