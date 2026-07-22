import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import { applyPhase99ConklinHistoricContent } from "../../scripts/apply-phase99-conklin-historic-content";
import {
  type ApplyPhase136Options,
  applyPhase136ConklinDuragraphContent,
} from "../../scripts/apply-phase136-conklin-duragraph-content";
import {
  loadPhase136ConklinDuragraphPack,
  PHASE136_ABALONE_URL,
  PHASE136_COLLECTION_URL,
  PHASE136_CONKLIN_BRAND_ID,
  PHASE136_CURRENT_SCOPE,
  PHASE136_CURRENT_URL,
  PHASE136_DURAGRAPH_ID,
  PHASE136_DURAGRAPH_SLUG,
  PHASE136_GLIDER_ID,
  PHASE136_MADE_BY_ID,
  PHASE136_METAL_URL,
  PHASE136_NOZAC_ID,
  PHASE136_REVERSE_ID,
  PHASE136_SOURCES,
  PHASE136_SVG,
  PHASE136_TGS_SCOPE,
  PHASE136_TGS_URL,
  PHASE136_WAD_SCOPE,
  PHASE136_WAD_URL,
} from "../../scripts/data/phase136-conklin-duragraph";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { computePublicationContentHash } from "../../src/lib/publication";

const ROOT_ALIAS = "/Users/xz/CodeBuddy/fountain-pen-graph";
const ROOT_CANONICAL = "/Users/xz/Documents/fountain-pen-graph";
const REAL = path.join(ROOT_CANONICAL, "data", "fpkg.db");

async function rows(client: Client, sql: string, args: unknown[] = []) {
  return (await client.execute({ sql, args: args as never[] })).rows.map(
    (row) => ({ ...row }),
  );
}

async function digest(client: Client, entityId: string, topology = true) {
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
    "SELECT * FROM timeline_events WHERE entity_id=? ORDER BY id",
    ...(topology
      ? [
          "SELECT * FROM entity_links WHERE source_id=? OR target_id=? ORDER BY id",
          "SELECT * FROM entity_publications WHERE entity_id=?",
          "SELECT * FROM entity_content_reviews WHERE entity_id=? ORDER BY review_kind,content_hash",
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
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

test("Phase 136 publishes one modern Conklin Duragraph with current/SKU/review boundaries on an owned copy", {
  timeout: 180_000,
}, async () => {
  const keepAlive = setInterval(() => undefined, 1_000);
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const realBefore = JSON.stringify(protectedSnapshot);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase136-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase136Options = {
    workspaceRoot: ROOT_ALIAS,
    reviewer: "phase136-test",
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
    const phase99 = await applyPhase99ConklinHistoricContent(client, options);
    assert.deepEqual(
      phase99.entities.map((item) => item.outcome),
      ["published", "published", "published"],
    );

    const protectedBefore = new Map([
      [PHASE136_NOZAC_ID, await digest(client, PHASE136_NOZAC_ID)],
      [PHASE136_GLIDER_ID, await digest(client, PHASE136_GLIDER_ID)],
    ]);
    const brandPayloadBefore = await digest(
      client,
      PHASE136_CONKLIN_BRAND_ID,
      false,
    );
    const brandHashBefore = await computePublicationContentHash(
      client,
      PHASE136_CONKLIN_BRAND_ID,
    );
    const reverseBefore = await rows(
      client,
      "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='reverse' ORDER BY target_id",
      [PHASE136_CONKLIN_BRAND_ID],
    );

    const pack = loadPhase136ConklinDuragraphPack(ROOT_CANONICAL);
    assert.equal(pack.entityId, PHASE136_DURAGRAPH_ID);
    assert.equal(pack.expectedSlug, PHASE136_DURAGRAPH_SLUG);
    assert.equal(pack.sources.length, 9);
    assert.equal(pack.scopes.length, 3);
    assert.equal(pack.claims.length, 6);
    assert.equal(pack.variants?.length, 10);
    assert.equal(pack.media.length, 1);
    assert.equal(Array.from(pack.summary).length >= 60, true);
    assert.equal(Array.from(pack.summary).length <= 160, true);
    assert.equal(Array.from(pack.bodyMd).length >= 2_000, true);
    for (const route of [
      "/brand/conklin",
      "/pen/the-conklin-nozac",
      "/pen/the-conklin-glider",
    ])
      assert.match(pack.bodyMd, new RegExp(route));
    assert.deepEqual(
      new Set(pack.sources.map((source) => source.url)),
      new Set([
        PHASE136_CURRENT_URL,
        PHASE136_COLLECTION_URL,
        PHASE136_ABALONE_URL,
        PHASE136_SOURCES.red.url,
        PHASE136_METAL_URL,
        PHASE136_SOURCES.history.url,
        PHASE136_TGS_URL,
        PHASE136_WAD_URL,
        PHASE136_SVG,
      ]),
    );
    assert.equal(PHASE136_SOURCES.tgs.tier, "professional_secondary");
    assert.equal(PHASE136_SOURCES.wad.tier, "professional_secondary");
    assert.notEqual(
      PHASE136_SOURCES.tgs.independenceGroup,
      PHASE136_SOURCES.wad.independenceGroup,
    );
    assert.deepEqual(
      new Set(pack.scopes.map((scope) => scope.scopeKey)),
      new Set([PHASE136_CURRENT_SCOPE, PHASE136_TGS_SCOPE, PHASE136_WAD_SCOPE]),
    );
    const specText = JSON.stringify(pack.spec?.values);
    assert.match(
      specText,
      /5\.5 in[\s\S]*4\.75 in[\s\S]*6\.85 in[\s\S]*0\.55 in/,
    );
    assert.match(specText, /JoWo stainless steel[\s\S]*EF[\s\S]*Stub/i);
    assert.match(specText, /international cartridge[\s\S]*converter/i);
    assert.match(specText, /SKU-dependent[\s\S]*resin[\s\S]*PVD/i);
    assert.doesNotMatch(specText, /26 g|15 g|five inches|seven inches/i);
    assert.equal(pack.conflicts?.[0]?.status, "resolved");
    assert.match(
      String(pack.conflicts?.[0]?.resolutionNote),
      /SKU qualification[\s\S]*resin[\s\S]*PVD/i,
    );

    const svg = fs.readFileSync(
      path.join(ROOT_CANONICAL, "public", PHASE136_SVG.replace(/^\//, "")),
      "utf8",
    );
    for (const token of [
      "1600",
      "900",
      "non-photo",
      "non-logo",
      "not-to-scale",
      "non-colour-proof",
    ])
      assert.match(svg.toLowerCase(), new RegExp(token));

    for (const [changed, expected] of [
      [{ ...options, reviewer: " " }, /reviewer must not be empty/],
      [
        { ...options, workspaceRoot: os.tmpdir() },
        /verified CodeBuddy\/Documents repo pair/,
      ],
      [
        {
          ...options,
          env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" },
        },
        /refuses inherited remote/,
      ],
    ] as Array<[ApplyPhase136Options, RegExp]>) {
      await assert.rejects(
        applyPhase136ConklinDuragraphContent(client, changed),
        expected,
      );
      assert.equal(
        (
          await rows(client, "SELECT count(*) AS n FROM entities WHERE id=?", [
            PHASE136_DURAGRAPH_ID,
          ])
        )[0]?.n,
        0,
      );
    }

    const protectedControlPath = path.join(ownedRoot, "protected-control.db");
    const hardlinkPath = path.join(ownedRoot, "protected-hardlink.db");
    fs.copyFileSync(REAL, protectedControlPath);
    fs.linkSync(protectedControlPath, hardlinkPath);
    const hardlinkClient = createClient({ url: `file:${hardlinkPath}` });
    try {
      await assert.rejects(
        applyPhase136ConklinDuragraphContent(hardlinkClient, {
          ...options,
          databasePath: hardlinkPath,
          protectedCatalogPath: protectedControlPath,
          protectedCatalogSnapshot: snapshotCatalogFiles(protectedControlPath),
        }),
        /hard-link aliases/,
      );
    } finally {
      hardlinkClient.close();
      fs.unlinkSync(hardlinkPath);
      fs.unlinkSync(protectedControlPath);
    }

    const first = await applyPhase136ConklinDuragraphContent(client, options);
    assert.deepEqual(
      first.entities.map((item) => [item.entityId, item.outcome]),
      [[PHASE136_DURAGRAPH_ID, "published"]],
    );
    const publicRow = (
      await rows(
        client,
        "SELECT id,type,slug,name,summary,body_md FROM public_entities WHERE id=?",
        [PHASE136_DURAGRAPH_ID],
      )
    )[0];
    assert.equal(publicRow?.type, "pen");
    assert.equal(publicRow?.slug, PHASE136_DURAGRAPH_SLUG);
    assert.equal(publicRow?.name, "Conklin Duragraph");
    assert.equal(Array.from(String(publicRow?.body_md)).length >= 2_000, true);

    assert.deepEqual(
      await rows(
        client,
        "SELECT id,source_id,target_id,link_type FROM entity_links WHERE (source_id=? OR target_id=?) AND link_type IN ('made_by','reverse') ORDER BY id",
        [PHASE136_DURAGRAPH_ID, PHASE136_DURAGRAPH_ID],
      ),
      [
        {
          id: PHASE136_MADE_BY_ID,
          source_id: PHASE136_DURAGRAPH_ID,
          target_id: PHASE136_CONKLIN_BRAND_ID,
          link_type: "made_by",
        },
        {
          id: PHASE136_REVERSE_ID,
          source_id: PHASE136_CONKLIN_BRAND_ID,
          target_id: PHASE136_DURAGRAPH_ID,
          link_type: "reverse",
        },
      ],
    );
    assert.deepEqual(
      (
        await rows(
          client,
          "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='reverse' ORDER BY target_id",
          [PHASE136_CONKLIN_BRAND_ID],
        )
      ).filter((row) => row.target_id !== PHASE136_DURAGRAPH_ID),
      reverseBefore,
    );
    assert.equal(
      await digest(client, PHASE136_CONKLIN_BRAND_ID, false),
      brandPayloadBefore,
    );
    for (const [id, before] of protectedBefore)
      assert.equal(await digest(client, id), before);
    assert.notEqual(
      await computePublicationContentHash(client, PHASE136_CONKLIN_BRAND_ID),
      brandHashBefore,
    );

    const spec = (
      await rows(
        client,
        "SELECT nib,fill_system,material,dimensions,weight FROM model_specs WHERE entity_id=?",
        [PHASE136_DURAGRAPH_ID],
      )
    )[0];
    assert.match(String(spec?.nib), /JoWo[\s\S]*EF[\s\S]*Stub/i);
    assert.match(String(spec?.fill_system), /international[\s\S]*converter/i);
    assert.match(String(spec?.material), /SKU-dependent[\s\S]*PVD/i);
    assert.match(String(spec?.dimensions), /5\.5 in[\s\S]*0\.55 in/);
    assert.equal(spec?.weight, null);
    const rejected = await rows(
      client,
      `SELECT evidence.field_key,item.url,evidence.review_status
           FROM spec_field_evidence evidence
           JOIN model_specs spec ON spec.id=evidence.model_spec_id
           JOIN citations citation ON citation.id=evidence.citation_id
           JOIN source_items item ON item.id=citation.source_item_id
          WHERE spec.entity_id=? AND evidence.review_status='rejected'
          ORDER BY evidence.field_key,item.url`,
      [PHASE136_DURAGRAPH_ID],
    );
    assert.deepEqual(rejected, [
      {
        field_key: "dimensions",
        url: PHASE136_WAD_URL,
        review_status: "rejected",
      },
      {
        field_key: "nib",
        url: PHASE136_TGS_URL,
        review_status: "rejected",
      },
      {
        field_key: "weight",
        url: PHASE136_WAD_URL,
        review_status: "rejected",
      },
    ]);

    const currentHash = await computePublicationContentHash(
      client,
      PHASE136_DURAGRAPH_ID,
    );
    assert.deepEqual(
      await rows(
        client,
        "SELECT review_kind,status,content_hash FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind",
        [PHASE136_DURAGRAPH_ID, currentHash],
      ),
      ["fact", "language", "media", "publication"].map((reviewKind) => ({
        review_kind: reviewKind,
        status: "approved",
        content_hash: currentHash,
      })),
    );

    const second = await applyPhase136ConklinDuragraphContent(client, options);
    assert.deepEqual(
      second.entities.map((item) => [item.entityId, item.outcome]),
      [[PHASE136_DURAGRAPH_ID, "noop"]],
    );
    await client.execute({
      sql: "DELETE FROM entity_aliases WHERE entity_id=? AND alias=?",
      args: [PHASE136_DURAGRAPH_ID, "Duragraph"],
    });
    await assert.rejects(
      applyPhase136ConklinDuragraphContent(client, options),
      /terminal payload\/topology\/publication is invalid/,
    );
    assert.equal(JSON.stringify(snapshotCatalogFiles(REAL)), realBefore);
    assertCatalogSnapshotUnchanged(protectedSnapshot);
  } finally {
    client.close();
    clearInterval(keepAlive);
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
});
