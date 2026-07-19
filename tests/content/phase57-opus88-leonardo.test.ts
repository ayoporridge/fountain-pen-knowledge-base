import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase57Opus88LeonardoContent } from "../../scripts/apply-phase57-opus88-leonardo-content";
import {
  PHASE57_LEONARDO_BRAND_ID,
  PHASE57_LEONARDO_FURORE_ID,
  PHASE57_LEONARDO_MIXED_ID,
  PHASE57_LEONARDO_MIXED_SLUG,
  PHASE57_LEONARDO_MOMENTO_ID,
  PHASE57_OPUS_BRAND_ID,
  PHASE57_OPUS_DEMO_ID,
  PHASE57_OPUS_KOLORO_ID,
  PHASE57_OPUS_MIXED_ID,
  PHASE57_OPUS_MIXED_SLUG,
} from "../../scripts/data/phase57-opus88-leonardo";
import {
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL_CATALOG = path.join(ROOT, "data", "fpkg.db");
const CANONICAL_IDS = [
  PHASE57_OPUS_DEMO_ID,
  PHASE57_OPUS_KOLORO_ID,
  PHASE57_LEONARDO_FURORE_ID,
  PHASE57_LEONARDO_MOMENTO_ID,
] as const;

async function count(
  client: ReturnType<typeof createClient>,
  sql: string,
  args: string[] = [],
): Promise<number> {
  const result = await client.execute({ sql, args });
  return Number(result.rows[0]?.value ?? 0);
}

test("Phase 57 retires mixed Opus/Leonardo donors and publishes four concrete pages on an owned copy", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase57-opus-leonardo-")),
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
    reviewer: "phase57-opus88-leonardo",
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
    const oldPayload = await client.execute({
      sql: "SELECT id, title, body_md FROM stories WHERE entity_id IN (?, ?) ORDER BY id",
      args: [PHASE57_OPUS_MIXED_ID, PHASE57_LEONARDO_MIXED_ID],
    });
    const first = await applyPhase57Opus88LeonardoContent(client, options);
    assert.deepEqual(
      first.entities.map((entity) => entity.outcome),
      [
        "published",
        "published",
        "published",
        "published",
        "published",
        "published",
      ],
    );
    assert.equal(
      await count(
        client,
        "SELECT count(*) AS value FROM public_entities WHERE id IN (?, ?, ?, ?, ?, ?)",
        [
          PHASE57_OPUS_BRAND_ID,
          PHASE57_OPUS_DEMO_ID,
          PHASE57_OPUS_KOLORO_ID,
          PHASE57_LEONARDO_BRAND_ID,
          PHASE57_LEONARDO_FURORE_ID,
          PHASE57_LEONARDO_MOMENTO_ID,
        ],
      ),
      6,
    );
    for (const [id, slug] of [
      [PHASE57_OPUS_MIXED_ID, PHASE57_OPUS_MIXED_SLUG],
      [PHASE57_LEONARDO_MIXED_ID, PHASE57_LEONARDO_MIXED_SLUG],
    ] as const) {
      const row = await client.execute({
        sql: "SELECT type, slug, status, blockers_json FROM entities e JOIN entity_publications ep ON ep.entity_id = e.id WHERE e.id = ?",
        args: [id],
      });
      assert.deepEqual(row.rows, [
        {
          type: "pen",
          slug,
          status: "retired",
          blockers_json: '["identity_mixed_made_by"]',
        },
      ]);
      assert.equal(
        await count(
          client,
          "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND link_type = 'made_by'",
          [id],
        ),
        0,
      );
    }
    assert.equal(
      await count(
        client,
        "SELECT count(*) AS value FROM entity_redirects WHERE source_path IN (?, ?)",
        [
          `/pen/${PHASE57_OPUS_MIXED_SLUG}`,
          `/pen/${PHASE57_LEONARDO_MIXED_SLUG}`,
        ],
      ),
      0,
    );
    const pages = await client.execute({
      sql: "SELECT id, type, slug, length(summary) AS summary_length, length(body_md) AS body_length FROM entities WHERE id IN (?, ?, ?, ?) ORDER BY id",
      args: [...CANONICAL_IDS],
    });
    assert.equal(pages.rows.length, 4);
    for (const row of pages.rows) {
      assert.equal(String(row.type), "pen");
      assert.ok(Number(row.summary_length) >= 60);
      assert.ok(Number(row.body_length) >= 2000);
      assert.equal(
        await count(
          client,
          "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND link_type = 'made_by'",
          [String(row.id)],
        ),
        1,
      );
      assert.equal(
        await count(
          client,
          "SELECT count(*) AS value FROM media_assets WHERE entity_id = ? AND usage_status = 'primary'",
          [String(row.id)],
        ),
        1,
      );
    }
    assert.deepEqual(
      (
        await client.execute({
          sql: "SELECT id, title, body_md FROM stories WHERE entity_id IN (?, ?) ORDER BY id",
          args: [PHASE57_OPUS_MIXED_ID, PHASE57_LEONARDO_MIXED_ID],
        })
      ).rows,
      oldPayload.rows,
    );
    const second = await applyPhase57Opus88LeonardoContent(client, options);
    assert.ok(second.entities.every((entity) => entity.outcome === "noop"));
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assert.deepEqual(snapshotCatalogFiles(REAL_CATALOG), protectedSnapshot);
});
