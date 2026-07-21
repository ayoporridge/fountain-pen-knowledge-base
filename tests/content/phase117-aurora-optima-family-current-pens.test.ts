import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import { applyPhase41IdentityCleanupContent } from "../../scripts/apply-phase41-identity-cleanup-content";
import { applyPhase48WatermanAuroraContent } from "../../scripts/apply-phase48-waterman-aurora-content";
import { applyPhase114Aurora88FamilyOttantottoResina800Content } from "../../scripts/apply-phase114-aurora-88-family-ottantotto-resina-800-content";
import { applyPhase115AuroraIpsilonFamilyCurrentPensContent } from "../../scripts/apply-phase115-aurora-ipsilon-family-current-pens-content";
import {
  type ApplyPhase117Options,
  applyPhase117AuroraOptimaFamilyCurrentPensContent,
} from "../../scripts/apply-phase117-aurora-optima-family-current-pens-content";
import {
  loadPhase117AuroraOptimaAuroloide996DorPack,
  loadPhase117AuroraOptimaResina997CnPack,
  PHASE117_AUROLOIDE_2016_SCOPE,
  PHASE117_AUROLOIDE_CURRENT_SCOPE,
  PHASE117_AUROLOIDE_ID,
  PHASE117_AUROLOIDE_NAME,
  PHASE117_AUROLOIDE_OFFICIAL_URL,
  PHASE117_AUROLOIDE_SLUG,
  PHASE117_AUROLOIDE_SVG,
  PHASE117_AURORA_88_FAMILY_ID,
  PHASE117_AURORA_BRAND_ID,
  PHASE117_FAMILY_ID,
  PHASE117_FAMILY_NAME,
  PHASE117_FAMILY_SLUG,
  PHASE117_FAMILY_SVG,
  PHASE117_IPSILON_DEMO_ID,
  PHASE117_IPSILON_FAMILY_ID,
  PHASE117_IPSILON_RESIN_ID,
  PHASE117_LIMITED_366_SCOPE,
  PHASE117_PEN_ADDICT_URL,
  PHASE117_PEN_BOUTIQUE_URL,
  PHASE117_RESINA_800_ID,
  PHASE117_RESINA_2016_SCOPE,
  PHASE117_RESINA_2024_SCOPE,
  PHASE117_RESINA_CURRENT_SCOPE,
  PHASE117_RESINA_ID,
  PHASE117_RESINA_NAME,
  PHASE117_RESINA_OFFICIAL_URL,
  PHASE117_RESINA_SLUG,
  PHASE117_RESINA_SVG,
  PHASE117_SOURCES,
  phase117AuroraOptimaFamilyArticle,
} from "../../scripts/data/phase117-aurora-optima-family-current-pens";
import {
  assertCatalogSnapshotUnchanged,
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
    "SELECT * FROM media_assets WHERE entity_id=? ORDER BY id",
    ...(includeTopology
      ? [
          "SELECT * FROM entity_publications WHERE entity_id=? ORDER BY entity_id",
          "SELECT * FROM entity_links WHERE source_id=? OR target_id=? ORDER BY id",
        ]
      : []),
  ];
  const payload = [];
  for (const sql of queries)
    payload.push(
      await rows(
        client,
        sql,
        sql.includes(" OR ") ? [entityId, entityId] : [entityId],
      ),
    );
  return JSON.stringify(payload);
}

async function setup() {
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase117-")),
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
  const options: ApplyPhase117Options = {
    workspaceRoot: ROOT_ALIAS,
    reviewer: "phase117-test",
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
  await migrateDatabase(client);
  await applyPhase41IdentityCleanupContent(client, options);
  await applyPhase48WatermanAuroraContent(client, options);
  await applyPhase114Aurora88FamilyOttantottoResina800Content(client, options);
  await applyPhase115AuroraIpsilonFamilyCurrentPensContent(client, options);
  return { client, options, ownedRoot, protectedSnapshot };
}

test("Phase 117 publishes Optima family and two exact current pens on one owned setup", {
  timeout: 240_000,
}, async () => {
  const keepAlive = setInterval(() => undefined, 1_000);
  const { client, options, ownedRoot, protectedSnapshot } = await setup();
  try {
    const routeFile = path.join(ROOT_CANONICAL, "src/lib/entity-redirects.ts");
    const routeHash = createHash("sha256")
      .update(fs.readFileSync(routeFile))
      .digest("hex");
    assert.equal(
      getReclassifiedArticlePath("pen", PHASE117_FAMILY_SLUG),
      "/article/aurora-optima",
    );
    const auroloidePack =
      loadPhase117AuroraOptimaAuroloide996DorPack(ROOT_ALIAS);
    const resinaPack = loadPhase117AuroraOptimaResina997CnPack(ROOT_ALIAS);
    assert.equal(
      auroloidePack.sources.find(
        (source) => source.url === PHASE117_PEN_ADDICT_URL,
      )?.publishedAt,
      "2016-11-30",
    );
    assert.equal(
      auroloidePack.sources.find(
        (source) => source.url === PHASE117_AUROLOIDE_OFFICIAL_URL,
      )?.tier,
      "primary",
    );
    assert.equal(
      resinaPack.sources.find(
        (source) => source.url === PHASE117_PEN_BOUTIQUE_URL,
      )?.author,
      "Laura Petix",
    );
    assert.equal(
      resinaPack.sources.find(
        (source) => source.url === PHASE117_PEN_BOUTIQUE_URL,
      )?.publishedAt,
      "2024-10-12",
    );
    assert.equal(
      PHASE117_SOURCES.auroloideExact.independenceGroup,
      PHASE117_SOURCES.category.independenceGroup,
    );
    assert.equal(
      PHASE117_SOURCES.resinaExact.url,
      PHASE117_RESINA_OFFICIAL_URL,
    );
    assert.equal(
      PHASE117_SOURCES.auroloideExact.url,
      PHASE117_AUROLOIDE_OFFICIAL_URL,
    );
    assert.equal(
      phase117AuroraOptimaFamilyArticle.canonicalName,
      PHASE117_FAMILY_NAME,
    );

    for (const svg of [
      PHASE117_FAMILY_SVG,
      PHASE117_AUROLOIDE_SVG,
      PHASE117_RESINA_SVG,
    ]) {
      const text = fs.readFileSync(
        path.join(
          ROOT_CANONICAL,
          "public",
          svg.replace(/^\/images\//, "images/"),
        ),
        "utf8",
      );
      assert.match(text, /1600/);
      assert.match(text, /900/);
      assert.match(text.toLowerCase(), /non-photo/);
      assert.match(text.toLowerCase(), /non-logo/);
    }
    const svgHashes = [
      PHASE117_FAMILY_SVG,
      PHASE117_AUROLOIDE_SVG,
      PHASE117_RESINA_SVG,
    ].map((svg) =>
      createHash("sha256")
        .update(
          fs.readFileSync(
            path.join(
              ROOT_CANONICAL,
              "public",
              svg.replace(/^\/images\//, "images/"),
            ),
          ),
        )
        .digest("hex"),
    );
    assert.equal(new Set(svgHashes).size, 3);

    const protectedBefore = new Map<string, string>();
    for (const id of [
      PHASE117_AURORA_88_FAMILY_ID,
      PHASE117_RESINA_800_ID,
      PHASE117_IPSILON_FAMILY_ID,
      PHASE117_IPSILON_DEMO_ID,
      PHASE117_IPSILON_RESIN_ID,
    ])
      protectedBefore.set(id, await digest(client, id));
    const brandPayloadBefore = await digest(
      client,
      PHASE117_AURORA_BRAND_ID,
      false,
    );
    const brandHashBefore = await computePublicationContentHash(
      client,
      PHASE117_AURORA_BRAND_ID,
    );
    assert.equal(
      (
        await rows(
          client,
          "SELECT count(*) AS n FROM entities WHERE id IN (?,?,?) OR slug IN (?,?,?)",
          [
            PHASE117_FAMILY_ID,
            PHASE117_AUROLOIDE_ID,
            PHASE117_RESINA_ID,
            PHASE117_FAMILY_SLUG,
            PHASE117_AUROLOIDE_SLUG,
            PHASE117_RESINA_SLUG,
          ],
        )
      )[0]?.n,
      1,
    );

    const authorityCases: Array<[ApplyPhase117Options, RegExp]> = [
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
            NODE_ENV: "test",
            FPKG_DATABASE_URL: "file:remote",
          },
        },
        /refuses inherited remote/,
      ],
      [{ ...options, ownedRoot: ROOT_CANONICAL }, /caller-owned root/],
    ];
    for (const [changed, expected] of authorityCases) {
      await assert.rejects(
        applyPhase117AuroraOptimaFamilyCurrentPensContent(client, changed),
        expected,
      );
      assert.equal(
        (
          await rows(
            client,
            "SELECT count(*) AS n FROM entities WHERE id IN (?,?,?)",
            [PHASE117_FAMILY_ID, PHASE117_AUROLOIDE_ID, PHASE117_RESINA_ID],
          )
        )[0]?.n,
        1,
      );
    }

    const first = await applyPhase117AuroraOptimaFamilyCurrentPensContent(
      client,
      options,
    );
    assert.deepEqual(
      first.entities.map((item) => [item.entityId, item.outcome]),
      [
        [PHASE117_FAMILY_ID, "published"],
        [PHASE117_AUROLOIDE_ID, "published"],
        [PHASE117_RESINA_ID, "published"],
      ],
    );
    const identities = await rows(
      client,
      "SELECT id,type,slug,name FROM public_entities WHERE id IN (?,?,?) ORDER BY id",
      [PHASE117_FAMILY_ID, PHASE117_AUROLOIDE_ID, PHASE117_RESINA_ID],
    );
    assert.equal(identities.length, 3);
    assert.deepEqual(
      new Map(
        identities.map((row) => [row.id, [row.type, row.slug, row.name]]),
      ).get(PHASE117_FAMILY_ID),
      ["article", PHASE117_FAMILY_SLUG, PHASE117_FAMILY_NAME],
    );
    assert.deepEqual(
      new Map(
        identities.map((row) => [row.id, [row.type, row.slug, row.name]]),
      ).get(PHASE117_AUROLOIDE_ID),
      ["pen", PHASE117_AUROLOIDE_SLUG, PHASE117_AUROLOIDE_NAME],
    );
    assert.deepEqual(
      new Map(
        identities.map((row) => [row.id, [row.type, row.slug, row.name]]),
      ).get(PHASE117_RESINA_ID),
      ["pen", PHASE117_RESINA_SLUG, PHASE117_RESINA_NAME],
    );

    const familyPayload = await rows(
      client,
      "SELECT (SELECT count(*) FROM entity_publications WHERE entity_id=?) publications,(SELECT count(*) FROM entity_links WHERE source_id=? OR target_id=?) topology,(SELECT count(*) FROM model_specs WHERE entity_id=?) specs,(SELECT count(*) FROM model_variants WHERE model_entity_id=?) variants,(SELECT count(*) FROM fact_scopes WHERE entity_id=?) scopes,(SELECT count(*) FROM claims WHERE subject_entity_id=?) claims,(SELECT count(*) FROM claim_evidence evidence JOIN claims claim ON claim.id=evidence.claim_id WHERE claim.subject_entity_id=?) evidence",
      [
        PHASE117_FAMILY_ID,
        PHASE117_FAMILY_ID,
        PHASE117_FAMILY_ID,
        PHASE117_FAMILY_ID,
        PHASE117_FAMILY_ID,
        PHASE117_FAMILY_ID,
        PHASE117_FAMILY_ID,
        PHASE117_FAMILY_ID,
      ],
    );
    assert.deepEqual(familyPayload[0], {
      publications: 0,
      topology: 0,
      specs: 0,
      variants: 0,
      scopes: 0,
      claims: 0,
      evidence: 0,
    });
    const links = await rows(
      client,
      "SELECT source_id,target_id,link_type FROM entity_links WHERE (source_id IN (?,?) OR target_id IN (?,?)) AND link_type IN ('made_by','reverse') ORDER BY source_id,target_id,link_type",
      [
        PHASE117_AUROLOIDE_ID,
        PHASE117_RESINA_ID,
        PHASE117_AUROLOIDE_ID,
        PHASE117_RESINA_ID,
      ],
    );
    assert.equal(links.length, 4);
    assert.equal(
      links.filter(
        (row) =>
          row.link_type === "made_by" &&
          row.target_id === PHASE117_AURORA_BRAND_ID,
      ).length,
      2,
    );

    const scopes = await rows(
      client,
      "SELECT entity_id,scope_key FROM fact_scopes WHERE entity_id IN (?,?) ORDER BY entity_id,scope_key",
      [PHASE117_AUROLOIDE_ID, PHASE117_RESINA_ID],
    );
    const scopeKeys = new Set(scopes.map((row) => String(row.scope_key)));
    for (const key of [
      PHASE117_AUROLOIDE_CURRENT_SCOPE,
      PHASE117_AUROLOIDE_2016_SCOPE,
      PHASE117_LIMITED_366_SCOPE,
      PHASE117_RESINA_CURRENT_SCOPE,
      PHASE117_RESINA_2024_SCOPE,
      PHASE117_RESINA_2016_SCOPE,
    ])
      assert.ok(scopeKeys.has(key));
    const rejected = await rows(
      client,
      "SELECT spec.entity_id,evidence.review_status FROM spec_field_evidence evidence JOIN model_specs spec ON spec.id=evidence.model_spec_id WHERE spec.entity_id IN (?,?) AND evidence.review_status='rejected'",
      [PHASE117_AUROLOIDE_ID, PHASE117_RESINA_ID],
    );
    assert.ok(rejected.length >= 5);
    assert.notEqual(
      await computePublicationContentHash(client, PHASE117_AURORA_BRAND_ID),
      brandHashBefore,
    );
    assert.equal(
      await digest(client, PHASE117_AURORA_BRAND_ID, false),
      brandPayloadBefore,
    );
    for (const [id, before] of protectedBefore)
      assert.equal(await digest(client, id), before);

    const beforeReplay = new Map<string, string>();
    for (const id of [
      PHASE117_FAMILY_ID,
      PHASE117_AUROLOIDE_ID,
      PHASE117_RESINA_ID,
      PHASE117_AURORA_BRAND_ID,
    ])
      beforeReplay.set(id, await digest(client, id));
    const replay = await applyPhase117AuroraOptimaFamilyCurrentPensContent(
      client,
      options,
    );
    assert.deepEqual(
      replay.entities.map((item) => item.outcome),
      ["noop", "noop", "noop"],
    );
    for (const [id, before] of beforeReplay)
      assert.equal(await digest(client, id), before);

    await client.execute({
      sql: "DELETE FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
      args: [PHASE117_AUROLOIDE_ID, PHASE117_AURORA_BRAND_ID],
    });
    const tampered = await digest(client, PHASE117_AUROLOIDE_ID);
    await assert.rejects(
      applyPhase117AuroraOptimaFamilyCurrentPensContent(client, options),
      /terminal maker topology is invalid|exact Phase 114 terminal baseline|exact Phase 114\/115 terminal prerequisite/,
    );
    assert.equal(await digest(client, PHASE117_AUROLOIDE_ID), tampered);
    assertCatalogSnapshotUnchanged(protectedSnapshot);
    assert.equal(
      createHash("sha256").update(fs.readFileSync(routeFile)).digest("hex"),
      routeHash,
    );
  } finally {
    clearInterval(keepAlive);
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
});
