import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase292PilotMetropolitanContent } from "../../scripts/apply-phase292-pilot-metropolitan-content";
import {
  PHASE292_METROPOLITAN_ID,
  PHASE292_METROPOLITAN_SLUG,
  PHASE292_PILOT_BRAND_ID,
} from "../../scripts/data/phase292-pilot-metropolitan";
import {
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL_CATALOG = path.join(ROOT, "data", "fpkg.db");

async function scalar(
  client: ReturnType<typeof createClient>,
  sql: string,
  args: string[] = [],
): Promise<number> {
  const result = await client.execute({ sql, args });
  return Number(result.rows[0]?.value ?? 0);
}

test("Phase 292 publishes Pilot MR Metropolitan only on an owned copy", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase292-pilot-")),
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
    reviewer: "phase292-pilot-metropolitan-test",
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
    const first = await applyPhase292PilotMetropolitanContent(client, options);
    assert.ok(
      first.entities.every(
        (entity) => entity.outcome === "published" || entity.outcome === "noop",
      ),
      JSON.stringify(first),
    );
    const pages = await client.execute({
      sql: "SELECT id,type,slug,summary,body_md FROM public_entities WHERE id IN (?,?) ORDER BY id",
      args: [PHASE292_PILOT_BRAND_ID, PHASE292_METROPOLITAN_ID],
    });
    assert.equal(pages.rows.length, 2);
    const brand = pages.rows.find(
      (page) => String(page.id) === PHASE292_PILOT_BRAND_ID,
    );
    const model = pages.rows.find(
      (page) => String(page.id) === PHASE292_METROPOLITAN_ID,
    );
    assert.equal(String(brand?.slug), "pilot");
    assert.ok(String(brand?.body_md).length >= 1_200);
    assert.equal(String(model?.slug), PHASE292_METROPOLITAN_SLUG);
    assert.ok(String(model?.summary).length >= 60);
    assert.ok(String(model?.body_md).length >= 2_000);
    assert.match(String(model?.body_md), /CON-B/);
    assert.match(String(model?.body_md), /Cocoon/);
    assert.match(String(model?.body_md), /动物纹/);
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
        [PHASE292_METROPOLITAN_ID, PHASE292_PILOT_BRAND_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
        [PHASE292_PILOT_BRAND_ID, PHASE292_METROPOLITAN_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM model_specs WHERE entity_id=?",
        [PHASE292_METROPOLITAN_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM model_variants WHERE model_entity_id=?",
        [PHASE292_METROPOLITAN_ID],
      ),
      4,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM claims WHERE subject_entity_id=?",
        [PHASE292_METROPOLITAN_ID],
      ),
      9,
    );
    const reviews = await client.execute({
      sql: "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND status='approved' ORDER BY review_kind",
      args: [PHASE292_METROPOLITAN_ID],
    });
    assert.deepEqual(
      reviews.rows.map((row) => String(row.review_kind)),
      ["fact", "language", "media", "publication"],
    );
    const media = await client.execute({
      sql: "SELECT local_path FROM media_assets WHERE entity_id=? AND usage_status='primary'",
      args: [PHASE292_METROPOLITAN_ID],
    });
    assert.equal(media.rows.length, 1);
    const svg = fs.readFileSync(
      path.join(ROOT, "public", String(media.rows[0]?.local_path).slice(1)),
      "utf8",
    );
    assert.match(svg, /data-factual-svg="true"/);
    assert.match(svg, /data-product-photo="false"/);
    const replay = await applyPhase292PilotMetropolitanContent(client, options);
    assert.ok(
      replay.entities.every((entity) => entity.outcome === "noop"),
      JSON.stringify(replay),
    );
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assert.deepEqual(snapshotCatalogFiles(REAL_CATALOG), protectedSnapshot);
});

test("Phase 292 rejects remote selection and never writes the real catalog", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase292-pilot-remote-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL_CATALOG,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  try {
    await migrateDatabase(client);
    await assert.rejects(
      () =>
        applyPhase292PilotMetropolitanContent(client, {
          workspaceRoot: ROOT,
          reviewer: "phase292-pilot-metropolitan-test",
          databasePath: copy.destinationPath,
          ownedRoot,
          protectedCatalogPath: REAL_CATALOG,
          protectedCatalogSnapshot: protectedSnapshot,
          env: {
            ...process.env,
            TURSO_DATABASE_URL: "libsql://blocked",
            TURSO_AUTH_TOKEN: "blocked",
            FPKG_DATABASE_URL: "",
          },
        }),
      /remote database selection/,
    );
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assert.deepEqual(snapshotCatalogFiles(REAL_CATALOG), protectedSnapshot);
});
