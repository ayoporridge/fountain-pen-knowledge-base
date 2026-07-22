import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import { applyPhase68LamySafariAlstarContent } from "../../scripts/apply-phase68-lamy-safari-alstar-content";
import {
  type ApplyPhase132Options,
  applyPhase132LamyStudioDialogContent,
} from "../../scripts/apply-phase132-lamy-studio-dialog-content";
import {
  loadPhase132LamyStudioDialogPacks,
  PHASE132_DIALOG_RAW_SLUG,
  PHASE132_DIALOG_SLUG,
  PHASE132_LAMY_ID,
  PHASE132_STUDIO_RAW_SLUG,
  PHASE132_STUDIO_SLUG,
} from "../../scripts/data/phase132-lamy-studio-dialog";
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

test("Phase 132 canonicalizes and publishes LAMY studio and dialog raw identities", {
  timeout: 700_000,
}, async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase132-lamy-studio-dialog-")),
  );
  const hardLinkRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase132-hardlink-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase132Options = {
    workspaceRoot: ROOT_ALIAS,
    reviewer: "phase132-lamy-studio-dialog-test",
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
    await applyPhase68LamySafariAlstarContent(client, options);

    const protectedIds = (
      await rows(
        client,
        "SELECT id FROM entities WHERE slug IN ('lamy-safari','lamy-al-star') ORDER BY slug",
      )
    ).map((row) => String(row.id));
    assert.equal(protectedIds.length, 2);
    const targetRows = await rows(
      client,
      "SELECT id,slug FROM entities WHERE slug IN (?,?) ORDER BY slug",
      [PHASE132_STUDIO_RAW_SLUG, PHASE132_DIALOG_RAW_SLUG],
    );
    assert.equal(targetRows.length, 2);
    const idByRawSlug = new Map(
      targetRows.map((row) => [String(row.slug), String(row.id)]),
    );
    const studioId = idByRawSlug.get(PHASE132_STUDIO_RAW_SLUG);
    const dialogId = idByRawSlug.get(PHASE132_DIALOG_RAW_SLUG);
    assert.ok(studioId);
    assert.ok(dialogId);
    const targetIds = {
      studio: studioId,
      dialog: dialogId,
    };

    const protectedBefore = new Map<string, string>();
    for (const id of protectedIds)
      protectedBefore.set(id, await digestEntity(client, id));
    const packs = loadPhase132LamyStudioDialogPacks(ROOT_ALIAS, targetIds);
    assert.deepEqual(
      packs.map((pack) => pack.entityId),
      [targetIds.studio, targetIds.dialog],
    );
    assert.deepEqual(
      packs.map((pack) => pack.expectedSlug),
      [PHASE132_STUDIO_SLUG, PHASE132_DIALOG_SLUG],
    );
    for (const pack of packs) {
      assert.ok(Array.from(pack.summary).length >= 60);
      assert.ok(Array.from(pack.summary).length <= 160);
      assert.ok(Array.from(pack.bodyMd).length >= 2_000);
      assert.equal(
        pack.media.filter((media) => media.usageStatus === "primary").length,
        1,
      );
    }
    assert.deepEqual(
      packs.map((pack) => [
        pack.sources.length,
        pack.scopes.length,
        pack.claims.length,
        pack.variants?.length,
      ]),
      [
        [5, 3, 4, 3],
        [4, 2, 4, 2],
      ],
    );
    assert.match(packs[0]?.bodyMd ?? "", /Hannes Wettstein/);
    assert.match(packs[0]?.bodyMd ?? "", /54395071594840/);
    assert.match(packs[1]?.bodyMd ?? "", /Franco Clivio/);
    assert.match(packs[1]?.bodyMd ?? "", /dialog cc/);
    assert.match(packs[1]?.bodyMd ?? "", /48 g/);

    await assert.rejects(
      applyPhase132LamyStudioDialogContent(client, {
        ...options,
        reviewer: " ",
      }),
      /reviewer must not be empty/,
    );
    await assert.rejects(
      applyPhase132LamyStudioDialogContent(client, {
        ...options,
        env: {
          ...options.env,
          NODE_ENV: "test",
          FPKG_DATABASE_URL: "file:remote",
        },
      }),
      /refuses inherited remote/,
    );

    await client.execute({
      sql: "UPDATE entities SET slug=? WHERE id=?",
      args: [PHASE132_STUDIO_SLUG, targetIds.studio],
    });
    await assert.rejects(
      applyPhase132LamyStudioDialogContent(client, options),
      /mixes raw and terminal|partial or alternate/,
    );
    await client.execute({
      sql: "UPDATE entities SET slug=? WHERE id=?",
      args: [PHASE132_STUDIO_RAW_SLUG, targetIds.studio],
    });

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
      applyPhase132LamyStudioDialogContent(hardLinkClient, {
        ...options,
        databasePath: hardLinkPath,
        protectedCatalogPath: disposableProtected.destinationPath,
        protectedCatalogSnapshot: disposableSnapshot,
      }),
      /hard-link aliases/,
    );
    assertCatalogSnapshotUnchanged(disposableSnapshot);

    const first = await applyPhase132LamyStudioDialogContent(client, options);
    assert.deepEqual(
      first.entities.map((entity) => [entity.entityId, entity.outcome]),
      [
        [targetIds.studio, "published"],
        [targetIds.dialog, "published"],
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
            "SELECT source_id,target_id,link_type FROM entity_links WHERE (source_id=? OR target_id=?) AND link_type IN ('made_by','reverse') ORDER BY link_type,source_id,target_id",
            [pack.entityId, pack.entityId],
          )
        ).map((row) => [
          String(row.source_id),
          String(row.target_id),
          String(row.link_type),
        ]),
        [
          [pack.entityId, PHASE132_LAMY_ID, "made_by"],
          [PHASE132_LAMY_ID, pack.entityId, "reverse"],
        ],
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

    for (const pack of packs)
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) value FROM claim_evidence evidence JOIN claims claim ON claim.id=evidence.claim_id WHERE claim.subject_entity_id=?",
          [pack.entityId],
        ),
        4,
      );
    for (const target of [
      [PHASE132_STUDIO_RAW_SLUG, PHASE132_STUDIO_SLUG],
      [PHASE132_DIALOG_RAW_SLUG, PHASE132_DIALOG_SLUG],
    ] as const) {
      const redirect = (
        await rows(
          client,
          "SELECT target_path,redirect_kind FROM entity_redirects WHERE source_path=?",
          [`/pen/${target[0]}`],
        )
      )[0];
      assert.equal(redirect?.target_path, `/pen/${target[1]}`);
      assert.equal(redirect?.redirect_kind, "permanent");
    }
    for (const id of protectedIds)
      assert.equal(await digestEntity(client, id), protectedBefore.get(id));

    const replay = await applyPhase132LamyStudioDialogContent(client, options);
    assert.deepEqual(
      replay.entities.map((entity) => [entity.entityId, entity.outcome]),
      first.entities.map((entity) => [entity.entityId, "noop"]),
    );

    await client.execute({
      sql: "DELETE FROM entity_aliases WHERE id=(SELECT id FROM entity_aliases WHERE entity_id=? ORDER BY id LIMIT 1)",
      args: [targetIds.studio],
    });
    await assert.rejects(
      applyPhase132LamyStudioDialogContent(client, options),
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
