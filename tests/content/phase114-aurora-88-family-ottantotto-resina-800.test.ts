import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import { applyPhase41IdentityCleanupContent } from "../../scripts/apply-phase41-identity-cleanup-content";
import { applyPhase48WatermanAuroraContent } from "../../scripts/apply-phase48-waterman-aurora-content";
import {
  type ApplyPhase114Options,
  applyPhase114Aurora88FamilyOttantottoResina800Content,
} from "../../scripts/apply-phase114-aurora-88-family-ottantotto-resina-800-content";
import {
  loadPhase114AuroraOttantottoResina800Pack,
  PHASE114_AURORA_BRAND_ID,
  PHASE114_CURRENT_SCOPE,
  PHASE114_FAMILY_ID,
  PHASE114_FAMILY_SCOPE,
  PHASE114_FAMILY_SVG,
  PHASE114_FAQ_URL,
  PHASE114_HIGH_END_SCOPE,
  PHASE114_HISTORY_URL,
  PHASE114_OFFICIAL_URL,
  PHASE114_OPTIMA_ID,
  PHASE114_SAMPLE_SCOPE,
  PHASE114_SAMPLE_URL,
  PHASE114_TARGET_ID,
  PHASE114_TARGET_NAME,
  PHASE114_TARGET_SLUG,
  PHASE114_TARGET_SVG,
} from "../../scripts/data/phase114-aurora-88-family-ottantotto-resina-800";
import {
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { getReclassifiedArticlePath } from "../../src/lib/entity-redirects";
import { computePublicationContentHash } from "../../src/lib/publication";

const ROOT_ALIAS = "/Users/xz/CodeBuddy/fountain-pen-graph";
const ROOT_CANONICAL = "/Users/xz/Documents/fountain-pen-graph";
const REAL = path.join(ROOT_CANONICAL, "data", "fpkg.db");

async function rows(client: Client, sql: string, args: unknown[] = []) {
  return (await client.execute({ sql, args: args as never[] })).rows.map(
    (row) => ({ ...row }),
  );
}

async function digest(
  client: Client,
  entityId: string,
  includeTopology = true,
) {
  const queries = [
    "SELECT * FROM entities WHERE id=?",
    "SELECT * FROM stories WHERE entity_id=? ORDER BY id",
    "SELECT * FROM entity_references WHERE entity_id=? ORDER BY id",
    "SELECT * FROM entity_aliases WHERE entity_id=? ORDER BY id",
    "SELECT * FROM fact_scopes WHERE entity_id=? ORDER BY id",
    "SELECT * FROM claims WHERE subject_entity_id=? ORDER BY id",
    "SELECT * FROM model_specs WHERE entity_id=? ORDER BY id",
    "SELECT * FROM model_variants WHERE model_entity_id=? ORDER BY id",
    "SELECT * FROM timeline_events WHERE entity_id=? ORDER BY id",
    "SELECT * FROM media_assets WHERE entity_id=? ORDER BY id",
    ...(includeTopology
      ? [
          "SELECT * FROM entity_publications WHERE entity_id=? ORDER BY entity_id",
          "SELECT * FROM entity_links WHERE source_id=? OR target_id=? ORDER BY id",
        ]
      : []),
  ];
  const result = [];
  for (const sql of queries) {
    result.push(
      await rows(
        client,
        sql,
        sql.includes(" OR ") ? [entityId, entityId] : [entityId],
      ),
    );
  }
  return JSON.stringify(result);
}

async function setup() {
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase114-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase114Options = {
    workspaceRoot: ROOT_ALIAS,
    reviewer: "phase114-test",
    databasePath: copy.destinationPath,
    ownedRoot,
    protectedCatalogPath: REAL,
    protectedCatalogSnapshot: protectedSnapshot,
    env: {
      NODE_ENV: "test",
      TURSO_DATABASE_URL: "",
      TURSO_AUTH_TOKEN: "",
      FPKG_DATABASE_URL: "",
    },
  };

  // One setup/migration chain only: all fault checks derive from this prepared copy.
  await migrateDatabase(client);
  await applyPhase41IdentityCleanupContent(client, options);
  await applyPhase48WatermanAuroraContent(client, options);
  return { client, options, ownedRoot, protectedSnapshot };
}

test("Phase 114 reclassifies Aurora 88, publishes exact 800, noops pristine and fails closed", {
  timeout: 120_000,
}, async () => {
  const keepAlive = setInterval(() => undefined, 1_000);
  const fixture = await setup();
  const { client, options, ownedRoot, protectedSnapshot } = fixture;
  try {
    const familyBefore = await digest(client, PHASE114_FAMILY_ID);
    const optimaBefore = await digest(client, PHASE114_OPTIMA_ID);
    const brandPayloadBefore = await digest(
      client,
      PHASE114_AURORA_BRAND_ID,
      false,
    );
    const brandHashBefore = await computePublicationContentHash(
      client,
      PHASE114_AURORA_BRAND_ID,
    );
    const reverseBefore = await rows(
      client,
      "SELECT source_id,target_id,link_type FROM entity_links WHERE source_id=? AND link_type='reverse' ORDER BY target_id",
      [PHASE114_AURORA_BRAND_ID],
    );
    assert.equal(
      (
        await rows(
          client,
          "SELECT count(*) AS n FROM entities WHERE id=? OR slug=? OR lower(name)=lower(?)",
          [PHASE114_TARGET_ID, PHASE114_TARGET_SLUG, PHASE114_TARGET_NAME],
        )
      )[0]?.n,
      0,
    );

    const authorityCases: Array<[ApplyPhase114Options, RegExp]> = [
      [
        { ...options, workspaceRoot: os.tmpdir() },
        /verified CodeBuddy\/Documents repo pair/,
      ],
      [{ ...options, reviewer: " " }, /reviewer must not be empty/],
      [
        {
          ...options,
          env: {
            ...options.env,
            NODE_ENV: options.env?.NODE_ENV ?? "test",
            FPKG_DATABASE_URL: "file:remote",
          },
        },
        /refuses inherited remote/,
      ],
      [{ ...options, ownedRoot: ROOT_CANONICAL }, /caller-owned root/],
    ];
    for (const [changed, expected] of authorityCases) {
      await assert.rejects(
        applyPhase114Aurora88FamilyOttantottoResina800Content(client, changed),
        expected,
      );
      assert.equal(await digest(client, PHASE114_FAMILY_ID), familyBefore);
    }

    await client.execute({
      sql: "INSERT INTO entities(id,type,slug,name,source_url) VALUES('phase114-alt','pen','phase114-alt','Aurora Ottantotto Resina 800',?)",
      args: [PHASE114_OFFICIAL_URL],
    });
    await assert.rejects(
      applyPhase114Aurora88FamilyOttantottoResina800Content(client, options),
      /alternate exact.*800 pen/i,
    );
    await client.execute("DELETE FROM entities WHERE id='phase114-alt'");

    const first = await applyPhase114Aurora88FamilyOttantottoResina800Content(
      client,
      options,
    );
    assert.deepEqual(
      first.entities.map((item) => [item.entityId, item.outcome]),
      [
        [PHASE114_FAMILY_ID, "published"],
        [PHASE114_TARGET_ID, "published"],
      ],
    );

    const family = (
      await rows(
        client,
        "SELECT id,type,slug,name,summary,body_md,source FROM public_entities WHERE id=?",
        [PHASE114_FAMILY_ID],
      )
    )[0];
    assert.equal(family?.type, "article");
    assert.equal(family?.slug, "aurora-88");
    assert.ok(Array.from(String(family?.summary)).length >= 60);
    assert.ok(Array.from(String(family?.summary)).length <= 160);
    assert.ok(Array.from(String(family?.body_md)).length >= 2_000);
    assert.match(
      String(family?.body_md),
      /\/pen\/aurora-ottantotto-resina-800/,
    );
    assert.equal(
      getReclassifiedArticlePath("pen", "aurora-88"),
      "/article/aurora-88",
    );
    assert.equal(
      (
        await rows(
          client,
          "SELECT count(*) AS n FROM entity_redirects WHERE source_path='/pen/aurora-88'",
        )
      )[0]?.n,
      0,
    );
    assert.equal(
      (
        await rows(
          client,
          "SELECT count(*) AS n FROM entity_publications WHERE entity_id=?",
          [PHASE114_FAMILY_ID],
        )
      )[0]?.n,
      0,
    );
    assert.equal(
      (
        await rows(
          client,
          "SELECT count(*) AS n FROM entity_links WHERE (source_id=? OR target_id=?) AND link_type IN ('made_by','reverse')",
          [PHASE114_FAMILY_ID, PHASE114_FAMILY_ID],
        )
      )[0]?.n,
      0,
    );
    for (const [table, column] of [
      ["model_specs", "entity_id"],
      ["model_variants", "model_entity_id"],
      ["fact_scopes", "entity_id"],
      ["claims", "subject_entity_id"],
    ] as const) {
      assert.equal(
        (
          await rows(
            client,
            `SELECT count(*) AS n FROM ${table} WHERE ${column}=?`,
            [PHASE114_FAMILY_ID],
          )
        )[0]?.n,
        0,
      );
    }

    const target = (
      await rows(
        client,
        "SELECT id,type,slug,name,summary,body_md FROM public_entities WHERE id=?",
        [PHASE114_TARGET_ID],
      )
    )[0];
    assert.equal(target?.type, "pen");
    assert.equal(target?.slug, PHASE114_TARGET_SLUG);
    assert.equal(target?.name, PHASE114_TARGET_NAME);
    assert.ok(Array.from(String(target?.summary)).length >= 60);
    assert.ok(Array.from(String(target?.summary)).length <= 160);
    assert.ok(Array.from(String(target?.body_md)).length >= 2_000);
    assert.match(String(target?.body_md), /\/article\/aurora-88/);
    assert.deepEqual(
      await rows(
        client,
        "SELECT source_id,target_id,link_type FROM entity_links WHERE (source_id=? OR target_id=?) AND link_type IN ('made_by','reverse') ORDER BY link_type",
        [PHASE114_TARGET_ID, PHASE114_TARGET_ID],
      ),
      [
        {
          source_id: PHASE114_TARGET_ID,
          target_id: PHASE114_AURORA_BRAND_ID,
          link_type: "made_by",
        },
        {
          source_id: PHASE114_AURORA_BRAND_ID,
          target_id: PHASE114_TARGET_ID,
          link_type: "reverse",
        },
      ],
    );

    assert.equal(await digest(client, PHASE114_OPTIMA_ID), optimaBefore);
    assert.equal(
      await digest(client, PHASE114_AURORA_BRAND_ID, false),
      brandPayloadBefore,
    );
    const brandHashAfter = await computePublicationContentHash(
      client,
      PHASE114_AURORA_BRAND_ID,
    );
    assert.notEqual(brandHashAfter, brandHashBefore);
    assert.deepEqual(
      (
        await rows(
          client,
          "SELECT source_id,target_id,link_type FROM entity_links WHERE source_id=? AND link_type='reverse' ORDER BY target_id",
          [PHASE114_AURORA_BRAND_ID],
        )
      ).filter((row) => row.target_id !== PHASE114_TARGET_ID),
      reverseBefore.filter((row) => row.target_id !== PHASE114_FAMILY_ID),
    );

    const pack = loadPhase114AuroraOttantottoResina800Pack(ROOT_CANONICAL);
    assert.deepEqual(
      new Set(pack.scopes.map((scope) => scope.scopeKey)),
      new Set([
        PHASE114_FAMILY_SCOPE,
        PHASE114_CURRENT_SCOPE,
        PHASE114_HIGH_END_SCOPE,
        PHASE114_SAMPLE_SCOPE,
      ]),
    );
    assert.match(
      JSON.stringify(
        pack.scopes.find((item) => item.scopeKey === PHASE114_SAMPLE_SCOPE),
      ),
      /800\/C|chrome|1\.8 ml|measurements|writing experience/i,
    );
    assert.match(
      JSON.stringify(
        pack.scopes.find((item) => item.scopeKey === PHASE114_HIGH_END_SCOPE),
      ),
      /14K|high-end|hidden reserve|line-level/i,
    );
    assert.doesNotMatch(
      JSON.stringify(pack.spec?.values),
      /14K|chrome|1\.8 ml|measurement|feel|writing experience|price/i,
    );
    assert.match(
      JSON.stringify(pack.spec?.values),
      /black resin|gold-coloured|piston|EF, F, M or B/i,
    );
    assert.ok(pack.sources.some((source) => source.url === PHASE114_FAQ_URL));
    assert.ok(
      pack.sources.some(
        (source) =>
          source.url === PHASE114_SAMPLE_URL &&
          source.archiveLocator?.includes("403/live-fetch"),
      ),
    );
    assert.equal(
      pack.media.filter((item) => item.usageStatus === "primary").length,
      1,
    );

    const familyRefs = await rows(
      client,
      `SELECT item.url FROM entity_references reference JOIN source_items item
         ON item.id=reference.source_item_id WHERE reference.entity_id=? ORDER BY item.url`,
      [PHASE114_FAMILY_ID],
    );
    assert.ok(familyRefs.some((row) => row.url === PHASE114_HISTORY_URL));
    assert.ok(familyRefs.some((row) => row.url === PHASE114_OFFICIAL_URL));
    assert.deepEqual(
      await rows(
        client,
        "SELECT local_path FROM media_assets WHERE entity_id=? AND usage_status='primary'",
        [PHASE114_FAMILY_ID],
      ),
      [{ local_path: PHASE114_FAMILY_SVG }],
    );
    assert.deepEqual(
      await rows(
        client,
        "SELECT local_path FROM media_assets WHERE entity_id=? AND usage_status='primary'",
        [PHASE114_TARGET_ID],
      ),
      [{ local_path: PHASE114_TARGET_SVG }],
    );

    const currentHash = await computePublicationContentHash(
      client,
      PHASE114_TARGET_ID,
    );
    assert.deepEqual(
      await rows(
        client,
        "SELECT review_kind,status,content_hash FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind",
        [PHASE114_TARGET_ID, currentHash],
      ),
      ["fact", "language", "media", "publication"].map((review_kind) => ({
        review_kind,
        status: "approved",
        content_hash: currentHash,
      })),
    );
    assert.deepEqual(
      await rows(
        client,
        "SELECT review_kind,status,content_hash FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind",
        [PHASE114_AURORA_BRAND_ID, brandHashAfter],
      ),
      ["fact", "language", "media", "publication"].map((review_kind) => ({
        review_kind,
        status: "approved",
        content_hash: brandHashAfter,
      })),
    );

    const terminalFamily = await digest(client, PHASE114_FAMILY_ID);
    const terminalTarget = await digest(client, PHASE114_TARGET_ID);
    const terminalBrand = await digest(client, PHASE114_AURORA_BRAND_ID);
    const second = await applyPhase114Aurora88FamilyOttantottoResina800Content(
      client,
      { ...options, workspaceRoot: ROOT_CANONICAL },
    );
    assert.deepEqual(
      second.entities.map((item) => item.outcome),
      ["noop", "noop"],
    );
    assert.equal(await digest(client, PHASE114_FAMILY_ID), terminalFamily);
    assert.equal(await digest(client, PHASE114_TARGET_ID), terminalTarget);
    assert.equal(await digest(client, PHASE114_AURORA_BRAND_ID), terminalBrand);

    await client.execute({
      sql: "DELETE FROM entity_links WHERE source_id=? AND link_type='made_by'",
      args: [PHASE114_TARGET_ID],
    });
    const tamperedTarget = await digest(client, PHASE114_TARGET_ID);
    await assert.rejects(
      applyPhase114Aurora88FamilyOttantottoResina800Content(client, options),
      /terminal.*topology|topology.*terminal|made_by/i,
    );
    assert.equal(await digest(client, PHASE114_TARGET_ID), tamperedTarget);
    assert.equal(await digest(client, PHASE114_OPTIMA_ID), optimaBefore);
    assert.notEqual(await digest(client, PHASE114_FAMILY_ID), familyBefore);
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
    clearInterval(keepAlive);
    assert.deepEqual(snapshotCatalogFiles(REAL), protectedSnapshot);
  }
});
