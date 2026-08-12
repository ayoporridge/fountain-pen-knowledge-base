import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import {
  type ApplyPhase598Options,
  applyPhase598IkkakuByNahvalurContent,
} from "../../scripts/apply-phase598-ikkaku-by-nahvalur-content";
import {
  PHASE598_IDS,
  PHASE598_IKKAKU_ARTICLE_ID,
  PHASE598_IKKAKU_ARTICLE_SLUG,
  PHASE598_NAHVALUR_BRAND_ID,
  PHASE598_SLUGS,
  phase598IkkakuModelPacks,
  phase598IkkakuPacks,
} from "../../scripts/data/phase598-ikkaku-by-nahvalur";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");
const SOURCE = process.env.FPKG_PHASE598_SOURCE_DATABASE
  ? fs.realpathSync.native(process.env.FPKG_PHASE598_SOURCE_DATABASE)
  : path.join(
      ROOT,
      ".planning/quick/260811-ryz-nahvalur-key-west-pen-of-the-year-triad-",
      "checkpoint/catalog.db",
    );
const EXPECTED_SOURCE_SHA256 =
  "50f8ae9c81999e5341d788426af2c6333fe5e6affd9919fd198b1c213a3b701b";
const EXPECTED_REAL_SHA256 =
  "acbb5710050b5c9d6e435666dda909b66055c290a4640f04faa38860ea24d09a";

const TARGETS = phase598IkkakuModelPacks.map((pack) => ({
  id: pack.entityId,
  slug: pack.expectedSlug,
  name: pack.canonicalName,
  aliases: pack.aliases.map(({ alias }) => alias),
}));

async function rows(client: Client, sql: string, args: unknown[] = []) {
  const result = await client.execute({ sql, args: args as never[] });
  return result.rows.map((row) => ({ ...row }));
}

function sha256(file: string): string {
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(file))
    .digest("hex");
}

function catalogContentFingerprint(
  snapshot: ReturnType<typeof snapshotCatalogFiles>,
) {
  return Object.fromEntries(
    (["main", "wal", "shm"] as const).map((kind) => {
      const file = snapshot[kind];
      return [
        kind,
        {
          exists: file.exists,
          size: file.size,
          device: file.device,
          inode: file.inode,
          mode: file.mode,
          uid: file.uid,
          gid: file.gid,
          sha256: file.sha256,
        },
      ];
    }),
  );
}

function createProtectedGuard(
  realSnapshot: ReturnType<typeof snapshotCatalogFiles>,
) {
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase598-protected-guard-")),
  );
  const databasePath = path.join(ownedRoot, "protected.db");
  fs.copyFileSync(REAL, databasePath, fs.constants.COPYFILE_EXCL);
  const snapshot = snapshotCatalogFiles(databasePath);
  assert.equal(snapshot.main.sha256, realSnapshot.main.sha256);
  assert.equal(snapshot.wal.exists, false);
  assert.equal(snapshot.shm.exists, false);
  return { ownedRoot, databasePath, snapshot };
}

function createOwnedCopy(
  prefix: string,
  sourceSnapshot: ReturnType<typeof snapshotCatalogFiles>,
) {
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), prefix)),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    SOURCE,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: sourceSnapshot },
  );
  return { ownedRoot, databasePath: copy.destinationPath };
}

function bindProcessDatabaseToOwnedCopy(databasePath: string): () => void {
  const keys = [
    "TURSO_DATABASE_URL",
    "TURSO_AUTH_TOKEN",
    "FPKG_DATABASE_URL",
    "PUBLICATION_GATE_FIXTURE",
  ] as const;
  const previous = new Map(keys.map((key) => [key, process.env[key]]));
  process.env.TURSO_DATABASE_URL = "";
  process.env.TURSO_AUTH_TOKEN = "";
  process.env.FPKG_DATABASE_URL = `file:${databasePath}`;
  process.env.PUBLICATION_GATE_FIXTURE = "1";
  return () => {
    for (const key of keys) {
      const value = previous.get(key);
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  };
}

function options(
  ownedRoot: string,
  databasePath: string,
  protectedCatalogPath: string,
  protectedSnapshot: ReturnType<typeof snapshotCatalogFiles>,
): ApplyPhase598Options {
  return {
    workspaceRoot: ROOT,
    reviewer: "phase598-ikkaku-by-nahvalur-test",
    databasePath,
    ownedRoot,
    protectedCatalogPath,
    protectedCatalogSnapshot: protectedSnapshot,
    env: {
      ...process.env,
      TURSO_DATABASE_URL: "",
      TURSO_AUTH_TOKEN: "",
      FPKG_DATABASE_URL: "",
    },
  };
}

async function entityDigest(client: Client, entityId: string): Promise<string> {
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
    "SELECT * FROM timeline_events WHERE entity_id=? ORDER BY id",
    "SELECT * FROM entity_links WHERE source_id=? OR target_id=? ORDER BY id",
    "SELECT * FROM entity_publications WHERE entity_id=?",
    "SELECT * FROM entity_content_reviews WHERE entity_id=? ORDER BY review_kind,content_hash",
  ];
  const payload = [];
  for (const sql of queries) {
    payload.push(
      await rows(
        client,
        sql,
        sql.includes(" OR ") ? [entityId, entityId] : [entityId],
      ),
    );
  }
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(payload))
    .digest("hex");
}

async function assertCollisionRejected(
  label: string,
  sourceSnapshot: ReturnType<typeof snapshotCatalogFiles>,
  protectedCatalogPath: string,
  protectedSnapshot: ReturnType<typeof snapshotCatalogFiles>,
  mutate: (client: Client) => Promise<void>,
): Promise<void> {
  const owned = createOwnedCopy(`fpkg-phase598-${label}-`, sourceSnapshot);
  const restoreProcessDatabase = bindProcessDatabaseToOwnedCopy(
    owned.databasePath,
  );
  const client = createClient({ url: `file:${owned.databasePath}` });
  try {
    await migrateDatabase(client);
    await mutate(client);
    await assert.rejects(
      applyPhase598IkkakuByNahvalurContent(
        client,
        options(
          owned.ownedRoot,
          owned.databasePath,
          protectedCatalogPath,
          protectedSnapshot,
        ),
      ),
      /collision|identity mismatch/,
    );
  } finally {
    client.close();
    restoreProcessDatabase();
  }
}

test("Phase 598 publishes the sourced IKKAKU series and sixteen models on an owned checkpoint", {
  timeout: 1_200_000,
}, async () => {
  const sourceSnapshot = snapshotCatalogFiles(SOURCE);
  const realSnapshot = snapshotCatalogFiles(REAL);
  const sourceHash = sha256(SOURCE);
  const protectedHash = sha256(REAL);
  assert.equal(sourceHash, EXPECTED_SOURCE_SHA256);
  assert.equal(protectedHash, EXPECTED_REAL_SHA256);
  const protectedGuard = createProtectedGuard(realSnapshot);
  const protectedSnapshot = protectedGuard.snapshot;

  await assertCollisionRejected(
    "id-collision",
    sourceSnapshot,
    protectedGuard.databasePath,
    protectedSnapshot,
    async (client) => {
      await client.execute({
        sql: "INSERT INTO entities(id,type,slug,name) VALUES(?,'pen',?,?)",
        args: [
          PHASE598_IDS.yeYu,
          "phase598-wrong-ye-yu",
          "Phase 598 wrong Ye-Yu",
        ],
      });
    },
  );
  await assertCollisionRejected(
    "slug-collision",
    sourceSnapshot,
    protectedGuard.databasePath,
    protectedSnapshot,
    async (client) => {
      await client.execute({
        sql: "INSERT INTO entities(id,type,slug,name) VALUES(?,'pen',?,?)",
        args: [
          "phase598-slug-collision",
          PHASE598_SLUGS.blueMoon,
          "Phase 598 Blue Moon slug collision",
        ],
      });
    },
  );
  await assertCollisionRejected(
    "name-collision",
    sourceSnapshot,
    protectedGuard.databasePath,
    protectedSnapshot,
    async (client) => {
      await client.execute({
        sql: "INSERT INTO entities(id,type,slug,name) VALUES(?,'pen',?,?)",
        args: [
          "phase598-name-collision",
          "phase598-name-collision",
          TARGETS[8]?.name,
        ],
      });
    },
  );
  await assertCollisionRejected(
    "alias-collision",
    sourceSnapshot,
    protectedGuard.databasePath,
    protectedSnapshot,
    async (client) => {
      await client.execute({
        sql: "INSERT INTO entity_aliases(id,entity_id,alias,language) VALUES(?,?,?,'en')",
        args: [
          "phase598-alias-collision",
          PHASE598_NAHVALUR_BRAND_ID,
          "IKKAKU Ye-Yu",
        ],
      });
    },
  );

  assert.equal(phase598IkkakuPacks.length, 17);
  assert.equal(phase598IkkakuModelPacks.length, 16);
  assert.equal(new Set(TARGETS.map(({ id }) => id)).size, 16);
  const imageHashes = new Set<string>();
  for (const pack of phase598IkkakuModelPacks) {
    const markdown = fs.readFileSync(
      path.join(ROOT, pack.markdownFile),
      "utf8",
    );
    const body = markdown
      .match(/^## body_md\s*\n+([\s\S]*?)(?=^## 来源\s*$)/m)?.[1]
      .trim();
    assert.ok(body && Array.from(body).length >= 2_000, pack.expectedSlug);
    assert.match(markdown, /## model_specs/);
    assert.match(markdown, /## 图片说明/);
    assert.match(markdown, /## 来源/);
    assert.doesNotMatch(body, /CuratedEntityPack|数据库字段|made_by/i);
    assert.ok(pack.sources.length >= 2);
    assert.ok(pack.spec && Object.keys(pack.spec.values).length >= 5);
    assert.equal(
      pack.media.filter(({ usageStatus }) => usageStatus === "primary").length,
      1,
    );
    const localPath = pack.media.find(
      ({ usageStatus }) => usageStatus === "primary",
    )?.localPath;
    const svgPath = path.join(
      ROOT,
      "public",
      String(localPath).replace(/^\//, ""),
    );
    const svg = fs.readFileSync(svgPath, "utf8");
    assert.match(svg, /width="1600"/);
    assert.match(svg, /height="900"/);
    assert.match(svg, /viewBox="0 0 1600 900"/);
    assert.match(svg, /role="img"/);
    assert.match(svg, /aria-labelledby="title desc"/);
    assert.match(svg, /非产品照片/);
    imageHashes.add(sha256(svgPath));
  }
  assert.equal(imageHashes.size, 16);

  const brandMarkdown = fs.readFileSync(
    path.join(ROOT, phase598IkkakuPacks[0]?.markdownFile ?? ""),
    "utf8",
  );
  const articleMarkdown = fs.readFileSync(
    path.join(
      ROOT,
      ".planning/content-research/ikkaku-series-navigation-phase598.md",
    ),
    "utf8",
  );
  for (const target of TARGETS) {
    assert.ok(brandMarkdown.includes(`[[${target.name}]]`), target.name);
    assert.ok(articleMarkdown.includes(`[[${target.name}]]`), target.name);
  }
  assert.ok(brandMarkdown.includes("[[IKKAKU by Nahvalur 系列导航]]"));

  const owned = createOwnedCopy("fpkg-phase598-ikkaku-", sourceSnapshot);
  const restoreProcessDatabase = bindProcessDatabaseToOwnedCopy(
    owned.databasePath,
  );
  const client = createClient({ url: `file:${owned.databasePath}` });
  const applyOptions = options(
    owned.ownedRoot,
    owned.databasePath,
    protectedGuard.databasePath,
    protectedSnapshot,
  );
  try {
    await migrateDatabase(client);
    const beforeCounts = (
      await rows(
        client,
        `SELECT
             (SELECT count(*) FROM public_entities) AS public_count,
             (SELECT count(*) FROM public_entities entity
               JOIN entity_links maker ON maker.source_id=entity.id AND maker.link_type='made_by'
              WHERE entity.type='pen' AND maker.target_id=?) AS nahvalur_pens`,
        [PHASE598_NAHVALUR_BRAND_ID],
      )
    )[0];
    assert.equal(Number(beforeCounts?.nahvalur_pens), 14);
    const existing = await rows(
      client,
      `SELECT entity.id FROM public_entities entity
         JOIN entity_links maker ON maker.source_id=entity.id AND maker.link_type='made_by'
         WHERE entity.type='pen' AND maker.target_id=? ORDER BY entity.id`,
      [PHASE598_NAHVALUR_BRAND_ID],
    );
    const existingDigests = new Map<string, string>();
    for (const row of existing) {
      const id = String(row.id);
      existingDigests.set(id, await entityDigest(client, id));
    }

    for (const [key, value] of [
      ["TURSO_DATABASE_URL", "libsql://remote.invalid"],
      ["TURSO_AUTH_TOKEN", "forged-token"],
      ["FPKG_DATABASE_URL", "file:/unauthorized.db"],
    ] as const) {
      const before = sha256(owned.databasePath);
      await assert.rejects(
        applyPhase598IkkakuByNahvalurContent(client, {
          ...applyOptions,
          env: { ...applyOptions.env, [key]: value } as NodeJS.ProcessEnv,
        }),
        /inherited remote database selection/,
      );
      assert.equal(sha256(owned.databasePath), before);
    }

    const first = await applyPhase598IkkakuByNahvalurContent(
      client,
      applyOptions,
    );
    assert.equal(first.entities.length, 18);
    assert.equal(
      first.entities.every(({ outcome }) => outcome === "published"),
      true,
    );

    const afterCounts = (
      await rows(
        client,
        `SELECT
             (SELECT count(*) FROM public_entities) AS public_count,
             (SELECT count(*) FROM public_entities entity
               JOIN entity_links maker ON maker.source_id=entity.id AND maker.link_type='made_by'
              WHERE entity.type='pen' AND maker.target_id=?) AS nahvalur_pens`,
        [PHASE598_NAHVALUR_BRAND_ID],
      )
    )[0];
    assert.equal(
      Number(afterCounts?.public_count),
      Number(beforeCounts?.public_count) + 17,
    );
    assert.equal(Number(afterCounts?.nahvalur_pens), 30);

    for (const target of TARGETS) {
      const state = (
        await rows(
          client,
          `SELECT entity.type,entity.slug,entity.name,entity.body_md,
                    publication.status,readiness.publishable,readiness.blocker_count,
                    CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public
             FROM entities entity
             JOIN entity_publications publication ON publication.entity_id=entity.id
             LEFT JOIN public_entity_readiness readiness
               ON readiness.entity_id=entity.id AND readiness.contract_version=3
             LEFT JOIN public_entities public ON public.id=entity.id
             WHERE entity.id=?`,
          [target.id],
        )
      )[0];
      assert.equal(state?.type, "pen");
      assert.equal(state?.slug, target.slug);
      assert.equal(state?.name, target.name);
      assert.ok(Array.from(String(state?.body_md ?? "")).length >= 2_000);
      assert.deepEqual(
        [
          state?.status,
          Number(state?.publishable),
          Number(state?.blocker_count),
          Number(state?.is_public),
        ],
        ["published", 1, 0, 1],
      );
      const topology = (
        await rows(
          client,
          `SELECT
               (SELECT count(*) FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by') AS maker,
               (SELECT count(*) FROM entity_links WHERE source_id=? AND target_id=? AND link_type='member_of_series') AS member,
               (SELECT count(*) FROM media_assets WHERE entity_id=? AND usage_status='primary') AS media,
               (SELECT count(*) FROM model_specs WHERE entity_id=?) AS specs`,
          [
            target.id,
            PHASE598_NAHVALUR_BRAND_ID,
            target.id,
            PHASE598_IKKAKU_ARTICLE_ID,
            target.id,
            target.id,
          ],
        )
      )[0];
      assert.deepEqual(
        [
          Number(topology?.maker),
          Number(topology?.member),
          Number(topology?.media),
          Number(topology?.specs),
        ],
        [1, 1, 1, 1],
      );
      const reviews = await rows(
        client,
        `SELECT review_kind,status FROM entity_content_reviews
           WHERE entity_id=? AND content_hash=(SELECT approved_content_hash FROM entity_publications WHERE entity_id=?)
           ORDER BY review_kind`,
        [target.id, target.id],
      );
      assert.deepEqual(
        reviews.map(({ review_kind, status }) => [review_kind, status]),
        [
          ["fact", "approved"],
          ["language", "approved"],
          ["media", "approved"],
          ["publication", "approved"],
        ],
      );
    }

    const article = (
      await rows(
        client,
        `SELECT entity.type,entity.slug,entity.body_md,publication.status,
                  readiness.publishable,readiness.blocker_count,
                  CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public,
                  (SELECT count(*) FROM entity_links WHERE source_id=entity.id AND link_type='reverse') AS model_links
           FROM entities entity
           LEFT JOIN entity_publications publication ON publication.entity_id=entity.id
           LEFT JOIN public_entity_readiness readiness
             ON readiness.entity_id=entity.id AND readiness.contract_version=3
           LEFT JOIN public_entities public ON public.id=entity.id
           WHERE entity.id=?`,
        [PHASE598_IKKAKU_ARTICLE_ID],
      )
    )[0];
    assert.deepEqual(
      [
        article?.type,
        article?.slug,
        article?.status,
        Number(article?.publishable),
        Number(article?.blocker_count),
        Number(article?.is_public),
        Number(article?.model_links),
      ],
      ["article", PHASE598_IKKAKU_ARTICLE_SLUG, null, 0, 0, 1, 16],
    );
    assert.ok(Array.from(String(article?.body_md ?? "")).length >= 2_000);

    const conflicts = await rows(
      client,
      `SELECT field_key,status FROM fact_conflicts
         WHERE entity_id IN (?,?,?) ORDER BY entity_id,field_key`,
      [PHASE598_IDS.yingChun, PHASE598_IDS.lanYue, PHASE598_IDS.rhinoceros],
    );
    assert.deepEqual(
      conflicts.map(({ field_key, status }) => [field_key, status]),
      [
        ["nib_material", "resolved"],
        ["edition_quantity", "resolved"],
        ["identity", "dismissed"],
        ["weight", "resolved"],
      ],
    );
    const eggSpec = (
      await rows(
        client,
        "SELECT fill_system,nib,status FROM model_specs WHERE entity_id=?",
        [PHASE598_IDS.eggshell],
      )
    )[0];
    assert.match(String(eggSpec?.fill_system), /piston/i);
    assert.match(String(eggSpec?.nib), /double-slit Music/);
    const gradientVariants = await rows(
      client,
      "SELECT variant_kind,count(*) AS count FROM model_variants WHERE model_entity_id=? GROUP BY variant_kind ORDER BY variant_kind",
      [PHASE598_IDS.gradient],
    );
    assert.deepEqual(
      gradientVariants.map(({ variant_kind, count }) => [
        variant_kind,
        Number(count),
      ]),
      [
        ["edition_group", 3],
        ["market_sku", 2],
        ["nib", 4],
      ],
    );

    for (const [id, digest] of existingDigests) {
      assert.equal(await entityDigest(client, id), digest, id);
    }
    const firstDigests = new Map<string, string>();
    for (const id of [
      PHASE598_NAHVALUR_BRAND_ID,
      ...TARGETS.map(({ id }) => id),
      PHASE598_IKKAKU_ARTICLE_ID,
    ]) {
      firstDigests.set(id, await entityDigest(client, id));
    }
    const replay = await applyPhase598IkkakuByNahvalurContent(
      client,
      applyOptions,
    );
    assert.equal(replay.entities.length, 18);
    assert.deepEqual(
      replay.entities.map(({ entityId, outcome }) => [entityId, outcome]),
      replay.entities.map(({ entityId }) => [entityId, "noop"]),
    );
    for (const [id, digest] of firstDigests) {
      assert.equal(await entityDigest(client, id), digest, id);
    }
  } finally {
    client.close();
    restoreProcessDatabase();
  }

  assertCatalogSnapshotUnchanged(sourceSnapshot);
  assertCatalogSnapshotUnchanged(protectedSnapshot);
  assert.equal(sha256(SOURCE), sourceHash);
  assert.equal(sha256(REAL), protectedHash);
  assert.deepEqual(
    catalogContentFingerprint(snapshotCatalogFiles(REAL)),
    catalogContentFingerprint(realSnapshot),
  );
});
