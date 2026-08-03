import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import {
  type ApplyPhase418Options,
  applyPhase418PelikanM215Refresh,
  PHASE418_M215_ID,
  PHASE418_M215_NAME,
  PHASE418_M215_SLUG,
  PHASE418_PELIKAN_BRAND_ID,
} from "../../scripts/apply-phase418-pelikan-m215-refresh";
import { phase418PelikanM215RefreshPacks } from "../../scripts/data/phase418-pelikan-m215-refresh";
import { loadCuratedEntityPack } from "../../scripts/lib/curated-content-pack";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { computePublicationContentHash } from "../../src/lib/publication";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

async function rows(
  client: Client,
  sql: string,
  args: unknown[] = [],
): Promise<Array<Record<string, unknown>>> {
  return (await client.execute({ sql, args: args as never[] })).rows.map(
    (row) => ({ ...row }),
  );
}
async function scalar(
  client: Client,
  sql: string,
  args: unknown[] = [],
): Promise<number> {
  const result = await client.execute({ sql, args: args as never[] });
  return Number(result.rows[0]?.value ?? 0);
}

test("Phase 418 deepens the existing Pelikan M215 on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  const keepAlive = setInterval(() => undefined, 1_000);
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase418-pelikan-m215-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase418Options = {
    workspaceRoot: ROOT,
    reviewer: "phase418-pelikan-m215-refresh-test",
    databasePath: copy.destinationPath,
    ownedRoot,
    protectedCatalogPath: REAL,
    protectedCatalogSnapshot: protectedSnapshot,
    env: {
      ...process.env,
      NODE_ENV: "test",
      TURSO_DATABASE_URL: "",
      TURSO_AUTH_TOKEN: "",
      FPKG_DATABASE_URL: "",
    },
  };
  try {
    await migrateDatabase(client);
    const definition = phase418PelikanM215RefreshPacks[0];
    assert.ok(definition);
    const pack = loadCuratedEntityPack(ROOT, definition);
    assert.equal(pack.entityId, PHASE418_M215_ID);
    assert.equal(pack.expectedSlug, PHASE418_M215_SLUG);
    assert.ok(Array.from(pack.bodyMd).length >= 8_000);
    assert.ok(pack.sources.length >= 20);
    assert.ok(
      new Set(pack.sources.map((source) => source.independenceGroup)).size >=
        17,
    );
    assert.ok((pack.variants?.length ?? 0) >= 14);
    assert.ok(
      (pack.variants?.filter((variant) => variant.variantKind === "color")
        .length ?? 0) >= 5,
    );
    assert.ok(
      (pack.variants?.filter((variant) => variant.variantKind === "nib")
        .length ?? 0) >= 4,
    );
    assert.equal(
      pack.media.filter((media) => media.usageStatus === "primary").length,
      1,
    );
    const mediaPath = path.join(
      ROOT,
      "public",
      String(pack.media[0]?.localPath).replace(/^\//, ""),
    );
    const svg = fs.readFileSync(mediaPath, "utf8");
    assert.match(svg, /Pelikan M215/);
    assert.match(svg, /非产品照片/);
    assert.match(svg, /非比例图/);

    await assert.rejects(
      applyPhase418PelikanM215Refresh(client, { ...options, reviewer: " " }),
      /reviewer must not be empty/,
    );
    await assert.rejects(
      applyPhase418PelikanM215Refresh(client, {
        ...options,
        env: {
          ...options.env,
          NODE_ENV: "test",
          TURSO_DATABASE_URL: "https://remote.invalid/catalog",
        },
      }),
      /refuses inherited remote database selection/,
    );

    const first = await applyPhase418PelikanM215Refresh(client, options);
    assert.deepEqual(
      first.entities.map((entity) => entity.outcome),
      ["published"],
    );
    const page = (
      await rows(
        client,
        "SELECT type,slug,name,body_md FROM public_entities WHERE id=?",
        [PHASE418_M215_ID],
      )
    )[0];
    assert.equal(page?.type, "pen");
    assert.equal(page?.slug, PHASE418_M215_SLUG);
    assert.equal(page?.name, PHASE418_M215_NAME);
    const body = String(page?.body_md ?? "");
    assert.ok(Array.from(body).length >= 8_000);
    for (const pattern of [
      /2005/,
      /2006/,
      /2007/,
      /2008/,
      /2013/,
      /Blue-Striped/,
      /Rings/,
      /Lozenges/,
      /Rectangles/,
      /Orthogons/,
      /黄铜/,
      /树脂/,
      /20\.?0?\s*g/,
      /125/,
      /1\.20/,
      /1\.3/,
      /抛光不锈钢/,
      /EF.*F.*M.*B/,
      /差动活塞/,
      /M200/,
      /M205/,
      /M250/,
      /P205/,
      /冷水|清水/,
      /清洗/,
      /选购/,
      /维修/,
      /非产品照片/,
      /非真实比例/,
    ])
      assert.match(body, pattern);
    assert.doesNotMatch(
      body,
      /canonical|made_by|entity_publications|checkpoint/i,
    );

    const contentHash = await computePublicationContentHash(
      client,
      PHASE418_M215_ID,
    );
    const publication = (
      await rows(
        client,
        "SELECT status,approved_content_hash,content_revision,reviewed_content_revision,reviewed_contract_version FROM entity_publications WHERE entity_id=?",
        [PHASE418_M215_ID],
      )
    )[0];
    assert.equal(publication?.status, "published");
    assert.equal(publication?.approved_content_hash, contentHash);
    assert.equal(
      Number(publication?.reviewed_content_revision),
      Number(publication?.content_revision),
    );
    assert.equal(Number(publication?.reviewed_contract_version), 3);
    const reviews = await rows(
      client,
      "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind",
      [PHASE418_M215_ID, contentHash],
    );
    assert.deepEqual(
      reviews.map((row) => `${String(row.review_kind)}:${String(row.status)}`),
      [
        "fact:approved",
        "language:approved",
        "media:approved",
        "publication:approved",
      ],
    );
    const references = (
      await rows(
        client,
        "SELECT count(*) AS total,count(DISTINCT source.independence_group) AS groups FROM entity_references reference JOIN source_items source ON source.id=reference.source_item_id WHERE reference.entity_id=?",
        [PHASE418_M215_ID],
      )
    )[0];
    assert.ok(Number(references?.total) >= 20);
    assert.ok(Number(references?.groups) >= 17);
    const spec = (
      await rows(
        client,
        "SELECT brand_entity_id,nib,fill_system,material,dimensions,weight,status FROM model_specs WHERE entity_id=?",
        [PHASE418_M215_ID],
      )
    )[0];
    assert.equal(spec?.brand_entity_id, PHASE418_PELIKAN_BRAND_ID);
    assert.match(String(spec?.nib), /抛光.*不锈钢.*EF.*F.*M.*B/);
    assert.match(String(spec?.fill_system), /活塞/);
    assert.match(String(spec?.material), /黄铜|树脂|饰件/);
    assert.match(String(spec?.dimensions), /125|12/);
    assert.match(String(spec?.weight), /20/);
    assert.match(String(spec?.status), /2005|2006|Classic 200/);
    const variants = await rows(
      client,
      "SELECT variant_name,variant_kind,parent_variant_id FROM model_variants WHERE model_entity_id=? ORDER BY variant_name",
      [PHASE418_M215_ID],
    );
    assert.ok(variants.length >= 14);
    assert.ok(
      variants.filter((row) => String(row.variant_kind) === "color").length >=
        5,
    );
    assert.ok(
      variants.filter((row) => String(row.variant_kind) === "nib").length >= 4,
    );
    assert.ok(
      variants.filter((row) => row.parent_variant_id !== null).length >= 10,
    );
    assert.deepEqual(
      await rows(
        client,
        "SELECT blocker_count,blockers_json,publishable FROM public_entity_readiness WHERE entity_id=? AND contract_version=3",
        [PHASE418_M215_ID],
      ),
      [{ blocker_count: 0, blockers_json: "[]", publishable: 1 }],
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
        [PHASE418_M215_ID, PHASE418_PELIKAN_BRAND_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
        [PHASE418_PELIKAN_BRAND_ID, PHASE418_M215_ID],
      ),
      1,
    );
    assert.equal(
      (
        await rows(
          client,
          "SELECT status FROM entity_publications WHERE entity_id=?",
          [PHASE418_PELIKAN_BRAND_ID],
        )
      )[0]?.status,
      "published",
    );
    assert.deepEqual(await rows(client, "PRAGMA integrity_check"), [
      { integrity_check: "ok" },
    ]);
    const beforeReplay = await rows(
      client,
      "SELECT status,content_revision,approved_content_hash,reviewed_content_revision,published_at FROM entity_publications WHERE entity_id=?",
      [PHASE418_M215_ID],
    );
    const replay = await applyPhase418PelikanM215Refresh(client, options);
    assert.deepEqual(replay.entities, [
      { entityId: PHASE418_M215_ID, outcome: "noop", contentHash },
    ]);
    const afterReplay = await rows(
      client,
      "SELECT status,content_revision,approved_content_hash,reviewed_content_revision,published_at FROM entity_publications WHERE entity_id=?",
      [PHASE418_M215_ID],
    );
    assert.deepEqual(afterReplay, beforeReplay);
  } finally {
    client.close();
    clearInterval(keepAlive);
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assertCatalogSnapshotUnchanged(protectedSnapshot);
});
