import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase41IdentityCleanupContent } from "../../scripts/apply-phase41-identity-cleanup-content";
import {
  PHASE41_AURORA_88_ID,
  PHASE41_AURORA_BRAND_ID,
  PHASE41_AURORA_GENERIC_ID,
  PHASE41_PILOT_823_DUPLICATE_ID,
  PHASE41_PILOT_823_ID,
  PHASE41_PILOT_BRAND_ID,
  PHASE41_WATERMAN_BRAND_ID,
  PHASE41_WATERMAN_HEMISPHERE_ID,
} from "../../scripts/data/phase41-identity-cleanup";
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

test("Phase 41 repairs Pilot duplicate, Waterman mixed identity and Aurora generic placeholder on an owned copy", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase41-identity-")),
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
    reviewer: "phase41-identity-cleanup",
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
    const result = await applyPhase41IdentityCleanupContent(client, options);
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
    const publicRows = await client.execute({
      sql: "SELECT id FROM public_entities WHERE id IN (?, ?, ?, ?, ?, ?, ?, ?) ORDER BY id",
      args: [
        PHASE41_PILOT_BRAND_ID,
        PHASE41_PILOT_823_ID,
        PHASE41_WATERMAN_BRAND_ID,
        PHASE41_WATERMAN_HEMISPHERE_ID,
        PHASE41_AURORA_BRAND_ID,
        PHASE41_AURORA_88_ID,
        PHASE41_PILOT_823_DUPLICATE_ID,
        PHASE41_AURORA_GENERIC_ID,
      ],
    });
    assert.equal(publicRows.rows.length, 6);
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entities WHERE id = ? AND slug = 'waterman-hemisphere'",
        [PHASE41_WATERMAN_HEMISPHERE_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_aliases WHERE entity_id = ? AND alias IN ('Waterman Charleston', '威迪文 查尔斯顿 / Hemisphere')",
        [PHASE41_WATERMAN_HEMISPHERE_ID],
      ),
      0,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_publications WHERE entity_id IN (?, ?) AND status = 'retired'",
        [PHASE41_PILOT_823_DUPLICATE_ID, PHASE41_AURORA_GENERIC_ID],
      ),
      2,
    );
    const redirects = await client.execute({
      sql: "SELECT source_path, target_path, redirect_kind FROM entity_redirects WHERE source_path IN (?, ?, ?) ORDER BY source_path",
      args: [
        "/pen/百乐-pilot-custom-823",
        "/pen/威迪文-waterman-查尔斯顿-hemisphere",
        "/pen/奥罗拉-aurora",
      ],
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
      {
        source_path: "/pen/百乐-pilot-custom-823",
        target_path: "/pen/pilot-custom-823",
        redirect_kind: "permanent",
      },
    ]);
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_aliases WHERE entity_id = ? AND alias IN ('Pilot Custom 823', '百乐 823', '百乐 Pilot Custom 823')",
        [PHASE41_PILOT_823_ID],
      ),
      3,
    );
    for (const id of [
      PHASE41_PILOT_823_ID,
      PHASE41_WATERMAN_HEMISPHERE_ID,
      PHASE41_AURORA_88_ID,
    ]) {
      const media = await client.execute({
        sql: "SELECT local_path, license, usage_status FROM media_assets WHERE entity_id = ?",
        args: [id],
      });
      assert.equal(media.rows.length, 1);
      const localPath = String(media.rows[0]?.local_path ?? "");
      const svg = fs.readFileSync(
        path.join(ROOT, "public", localPath.slice(1)),
        "utf8",
      );
      assert.match(svg, /示意图，非产品照片/);
    }
    const before = await client.execute({
      sql: "SELECT entity_id, status, content_revision, approved_content_hash FROM entity_publications WHERE entity_id IN (?, ?, ?, ?, ?, ?) ORDER BY entity_id",
      args: [
        PHASE41_PILOT_BRAND_ID,
        PHASE41_PILOT_823_ID,
        PHASE41_WATERMAN_BRAND_ID,
        PHASE41_WATERMAN_HEMISPHERE_ID,
        PHASE41_AURORA_BRAND_ID,
        PHASE41_AURORA_88_ID,
      ],
    });
    const replay = await applyPhase41IdentityCleanupContent(client, options);
    assert.ok(replay.entities.every((entity) => entity.outcome === "noop"));
    const after = await client.execute({
      sql: "SELECT entity_id, status, content_revision, approved_content_hash FROM entity_publications WHERE entity_id IN (?, ?, ?, ?, ?, ?) ORDER BY entity_id",
      args: [
        PHASE41_PILOT_BRAND_ID,
        PHASE41_PILOT_823_ID,
        PHASE41_WATERMAN_BRAND_ID,
        PHASE41_WATERMAN_HEMISPHERE_ID,
        PHASE41_AURORA_BRAND_ID,
        PHASE41_AURORA_88_ID,
      ],
    });
    assert.deepEqual(after.rows, before.rows);
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assert.deepEqual(snapshotCatalogFiles(REAL_CATALOG), protectedSnapshot);
});
