import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import { applyPhase104WancherDreamPenNavigationContent } from "../../scripts/apply-phase104-wancher-dream-pen-navigation-content";
import { applyPhase107WancherDreamPenTrueEboniteMatteBlackContent } from "../../scripts/apply-phase107-wancher-dream-pen-true-ebonite-matte-black-content";
import { applyPhase134WancherDreamPenTrueEboniteSilkBlackContent } from "../../scripts/apply-phase134-wancher-dream-pen-true-ebonite-silk-black-content";
import {
  type ApplyPhase135Options,
  applyPhase135WancherDreamPenTrueEboniteMarbleGreenContent,
} from "../../scripts/apply-phase135-wancher-dream-pen-true-ebonite-marble-green-content";
import {
  loadPhase135WancherDreamPenTrueEboniteMarbleGreenPack,
  PHASE135_DREAM_ARTICLE_ID,
  PHASE135_MARBLE_GREEN_ID,
  PHASE135_MARBLE_GREEN_SLUG,
  PHASE135_MATTE_BLACK_ID,
  PHASE135_OFFICIAL_URL,
  PHASE135_PAPER_MOUSE_URL,
  PHASE135_SILK_BLACK_ID,
  PHASE135_TRUPHAE_URL,
  PHASE135_WANCHER_ID,
} from "../../scripts/data/phase135-wancher-dream-pen-true-ebonite-marble-green";
import {
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
  const result = [];
  for (const sql of queries)
    result.push(
      await rows(
        client,
        sql,
        sql.includes(" OR ") ? [entityId, entityId] : [entityId],
      ),
    );
  return JSON.stringify(result);
}

async function setup() {
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase135-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  await migrateDatabase(client);
  const options: ApplyPhase135Options = {
    workspaceRoot: ROOT_ALIAS,
    reviewer: "phase135-test",
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
  await applyPhase104WancherDreamPenNavigationContent(client, options);
  await applyPhase107WancherDreamPenTrueEboniteMatteBlackContent(
    client,
    options,
  );
  await applyPhase134WancherDreamPenTrueEboniteSilkBlackContent(
    client,
    options,
  );
  return { client, options, ownedRoot, protectedSnapshot };
}

test("Phase 135 publishes exact Marble Green through an owned checkpoint only", {
  timeout: 150_000,
}, async () => {
  const { client, options, ownedRoot, protectedSnapshot } = await setup();
  try {
    const realBefore = JSON.stringify(protectedSnapshot);
    const protectedBefore = new Map<string, string>();
    for (const id of [
      PHASE135_DREAM_ARTICLE_ID,
      PHASE135_MATTE_BLACK_ID,
      PHASE135_SILK_BLACK_ID,
    ])
      protectedBefore.set(id, await digest(client, id));
    const brandBefore = await digest(client, PHASE135_WANCHER_ID, false);
    const brandHashBefore = await computePublicationContentHash(
      client,
      PHASE135_WANCHER_ID,
    );
    const reverseBefore = await rows(
      client,
      "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='reverse' ORDER BY target_id",
      [PHASE135_WANCHER_ID],
    );

    assert.equal(
      (
        await rows(
          client,
          "SELECT count(*) n FROM entities WHERE id=? OR slug=? OR lower(name)=lower(?)",
          [
            PHASE135_MARBLE_GREEN_ID,
            PHASE135_MARBLE_GREEN_SLUG,
            "Wancher Dream Pen True Ebonite Marble Green",
          ],
        )
      )[0]?.n,
      0,
    );

    const authorityCases: Array<[ApplyPhase135Options, RegExp]> = [
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
        /refuses inherited remote selection/,
      ],
      [
        { ...options, ownedRoot: ROOT_CANONICAL },
        /database inside caller-owned root/,
      ],
    ];
    for (const [changed, expected] of authorityCases) {
      await assert.rejects(
        applyPhase135WancherDreamPenTrueEboniteMarbleGreenContent(
          client,
          changed,
        ),
        expected,
      );
      assert.equal(
        await digest(client, PHASE135_DREAM_ARTICLE_ID),
        protectedBefore.get(PHASE135_DREAM_ARTICLE_ID),
      );
    }

    const hardlink = path.join(ownedRoot, "catalog-hardlink.db");
    fs.linkSync(options.databasePath, hardlink);
    try {
      await assert.rejects(
        applyPhase135WancherDreamPenTrueEboniteMarbleGreenContent(client, {
          ...options,
          databasePath: hardlink,
        }),
        /hard-link aliases/,
      );
    } finally {
      fs.unlinkSync(hardlink);
    }

    await client.execute({
      sql: "INSERT INTO entities(id,type,slug,name,source_url) VALUES('phase135-alt','pen','phase135-alt','True Ebonite - Marble Green',?)",
      args: [PHASE135_OFFICIAL_URL],
    });
    await assert.rejects(
      applyPhase135WancherDreamPenTrueEboniteMarbleGreenContent(
        client,
        options,
      ),
      /Marble Green identity is partial or alternate/,
    );
    await client.execute("DELETE FROM entities WHERE id='phase135-alt'");

    const first =
      await applyPhase135WancherDreamPenTrueEboniteMarbleGreenContent(
        client,
        options,
      );
    assert.deepEqual(
      first.entities.map((item) => [item.entityId, item.outcome]),
      [[PHASE135_MARBLE_GREEN_ID, "published"]],
    );

    const entity = (
      await rows(
        client,
        "SELECT type,slug,name,summary,body_md,source FROM entities WHERE id=?",
        [PHASE135_MARBLE_GREEN_ID],
      )
    )[0];
    assert.equal(entity?.type, "pen");
    assert.equal(entity?.slug, PHASE135_MARBLE_GREEN_SLUG);
    assert.equal(entity?.name, "Wancher Dream Pen True Ebonite Marble Green");
    assert.ok(Array.from(String(entity?.summary)).length >= 60);
    assert.ok(Array.from(String(entity?.body_md)).length >= 2_000);
    assert.match(String(entity?.body_md), /\/article\/wancher-dream-pen/);
    assert.match(
      String(entity?.body_md),
      /\/pen\/wancher-dream-pen-true-ebonite-silk-black/,
    );
    assert.match(
      String(entity?.body_md),
      /\/pen\/wancher-dream-pen-true-ebonite-matte-black/,
    );

    assert.deepEqual(
      await rows(
        client,
        "SELECT source_id,target_id,link_type FROM entity_links WHERE (source_id=? OR target_id=?) AND link_type IN ('made_by','reverse') ORDER BY link_type",
        [PHASE135_MARBLE_GREEN_ID, PHASE135_MARBLE_GREEN_ID],
      ),
      [
        {
          source_id: PHASE135_MARBLE_GREEN_ID,
          target_id: PHASE135_WANCHER_ID,
          link_type: "made_by",
        },
        {
          source_id: PHASE135_WANCHER_ID,
          target_id: PHASE135_MARBLE_GREEN_ID,
          link_type: "reverse",
        },
      ],
    );
    for (const [id, before] of protectedBefore)
      assert.equal(await digest(client, id), before);
    assert.equal(await digest(client, PHASE135_WANCHER_ID, false), brandBefore);
    assert.notEqual(
      await computePublicationContentHash(client, PHASE135_WANCHER_ID),
      brandHashBefore,
    );
    assert.deepEqual(
      (
        await rows(
          client,
          "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='reverse' ORDER BY target_id",
          [PHASE135_WANCHER_ID],
        )
      ).filter((row) => row.target_id !== PHASE135_MARBLE_GREEN_ID),
      reverseBefore,
    );

    const pack =
      loadPhase135WancherDreamPenTrueEboniteMarbleGreenPack(ROOT_CANONICAL);
    assert.equal(pack.entityId, PHASE135_MARBLE_GREEN_ID);
    assert.equal(pack.sources.length, 8);
    assert.equal(pack.scopes.length, 3);
    assert.equal(pack.claims.length, 6);
    assert.equal(pack.variants?.length ?? 0, 0);
    assert.equal(pack.media.length, 1);
    assert.ok(
      pack.sources.some(
        (item) =>
          item.url === PHASE135_PAPER_MOUSE_URL && item.tier === "retailer",
      ),
    );
    assert.ok(
      pack.sources.some(
        (item) => item.url === PHASE135_TRUPHAE_URL && item.tier === "retailer",
      ),
    );
    assert.ok(
      pack.sources.some(
        (item) =>
          item.url === "https://www.youtube.com/watch?v=1AkCO4P9inM" &&
          item.tier === "professional_secondary" &&
          item.independenceGroup === "stilorso",
      ),
    );
    const specs = JSON.stringify(pack.spec?.values);
    assert.match(specs, /European International|JoWo|Wancher 18K|pattern/i);
    assert.doesNotMatch(
      specs,
      /titanium|spring-loaded|gold-plated|6\.08|5\.28|Mine/i,
    );
    assert.match(
      JSON.stringify(
        pack.scopes.find((scope) => scope.scopeKey.includes("retailer")),
      ),
      /titanium|spring-loaded|6\.08\/5\.28|gold-plated/i,
    );
    assert.match(
      JSON.stringify(
        pack.scopes.find((scope) => scope.scopeKey.includes("family")),
      ),
      /Nikko|ASO|not a component-by-component/i,
    );
    assert.equal(pack.conflicts?.[0]?.status, "resolved");
    assert.match(
      String(pack.conflicts?.[0]?.resolutionNote),
      /non-merging.*current official.*retailer/i,
    );

    const currentHash = await computePublicationContentHash(
      client,
      PHASE135_MARBLE_GREEN_ID,
    );
    assert.deepEqual(
      await rows(
        client,
        "SELECT review_kind,status,content_hash FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind",
        [PHASE135_MARBLE_GREEN_ID, currentHash],
      ),
      ["fact", "language", "media", "publication"].map((reviewKind) => ({
        review_kind: reviewKind,
        status: "approved",
        content_hash: currentHash,
      })),
    );

    const second =
      await applyPhase135WancherDreamPenTrueEboniteMarbleGreenContent(
        client,
        options,
      );
    assert.deepEqual(
      second.entities.map((item) => [item.entityId, item.outcome]),
      [[PHASE135_MARBLE_GREEN_ID, "noop"]],
    );

    await client.execute({
      sql: "DELETE FROM entity_aliases WHERE entity_id=? AND alias=?",
      args: [PHASE135_MARBLE_GREEN_ID, "True Ebonite - Marble Green"],
    });
    await assert.rejects(
      applyPhase135WancherDreamPenTrueEboniteMarbleGreenContent(
        client,
        options,
      ),
      /terminal payload\/topology\/publication is invalid/,
    );
    assert.equal(JSON.stringify(snapshotCatalogFiles(REAL)), realBefore);
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
});
