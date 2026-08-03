import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import {
  type ApplyPhase405Options,
  applyPhase405PilotCaplessSpecialAlloyRefresh,
  PHASE405_ALLOY_ID,
  PHASE405_ALLOY_SLUG,
  PHASE405_PILOT_ID,
} from "../../scripts/apply-phase405-pilot-capless-special-alloy-refresh";
import { phase405PilotCaplessSpecialAlloyRefreshPacks } from "../../scripts/data/phase405-pilot-capless-special-alloy-refresh";
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

test("Phase 405 refreshes Pilot Capless special alloy on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  const keepAlive = setInterval(() => undefined, 1_000);
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase405-alloy-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase405Options = {
    workspaceRoot: ROOT,
    reviewer: "phase405-pilot-capless-special-alloy-refresh-test",
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
    const definition = phase405PilotCaplessSpecialAlloyRefreshPacks[0];
    assert.ok(definition);
    const pack = loadCuratedEntityPack(ROOT, definition);
    assert.equal(pack.entityId, PHASE405_ALLOY_ID);
    assert.equal(pack.expectedSlug, PHASE405_ALLOY_SLUG);
    assert.ok(Array.from(pack.bodyMd).length >= 8_000);
    assert.ok(pack.sources.length >= 10);
    assert.ok(
      new Set(pack.sources.map((source) => source.independenceGroup)).size >=
        10,
    );
    assert.equal(pack.variants?.length, 9);
    assert.equal(
      pack.variants?.filter((variant) => variant.variantKind === "market_sku")
        .length,
      8,
    );
    assert.equal(
      pack.variants?.filter(
        (variant) => variant.variantKind === "edition_group",
      ).length,
      1,
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
    assert.match(svg, /non-photo/i);
    assert.match(svg, /non-logo/i);
    assert.match(svg, /not-to-scale/i);
    assert.match(svg, /non-colou?r-proof/i);

    await assert.rejects(
      applyPhase405PilotCaplessSpecialAlloyRefresh(client, {
        ...options,
        env: {
          ...options.env,
          NODE_ENV: "test",
          TURSO_DATABASE_URL: "https://remote.invalid/catalog",
        },
      }),
      /refuses inherited remote database selection/,
    );

    const first = await applyPhase405PilotCaplessSpecialAlloyRefresh(
      client,
      options,
    );
    assert.deepEqual(
      first.entities.map((entity) => entity.outcome),
      ["published"],
    );
    const page = (
      await rows(
        client,
        "SELECT type,slug,name,body_md,source FROM public_entities WHERE id=?",
        [PHASE405_ALLOY_ID],
      )
    )[0];
    assert.equal(page?.type, "pen");
    assert.equal(page?.slug, PHASE405_ALLOY_SLUG);
    assert.equal(page?.name, "百乐 Pilot Capless 特殊合金（FCS-1）");
    assert.ok(Array.from(String(page?.body_md ?? "")).length >= 8_000);
    assert.match(
      String(page?.source),
      /^curated-content:phase405-pilot-capless-special-alloy-refresh-v1:/,
    );
    for (const pattern of [
      /FCS-1/,
      /FCS-1-MS-F/,
      /FCS-1-MAL-M/,
      /特殊合金/,
      /黄铜.*涂装|涂装.*黄铜/,
      /CON-40/,
      /140 mm/,
      /13\.4 mm/,
      /30 g/,
      /17,600/,
      /FC-18SR/,
      /FC-3MS|Stripe/,
      /FCN-2MR|絣/,
      /FCSE-3MR|SE/,
      /Decimo/,
      /FCLS-35SR|LS/,
      /Raden|FCN-5MP/,
      /Wood|FC-25SK/,
      /清水|清洁|维护/,
      /酒精|溶剂|气压/,
      /试写|选购/,
      /non-photo|非产品照片/i,
    ]) {
      assert.match(String(page?.body_md), pattern);
    }
    assert.doesNotMatch(
      String(page?.body_md),
      /canonical|made_by|entity_publications|checkpoint/i,
    );

    const contentHash = await computePublicationContentHash(
      client,
      PHASE405_ALLOY_ID,
    );
    const publication = (
      await rows(
        client,
        `SELECT status,approved_content_hash,content_revision,reviewed_content_revision,
                  reviewed_contract_version,reviewed_by,published_at
           FROM entity_publications WHERE entity_id=?`,
        [PHASE405_ALLOY_ID],
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
      [PHASE405_ALLOY_ID, contentHash],
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
        [PHASE405_ALLOY_ID],
      )
    )[0];
    assert.ok(Number(references?.total) >= 10);
    assert.ok(Number(references?.groups) >= 10);

    const spec = (
      await rows(
        client,
        `SELECT brand_entity_id,nib,fill_system,material,dimensions,weight,price_range,status
           FROM model_specs WHERE entity_id=?`,
        [PHASE405_ALLOY_ID],
      )
    )[0];
    assert.equal(spec?.brand_entity_id, PHASE405_PILOT_ID);
    assert.match(String(spec?.nib), /特殊合金.*F.*M/);
    assert.match(String(spec?.nib), /非 18K/);
    assert.match(String(spec?.fill_system), /CON-40/);
    assert.match(String(spec?.material), /黄铜.*涂装/);
    assert.match(String(spec?.dimensions), /140.*13\.4/);
    assert.match(String(spec?.weight), /30/);
    assert.match(String(spec?.price_range), /17,600|17600/);
    assert.match(String(spec?.status), /四种.*F.*M|八个/);

    const variants = await rows(
      client,
      "SELECT variant_name,product_code,variant_kind,parent_variant_id FROM model_variants WHERE model_entity_id=? ORDER BY variant_name",
      [PHASE405_ALLOY_ID],
    );
    assert.equal(variants.length, 9);
    assert.equal(
      variants.filter((row) => String(row.variant_kind) === "market_sku")
        .length,
      8,
    );
    assert.equal(
      variants.filter((row) => String(row.variant_kind) === "edition_group")
        .length,
      1,
    );
    assert.equal(
      variants.filter((row) => String(row.product_code).startsWith("FCS-1-"))
        .length,
      8,
    );
    assert.equal(
      variants.filter((row) => row.parent_variant_id !== null).length,
      8,
    );

    const readiness = await rows(
      client,
      "SELECT blocker_count,blockers_json,publishable FROM public_entity_readiness WHERE entity_id=? AND contract_version=3",
      [PHASE405_ALLOY_ID],
    );
    assert.deepEqual(readiness, [
      { blocker_count: 0, blockers_json: "[]", publishable: 1 },
    ]);
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
        [PHASE405_ALLOY_ID, PHASE405_PILOT_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
        [PHASE405_PILOT_ID, PHASE405_ALLOY_ID],
      ),
      1,
    );
    const brandPublication = (
      await rows(
        client,
        "SELECT status FROM entity_publications WHERE entity_id=?",
        [PHASE405_PILOT_ID],
      )
    )[0];
    assert.equal(brandPublication?.status, "published");

    const beforeReplay = await rows(
      client,
      "SELECT status,content_revision,approved_content_hash,reviewed_content_revision,published_at FROM entity_publications WHERE entity_id=?",
      [PHASE405_ALLOY_ID],
    );
    const replay = await applyPhase405PilotCaplessSpecialAlloyRefresh(
      client,
      options,
    );
    assert.deepEqual(replay.entities, [
      { entityId: PHASE405_ALLOY_ID, outcome: "noop", contentHash },
    ]);
    const afterReplay = await rows(
      client,
      "SELECT status,content_revision,approved_content_hash,reviewed_content_revision,published_at FROM entity_publications WHERE entity_id=?",
      [PHASE405_ALLOY_ID],
    );
    assert.deepEqual(afterReplay, beforeReplay);
  } finally {
    client.close();
    clearInterval(keepAlive);
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assertCatalogSnapshotUnchanged(protectedSnapshot);
});
