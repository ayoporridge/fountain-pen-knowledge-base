import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import { applyPhase104WancherDreamPenNavigationContent } from "../../scripts/apply-phase104-wancher-dream-pen-navigation-content";
import {
  type ApplyPhase107Options,
  applyPhase107WancherDreamPenTrueEboniteMatteBlackContent,
} from "../../scripts/apply-phase107-wancher-dream-pen-true-ebonite-matte-black-content";
import {
  PHASE107_DREAM_ARTICLE_ID,
  PHASE107_TRUE_EBONITE_ID,
  PHASE107_TRUE_EBONITE_SLUG,
  PHASE107_WANCHER_ID,
  phase107WancherPacks,
} from "../../scripts/data/phase107-wancher-dream-pen-true-ebonite-matte-black";
import { loadCuratedEntityPack } from "../../scripts/lib/curated-content-pack";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { getReclassifiedArticlePath } from "../../src/lib/entity-redirects";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

async function rows(client: Client, sql: string, args: string[] = []) {
  return (await client.execute({ sql, args })).rows;
}

async function count(client: Client, sql: string, args: string[] = []) {
  return Number((await rows(client, sql, args))[0]?.value ?? 0);
}

async function articleSummary(client: Client) {
  const id = PHASE107_DREAM_ARTICLE_ID;
  return {
    entity: await rows(client, "SELECT * FROM entities WHERE id=?", [id]),
    stories: await rows(
      client,
      "SELECT * FROM stories WHERE entity_id=? ORDER BY id",
      [id],
    ),
    references: await rows(
      client,
      `SELECT reference.*,item.title,item.url,item.archive_locator
       FROM entity_references reference
       JOIN source_items item ON item.id=reference.source_item_id
       WHERE reference.entity_id=? ORDER BY reference.id`,
      [id],
    ),
    media: await rows(
      client,
      "SELECT * FROM media_assets WHERE entity_id=? ORDER BY id",
      [id],
    ),
    aliases: await rows(
      client,
      "SELECT * FROM entity_aliases WHERE entity_id=? ORDER BY id",
      [id],
    ),
    claims: await rows(
      client,
      "SELECT * FROM claims WHERE subject_entity_id=? ORDER BY id",
      [id],
    ),
    scopes: await rows(
      client,
      "SELECT * FROM fact_scopes WHERE entity_id=? ORDER BY id",
      [id],
    ),
    specs: await rows(
      client,
      "SELECT * FROM model_specs WHERE entity_id=? ORDER BY id",
      [id],
    ),
    variants: await rows(
      client,
      "SELECT * FROM model_variants WHERE model_entity_id=? ORDER BY id",
      [id],
    ),
    conflicts: await rows(
      client,
      "SELECT * FROM fact_conflicts WHERE entity_id=? ORDER BY id",
      [id],
    ),
    timeline: await rows(
      client,
      "SELECT * FROM timeline_events WHERE entity_id=? ORDER BY id",
      [id],
    ),
    publication: await rows(
      client,
      "SELECT * FROM entity_publications WHERE entity_id=?",
      [id],
    ),
    reviews: await rows(
      client,
      "SELECT * FROM entity_content_reviews WHERE entity_id=? ORDER BY review_kind,content_hash",
      [id],
    ),
    links: await rows(
      client,
      "SELECT * FROM entity_links WHERE source_id=? OR target_id=? ORDER BY id",
      [id, id],
    ),
    actions: await rows(
      client,
      "SELECT * FROM taxonomy_actions WHERE source_entity_id=? OR target_entity_id=? ORDER BY id",
      [id, id],
    ),
  };
}

async function mutationSummary(client: Client) {
  return {
    entities: await count(client, "SELECT count(*) AS value FROM entities"),
    target: await rows(
      client,
      "SELECT * FROM entities WHERE id=? OR slug=? ORDER BY id",
      [PHASE107_TRUE_EBONITE_ID, PHASE107_TRUE_EBONITE_SLUG],
    ),
    links: await rows(
      client,
      "SELECT * FROM entity_links WHERE source_id=? OR target_id=? ORDER BY id",
      [PHASE107_TRUE_EBONITE_ID, PHASE107_TRUE_EBONITE_ID],
    ),
    article: await articleSummary(client),
  };
}

async function assertFailClosed(
  client: Client,
  options: ApplyPhase107Options,
  expected: RegExp,
) {
  const before = await mutationSummary(client);
  await assert.rejects(
    applyPhase107WancherDreamPenTrueEboniteMatteBlackContent(client, options),
    expected,
  );
  assert.deepEqual(await mutationSummary(client), before);
}

test("Phase 107 publishes Wancher and exact True Ebonite while preserving the Phase 104 article", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase107-")),
  );
  const outsideRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase107-outside-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase107Options = {
    workspaceRoot: ROOT,
    reviewer: "phase107-test",
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
  const extraClients: Client[] = [];
  try {
    await migrateDatabase(client);
    await applyPhase104WancherDreamPenNavigationContent(client, options);
    const articleBefore = await articleSummary(client);
    const publicPensBefore = await rows(
      client,
      `SELECT pen.id,pen.slug FROM public_entities pen
       JOIN entity_links maker ON maker.source_id=pen.id AND maker.link_type='made_by'
       WHERE maker.target_id=? AND pen.type='pen' ORDER BY pen.id`,
      [PHASE107_WANCHER_ID],
    );

    assert.equal(
      await count(
        client,
        "SELECT count(*) AS value FROM entities WHERE id=? AND type='article' AND slug='wancher-dream-pen'",
        [PHASE107_DREAM_ARTICLE_ID],
      ),
      1,
    );
    assert.equal(
      await count(
        client,
        `SELECT count(*) AS value FROM entities
         WHERE type='pen' AND (id=? OR slug=? OR lower(name) IN (
           lower('Wancher Dream Pen True Ebonite Matte Black'),
           lower('Dream Pen True Ebonite Matte Black'),
           lower('Wancher True Ebonite Matte Black')))`,
        [PHASE107_TRUE_EBONITE_ID, PHASE107_TRUE_EBONITE_SLUG],
      ),
      0,
    );
    assert.equal(
      getReclassifiedArticlePath("pen", "wancher万佳-dream-pen"),
      "/article/wancher-dream-pen",
    );

    await assertFailClosed(
      client,
      {
        ...options,
        env: {
          ...options.env,
          NODE_ENV: options.env?.NODE_ENV ?? "test",
          TURSO_DATABASE_URL: "libsql://remote",
        },
      },
      /refuses inherited remote database selection/,
    );
    await assertFailClosed(
      client,
      { ...options, reviewer: "   " },
      /reviewer must not be empty/,
    );
    await assertFailClosed(
      client,
      { ...options, ownedRoot: outsideRoot },
      /inside the caller-owned root/,
    );
    await assertFailClosed(
      client,
      { ...options, databasePath: REAL },
      /refuses the protected catalog/,
    );

    const protectedStandIn = copyCheckpointedCatalogToDisposableCopy(
      REAL,
      path.join(outsideRoot, "protected-stand-in.db"),
      outsideRoot,
      { expectedSourceSnapshot: protectedSnapshot },
    );
    const hardLinkPath = path.join(ownedRoot, "protected-hard-link.db");
    fs.linkSync(protectedStandIn.destinationPath, hardLinkPath);
    const hardLinkClient = createClient({ url: `file:${hardLinkPath}` });
    extraClients.push(hardLinkClient);
    await assert.rejects(
      applyPhase107WancherDreamPenTrueEboniteMatteBlackContent(hardLinkClient, {
        ...options,
        databasePath: hardLinkPath,
        protectedCatalogPath: protectedStandIn.destinationPath,
        protectedCatalogSnapshot: snapshotCatalogFiles(
          protectedStandIn.destinationPath,
        ),
      }),
      /hard-link alias/,
    );

    const symlinkPath = path.join(ownedRoot, "catalog-link.db");
    fs.symlinkSync(copy.destinationPath, symlinkPath);
    await assertFailClosed(
      client,
      { ...options, databasePath: symlinkPath },
      /non-symlink catalog file/,
    );

    const mismatchCopy = copyCheckpointedCatalogToDisposableCopy(
      REAL,
      path.join(ownedRoot, "client-mismatch.db"),
      ownedRoot,
      { expectedSourceSnapshot: protectedSnapshot },
    );
    await assertFailClosed(
      client,
      { ...options, databasePath: mismatchCopy.destinationPath },
      /client is not bound/,
    );

    const unmigratedCopy = copyCheckpointedCatalogToDisposableCopy(
      REAL,
      path.join(ownedRoot, "unmigrated.db"),
      ownedRoot,
      { expectedSourceSnapshot: protectedSnapshot },
    );
    const unmigratedClient = createClient({
      url: `file:${unmigratedCopy.destinationPath}`,
    });
    extraClients.push(unmigratedClient);
    const unmigratedCount = await count(
      unmigratedClient,
      "SELECT count(*) AS value FROM entities",
    );
    await assert.rejects(
      applyPhase107WancherDreamPenTrueEboniteMatteBlackContent(
        unmigratedClient,
        { ...options, databasePath: unmigratedCopy.destinationPath },
      ),
      /must be migrated through 032/,
    );
    assert.equal(
      await count(unmigratedClient, "SELECT count(*) AS value FROM entities"),
      unmigratedCount,
    );

    await client.execute({
      sql: "INSERT INTO entities(id,type,slug,name) VALUES('phase107-collision','pen','phase107-collision','Dream Pen True Ebonite Matte Black')",
      args: [],
    });
    await assertFailClosed(client, options, /alternate identity or collision/);
    await client.execute("DELETE FROM entities WHERE id='phase107-collision'");

    await client.execute({
      sql: "UPDATE entities SET slug='wancher-wrong' WHERE id=?",
      args: [PHASE107_WANCHER_ID],
    });
    await assertFailClosed(
      client,
      options,
      /exact existing Wancher brand identity/,
    );
    await client.execute({
      sql: "UPDATE entities SET slug='wancher' WHERE id=?",
      args: [PHASE107_WANCHER_ID],
    });
    const wrongArticleCopy = copyCheckpointedCatalogToDisposableCopy(
      REAL,
      path.join(ownedRoot, "wrong-article.db"),
      ownedRoot,
      { expectedSourceSnapshot: protectedSnapshot },
    );
    const wrongArticleClient = createClient({
      url: `file:${wrongArticleCopy.destinationPath}`,
    });
    extraClients.push(wrongArticleClient);
    const wrongArticleOptions = {
      ...options,
      databasePath: wrongArticleCopy.destinationPath,
    };
    await migrateDatabase(wrongArticleClient);
    await applyPhase104WancherDreamPenNavigationContent(
      wrongArticleClient,
      wrongArticleOptions,
    );
    await wrongArticleClient.execute({
      sql: "UPDATE entities SET type='pen' WHERE id=?",
      args: [PHASE107_DREAM_ARTICLE_ID],
    });
    await assertFailClosed(
      wrongArticleClient,
      wrongArticleOptions,
      /Phase 104 Dream Pen article identity/,
    );

    const first =
      await applyPhase107WancherDreamPenTrueEboniteMatteBlackContent(
        client,
        options,
      );
    assert.deepEqual(
      first.entities.map((entity) => [entity.entityId, entity.outcome]),
      [
        [PHASE107_WANCHER_ID, "published"],
        [PHASE107_TRUE_EBONITE_ID, "published"],
      ],
    );

    const loaded = phase107WancherPacks.map((pack) =>
      loadCuratedEntityPack(ROOT, pack),
    );
    for (const pack of loaded) {
      assert.ok(Array.from(pack.summary).length >= 60);
      assert.ok(Array.from(pack.summary).length <= 160);
      assert.ok(Array.from(pack.bodyMd).length >= 2_000);
      assert.ok(pack.claims.some((claim) => claim.factClass === "core"));
      assert.ok(
        new Set(
          pack.sources
            .filter((source) => source.itemType !== "image")
            .map((source) => source.independenceGroup),
        ).size >= 2,
      );
    }
    assert.match(loaded[1]?.bodyMd ?? "", /\/article\/wancher-dream-pen/);
    assert.doesNotMatch(
      JSON.stringify(phase107WancherPacks),
      /Titanium Black|titanium-black/i,
    );

    assert.deepEqual(await articleSummary(client), articleBefore);
    assert.equal(
      await count(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
        [PHASE107_TRUE_EBONITE_ID, PHASE107_WANCHER_ID],
      ),
      1,
    );
    assert.equal(
      await count(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
        [PHASE107_WANCHER_ID, PHASE107_TRUE_EBONITE_ID],
      ),
      1,
    );
    assert.equal(
      await count(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND link_type='made_by'",
        [PHASE107_TRUE_EBONITE_ID],
      ),
      1,
    );
    assert.equal(
      await count(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE target_id=? AND link_type='reverse'",
        [PHASE107_TRUE_EBONITE_ID],
      ),
      1,
    );
    assert.equal(
      await count(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE (source_id=? OR target_id=?) AND link_type IN ('made_by','reverse')",
        [PHASE107_DREAM_ARTICLE_ID, PHASE107_DREAM_ARTICLE_ID],
      ),
      0,
    );

    const publicPensAfter = await rows(
      client,
      `SELECT pen.id,pen.slug FROM public_entities pen
       JOIN entity_links maker ON maker.source_id=pen.id AND maker.link_type='made_by'
       WHERE maker.target_id=? AND pen.type='pen' ORDER BY pen.id`,
      [PHASE107_WANCHER_ID],
    );
    assert.deepEqual(
      publicPensAfter,
      [
        ...publicPensBefore,
        { id: PHASE107_TRUE_EBONITE_ID, slug: PHASE107_TRUE_EBONITE_SLUG },
      ].sort((left, right) => String(left.id).localeCompare(String(right.id))),
    );

    const publication = await rows(
      client,
      `SELECT publication.entity_id,publication.status,
              publication.approved_content_hash,publication.content_revision,
              publication.reviewed_content_revision,
              publication.reviewed_contract_version,
              readiness.publishable,readiness.blocker_count
       FROM entity_publications publication
       JOIN public_entity_readiness readiness
         ON readiness.entity_id=publication.entity_id AND readiness.contract_version=3
       WHERE publication.entity_id IN (?,?) ORDER BY publication.entity_id`,
      [PHASE107_WANCHER_ID, PHASE107_TRUE_EBONITE_ID],
    );
    assert.equal(publication.length, 2);
    for (const row of publication) {
      assert.equal(String(row.status), "published");
      assert.equal(
        Number(row.content_revision),
        Number(row.reviewed_content_revision),
      );
      assert.equal(Number(row.reviewed_contract_version), 3);
      assert.equal(Number(row.publishable), 1);
      assert.equal(Number(row.blocker_count), 0);
      assert.match(
        String(row.approved_content_hash),
        /^sha256:v3:[a-f0-9]{64}$/,
      );
      const reviews = await rows(
        client,
        `SELECT review_kind,count(*) AS total FROM entity_content_reviews
         WHERE entity_id=? AND content_hash=? AND status='approved'
         GROUP BY review_kind ORDER BY review_kind`,
        [String(row.entity_id), String(row.approved_content_hash)],
      );
      assert.deepEqual(
        reviews.map((review) => String(review.review_kind)),
        ["fact", "language", "media", "publication"],
      );
    }

    const scopes = await rows(
      client,
      `SELECT scope_key,production_state,nib_scope,material_scope,edition_scope
       FROM fact_scopes WHERE entity_id=? ORDER BY scope_key`,
      [PHASE107_TRUE_EBONITE_ID],
    );
    assert.equal(scopes.length, 2);
    const current = scopes.find(
      (scope) => String(scope.production_state) === "current",
    );
    const historical = scopes.find(
      (scope) => String(scope.production_state) === "historical",
    );
    assert.match(String(current?.nib_scope), /JoWo/);
    assert.match(String(current?.material_scope), /Matte Sandblast/);
    assert.match(String(current?.edition_scope), /clip/);
    assert.doesNotMatch(String(current?.nib_scope), /fine|supplied sample/i);
    assert.doesNotMatch(
      String(current?.edition_scope),
      /cross-thread|supplied sample/i,
    );
    assert.match(String(historical?.material_scope), /polished/i);
    assert.match(String(historical?.material_scope), /supplied sample/i);
    assert.match(String(historical?.nib_scope), /JoWo fine/i);
    assert.match(String(historical?.nib_scope), /supplied sample/i);
    assert.match(
      String(historical?.edition_scope),
      /slip-seal[\s\S]*受测样品/i,
    );
    const conflict = await rows(
      client,
      "SELECT field_key,status,resolution_note FROM fact_conflicts WHERE entity_id=?",
      [PHASE107_TRUE_EBONITE_ID],
    );
    assert.equal(conflict.length, 1);
    assert.equal(String(conflict[0]?.status), "resolved");
    assert.match(String(conflict[0]?.resolution_note), /时间／样品 scope/);
    const spec = await rows(
      client,
      "SELECT price_range,material,fill_system,nib,status FROM model_specs WHERE entity_id=?",
      [PHASE107_TRUE_EBONITE_ID],
    );
    assert.equal(spec[0]?.price_range, null);
    assert.match(
      JSON.stringify(spec[0]),
      /Matte Sandblast[\s\S]*European International/,
    );
    assert.doesNotMatch(
      JSON.stringify(spec[0]),
      /\$|175|230|polished|库存.*有货/i,
    );

    const beforeReplay = await mutationSummary(client);
    const replay =
      await applyPhase107WancherDreamPenTrueEboniteMatteBlackContent(
        client,
        options,
      );
    assert.deepEqual(
      replay.entities.map((entity) => entity.outcome),
      ["noop", "noop"],
    );
    assert.deepEqual(await mutationSummary(client), beforeReplay);
    assertCatalogSnapshotUnchanged(protectedSnapshot);
  } finally {
    client.close();
    for (const extra of extraClients) extra.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
    fs.rmSync(outsideRoot, { recursive: true, force: true });
  }
});
