import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import {
  type ApplyPhase403Options,
  applyPhase403PilotCaplessStripeRefresh,
  PHASE403_PILOT_ID,
  PHASE403_STRIPE_ID,
  PHASE403_STRIPE_SLUG,
} from "../../scripts/apply-phase403-pilot-capless-stripe-refresh";
import { phase403PilotCaplessStripeRefreshPacks } from "../../scripts/data/phase403-pilot-capless-stripe-refresh";
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

test("Phase 403 refreshes Pilot Capless Stripe on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  const keepAlive = setInterval(() => undefined, 1_000);
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase403-stripe-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase403Options = {
    workspaceRoot: ROOT,
    reviewer: "phase403-pilot-capless-stripe-refresh-test",
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
    const definition = phase403PilotCaplessStripeRefreshPacks[0];
    assert.ok(definition);
    const pack = loadCuratedEntityPack(ROOT, definition);
    assert.equal(pack.entityId, PHASE403_STRIPE_ID);
    assert.equal(pack.expectedSlug, PHASE403_STRIPE_SLUG);
    assert.ok(Array.from(pack.bodyMd).length >= 8_000);
    assert.ok(pack.sources.length >= 10);
    assert.ok(
      new Set(pack.sources.map((source) => source.independenceGroup)).size >=
        10,
    );
    assert.equal(pack.variants?.length, 3);
    assert.equal(
      pack.variants?.filter((variant) => variant.variantKind === "market_sku")
        .length,
      2,
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
      applyPhase403PilotCaplessStripeRefresh(client, {
        ...options,
        env: {
          ...options.env,
          NODE_ENV: "test",
          TURSO_DATABASE_URL: "https://remote.invalid/catalog",
        },
      }),
      /refuses inherited remote database selection/,
    );

    const first = await applyPhase403PilotCaplessStripeRefresh(client, options);
    assert.deepEqual(
      first.entities.map((entity) => entity.outcome),
      ["published"],
    );
    const page = (
      await rows(
        client,
        "SELECT type,slug,name,body_md,source FROM public_entities WHERE id=?",
        [PHASE403_STRIPE_ID],
      )
    )[0];
    assert.equal(page?.type, "pen");
    assert.equal(page?.slug, PHASE403_STRIPE_SLUG);
    assert.equal(page?.name, "百乐 Pilot Capless Stripe（条纹）");
    assert.ok(Array.from(String(page?.body_md ?? "")).length >= 8_000);
    assert.match(
      String(page?.source),
      /^curated-content:phase403-pilot-capless-stripe-refresh-v1:/,
    );
    for (const pattern of [
      /FC-3MS/,
      /FC-3MS-S-F/,
      /FC-3MS-S-M/,
      /18K/,
      /CON-40/,
      /黄铜.*铑|铑.*黄铜/,
      /按动|knock/,
      /140 mm/,
      /13\.3 mm/,
      /32 g/,
      /52,800/,
      /49,500/,
      /FC-18SR/,
      /FCN-2MR|絣/,
      /FCSE-3MR|SE/,
      /Decimo/,
      /FCLS-35SR|LS/,
      /Raden|FCN-5MP/,
      /FCS-1/,
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
      PHASE403_STRIPE_ID,
    );
    const publication = (
      await rows(
        client,
        `SELECT status,approved_content_hash,content_revision,reviewed_content_revision,
              reviewed_contract_version,reviewed_by,published_at
       FROM entity_publications WHERE entity_id=?`,
        [PHASE403_STRIPE_ID],
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
      [PHASE403_STRIPE_ID, contentHash],
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
        [PHASE403_STRIPE_ID],
      )
    )[0];
    assert.ok(Number(references?.total) >= 10);
    assert.ok(Number(references?.groups) >= 10);

    const spec = (
      await rows(
        client,
        `SELECT brand_entity_id,nib,fill_system,material,dimensions,weight,price_range,status
       FROM model_specs WHERE entity_id=?`,
        [PHASE403_STRIPE_ID],
      )
    )[0];
    assert.equal(spec?.brand_entity_id, PHASE403_PILOT_ID);
    assert.match(String(spec?.nib), /18K.*F.*M/);
    assert.match(String(spec?.fill_system), /CON-40/);
    assert.match(String(spec?.material), /黄铜.*铑|铑.*黄铜/);
    assert.match(String(spec?.dimensions), /140.*13\.3/);
    assert.match(String(spec?.weight), /32/);
    assert.match(String(spec?.price_range), /52,800|52800/);
    assert.match(String(spec?.status), /F.*M.*SKU/);

    const variants = await rows(
      client,
      "SELECT variant_name,product_code,variant_kind,parent_variant_id FROM model_variants WHERE model_entity_id=? ORDER BY variant_name",
      [PHASE403_STRIPE_ID],
    );
    assert.equal(variants.length, 3);
    assert.equal(
      variants.filter((row) => String(row.variant_kind) === "market_sku")
        .length,
      2,
    );
    assert.equal(
      variants.filter((row) => String(row.variant_kind) === "edition_group")
        .length,
      1,
    );
    assert.equal(
      variants.filter((row) => String(row.product_code).startsWith("FC-3MS"))
        .length,
      3,
    );
    assert.equal(
      variants.filter((row) => row.parent_variant_id !== null).length,
      2,
    );

    const readiness = await rows(
      client,
      "SELECT blocker_count,blockers_json,publishable FROM public_entity_readiness WHERE entity_id=? AND contract_version=3",
      [PHASE403_STRIPE_ID],
    );
    assert.deepEqual(readiness, [
      { blocker_count: 0, blockers_json: "[]", publishable: 1 },
    ]);
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
        [PHASE403_STRIPE_ID, PHASE403_PILOT_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
        [PHASE403_PILOT_ID, PHASE403_STRIPE_ID],
      ),
      1,
    );
    const brandPublication = (
      await rows(
        client,
        "SELECT status FROM entity_publications WHERE entity_id=?",
        [PHASE403_PILOT_ID],
      )
    )[0];
    assert.equal(brandPublication?.status, "published");

    const beforeReplay = await rows(
      client,
      "SELECT status,content_revision,approved_content_hash,reviewed_content_revision,published_at FROM entity_publications WHERE entity_id=?",
      [PHASE403_STRIPE_ID],
    );
    const replay = await applyPhase403PilotCaplessStripeRefresh(
      client,
      options,
    );
    assert.deepEqual(replay.entities, [
      { entityId: PHASE403_STRIPE_ID, outcome: "noop", contentHash },
    ]);
    const afterReplay = await rows(
      client,
      "SELECT status,content_revision,approved_content_hash,reviewed_content_revision,published_at FROM entity_publications WHERE entity_id=?",
      [PHASE403_STRIPE_ID],
    );
    assert.deepEqual(afterReplay, beforeReplay);
  } finally {
    client.close();
    clearInterval(keepAlive);
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assertCatalogSnapshotUnchanged(protectedSnapshot);
});
