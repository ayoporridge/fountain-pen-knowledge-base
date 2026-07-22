import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import {
  type ApplyPhase22Options,
  applyCuratedContentPacks,
} from "../../scripts/apply-phase22-content";
import {
  type ApplyPhase127Options,
  applyPhase127Pilot78G88GContent,
} from "../../scripts/apply-phase127-pilot-78g-88g-mr-content";
import {
  phase84PlatinumPilotP0V3BrandPacks,
  phase84PlatinumPilotP0V3Packs,
} from "../../scripts/data/phase84-platinum-pilot-p0-v3";
import {
  loadPhase127Packs,
  PHASE127_78G_ID,
  PHASE127_78G_RAW_NAME,
  PHASE127_78G_RAW_SLUG,
  PHASE127_78G_SLUG,
  PHASE127_88G_ARTICLE_ID,
  PHASE127_88G_ARTICLE_SLUG,
  PHASE127_88G_RAW_NAME,
  PHASE127_88G_RAW_SLUG,
  PHASE127_LINES,
  PHASE127_NEW_MR_IDS,
  PHASE127_PILOT_ID,
  phase127Article,
} from "../../scripts/data/phase127-pilot-78g-88g-mr";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import {
  getCanonicalEntityPath,
  getReclassifiedArticlePath,
} from "../../src/lib/entity-redirects";

const ROOT_ALIAS = "/Users/xz/CodeBuddy/fountain-pen-graph";
const ROOT_CANONICAL = "/Users/xz/Documents/fountain-pen-graph";
const REAL = path.join(ROOT_CANONICAL, "data", "fpkg.db");

async function rows(client: Client, sql: string, args: unknown[] = []) {
  return (await client.execute({ sql, args: args as never[] })).rows.map(
    (row) => ({ ...row }),
  );
}

async function scalar(client: Client, sql: string, args: unknown[] = []) {
  return Number((await rows(client, sql, args))[0]?.value ?? 0);
}

async function digestEntity(client: Client, entityId: string) {
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
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

async function preparePublishedPilotBrand(
  client: Client,
  options: ApplyPhase22Options,
) {
  const brand = phase84PlatinumPilotP0V3BrandPacks.find(
    (pack) => pack.entityId === PHASE127_PILOT_ID,
  );
  const pen = phase84PlatinumPilotP0V3Packs.find(
    (pack) => pack.entityId === "s43PILOTCAP",
  );
  assert.ok(brand && pen);
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
    sql: "INSERT INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by','Phase 127 Pilot brand fixture')",
    args: ["phase127-pilot-brand-fixture", pen.entityId, PHASE127_PILOT_ID],
  });
  await applyCuratedContentPacks(
    client,
    options,
    structuredClone([brand, pen]),
  );
  return pen.entityId;
}

test("Phase 127 canonicalizes Pilot 78G and splits 88G into the exact MR lines", {
  timeout: 700_000,
}, async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase127-pilot-")),
  );
  const hardLinkRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase127-hardlink-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase127Options = {
    workspaceRoot: ROOT_ALIAS,
    reviewer: "phase127-pilot-test",
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
    const protectedPilotId = await preparePublishedPilotBrand(client, options);
    const protectedPilotDigest = await digestEntity(client, protectedPilotId);

    assert.equal(
      getCanonicalEntityPath("pen", PHASE127_78G_RAW_SLUG),
      `/pen/${PHASE127_78G_SLUG}`,
    );
    assert.equal(
      getReclassifiedArticlePath("pen", PHASE127_88G_RAW_SLUG),
      `/article/${PHASE127_88G_ARTICLE_SLUG}`,
    );

    const packs = loadPhase127Packs(ROOT_ALIAS);
    assert.deepEqual(
      packs.map((pack) => pack.entityId),
      [PHASE127_78G_ID, ...PHASE127_NEW_MR_IDS],
    );
    assert.deepEqual(
      packs.map((pack) => pack.variants?.length),
      [10, 5, 5, 6],
    );
    for (const pack of packs) {
      assert.ok(Array.from(pack.summary).length >= 60);
      assert.ok(Array.from(pack.summary).length <= 160);
      assert.ok(Array.from(pack.bodyMd).length >= 2_000);
      assert.equal(
        pack.media.filter((media) => media.usageStatus === "primary").length,
        1,
      );
      assert.ok(
        pack.sources.some((source) => source.sourceType === "official"),
      );
      assert.ok(
        pack.sources.some((source) => source.tier === "professional_secondary"),
      );
    }
    assert.equal(
      packs[0]?.aliases.find((alias) => alias.alias === "Pilot 78G+")
        ?.sourceKey,
      "phase127-ilpennofilo-78gplus",
    );
    assert.equal(
      packs[2]?.spec?.values.fill_system,
      "China FP-MR2: Pilot cartridges / CON-40",
    );

    const raw = await rows(
      client,
      "SELECT id,type,slug,name,summary,body_md,source FROM entities WHERE id IN (?,?) ORDER BY id",
      [PHASE127_78G_ID, PHASE127_88G_ARTICLE_ID],
    );
    const rawById = new Map(raw.map((row) => [String(row.id), row]));
    assert.deepEqual(
      [
        rawById.get(PHASE127_78G_ID)?.type,
        rawById.get(PHASE127_78G_ID)?.slug,
        rawById.get(PHASE127_78G_ID)?.name,
        rawById.get(PHASE127_78G_ID)?.source,
      ],
      ["pen", PHASE127_78G_RAW_SLUG, PHASE127_78G_RAW_NAME, null],
    );
    assert.deepEqual(
      [
        rawById.get(PHASE127_88G_ARTICLE_ID)?.type,
        rawById.get(PHASE127_88G_ARTICLE_ID)?.slug,
        rawById.get(PHASE127_88G_ARTICLE_ID)?.name,
        rawById.get(PHASE127_88G_ARTICLE_ID)?.source,
      ],
      ["pen", PHASE127_88G_RAW_SLUG, PHASE127_88G_RAW_NAME, null],
    );
    assert.equal(
      Array.from(String(rawById.get(PHASE127_78G_ID)?.summary)).length,
      73,
    );
    assert.equal(
      Array.from(String(rawById.get(PHASE127_88G_ARTICLE_ID)?.body_md)).length,
      176,
    );

    await assert.rejects(
      applyPhase127Pilot78G88GContent(client, {
        ...options,
        reviewer: "   ",
      }),
      /reviewer must not be empty/,
    );

    const disposableProtected = copyCheckpointedCatalogToDisposableCopy(
      REAL,
      path.join(hardLinkRoot, "disposable-protected.db"),
      hardLinkRoot,
      { expectedSourceSnapshot: protectedSnapshot },
    );
    const disposableProtectedClient = createClient({
      url: `file:${disposableProtected.destinationPath}`,
    });
    await migrateDatabase(disposableProtectedClient);
    disposableProtectedClient.close();
    const hardLinkPath = path.join(ownedRoot, "hard-link-alias.db");
    fs.linkSync(disposableProtected.destinationPath, hardLinkPath);
    const hardLinkClient = createClient({ url: `file:${hardLinkPath}` });
    extraClients.push(hardLinkClient);
    const disposableSnapshot = snapshotCatalogFiles(
      disposableProtected.destinationPath,
    );
    await assert.rejects(
      applyPhase127Pilot78G88GContent(hardLinkClient, {
        ...options,
        databasePath: hardLinkPath,
        protectedCatalogPath: disposableProtected.destinationPath,
        protectedCatalogSnapshot: disposableSnapshot,
      }),
      /hard-link aliases/,
    );
    assertCatalogSnapshotUnchanged(disposableSnapshot);

    const first = await applyPhase127Pilot78G88GContent(client, options);
    assert.deepEqual(
      first.entities.map((entity) => [entity.entityId, entity.outcome]),
      [
        [PHASE127_88G_ARTICLE_ID, "published"],
        [PHASE127_78G_ID, "published"],
        ...PHASE127_NEW_MR_IDS.map((id) => [id, "published"]),
      ],
    );
    const publicRows = await rows(
      client,
      `SELECT id,type,slug FROM public_entities WHERE id IN (${first.entities.map(() => "?").join(",")}) ORDER BY id`,
      first.entities.map((entity) => entity.entityId),
    );
    assert.equal(publicRows.length, 5);
    assert.deepEqual(
      publicRows.find((row) => row.id === PHASE127_88G_ARTICLE_ID),
      {
        id: PHASE127_88G_ARTICLE_ID,
        type: "article",
        slug: PHASE127_88G_ARTICLE_SLUG,
      },
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) value FROM entity_links WHERE source_id=? OR target_id=?",
        [PHASE127_88G_ARTICLE_ID, PHASE127_88G_ARTICLE_ID],
      ),
      0,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) value FROM entity_aliases WHERE entity_id=?",
        [PHASE127_88G_ARTICLE_ID],
      ),
      phase127Article.aliases.length,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) value FROM claims WHERE subject_entity_id=?",
        [PHASE127_88G_ARTICLE_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) value FROM claim_evidence evidence JOIN claims claim ON claim.id=evidence.claim_id WHERE claim.subject_entity_id=?",
        [PHASE127_88G_ARTICLE_ID],
      ),
      3,
    );

    for (const [index, pack] of packs.entries()) {
      const line = PHASE127_LINES[index];
      assert.ok(line);
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) value FROM model_variants WHERE model_entity_id=?",
          [pack.entityId],
        ),
        line.variants.length,
      );
      const publication = (
        await rows(
          client,
          "SELECT status,approved_content_hash,content_revision,reviewed_content_revision,reviewed_contract_version FROM entity_publications WHERE entity_id=?",
          [pack.entityId],
        )
      )[0];
      assert.equal(publication?.status, "published");
      assert.equal(
        publication?.approved_content_hash,
        first.entities.find((entity) => entity.entityId === pack.entityId)
          ?.contentHash,
      );
      assert.equal(
        Number(publication?.reviewed_content_revision),
        Number(publication?.content_revision),
      );
      assert.equal(Number(publication?.reviewed_contract_version), 3);
    }

    assert.equal(
      await scalar(
        client,
        "SELECT count(*) value FROM entity_links WHERE source_id=? AND link_type='made_by' AND target_id=?",
        [PHASE127_78G_ID, PHASE127_PILOT_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        `SELECT count(*) value FROM entity_links WHERE source_id IN (${PHASE127_NEW_MR_IDS.map(() => "?").join(",")}) AND link_type='made_by' AND target_id=?`,
        [...PHASE127_NEW_MR_IDS, PHASE127_PILOT_ID],
      ),
      3,
    );
    assert.equal(
      await digestEntity(client, protectedPilotId),
      protectedPilotDigest,
    );

    const replay = await applyPhase127Pilot78G88GContent(client, options);
    assert.deepEqual(
      replay.entities.map((entity) => [entity.entityId, entity.outcome]),
      first.entities.map((entity) => [entity.entityId, "noop"]),
    );

    await client.execute({
      sql: "DELETE FROM entity_aliases WHERE id=(SELECT id FROM entity_aliases WHERE entity_id=? ORDER BY id LIMIT 1)",
      args: [PHASE127_NEW_MR_IDS[0]],
    });
    await assert.rejects(
      applyPhase127Pilot78G88GContent(client, options),
      /terminal (?:content\/publication|pen payload\/topology) is invalid/,
    );
  } finally {
    for (const extra of extraClients) extra.close();
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
    fs.rmSync(hardLinkRoot, { recursive: true, force: true });
  }
  assert.deepEqual(snapshotCatalogFiles(REAL), protectedSnapshot);
});
