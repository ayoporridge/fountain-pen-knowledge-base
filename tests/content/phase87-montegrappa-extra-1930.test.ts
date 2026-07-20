import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase85MontegrappaElmoContent } from "../../scripts/apply-phase85-montegrappa-elmo-content";
import { applyPhase86MontegrappaElmoFamilyContent } from "../../scripts/apply-phase86-montegrappa-elmo-family-content";
import { applyPhase87MontegrappaExtra1930Content } from "../../scripts/apply-phase87-montegrappa-extra-1930-content";
import { PHASE85_MONTEGRAPPA_BRAND_ID } from "../../scripts/data/phase85-montegrappa-elmo";
import { PHASE87_EXTRA_1930_ID, PHASE87_EXTRA_1930_SLUG } from "../../scripts/data/phase87-montegrappa-extra-1930";
import { copyCheckpointedCatalogToDisposableCopy, snapshotCatalogFiles } from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL_CATALOG = path.join(ROOT, "data", "fpkg.db");

test("Phase 87 publishes Extra 1930 separately from Elmo and Extra Otto on an owned copy", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase87-montegrappa-extra-")));
  const copy = copyCheckpointedCatalogToDisposableCopy(REAL_CATALOG, path.join(ownedRoot, "catalog.db"), ownedRoot, { expectedSourceSnapshot: protectedSnapshot });
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options = { workspaceRoot: ROOT, reviewer: "phase87-montegrappa-extra-test", databasePath: copy.destinationPath, ownedRoot, protectedCatalogPath: REAL_CATALOG, protectedCatalogSnapshot: protectedSnapshot, env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } } as const;
  try {
    await migrateDatabase(client);
    await applyPhase85MontegrappaElmoContent(client, { ...options, reviewer: "phase87-montegrappa-85" });
    await applyPhase86MontegrappaElmoFamilyContent(client, { ...options, reviewer: "phase87-montegrappa-86" });
    const first = await applyPhase87MontegrappaExtra1930Content(client, options);
    assert.deepEqual(first.entities.map((entity) => entity.outcome), ["published", "published"]);
    const page = await client.execute({ sql: "SELECT body_md, summary FROM public_entities WHERE id = ? AND slug = ?", args: [PHASE87_EXTRA_1930_ID, PHASE87_EXTRA_1930_SLUG] });
    assert.equal(page.rows.length, 1);
    const body = String(page.rows[0]?.body_md ?? "");
    assert.ok(Array.from(body).length >= 2_000);
    assert.match(body, /138 mm[\s\S]*16\.6 mm[\s\S]*44 g/);
    assert.match(body, /赛璐珞[\s\S]*925 银[\s\S]*18K 金尖[\s\S]*活塞/);
    assert.match(body, /Extra Otto/);
    assert.match(body, /示意图，非产品照片/);
    assert.doesNotMatch(body, /数据库|仓库|canonical|made_by|retired/i);
    const maker = await client.execute({ sql: "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'", args: [PHASE87_EXTRA_1930_ID, PHASE85_MONTEGRAPPA_BRAND_ID] });
    assert.equal(Number(maker.rows[0]?.value), 1);
    const replay = await applyPhase87MontegrappaExtra1930Content(client, options);
    assert.ok(replay.entities.every((entity) => entity.outcome === "noop"));
  } finally { client.close(); fs.rmSync(ownedRoot, { recursive: true, force: true }); }
  assert.deepEqual(snapshotCatalogFiles(REAL_CATALOG), protectedSnapshot);
});
