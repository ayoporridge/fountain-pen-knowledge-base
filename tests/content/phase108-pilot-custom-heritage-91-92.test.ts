import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import { applyCuratedContentPacks } from "../../scripts/apply-phase22-content";
import {
  type ApplyPhase108Options,
  applyPhase108PilotCustomHeritageContent,
  PHASE108_HERITAGE_91_ID,
  PHASE108_HERITAGE_91_RAW_SLUG,
  PHASE108_HERITAGE_91_SLUG,
  PHASE108_HERITAGE_92_ID,
  PHASE108_HERITAGE_92_RAW_SLUG,
  PHASE108_HERITAGE_92_SLUG,
  PHASE108_PILOT_ID,
} from "../../scripts/apply-phase108-pilot-custom-heritage-91-92-content";
import {
  phase84PlatinumPilotP0V3BrandPacks,
  phase84PlatinumPilotP0V3Packs,
} from "../../scripts/data/phase84-platinum-pilot-p0-v3";
import { phase108PilotCustomHeritagePacks } from "../../scripts/data/phase108-pilot-custom-heritage-91-92";
import { loadCuratedEntityPack } from "../../scripts/lib/curated-content-pack";
import {
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { computePublicationContentHash } from "../../src/lib/publication";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");
const TARGET_IDS = [PHASE108_HERITAGE_91_ID, PHASE108_HERITAGE_92_ID];

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
      "SELECT id,type,slug,name,source FROM entities WHERE id IN (?,?) ORDER BY id",
      TARGET_IDS,
    ),
    makers: await rows(
      client,
      "SELECT id,source_id,target_id,link_type,reason FROM entity_links WHERE source_id IN (?,?) ORDER BY id",
      TARGET_IDS,
    ),
    redirects: await optionalRows(
      client,
      "SELECT source_path,target_path,redirect_kind FROM entity_redirects WHERE source_path IN (?,?) ORDER BY source_path",
      [
        `/pen/${PHASE108_HERITAGE_91_RAW_SLUG}`,
        `/pen/${PHASE108_HERITAGE_92_RAW_SLUG}`,
      ],
    ),
    publications: await rows(
      client,
      "SELECT entity_id,status,content_revision,reviewed_content_revision,approved_content_hash FROM entity_publications WHERE entity_id IN (?,?) ORDER BY entity_id",
      TARGET_IDS,
    ),
  };
}

async function brandSummary(client: Client) {
  const hash = await computePublicationContentHash(client, PHASE108_PILOT_ID);
  return {
    entity: await rows(
      client,
      "SELECT id,type,slug,name,summary,body_md,source FROM entities WHERE id=?",
      [PHASE108_PILOT_ID],
    ),
    stories: await rows(
      client,
      "SELECT id,title,summary,body_md,status,source_notes FROM stories WHERE entity_id=? ORDER BY id",
      [PHASE108_PILOT_ID],
    ),
    references: await rows(
      client,
      "SELECT id,source_item_id,relation_type,note,review_status FROM entity_references WHERE entity_id=? ORDER BY id",
      [PHASE108_PILOT_ID],
    ),
    media: await rows(
      client,
      "SELECT id,local_path,source_item_id,review_status,usage_status FROM media_assets WHERE entity_id=? ORDER BY id",
      [PHASE108_PILOT_ID],
    ),
    reviews: await rows(
      client,
      "SELECT review_kind,content_hash,status,reviewer,reviewed_at,note FROM entity_content_reviews WHERE entity_id=? ORDER BY review_kind,content_hash",
      [PHASE108_PILOT_ID],
    ),
    publication: await rows(
      client,
      "SELECT status,depth_tier,blockers_json,approved_content_hash,content_revision,reviewed_content_revision,reviewed_contract_version,reviewed_by,reviewed_at,published_at,review_notes FROM entity_publications WHERE entity_id=?",
      [PHASE108_PILOT_ID],
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
       AND entity.id NOT IN (?,?)
     ORDER BY entity.id`,
    [PHASE108_PILOT_ID, ...TARGET_IDS],
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
    [PHASE108_PILOT_ID],
  );
}

async function preparePublishedPilotBrand(
  client: Client,
  options: ApplyPhase108Options,
) {
  const brand = phase84PlatinumPilotP0V3BrandPacks.find(
    (pack) => pack.entityId === PHASE108_PILOT_ID,
  );
  const pen = phase84PlatinumPilotP0V3Packs.find(
    (pack) => pack.spec?.brandEntityId === PHASE108_PILOT_ID,
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
    sql: "INSERT INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by','Phase 108 test Pilot publication prerequisite')",
    args: [
      `phase108-brand-fixture-${pen.entityId}`,
      pen.entityId,
      PHASE108_PILOT_ID,
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
  options: ApplyPhase108Options,
  expected: RegExp,
) {
  const before = await databaseSummary(client);
  await assert.rejects(
    applyPhase108PilotCustomHeritageContent(client, options),
    expected,
  );
  assert.deepEqual(await databaseSummary(client), before);
}

test("Phase 108 publishes only raw Pilot Custom Heritage 91/92 on an owned checkpoint", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase108-")),
  );
  const outsideRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase108-outside-")),
  );
  const aliasRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase108-alias-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase108Options = {
    workspaceRoot: ROOT,
    reviewer: "phase108-test",
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
      applyPhase108PilotCustomHeritageContent(hardLinkClient, {
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

    const raw91 = await rows(
      client,
      "SELECT id,type,slug,name FROM entities WHERE id IN (?,?) ORDER BY id",
      TARGET_IDS,
    );
    assert.equal(raw91.length, 2);
    assert.deepEqual(
      raw91.map((row) => row.id),
      [...TARGET_IDS].sort(),
    );
    assert.deepEqual(
      new Set(raw91.map((row) => row.slug)),
      new Set([PHASE108_HERITAGE_91_RAW_SLUG, PHASE108_HERITAGE_92_RAW_SLUG]),
    );

    await client.execute({
      sql: "UPDATE entities SET slug='phase108-wrong-raw' WHERE id=?",
      args: [PHASE108_HERITAGE_91_ID],
    });
    await assertFailClosed(
      client,
      options,
      /raw identity or canonical collision/,
    );
    await client.execute({
      sql: "UPDATE entities SET slug=? WHERE id=?",
      args: [PHASE108_HERITAGE_91_RAW_SLUG, PHASE108_HERITAGE_91_ID],
    });

    await client.execute(
      "INSERT INTO entities(id,type,slug,name) VALUES('phase108-alt','pen','pilot-custom-heritage-91','collision')",
    );
    await assertFailClosed(
      client,
      options,
      /raw identity or canonical collision/,
    );
    await client.execute("DELETE FROM entities WHERE id='phase108-alt'");

    const maker91 = await rows(
      client,
      "SELECT id,target_id,reason FROM entity_links WHERE source_id=? AND link_type='made_by'",
      [PHASE108_HERITAGE_91_ID],
    );
    assert.equal(maker91.length, 1);
    await client.execute({
      sql: "UPDATE entity_links SET target_id=? WHERE id=?",
      args: [PHASE108_HERITAGE_92_ID, maker91[0]?.id],
    });
    await assertFailClosed(client, options, /maker prerequisite is not exact/);
    await client.execute({
      sql: "UPDATE entity_links SET target_id=? WHERE id=?",
      args: [PHASE108_PILOT_ID, maker91[0]?.id],
    });
    await preparePublishedPilotBrand(client, options);

    const loaded = phase108PilotCustomHeritagePacks.map((pack) =>
      loadCuratedEntityPack(ROOT, pack),
    );
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
              scope.scopeKey === "historical_price_2025_10" &&
              scope.productionState === "historical",
          ),
      ),
    );
    const pack91 = loaded.find(
      (pack) => pack.entityId === PHASE108_HERITAGE_91_ID,
    );
    const pack92 = loaded.find(
      (pack) => pack.entityId === PHASE108_HERITAGE_92_ID,
    );
    assert.ok(pack91?.spec?.values.fill_system?.includes("CON-70N"));
    assert.ok(pack92?.spec?.values.fill_system?.includes("1.2 ml"));
    assert.doesNotMatch(
      JSON.stringify(pack91),
      /built-in piston|fixed reservoir/i,
    );
    assert.doesNotMatch(
      JSON.stringify(pack92),
      /CON-40|CON-70N|supports? cartridge|compatible with cartridge/i,
    );
    assert.notEqual(pack91?.media[0]?.localPath, pack92?.media[0]?.localPath);

    const pilotBefore = await brandSummary(client);
    const otherPilotBefore = await nonTargetPilotSummary(client);
    const reverseBefore = await publicReverse(client);
    const makerBefore = await rows(
      client,
      "SELECT id,source_id,target_id,link_type,reason FROM entity_links WHERE source_id IN (?,?) ORDER BY source_id,id",
      TARGET_IDS,
    );

    const first = await applyPhase108PilotCustomHeritageContent(
      client,
      options,
    );
    assert.deepEqual(
      first.entities.map(({ entityId, outcome }) => ({ entityId, outcome })),
      [
        { entityId: PHASE108_HERITAGE_91_ID, outcome: "published" },
        { entityId: PHASE108_HERITAGE_92_ID, outcome: "published" },
      ],
    );
    assert.equal(
      Number(
        (
          await client.execute(
            "SELECT count(*) AS total FROM entities WHERE id IN ('NpJibLHczSl9','-Oa7pDNi4UnI')",
          )
        ).rows[0]?.total,
      ),
      2,
    );
    assert.deepEqual(
      await rows(
        client,
        "SELECT id,slug,name FROM entities WHERE id IN (?,?) ORDER BY id",
        TARGET_IDS,
      ),
      [
        {
          id: PHASE108_HERITAGE_92_ID,
          slug: PHASE108_HERITAGE_92_SLUG,
          name: "百乐 Pilot Custom Heritage 92",
        },
        {
          id: PHASE108_HERITAGE_91_ID,
          slug: PHASE108_HERITAGE_91_SLUG,
          name: "百乐 Pilot Custom Heritage 91",
        },
      ],
    );
    assert.deepEqual(
      await rows(
        client,
        "SELECT source_path,target_path,redirect_kind FROM entity_redirects WHERE source_path IN (?,?) ORDER BY source_path",
        [
          `/pen/${PHASE108_HERITAGE_91_RAW_SLUG}`,
          `/pen/${PHASE108_HERITAGE_92_RAW_SLUG}`,
        ],
      ),
      [
        {
          source_path: `/pen/${PHASE108_HERITAGE_91_RAW_SLUG}`,
          target_path: `/pen/${PHASE108_HERITAGE_91_SLUG}`,
          redirect_kind: "permanent",
        },
        {
          source_path: `/pen/${PHASE108_HERITAGE_92_RAW_SLUG}`,
          target_path: `/pen/${PHASE108_HERITAGE_92_SLUG}`,
          redirect_kind: "permanent",
        },
      ],
    );
    assert.deepEqual(
      await rows(
        client,
        "SELECT id,source_id,target_id,link_type,reason FROM entity_links WHERE source_id IN (?,?) ORDER BY source_id,id",
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
    assert.deepEqual(reverseAdded, [
      { id: PHASE108_HERITAGE_92_ID, slug: PHASE108_HERITAGE_92_SLUG },
      { id: PHASE108_HERITAGE_91_ID, slug: PHASE108_HERITAGE_91_SLUG },
    ]);

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
    const second = await applyPhase108PilotCustomHeritageContent(
      client,
      options,
    );
    assert.deepEqual(
      second.entities.map(({ entityId, outcome }) => ({ entityId, outcome })),
      [
        { entityId: PHASE108_HERITAGE_91_ID, outcome: "noop" },
        { entityId: PHASE108_HERITAGE_92_ID, outcome: "noop" },
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
