import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import {
  type ApplyPhase408Options,
  applyPhase408PilotElite95sRefresh,
  PHASE408_ELITE_ID,
  PHASE408_ELITE_SLUG,
  PHASE408_PILOT_ID,
} from "../../scripts/apply-phase408-pilot-elite-95s-refresh";
import { phase408PilotElite95sRefreshPacks } from "../../scripts/data/phase408-pilot-elite-95s-refresh";
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

test("Phase 408 refreshes Pilot Elite 95S on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  const keepAlive = setInterval(() => undefined, 1_000);
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase408-elite-95s-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase408Options = {
    workspaceRoot: ROOT,
    reviewer: "phase408-pilot-elite-95s-refresh-test",
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
    const definition = phase408PilotElite95sRefreshPacks[0];
    assert.ok(definition);
    const pack = loadCuratedEntityPack(ROOT, definition);
    assert.equal(pack.entityId, PHASE408_ELITE_ID);
    assert.equal(pack.expectedSlug, PHASE408_ELITE_SLUG);
    assert.ok(Array.from(pack.bodyMd).length >= 8_000);
    assert.ok(pack.sources.length >= 10);
    assert.ok(
      new Set(pack.sources.map((source) => source.independenceGroup)).size >=
        10,
    );
    assert.equal(pack.variants?.length, 4);
    assert.equal(
      pack.variants?.filter((variant) => variant.variantKind === "market_sku")
        .length,
      3,
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
    assert.match(svg, /Elite 95S/);
    assert.match(svg, /非产品照片/);

    await assert.rejects(
      applyPhase408PilotElite95sRefresh(client, {
        ...options,
        env: {
          ...options.env,
          NODE_ENV: "test",
          TURSO_DATABASE_URL: "https://remote.invalid/catalog",
        },
      }),
      /refuses inherited remote database selection/,
    );

    const first = await applyPhase408PilotElite95sRefresh(client, options);
    assert.deepEqual(
      first.entities.map((entity) => entity.outcome),
      ["published"],
    );
    const page = (
      await rows(
        client,
        "SELECT type,slug,name,body_md,source FROM public_entities WHERE id=?",
        [PHASE408_ELITE_ID],
      )
    )[0];
    assert.equal(page?.type, "pen");
    assert.equal(page?.slug, PHASE408_ELITE_SLUG);
    assert.equal(page?.name, "百乐 Pilot Elite 95S");
    assert.ok(Array.from(String(page?.body_md ?? "")).length >= 8_000);
    assert.match(
      String(page?.source),
      /^curated-content:phase408-pilot-elite-95s-refresh-v1:/,
    );
    for (const pattern of [
      /Elite 95S/,
      /FES-1MM/,
      /FES-1MM-B-EF/,
      /FES-1MM-B-F/,
      /FES-1MM-B-M/,
      /14K/,
      /CON-40/,
      /119 mm/,
      /12\.9 mm/,
      /15 g/,
      /33,000/,
      /昭和|1968/,
      /Custom 74/,
      /742/,
      /743/,
      /823/,
      /845/,
      /Capless/,
      /清水|清洁|维护/,
      /酒精|溶剂|气压/,
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
      PHASE408_ELITE_ID,
    );
    const publication = (
      await rows(
        client,
        `SELECT status,approved_content_hash,content_revision,reviewed_content_revision,
                reviewed_contract_version,reviewed_by,published_at
         FROM entity_publications WHERE entity_id=?`,
        [PHASE408_ELITE_ID],
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
      [PHASE408_ELITE_ID, contentHash],
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
        `SELECT count(*) AS total,count(DISTINCT source.independence_group) AS groups
         FROM entity_references reference
         JOIN source_items source ON source.id=reference.source_item_id
         WHERE reference.entity_id=?`,
        [PHASE408_ELITE_ID],
      )
    )[0];
    assert.ok(Number(references?.total) >= 10);
    assert.ok(Number(references?.groups) >= 10);

    const spec = (
      await rows(
        client,
        `SELECT brand_entity_id,nib,fill_system,material,dimensions,weight,price_range,status
         FROM model_specs WHERE entity_id=?`,
        [PHASE408_ELITE_ID],
      )
    )[0];
    assert.equal(spec?.brand_entity_id, PHASE408_PILOT_ID);
    assert.match(String(spec?.nib), /14K/);
    assert.match(String(spec?.fill_system), /CON-40/);
    assert.match(String(spec?.material), /树脂.*铝|铝.*树脂/);
    assert.match(String(spec?.dimensions), /119.*12\.9/);
    assert.match(String(spec?.weight), /15/);
    assert.match(String(spec?.price_range), /33,000|33000/);
    assert.match(String(spec?.status), /EF.*F.*M|F.*M.*EF/);

    const variants = await rows(
      client,
      "SELECT variant_name,product_code,variant_kind,parent_variant_id FROM model_variants WHERE model_entity_id=? ORDER BY variant_name",
      [PHASE408_ELITE_ID],
    );
    assert.equal(variants.length, 4);
    assert.equal(
      variants.filter((row) => String(row.variant_kind) === "market_sku")
        .length,
      3,
    );
    assert.equal(
      variants.filter((row) => String(row.variant_kind) === "edition_group")
        .length,
      1,
    );
    assert.equal(
      variants.filter((row) =>
        String(row.product_code).startsWith("FES-1MM-B-"),
      ).length,
      3,
    );
    assert.equal(
      variants.filter((row) => row.parent_variant_id !== null).length,
      3,
    );

    assert.deepEqual(
      await rows(
        client,
        "SELECT blocker_count,blockers_json,publishable FROM public_entity_readiness WHERE entity_id=? AND contract_version=3",
        [PHASE408_ELITE_ID],
      ),
      [{ blocker_count: 0, blockers_json: "[]", publishable: 1 }],
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
        [PHASE408_ELITE_ID, PHASE408_PILOT_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
        [PHASE408_PILOT_ID, PHASE408_ELITE_ID],
      ),
      1,
    );
    assert.equal(
      (
        await rows(
          client,
          "SELECT status FROM entity_publications WHERE entity_id=?",
          [PHASE408_PILOT_ID],
        )
      )[0]?.status,
      "published",
    );

    const beforeReplay = await rows(
      client,
      "SELECT status,content_revision,approved_content_hash,reviewed_content_revision,published_at FROM entity_publications WHERE entity_id=?",
      [PHASE408_ELITE_ID],
    );
    const replay = await applyPhase408PilotElite95sRefresh(client, options);
    assert.deepEqual(replay.entities, [
      { entityId: PHASE408_ELITE_ID, outcome: "noop", contentHash },
    ]);
    const afterReplay = await rows(
      client,
      "SELECT status,content_revision,approved_content_hash,reviewed_content_revision,published_at FROM entity_publications WHERE entity_id=?",
      [PHASE408_ELITE_ID],
    );
    assert.deepEqual(afterReplay, beforeReplay);
  } finally {
    client.close();
    clearInterval(keepAlive);
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assertCatalogSnapshotUnchanged(protectedSnapshot);
});
