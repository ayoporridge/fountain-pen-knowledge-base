import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import { applyPhase104WancherDreamPenNavigationContent } from "../../scripts/apply-phase104-wancher-dream-pen-navigation-content";
import { applyPhase107WancherDreamPenTrueEboniteMatteBlackContent } from "../../scripts/apply-phase107-wancher-dream-pen-true-ebonite-matte-black-content";
import { applyPhase112WancherDreamPenTitaniumBlackContent } from "../../scripts/apply-phase112-wancher-dream-pen-titanium-black-content";
import { applyPhase113WancherDreamPenAkaTamenuriContent } from "../../scripts/apply-phase113-wancher-dream-pen-true-urushi-aka-tamenuri-content";
import { applyPhase119WancherPuchicoContent } from "../../scripts/apply-phase119-wancher-puchico-content";
import { applyPhase120WancherShizukuContent } from "../../scripts/apply-phase120-wancher-shizuku-glass-nib-content";
import {
  type ApplyPhase128Options,
  applyPhase128WancherUrushiSkusContent,
} from "../../scripts/apply-phase128-wancher-dream-pen-urushi-skus-content";
import {
  loadPhase128WancherPacks,
  PHASE128_BYAKUDAN_ID,
  PHASE128_BYAKUDAN_SLUG,
  PHASE128_DREAM_ARTICLE_ID,
  PHASE128_MADE_BY_IDS,
  PHASE128_REVERSE_IDS,
  PHASE128_TARGET_IDS,
  PHASE128_TRUE_URUSHI_BLACK_ID,
  PHASE128_TRUE_URUSHI_BLACK_SLUG,
} from "../../scripts/data/phase128-wancher-dream-pen-urushi-skus";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT_ALIAS = "/Users/xz/CodeBuddy/fountain-pen-graph";
const ROOT_CANONICAL = "/Users/xz/Documents/fountain-pen-graph";
const REAL = path.join(ROOT_CANONICAL, "data", "fpkg.db");
const PROTECTED_IDS = [
  PHASE128_DREAM_ARTICLE_ID,
  "phase107-wancher-true-ebonite-matte-black",
  "phase112-wancher-dream-pen-titanium-black",
  "phase113-wancher-dream-pen-true-urushi-aka-tamenuri",
  "phase119-wancher-puchico",
  "phase120-wancher-shizuku-glass-nib",
] as const;

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

test("Phase 128 publishes exact Wancher True Urushi Black and Byakudan-nuri SKUs", {
  timeout: 700_000,
}, async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase128-wancher-")),
  );
  const hardLinkRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase128-hardlink-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase128Options = {
    workspaceRoot: ROOT_ALIAS,
    reviewer: "phase128-wancher-test",
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
  const extraClients: Client[] = [];
  try {
    await migrateDatabase(client);
    await applyPhase104WancherDreamPenNavigationContent(client, options);
    await applyPhase107WancherDreamPenTrueEboniteMatteBlackContent(
      client,
      options,
    );
    await applyPhase112WancherDreamPenTitaniumBlackContent(client, options);
    await applyPhase113WancherDreamPenAkaTamenuriContent(client, options);
    await applyPhase119WancherPuchicoContent(client, options);
    await applyPhase120WancherShizukuContent(client, options);

    const protectedBefore = new Map<string, string>();
    for (const id of PROTECTED_IDS)
      protectedBefore.set(id, await digestEntity(client, id));
    const packs = loadPhase128WancherPacks(ROOT_ALIAS);
    assert.deepEqual(
      packs.map((pack) => pack.entityId),
      [...PHASE128_TARGET_IDS],
    );
    assert.deepEqual(
      packs.map((pack) => pack.expectedSlug),
      [PHASE128_TRUE_URUSHI_BLACK_SLUG, PHASE128_BYAKUDAN_SLUG],
    );
    for (const pack of packs) {
      assert.ok(Array.from(pack.summary).length >= 60);
      assert.ok(Array.from(pack.summary).length <= 160);
      assert.ok(Array.from(pack.bodyMd).length >= 2_000);
      assert.equal(pack.sources.length, 5);
      assert.equal(pack.claims.length, 2);
      assert.equal(pack.scopes.length, 2);
      assert.equal(pack.variants?.length, 0);
      assert.equal(
        pack.media.filter((media) => media.usageStatus === "primary").length,
        1,
      );
    }
    assert.match(packs[0]?.bodyMd ?? "", /production prototype/);
    assert.match(packs[1]?.bodyMd ?? "", /sold out/);
    assert.equal(
      await scalar(
        client,
        `SELECT count(*) value FROM entities WHERE id IN (${PHASE128_TARGET_IDS.map(() => "?").join(",")})`,
        [...PHASE128_TARGET_IDS],
      ),
      0,
    );

    await assert.rejects(
      applyPhase128WancherUrushiSkusContent(client, {
        ...options,
        reviewer: " ",
      }),
      /reviewer must not be empty/,
    );
    await assert.rejects(
      applyPhase128WancherUrushiSkusContent(client, {
        ...options,
        env: {
          ...options.env,
          NODE_ENV: "test",
          FPKG_DATABASE_URL: "file:remote",
        },
      }),
      /refuses inherited remote/,
    );

    const disposableProtected = copyCheckpointedCatalogToDisposableCopy(
      REAL,
      path.join(hardLinkRoot, "disposable-protected.db"),
      hardLinkRoot,
      { expectedSourceSnapshot: protectedSnapshot },
    );
    const disposableClient = createClient({
      url: `file:${disposableProtected.destinationPath}`,
    });
    await migrateDatabase(disposableClient);
    disposableClient.close();
    const hardLinkPath = path.join(ownedRoot, "hard-link-alias.db");
    fs.linkSync(disposableProtected.destinationPath, hardLinkPath);
    const hardLinkClient = createClient({ url: `file:${hardLinkPath}` });
    extraClients.push(hardLinkClient);
    const disposableSnapshot = snapshotCatalogFiles(
      disposableProtected.destinationPath,
    );
    await assert.rejects(
      applyPhase128WancherUrushiSkusContent(hardLinkClient, {
        ...options,
        databasePath: hardLinkPath,
        protectedCatalogPath: disposableProtected.destinationPath,
        protectedCatalogSnapshot: disposableSnapshot,
      }),
      /hard-link aliases/,
    );
    assertCatalogSnapshotUnchanged(disposableSnapshot);

    const first = await applyPhase128WancherUrushiSkusContent(client, options);
    assert.deepEqual(
      first.entities.map((entity) => [entity.entityId, entity.outcome]),
      [
        [PHASE128_TRUE_URUSHI_BLACK_ID, "published"],
        [PHASE128_BYAKUDAN_ID, "published"],
      ],
    );

    for (let index = 0; index < packs.length; index += 1) {
      const pack = packs[index];
      assert.ok(pack);
      const publicRow = (
        await rows(
          client,
          "SELECT id,type,slug,body_md FROM public_entities WHERE id=?",
          [pack.entityId],
        )
      )[0];
      assert.equal(publicRow?.type, "pen");
      assert.equal(publicRow?.slug, pack.expectedSlug);
      assert.ok(Array.from(String(publicRow?.body_md)).length >= 2_000);
      assert.deepEqual(
        (
          await rows(
            client,
            "SELECT id FROM entity_links WHERE (source_id=? OR target_id=?) AND link_type IN ('made_by','reverse') ORDER BY id",
            [pack.entityId, pack.entityId],
          )
        ).map((row) => String(row.id)),
        [PHASE128_MADE_BY_IDS[index], PHASE128_REVERSE_IDS[index]].sort(),
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
        first.entities[index]?.contentHash,
      );
      assert.equal(
        Number(publication?.content_revision),
        Number(publication?.reviewed_content_revision),
      );
      assert.equal(Number(publication?.reviewed_contract_version), 3);
      assert.deepEqual(
        (
          await rows(
            client,
            "SELECT review_kind FROM entity_content_reviews WHERE entity_id=? AND content_hash=? AND status='approved' ORDER BY review_kind",
            [pack.entityId, first.entities[index]?.contentHash ?? ""],
          )
        ).map((row) => String(row.review_kind)),
        ["fact", "language", "media", "publication"],
      );
    }

    assert.equal(
      await scalar(
        client,
        "SELECT count(*) value FROM claim_evidence evidence JOIN claims claim ON claim.id=evidence.claim_id WHERE claim.subject_entity_id=?",
        [PHASE128_TRUE_URUSHI_BLACK_ID],
      ),
      2,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) value FROM claim_evidence evidence JOIN claims claim ON claim.id=evidence.claim_id WHERE claim.subject_entity_id=?",
        [PHASE128_BYAKUDAN_ID],
      ),
      2,
    );
    for (const id of PROTECTED_IDS)
      assert.equal(await digestEntity(client, id), protectedBefore.get(id));

    const replay = await applyPhase128WancherUrushiSkusContent(client, options);
    assert.deepEqual(
      replay.entities.map((entity) => [entity.entityId, entity.outcome]),
      first.entities.map((entity) => [entity.entityId, "noop"]),
    );

    await client.execute({
      sql: "DELETE FROM entity_aliases WHERE id=(SELECT id FROM entity_aliases WHERE entity_id=? ORDER BY id LIMIT 1)",
      args: [PHASE128_BYAKUDAN_ID],
    });
    await assert.rejects(
      applyPhase128WancherUrushiSkusContent(client, options),
      /terminal payload\/topology\/publication is invalid/,
    );
  } finally {
    for (const extra of extraClients) extra.close();
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
    fs.rmSync(hardLinkRoot, { recursive: true, force: true });
  }
  assert.deepEqual(snapshotCatalogFiles(REAL), protectedSnapshot);
});
