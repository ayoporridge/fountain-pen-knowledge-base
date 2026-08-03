import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import {
  type ApplyPhase412Options,
  applyPhase412Platinum3776CenturyRefresh,
  PHASE412_PLATINUM_3776_ID,
  PHASE412_PLATINUM_3776_SLUG,
  PHASE412_PLATINUM_BRAND_ID,
} from "../../scripts/apply-phase412-platinum-3776-century-refresh";
import { phase412Platinum3776CenturyRefreshPacks } from "../../scripts/data/phase412-platinum-3776-century-refresh";
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

test("Phase 412 deepens the existing Platinum #3776 Century on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  const keepAlive = setInterval(() => undefined, 1_000);
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase412-platinum-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    {
      expectedSourceSnapshot: protectedSnapshot,
    },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase412Options = {
    workspaceRoot: ROOT,
    reviewer: "phase412-platinum-3776-century-refresh-test",
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
    const definition = phase412Platinum3776CenturyRefreshPacks[0];
    assert.ok(definition);
    const pack = loadCuratedEntityPack(ROOT, definition);
    assert.equal(pack.entityId, PHASE412_PLATINUM_3776_ID);
    assert.equal(pack.expectedSlug, PHASE412_PLATINUM_3776_SLUG);
    assert.ok(Array.from(pack.bodyMd).length >= 8_000);
    assert.ok(pack.sources.length >= 12);
    assert.ok(
      new Set(pack.sources.map((source) => source.independenceGroup)).size >=
        12,
    );
    assert.equal(pack.variants?.length, 8);
    assert.equal(
      pack.variants?.filter((variant) => variant.variantKind === "color")
        .length,
      5,
    );
    assert.equal(
      pack.variants?.filter(
        (variant) => variant.variantKind === "edition_group",
      ).length,
      3,
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
    assert.match(svg, /#3776 CENTURY/);
    assert.match(svg, /非产品照片/);
    assert.match(svg, /不表现真实比例/);

    await assert.rejects(
      applyPhase412Platinum3776CenturyRefresh(client, {
        ...options,
        reviewer: " ",
      }),
      /reviewer must not be empty/,
    );
    await assert.rejects(
      applyPhase412Platinum3776CenturyRefresh(client, {
        ...options,
        env: {
          ...options.env,
          NODE_ENV: "test",
          TURSO_DATABASE_URL: "https://remote.invalid/catalog",
        },
      }),
      /refuses inherited remote database selection/,
    );

    const first = await applyPhase412Platinum3776CenturyRefresh(
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
        [PHASE412_PLATINUM_3776_ID],
      )
    )[0];
    assert.equal(page?.type, "pen");
    assert.equal(page?.slug, PHASE412_PLATINUM_3776_SLUG);
    assert.equal(page?.name, "Platinum #3776 Century");
    const body = String(page?.body_md ?? "");
    assert.ok(Array.from(body).length >= 8_000);
    for (const pattern of [
      /PNB-15000/,
      /#3776 Century/,
      /1978/,
      /2011/,
      /14K.*14-26/,
      /UEF.*EF.*F.*SF.*M.*B.*C/,
      /Converter-800A/,
      /Slip.?&.?Seal|密封/,
      /139\.5/,
      /15\.4/,
      /20\.5/,
      /¥44,000|44,000/,
      /Ver\.2\.0|Ver.2.0/,
      /Travia/,
      /AS 树脂/,
      /清水|清洗|维护/,
      /选购|购买/,
      /非产品照片/,
    ])
      assert.match(body, pattern);
    assert.doesNotMatch(
      body,
      /canonical|made_by|entity_publications|checkpoint/i,
    );

    const contentHash = await computePublicationContentHash(
      client,
      PHASE412_PLATINUM_3776_ID,
    );
    const publication = (
      await rows(
        client,
        `SELECT status,approved_content_hash,content_revision,reviewed_content_revision,
             reviewed_contract_version,reviewed_by,published_at FROM entity_publications WHERE entity_id=?`,
        [PHASE412_PLATINUM_3776_ID],
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
      [PHASE412_PLATINUM_3776_ID, contentHash],
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
         FROM entity_references reference JOIN source_items source ON source.id=reference.source_item_id
         WHERE reference.entity_id=?`,
        [PHASE412_PLATINUM_3776_ID],
      )
    )[0];
    assert.ok(Number(references?.total) >= 12);
    assert.ok(Number(references?.groups) >= 12);

    const spec = (
      await rows(
        client,
        `SELECT brand_entity_id,nib,fill_system,material,dimensions,weight,price_range,status
         FROM model_specs WHERE entity_id=?`,
        [PHASE412_PLATINUM_3776_ID],
      )
    )[0];
    assert.equal(spec?.brand_entity_id, PHASE412_PLATINUM_BRAND_ID);
    assert.match(String(spec?.nib), /14K.*14-26/);
    assert.match(String(spec?.fill_system), /Converter-800A/);
    assert.match(String(spec?.material), /AS 树脂/);
    assert.match(String(spec?.dimensions), /139\.5/);
    assert.match(String(spec?.weight), /20\.5/);
    assert.match(String(spec?.price_range), /44,000/);
    assert.match(String(spec?.status), /PNB-15000/);

    const variants = await rows(
      client,
      "SELECT variant_name,variant_kind,parent_variant_id FROM model_variants WHERE model_entity_id=? ORDER BY variant_name",
      [PHASE412_PLATINUM_3776_ID],
    );
    assert.equal(variants.length, 8);
    assert.equal(
      variants.filter((row) => String(row.variant_kind) === "color").length,
      5,
    );
    assert.equal(
      variants.filter((row) => String(row.variant_kind) === "edition_group")
        .length,
      3,
    );
    assert.equal(
      variants.filter((row) => row.parent_variant_id !== null).length,
      5,
    );

    assert.deepEqual(
      await rows(
        client,
        "SELECT blocker_count,blockers_json,publishable FROM public_entity_readiness WHERE entity_id=? AND contract_version=3",
        [PHASE412_PLATINUM_3776_ID],
      ),
      [{ blocker_count: 0, blockers_json: "[]", publishable: 1 }],
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
        [PHASE412_PLATINUM_3776_ID, PHASE412_PLATINUM_BRAND_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
        [PHASE412_PLATINUM_BRAND_ID, PHASE412_PLATINUM_3776_ID],
      ),
      1,
    );
    assert.equal(
      (
        await rows(
          client,
          "SELECT status FROM entity_publications WHERE entity_id=?",
          [PHASE412_PLATINUM_BRAND_ID],
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
      [PHASE412_PLATINUM_3776_ID],
    );
    const replay = await applyPhase412Platinum3776CenturyRefresh(
      client,
      options,
    );
    assert.deepEqual(replay.entities, [
      { entityId: PHASE412_PLATINUM_3776_ID, outcome: "noop", contentHash },
    ]);
    const afterReplay = await rows(
      client,
      "SELECT status,content_revision,approved_content_hash,reviewed_content_revision,published_at FROM entity_publications WHERE entity_id=?",
      [PHASE412_PLATINUM_3776_ID],
    );
    assert.deepEqual(afterReplay, beforeReplay);
  } finally {
    client.close();
    clearInterval(keepAlive);
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assertCatalogSnapshotUnchanged(protectedSnapshot);
});
