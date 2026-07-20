import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient, type Client } from "@libsql/client";
import { applyPhase57Opus88LeonardoContent } from "../../scripts/apply-phase57-opus88-leonardo-content";
import { applyPhase64DiplomatOnlineContent } from "../../scripts/apply-phase64-diplomat-online-content";
import { applyPhase83DiplomatLeonardoContent } from "../../scripts/apply-phase83-diplomat-leonardo-content";
import { PHASE83_DIPLOMAT_BRAND_ID, PHASE83_LEONARDO_BRAND_ID, PHASE83_SLUGS } from "../../scripts/data/phase83-diplomat-leonardo";
import { copyCheckpointedCatalogToDisposableCopy, snapshotCatalogFiles } from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL_CATALOG = path.join(ROOT, "data", "fpkg.db");
const PEN_SLUGS = Object.values(PHASE83_SLUGS);

async function scalar(client: Client, sql: string, args: string[] = []) { const value = await client.execute({ sql, args }); return Number(value.rows[0]?.value ?? 0); }

test("Phase 83 publishes Diplomat and Leonardo model boundaries on an owned catalog copy", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase83-diplomat-leonardo-")));
  const copy = copyCheckpointedCatalogToDisposableCopy(REAL_CATALOG, path.join(ownedRoot, "catalog.db"), ownedRoot, { expectedSourceSnapshot: protectedSnapshot });
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options = { workspaceRoot: ROOT, reviewer: "phase83-diplomat-leonardo-test", databasePath: copy.destinationPath, ownedRoot, protectedCatalogPath: REAL_CATALOG, protectedCatalogSnapshot: protectedSnapshot, env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } } as const;
  try {
    await migrateDatabase(client);
    await applyPhase57Opus88LeonardoContent(client, options);
    await applyPhase64DiplomatOnlineContent(client, options);
    const first = await applyPhase83DiplomatLeonardoContent(client, options);
    assert.equal(first.entities.length, 8);
    assert.ok(first.entities.every((entity) => entity.outcome === "published"));
    for (const slug of PEN_SLUGS) {
      const page = await client.execute({ sql: "SELECT id, body_md, summary FROM public_entities WHERE slug = ?", args: [slug] });
      assert.equal(page.rows.length, 1, `missing ${slug}`);
      const body = String(page.rows[0]?.body_md ?? "");
      assert.ok(Array.from(body).length >= 2_000, `${slug} needs a full body`);
      assert.match(body, /示意图，非产品照片/);
      assert.doesNotMatch(body, /数据库|仓库|canonical|made_by|retired/i);
      assert.ok(Array.from(String(page.rows[0]?.summary ?? "")).length >= 60);
      const penId = String(page.rows[0]?.id);
      assert.equal(await scalar(client, "SELECT count(*) AS value FROM media_assets WHERE entity_id = ? AND usage_status = 'primary'", [penId]), 1);
    }
    const aero = await client.execute({ sql: "SELECT body_md FROM public_entities WHERE slug = ?", args: [PHASE83_SLUGS.aero] });
    assert.match(String(aero.rows[0]?.body_md), /42 g[\s\S]*72 g/);
    const a2 = await client.execute({ sql: "SELECT body_md FROM public_entities WHERE slug = ?", args: [PHASE83_SLUGS.excellenceA2] });
    assert.match(String(a2.rows[0]?.body_md), /Soft Sliding Click[\s\S]*A\+/);
    const furore = await client.execute({ sql: "SELECT body_md FROM public_entities WHERE slug = ?", args: [PHASE83_SLUGS.furore] });
    assert.match(String(furore.rows[0]?.body_md), /Furore Grande[\s\S]*活塞/);
    const mosaico = await client.execute({ sql: "SELECT body_md FROM public_entities WHERE slug = ?", args: [PHASE83_SLUGS.mzgMosaico] });
    assert.match(String(mosaico.rows[0]?.body_md), /非限量/);
    assert.match(String(mosaico.rows[0]?.body_md), /1\.5 ml/);
    for (const brandId of [PHASE83_DIPLOMAT_BRAND_ID, PHASE83_LEONARDO_BRAND_ID]) {
      const missing = await client.execute({ sql: "SELECT pen.slug FROM public_entities pen JOIN entity_links maker ON maker.source_id = pen.id AND maker.target_id = ? AND maker.link_type = 'made_by' LEFT JOIN entity_links reverse ON reverse.source_id = ? AND reverse.target_id = pen.id AND reverse.link_type = 'reverse' WHERE pen.type = 'pen' GROUP BY pen.id, pen.slug HAVING count(reverse.id) <> 1", args: [brandId, brandId] });
      assert.equal(missing.rows.length, 0, `brand ${brandId} needs every public model link`);
    }
    const replay = await applyPhase83DiplomatLeonardoContent(client, options);
    assert.ok(replay.entities.every((entity) => entity.outcome === "noop"));
  } finally { client.close(); fs.rmSync(ownedRoot, { recursive: true, force: true }); }
  assert.deepEqual(snapshotCatalogFiles(REAL_CATALOG), protectedSnapshot);
});
