import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase55HeroPaidiContent } from "../../scripts/apply-phase55-hero-paidi-content";
import {
  PHASE55_HERO_849_ID,
  PHASE55_HERO_850_ID,
  PHASE55_HERO_BRAND_ID,
  PHASE55_MIXED_OLD_SLUG,
  PHASE55_MIXED_PEN_ID,
  PHASE55_PAIDI_BRAND_ID,
  PHASE55_PAIDI_CENTURY_1_ID,
} from "../../scripts/data/phase55-hero-paidi";
import {
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL_CATALOG = path.join(ROOT, "data", "fpkg.db");
const PEN_IDS = [
  PHASE55_HERO_849_ID,
  PHASE55_HERO_850_ID,
  PHASE55_PAIDI_CENTURY_1_ID,
] as const;

async function scalar(
  client: ReturnType<typeof createClient>,
  sql: string,
  args: string[] = [],
): Promise<number> {
  const result = await client.execute({ sql, args });
  return Number(result.rows[0]?.value ?? 0);
}

test("Phase 55 retires mixed Hero/Paidi identity and publishes concrete pages on an owned copy", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase55-hero-paidi-")),
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
    reviewer: "phase55-hero-paidi",
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
    const payloadBefore = await client.execute({
      sql: "SELECT id, title, body_md FROM stories WHERE entity_id = ? ORDER BY id",
      args: [PHASE55_MIXED_PEN_ID],
    });
    const first = await applyPhase55HeroPaidiContent(client, options);
    assert.deepEqual(
      first.entities.map((entity) => entity.outcome),
      ["published", "published", "published", "published", "published"],
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM public_entities WHERE id IN (?, ?, ?, ? ,?)",
        [
          PHASE55_HERO_BRAND_ID,
          PHASE55_HERO_849_ID,
          PHASE55_HERO_850_ID,
          PHASE55_PAIDI_BRAND_ID,
          PHASE55_PAIDI_CENTURY_1_ID,
        ],
      ),
      5,
    );

    const mixed = await client.execute({
      sql: "SELECT e.type, e.slug, ep.status, ep.blockers_json FROM entities e JOIN entity_publications ep ON ep.entity_id = e.id WHERE e.id = ?",
      args: [PHASE55_MIXED_PEN_ID],
    });
    assert.deepEqual(mixed.rows, [
      {
        type: "pen",
        slug: PHASE55_MIXED_OLD_SLUG,
        status: "retired",
        blockers_json: '["identity_mixed_made_by"]',
      },
    ]);
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM public_entities WHERE id = ?",
        [PHASE55_MIXED_PEN_ID],
      ),
      0,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND link_type = 'made_by'",
        [PHASE55_MIXED_PEN_ID],
      ),
      0,
    );
    const redirect = await client.execute({
      sql: "SELECT source_path, target_path, redirect_kind FROM entity_redirects WHERE source_path = ?",
      args: [`/pen/${PHASE55_MIXED_OLD_SLUG}`],
    });
    assert.deepEqual(redirect.rows, [
      {
        source_path: `/pen/${PHASE55_MIXED_OLD_SLUG}`,
        target_path: "/pen/paidi-century-1",
        redirect_kind: "permanent",
      },
    ]);
    const payloadAfter = await client.execute({
      sql: "SELECT id, title, body_md FROM stories WHERE entity_id = ? ORDER BY id",
      args: [PHASE55_MIXED_PEN_ID],
    });
    assert.deepEqual(payloadAfter.rows, payloadBefore.rows);

    const entities = await client.execute({
      sql: "SELECT id, type, slug, length(summary) AS summary_length, length(body_md) AS body_length FROM entities WHERE id IN (?, ?, ?) ORDER BY id",
      args: [...PEN_IDS],
    });
    assert.equal(entities.rows.length, 3);
    for (const row of entities.rows) {
      assert.equal(String(row.type), "pen");
      assert.ok(Number(row.summary_length) >= 60);
      assert.ok(Number(row.body_length) >= 2000);
    }
    for (const [penId, brandId] of [
      [PHASE55_HERO_849_ID, PHASE55_HERO_BRAND_ID],
      [PHASE55_HERO_850_ID, PHASE55_HERO_BRAND_ID],
      [PHASE55_PAIDI_CENTURY_1_ID, PHASE55_PAIDI_BRAND_ID],
    ] as const) {
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND link_type = 'made_by'",
          [penId],
        ),
        1,
      );
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'",
          [penId, brandId],
        ),
        1,
      );
      const media = await client.execute({
        sql: "SELECT local_path, usage_status FROM media_assets WHERE entity_id = ?",
        args: [penId],
      });
      assert.equal(media.rows.length, 1);
      assert.equal(String(media.rows[0]?.usage_status), "primary");
      assert.match(
        fs.readFileSync(
          path.join(ROOT, "public", String(media.rows[0]?.local_path).slice(1)),
          "utf8",
        ),
        /示意图，非产品照片/,
      );
    }
    const skbBefore = await client.execute({
      sql: "SELECT e.id, e.slug, e.body_md, ep.status, ep.content_revision FROM entities e JOIN entity_publications ep ON ep.entity_id = e.id WHERE e.id = '6K7UhGOj7VrS'",
    });
    assert.equal(skbBefore.rows.length, 1);
    const second = await applyPhase55HeroPaidiContent(client, options);
    assert.ok(second.entities.every((entity) => entity.outcome === "noop"));
    const skbAfter = await client.execute({
      sql: "SELECT e.id, e.slug, e.body_md, ep.status, ep.content_revision FROM entities e JOIN entity_publications ep ON ep.entity_id = e.id WHERE e.id = '6K7UhGOj7VrS'",
    });
    assert.deepEqual(skbAfter.rows, skbBefore.rows);
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assert.deepEqual(snapshotCatalogFiles(REAL_CATALOG), protectedSnapshot);
});
