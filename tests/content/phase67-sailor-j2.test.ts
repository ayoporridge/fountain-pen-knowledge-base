import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import { applyPhase67SailorJ2Content } from "../../scripts/apply-phase67-sailor-j2-content";
import {
  PHASE67_MODELS,
  PHASE67_SAILOR_BRAND_ID,
} from "../../scripts/data/phase67-sailor-j2";
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

test("Phase 67 publishes four Sailor J2 raw models on an owned copy", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase67-sailor-j2-")),
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
    reviewer: "phase67-sailor-j2-test",
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
    const first = await applyPhase67SailorJ2Content(client, options);
    assert.equal(first.entities.length, 5);
    assert.ok(
      first.entities.slice(1).every((entity) => entity.outcome === "published"),
    );
    for (const model of PHASE67_MODELS) {
      const pen = await client.execute({
        sql: "SELECT id, type, slug, length(summary) AS summary_length, length(body_md) AS body_length FROM entities WHERE slug = ?",
        args: [model.slug],
      });
      assert.equal(pen.rows.length, 1, model.slug);
      assert.equal(String(pen.rows[0]?.type), "pen");
      assert.ok(
        Number(pen.rows[0]?.summary_length) >= 60 &&
          Number(pen.rows[0]?.summary_length) <= 160,
      );
      assert.ok(Number(pen.rows[0]?.body_length) >= 2000);
      const id = String(pen.rows[0]?.id);
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'",
          [id, PHASE67_SAILOR_BRAND_ID],
        ),
        1,
      );
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND link_type = 'made_by'",
          [id],
        ),
        1,
      );
      const route = await client.execute({
        sql: "SELECT target_path, redirect_kind FROM entity_redirects WHERE source_path = ?",
        args: [`/pen/${model.rawSlug}`],
      });
      assert.deepEqual(route.rows, [
        { target_path: `/pen/${model.slug}`, redirect_kind: "permanent" },
      ]);
      const asset = await client.execute({
        sql: "SELECT local_path FROM media_assets WHERE entity_id = ? AND usage_status = 'primary'",
        args: [id],
      });
      assert.equal(asset.rows.length, 1);
      assert.match(
        fs.readFileSync(
          path.join(ROOT, "public", String(asset.rows[0]?.local_path).slice(1)),
          "utf8",
        ),
        /示意图，非产品照片/,
      );
    }
    assert.equal(
      await scalar(
        client,
        `SELECT count(*) AS value FROM public_entities WHERE slug IN (${PHASE67_MODELS.map(() => "?").join(", ")})`,
        PHASE67_MODELS.map((model) => model.slug),
      ),
      4,
    );
    const second = await applyPhase67SailorJ2Content(client, options);
    assert.ok(second.entities.every((entity) => entity.outcome === "noop"));
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assert.deepEqual(snapshotCatalogFiles(REAL_CATALOG), protectedSnapshot);
});
