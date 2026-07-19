import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import { applyPhase66AsvineP36Content } from "../../scripts/apply-phase66-asvine-p36-content";
import {
  PHASE66_LEGACY_BRAND_ID,
  PHASE66_P36_ID,
  PHASE66_P36_RAW_SLUG,
  PHASE66_P36_SLUG,
} from "../../scripts/data/phase66-asvine-p36";
import {
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL_CATALOG = path.join(ROOT, "data", "fpkg.db");
async function scalar(client: Client, sql: string, args: string[] = []) {
  const result = await client.execute({ sql, args });
  return Number(result.rows[0]?.value ?? 0);
}

test("Phase 66 publishes Asvine/P36 and replaces only the incorrect YiSiHua maker relation", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase66-asvine-p36-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL_CATALOG,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options = {
    workspaceRoot: ROOT,
    reviewer: "phase66-asvine-p36-test",
    databasePath: copy.destinationPath,
    ownedRoot,
    protectedCatalogPath: REAL_CATALOG,
    protectedCatalogSnapshot: protectedSnapshot,
    env: {
      ...process.env,
      TURSO_DATABASE_URL: "",
      TURSO_AUTH_TOKEN: "",
      FPKG_DATABASE_URL: "",
    },
  } as const;
  try {
    await migrateDatabase(client);
    const first = await applyPhase66AsvineP36Content(client, options);
    assert.deepEqual(
      first.entities.map((entity) => entity.outcome),
      ["published", "published"],
    );
    const brand = await client.execute({
      sql: "SELECT id, slug, length(summary) AS summary_length, length(body_md) AS body_length FROM entities WHERE type = 'brand' AND slug = 'asvine'",
      args: [],
    });
    assert.equal(brand.rows.length, 1);
    const brandId = String(brand.rows[0]?.id);
    assert.ok(Number(brand.rows[0]?.summary_length) >= 60);
    assert.ok(Number(brand.rows[0]?.body_length) >= 1200);
    const p36 = await client.execute({
      sql: "SELECT slug, length(summary) AS summary_length, length(body_md) AS body_length FROM entities WHERE id = ?",
      args: [PHASE66_P36_ID],
    });
    assert.equal(String(p36.rows[0]?.slug), PHASE66_P36_SLUG);
    assert.ok(Number(p36.rows[0]?.summary_length) >= 60);
    assert.ok(Number(p36.rows[0]?.body_length) >= 2000);
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'",
        [PHASE66_P36_ID, brandId],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND link_type = 'made_by'",
        [PHASE66_P36_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'",
        [PHASE66_P36_ID, PHASE66_LEGACY_BRAND_ID],
      ),
      0,
    );
    const route = await client.execute({
      sql: "SELECT target_path, redirect_kind FROM entity_redirects WHERE source_path = ?",
      args: [`/pen/${PHASE66_P36_RAW_SLUG}`],
    });
    assert.deepEqual(route.rows, [
      { target_path: `/pen/${PHASE66_P36_SLUG}`, redirect_kind: "permanent" },
    ]);
    const asset = await client.execute({
      sql: "SELECT local_path FROM media_assets WHERE entity_id = ? AND usage_status = 'primary'",
      args: [PHASE66_P36_ID],
    });
    assert.equal(asset.rows.length, 1);
    assert.match(
      fs.readFileSync(
        path.join(ROOT, "public", String(asset.rows[0]?.local_path).slice(1)),
        "utf8",
      ),
      /示意图，非产品照片/,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM public_entities WHERE id IN (?, ?)",
        [brandId, PHASE66_P36_ID],
      ),
      2,
    );
    const replay = await applyPhase66AsvineP36Content(client, options);
    assert.ok(replay.entities.every((entity) => entity.outcome === "noop"));
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assert.deepEqual(snapshotCatalogFiles(REAL_CATALOG), protectedSnapshot);
});
