import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import {
  type ApplyPhase401Options,
  applyPhase401PilotCustom845Refresh,
  PHASE401_CUSTOM_845_ID,
  PHASE401_CUSTOM_845_SLUG,
  PHASE401_PILOT_ID,
} from "../../scripts/apply-phase401-pilot-custom-845-refresh";
import { phase401PilotCustom845RefreshPacks } from "../../scripts/data/phase401-pilot-custom-845-refresh";
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

test("Phase 401 refreshes Pilot Custom 845 on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  const keepAlive = setInterval(() => undefined, 1_000);
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase401-845-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase401Options = {
    workspaceRoot: ROOT,
    reviewer: "phase401-pilot-custom-845-refresh-test",
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
    const definition = phase401PilotCustom845RefreshPacks[0];
    assert.ok(definition);
    const pack = loadCuratedEntityPack(ROOT, definition);
    assert.equal(pack.entityId, PHASE401_CUSTOM_845_ID);
    assert.equal(pack.expectedSlug, PHASE401_CUSTOM_845_SLUG);
    assert.ok(Array.from(pack.bodyMd).length >= 8_000);
    assert.ok(pack.sources.length >= 10);
    assert.ok(
      new Set(pack.sources.map((source) => source.independenceGroup)).size >=
        10,
    );
    assert.equal(pack.variants?.length, 15);
    assert.equal(
      pack.variants?.filter((variant) => variant.variantKind === "market_sku")
        .length,
      12,
    );
    assert.equal(
      pack.variants?.filter(
        (variant) => variant.variantKind === "edition_group",
      ).length,
      3,
    );
    assert.equal(pack.conflicts?.length ?? 0, 0);
    assert.equal(
      pack.media.filter((media) => media.usageStatus === "primary").length,
      1,
    );
    const svg = fs.readFileSync(
      path.join(
        ROOT,
        "public",
        String(pack.media[0]?.localPath).replace(/^\//, ""),
      ),
      "utf8",
    );
    assert.match(svg, /18K No\.15/);
    assert.match(svg, /非产品照片/);

    await assert.rejects(
      applyPhase401PilotCustom845Refresh(client, {
        ...options,
        env: {
          ...options.env,
          NODE_ENV: "test",
          TURSO_DATABASE_URL: "https://remote.invalid/catalog",
        },
      }),
      /refuses inherited remote database selection/,
    );

    const first = await applyPhase401PilotCustom845Refresh(client, options);
    assert.deepEqual(
      first.entities.map((entity) => entity.outcome),
      ["published"],
    );
    const page = (
      await rows(
        client,
        "SELECT type,slug,name,body_md,source FROM public_entities WHERE id=?",
        [PHASE401_CUSTOM_845_ID],
      )
    )[0];
    assert.equal(page?.type, "pen");
    assert.equal(page?.slug, PHASE401_CUSTOM_845_SLUG);
    assert.equal(page?.name, "百乐 Pilot Custom 845");
    assert.ok(Array.from(String(page?.body_md ?? "")).length >= 8_000);
    assert.match(
      String(page?.source),
      /^curated-content:phase401-pilot-custom-845-refresh-v1:/,
    );
    for (const pattern of [
      /FKV-5MR/,
      /18K No\.15/,
      /硬橡胶|ebonite/,
      /蝋色漆/,
      /CON-40/,
      /CON-70N/,
      /147 mm/,
      /15\.9 mm/,
      /28 g/,
      /132,000/,
      /FKV-5MR-B-F/,
      /FKV-5MR-R-BB/,
      /FKV-5MR-L-M/,
      /2002 年|2002/,
      /Custom URUSHI/,
      /Custom 823/,
      /Custom 743/,
      /Custom 742/,
      /912/,
      /清水|清洁|维护/,
      /酒精|溶剂/,
      /试写|选购/,
      /非产品照片/,
    ]) {
      assert.match(String(page?.body_md), pattern);
    }
    assert.doesNotMatch(
      String(page?.body_md),
      /canonical|made_by|entity_publications|checkpoint/i,
    );

    const contentHash = await computePublicationContentHash(
      client,
      PHASE401_CUSTOM_845_ID,
    );
    const publication = (
      await rows(
        client,
        `SELECT status,approved_content_hash,content_revision,reviewed_content_revision,
              reviewed_contract_version,reviewed_by,published_at
       FROM entity_publications WHERE entity_id=?`,
        [PHASE401_CUSTOM_845_ID],
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
      `SELECT review_kind,status FROM entity_content_reviews
       WHERE entity_id=? AND content_hash=? ORDER BY review_kind`,
      [PHASE401_CUSTOM_845_ID, contentHash],
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
        `SELECT count(*) AS total,
              count(DISTINCT source.independence_group) AS groups
       FROM entity_references reference
       JOIN source_items source ON source.id=reference.source_item_id
       WHERE reference.entity_id=?`,
        [PHASE401_CUSTOM_845_ID],
      )
    )[0];
    assert.ok(Number(references?.total) >= 10);
    assert.ok(Number(references?.groups) >= 10);

    const spec = (
      await rows(
        client,
        `SELECT brand_entity_id,nib,fill_system,material,dimensions,weight,price_range,status
       FROM model_specs WHERE entity_id=?`,
        [PHASE401_CUSTOM_845_ID],
      )
    )[0];
    assert.equal(spec?.brand_entity_id, PHASE401_PILOT_ID);
    assert.match(String(spec?.nib), /18K.*15/);
    assert.match(String(spec?.fill_system), /CON-40.*CON-70N/);
    assert.match(String(spec?.material), /ebonite|硬橡胶/);
    assert.match(String(spec?.dimensions), /147.*15\.9/);
    assert.match(String(spec?.weight), /28/);
    assert.match(String(spec?.price_range), /132,000|132000/);
    assert.match(String(spec?.status), /12.*SKU|三组/);

    const variants = await rows(
      client,
      "SELECT variant_name,product_code,variant_kind,parent_variant_id FROM model_variants WHERE model_entity_id=? ORDER BY variant_name",
      [PHASE401_CUSTOM_845_ID],
    );
    assert.equal(variants.length, 15);
    assert.equal(
      variants.filter((row) => String(row.variant_kind) === "market_sku")
        .length,
      12,
    );
    assert.equal(
      variants.filter((row) => String(row.variant_kind) === "edition_group")
        .length,
      3,
    );
    assert.equal(
      variants.filter((row) => String(row.product_code).startsWith("FKV-5MR-"))
        .length,
      15,
    );
    assert.equal(
      variants.filter((row) => row.parent_variant_id !== null).length,
      12,
    );

    const readiness = await rows(
      client,
      "SELECT blocker_count,blockers_json,publishable FROM public_entity_readiness WHERE entity_id=? AND contract_version=3",
      [PHASE401_CUSTOM_845_ID],
    );
    assert.deepEqual(readiness, [
      { blocker_count: 0, blockers_json: "[]", publishable: 1 },
    ]);
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
        [PHASE401_CUSTOM_845_ID, PHASE401_PILOT_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
        [PHASE401_PILOT_ID, PHASE401_CUSTOM_845_ID],
      ),
      1,
    );
    const brandPublication = (
      await rows(
        client,
        "SELECT status FROM entity_publications WHERE entity_id=?",
        [PHASE401_PILOT_ID],
      )
    )[0];
    assert.equal(brandPublication?.status, "published");

    const beforeReplay = await rows(
      client,
      "SELECT status,content_revision,approved_content_hash,reviewed_content_revision,published_at FROM entity_publications WHERE entity_id=?",
      [PHASE401_CUSTOM_845_ID],
    );
    const replay = await applyPhase401PilotCustom845Refresh(client, options);
    assert.deepEqual(replay.entities, [
      { entityId: PHASE401_CUSTOM_845_ID, outcome: "noop", contentHash },
    ]);
    const afterReplay = await rows(
      client,
      "SELECT status,content_revision,approved_content_hash,reviewed_content_revision,published_at FROM entity_publications WHERE entity_id=?",
      [PHASE401_CUSTOM_845_ID],
    );
    assert.deepEqual(afterReplay, beforeReplay);
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
        [PHASE401_PILOT_ID, PHASE401_CUSTOM_845_ID],
      ),
      1,
    );
  } finally {
    client.close();
    clearInterval(keepAlive);
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assertCatalogSnapshotUnchanged(protectedSnapshot);
});
