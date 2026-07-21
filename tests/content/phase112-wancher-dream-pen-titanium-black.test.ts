import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import { applyPhase104WancherDreamPenNavigationContent } from "../../scripts/apply-phase104-wancher-dream-pen-navigation-content";
import { applyPhase107WancherDreamPenTrueEboniteMatteBlackContent } from "../../scripts/apply-phase107-wancher-dream-pen-true-ebonite-matte-black-content";
import {
  type ApplyPhase112Options,
  applyPhase112WancherDreamPenTitaniumBlackContent,
} from "../../scripts/apply-phase112-wancher-dream-pen-titanium-black-content";
import {
  loadPhase112WancherDreamPenTitaniumBlackPack,
  PHASE112_DREAM_ARTICLE_ID,
  PHASE112_OFFICIAL_URL,
  PHASE112_REVIEW_URL,
  PHASE112_TITANIUM_BLACK_ID,
  PHASE112_TITANIUM_BLACK_SLUG,
  PHASE112_TRUE_EBONITE_ID,
  PHASE112_WANCHER_ID,
} from "../../scripts/data/phase112-wancher-dream-pen-titanium-black";
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

async function digest(client: Client, entityId: string, includeLinks = true) {
  const queries = [
    "SELECT * FROM entities WHERE id=?",
    "SELECT * FROM stories WHERE entity_id=? ORDER BY id",
    "SELECT * FROM entity_references WHERE entity_id=? ORDER BY id",
    "SELECT * FROM entity_aliases WHERE entity_id=? ORDER BY id",
    "SELECT * FROM fact_scopes WHERE entity_id=? ORDER BY id",
    "SELECT * FROM claims WHERE subject_entity_id=? ORDER BY id",
    "SELECT * FROM model_specs WHERE entity_id=? ORDER BY id",
    "SELECT * FROM media_assets WHERE entity_id=? ORDER BY id",
    ...(includeLinks
      ? [
          "SELECT * FROM entity_links WHERE source_id=? OR target_id=? ORDER BY id",
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
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase112-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  await migrateDatabase(client);
  const options: ApplyPhase112Options = {
    workspaceRoot: ROOT_ALIAS,
    reviewer: "phase112-test",
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
  return { client, options, ownedRoot, protectedSnapshot };
}

async function publishAndNoopScenario() {
  const fixture = await setup();
  const { client, options, ownedRoot, protectedSnapshot } = fixture;
  try {
    const articleBefore = await digest(client, PHASE112_DREAM_ARTICLE_ID);
    const trueEboniteBefore = await digest(client, PHASE112_TRUE_EBONITE_ID);
    const brandPayloadBefore = await digest(client, PHASE112_WANCHER_ID, false);
    const brandHashBefore = await computePublicationContentHash(
      client,
      PHASE112_WANCHER_ID,
    );
    const reverseBefore = await rows(
      client,
      "SELECT source_id,target_id,link_type FROM entity_links WHERE source_id=? AND link_type='reverse' ORDER BY target_id",
      [PHASE112_WANCHER_ID],
    );
    assert.equal(
      (
        await rows(
          client,
          "SELECT count(*) AS n FROM entities WHERE id=? OR slug=? OR lower(name)=lower(?)",
          [
            PHASE112_TITANIUM_BLACK_ID,
            PHASE112_TITANIUM_BLACK_SLUG,
            "Wancher Dream Pen Titanium Black",
          ],
        )
      )[0]?.n,
      0,
    );
    assert.equal(
      (
        await rows(
          client,
          `SELECT count(*) AS n FROM entity_references reference JOIN source_items item ON item.id=reference.source_item_id WHERE reference.entity_id=? AND item.url=?`,
          [PHASE112_DREAM_ARTICLE_ID, PHASE112_OFFICIAL_URL],
        )
      )[0]?.n,
      1,
    );

    const authorityCases: Array<[ApplyPhase112Options, RegExp]> = [
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
        applyPhase112WancherDreamPenTitaniumBlackContent(client, changed),
        expected,
      );
      assert.equal(
        await digest(client, PHASE112_DREAM_ARTICLE_ID),
        articleBefore,
      );
    }
    await client.execute({
      sql: "INSERT INTO entities(id,type,slug,name,source_url) VALUES('phase112-alt','pen','phase112-alt','Dream Pen Titanium Black',?)",
      args: [PHASE112_OFFICIAL_URL],
    });
    await assert.rejects(
      applyPhase112WancherDreamPenTitaniumBlackContent(client, options),
      /alternate exact Titanium Black pen/,
    );
    await client.execute("DELETE FROM entities WHERE id='phase112-alt'");

    const first = await applyPhase112WancherDreamPenTitaniumBlackContent(
      client,
      options,
    );
    assert.deepEqual(
      first.entities.map((item) => [item.entityId, item.outcome]),
      [[PHASE112_TITANIUM_BLACK_ID, "published"]],
    );
    const entity = (
      await rows(
        client,
        "SELECT id,type,slug,name,summary,body_md,source FROM entities WHERE id=?",
        [PHASE112_TITANIUM_BLACK_ID],
      )
    )[0];
    assert.equal(entity?.id, PHASE112_TITANIUM_BLACK_ID);
    assert.equal(entity?.type, "pen");
    assert.equal(entity?.slug, PHASE112_TITANIUM_BLACK_SLUG);
    assert.equal(entity?.name, "Wancher Dream Pen Titanium Black");
    assert.ok(Array.from(String(entity?.summary)).length >= 60);
    assert.ok(Array.from(String(entity?.body_md)).length >= 2_000);
    assert.match(String(entity?.body_md), /\/article\/wancher-dream-pen/);

    assert.deepEqual(
      await rows(
        client,
        "SELECT source_id,target_id,link_type FROM entity_links WHERE (source_id=? OR target_id=?) AND link_type IN ('made_by','reverse') ORDER BY link_type",
        [PHASE112_TITANIUM_BLACK_ID, PHASE112_TITANIUM_BLACK_ID],
      ),
      [
        {
          source_id: PHASE112_TITANIUM_BLACK_ID,
          target_id: PHASE112_WANCHER_ID,
          link_type: "made_by",
        },
        {
          source_id: PHASE112_WANCHER_ID,
          target_id: PHASE112_TITANIUM_BLACK_ID,
          link_type: "reverse",
        },
      ],
    );
    assert.deepEqual(
      await digest(client, PHASE112_DREAM_ARTICLE_ID),
      articleBefore,
    );
    assert.deepEqual(
      await digest(client, PHASE112_TRUE_EBONITE_ID),
      trueEboniteBefore,
    );
    assert.equal(
      await digest(client, PHASE112_WANCHER_ID, false),
      brandPayloadBefore,
    );
    assert.notEqual(
      await computePublicationContentHash(client, PHASE112_WANCHER_ID),
      brandHashBefore,
    );
    assert.deepEqual(
      (
        await rows(
          client,
          "SELECT source_id,target_id,link_type FROM entity_links WHERE source_id=? AND link_type='reverse' ORDER BY target_id",
          [PHASE112_WANCHER_ID],
        )
      ).filter((row) => row.target_id !== PHASE112_TITANIUM_BLACK_ID),
      reverseBefore,
    );

    const pack = loadPhase112WancherDreamPenTitaniumBlackPack(ROOT_CANONICAL);
    assert.equal(pack.entityId, PHASE112_TITANIUM_BLACK_ID);
    assert.equal(
      pack.media.filter((item) => item.usageStatus === "primary").length,
      1,
    );
    assert.deepEqual(
      new Set(
        pack.sources
          .filter((item) => item.itemType !== "image")
          .map((item) => item.independenceGroup),
      ),
      new Set(["wancher-official", "kamitopen-2024"]),
    );
    const specs = JSON.stringify(pack.spec?.values);
    assert.match(specs, /titanium|PVD|JoWo|European International/i);
    assert.doesNotMatch(specs, /154|66\.4|sold out|price|heavy|non-post/i);
    const sample = pack.scopes.find((scope) => scope.scopeKey.includes("2024"));
    assert.match(
      JSON.stringify(sample),
      /154 mm|66\.4 g|affiliate|non-post|heavy/i,
    );
    assert.equal(pack.conflicts?.[0]?.status, "resolved");
    assert.match(
      String(pack.conflicts?.[0]?.resolutionNote),
      /non-merging.*scope separation.*chronology remains unknown/i,
    );
    assert.match(
      JSON.stringify(pack.conflicts),
      /JoWo.*titanium|titanium.*JoWo/i,
    );
    assert.ok(
      pack.sources.some(
        (item) =>
          item.url === PHASE112_REVIEW_URL &&
          item.summary.includes("affiliate"),
      ),
    );

    const currentHash = await computePublicationContentHash(
      client,
      PHASE112_TITANIUM_BLACK_ID,
    );
    assert.deepEqual(
      await rows(
        client,
        "SELECT review_kind,status,content_hash FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind",
        [PHASE112_TITANIUM_BLACK_ID, currentHash],
      ),
      [
        {
          review_kind: "fact",
          status: "approved",
          content_hash: currentHash,
        },
        {
          review_kind: "language",
          status: "approved",
          content_hash: currentHash,
        },
        {
          review_kind: "media",
          status: "approved",
          content_hash: currentHash,
        },
        {
          review_kind: "publication",
          status: "approved",
          content_hash: currentHash,
        },
      ],
    );
    assert.equal(
      (
        await rows(
          client,
          "SELECT blocker_count,publishable FROM public_entity_readiness WHERE entity_id=? AND contract_version=3",
          [PHASE112_TITANIUM_BLACK_ID],
        )
      )[0]?.blocker_count,
      0,
    );
    assert.equal(
      (
        await rows(
          client,
          "SELECT count(*) AS n FROM public_entities WHERE id=?",
          [PHASE112_TITANIUM_BLACK_ID],
        )
      )[0]?.n,
      1,
    );

    const terminal = await digest(client, PHASE112_TITANIUM_BLACK_ID);
    const second = await applyPhase112WancherDreamPenTitaniumBlackContent(
      client,
      { ...options, workspaceRoot: ROOT_CANONICAL },
    );
    assert.deepEqual(
      second.entities.map((item) => item.outcome),
      ["noop"],
    );
    assert.equal(await digest(client, PHASE112_TITANIUM_BLACK_ID), terminal);
    await client.execute({
      sql: "DELETE FROM entity_links WHERE source_id=? AND link_type='made_by'",
      args: [PHASE112_TITANIUM_BLACK_ID],
    });
    const tampered = await digest(client, PHASE112_TITANIUM_BLACK_ID);
    await assert.rejects(
      applyPhase112WancherDreamPenTitaniumBlackContent(client, options),
      /Phase 107 Wancher brand baseline|terminal.*made_by|made_by.*terminal/i,
    );
    assert.equal(await digest(client, PHASE112_TITANIUM_BLACK_ID), tampered);
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
    assert.deepEqual(snapshotCatalogFiles(REAL), protectedSnapshot);
  }
}

test("Phase 112 publishes exact Titanium Black, replays noop and fails closed", {
  timeout: 60_000,
}, async () => {
  const keepAlive = setInterval(() => undefined, 1_000);
  try {
    await publishAndNoopScenario();
  } finally {
    clearInterval(keepAlive);
  }
});
