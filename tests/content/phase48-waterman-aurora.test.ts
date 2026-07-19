import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase48WatermanAuroraContent } from "../../scripts/apply-phase48-waterman-aurora-content";
import {
  PHASE48_AURORA_88_ID,
  PHASE48_AURORA_BRAND_ID,
  PHASE48_AURORA_GENERIC_ID,
  PHASE48_AURORA_OPTIMA_ID,
  PHASE48_WATERMAN_BRAND_ID,
  PHASE48_WATERMAN_CHARLESTON_ID,
  PHASE48_WATERMAN_HEMISPHERE_ID,
} from "../../scripts/data/phase48-waterman-aurora";
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

test("Phase 48 publishes Waterman and Aurora concrete lines on an owned copy", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase48-waterman-aurora-")),
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
    reviewer: "phase48-waterman-aurora",
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
    const result = await applyPhase48WatermanAuroraContent(client, options);
    assert.deepEqual(
      result.entities.map((entity) => entity.outcome),
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
      await scalar(
        client,
        "SELECT count(*) AS value FROM public_entities WHERE id IN (?, ?, ?, ?, ?, ?)",
        [
          PHASE48_WATERMAN_BRAND_ID,
          PHASE48_WATERMAN_HEMISPHERE_ID,
          PHASE48_WATERMAN_CHARLESTON_ID,
          PHASE48_AURORA_BRAND_ID,
          PHASE48_AURORA_88_ID,
          PHASE48_AURORA_OPTIMA_ID,
        ],
      ),
      6,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM public_entities WHERE id = ?",
        [PHASE48_AURORA_GENERIC_ID],
      ),
      0,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_publications WHERE entity_id = ? AND status = 'retired'",
        [PHASE48_AURORA_GENERIC_ID],
      ),
      1,
    );
    const redirects = await client.execute({
      sql: "SELECT source_path, target_path, redirect_kind FROM entity_redirects WHERE source_path IN (?, ?) ORDER BY source_path",
      args: ["/pen/威迪文-waterman-查尔斯顿-hemisphere", "/pen/奥罗拉-aurora"],
    });
    assert.deepEqual(redirects.rows, [
      {
        source_path: "/pen/奥罗拉-aurora",
        target_path: null,
        redirect_kind: "hard_404",
      },
      {
        source_path: "/pen/威迪文-waterman-查尔斯顿-hemisphere",
        target_path: "/pen/waterman-hemisphere",
        redirect_kind: "permanent",
      },
    ]);
    for (const id of [
      PHASE48_WATERMAN_HEMISPHERE_ID,
      PHASE48_WATERMAN_CHARLESTON_ID,
      PHASE48_AURORA_88_ID,
      PHASE48_AURORA_OPTIMA_ID,
    ]) {
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND link_type = 'made_by'",
          [id],
        ),
        1,
      );
      const media = await client.execute({
        sql: "SELECT local_path, usage_status FROM media_assets WHERE entity_id = ?",
        args: [id],
      });
      assert.equal(media.rows.length, 1);
      assert.equal(media.rows[0]?.usage_status, "primary");
      assert.match(
        fs.readFileSync(
          path.join(ROOT, "public", String(media.rows[0]?.local_path).slice(1)),
          "utf8",
        ),
        /示意图，非产品照片/,
      );
    }
    const before = await client.execute({
      sql: "SELECT entity_id, status, content_revision, approved_content_hash FROM entity_publications WHERE entity_id IN (?, ?, ?, ?, ?, ?) ORDER BY entity_id",
      args: [
        PHASE48_WATERMAN_BRAND_ID,
        PHASE48_WATERMAN_HEMISPHERE_ID,
        PHASE48_WATERMAN_CHARLESTON_ID,
        PHASE48_AURORA_BRAND_ID,
        PHASE48_AURORA_88_ID,
        PHASE48_AURORA_OPTIMA_ID,
      ],
    });
    const replay = await applyPhase48WatermanAuroraContent(client, options);
    assert.ok(replay.entities.every((entity) => entity.outcome === "noop"));
    const after = await client.execute({
      sql: "SELECT entity_id, status, content_revision, approved_content_hash FROM entity_publications WHERE entity_id IN (?, ?, ?, ?, ?, ?) ORDER BY entity_id",
      args: [
        PHASE48_WATERMAN_BRAND_ID,
        PHASE48_WATERMAN_HEMISPHERE_ID,
        PHASE48_WATERMAN_CHARLESTON_ID,
        PHASE48_AURORA_BRAND_ID,
        PHASE48_AURORA_88_ID,
        PHASE48_AURORA_OPTIMA_ID,
      ],
    });
    assert.deepEqual(after.rows, before.rows);
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assert.deepEqual(snapshotCatalogFiles(REAL_CATALOG), protectedSnapshot);
});
