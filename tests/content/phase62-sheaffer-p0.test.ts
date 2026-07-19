import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase62SheafferP0Content } from "../../scripts/apply-phase62-sheaffer-p0-content";
import {
  PHASE62_BALANCE_ID,
  PHASE62_BALANCE_RAW_SLUG,
  PHASE62_MIXED_IMPERIAL_ID,
  PHASE62_MIXED_IMPERIAL_SLUG,
  PHASE62_PFM_ID,
  PHASE62_PFM_RAW_SLUG,
  PHASE62_SHEAFFER_ID,
  PHASE62_SNORKEL_ID,
  PHASE62_SNORKEL_RAW_SLUG,
  PHASE62_TARGA_ID,
  PHASE62_TARGA_RAW_SLUG,
  PHASE62_TUCKAWAY_ID,
  PHASE62_TUCKAWAY_RAW_SLUG,
} from "../../scripts/data/phase62-sheaffer-p0";
import {
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL_CATALOG = path.join(ROOT, "data", "fpkg.db");
const CANONICAL_IDS = [
  PHASE62_BALANCE_ID,
  PHASE62_SNORKEL_ID,
  PHASE62_PFM_ID,
  PHASE62_TUCKAWAY_ID,
  PHASE62_TARGA_ID,
] as const;
const OLD_ROUTES = [
  PHASE62_BALANCE_RAW_SLUG,
  PHASE62_SNORKEL_RAW_SLUG,
  PHASE62_PFM_RAW_SLUG,
  PHASE62_TUCKAWAY_RAW_SLUG,
  PHASE62_TARGA_RAW_SLUG,
] as const;

async function scalar(
  client: ReturnType<typeof createClient>,
  sql: string,
  args: string[] = [],
): Promise<number> {
  const result = await client.execute({ sql, args });
  return Number(result.rows[0]?.value ?? 0);
}

test("Phase 62 canonicalizes five Sheaffer families and retires ambiguous 帝国元首 on an owned copy", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase62-sheaffer-")),
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
    reviewer: "phase62-sheaffer-p0",
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
    const first = await applyPhase62SheafferP0Content(client, options);
    assert.deepEqual(
      first.entities.map((entity) => entity.outcome),
      ["published", "published", "published", "published", "published", "published"],
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM public_entities WHERE id IN (?, ?, ?, ?, ?)",
        [...CANONICAL_IDS],
      ),
      5,
    );
    const canonical = await client.execute({
      sql: "SELECT id, slug, type, length(summary) AS summary_length, length(body_md) AS body_length FROM entities WHERE id IN (?, ?, ?, ?, ?) ORDER BY id",
      args: [...CANONICAL_IDS],
    });
    assert.equal(canonical.rows.length, 5);
    for (const row of canonical.rows) {
      assert.equal(String(row.type), "pen");
      assert.ok(Number(row.summary_length) >= 60);
      assert.ok(Number(row.body_length) >= 2000);
    }
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id IN (?, ?, ?, ?, ?) AND target_id = ? AND link_type = 'made_by'",
        [...CANONICAL_IDS, PHASE62_SHEAFFER_ID],
      ),
      5,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM model_specs WHERE entity_id IN (?, ?, ?, ?, ?)",
        [...CANONICAL_IDS],
      ),
      5,
    );
    const redirects = await client.execute({
      sql: "SELECT source_path, target_path, redirect_kind FROM entity_redirects WHERE source_path IN (?, ?, ?, ?, ?, ?) ORDER BY source_path",
      args: [
        ...OLD_ROUTES.map((slug) => `/pen/${slug}`),
        `/pen/${PHASE62_MIXED_IMPERIAL_SLUG}`,
      ],
    });
    assert.equal(redirects.rows.length, 6);
    for (const row of redirects.rows) {
      if (String(row.source_path) === `/pen/${PHASE62_MIXED_IMPERIAL_SLUG}`) {
        assert.equal(row.target_path, null);
        assert.equal(String(row.redirect_kind), "hard_404");
      } else {
        assert.equal(String(row.redirect_kind), "permanent");
        assert.match(String(row.target_path), /^\/pen\/sheaffer-/);
      }
    }
    const donor = await client.execute({
      sql: "SELECT ep.status, ep.blockers_json FROM entity_publications ep WHERE ep.entity_id = ?",
      args: [PHASE62_MIXED_IMPERIAL_ID],
    });
    assert.deepEqual(donor.rows, [
      {
        status: "retired",
        blockers_json: '["identity_ambiguous_imperial_legacy"]',
      },
    ]);
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND link_type = 'made_by'",
        [PHASE62_MIXED_IMPERIAL_ID],
      ),
      0,
    );
    const second = await applyPhase62SheafferP0Content(client, options);
    assert.ok(second.entities.every((entity) => entity.outcome === "noop"));
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assert.deepEqual(snapshotCatalogFiles(REAL_CATALOG), protectedSnapshot);
});
