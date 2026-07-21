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
import {
  type ApplyPhase115Options,
  applyPhase115AuroraIpsilonFamilyCurrentPensContent,
} from "../../scripts/apply-phase115-aurora-ipsilon-family-current-pens-content";
import {
  loadPhase115AuroraIpsilonDemoColorsPack,
  loadPhase115AuroraIpsilonResinB11NPack,
  PHASE115_AURORA_88_FAMILY_ID,
  PHASE115_AURORA_BRAND_ID,
  PHASE115_BERTRAM_URL,
  PHASE115_DEMO_2020_SCOPE,
  PHASE115_DEMO_CURRENT_SCOPE,
  PHASE115_DEMO_ID,
  PHASE115_DEMO_NAME,
  PHASE115_DEMO_PDF_URL,
  PHASE115_DEMO_SLUG,
  PHASE115_DEMO_SVG,
  PHASE115_FAMILY_ID,
  PHASE115_FAMILY_NAME,
  PHASE115_FAMILY_SLUG,
  PHASE115_FAMILY_SVG,
  PHASE115_FPN_SAMPLE_URL,
  PHASE115_OPTIMA_ID,
  PHASE115_PEN_BOUTIQUE_URL,
  PHASE115_RESIN_2011_SCOPE,
  PHASE115_RESIN_2024_SCOPE,
  PHASE115_RESIN_CURRENT_SCOPE,
  PHASE115_RESIN_ID,
  PHASE115_RESIN_NAME,
  PHASE115_RESIN_OFFICIAL_URL,
  PHASE115_RESIN_SLUG,
  PHASE115_RESIN_SVG,
  PHASE115_RESINA_800_ID,
  PHASE115_SOURCES,
  phase115AuroraIpsilonFamilyArticle,
} from "../../scripts/data/phase115-aurora-ipsilon-family-current-pens";
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
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase115-")),
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
  const options: ApplyPhase115Options = {
    workspaceRoot: ROOT_ALIAS,
    reviewer: "phase115-test",
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
  return { client, options, ownedRoot, protectedSnapshot };
}

test("Phase 115 publishes Ipsilon family and two exact current pens on one owned setup", {
  timeout: 120_000,
}, async () => {
  const keepAlive = setInterval(() => undefined, 1_000);
  const { client, options, ownedRoot, protectedSnapshot } = await setup();
  try {
    const routeFile = path.join(ROOT_CANONICAL, "src/lib/entity-redirects.ts");
    const routeHash = createHash("sha256")
      .update(fs.readFileSync(routeFile))
      .digest("hex");
    assert.equal(getReclassifiedArticlePath("pen", PHASE115_FAMILY_SLUG), null);
    const demoPack = loadPhase115AuroraIpsilonDemoColorsPack(ROOT_ALIAS);
    const resinPack = loadPhase115AuroraIpsilonResinB11NPack(ROOT_ALIAS);
    assert.equal(
      demoPack.sources.find((source) => source.url === PHASE115_BERTRAM_URL)
        ?.author,
      "Adam L.",
    );
    assert.equal(
      demoPack.sources.find((source) => source.url === PHASE115_BERTRAM_URL)
        ?.publishedAt,
      "2020-08-06",
    );
    assert.equal(
      resinPack.sources.find(
        (source) => source.url === PHASE115_PEN_BOUTIQUE_URL,
      )?.author,
      "Laura Petix",
    );
    assert.equal(
      resinPack.sources.find(
        (source) => source.url === PHASE115_PEN_BOUTIQUE_URL,
      )?.publishedAt,
      "2024-07-30",
    );
    assert.equal(
      resinPack.sources.find((source) => source.url === PHASE115_FPN_SAMPLE_URL)
        ?.tier,
      "community",
    );
    assert.equal(
      PHASE115_SOURCES.demoPdf.independenceGroup,
      PHASE115_SOURCES.demoCategory.independenceGroup,
    );
    assert.equal(PHASE115_SOURCES.resinExact.url, PHASE115_RESIN_OFFICIAL_URL);
    assert.equal(PHASE115_SOURCES.demoPdf.url, PHASE115_DEMO_PDF_URL);
    assert.equal(
      phase115AuroraIpsilonFamilyArticle.canonicalName,
      PHASE115_FAMILY_NAME,
    );

    for (const svg of [
      PHASE115_FAMILY_SVG,
      PHASE115_DEMO_SVG,
      PHASE115_RESIN_SVG,
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
      PHASE115_FAMILY_SVG,
      PHASE115_DEMO_SVG,
      PHASE115_RESIN_SVG,
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
      PHASE115_OPTIMA_ID,
      PHASE115_AURORA_88_FAMILY_ID,
      PHASE115_RESINA_800_ID,
    ])
      protectedBefore.set(id, await digest(client, id));
    const brandPayloadBefore = await digest(
      client,
      PHASE115_AURORA_BRAND_ID,
      false,
    );
    const brandHashBefore = await computePublicationContentHash(
      client,
      PHASE115_AURORA_BRAND_ID,
    );
    assert.equal(
      (
        await rows(
          client,
          "SELECT count(*) AS n FROM entities WHERE id IN (?,?,?) OR slug IN (?,?,?)",
          [
            PHASE115_FAMILY_ID,
            PHASE115_DEMO_ID,
            PHASE115_RESIN_ID,
            PHASE115_FAMILY_SLUG,
            PHASE115_DEMO_SLUG,
            PHASE115_RESIN_SLUG,
          ],
        )
      )[0]?.n,
      0,
    );

    const authorityCases: Array<[ApplyPhase115Options, RegExp]> = [
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
        applyPhase115AuroraIpsilonFamilyCurrentPensContent(client, changed),
        expected,
      );
      assert.equal(
        (
          await rows(
            client,
            "SELECT count(*) AS n FROM entities WHERE id IN (?,?,?)",
            [PHASE115_FAMILY_ID, PHASE115_DEMO_ID, PHASE115_RESIN_ID],
          )
        )[0]?.n,
        0,
      );
    }

    const first = await applyPhase115AuroraIpsilonFamilyCurrentPensContent(
      client,
      options,
    );
    assert.deepEqual(
      first.entities.map((item) => [item.entityId, item.outcome]),
      [
        [PHASE115_FAMILY_ID, "published"],
        [PHASE115_DEMO_ID, "published"],
        [PHASE115_RESIN_ID, "published"],
      ],
    );
    const identities = await rows(
      client,
      "SELECT id,type,slug,name FROM public_entities WHERE id IN (?,?,?) ORDER BY id",
      [PHASE115_FAMILY_ID, PHASE115_DEMO_ID, PHASE115_RESIN_ID],
    );
    assert.equal(identities.length, 3);
    assert.deepEqual(
      new Map(
        identities.map((row) => [row.id, [row.type, row.slug, row.name]]),
      ).get(PHASE115_FAMILY_ID),
      ["article", PHASE115_FAMILY_SLUG, PHASE115_FAMILY_NAME],
    );
    assert.deepEqual(
      new Map(
        identities.map((row) => [row.id, [row.type, row.slug, row.name]]),
      ).get(PHASE115_DEMO_ID),
      ["pen", PHASE115_DEMO_SLUG, PHASE115_DEMO_NAME],
    );
    assert.deepEqual(
      new Map(
        identities.map((row) => [row.id, [row.type, row.slug, row.name]]),
      ).get(PHASE115_RESIN_ID),
      ["pen", PHASE115_RESIN_SLUG, PHASE115_RESIN_NAME],
    );

    const familyPayload = await rows(
      client,
      "SELECT (SELECT count(*) FROM entity_publications WHERE entity_id=?) publications,(SELECT count(*) FROM entity_links WHERE source_id=? OR target_id=?) topology,(SELECT count(*) FROM model_specs WHERE entity_id=?) specs,(SELECT count(*) FROM model_variants WHERE model_entity_id=?) variants",
      [
        PHASE115_FAMILY_ID,
        PHASE115_FAMILY_ID,
        PHASE115_FAMILY_ID,
        PHASE115_FAMILY_ID,
        PHASE115_FAMILY_ID,
      ],
    );
    assert.deepEqual(familyPayload[0], {
      publications: 0,
      topology: 0,
      specs: 0,
      variants: 0,
    });
    const links = await rows(
      client,
      "SELECT source_id,target_id,link_type FROM entity_links WHERE (source_id IN (?,?) OR target_id IN (?,?)) AND link_type IN ('made_by','reverse') ORDER BY source_id,target_id,link_type",
      [
        PHASE115_DEMO_ID,
        PHASE115_RESIN_ID,
        PHASE115_DEMO_ID,
        PHASE115_RESIN_ID,
      ],
    );
    assert.equal(links.length, 4);
    assert.equal(
      links.filter(
        (row) =>
          row.link_type === "made_by" &&
          row.target_id === PHASE115_AURORA_BRAND_ID,
      ).length,
      2,
    );

    const scopes = await rows(
      client,
      "SELECT entity_id,scope_key FROM fact_scopes WHERE entity_id IN (?,?) ORDER BY entity_id,scope_key",
      [PHASE115_DEMO_ID, PHASE115_RESIN_ID],
    );
    const scopeKeys = new Set(scopes.map((row) => String(row.scope_key)));
    for (const key of [
      PHASE115_DEMO_CURRENT_SCOPE,
      PHASE115_DEMO_2020_SCOPE,
      PHASE115_RESIN_CURRENT_SCOPE,
      PHASE115_RESIN_2024_SCOPE,
      PHASE115_RESIN_2011_SCOPE,
    ])
      assert.ok(scopeKeys.has(key));
    const rejected = await rows(
      client,
      "SELECT spec.entity_id,evidence.review_status FROM spec_field_evidence evidence JOIN model_specs spec ON spec.id=evidence.model_spec_id WHERE spec.entity_id IN (?,?) AND evidence.review_status='rejected'",
      [PHASE115_DEMO_ID, PHASE115_RESIN_ID],
    );
    assert.ok(rejected.length >= 5);
    assert.notEqual(
      await computePublicationContentHash(client, PHASE115_AURORA_BRAND_ID),
      brandHashBefore,
    );
    assert.equal(
      await digest(client, PHASE115_AURORA_BRAND_ID, false),
      brandPayloadBefore,
    );
    for (const [id, before] of protectedBefore)
      assert.equal(await digest(client, id), before);

    const beforeReplay = new Map<string, string>();
    for (const id of [
      PHASE115_FAMILY_ID,
      PHASE115_DEMO_ID,
      PHASE115_RESIN_ID,
      PHASE115_AURORA_BRAND_ID,
    ])
      beforeReplay.set(id, await digest(client, id));
    const replay = await applyPhase115AuroraIpsilonFamilyCurrentPensContent(
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
      args: [PHASE115_DEMO_ID, PHASE115_AURORA_BRAND_ID],
    });
    const tampered = await digest(client, PHASE115_DEMO_ID);
    await assert.rejects(
      applyPhase115AuroraIpsilonFamilyCurrentPensContent(client, options),
      /terminal maker topology is invalid|exact Phase 114 terminal baseline/,
    );
    assert.equal(await digest(client, PHASE115_DEMO_ID), tampered);
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
