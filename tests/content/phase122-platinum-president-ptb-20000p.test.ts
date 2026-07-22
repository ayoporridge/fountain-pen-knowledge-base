import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import { applyPhase42LamyPlatinumContent } from "../../scripts/apply-phase42-lamy-platinum-content";
import { applyPhase78PlatinumCuridasContent } from "../../scripts/apply-phase78-platinum-curidas-content";
import { applyPhase121PlatinumProcyonContent } from "../../scripts/apply-phase121-platinum-procyon-pns-5000-content";
import {
  type ApplyPhase122Options,
  applyPhase122PlatinumPresidentContent,
} from "../../scripts/apply-phase122-platinum-president-ptb-20000p-content";
import {
  loadPhase122PlatinumPresidentPack,
  PHASE122_BRAND_SCOPE,
  PHASE122_BRAND_URL,
  PHASE122_CATALOG_SCOPE,
  PHASE122_CATALOG_URL,
  PHASE122_CURIDAS_ID,
  PHASE122_CURRENT_SCOPE,
  PHASE122_CURRENT_VARIANTS,
  PHASE122_LEGACY_ALIASES,
  PHASE122_LENSKY_SCOPE,
  PHASE122_LENSKY_URL,
  PHASE122_PENHERO_SCOPE,
  PHASE122_PENHERO_URL,
  PHASE122_PLATINUM_3776_ID,
  PHASE122_PLATINUM_BRAND_ID,
  PHASE122_PRESIDENT_ID,
  PHASE122_PRESIDENT_NAME,
  PHASE122_PRESIDENT_SLUG,
  PHASE122_PROCYON_ID,
  PHASE122_PRODUCT_URL,
  PHASE122_RAW_NAME,
  PHASE122_RAW_SLUG,
} from "../../scripts/data/phase122-platinum-president-ptb-20000p";
import { curatedId } from "../../scripts/lib/curated-content-pack";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT_ALIAS = "/Users/xz/CodeBuddy/fountain-pen-graph";
const ROOT_CANONICAL = "/Users/xz/Documents/fountain-pen-graph";
const REAL = path.join(ROOT_CANONICAL, "data", "fpkg.db");

async function rows(client: Client, sql: string, args: unknown[] = []) {
  return (await client.execute({ sql, args: args as never[] })).rows.map(
    (row) => ({ ...row }),
  );
}
async function scalar(client: Client, sql: string, args: unknown[] = []) {
  return Number(
    (await client.execute({ sql, args: args as never[] })).rows[0]?.value ?? 0,
  );
}
async function digest(client: Client, entityId: string) {
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
    "SELECT * FROM entity_links WHERE source_id=? OR target_id=? ORDER BY id",
    "SELECT * FROM entity_publications WHERE entity_id=?",
    "SELECT * FROM entity_content_reviews WHERE entity_id=? ORDER BY review_kind,content_hash",
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
async function ownedDigest(client: Client) {
  const tables = [
    "entities",
    "entity_aliases",
    "entity_references",
    "source_items",
    "entity_links",
    "entity_redirects",
    "fact_scopes",
    "claims",
    "claim_evidence",
    "model_specs",
    "model_variants",
    "spec_field_evidence",
    "media_assets",
    "entity_publications",
    "entity_content_reviews",
  ];
  return createHash("sha256")
    .update(
      JSON.stringify(
        await Promise.all(
          tables.map((table) =>
            rows(client, `SELECT * FROM ${table} ORDER BY 1`),
          ),
        ),
      ),
    )
    .digest("hex");
}

test("Phase 122 reclassifies the same President ID with exact evidence boundaries and protected topology", {
  timeout: 240_000,
}, async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase122-president-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase122Options = {
    workspaceRoot: ROOT_ALIAS,
    reviewer: "phase122-president-test",
    databasePath: copy.destinationPath,
    ownedRoot,
    protectedCatalogPath: REAL,
    protectedCatalogSnapshot: protectedSnapshot,
    env: {
      ...process.env,
      TURSO_DATABASE_URL: "",
      TURSO_AUTH_TOKEN: "",
      FPKG_DATABASE_URL: "",
    },
  };
  try {
    await migrateDatabase(client);
    await applyPhase42LamyPlatinumContent(client, options);
    await applyPhase78PlatinumCuridasContent(client, options);
    await applyPhase121PlatinumProcyonContent(client, options);

    const pack = loadPhase122PlatinumPresidentPack(ROOT_ALIAS);
    assert.equal(pack.entityId, PHASE122_PRESIDENT_ID);
    assert.equal(pack.expectedSlug, PHASE122_PRESIDENT_SLUG);
    assert.equal(pack.canonicalName, PHASE122_PRESIDENT_NAME);
    assert.ok(
      Array.from(pack.summary).length >= 60 &&
        Array.from(pack.summary).length <= 160,
    );
    assert.ok(Array.from(pack.bodyMd).length >= 2_000);
    for (const boundary of [
      "当前产品页",
      "品牌页",
      "2019–2020",
      "PenHero",
      "调整后",
      "EF／UEF",
    ])
      assert.match(pack.bodyMd, new RegExp(boundary));
    assert.deepEqual(
      pack.variants?.map((variant) => variant.name),
      [...PHASE122_CURRENT_VARIANTS],
    );
    assert.deepEqual(
      pack.scopes.map((scope) => scope.scopeKey),
      [
        PHASE122_CURRENT_SCOPE,
        PHASE122_BRAND_SCOPE,
        PHASE122_CATALOG_SCOPE,
        PHASE122_PENHERO_SCOPE,
        PHASE122_LENSKY_SCOPE,
      ],
    );
    for (const url of [
      PHASE122_PRODUCT_URL,
      PHASE122_BRAND_URL,
      PHASE122_CATALOG_URL,
      PHASE122_PENHERO_URL,
      PHASE122_LENSKY_URL,
    ])
      assert.ok(pack.sources.some((source) => source.url === url));
    assert.equal(
      new Set(
        pack.sources
          .filter((source) => source.sourceType === "official")
          .map((source) => source.independenceGroup),
      ).size,
      1,
    );
    const penhero = pack.sources.find(
      (source) => source.url === PHASE122_PENHERO_URL,
    );
    assert.deepEqual(
      [penhero?.author, penhero?.publishedAt],
      ["Jim Mamoulides", "2025-10-31"],
    );
    assert.match(penhero?.summary ?? "", /uncertain|not written/i);
    const lensky = pack.sources.find(
      (source) => source.url === PHASE122_LENSKY_URL,
    );
    assert.deepEqual(
      [lensky?.author, lensky?.publishedAt],
      ["Andrew Lensky", "2023-03"],
    );
    assert.match(lensky?.summary ?? "", /EF and UEF inconsistently|adjusted/i);
    assert.ok(
      (pack.spec?.evidence ?? []).filter((item) => item.qualifies === false)
        .length >= 12,
    );
    for (const token of [
      "PTB-25000PR",
      "PTB-28000P",
      "PTW-15000P",
      "EF/UEF",
      "writing",
    ])
      assert.ok(
        (pack.spec?.evidence ?? []).some(
          (item) => item.qualifies === false && item.locator.includes(token),
        ),
      );

    const svgPath = path.join(
      ROOT_CANONICAL,
      "public/images/library/site-original/phase122/platinum/platinum-president-ptb-20000p.svg",
    );
    const svg = fs.readFileSync(svgPath, "utf8");
    assert.match(svg, /width="1600" height="900"/);
    for (const token of [
      "site-original",
      "non-photo",
      "non-logo",
      "not-to-scale",
      "not-colour-proof",
      "not-finish-proof",
      "CURRENT PRODUCT",
      "BRAND DOCUMENT",
      "DATED HISTORY",
      "ADJUSTED SAMPLE",
    ])
      assert.match(svg, new RegExp(token));
    const svgHash = createHash("sha256").update(svg).digest("hex");
    for (const localPath of fs
      .readdirSync(
        path.join(ROOT_CANONICAL, "public/images/library/site-original"),
        { recursive: true },
      )
      .filter((entry) => String(entry).endsWith(".svg"))
      .map(String)) {
      const candidate = path.join(
        ROOT_CANONICAL,
        "public/images/library/site-original",
        localPath,
      );
      if (candidate !== svgPath)
        assert.notEqual(
          createHash("sha256").update(fs.readFileSync(candidate)).digest("hex"),
          svgHash,
        );
    }

    const raw = (
      await rows(
        client,
        "SELECT id,type,slug,name,summary,body_md FROM entities WHERE id=?",
        [PHASE122_PRESIDENT_ID],
      )
    )[0];
    assert.deepEqual(
      [raw?.id, raw?.type, raw?.slug, raw?.name],
      [PHASE122_PRESIDENT_ID, "pen", PHASE122_RAW_SLUG, PHASE122_RAW_NAME],
    );
    assert.equal(Array.from(String(raw?.summary)).length, 92);
    assert.equal(Array.from(String(raw?.body_md)).length, 173);
    const aliasesBefore = await rows(
      client,
      "SELECT id,alias,language FROM entity_aliases WHERE entity_id=? ORDER BY id",
      [PHASE122_PRESIDENT_ID],
    );
    assert.deepEqual(
      aliasesBefore.map((row) => [row.id, row.alias]),
      [
        [
          "alias-a1t4DNomp4Ge-en-Platinum President",
          PHASE122_LEGACY_ALIASES[0],
        ],
        [
          "alias-a1t4DNomp4Ge-zh-白金 总统 President",
          PHASE122_LEGACY_ALIASES[1],
        ],
      ],
    );
    const linksBefore = await rows(
      client,
      "SELECT id,source_id,target_id,link_type,reason FROM entity_links WHERE source_id=? OR target_id=? ORDER BY id",
      [PHASE122_PRESIDENT_ID, PHASE122_PRESIDENT_ID],
    );
    assert.deepEqual(
      linksBefore.map((row) => [row.id, row.link_type, row.reason]),
      [
        ["CQFuH9Ba8VV6", "made_by", null],
        ["rev-CQFuH9Ba8VV6", "reverse", null],
      ],
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM stories WHERE id='story-model-platinum-president-research' AND entity_id=?",
        [PHASE122_PRESIDENT_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM model_specs WHERE id='spec-platinum-president-research' AND entity_id=?",
        [PHASE122_PRESIDENT_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM claims WHERE id='claim-platinum-president-source-boundary' AND subject_entity_id=?",
        [PHASE122_PRESIDENT_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_references WHERE id='reference-model-gap-a1t4DNomp4Ge-source-platinum-president-public-search' AND entity_id=?",
        [PHASE122_PRESIDENT_ID],
      ),
      1,
    );

    for (const changed of [
      { ...options, reviewer: "" },
      { ...options, workspaceRoot: ownedRoot },
      {
        ...options,
        env: {
          ...options.env,
          FPKG_DATABASE_URL: "file:remote",
        } as NodeJS.ProcessEnv,
      },
      { ...options, databasePath: REAL },
    ]) {
      const before = await ownedDigest(client);
      await assert.rejects(
        applyPhase122PlatinumPresidentContent(client, changed),
      );
      assert.equal(await ownedDigest(client), before);
    }
    await client.execute({
      sql: "UPDATE entities SET name='tampered raw President' WHERE id=?",
      args: [PHASE122_PRESIDENT_ID],
    });
    const alternateRaw = await ownedDigest(client);
    await assert.rejects(
      applyPhase122PlatinumPresidentContent(client, options),
      /partial or alternate|alternate President identity/,
    );
    assert.equal(await ownedDigest(client), alternateRaw);
    await client.execute({
      sql: "UPDATE entities SET name=? WHERE id=?",
      args: [PHASE122_RAW_NAME, PHASE122_PRESIDENT_ID],
    });

    const protectedBefore = new Map<string, string>();
    for (const id of [
      PHASE122_PLATINUM_BRAND_ID,
      PHASE122_PLATINUM_3776_ID,
      PHASE122_CURIDAS_ID,
      PHASE122_PROCYON_ID,
    ])
      protectedBefore.set(id, await digest(client, id));
    const first = await applyPhase122PlatinumPresidentContent(client, options);
    assert.deepEqual(
      first.entities.map((entity) => [entity.entityId, entity.outcome]),
      [[PHASE122_PRESIDENT_ID, "published"]],
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entities WHERE id=? AND slug=? AND name=?",
        [
          PHASE122_PRESIDENT_ID,
          PHASE122_PRESIDENT_SLUG,
          PHASE122_PRESIDENT_NAME,
        ],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entities WHERE id<>? AND (lower(name) LIKE '%president%' OR lower(name) LIKE '%ptb-20000p%')",
        [PHASE122_PRESIDENT_ID],
      ),
      0,
    );
    assert.deepEqual(
      (
        await rows(
          client,
          "SELECT variant_name FROM model_variants WHERE model_entity_id=? ORDER BY variant_name",
          [PHASE122_PRESIDENT_ID],
        )
      ).map((row) => row.variant_name),
      [...PHASE122_CURRENT_VARIANTS].sort(),
    );
    assert.deepEqual(
      (
        await rows(
          client,
          "SELECT alias FROM entity_aliases WHERE entity_id=? ORDER BY alias",
          [PHASE122_PRESIDENT_ID],
        )
      ).map((row) => row.alias),
      ["Platinum President", PHASE122_RAW_NAME, "白金 总统 President"],
    );
    assert.deepEqual(
      await rows(
        client,
        "SELECT source_path,target_path,redirect_kind FROM entity_redirects WHERE source_path=?",
        [`/pen/${PHASE122_RAW_SLUG}`],
      ),
      [
        {
          source_path: `/pen/${PHASE122_RAW_SLUG}`,
          target_path: `/pen/${PHASE122_PRESIDENT_SLUG}`,
          redirect_kind: "permanent",
        },
      ],
    );
    assert.deepEqual(
      await rows(
        client,
        "SELECT id,source_id,target_id,link_type,reason FROM entity_links WHERE source_id=? OR target_id=? ORDER BY id",
        [PHASE122_PRESIDENT_ID, PHASE122_PRESIDENT_ID],
      ),
      linksBefore,
    );
    for (const [id, before] of protectedBefore)
      assert.equal(await digest(client, id), before);
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_content_reviews WHERE entity_id=? AND content_hash=? AND status='approved' AND review_kind IN ('fact','language','media','publication')",
        [PHASE122_PRESIDENT_ID, first.entities[0]?.contentHash],
      ),
      4,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_content_reviews WHERE entity_id=? AND created_at >= (SELECT min(created_at) FROM entity_content_reviews WHERE entity_id=?)",
        [PHASE122_PLATINUM_BRAND_ID, PHASE122_PRESIDENT_ID],
      ),
      0,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_references WHERE entity_id=? AND source_item_id IN (?,?,?)",
        [
          PHASE122_PRESIDENT_ID,
          "source-platinum-president-public-search",
          "source-commerce-pensachi-567ce8ec0fcec5",
          curatedId("source-item", "phase122-platinum-president-product"),
        ],
      ),
      1,
    );

    const terminalDigest = await ownedDigest(client);
    const replay = await applyPhase122PlatinumPresidentContent(client, options);
    assert.deepEqual(
      replay.entities.map((entity) => entity.outcome),
      ["noop"],
    );
    assert.equal(await ownedDigest(client), terminalDigest);

    const fakeId = "phase122-president-source-owner-tamper";
    await client.execute({
      sql: "INSERT INTO entities(id,type,slug,name) VALUES(?,'pen',?,?)",
      args: [fakeId, fakeId, "President source owner tamper"],
    });
    await client.execute({
      sql: "INSERT INTO entity_references(id,entity_id,source_item_id,relation_type,note,review_status) VALUES(?,?,?,?,?,'approved')",
      args: [
        `${fakeId}-reference`,
        fakeId,
        curatedId("source-item", "phase122-platinum-president-product"),
        "official",
        "tamper",
      ],
    });
    const ownerTamper = await ownedDigest(client);
    await assert.rejects(
      applyPhase122PlatinumPresidentContent(client, options),
      /alternate President identity or source owner/,
    );
    assert.equal(await ownedDigest(client), ownerTamper);
    await client.execute({
      sql: "DELETE FROM entity_references WHERE entity_id=?",
      args: [fakeId],
    });
    await client.execute({
      sql: "DELETE FROM entities WHERE id=?",
      args: [fakeId],
    });

    await client.execute({
      sql: "UPDATE entity_redirects SET target_path='/pen/tampered' WHERE source_path=?",
      args: [`/pen/${PHASE122_RAW_SLUG}`],
    });
    const redirectTamper = await ownedDigest(client);
    await assert.rejects(
      applyPhase122PlatinumPresidentContent(client, options),
      /terminal redirect is invalid/,
    );
    assert.equal(await ownedDigest(client), redirectTamper);
    await client.execute({
      sql: "UPDATE entity_redirects SET target_path=? WHERE source_path=?",
      args: [`/pen/${PHASE122_PRESIDENT_SLUG}`, `/pen/${PHASE122_RAW_SLUG}`],
    });

    await client.execute({
      sql: "UPDATE entities SET source='tampered-marker' WHERE id=?",
      args: [PHASE122_PRESIDENT_ID],
    });
    const markerTamper = await ownedDigest(client);
    await assert.rejects(
      applyPhase122PlatinumPresidentContent(client, options),
      /partial or alternate/,
    );
    assert.equal(await ownedDigest(client), markerTamper);
    await client.execute({
      sql: "UPDATE entities SET source=? WHERE id=?",
      args: [pack.sourceMarker, PHASE122_PRESIDENT_ID],
    });

    await client.execute({
      sql: "UPDATE entity_aliases SET alias='tampered alias' WHERE entity_id=? AND alias=?",
      args: [PHASE122_PRESIDENT_ID, PHASE122_RAW_NAME],
    });
    const aliasTamper = await ownedDigest(client);
    await assert.rejects(
      applyPhase122PlatinumPresidentContent(client, options),
      /terminal identity\/source\/publication state is invalid|terminal aliases are invalid/,
    );
    assert.equal(await ownedDigest(client), aliasTamper);
    await client.execute({
      sql: "UPDATE entity_aliases SET alias=? WHERE entity_id=? AND alias='tampered alias'",
      args: [PHASE122_RAW_NAME, PHASE122_PRESIDENT_ID],
    });

    await client.execute({
      sql: "UPDATE media_assets SET usage_status='candidate' WHERE entity_id=?",
      args: [PHASE122_PRESIDENT_ID],
    });
    const mediaTamper = await ownedDigest(client);
    await assert.rejects(
      applyPhase122PlatinumPresidentContent(client, options),
      /terminal .*invalid|publication state is invalid/,
    );
    assert.equal(await ownedDigest(client), mediaTamper);
    await client.execute({
      sql: "UPDATE media_assets SET usage_status='primary' WHERE entity_id=?",
      args: [PHASE122_PRESIDENT_ID],
    });

    await client.execute({
      sql: "UPDATE entity_content_reviews SET status='rejected' WHERE entity_id=? AND review_kind='media' AND content_hash=?",
      args: [PHASE122_PRESIDENT_ID, first.entities[0]?.contentHash],
    });
    const reviewTamper = await ownedDigest(client);
    await assert.rejects(
      applyPhase122PlatinumPresidentContent(client, options),
      /terminal .*invalid/,
    );
    assert.equal(await ownedDigest(client), reviewTamper);
    await client.execute({
      sql: "UPDATE entity_content_reviews SET status='approved' WHERE entity_id=? AND review_kind='media' AND content_hash=?",
      args: [PHASE122_PRESIDENT_ID, first.entities[0]?.contentHash],
    });

    await client.execute({
      sql: "DELETE FROM model_variants WHERE model_entity_id=? AND variant_name=?",
      args: [PHASE122_PRESIDENT_ID, PHASE122_CURRENT_VARIANTS[0]],
    });
    const tampered = await ownedDigest(client);
    await assert.rejects(
      applyPhase122PlatinumPresidentContent(client, options),
      /terminal .*invalid|current variant set is invalid/,
    );
    assert.equal(await ownedDigest(client), tampered);
    assertCatalogSnapshotUnchanged(protectedSnapshot);
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assert.deepEqual(snapshotCatalogFiles(REAL), protectedSnapshot);
});
