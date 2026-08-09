import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import { applyPhase557BenuBrioletteDepth } from "../../scripts/apply-phase557-benu-briolette-depth";
import {
  PHASE557_BENU_ID,
  PHASE557_BRIOLETTE_ID,
  PHASE557_BRIOLETTE_SLUG,
  phase557BenuBrioletteDepthPacks,
} from "../../scripts/data/phase557-benu-briolette-depth";
import { loadCuratedEntityPack } from "../../scripts/lib/curated-content-pack";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { computePublicationContentHash } from "../../src/lib/publication";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

async function rows(
  client: Client,
  sql: string,
  args: unknown[] = [],
): Promise<Array<Record<string, unknown>>> {
  return (await client.execute({ sql, args: args as never[] })).rows.map(
    (row) => ({ ...row }),
  );
}

async function scalar(
  client: Client,
  sql: string,
  args: unknown[] = [],
): Promise<number> {
  const result = await client.execute({ sql, args: args as never[] });
  return Number(result.rows[0]?.value ?? 0);
}

test("Phase 557 deepens the existing BENU Briolette on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  const keepAlive = setInterval(() => undefined, 1_000);
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase557-benu-briolette-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options = {
    workspaceRoot: ROOT,
    reviewer: "phase557-benu-briolette-depth-test",
    databasePath: copy.destinationPath,
    ownedRoot,
    protectedCatalogPath: REAL,
    protectedCatalogSnapshot: protectedSnapshot,
    env: {
      ...process.env,
      NODE_ENV: "test",
      TURSO_DATABASE_URL: "",
      TURSO_AUTH_TOKEN: "",
      FPKG_DATABASE_URL: "",
    } satisfies NodeJS.ProcessEnv,
  };
  try {
    await migrateDatabase(client);
    const definition = phase557BenuBrioletteDepthPacks[1];
    assert.ok(definition);
    const pack = loadCuratedEntityPack(ROOT, definition);
    assert.equal(pack.entityId, PHASE557_BRIOLETTE_ID);
    assert.equal(pack.expectedSlug, PHASE557_BRIOLETTE_SLUG);
    assert.ok(Array.from(pack.bodyMd).length >= 5_000);
    assert.ok(pack.sources.length >= 15);
    assert.ok(
      new Set(pack.sources.map((source) => source.independenceGroup)).size >= 6,
    );
    assert.ok((pack.claims?.length ?? 0) >= 13);
    assert.ok((pack.spec?.evidence.length ?? 0) >= 20);
    assert.equal(
      pack.media.filter((media) => media.usageStatus === "primary").length,
      1,
    );
    const svg = fs.readFileSync(
      path.join(
        ROOT,
        "public",
        String(pack.media[0]?.localPath).replace(/^\//, ""),
      ),
      "utf8",
    );
    assert.match(svg, /BENU Briolette/);
    assert.match(svg, /not a product photograph/);

    await assert.rejects(
      applyPhase557BenuBrioletteDepth(client, {
        ...options,
        env: {
          ...options.env,
          TURSO_DATABASE_URL: "https://remote.invalid/catalog",
        } satisfies NodeJS.ProcessEnv,
      }),
      /refuses inherited remote database selection/,
    );

    const first = await applyPhase557BenuBrioletteDepth(client, options);
    assert.deepEqual(
      first.entities.map((entity) => entity.entityId),
      [PHASE557_BENU_ID, PHASE557_BRIOLETTE_ID],
    );
    assert.equal(first.entities[1]?.outcome, "published");
    const page = (
      await rows(
        client,
        "SELECT type,slug,name,body_md,source FROM public_entities WHERE id=?",
        [PHASE557_BRIOLETTE_ID],
      )
    )[0];
    assert.equal(page?.type, "pen");
    assert.equal(page?.slug, PHASE557_BRIOLETTE_SLUG);
    assert.equal(page?.name, "BENU Briolette");
    assert.ok(Array.from(String(page?.body_md ?? "")).length >= 5_000);
    assert.match(
      String(page?.source),
      /^curated-content:phase557-benu-briolette-depth-v1:/,
    );
    for (const pattern of [
      /Briolette/,
      /Ruby Forest/,
      /Island Breeze/,
      /13\.8 cm|13.8 厘米/,
      /1\.7 cm|1.7 厘米/,
      /Schmidt/,
      /#5/,
      /FH 241S|FH 241G/,
      /standard international|标准国际/,
      /converter|转换器/,
      /eyedropper/,
      /不可后插|不能后插/,
      /Talisman/,
      /Euphoria/,
      /清水|清洁|维护/,
      /保修/,
      /试写|选购/,
      /非产品照片/,
    ]) {
      assert.match(String(page?.body_md), pattern);
    }
    assert.doesNotMatch(
      String(page?.body_md),
      /made_by|entity_publications|checkpoint/i,
    );

    const contentHash = await computePublicationContentHash(
      client,
      PHASE557_BRIOLETTE_ID,
    );
    const publication = (
      await rows(
        client,
        `SELECT status,approved_content_hash,content_revision,reviewed_content_revision,
                reviewed_contract_version,reviewed_by,published_at
         FROM entity_publications WHERE entity_id=?`,
        [PHASE557_BRIOLETTE_ID],
      )
    )[0];
    assert.equal(publication?.status, "published");
    assert.equal(publication?.approved_content_hash, contentHash);
    assert.equal(
      Number(publication?.reviewed_content_revision),
      Number(publication?.content_revision),
    );
    assert.equal(Number(publication?.reviewed_contract_version), 3);
    const reviews = await rows(
      client,
      `SELECT review_kind,status FROM entity_content_reviews
       WHERE entity_id=? AND content_hash=? ORDER BY review_kind`,
      [PHASE557_BRIOLETTE_ID, contentHash],
    );
    assert.deepEqual(
      reviews.map((row) => `${String(row.review_kind)}:${String(row.status)}`),
      [
        "fact:approved",
        "language:approved",
        "media:approved",
        "publication:approved",
      ],
    );

    assert.ok(
      (await scalar(
        client,
        "SELECT count(*) AS value FROM entity_references WHERE entity_id=? AND review_status='approved'",
        [PHASE557_BRIOLETTE_ID],
      )) >= 15,
    );
    assert.ok(
      (await scalar(
        client,
        "SELECT count(*) AS value FROM claims WHERE subject_entity_id=? AND review_status='approved'",
        [PHASE557_BRIOLETTE_ID],
      )) >= 13,
    );
    assert.ok(
      (await scalar(
        client,
        `SELECT count(*) AS value FROM spec_field_evidence evidence
         JOIN model_specs model_spec ON model_spec.id=evidence.model_spec_id
         WHERE model_spec.entity_id=? AND evidence.review_status='approved'`,
        [PHASE557_BRIOLETTE_ID],
      )) >= 20,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM media_assets WHERE entity_id=? AND usage_status='primary' AND review_status='approved'",
        [PHASE557_BRIOLETTE_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND link_type='made_by'",
        [PHASE557_BRIOLETTE_ID],
      ),
      1,
    );
    assert.equal(
      (
        await rows(
          client,
          "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='made_by'",
          [PHASE557_BRIOLETTE_ID],
        )
      )[0]?.target_id,
      PHASE557_BENU_ID,
    );
    const firstHash = contentHash;

    const replay = await applyPhase557BenuBrioletteDepth(client, options);
    assert.equal(replay.entities[1]?.outcome, "noop");
    assert.equal(replay.entities[1]?.contentHash, firstHash);
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND link_type='made_by'",
        [PHASE557_BRIOLETTE_ID],
      ),
      1,
    );
    assertCatalogSnapshotUnchanged(protectedSnapshot);
  } finally {
    clearInterval(keepAlive);
    client.close();
  }
});

test("Phase 557 rejects remote selection before touching the catalog", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase557-benu-remote-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  try {
    await migrateDatabase(client);
    await assert.rejects(
      applyPhase557BenuBrioletteDepth(client, {
        workspaceRoot: ROOT,
        reviewer: "phase557-benu-remote-test",
        databasePath: copy.destinationPath,
        ownedRoot,
        protectedCatalogPath: REAL,
        protectedCatalogSnapshot: protectedSnapshot,
        env: {
          NODE_ENV: "test",
          TURSO_DATABASE_URL: "libsql://remote.invalid",
        } satisfies NodeJS.ProcessEnv,
      }),
      /refuses inherited remote database selection/,
    );
    assertCatalogSnapshotUnchanged(protectedSnapshot);
  } finally {
    client.close();
  }
});
