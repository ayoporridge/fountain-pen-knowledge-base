import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase29SailorContent } from "../../scripts/apply-phase29-sailor-content";
import { applyPhase31SailorP0Content } from "../../scripts/apply-phase31-sailor-p0-content";
import { applyPhase76SailorProfessionalGearContent } from "../../scripts/apply-phase76-sailor-professional-gear-content";
import {
  PHASE76_PROFESSIONAL_GEAR_ID,
  PHASE76_PROFESSIONAL_GEAR_SLUG,
  PHASE76_SAILOR_BRAND_ID,
} from "../../scripts/data/phase76-sailor-professional-gear";
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

test("Phase 76 republishes only regular full-size Sailor Professional Gear from an owned copy", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase76-sailor-pro-gear-")),
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
    reviewer: "phase76-sailor-professional-gear-curated-content",
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
    await applyPhase29SailorContent(client, {
      ...options,
      reviewer: "phase76-sailor-prerequisite-29",
    });
    await applyPhase31SailorP0Content(client, {
      ...options,
      reviewer: "phase76-sailor-prerequisite-31",
    });

    await assert.rejects(
      applyPhase76SailorProfessionalGearContent(client, {
        ...options,
        env: { ...options.env, FPKG_DATABASE_URL: "file:unauthorized-phase76" },
      }),
      /refuses inherited remote database selection: FPKG_DATABASE_URL/,
    );

    const first = await applyPhase76SailorProfessionalGearContent(client, options);
    assert.deepEqual(
      first.entities.map((entity) => [entity.entityId, entity.outcome]),
      [
        [PHASE76_SAILOR_BRAND_ID, "published"],
        [PHASE76_PROFESSIONAL_GEAR_ID, "published"],
      ],
    );

    const pages = await client.execute({
      sql: "SELECT id, type, slug, summary, body_md FROM public_entities WHERE id IN (?, ?)",
      args: [PHASE76_SAILOR_BRAND_ID, PHASE76_PROFESSIONAL_GEAR_ID],
    });
    assert.equal(pages.rows.length, 2);
    const byId = new Map(pages.rows.map((row) => [String(row.id), row]));
    const brand = byId.get(PHASE76_SAILOR_BRAND_ID);
    const pen = byId.get(PHASE76_PROFESSIONAL_GEAR_ID);
    assert.equal(String(brand?.type), "brand");
    assert.equal(String(pen?.type), "pen");
    assert.equal(String(pen?.slug), PHASE76_PROFESSIONAL_GEAR_SLUG);
    assert.ok(String(brand?.body_md).length >= 1_200);
    assert.ok(String(pen?.summary).length >= 60 && String(pen?.summary).length <= 160);
    assert.ok(String(pen?.body_md).length >= 2_000);
    assert.doesNotMatch(
      String(pen?.body_md),
      /数据库|仓库|canonical|made_by|market_sku|slug/i,
    );

    const body = String(pen?.body_md);
    assert.match(
      body,
      /11-2036[\s\S]*11-2037[\s\S]*21K 大型双色[\s\S]*φ18.*129 mm[\s\S]*21\.6 g/,
    );
    assert.match(body, /Gold IP[\s\S]*nickel chrome/);
    assert.match(body, /Slim 11-1221[\s\S]*14K 中型[\s\S]*124 mm[\s\S]*16\.8 g/);
    assert.match(body, /Slim 21 11-2151[\s\S]*21K[\s\S]*124 mm[\s\S]*16\.8 g/);
    assert.match(body, /Realo 11-3926[\s\S]*尾栓回转吸墨[\s\S]*约 1 cc/);
    assert.match(body, /示意图，非产品照片/);
    assert.doesNotMatch(
      body,
      /11-203[67][^。\n]{0,70}(?:搭载|使用|配备|为)\s*14K/,
    );

    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'",
        [PHASE76_PROFESSIONAL_GEAR_ID, PHASE76_SAILOR_BRAND_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'reverse'",
        [PHASE76_SAILOR_BRAND_ID, PHASE76_PROFESSIONAL_GEAR_ID],
      ),
      1,
    );
    const missingReverse = await scalar(
      client,
      `SELECT count(*) AS value
         FROM (
           SELECT pen.id
             FROM public_entities pen
             JOIN entity_links maker
               ON maker.source_id = pen.id AND maker.target_id = ? AND maker.link_type = 'made_by'
        LEFT JOIN entity_links reverse
               ON reverse.source_id = ? AND reverse.target_id = pen.id AND reverse.link_type = 'reverse'
            WHERE pen.type = 'pen'
            GROUP BY pen.id
           HAVING count(reverse.id) <> 1
         ) missing`,
      [PHASE76_SAILOR_BRAND_ID, PHASE76_SAILOR_BRAND_ID],
    );
    assert.equal(missingReverse, 0, "every public Sailor model must be visible from the brand relation");

    const media = await client.execute({
      sql: "SELECT local_path FROM media_assets WHERE entity_id = ? AND usage_status = 'primary'",
      args: [PHASE76_PROFESSIONAL_GEAR_ID],
    });
    assert.equal(media.rows.length, 1);
    const localPath = String(media.rows[0]?.local_path);
    assert.match(localPath, /sailor-professional-gear-21k-regular\.svg$/);
    assert.match(
      fs.readFileSync(path.join(ROOT, "public", localPath.slice(1)), "utf8"),
      /示意图，非产品照片/,
    );

    const replay = await applyPhase76SailorProfessionalGearContent(client, options);
    assert.ok(replay.entities.every((entity) => entity.outcome === "noop"));
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assert.deepEqual(snapshotCatalogFiles(REAL_CATALOG), protectedSnapshot);
});
