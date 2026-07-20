import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase78PlatinumCuridasContent } from "../../scripts/apply-phase78-platinum-curidas-content";
import {
  PHASE78_CURIDAS_ID,
  PHASE78_CURIDAS_RAW_SLUG,
  PHASE78_CURIDAS_SLUG,
  PHASE78_PLATINUM_BRAND_ID,
} from "../../scripts/data/phase78-platinum-curidas";
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

test("Phase 78 publishes the exact current Platinum Curidas PKN-7000 from an owned copy", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase78-curidas-")),
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
    reviewer: "phase78-platinum-curidas-test",
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
    await assert.rejects(
      applyPhase78PlatinumCuridasContent(client, {
        ...options,
        env: { ...options.env, FPKG_DATABASE_URL: "file:unauthorized-phase78" },
      }),
      /refuses inherited remote database selection: FPKG_DATABASE_URL/,
    );
    const first = await applyPhase78PlatinumCuridasContent(client, options);
    assert.deepEqual(
      first.entities.map((entity) => [entity.entityId, entity.outcome]),
      [
        [PHASE78_PLATINUM_BRAND_ID, "published"],
        [PHASE78_CURIDAS_ID, "published"],
      ],
    );
    const pages = await client.execute({
      sql: "SELECT id, type, slug, summary, body_md FROM public_entities WHERE id IN (?, ?)",
      args: [PHASE78_PLATINUM_BRAND_ID, PHASE78_CURIDAS_ID],
    });
    assert.equal(pages.rows.length, 2);
    const byId = new Map(pages.rows.map((row) => [String(row.id), row]));
    const brand = byId.get(PHASE78_PLATINUM_BRAND_ID);
    const curidas = byId.get(PHASE78_CURIDAS_ID);
    assert.equal(String(brand?.type), "brand");
    assert.equal(String(curidas?.type), "pen");
    assert.equal(String(curidas?.slug), PHASE78_CURIDAS_SLUG);
    assert.ok(Array.from(String(brand?.body_md ?? "")).length >= 1_200);
    assert.ok(Array.from(String(curidas?.summary ?? "")).length >= 60);
    assert.ok(Array.from(String(curidas?.body_md ?? "")).length >= 2_000);
    const body = String(curidas?.body_md);
    assert.match(body, /PKN-7000/);
    assert.match(body, /2020 年 2 月[\s\S]*3 月 20 日[\s\S]*1965 年 Platinum Knock/);
    assert.match(body, /ST-2 不锈钢尖[\s\S]*EF、F、M/);
    assert.match(body, /153 mm[\s\S]*13\.8 mm[\s\S]*24\.0 g/);
    assert.match(body, /Converter-700A 或 Converter-800A[\s\S]*2020 年的“暂停”不是今天的停产结论/);
    assert.match(body, /Pilot Capless[\s\S]*Preppy[\s\S]*示意图，非产品照片/);
    assert.doesNotMatch(body, /数据库|仓库|canonical|made_by|market_sku/i);
    assert.doesNotMatch(body, /Curidas[^。\n]{0,80}(?:已|已经|目前)?停产/);
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'",
        [PHASE78_CURIDAS_ID, PHASE78_PLATINUM_BRAND_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'reverse'",
        [PHASE78_PLATINUM_BRAND_ID, PHASE78_CURIDAS_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        `SELECT count(*) AS value
           FROM (SELECT pen.id
                   FROM public_entities pen
                   JOIN entity_links maker ON maker.source_id = pen.id AND maker.target_id = ? AND maker.link_type = 'made_by'
              LEFT JOIN entity_links reverse ON reverse.source_id = ? AND reverse.target_id = pen.id AND reverse.link_type = 'reverse'
                  WHERE pen.type = 'pen'
                  GROUP BY pen.id
                 HAVING count(reverse.id) <> 1) missing`,
        [PHASE78_PLATINUM_BRAND_ID, PHASE78_PLATINUM_BRAND_ID],
      ),
      0,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_redirects WHERE source_path = ? AND target_path = ? AND redirect_kind = 'permanent'",
        [`/pen/${PHASE78_CURIDAS_RAW_SLUG}`, `/pen/${PHASE78_CURIDAS_SLUG}`],
      ),
      1,
    );
    const asset = await client.execute({
      sql: "SELECT local_path FROM media_assets WHERE entity_id = ? AND usage_status = 'primary'",
      args: [PHASE78_CURIDAS_ID],
    });
    assert.equal(asset.rows.length, 1);
    assert.match(String(asset.rows[0]?.local_path), /platinum-curidas-pkn7000\.svg$/);
    assert.match(
      fs.readFileSync(path.join(ROOT, "public", String(asset.rows[0]?.local_path).slice(1)), "utf8"),
      /示意图，非产品照片/,
    );
    const replay = await applyPhase78PlatinumCuridasContent(client, options);
    assert.ok(replay.entities.every((entity) => entity.outcome === "noop"));
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assert.deepEqual(snapshotCatalogFiles(REAL_CATALOG), protectedSnapshot);
});
