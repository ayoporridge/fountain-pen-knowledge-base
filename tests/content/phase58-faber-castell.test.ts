import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase58FaberCastellContent } from "../../scripts/apply-phase58-faber-castell-content";
import {
  PHASE58_AMBITION_ID,
  PHASE58_CLASSIC_ID,
  PHASE58_EMOTION_ID,
  PHASE58_FABER_BRAND_ID,
  PHASE58_LOOM_ID,
  PHASE58_NEO_SLIM_ID,
  PHASE58_ONDORO_ID,
} from "../../scripts/data/phase58-faber-castell";
import {
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL_CATALOG = path.join(ROOT, "data", "fpkg.db");
const PEN_IDS = [
  PHASE58_AMBITION_ID,
  PHASE58_EMOTION_ID,
  PHASE58_ONDORO_ID,
  PHASE58_CLASSIC_ID,
  PHASE58_NEO_SLIM_ID,
  PHASE58_LOOM_ID,
] as const;

async function scalar(
  client: ReturnType<typeof createClient>,
  sql: string,
  args: string[] = [],
): Promise<number> {
  const result = await client.execute({ sql, args });
  return Number(result.rows[0]?.value ?? 0);
}

test("Phase 58 publishes Faber-Castell lines with normalized slugs and sourced boundaries on an owned copy", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase58-faber-castell-")),
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
    reviewer: "phase58-faber-castell",
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
    const first = await applyPhase58FaberCastellContent(client, options);
    assert.deepEqual(
      first.entities.map((entity) => entity.outcome),
      [
        "published",
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
        "SELECT count(*) AS value FROM public_entities WHERE id IN (?, ?, ?, ?, ?, ?, ?)",
        [PHASE58_FABER_BRAND_ID, ...PEN_IDS],
      ),
      7,
    );
    const rows = await client.execute({
      sql: "SELECT id, type, slug, length(summary) AS summary_length, length(body_md) AS body_length FROM entities WHERE id IN (?, ?, ?, ?, ?, ?, ?) ORDER BY id",
      args: [PHASE58_FABER_BRAND_ID, ...PEN_IDS],
    });
    assert.equal(rows.rows.length, 7);
    for (const row of rows.rows) {
      assert.ok(Number(row.summary_length) >= 60);
      assert.ok(
        Number(row.body_length) >= (String(row.type) === "brand" ? 1200 : 2000),
      );
    }
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id IN (?, ?, ?, ?, ?, ?) AND target_id = ? AND link_type = 'made_by'",
        [...PEN_IDS, PHASE58_FABER_BRAND_ID],
      ),
      6,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM media_assets WHERE entity_id IN (?, ?, ?, ?, ?, ?, ?) AND usage_status = 'primary'",
        [PHASE58_FABER_BRAND_ID, ...PEN_IDS],
      ),
      7,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM model_specs WHERE entity_id IN (?, ?, ?, ?, ?, ?)",
        [...PEN_IDS],
      ),
      6,
    );
    const redirects = await client.execute({
      sql: "SELECT source_path, target_path, redirect_kind FROM entity_redirects WHERE source_path IN (?, ?, ?, ?, ?, ?) ORDER BY source_path",
      args: [
        "/pen/辉柏嘉-faber-castell-ambition雄心",
        "/pen/辉柏嘉-faber-castell-e-motion尚品",
        "/pen/辉柏嘉-faber-castell-ondoro极致-烟熏橡木",
        "/pen/辉柏嘉-faber-castell-伯爵经典-gvfc",
        "/pen/辉柏嘉-faber-castell-伯爵翎尚-neo-slim",
        "/pen/辉柏嘉-faber-castell-如恩-loom",
      ],
    });
    assert.equal(redirects.rows.length, 6);
    assert.ok(
      redirects.rows.every((row) => String(row.redirect_kind) === "permanent"),
    );
    const slugs = await client.execute({
      sql: "SELECT slug FROM entities WHERE id IN (?, ?, ?, ?, ?, ?) ORDER BY slug",
      args: [...PEN_IDS],
    });
    assert.deepEqual(
      slugs.rows.map((row) => String(row.slug)),
      [
        "faber-castell-ambition",
        "faber-castell-e-motion",
        "faber-castell-loom",
        "faber-castell-neo-slim",
        "faber-castell-ondoro",
        "graf-von-faber-castell-classic",
      ],
    );
    assert.ok(
      await scalar(
        client,
        "SELECT count(*) AS value FROM source_items WHERE url LIKE '%faber-castell.com%' OR url LIKE '%fabercastell.com%'",
      ),
    );
    const second = await applyPhase58FaberCastellContent(client, options);
    assert.ok(second.entities.every((entity) => entity.outcome === "noop"));
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assert.deepEqual(snapshotCatalogFiles(REAL_CATALOG), protectedSnapshot);
});
