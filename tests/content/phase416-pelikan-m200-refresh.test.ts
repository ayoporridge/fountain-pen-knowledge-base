import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import {
  type ApplyPhase416Options,
  applyPhase416PelikanM200Refresh,
  PHASE416_M200_ID,
  PHASE416_M200_SLUG,
  PHASE416_PELIKAN_BRAND_ID,
} from "../../scripts/apply-phase416-pelikan-m200-refresh";
import { phase416PelikanM200RefreshPacks } from "../../scripts/data/phase416-pelikan-m200-refresh";
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

test("Phase 416 deepens the existing Pelikan Classic M200 on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  const keepAlive = setInterval(() => undefined, 1_000);
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase416-pelikan-m200-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase416Options = {
    workspaceRoot: ROOT,
    reviewer: "phase416-pelikan-m200-refresh-test",
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
    const definition = phase416PelikanM200RefreshPacks[0];
    assert.ok(definition);
    const pack = loadCuratedEntityPack(ROOT, definition);
    assert.equal(pack.entityId, PHASE416_M200_ID);
    assert.equal(pack.expectedSlug, PHASE416_M200_SLUG);
    assert.ok(Array.from(pack.bodyMd).length >= 8_000);
    assert.ok(pack.sources.length >= 19);
    assert.ok(
      new Set(pack.sources.map((source) => source.independenceGroup)).size >=
        17,
    );
    assert.equal(pack.variants?.length, 18);
    assert.equal(
      pack.variants?.filter((variant) => variant.variantKind === "color")
        .length,
      7,
    );
    assert.equal(
      pack.variants?.filter((variant) => variant.variantKind === "nib").length,
      4,
    );
    assert.equal(
      pack.variants?.filter(
        (variant) => variant.variantKind === "edition_group",
      ).length,
      7,
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
    assert.match(svg, /Classic M200/);
    assert.match(svg, /非产品照片/);
    assert.match(svg, /不表现真实比例|不按比例/);

    await assert.rejects(
      applyPhase416PelikanM200Refresh(client, { ...options, reviewer: " " }),
      /reviewer must not be empty/,
    );
    await assert.rejects(
      applyPhase416PelikanM200Refresh(client, {
        ...options,
        env: {
          ...options.env,
          NODE_ENV: "test",
          TURSO_DATABASE_URL: "https://remote.invalid/catalog",
        },
      }),
      /refuses inherited remote database selection/,
    );

    const first = await applyPhase416PelikanM200Refresh(client, options);
    assert.deepEqual(
      first.entities.map((entity) => entity.outcome),
      ["published"],
    );
    const page = (
      await rows(
        client,
        "SELECT type,slug,name,body_md,source FROM public_entities WHERE id=?",
        [PHASE416_M200_ID],
      )
    )[0];
    assert.equal(page?.type, "pen");
    assert.equal(page?.slug, PHASE416_M200_SLUG);
    assert.equal(page?.name, "百利金 Pelikan M200");
    const body = String(page?.body_md ?? "");
    assert.ok(Array.from(body).length >= 8_000);
    for (const pattern of [
      /1985/,
      /Old Style/,
      /1997/,
      /derby/,
      /crown/,
      /14\.7/,
      /12\.3/,
      /127/,
      /1\.20/,
      /1\.3/,
      /14\s*g/,
      /镀金不锈钢/,
      /EF.*F.*M.*B/,
      /透明墨窗/,
      /M250/,
      /M205/,
      /P200/,
      /P205/,
      /Twist/,
      /冷水|清水/,
      /维护|清洗/,
      /选购|购买/,
      /产品号/,
      /非产品照片/,
      /不按比例/,
    ])
      assert.match(body, pattern);
    assert.doesNotMatch(
      body,
      /canonical|made_by|entity_publications|checkpoint/i,
    );

    const contentHash = await computePublicationContentHash(
      client,
      PHASE416_M200_ID,
    );
    const publication = (
      await rows(
        client,
        "SELECT status,approved_content_hash,content_revision,reviewed_content_revision,reviewed_contract_version,reviewed_by,published_at FROM entity_publications WHERE entity_id=?",
        [PHASE416_M200_ID],
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
      [PHASE416_M200_ID, contentHash],
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
        [PHASE416_M200_ID],
      )
    )[0];
    assert.ok(Number(references?.total) >= 19);
    assert.ok(Number(references?.groups) >= 17);

    const spec = (
      await rows(
        client,
        "SELECT brand_entity_id,nib,fill_system,material,dimensions,weight,status FROM model_specs WHERE entity_id=?",
        [PHASE416_M200_ID],
      )
    )[0];
    assert.equal(spec?.brand_entity_id, PHASE416_PELIKAN_BRAND_ID);
    assert.match(String(spec?.nib), /镀金.*不锈钢.*EF.*F.*M.*B/);
    assert.match(String(spec?.fill_system), /活塞/);
    assert.match(String(spec?.material), /树脂|透明墨窗|饰件/);
    assert.match(String(spec?.dimensions), /14\.7|12\.3|127/);
    assert.match(String(spec?.weight), /14/);
    assert.match(String(spec?.status), /Old Style|1997|Classic 200/);

    const variants = await rows(
      client,
      "SELECT variant_name,variant_kind,parent_variant_id FROM model_variants WHERE model_entity_id=? ORDER BY variant_name",
      [PHASE416_M200_ID],
    );
    assert.equal(variants.length, 18);
    assert.equal(
      variants.filter((row) => String(row.variant_kind) === "color").length,
      7,
    );
    assert.equal(
      variants.filter((row) => String(row.variant_kind) === "nib").length,
      4,
    );
    assert.equal(
      variants.filter((row) => String(row.variant_kind) === "edition_group")
        .length,
      7,
    );
    assert.ok(
      variants.filter((row) => row.parent_variant_id !== null).length >= 7,
    );

    assert.deepEqual(
      await rows(
        client,
        "SELECT blocker_count,blockers_json,publishable FROM public_entity_readiness WHERE entity_id=? AND contract_version=3",
        [PHASE416_M200_ID],
      ),
      [{ blocker_count: 0, blockers_json: "[]", publishable: 1 }],
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
        [PHASE416_M200_ID, PHASE416_PELIKAN_BRAND_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
        [PHASE416_PELIKAN_BRAND_ID, PHASE416_M200_ID],
      ),
      1,
    );
    assert.equal(
      (
        await rows(
          client,
          "SELECT status FROM entity_publications WHERE entity_id=?",
          [PHASE416_PELIKAN_BRAND_ID],
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
      [PHASE416_M200_ID],
    );
    const replay = await applyPhase416PelikanM200Refresh(client, options);
    assert.deepEqual(replay.entities, [
      { entityId: PHASE416_M200_ID, outcome: "noop", contentHash },
    ]);
    const afterReplay = await rows(
      client,
      "SELECT status,content_revision,approved_content_hash,reviewed_content_revision,published_at FROM entity_publications WHERE entity_id=?",
      [PHASE416_M200_ID],
    );
    assert.deepEqual(afterReplay, beforeReplay);
  } finally {
    client.close();
    clearInterval(keepAlive);
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assertCatalogSnapshotUnchanged(protectedSnapshot);
});
