import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase65NakayaRawContent } from "../../scripts/apply-phase65-nakaya-raw-content";
import {
  PHASE65_CIGAR_PORTABLE_ID,
  PHASE65_CIGAR_PORTABLE_RAW_SLUG,
  PHASE65_CIGAR_PORTABLE_SLUG,
  PHASE65_HOUSOGE_ID,
  PHASE65_HOUSOGE_RAW_SLUG,
  PHASE65_HOUSOGE_SLUG,
  PHASE65_NAKAYA_ID,
  PHASE65_WRITER_PORTABLE_ID,
  PHASE65_WRITER_PORTABLE_RAW_SLUG,
  PHASE65_WRITER_PORTABLE_SLUG,
} from "../../scripts/data/phase65-nakaya-raw";
import {
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL_CATALOG = path.join(ROOT, "data", "fpkg.db");
const IDS = [
  PHASE65_HOUSOGE_ID,
  PHASE65_CIGAR_PORTABLE_ID,
  PHASE65_WRITER_PORTABLE_ID,
] as const;
const OLD_SLUGS = [
  PHASE65_HOUSOGE_RAW_SLUG,
  PHASE65_CIGAR_PORTABLE_RAW_SLUG,
  PHASE65_WRITER_PORTABLE_RAW_SLUG,
] as const;

async function scalar(
  client: ReturnType<typeof createClient>,
  sql: string,
  args: string[] = [],
): Promise<number> {
  const result = await client.execute({ sql, args });
  return Number(result.rows[0]?.value ?? 0);
}

test("Phase 65 canonicalizes the three Nakaya raw models on an owned copy", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase65-nakaya-")),
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
    reviewer: "phase65-nakaya-raw",
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
    const first = await applyPhase65NakayaRawContent(client, options);
    assert.deepEqual(
      first.entities.map((entity) => entity.outcome),
      ["published", "published", "published", "published"],
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM public_entities WHERE id IN (?, ?, ?)",
        [...IDS],
      ),
      3,
    );
    const canonical = await client.execute({
      sql: "SELECT id, slug, type, length(summary) AS summary_length, length(body_md) AS body_length FROM entities WHERE id IN (?, ?, ?) ORDER BY id",
      args: [...IDS],
    });
    assert.equal(canonical.rows.length, 3);
    for (const row of canonical.rows) {
      assert.equal(String(row.type), "pen");
      assert.ok(
        Number(row.summary_length) >= 60 && Number(row.summary_length) <= 160,
      );
      assert.ok(Number(row.body_length) >= 2000);
    }
    const slugs = new Map(
      canonical.rows.map((row) => [String(row.id), String(row.slug)]),
    );
    assert.equal(slugs.get(PHASE65_HOUSOGE_ID), PHASE65_HOUSOGE_SLUG);
    assert.equal(
      slugs.get(PHASE65_CIGAR_PORTABLE_ID),
      PHASE65_CIGAR_PORTABLE_SLUG,
    );
    assert.equal(
      slugs.get(PHASE65_WRITER_PORTABLE_ID),
      PHASE65_WRITER_PORTABLE_SLUG,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id IN (?, ?, ?) AND target_id = ? AND link_type = 'made_by'",
        [...IDS, PHASE65_NAKAYA_ID],
      ),
      3,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM model_specs WHERE entity_id IN (?, ?, ?)",
        [...IDS],
      ),
      3,
    );
    const redirects = await client.execute({
      sql: "SELECT source_path, target_path, redirect_kind FROM entity_redirects WHERE source_path IN (?, ?, ?) ORDER BY source_path",
      args: OLD_SLUGS.map((slug) => `/pen/${slug}`),
    });
    assert.equal(redirects.rows.length, 3);
    for (const row of redirects.rows) {
      assert.equal(String(row.redirect_kind), "permanent");
      assert.match(String(row.target_path), /^\/pen\/nakaya-/);
    }
    const second = await applyPhase65NakayaRawContent(client, options);
    assert.ok(second.entities.every((entity) => entity.outcome === "noop"));
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assert.deepEqual(snapshotCatalogFiles(REAL_CATALOG), protectedSnapshot);
});
