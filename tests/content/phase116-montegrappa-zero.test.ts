import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import { applyPhase85MontegrappaElmoContent } from "../../scripts/apply-phase85-montegrappa-elmo-content";
import { applyPhase86MontegrappaElmoFamilyContent } from "../../scripts/apply-phase86-montegrappa-elmo-family-content";
import { applyPhase87MontegrappaExtra1930Content } from "../../scripts/apply-phase87-montegrappa-extra-1930-content";
import {
  type ApplyPhase116Options,
  applyPhase116MontegrappaZeroContent,
} from "../../scripts/apply-phase116-montegrappa-zero-content";
import {
  loadPhase116MontegrappaZeroPack,
  PHASE116_CATALOG_URL,
  PHASE116_CURRENT_SCOPE,
  PHASE116_CURRENT_URL,
  PHASE116_LAUNCH_SCOPE,
  PHASE116_LAUNCH_URL,
  PHASE116_REVIEW_SCOPE,
  PHASE116_REVIEW_URL,
  PHASE116_SOURCES,
  PHASE116_ZERO_ID,
  PHASE116_ZERO_NAME,
  PHASE116_ZERO_SLUG,
  PHASE116_ZERO_SVG,
} from "../../scripts/data/phase116-montegrappa-zero";
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
const BRAND_ID = "phase85-brand-montegrappa";
const PROTECTED_IDS = [
  "phase85-pen-montegrappa-elmo-01",
  "phase86-pen-montegrappa-elmo-02",
  "phase86-pen-montegrappa-elmo-02-plus",
  "phase87-pen-montegrappa-extra-1930",
] as const;

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
  for (const sql of queries) {
    payload.push(
      await rows(
        client,
        sql,
        sql.includes(" OR ") ? [entityId, entityId] : [entityId],
      ),
    );
  }
  return JSON.stringify(payload);
}

test("Phase 116 publishes one standard Montegrappa Zero with dated conflict on one owned setup", {
  timeout: 180_000,
}, async () => {
  const keepAlive = setInterval(() => undefined, 1_000);
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase116-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase116Options = {
    workspaceRoot: ROOT_ALIAS,
    reviewer: "phase116-test",
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
  try {
    await migrateDatabase(client);
    await applyPhase85MontegrappaElmoContent(client, options);
    await applyPhase86MontegrappaElmoFamilyContent(client, options);
    await applyPhase87MontegrappaExtra1930Content(client, options);

    const baseline = await rows(
      client,
      "SELECT id,type,slug FROM public_entities WHERE id IN (?,?,?,?,?) ORDER BY id",
      [BRAND_ID, ...PROTECTED_IDS],
    );
    assert.equal(baseline.length, 5);
    const protectedBefore = new Map<string, string>();
    for (const id of PROTECTED_IDS)
      protectedBefore.set(id, await digest(client, id));
    const brandPayloadBefore = await digest(client, BRAND_ID, false);
    const brandHashBefore = await computePublicationContentHash(
      client,
      BRAND_ID,
    );
    const brandReviewsBefore = await rows(
      client,
      "SELECT content_hash FROM entity_content_reviews WHERE entity_id=? AND status='approved'",
      [BRAND_ID],
    );

    const routeFile = path.join(ROOT_CANONICAL, "src/lib/entity-redirects.ts");
    const routeHash = createHash("sha256")
      .update(fs.readFileSync(routeFile))
      .digest("hex");
    assert.equal(getReclassifiedArticlePath("pen", PHASE116_ZERO_SLUG), null);
    const pack = loadPhase116MontegrappaZeroPack(ROOT_ALIAS);
    assert.equal(pack.entityId, PHASE116_ZERO_ID);
    assert.equal(pack.canonicalName, PHASE116_ZERO_NAME);
    assert.equal(PHASE116_SOURCES.current.url, PHASE116_CURRENT_URL);
    assert.equal(PHASE116_SOURCES.catalog.url, PHASE116_CATALOG_URL);
    assert.equal(PHASE116_SOURCES.launch.url, PHASE116_LAUNCH_URL);
    assert.equal(PHASE116_SOURCES.review.url, PHASE116_REVIEW_URL);
    assert.equal(PHASE116_SOURCES.review.author, "Dries Pil");
    assert.equal(PHASE116_SOURCES.review.publishedAt, "2020-11-09");
    assert.equal(PHASE116_SOURCES.review.tier, "professional_secondary");

    const svg = fs.readFileSync(
      path.join(ROOT_CANONICAL, "public", PHASE116_ZERO_SVG.replace(/^\//, "")),
      "utf8",
    );
    assert.match(svg, /1600/);
    assert.match(svg, /900/);
    for (const token of [
      "non-photo",
      "non-logo",
      "not-to-scale",
      "non-colour-proof",
      "non-finish-proof",
      "non-material-proof",
      "non-durability-proof",
    ])
      assert.match(svg.toLowerCase(), new RegExp(token));

    const authorityCases: Array<[ApplyPhase116Options, RegExp]> = [
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
        applyPhase116MontegrappaZeroContent(client, changed),
        expected,
      );
      assert.equal(
        (
          await rows(client, "SELECT count(*) AS n FROM entities WHERE id=?", [
            PHASE116_ZERO_ID,
          ])
        )[0]?.n,
        0,
      );
    }

    const first = await applyPhase116MontegrappaZeroContent(client, options);
    assert.deepEqual(
      first.entities.map((item) => [item.entityId, item.outcome]),
      [[PHASE116_ZERO_ID, "published"]],
    );
    const zero = (
      await rows(
        client,
        "SELECT id,type,slug,name,summary,body_md FROM public_entities WHERE id=?",
        [PHASE116_ZERO_ID],
      )
    )[0];
    assert.equal(zero?.type, "pen");
    assert.equal(zero?.slug, PHASE116_ZERO_SLUG);
    assert.equal(zero?.name, PHASE116_ZERO_NAME);
    assert.ok(Array.from(String(zero?.summary)).length >= 60);
    assert.ok(Array.from(String(zero?.summary)).length <= 160);
    assert.ok(Array.from(String(zero?.body_md)).length >= 2_000);
    for (const route of [
      "/brand/montegrappa",
      "/pen/montegrappa-elmo-01",
      "/pen/montegrappa-elmo-02",
      "/pen/montegrappa-elmo-02-plus",
      "/pen/montegrappa-extra-1930",
    ])
      assert.match(String(zero?.body_md), new RegExp(route));

    const links = await rows(
      client,
      "SELECT source_id,target_id,link_type FROM entity_links WHERE (source_id=? OR target_id=?) AND link_type IN ('made_by','reverse') ORDER BY link_type",
      [PHASE116_ZERO_ID, PHASE116_ZERO_ID],
    );
    assert.deepEqual(links, [
      {
        source_id: PHASE116_ZERO_ID,
        target_id: BRAND_ID,
        link_type: "made_by",
      },
      {
        source_id: BRAND_ID,
        target_id: PHASE116_ZERO_ID,
        link_type: "reverse",
      },
    ]);

    const scopes = await rows(
      client,
      "SELECT scope_key,production_state,material_scope,nib_scope,edition_scope FROM fact_scopes WHERE entity_id=? ORDER BY scope_key",
      [PHASE116_ZERO_ID],
    );
    assert.deepEqual(
      new Set(scopes.map((row) => row.scope_key)),
      new Set([
        PHASE116_CURRENT_SCOPE,
        PHASE116_LAUNCH_SCOPE,
        PHASE116_REVIEW_SCOPE,
      ]),
    );
    const spec = (
      await rows(
        client,
        "SELECT nib,fill_system,material,dimensions,weight FROM model_specs WHERE entity_id=?",
        [PHASE116_ZERO_ID],
      )
    )[0];
    assert.match(
      String(spec?.nib),
      /steel[\s\S]*14K gold[\s\S]*14K gold flex[\s\S]*EF[\s\S]*ST5/i,
    );
    assert.match(
      String(spec?.fill_system),
      /cartridge[\s\S]*converter[\s\S]*two cartridges/i,
    );
    assert.match(String(spec?.material), /resin[\s\S]*stainless/i);
    assert.match(String(spec?.dimensions), /143 mm[\s\S]*14 mm/);
    assert.equal(spec?.weight, "32 g");

    const rejected = await rows(
      client,
      `SELECT evidence.field_key,item.url,evidence.review_status
         FROM spec_field_evidence evidence
         JOIN model_specs spec ON spec.id=evidence.model_spec_id
         JOIN citations citation ON citation.id=evidence.citation_id
         JOIN source_items item ON item.id=citation.source_item_id
         WHERE spec.entity_id=? AND evidence.review_status='rejected'
         ORDER BY evidence.field_key,item.url`,
      [PHASE116_ZERO_ID],
    );
    assert.ok(
      rejected.some(
        (row) =>
          row.item_url === PHASE116_LAUNCH_URL ||
          row.url === PHASE116_LAUNCH_URL,
      ),
    );
    for (const field of ["dimensions", "material", "nib", "weight"]) {
      assert.ok(rejected.some((row) => row.field_key === field));
    }
    const conflict = await rows(
      client,
      `SELECT conflict.field_key,conflict.status,member.asserted_value
         FROM fact_conflicts conflict
         JOIN fact_conflict_members member ON member.conflict_id=conflict.id
         WHERE conflict.entity_id=? ORDER BY member.asserted_value`,
      [PHASE116_ZERO_ID],
    );
    assert.equal(conflict.length, 2);
    assert.deepEqual(
      new Set(conflict.map((row) => row.asserted_value)),
      new Set([
        "2020 launch brochure: Br8 bronze trim/material",
        "2026 current page: stainless-steel trims",
      ]),
    );

    const zeroHash = await computePublicationContentHash(
      client,
      PHASE116_ZERO_ID,
    );
    const publication = (
      await rows(
        client,
        "SELECT status,approved_content_hash FROM entity_publications WHERE entity_id=?",
        [PHASE116_ZERO_ID],
      )
    )[0];
    assert.deepEqual(publication, {
      status: "published",
      approved_content_hash: zeroHash,
    });
    const brandHashAfter = await computePublicationContentHash(
      client,
      BRAND_ID,
    );
    assert.notEqual(brandHashAfter, brandHashBefore);
    assert.equal(await digest(client, BRAND_ID, false), brandPayloadBefore);
    const brandPublication = (
      await rows(
        client,
        "SELECT status,approved_content_hash FROM entity_publications WHERE entity_id=?",
        [BRAND_ID],
      )
    )[0];
    assert.deepEqual(brandPublication, {
      status: "published",
      approved_content_hash: brandHashAfter,
    });
    const brandCurrentReviews = await rows(
      client,
      "SELECT review_kind FROM entity_content_reviews WHERE entity_id=? AND content_hash=? AND status='approved' ORDER BY review_kind",
      [BRAND_ID, brandHashAfter],
    );
    assert.deepEqual(
      brandCurrentReviews.map((row) => row.review_kind),
      ["fact", "language", "media", "publication"],
    );
    assert.ok(
      brandReviewsBefore.every((row) => row.content_hash !== brandHashAfter),
    );
    for (const [id, before] of protectedBefore)
      assert.equal(await digest(client, id), before);

    const targetBeforeReplay = await digest(client, PHASE116_ZERO_ID);
    const brandBeforeReplay = await digest(client, BRAND_ID);
    const replay = await applyPhase116MontegrappaZeroContent(client, options);
    assert.deepEqual(
      replay.entities.map((item) => item.outcome),
      ["noop"],
    );
    assert.equal(await digest(client, PHASE116_ZERO_ID), targetBeforeReplay);
    assert.equal(await digest(client, BRAND_ID), brandBeforeReplay);

    await client.execute({
      sql: "DELETE FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
      args: [PHASE116_ZERO_ID, BRAND_ID],
    });
    const tampered = await digest(client, PHASE116_ZERO_ID);
    await assert.rejects(
      applyPhase116MontegrappaZeroContent(client, options),
      /terminal maker topology is invalid|exact Phase 87 terminal baseline/,
    );
    assert.equal(await digest(client, PHASE116_ZERO_ID), tampered);
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
