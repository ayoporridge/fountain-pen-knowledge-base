import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import { applyPhase68LamySafariAlstarContent } from "../../scripts/apply-phase68-lamy-safari-alstar-content";
import {
  type ApplyPhase133Options,
  applyPhase133LamyLogoContent,
} from "../../scripts/apply-phase133-lamy-logo-content";
import {
  loadPhase133LamyLogoPack,
  PHASE133_LAMY_ID,
  PHASE133_LOGO_RAW_SLUG,
  PHASE133_LOGO_SLUG,
} from "../../scripts/data/phase133-lamy-logo";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT_ALIAS = "/Users/xz/CodeBuddy/fountain-pen-graph";
const ROOT = fs.realpathSync.native(ROOT_ALIAS);
const REAL = path.join(ROOT, "data/fpkg.db");

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
    ...(topology
      ? [
          "SELECT * FROM entity_links WHERE source_id=? OR target_id=? ORDER BY id",
          "SELECT * FROM entity_publications WHERE entity_id=?",
          "SELECT * FROM entity_content_reviews WHERE entity_id=? ORDER BY review_kind,content_hash",
        ]
      : []),
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

test("Phase 133 canonicalizes and publishes the raw LAMY logo identity", {
  timeout: 700_000,
}, async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase133-lamy-logo-")),
  );
  const hardLinkRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase133-hardlink-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase133Options = {
    workspaceRoot: ROOT_ALIAS,
    reviewer: "phase133-lamy-logo-test",
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

  try {
    await migrateDatabase(client);
    await applyPhase68LamySafariAlstarContent(client, {
      ...options,
      reviewer: "phase133-phase68-prerequisite",
    });

    const target = (
      await rows(
        client,
        "SELECT id,type,slug,name,source FROM entities WHERE slug=?",
        [PHASE133_LOGO_RAW_SLUG],
      )
    )[0];
    assert.equal(target?.type, "pen");
    assert.equal(target?.source, null);
    const targetId = String(target?.id);
    assert.ok(targetId);
    const pack = loadPhase133LamyLogoPack(ROOT_ALIAS, targetId);
    assert.equal(Array.from(pack.summary).length, 97);
    assert.ok(Array.from(pack.bodyMd).length >= 2_000);
    assert.deepEqual(
      [
        pack.sources.length,
        pack.scopes.length,
        pack.claims.length,
        pack.variants?.length,
        pack.media.length,
      ],
      [6, 4, 5, 2, 1],
    );
    assert.match(pack.bodyMd, /Wolfgang Fabian/);
    assert.match(pack.bodyMd, /Logo 005 FP/);
    assert.match(pack.bodyMd, /18 g 只保留为评测样本重量/);

    await assert.rejects(
      applyPhase133LamyLogoContent(client, { ...options, reviewer: "" }),
      /reviewer must not be empty/,
    );
    await assert.rejects(
      applyPhase133LamyLogoContent(client, {
        ...options,
        env: {
          NODE_ENV: "test",
          TURSO_DATABASE_URL: "libsql://remote.invalid",
          TURSO_AUTH_TOKEN: "",
          FPKG_DATABASE_URL: "",
        },
      }),
      /refuses inherited remote selection/,
    );

    await client.execute({
      sql: "UPDATE entities SET slug=? WHERE id=?",
      args: [PHASE133_LOGO_SLUG, targetId],
    });
    await assert.rejects(
      applyPhase133LamyLogoContent(client, options),
      /partial or alternate/,
    );
    await client.execute({
      sql: "UPDATE entities SET slug=? WHERE id=?",
      args: [PHASE133_LOGO_RAW_SLUG, targetId],
    });

    const hardLinkPath = path.join(hardLinkRoot, "catalog-hardlink.db");
    fs.linkSync(copy.destinationPath, hardLinkPath);
    const hardLinkClient = createClient({ url: `file:${hardLinkPath}` });
    try {
      await assert.rejects(
        applyPhase133LamyLogoContent(hardLinkClient, {
          ...options,
          databasePath: hardLinkPath,
          ownedRoot: hardLinkRoot,
        }),
        /hard-link aliases/,
      );
    } finally {
      hardLinkClient.close();
      fs.unlinkSync(hardLinkPath);
    }

    const protectedIds = (
      await rows(
        client,
        "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='reverse' AND target_id<>? ORDER BY target_id",
        [PHASE133_LAMY_ID, targetId],
      )
    ).map((row) => String(row.target_id));
    const protectedDigests = new Map<string, string>();
    for (const id of protectedIds)
      protectedDigests.set(id, await digest(client, id));
    const brandBefore = await digest(client, PHASE133_LAMY_ID, false);

    const first = await applyPhase133LamyLogoContent(client, options);
    assert.deepEqual(first.entities, [
      {
        entityId: targetId,
        outcome: "published",
        contentHash: first.entities[0]?.contentHash,
      },
    ]);

    const publicRow = (
      await rows(
        client,
        "SELECT id,type,slug,name,body_md FROM public_entities WHERE id=?",
        [targetId],
      )
    )[0];
    assert.equal(publicRow?.type, "pen");
    assert.equal(publicRow?.slug, PHASE133_LOGO_SLUG);
    assert.equal(publicRow?.name, "LAMY logo");
    assert.ok(Array.from(String(publicRow?.body_md)).length >= 2_000);
    assert.deepEqual(
      (
        await rows(
          client,
          "SELECT source_id,target_id,link_type FROM entity_links WHERE (source_id=? OR target_id=?) AND link_type IN ('made_by','reverse') ORDER BY link_type,source_id,target_id",
          [targetId, targetId],
        )
      ).map((row) => [
        String(row.source_id),
        String(row.target_id),
        String(row.link_type),
      ]),
      [
        [targetId, PHASE133_LAMY_ID, "made_by"],
        [PHASE133_LAMY_ID, targetId, "reverse"],
      ],
    );
    const publication = (
      await rows(
        client,
        "SELECT status,approved_content_hash,content_revision,reviewed_content_revision,reviewed_contract_version FROM entity_publications WHERE entity_id=?",
        [targetId],
      )
    )[0];
    assert.equal(publication?.status, "published");
    assert.equal(
      publication?.approved_content_hash,
      first.entities[0]?.contentHash,
    );
    assert.equal(
      publication?.content_revision,
      publication?.reviewed_content_revision,
    );
    assert.equal(Number(publication?.reviewed_contract_version), 3);
    assert.deepEqual(
      (
        await rows(
          client,
          "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind",
          [targetId, first.entities[0]?.contentHash],
        )
      ).map((row) => [String(row.review_kind), String(row.status)]),
      [
        ["fact", "approved"],
        ["language", "approved"],
        ["media", "approved"],
        ["publication", "approved"],
      ],
    );
    assert.equal(
      Number(
        (
          await rows(
            client,
            "SELECT count(*) value FROM claim_evidence evidence JOIN claims claim ON claim.id=evidence.claim_id WHERE claim.subject_entity_id=?",
            [targetId],
          )
        )[0]?.value,
      ),
      5,
    );
    const redirect = (
      await rows(
        client,
        "SELECT target_path,redirect_kind FROM entity_redirects WHERE source_path=?",
        [`/pen/${PHASE133_LOGO_RAW_SLUG}`],
      )
    )[0];
    assert.equal(redirect?.target_path, `/pen/${PHASE133_LOGO_SLUG}`);
    assert.equal(redirect?.redirect_kind, "permanent");
    assert.equal(await digest(client, PHASE133_LAMY_ID, false), brandBefore);
    for (const id of protectedIds)
      assert.equal(await digest(client, id), protectedDigests.get(id));

    const replay = await applyPhase133LamyLogoContent(client, options);
    assert.equal(replay.entities[0]?.outcome, "noop");
    assert.equal(
      replay.entities[0]?.contentHash,
      first.entities[0]?.contentHash,
    );

    await client.execute({
      sql: "DELETE FROM entity_aliases WHERE entity_id=? AND alias='LAMY Logo'",
      args: [targetId],
    });
    await assert.rejects(
      applyPhase133LamyLogoContent(client, options),
      /terminal payload\/topology\/publication is invalid/,
    );
    assertCatalogSnapshotUnchanged(protectedSnapshot);
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
    fs.rmSync(hardLinkRoot, { recursive: true, force: true });
  }
});
