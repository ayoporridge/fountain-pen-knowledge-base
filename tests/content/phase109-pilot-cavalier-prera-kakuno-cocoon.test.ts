import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import { applyCuratedContentPacks } from "../../scripts/apply-phase22-content";
import {
  type ApplyPhase109Options,
  applyPhase109PilotDailyContent,
  PHASE109_CAVALIER_ID,
  PHASE109_CAVALIER_RAW_SLUG,
  PHASE109_CAVALIER_SLUG,
  PHASE109_COCOON_ID,
  PHASE109_COCOON_RAW_SLUG,
  PHASE109_COCOON_SLUG,
  PHASE109_KAKUNO_ID,
  PHASE109_KAKUNO_RAW_SLUG,
  PHASE109_KAKUNO_SLUG,
  PHASE109_PILOT_ID,
  PHASE109_PRERA_ID,
  PHASE109_PRERA_RAW_SLUG,
  PHASE109_PRERA_SLUG,
} from "../../scripts/apply-phase109-pilot-cavalier-prera-kakuno-cocoon-content";
import {
  phase84PlatinumPilotP0V3BrandPacks,
  phase84PlatinumPilotP0V3Packs,
} from "../../scripts/data/phase84-platinum-pilot-p0-v3";
import { loadPhase109PilotDailyPacks } from "../../scripts/data/phase109-pilot-cavalier-prera-kakuno-cocoon";
import {
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { computePublicationContentHash } from "../../src/lib/publication";

const ROOT = "/Users/xz/CodeBuddy/fountain-pen-graph";
const REAL = path.join(ROOT, "data", "fpkg.db");
const TARGET_IDS = [
  PHASE109_CAVALIER_ID,
  PHASE109_PRERA_ID,
  PHASE109_KAKUNO_ID,
  PHASE109_COCOON_ID,
];
const TARGET_RAW_SLUGS = [
  PHASE109_CAVALIER_RAW_SLUG,
  PHASE109_PRERA_RAW_SLUG,
  PHASE109_KAKUNO_RAW_SLUG,
  PHASE109_COCOON_RAW_SLUG,
];

async function rows(client: Client, sql: string, args: unknown[] = []) {
  const result = await client.execute({ sql, args: args as never[] });
  return result.rows.map((row) => ({ ...row }));
}

async function optionalRows(client: Client, sql: string, args: unknown[] = []) {
  try {
    return await rows(client, sql, args);
  } catch (error) {
    if (error instanceof Error && /no such table/.test(error.message))
      return [];
    throw error;
  }
}

async function databaseSummary(client: Client) {
  return {
    entities: await rows(
      client,
      "SELECT id,type,slug,name,source FROM entities WHERE id IN (?,?,?,?) ORDER BY id",
      TARGET_IDS,
    ),
    makers: await rows(
      client,
      "SELECT id,source_id,target_id,link_type,reason FROM entity_links WHERE source_id IN (?,?,?,?) ORDER BY id",
      TARGET_IDS,
    ),
    redirects: await optionalRows(
      client,
      "SELECT source_path,target_path,redirect_kind FROM entity_redirects WHERE source_path IN (?,?,?,?) ORDER BY source_path",
      TARGET_RAW_SLUGS.map((slug) => `/pen/${slug}`),
    ),
    publications: await rows(
      client,
      "SELECT entity_id,status,content_revision,reviewed_content_revision,approved_content_hash FROM entity_publications WHERE entity_id IN (?,?,?,?) ORDER BY entity_id",
      TARGET_IDS,
    ),
  };
}

async function brandSummary(client: Client) {
  const hash = await computePublicationContentHash(client, PHASE109_PILOT_ID);
  return {
    entity: await rows(
      client,
      "SELECT id,type,slug,name,summary,body_md,source FROM entities WHERE id=?",
      [PHASE109_PILOT_ID],
    ),
    stories: await rows(
      client,
      "SELECT id,title,summary,body_md,status,source_notes FROM stories WHERE entity_id=? ORDER BY id",
      [PHASE109_PILOT_ID],
    ),
    references: await rows(
      client,
      "SELECT id,source_item_id,relation_type,note,review_status FROM entity_references WHERE entity_id=? ORDER BY id",
      [PHASE109_PILOT_ID],
    ),
    media: await rows(
      client,
      "SELECT id,local_path,source_item_id,review_status,usage_status FROM media_assets WHERE entity_id=? ORDER BY id",
      [PHASE109_PILOT_ID],
    ),
    reviews: await rows(
      client,
      "SELECT review_kind,content_hash,status,reviewer,reviewed_at,note FROM entity_content_reviews WHERE entity_id=? ORDER BY review_kind,content_hash",
      [PHASE109_PILOT_ID],
    ),
    publication: await rows(
      client,
      "SELECT status,depth_tier,blockers_json,approved_content_hash,content_revision,reviewed_content_revision,reviewed_contract_version,reviewed_by,reviewed_at,published_at,review_notes FROM entity_publications WHERE entity_id=?",
      [PHASE109_PILOT_ID],
    ),
    hash,
  };
}

async function nonTargetPilotSummary(client: Client) {
  return rows(
    client,
    `SELECT entity.id,entity.slug,entity.name,entity.source,
            publication.status,publication.content_revision,
            publication.approved_content_hash,
            CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public
     FROM entity_links maker
     JOIN entities entity ON entity.id=maker.source_id
     JOIN entity_publications publication ON publication.entity_id=entity.id
     LEFT JOIN public_entities public ON public.id=entity.id
     WHERE maker.link_type='made_by' AND maker.target_id=?
       AND entity.id NOT IN (?,?,?,?)
     ORDER BY entity.id`,
    [PHASE109_PILOT_ID, ...TARGET_IDS],
  );
}

async function publicReverse(client: Client) {
  return rows(
    client,
    `SELECT entity.id,entity.slug
     FROM entity_links maker
     JOIN entities entity ON entity.id=maker.source_id
     JOIN public_entities public ON public.id=entity.id
     WHERE maker.link_type='made_by' AND maker.target_id=?
     ORDER BY entity.id`,
    [PHASE109_PILOT_ID],
  );
}

async function preparePublishedPilotBrand(
  client: Client,
  options: ApplyPhase109Options,
) {
  const brand = phase84PlatinumPilotP0V3BrandPacks.find(
    (pack) => pack.entityId === PHASE109_PILOT_ID,
  );
  const pen = phase84PlatinumPilotP0V3Packs.find(
    (pack) => pack.spec?.brandEntityId === PHASE109_PILOT_ID,
  );
  assert.ok(brand && pen, "Phase 84 Pilot fixture packs must exist");
  await client.execute({
    sql: "INSERT OR IGNORE INTO entities(id,type,slug,name) VALUES(?,'pen',?,?)",
    args: [pen.entityId, pen.expectedSlug, pen.canonicalName],
  });
  await client.execute({
    sql: "UPDATE entities SET type='pen',slug=?,name=? WHERE id=?",
    args: [pen.expectedSlug, pen.canonicalName, pen.entityId],
  });
  await client.execute({
    sql: "DELETE FROM entity_links WHERE source_id=? AND link_type='made_by'",
    args: [pen.entityId],
  });
  await client.execute({
    sql: "INSERT INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by','Phase 109 test Pilot publication prerequisite')",
    args: [
      `phase109-brand-fixture-${pen.entityId}`,
      pen.entityId,
      PHASE109_PILOT_ID,
    ],
  });
  await applyCuratedContentPacks(
    client,
    options,
    structuredClone([brand, pen]),
  );
}

async function assertFailClosed(
  client: Client,
  options: ApplyPhase109Options,
  expected: RegExp,
) {
  const before = await databaseSummary(client);
  await assert.rejects(
    applyPhase109PilotDailyContent(client, options),
    expected,
  );
  assert.deepEqual(await databaseSummary(client), before);
}

test("Phase 109 publishes only raw Pilot Cavalier/Prera/Kakuno/Cocoon on an owned checkpoint", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase109-")),
  );
  const outsideRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase109-outside-")),
  );
  const aliasRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase109-alias-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase109Options = {
    workspaceRoot: ROOT,
    reviewer: "phase109-test",
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
    await preparePublishedPilotBrand(client, options);

    for (const remoteKey of [
      "TURSO_DATABASE_URL",
      "TURSO_AUTH_TOKEN",
      "FPKG_DATABASE_URL",
    ] as const) {
      await assertFailClosed(
        client,
        {
          ...options,
          env: {
            ...(options.env ?? process.env),
            [remoteKey]: "forbidden",
          } as NodeJS.ProcessEnv,
        },
        new RegExp(`remote database selection: ${remoteKey}`),
      );
    }
    await assertFailClosed(
      client,
      { ...options, reviewer: "   " },
      /reviewer must not be empty/,
    );

    const symlinkPath = path.join(ownedRoot, "catalog-symlink.db");
    fs.symlinkSync(copy.destinationPath, symlinkPath);
    await assertFailClosed(
      client,
      { ...options, databasePath: symlinkPath },
      /non-symlink catalog file/,
    );

    const mismatchCopy = copyCheckpointedCatalogToDisposableCopy(
      REAL,
      path.join(ownedRoot, "mismatch.db"),
      ownedRoot,
      { expectedSourceSnapshot: protectedSnapshot },
    );
    const mismatchClient = createClient({
      url: `file:${mismatchCopy.destinationPath}`,
    });
    extraClients.push(mismatchClient);
    await migrateDatabase(mismatchClient);
    await assertFailClosed(
      client,
      { ...options, databasePath: mismatchCopy.destinationPath },
      /client is not bound/,
    );

    const outsideCopy = copyCheckpointedCatalogToDisposableCopy(
      REAL,
      path.join(outsideRoot, "outside.db"),
      outsideRoot,
      { expectedSourceSnapshot: protectedSnapshot },
    );
    const outsideClient = createClient({
      url: `file:${outsideCopy.destinationPath}`,
    });
    extraClients.push(outsideClient);
    await migrateDatabase(outsideClient);
    await assertFailClosed(
      outsideClient,
      { ...options, databasePath: outsideCopy.destinationPath },
      /caller-owned root/,
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
    await unmigratedClient.execute(
      "DELETE FROM migrations WHERE name='032_taxonomy_identity.sql'",
    );
    await assertFailClosed(
      unmigratedClient,
      { ...options, databasePath: unmigratedCopy.destinationPath },
      /migrated through 032/,
    );

    const disposableProtected = copyCheckpointedCatalogToDisposableCopy(
      REAL,
      path.join(aliasRoot, "disposable-protected.db"),
      aliasRoot,
      { expectedSourceSnapshot: protectedSnapshot },
    );
    const prepAlias = createClient({
      url: `file:${disposableProtected.destinationPath}`,
    });
    await migrateDatabase(prepAlias);
    prepAlias.close();
    const hardLinkPath = path.join(ownedRoot, "hard-link-alias.db");
    fs.linkSync(disposableProtected.destinationPath, hardLinkPath);
    const hardLinkClient = createClient({ url: `file:${hardLinkPath}` });
    extraClients.push(hardLinkClient);
    const disposableSnapshot = snapshotCatalogFiles(
      disposableProtected.destinationPath,
    );
    await assert.rejects(
      applyPhase109PilotDailyContent(hardLinkClient, {
        ...options,
        databasePath: hardLinkPath,
        protectedCatalogPath: disposableProtected.destinationPath,
        protectedCatalogSnapshot: disposableSnapshot,
      }),
      /hard-link alias/,
    );
    assert.deepEqual(
      snapshotCatalogFiles(disposableProtected.destinationPath),
      disposableSnapshot,
    );

    const rawTargets = await rows(
      client,
      "SELECT id,type,slug,name FROM entities WHERE id IN (?,?,?,?) ORDER BY id",
      TARGET_IDS,
    );
    assert.equal(rawTargets.length, 4);
    assert.deepEqual(
      rawTargets.map((row) => row.id),
      [...TARGET_IDS].sort(),
    );
    assert.deepEqual(
      new Set(rawTargets.map((row) => row.slug)),
      new Set(TARGET_RAW_SLUGS),
    );

    await client.execute({
      sql: "UPDATE entities SET slug='phase109-wrong-raw' WHERE id=?",
      args: [PHASE109_CAVALIER_ID],
    });
    await assertFailClosed(
      client,
      options,
      /raw identity or canonical collision/,
    );
    await client.execute({
      sql: "UPDATE entities SET slug=? WHERE id=?",
      args: [PHASE109_CAVALIER_RAW_SLUG, PHASE109_CAVALIER_ID],
    });

    await client.execute(
      "INSERT INTO entities(id,type,slug,name) VALUES('phase109-alt','pen','pilot-cavalier','collision')",
    );
    await assertFailClosed(
      client,
      options,
      /raw identity or canonical collision/,
    );
    await client.execute("DELETE FROM entities WHERE id='phase109-alt'");

    const maker91 = await rows(
      client,
      "SELECT id,target_id,reason FROM entity_links WHERE source_id=? AND link_type='made_by'",
      [PHASE109_CAVALIER_ID],
    );
    assert.equal(maker91.length, 1);
    await client.execute({
      sql: "UPDATE entity_links SET target_id=? WHERE id=?",
      args: [PHASE109_PRERA_ID, maker91[0]?.id],
    });
    await assertFailClosed(client, options, /maker prerequisite is not exact/);
    await client.execute({
      sql: "UPDATE entity_links SET target_id=? WHERE id=?",
      args: [PHASE109_PILOT_ID, maker91[0]?.id],
    });
    await preparePublishedPilotBrand(client, options);

    const loaded = loadPhase109PilotDailyPacks(ownedRoot);
    assert.ok(loaded.every((pack) => Array.from(pack.bodyMd).length >= 2_000));
    assert.ok(
      loaded.every(
        (pack) =>
          pack.sources.some(
            (source) =>
              source.tier === "primary" &&
              source.independenceGroup === "pilot-official",
          ) &&
          pack.sources.some(
            (source) => source.tier === "professional_secondary",
          ) &&
          pack.scopes.some(
            (scope) =>
              /sample/.test(scope.scopeKey) &&
              scope.productionState === "historical",
          ),
      ),
    );
    const cavalierPack = loaded.find(
      (pack) => pack.entityId === PHASE109_CAVALIER_ID,
    );
    const preraPack = loaded.find(
      (pack) => pack.entityId === PHASE109_PRERA_ID,
    );
    const kakunoPack = loaded.find(
      (pack) => pack.entityId === PHASE109_KAKUNO_ID,
    );
    const cocoonPack = loaded.find(
      (pack) => pack.entityId === PHASE109_COCOON_ID,
    );
    assert.ok(cavalierPack?.spec?.values.fill_system?.includes("CON-40"));
    assert.ok(preraPack?.spec?.values.fill_system?.includes("CON-40"));
    assert.ok(kakunoPack?.spec?.values.fill_system?.includes("CON-70N"));
    assert.ok(cocoonPack?.spec?.values.fill_system?.includes("CON-40"));
    assert.doesNotMatch(
      JSON.stringify(loaded.map((pack) => pack.spec?.values)),
      /CON-20|CON-50|standard-international/i,
    );
    assert.match(JSON.stringify(cavalierPack), /historical_repaired_sample/);
    assert.match(JSON.stringify(preraPack), /Iro-ai/);
    assert.match(JSON.stringify(kakunoPack), /笑脸/);
    assert.match(JSON.stringify(cocoonPack), /Metropolitan/);
    assert.equal(
      new Set(loaded.map((pack) => pack.media[0]?.localPath)).size,
      4,
    );

    const pilotBefore = await brandSummary(client);
    const otherPilotBefore = await nonTargetPilotSummary(client);
    const reverseBefore = await publicReverse(client);
    const makerBefore = await rows(
      client,
      "SELECT id,source_id,target_id,link_type,reason FROM entity_links WHERE source_id IN (?,?,?,?) ORDER BY source_id,id",
      TARGET_IDS,
    );

    const first = await applyPhase109PilotDailyContent(client, options);
    assert.deepEqual(
      first.entities.map(({ entityId, outcome }) => ({ entityId, outcome })),
      [
        { entityId: PHASE109_CAVALIER_ID, outcome: "published" },
        { entityId: PHASE109_PRERA_ID, outcome: "published" },
        { entityId: PHASE109_KAKUNO_ID, outcome: "published" },
        { entityId: PHASE109_COCOON_ID, outcome: "published" },
      ],
    );
    assert.deepEqual(
      await rows(
        client,
        "SELECT id,slug,name FROM entities WHERE id IN (?,?,?,?) ORDER BY id",
        TARGET_IDS,
      ),
      [
        {
          id: PHASE109_COCOON_ID,
          slug: PHASE109_COCOON_SLUG,
          name: "百乐 Pilot Cocoon",
        },
        {
          id: PHASE109_PRERA_ID,
          slug: PHASE109_PRERA_SLUG,
          name: "百乐 Pilot Prera",
        },
        {
          id: PHASE109_KAKUNO_ID,
          slug: PHASE109_KAKUNO_SLUG,
          name: "百乐 Pilot Kakuno",
        },
        {
          id: PHASE109_CAVALIER_ID,
          slug: PHASE109_CAVALIER_SLUG,
          name: "百乐 Pilot Cavalier",
        },
      ].sort((left, right) => left.id.localeCompare(right.id)),
    );
    assert.deepEqual(
      await rows(
        client,
        "SELECT source_path,target_path,redirect_kind FROM entity_redirects WHERE source_path IN (?,?,?,?) ORDER BY source_path",
        TARGET_RAW_SLUGS.map((slug) => `/pen/${slug}`),
      ),
      [
        {
          source_path: `/pen/${PHASE109_CAVALIER_RAW_SLUG}`,
          target_path: `/pen/${PHASE109_CAVALIER_SLUG}`,
          redirect_kind: "permanent",
        },
        {
          source_path: `/pen/${PHASE109_PRERA_RAW_SLUG}`,
          target_path: `/pen/${PHASE109_PRERA_SLUG}`,
          redirect_kind: "permanent",
        },
        {
          source_path: `/pen/${PHASE109_KAKUNO_RAW_SLUG}`,
          target_path: `/pen/${PHASE109_KAKUNO_SLUG}`,
          redirect_kind: "permanent",
        },
        {
          source_path: `/pen/${PHASE109_COCOON_RAW_SLUG}`,
          target_path: `/pen/${PHASE109_COCOON_SLUG}`,
          redirect_kind: "permanent",
        },
      ].sort((left, right) =>
        left.source_path.localeCompare(right.source_path),
      ),
    );
    assert.deepEqual(
      await rows(
        client,
        "SELECT id,source_id,target_id,link_type,reason FROM entity_links WHERE source_id IN (?,?,?,?) ORDER BY source_id,id",
        TARGET_IDS,
      ),
      makerBefore,
    );
    assert.deepEqual(await brandSummary(client), pilotBefore);
    assert.deepEqual(await nonTargetPilotSummary(client), otherPilotBefore);

    const reverseAfter = await publicReverse(client);
    const reverseAdded = reverseAfter.filter(
      (row) => !reverseBefore.some((before) => before.id === row.id),
    );
    assert.deepEqual(
      reverseAdded,
      [
        { id: PHASE109_COCOON_ID, slug: PHASE109_COCOON_SLUG },
        { id: PHASE109_CAVALIER_ID, slug: PHASE109_CAVALIER_SLUG },
        { id: PHASE109_KAKUNO_ID, slug: PHASE109_KAKUNO_SLUG },
        { id: PHASE109_PRERA_ID, slug: PHASE109_PRERA_SLUG },
      ].sort((left, right) => left.id.localeCompare(right.id)),
    );

    for (const id of TARGET_IDS) {
      const state = await rows(
        client,
        `SELECT publication.status,publication.approved_content_hash,
                publication.content_revision,publication.reviewed_content_revision,
                publication.reviewed_contract_version,readiness.publishable,
                readiness.blocker_count,CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public
         FROM entity_publications publication
         JOIN public_entity_readiness readiness ON readiness.entity_id=publication.entity_id AND readiness.contract_version=3
         LEFT JOIN public_entities public ON public.id=publication.entity_id
         WHERE publication.entity_id=?`,
        [id],
      );
      assert.equal(state[0]?.status, "published");
      assert.equal(
        state[0]?.content_revision,
        state[0]?.reviewed_content_revision,
      );
      assert.equal(Number(state[0]?.reviewed_contract_version), 3);
      assert.equal(Number(state[0]?.publishable), 1);
      assert.equal(Number(state[0]?.blocker_count), 0);
      assert.equal(Number(state[0]?.is_public), 1);
      const reviewKinds = await rows(
        client,
        "SELECT review_kind,count(*) AS total FROM entity_content_reviews WHERE entity_id=? AND content_hash=? AND status='approved' GROUP BY review_kind ORDER BY review_kind",
        [id, state[0]?.approved_content_hash],
      );
      assert.deepEqual(
        reviewKinds.map((row) => row.review_kind),
        ["fact", "language", "media", "publication"],
      );
      assert.ok(reviewKinds.every((row) => Number(row.total) === 1));
    }

    const stateAfterFirst = await databaseSummary(client);
    const second = await applyPhase109PilotDailyContent(client, options);
    assert.deepEqual(
      second.entities.map(({ entityId, outcome }) => ({ entityId, outcome })),
      [
        { entityId: PHASE109_CAVALIER_ID, outcome: "noop" },
        { entityId: PHASE109_PRERA_ID, outcome: "noop" },
        { entityId: PHASE109_KAKUNO_ID, outcome: "noop" },
        { entityId: PHASE109_COCOON_ID, outcome: "noop" },
      ],
    );
    assert.deepEqual(await databaseSummary(client), stateAfterFirst);
  } finally {
    client.close();
    for (const extra of extraClients) extra.close();
    assert.deepEqual(snapshotCatalogFiles(REAL), protectedSnapshot);
    fs.rmSync(ownedRoot, { recursive: true, force: true });
    fs.rmSync(outsideRoot, { recursive: true, force: true });
    fs.rmSync(aliasRoot, { recursive: true, force: true });
  }
});
