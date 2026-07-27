import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase293FranklinChristophModel02Content } from "../../scripts/apply-phase293-franklin-christoph-model02-content";
import {
  PHASE293_FC_BRAND_ID,
  PHASE293_MODEL02_ID,
  PHASE293_MODEL02_SLUG,
} from "../../scripts/data/phase293-franklin-christoph-model02";
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

function options(
  copy: { destinationPath: string },
  ownedRoot: string,
  protectedSnapshot: ReturnType<typeof snapshotCatalogFiles>,
) {
  return {
    workspaceRoot: ROOT,
    reviewer: "phase293-franklin-christoph-model02-test",
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
}

test("Phase 293 publishes Franklin-Christoph Model 02 only on an owned copy", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase293-fc-model02-")),
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
    const first = await applyPhase293FranklinChristophModel02Content(
      client,
      options(copy, ownedRoot, protectedSnapshot),
    );
    assert.ok(
      first.entities.every(
        (entity) => entity.outcome === "published" || entity.outcome === "noop",
      ),
      JSON.stringify(first),
    );
    const pages = await client.execute({
      sql: "SELECT id,type,slug,summary,body_md FROM public_entities WHERE id IN (?,?) ORDER BY id",
      args: [PHASE293_FC_BRAND_ID, PHASE293_MODEL02_ID],
    });
    assert.equal(pages.rows.length, 2);
    const brand = pages.rows.find(
      (page) => String(page.id) === PHASE293_FC_BRAND_ID,
    );
    const model = pages.rows.find(
      (page) => String(page.id) === PHASE293_MODEL02_ID,
    );
    assert.equal(String(brand?.slug), "franklin-christoph");
    assert.ok(String(brand?.body_md).length >= 1_200);
    assert.equal(String(model?.slug), PHASE293_MODEL02_SLUG);
    assert.ok(String(model?.body_md).length >= 2_000);
    assert.match(String(model?.body_md), /2011/);
    assert.match(String(model?.body_md), /3\.8/);
    assert.match(String(model?.body_md), /#6/);
    assert.match(String(model?.body_md), /深插帽/);
    assert.match(String(model?.body_md), /Model 20/);
    assert.match(String(model?.body_md), /pocket 20/);
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
        [PHASE293_MODEL02_ID, PHASE293_FC_BRAND_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
        [PHASE293_FC_BRAND_ID, PHASE293_MODEL02_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM model_specs WHERE entity_id=?",
        [PHASE293_MODEL02_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM model_variants WHERE model_entity_id=?",
        [PHASE293_MODEL02_ID],
      ),
      5,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM claims WHERE subject_entity_id=?",
        [PHASE293_MODEL02_ID],
      ),
      12,
    );
    const reviews = await client.execute({
      sql: "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND status='approved' ORDER BY review_kind",
      args: [PHASE293_MODEL02_ID],
    });
    assert.deepEqual(
      reviews.rows.map((row) => String(row.review_kind)),
      ["fact", "language", "media", "publication"],
    );
    const media = await client.execute({
      sql: "SELECT local_path FROM media_assets WHERE entity_id=? AND usage_status='primary'",
      args: [PHASE293_MODEL02_ID],
    });
    assert.equal(media.rows.length, 1);
    const svg = fs.readFileSync(
      path.join(ROOT, "public", String(media.rows[0]?.local_path).slice(1)),
      "utf8",
    );
    assert.match(svg, /data-factual-svg="true"/);
    assert.match(svg, /data-product-photo="false"/);
    const replay = await applyPhase293FranklinChristophModel02Content(
      client,
      options(copy, ownedRoot, protectedSnapshot),
    );
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

test("Phase 293 rejects remote selection and never writes the real catalog", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase293-fc-model02-remote-")),
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
        applyPhase293FranklinChristophModel02Content(client, {
          ...options(copy, ownedRoot, protectedSnapshot),
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
