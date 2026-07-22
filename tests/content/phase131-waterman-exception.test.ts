import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import { applyPhase83WatermanCurrentContent } from "../../scripts/apply-phase83-waterman-current-content";
import {
  type ApplyPhase131Options,
  applyPhase131WatermanExceptionContent,
} from "../../scripts/apply-phase131-waterman-exception-content";
import {
  loadPhase131WatermanExceptionPacks,
  PHASE131_ALLURE_ID,
  PHASE131_CARENE_ID,
  PHASE131_EXCEPTION_ID,
  PHASE131_EXCEPTION_SLUG,
  PHASE131_EXPERT_ID,
  PHASE131_HEMISPHERE_ID,
  PHASE131_MADE_BY_IDS,
  PHASE131_REVERSE_IDS,
  PHASE131_TARGET_IDS,
} from "../../scripts/data/phase131-waterman-exception";
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
  PHASE131_CARENE_ID,
  PHASE131_EXPERT_ID,
  PHASE131_HEMISPHERE_ID,
  PHASE131_ALLURE_ID,
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

test("Phase 131 publishes exact Waterman Exception series without rebuilding Allure", {
  timeout: 700_000,
}, async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase131-waterman-exception-")),
  );
  const hardLinkRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase131-hardlink-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase131Options = {
    workspaceRoot: ROOT_ALIAS,
    reviewer: "phase131-waterman-exception-test",
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
    await applyPhase83WatermanCurrentContent(client, options);

    const protectedBefore = new Map<string, string>();
    for (const id of PROTECTED_IDS)
      protectedBefore.set(id, await digestEntity(client, id));
    const packs = loadPhase131WatermanExceptionPacks(ROOT_ALIAS);
    assert.deepEqual(
      packs.map((pack) => pack.entityId),
      [...PHASE131_TARGET_IDS],
    );
    assert.deepEqual(
      packs.map((pack) => pack.expectedSlug),
      [PHASE131_EXCEPTION_SLUG],
    );
    for (const pack of packs) {
      assert.ok(Array.from(pack.summary).length >= 60);
      assert.ok(Array.from(pack.summary).length <= 160);
      assert.ok(Array.from(pack.bodyMd).length >= 2_000);
      assert.equal(pack.sources.length, 6);
      assert.equal(pack.scopes.length, 4);
      assert.equal(pack.variants?.length, 3);
      assert.equal(
        pack.media.filter((media) => media.usageStatus === "primary").length,
        1,
      );
    }
    assert.equal(packs[0]?.claims.length, 5);
    assert.match(packs[0]?.bodyMd ?? "", /SAP_2214314/);
    assert.match(packs[0]?.bodyMd ?? "", /L’Essence du Bleu/);
    assert.match(packs[0]?.bodyMd ?? "", /57\.4/);
    assert.match(packs[0]?.bodyMd ?? "", /Allure/);
    assert.equal(
      await scalar(
        client,
        `SELECT count(*) value FROM entities WHERE id IN (${PHASE131_TARGET_IDS.map(() => "?").join(",")})`,
        [...PHASE131_TARGET_IDS],
      ),
      0,
    );

    await assert.rejects(
      applyPhase131WatermanExceptionContent(client, {
        ...options,
        reviewer: " ",
      }),
      /reviewer must not be empty/,
    );
    await assert.rejects(
      applyPhase131WatermanExceptionContent(client, {
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
      applyPhase131WatermanExceptionContent(hardLinkClient, {
        ...options,
        databasePath: hardLinkPath,
        protectedCatalogPath: disposableProtected.destinationPath,
        protectedCatalogSnapshot: disposableSnapshot,
      }),
      /hard-link aliases/,
    );
    assertCatalogSnapshotUnchanged(disposableSnapshot);

    const first = await applyPhase131WatermanExceptionContent(client, options);
    assert.deepEqual(
      first.entities.map((entity) => [entity.entityId, entity.outcome]),
      [[PHASE131_EXCEPTION_ID, "published"]],
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
        [PHASE131_MADE_BY_IDS[index], PHASE131_REVERSE_IDS[index]].sort(),
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
        [PHASE131_EXCEPTION_ID],
      ),
      6,
    );
    for (const id of PROTECTED_IDS)
      assert.equal(await digestEntity(client, id), protectedBefore.get(id));

    const replay = await applyPhase131WatermanExceptionContent(client, options);
    assert.deepEqual(
      replay.entities.map((entity) => [entity.entityId, entity.outcome]),
      first.entities.map((entity) => [entity.entityId, "noop"]),
    );

    await client.execute({
      sql: "DELETE FROM entity_aliases WHERE id=(SELECT id FROM entity_aliases WHERE entity_id=? ORDER BY id LIMIT 1)",
      args: [PHASE131_EXCEPTION_ID],
    });
    await assert.rejects(
      applyPhase131WatermanExceptionContent(client, options),
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
