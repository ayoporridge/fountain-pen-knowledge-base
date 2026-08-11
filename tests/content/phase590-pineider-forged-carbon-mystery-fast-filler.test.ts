import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import {
  type ApplyPhase590Options,
  applyPhase590PineiderForgedCarbonMysteryFastFillerContent,
} from "../../scripts/apply-phase590-pineider-forged-carbon-mystery-fast-filler-content";
import {
  PHASE590_IDS,
  PHASE590_PINEIDER_BRAND_ID,
  PHASE590_SLUGS,
  phase590PineiderPacks,
} from "../../scripts/data/phase590-pineider-forged-carbon-mystery-fast-filler";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");
const SOURCE = process.env.FPKG_PHASE590_SOURCE_DATABASE
  ? fs.realpathSync.native(process.env.FPKG_PHASE590_SOURCE_DATABASE)
  : REAL;
const EXPECTED_SOURCE_SHA256 =
  "1df98914365416065be29ddca9d4b4a1c919a5617aeacc8a6e9c9b2394825960";

const TARGETS = [
  {
    id: PHASE590_IDS.forgedCarbon,
    slug: PHASE590_SLUGS.forgedCarbon,
    name: "Pineider Grande Bellezza Forged Carbon Fountain Pen",
    markers: ["PP2401", "158 mm", "888", "14K", "Mistery piston"],
  },
  {
    id: PHASE590_IDS.mysteryFastFiller,
    slug: PHASE590_SLUGS.mysteryFastFiller,
    name: "Pineider Mystery Fast Filler Fountain Pen",
    markers: ["SPP6901", "155 mm", "F／EF", "SPP6901F435", "Demo"],
  },
] as const;

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

function options(
  ownedRoot: string,
  databasePath: string,
  protectedSnapshot: ReturnType<typeof snapshotCatalogFiles>,
): ApplyPhase590Options {
  return {
    workspaceRoot: ROOT,
    reviewer: "phase590-pineider-forged-carbon-mystery-fast-filler-test",
    databasePath,
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
  const payload: Array<Array<Record<string, unknown>>> = [];
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
  protectedSnapshot: ReturnType<typeof snapshotCatalogFiles>,
  mutate: (client: Client) => Promise<void>,
): Promise<void> {
  const owned = createOwnedCopy(`fpkg-phase590-${label}-`, sourceSnapshot);
  const client = createClient({ url: `file:${owned.databasePath}` });
  try {
    await migrateDatabase(client);
    await mutate(client);
    await assert.rejects(
      applyPhase590PineiderForgedCarbonMysteryFastFillerContent(
        client,
        options(owned.ownedRoot, owned.databasePath, protectedSnapshot),
      ),
      /collision|identity mismatch/,
    );
  } finally {
    client.close();
  }
}

async function publicationCounts(client: Client) {
  const result = (
    await rows(
      client,
      `SELECT
         (SELECT count(*) FROM public_entities) AS public_count,
         (SELECT count(*) FROM public_entity_readiness
            WHERE contract_version=3 AND publishable=1 AND blocker_count=0) AS ready_count`,
    )
  )[0];
  return {
    publicCount: Number(result?.public_count),
    readyCount: Number(result?.ready_count),
  };
}

test("Phase 590 publishes exact Pineider Forged Carbon and Mystery Fast Filler identities on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  // Capture both protected families before any SQLite client exists. SOURCE is
  // read and copied only by the catalog snapshot/copy helpers.
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const sourceSnapshot = snapshotCatalogFiles(SOURCE);
  const protectedHash = sha256(REAL);
  const sourceHash = sha256(SOURCE);
  assert.equal(sourceHash, EXPECTED_SOURCE_SHA256);

  await assertCollisionRejected(
    "id-collision",
    sourceSnapshot,
    protectedSnapshot,
    async (client) => {
      await client.execute({
        sql: "INSERT INTO entities(id,type,slug,name) VALUES(?,'pen',?,?)",
        args: [
          PHASE590_IDS.forgedCarbon,
          "phase590-wrong-forged-id",
          "Phase 590 wrong forged identity",
        ],
      });
    },
  );
  await assertCollisionRejected(
    "slug-collision",
    sourceSnapshot,
    protectedSnapshot,
    async (client) => {
      await client.execute({
        sql: "INSERT INTO entities(id,type,slug,name) VALUES(?,'pen',?,?)",
        args: [
          "phase590-slug-collision",
          PHASE590_SLUGS.forgedCarbon,
          "Phase 590 slug collision",
        ],
      });
    },
  );
  await assertCollisionRejected(
    "name-collision",
    sourceSnapshot,
    protectedSnapshot,
    async (client) => {
      await client.execute({
        sql: "INSERT INTO entities(id,type,slug,name) VALUES(?,'pen',?,?)",
        args: [
          "phase590-name-collision",
          "phase590-name-collision",
          TARGETS[0].name,
        ],
      });
    },
  );
  await assertCollisionRejected(
    "alias-collision",
    sourceSnapshot,
    protectedSnapshot,
    async (client) => {
      await client.execute({
        sql: "INSERT INTO entity_aliases(id,entity_id,alias,language) VALUES(?,?,?,'en')",
        args: [
          "phase590-alias-collision",
          PHASE590_PINEIDER_BRAND_ID,
          "Pineider PP2401",
        ],
      });
    },
  );

  const owned = createOwnedCopy(
    "fpkg-phase590-pineider-forged-mystery-",
    sourceSnapshot,
  );
  const client = createClient({ url: `file:${owned.databasePath}` });
  const applyOptions = options(
    owned.ownedRoot,
    owned.databasePath,
    protectedSnapshot,
  );
  try {
    await migrateDatabase(client);

    const modelPacks = phase590PineiderPacks.filter(
      (pack) => pack.expectedType === "pen",
    );
    assert.equal(modelPacks.length, 2);
    assert.equal(new Set(modelPacks.map((pack) => pack.entityId)).size, 2);

    for (const pack of modelPacks) {
      const markdown = fs.readFileSync(
        path.join(ROOT, pack.markdownFile),
        "utf8",
      );
      assert.ok(Array.from(markdown).length >= 2_000);
      assert.match(markdown, /## body_md/);
      assert.match(markdown, /## 来源/);
      assert.doesNotMatch(markdown, /## model_specs/i);
      assert.doesNotMatch(markdown, /made_by|CuratedEntityPack|数据库字段/i);
      assert.ok(
        pack.sources.some((source) => source.sourceType === "official"),
      );
      assert.ok(
        pack.sources.some((source) => source.tier === "professional_secondary"),
      );
      assert.ok(
        new Set(
          pack.sources
            .filter((source) => source.itemType !== "image")
            .map((source) => source.independenceGroup),
        ).size >= 2,
      );
      for (const source of pack.sources.filter(
        (candidate) => candidate.itemType !== "image",
      )) {
        assert.match(source.url, /^https:\/\//);
        assert.equal(source.archiveUrl, source.url);
        assert.match(String(source.archiveLocator), /retrieved=2026-08-11/);
      }
      const primary = pack.media.filter(
        (media) => media.usageStatus === "primary",
      );
      assert.equal(primary.length, 1);
      const svgPath = path.join(
        ROOT,
        "public",
        String(primary[0]?.localPath).replace(/^\//, ""),
      );
      const svg = fs.readFileSync(svgPath, "utf8");
      assert.match(svg, /role="img"/);
      assert.match(svg, /aria-labelledby="title desc"/);
      assert.match(svg, /<title id="title">[^<]+<\/title>/);
      assert.match(svg, /<desc id="desc">[^<]+<\/desc>/);
      assert.match(svg, /本站原创示意图/);
      assert.match(svg, /非产品照片/);
      assert.match(svg, /1600/);
      assert.match(svg, /900/);
    }

    const primaryPaths = modelPacks.map(
      (pack) =>
        pack.media.find((media) => media.usageStatus === "primary")?.localPath,
    );
    assert.equal(new Set(primaryPaths).size, 2);
    assert.equal(
      new Set(
        primaryPaths.map((localPath) =>
          sha256(
            path.join(ROOT, "public", String(localPath).replace(/^\//, "")),
          ),
        ),
      ).size,
      2,
    );

    const beforeTargets = await rows(
      client,
      "SELECT id FROM entities WHERE id IN (?,?)",
      TARGETS.map((target) => target.id),
    );
    const beforeIds = new Set(beforeTargets.map((row) => String(row.id)));
    const missingBefore = TARGETS.length - beforeIds.size;
    assert.equal(missingBefore, 2);

    const brandPensBeforeRows = await rows(
      client,
      `SELECT DISTINCT pen.id
           FROM public_entities pen
           JOIN entity_links maker
             ON maker.source_id=pen.id AND maker.link_type='made_by'
           WHERE pen.type='pen' AND maker.target_id=?
           ORDER BY pen.id`,
      [PHASE590_PINEIDER_BRAND_ID],
    );
    assert.equal(brandPensBeforeRows.length, 5);
    const protectedModelDigests = new Map<string, string>();
    for (const row of brandPensBeforeRows) {
      const id = String(row.id);
      protectedModelDigests.set(id, await entityDigest(client, id));
    }
    const countsBefore = await publicationCounts(client);

    const ownedHashBeforeRemoteRejection = sha256(owned.databasePath);
    await assert.rejects(
      applyPhase590PineiderForgedCarbonMysteryFastFillerContent(client, {
        ...applyOptions,
        env: {
          ...applyOptions.env,
          TURSO_DATABASE_URL: "libsql://remote.invalid",
        } as NodeJS.ProcessEnv,
      }),
      /inherited remote database selection/,
    );
    assert.equal(sha256(owned.databasePath), ownedHashBeforeRemoteRejection);

    const first =
      await applyPhase590PineiderForgedCarbonMysteryFastFillerContent(
        client,
        applyOptions,
      );
    assert.deepEqual(
      first.entities.map((entity) => entity.entityId),
      phase590PineiderPacks.map((pack) => pack.entityId),
    );
    assert.equal(
      first.entities.every((entity) => entity.outcome === "published"),
      true,
    );

    for (const target of TARGETS) {
      const state = (
        await rows(
          client,
          `SELECT entity.type,entity.slug,entity.name,entity.body_md,entity.source,
                    publication.status,publication.approved_content_hash,
                    publication.content_revision,
                    publication.reviewed_content_revision,
                    publication.reviewed_contract_version,
                    readiness.publishable,readiness.blocker_count,
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
      assert.match(String(state?.source), /^curated-content:phase590-/);
      assert.equal(state?.status, "published");
      assert.equal(
        Number(state?.content_revision),
        Number(state?.reviewed_content_revision),
      );
      assert.equal(Number(state?.reviewed_contract_version), 3);
      assert.equal(Number(state?.publishable), 1);
      assert.equal(Number(state?.blocker_count), 0);
      assert.equal(Number(state?.is_public), 1);
      const body = String(state?.body_md ?? "");
      assert.ok(Array.from(body).length >= 2_000);
      for (const marker of target.markers) {
        assert.match(
          body,
          new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
        );
      }
      assert.doesNotMatch(body, /## model_specs|made_by|CuratedEntityPack/i);

      const topology = await rows(
        client,
        `SELECT
             (SELECT count(*) FROM entity_links
                WHERE source_id=? AND link_type='made_by' AND target_id=?) AS maker,
             (SELECT count(*) FROM entity_links
                WHERE source_id=? AND target_id=? AND link_type='reverse') AS reverse,
             (SELECT count(*) FROM model_specs WHERE entity_id=?) AS specs,
             (SELECT count(*) FROM media_assets
                WHERE entity_id=? AND usage_status='primary') AS primary_media`,
        [
          target.id,
          PHASE590_PINEIDER_BRAND_ID,
          PHASE590_PINEIDER_BRAND_ID,
          target.id,
          target.id,
          target.id,
        ],
      );
      assert.deepEqual(
        [
          Number(topology[0]?.maker),
          Number(topology[0]?.reverse),
          Number(topology[0]?.specs),
          Number(topology[0]?.primary_media),
        ],
        [1, 1, 1, 1],
      );

      const reviews = await rows(
        client,
        `SELECT review_kind,status FROM entity_content_reviews
             WHERE entity_id=? AND content_hash=? ORDER BY review_kind`,
        [target.id, state?.approved_content_hash],
      );
      assert.deepEqual(
        reviews,
        ["fact", "language", "media", "publication"].map((reviewKind) => ({
          review_kind: reviewKind,
          status: "approved",
        })),
      );
    }

    const specs = await rows(
      client,
      `SELECT entity_id,series_name,nib,fill_system,material,dimensions,weight,status
           FROM model_specs WHERE entity_id IN (?,?) ORDER BY entity_id`,
      TARGETS.map((target) => target.id),
    );
    assert.equal(specs.length, 2);
    const byId = new Map(specs.map((spec) => [String(spec.entity_id), spec]));
    const forgedSpec = byId.get(PHASE590_IDS.forgedCarbon);
    assert.match(String(forgedSpec?.series_name), /PP2401\/206/);
    assert.match(String(forgedSpec?.nib), /14K.*B\/EF\/F\/M\/S/);
    assert.match(String(forgedSpec?.fill_system), /Mistery piston/i);
    assert.match(String(forgedSpec?.material), /Forged Carbon.*Carbon Dream/i);
    assert.match(String(forgedSpec?.dimensions), /158 mm.*15\.6 mm/);
    assert.match(String(forgedSpec?.status), /888/);

    const mysterySpec = byId.get(PHASE590_IDS.mysteryFastFiller);
    assert.match(String(mysterySpec?.series_name), /SPP6901\/943/);
    assert.match(String(mysterySpec?.nib), /F\/EF.*metal unpublished/i);
    assert.match(
      String(mysterySpec?.fill_system),
      /accidental piston activation/i,
    );
    assert.match(
      String(mysterySpec?.material),
      /does not publish.*no material/i,
    );
    assert.match(String(mysterySpec?.dimensions), /155 mm.*15\.45 mm/);

    const conflicts = await rows(
      client,
      `SELECT entity_id,field_key,status,count(member.id) AS member_count
           FROM fact_conflicts conflict
           LEFT JOIN fact_conflict_members member ON member.conflict_id=conflict.id
           WHERE entity_id IN (?,?)
           GROUP BY entity_id,field_key,status
           ORDER BY entity_id,field_key`,
      TARGETS.map((target) => target.id),
    );
    assert.deepEqual(conflicts, [
      {
        entity_id: PHASE590_IDS.forgedCarbon,
        field_key: "edition_count",
        status: "resolved",
        member_count: 3,
      },
      {
        entity_id: PHASE590_IDS.mysteryFastFiller,
        field_key: "nib",
        status: "resolved",
        member_count: 3,
      },
      {
        entity_id: PHASE590_IDS.mysteryFastFiller,
        field_key: "series_name",
        status: "resolved",
        member_count: 2,
      },
    ]);

    const rejected = await rows(
      client,
      `SELECT spec.entity_id,evidence.field_key,source.url,evidence.review_status
           FROM spec_field_evidence evidence
           JOIN model_specs spec ON spec.id=evidence.model_spec_id
           JOIN citations citation ON citation.id=evidence.citation_id
           JOIN source_items source ON source.id=citation.source_item_id
           WHERE spec.entity_id IN (?,?) AND evidence.review_status='rejected'
           ORDER BY spec.entity_id,evidence.field_key,source.url`,
      TARGETS.map((target) => target.id),
    );
    assert.ok(rejected.length >= 6);
    assert.ok(
      rejected.some(
        (row) =>
          row.entity_id === PHASE590_IDS.forgedCarbon &&
          row.field_key === "status" &&
          String(row.url).includes("penchalet.com"),
      ),
    );
    assert.ok(
      rejected.some(
        (row) =>
          row.entity_id === PHASE590_IDS.mysteryFastFiller &&
          row.field_key === "nib" &&
          String(row.url).includes("stixis.gr"),
      ),
    );

    const brand = (
      await rows(client, "SELECT body_md FROM public_entities WHERE id=?", [
        PHASE590_PINEIDER_BRAND_ID,
      ])
    )[0];
    const brandBody = String(brand?.body_md ?? "");
    for (const canonicalName of [
      "Pineider Avatar UR",
      "Pineider Arco Fountain Pen",
      "Pineider Rock Fountain Pen",
      "Pineider Classic Palladium Fountain Pen",
      "Pineider Tempi Moderni Fountain Pen",
      "Pineider Grande Bellezza Forged Carbon Fountain Pen",
      "Pineider Mystery Fast Filler Fountain Pen",
    ]) {
      assert.ok(brandBody.includes(`[[${canonicalName}]]`));
    }

    const brandPensAfter = Number(
      (
        await rows(
          client,
          `SELECT count(DISTINCT pen.id) AS n
               FROM public_entities pen
               JOIN entity_links maker
                 ON maker.source_id=pen.id AND maker.link_type='made_by'
               WHERE pen.type='pen' AND maker.target_id=?`,
          [PHASE590_PINEIDER_BRAND_ID],
        )
      )[0]?.n,
    );
    assert.equal(brandPensAfter, 7);
    assert.equal(brandPensAfter, brandPensBeforeRows.length + missingBefore);

    const countsAfter = await publicationCounts(client);
    assert.equal(
      countsAfter.publicCount,
      countsBefore.publicCount + missingBefore,
    );
    assert.equal(
      countsAfter.readyCount,
      countsBefore.readyCount + missingBefore,
    );

    for (const [id, digest] of protectedModelDigests) {
      assert.equal(await entityDigest(client, id), digest);
    }

    const replay =
      await applyPhase590PineiderForgedCarbonMysteryFastFillerContent(
        client,
        applyOptions,
      );
    assert.equal(
      replay.entities.every((entity) => entity.outcome === "noop"),
      true,
    );
    assert.deepEqual(
      replay.entities.map((entity) => entity.contentHash),
      first.entities.map((entity) => entity.contentHash),
    );

    assert.equal(sha256(REAL), protectedHash);
    assert.equal(sha256(SOURCE), sourceHash);
    assertCatalogSnapshotUnchanged(protectedSnapshot);
    assertCatalogSnapshotUnchanged(sourceSnapshot);
  } finally {
    client.close();
  }
});
