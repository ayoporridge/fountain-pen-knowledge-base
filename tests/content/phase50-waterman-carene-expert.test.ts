import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase50WatermanCareneExpertContent } from "../../scripts/apply-phase50-waterman-carene-expert-content";
import {
  PHASE50_CARENE_ID,
  PHASE50_EXPERT_ID,
  PHASE50_WATERMAN_BRAND_ID,
} from "../../scripts/data/phase50-waterman-carene-expert";
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

test("Phase 50 publishes Waterman Carène and Expert on an owned copy", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase50-waterman-")),
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
    reviewer: "phase50-waterman-carene-expert",
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
    const result = await applyPhase50WatermanCareneExpertContent(
      client,
      options,
    );
    assert.deepEqual(
      result.entities.map((entity) => entity.outcome),
      ["published", "published", "published"],
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM public_entities WHERE id IN (?, ?, ?)",
        [PHASE50_WATERMAN_BRAND_ID, PHASE50_CARENE_ID, PHASE50_EXPERT_ID],
      ),
      3,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id IN (?, ?) AND target_id = ? AND link_type = 'made_by'",
        [PHASE50_CARENE_ID, PHASE50_EXPERT_ID, PHASE50_WATERMAN_BRAND_ID],
      ),
      2,
    );
    const entities = await client.execute({
      sql: "SELECT id, slug, name, length(body_md) AS body_length FROM entities WHERE id IN (?, ?) ORDER BY id",
      args: [PHASE50_CARENE_ID, PHASE50_EXPERT_ID],
    });
    assert.deepEqual(entities.rows.map((row) => String(row.slug)).sort(), [
      "waterman-carene",
      "waterman-expert",
    ]);
    assert.ok(entities.rows.every((row) => Number(row.body_length) >= 2000));
    const redirects = await client.execute({
      sql: "SELECT source_path, target_path, redirect_kind FROM entity_redirects WHERE source_path IN (?, ?) ORDER BY source_path",
      args: [
        `/pen/${"威迪文-waterman-海韵-car-ne"}`,
        `/pen/${"威迪文-waterman-权威-expert"}`,
      ],
    });
    assert.deepEqual(redirects.rows, [
      {
        source_path: "/pen/威迪文-waterman-权威-expert",
        target_path: "/pen/waterman-expert",
        redirect_kind: "permanent",
      },
      {
        source_path: "/pen/威迪文-waterman-海韵-car-ne",
        target_path: "/pen/waterman-carene",
        redirect_kind: "permanent",
      },
    ]);
    for (const id of [PHASE50_CARENE_ID, PHASE50_EXPERT_ID]) {
      const media = await client.execute({
        sql: "SELECT local_path, usage_status FROM media_assets WHERE entity_id = ?",
        args: [id],
      });
      assert.equal(media.rows.length, 1);
      assert.equal(media.rows[0]?.usage_status, "primary");
      const asset = path.join(
        ROOT,
        "public",
        String(media.rows[0]?.local_path).slice(1),
      );
      assert.match(fs.readFileSync(asset, "utf8"), /示意图，非产品照片/);
    }
    const before = await client.execute({
      sql: "SELECT entity_id, status, content_revision, approved_content_hash FROM entity_publications WHERE entity_id IN (?, ?, ?) ORDER BY entity_id",
      args: [PHASE50_WATERMAN_BRAND_ID, PHASE50_CARENE_ID, PHASE50_EXPERT_ID],
    });
    const replay = await applyPhase50WatermanCareneExpertContent(
      client,
      options,
    );
    assert.ok(replay.entities.every((entity) => entity.outcome === "noop"));
    const after = await client.execute({
      sql: "SELECT entity_id, status, content_revision, approved_content_hash FROM entity_publications WHERE entity_id IN (?, ?, ?) ORDER BY entity_id",
      args: [PHASE50_WATERMAN_BRAND_ID, PHASE50_CARENE_ID, PHASE50_EXPERT_ID],
    });
    assert.deepEqual(after.rows, before.rows);
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assert.deepEqual(snapshotCatalogFiles(REAL_CATALOG), protectedSnapshot);
});
