import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase75SheafferLegacyHeritageContent } from "../../scripts/apply-phase75-sheaffer-legacy-heritage-content";
import {
  PHASE75_LEGACY_HERITAGE_ID,
  PHASE75_LEGACY_HERITAGE_SLUG,
  PHASE75_SHEAFFER_ID,
} from "../../scripts/data/phase75-sheaffer-legacy-heritage";
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

test("Phase 75 publishes Legacy Heritage without absorbing PFM, Imperial or Balance", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase75-sheaffer-legacy-")),
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
    reviewer: "phase75-sheaffer-legacy-heritage-test",
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
    const first = await applyPhase75SheafferLegacyHeritageContent(client, options);
    assert.deepEqual(
      first.entities.map((entity) => entity.outcome),
      ["published", "published"],
    );
    const pages = await client.execute({
      sql: "SELECT id, type, slug, summary, body_md FROM public_entities WHERE id IN (?, ?) ORDER BY id",
      args: [PHASE75_SHEAFFER_ID, PHASE75_LEGACY_HERITAGE_ID],
    });
    assert.equal(pages.rows.length, 2);
    const brand = pages.rows.find((page) => String(page.id) === PHASE75_SHEAFFER_ID);
    const heritage = pages.rows.find(
      (page) => String(page.id) === PHASE75_LEGACY_HERITAGE_ID,
    );
    assert.equal(String(brand?.type), "brand");
    assert.equal(String(heritage?.type), "pen");
    assert.equal(String(heritage?.slug), PHASE75_LEGACY_HERITAGE_SLUG);
    for (const page of pages.rows) {
      const summary = String(page.summary ?? "");
      const body = String(page.body_md ?? "");
      assert.ok(summary.length >= 60 && summary.length <= 160);
      assert.ok(body.length >= (String(page.type) === "brand" ? 1_200 : 2_000));
      assert.match(body, /示意图，非产品照片/);
      assert.doesNotMatch(body, /数据库|仓库|canonical|made_by|retired/i);
    }
    const body = String(heritage?.body_md);
    assert.match(body, /2003[\s\S]*18K[\s\S]*cartridge\/converter/);
    assert.match(body, /Legacy I[\s\S]*Touchdown converter[\s\S]*Legacy II/);
    assert.match(body, /PFM[\s\S]*Snorkel[\s\S]*9064/);
    assert.match(body, /137\.8 mm[\s\S]*147\.0 mm[\s\S]*38 g/);
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'",
        [PHASE75_LEGACY_HERITAGE_ID, PHASE75_SHEAFFER_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'reverse'",
        [PHASE75_SHEAFFER_ID, PHASE75_LEGACY_HERITAGE_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND link_type = 'made_by'",
        [PHASE75_LEGACY_HERITAGE_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM model_specs WHERE entity_id = ?",
        [PHASE75_LEGACY_HERITAGE_ID],
      ),
      1,
    );
    const media = await client.execute({
      sql: "SELECT local_path FROM media_assets WHERE entity_id = ? AND usage_status = 'primary'",
      args: [PHASE75_LEGACY_HERITAGE_ID],
    });
    assert.equal(media.rows.length, 1);
    const localPath = String(media.rows[0]?.local_path);
    assert.match(localPath, /sheaffer-legacy-heritage\.svg$/);
    assert.match(
      fs.readFileSync(path.join(ROOT, "public", localPath.slice(1)), "utf8"),
      /示意图，非产品照片/,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_redirects WHERE target_path = ?",
        [`/pen/${PHASE75_LEGACY_HERITAGE_SLUG}`],
      ),
      0,
      "a new Heritage page must not absorb PFM, Imperial, Balance or unqualified Legacy routes",
    );
    const protectedFamilies = await client.execute({
      sql: "SELECT id, type FROM entities WHERE id IN (?, ?, ?) ORDER BY id",
      args: ["DfCvXoVXPG_n", "5JqrNzxFsWC6", "usCp8x8GbG-9"],
    });
    assert.deepEqual(
      protectedFamilies.rows.map((row) => String(row.type)),
      ["pen", "pen", "pen"],
    );
    const replay = await applyPhase75SheafferLegacyHeritageContent(client, options);
    assert.ok(replay.entities.every((entity) => entity.outcome === "noop"));
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assert.deepEqual(snapshotCatalogFiles(REAL_CATALOG), protectedSnapshot);
});
