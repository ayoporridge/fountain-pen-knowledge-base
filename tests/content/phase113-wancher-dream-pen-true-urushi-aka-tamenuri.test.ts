import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import { applyPhase104WancherDreamPenNavigationContent } from "../../scripts/apply-phase104-wancher-dream-pen-navigation-content";
import { applyPhase107WancherDreamPenTrueEboniteMatteBlackContent } from "../../scripts/apply-phase107-wancher-dream-pen-true-ebonite-matte-black-content";
import {
  type ApplyPhase113Options,
  applyPhase113WancherDreamPenAkaTamenuriContent,
} from "../../scripts/apply-phase113-wancher-dream-pen-true-urushi-aka-tamenuri-content";
import {
  loadPhase113WancherDreamPenAkaTamenuriPack,
  PHASE113_AKA_TAMENURI_ID,
  PHASE113_AKA_TAMENURI_SLUG,
  PHASE113_DREAM_ARTICLE_ID,
  PHASE113_ED_JELLEY_PROTOTYPE_URL,
  PHASE113_OFFICIAL_URL,
  PHASE113_PENCILCASE_PROTOTYPE_URL,
  PHASE113_PRODUCTION_URL,
  PHASE113_TRUE_EBONITE_ID,
  PHASE113_WANCHER_ID,
} from "../../scripts/data/phase113-wancher-dream-pen-true-urushi-aka-tamenuri";
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
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase113-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  await migrateDatabase(client);
  const options: ApplyPhase113Options = {
    workspaceRoot: ROOT_ALIAS,
    reviewer: "phase113-test",
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
  await client.execute({
    sql: `INSERT INTO source_registry(
            id,name,source_type,allowed_use,reliability,homepage_url,fetch_method,
            notes,last_checked_at,default_source_tier,default_independence_group
          ) VALUES(
            'phase113-article-exception-registry','Wancher official','official',
            'summary_only','official_marketing','https://www.wancherpen.com/',
            'manual','Phase 104 article URL exception fixture','2026-07-21',
            'primary','wancher-official'
          )`,
  });
  await client.execute({
    sql: `INSERT INTO source_items(
            id,source_id,title,url,item_type,retrieved_at,summary,
            raw_metadata_json,allowed_use,review_status,source_tier,
            independence_group,archive_url,archive_locator
          ) VALUES(
            'phase113-article-exception-source','phase113-article-exception-registry',
            'Dream Pen True Urushi Aka Tamenuri',?,'web_page','2026-07-21',
            'Phase 104 article navigation evidence fixture','{}','summary_only',
            'approved','primary','wancher-official',?,
            'live-source-not-frozen;retrieved=2026-07-21;article-navigation-only=true'
          )`,
    args: [PHASE113_OFFICIAL_URL, PHASE113_OFFICIAL_URL],
  });
  await client.execute({
    sql: `INSERT INTO entity_references(
            id,entity_id,source_item_id,relation_type,note,review_status
          ) VALUES(
            'phase113-article-exception-reference',?,
            'phase113-article-exception-source','official',
            'Allowlisted article navigation evidence; not product ownership','approved'
          )`,
    args: [PHASE113_DREAM_ARTICLE_ID],
  });
  return { client, options, ownedRoot, protectedSnapshot };
}

async function publishAndNoopScenario() {
  const fixture = await setup();
  const { client, options, ownedRoot, protectedSnapshot } = fixture;
  try {
    const articleBefore = await digest(client, PHASE113_DREAM_ARTICLE_ID);
    const trueEboniteBefore = await digest(client, PHASE113_TRUE_EBONITE_ID);
    const brandPayloadBefore = await digest(client, PHASE113_WANCHER_ID, false);
    const brandHashBefore = await computePublicationContentHash(
      client,
      PHASE113_WANCHER_ID,
    );
    const reverseBefore = await rows(
      client,
      "SELECT source_id,target_id,link_type FROM entity_links WHERE source_id=? AND link_type='reverse' ORDER BY target_id",
      [PHASE113_WANCHER_ID],
    );
    assert.equal(
      (
        await rows(
          client,
          "SELECT count(*) AS n FROM entities WHERE id=? OR slug=? OR lower(name)=lower(?)",
          [
            PHASE113_AKA_TAMENURI_ID,
            PHASE113_AKA_TAMENURI_SLUG,
            "Wancher Dream Pen True Urushi Aka Tamenuri",
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
          [PHASE113_DREAM_ARTICLE_ID, PHASE113_OFFICIAL_URL],
        )
      )[0]?.n,
      1,
    );

    const authorityCases: Array<[ApplyPhase113Options, RegExp]> = [
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
        applyPhase113WancherDreamPenAkaTamenuriContent(client, changed),
        expected,
      );
      assert.equal(
        await digest(client, PHASE113_DREAM_ARTICLE_ID),
        articleBefore,
      );
    }
    await client.execute({
      sql: "INSERT INTO entities(id,type,slug,name,source_url) VALUES('phase113-alt','pen','phase113-alt','Dream Pen True Urushi Aka Tamenuri',?)",
      args: [PHASE113_OFFICIAL_URL],
    });
    await assert.rejects(
      applyPhase113WancherDreamPenAkaTamenuriContent(client, options),
      /alternate exact True Urushi Aka Tamenuri pen/,
    );
    await client.execute("DELETE FROM entities WHERE id='phase113-alt'");

    const first = await applyPhase113WancherDreamPenAkaTamenuriContent(
      client,
      options,
    );
    assert.deepEqual(
      first.entities.map((item) => [item.entityId, item.outcome]),
      [[PHASE113_AKA_TAMENURI_ID, "published"]],
    );
    const entity = (
      await rows(
        client,
        "SELECT id,type,slug,name,summary,body_md,source FROM entities WHERE id=?",
        [PHASE113_AKA_TAMENURI_ID],
      )
    )[0];
    assert.equal(entity?.id, PHASE113_AKA_TAMENURI_ID);
    assert.equal(entity?.type, "pen");
    assert.equal(entity?.slug, PHASE113_AKA_TAMENURI_SLUG);
    assert.equal(entity?.name, "Wancher Dream Pen True Urushi Aka Tamenuri");
    assert.ok(Array.from(String(entity?.summary)).length >= 60);
    assert.ok(Array.from(String(entity?.body_md)).length >= 2_000);
    assert.match(String(entity?.body_md), /\/article\/wancher-dream-pen/);

    assert.deepEqual(
      await rows(
        client,
        "SELECT source_id,target_id,link_type FROM entity_links WHERE (source_id=? OR target_id=?) AND link_type IN ('made_by','reverse') ORDER BY link_type",
        [PHASE113_AKA_TAMENURI_ID, PHASE113_AKA_TAMENURI_ID],
      ),
      [
        {
          source_id: PHASE113_AKA_TAMENURI_ID,
          target_id: PHASE113_WANCHER_ID,
          link_type: "made_by",
        },
        {
          source_id: PHASE113_WANCHER_ID,
          target_id: PHASE113_AKA_TAMENURI_ID,
          link_type: "reverse",
        },
      ],
    );
    assert.deepEqual(
      await digest(client, PHASE113_DREAM_ARTICLE_ID),
      articleBefore,
    );
    assert.deepEqual(
      await digest(client, PHASE113_TRUE_EBONITE_ID),
      trueEboniteBefore,
    );
    assert.equal(
      await digest(client, PHASE113_WANCHER_ID, false),
      brandPayloadBefore,
    );
    assert.notEqual(
      await computePublicationContentHash(client, PHASE113_WANCHER_ID),
      brandHashBefore,
    );
    assert.deepEqual(
      (
        await rows(
          client,
          "SELECT source_id,target_id,link_type FROM entity_links WHERE source_id=? AND link_type='reverse' ORDER BY target_id",
          [PHASE113_WANCHER_ID],
        )
      ).filter((row) => row.target_id !== PHASE113_AKA_TAMENURI_ID),
      reverseBefore,
    );

    const pack = loadPhase113WancherDreamPenAkaTamenuriPack(ROOT_CANONICAL);
    assert.equal(pack.entityId, PHASE113_AKA_TAMENURI_ID);
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
      new Set([
        "wancher-official",
        "pencilcase-production-order-2019",
        "pencilcase-loaned-prototype-2018",
        "ed-jelley-supplied-prototype-2018",
      ]),
    );
    const specs = JSON.stringify(pack.spec?.values);
    assert.match(
      specs,
      /ebonite|urushi|JoWo|Wancher 18K|European International/i,
    );
    assert.doesNotMatch(
      specs,
      /price|stock|add-to-cart|measurement|weight|writing experience|fewer/i,
    );
    const productionScope = pack.scopes.find((scope) =>
      scope.scopeKey.includes("production-order"),
    );
    assert.match(
      JSON.stringify(productionScope),
      /father|Aka-Tamenuri|certificate|no affiliate|hypothesis/i,
    );
    const prototypes = pack.scopes.filter(
      (scope) => scope.productionState === "prototype",
    );
    assert.equal(prototypes.length, 2);
    assert.match(JSON.stringify(prototypes), /loaned black prototype/i);
    assert.match(
      JSON.stringify(prototypes),
      /Wancher-supplied black prototype/i,
    );
    const hypothesis = pack.claims.find(
      (claim) => claim.predicate === "author_hypothesis_fewer_urushi_layers",
    );
    assert.equal(hypothesis?.factClass, "editorial");
    assert.ok((hypothesis?.confidence ?? 1) < 1);
    assert.match(
      JSON.stringify(hypothesis),
      /hypothesis|not be promoted|不是确定层数/i,
    );
    assert.ok(
      pack.sources.some(
        (item) =>
          item.url === PHASE113_PRODUCTION_URL &&
          item.summary.includes("no affiliate"),
      ),
    );
    assert.ok(
      pack.sources.some(
        (item) =>
          item.url === PHASE113_PENCILCASE_PROTOTYPE_URL &&
          item.summary.includes("loaned black prototype"),
      ),
    );
    assert.ok(
      pack.sources.some(
        (item) =>
          item.url === PHASE113_ED_JELLEY_PROTOTYPE_URL &&
          item.summary.includes("Wancher-supplied black prototype"),
      ),
    );

    const currentHash = await computePublicationContentHash(
      client,
      PHASE113_AKA_TAMENURI_ID,
    );
    assert.deepEqual(
      await rows(
        client,
        "SELECT review_kind,status,content_hash FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind",
        [PHASE113_AKA_TAMENURI_ID, currentHash],
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
          [PHASE113_AKA_TAMENURI_ID],
        )
      )[0]?.blocker_count,
      0,
    );
    assert.equal(
      (
        await rows(
          client,
          "SELECT count(*) AS n FROM public_entities WHERE id=?",
          [PHASE113_AKA_TAMENURI_ID],
        )
      )[0]?.n,
      1,
    );

    const terminal = await digest(client, PHASE113_AKA_TAMENURI_ID);
    const second = await applyPhase113WancherDreamPenAkaTamenuriContent(
      client,
      { ...options, workspaceRoot: ROOT_CANONICAL },
    );
    assert.deepEqual(
      second.entities.map((item) => item.outcome),
      ["noop"],
    );
    assert.equal(await digest(client, PHASE113_AKA_TAMENURI_ID), terminal);
    await client.execute({
      sql: "DELETE FROM entity_links WHERE source_id=? AND link_type='made_by'",
      args: [PHASE113_AKA_TAMENURI_ID],
    });
    const tampered = await digest(client, PHASE113_AKA_TAMENURI_ID);
    await assert.rejects(
      applyPhase113WancherDreamPenAkaTamenuriContent(client, options),
      /Phase 107 Wancher brand baseline|terminal.*made_by|made_by.*terminal/i,
    );
    assert.equal(await digest(client, PHASE113_AKA_TAMENURI_ID), tampered);
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
    assert.deepEqual(snapshotCatalogFiles(REAL), protectedSnapshot);
  }
}

test("Phase 113 publishes exact True Urushi Aka Tamenuri, replays noop and fails closed", {
  timeout: 60_000,
}, async () => {
  const keepAlive = setInterval(() => undefined, 1_000);
  try {
    await publishAndNoopScenario();
  } finally {
    clearInterval(keepAlive);
  }
});
