import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import {
  type ApplyPhase596Options,
  applyPhase596NahvalurOriginalHorizonVoyageEclipseContent,
} from "../../scripts/apply-phase596-nahvalur-original-horizon-voyage-eclipse-content";
import {
  PHASE596_ECLIPSE_BLACK_CURRENT_SKUS,
  PHASE596_ECLIPSE_COBALT_CURRENT_SKUS,
  PHASE596_HORIZON_CURRENT_SKUS,
  PHASE596_HORIZON_UNAVAILABLE_CODES,
  PHASE596_IDS,
  PHASE596_NAHVALUR_BRAND_ID,
  PHASE596_ORIGINAL_CURRENT_SKUS,
  PHASE596_SLUGS,
  PHASE596_VOYAGE_CURRENT_SKUS,
  PHASE596_VOYAGE_UNAVAILABLE_CODES,
  phase596NahvalurPacks,
} from "../../scripts/data/phase596-nahvalur-original-horizon-voyage-eclipse";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");
const SOURCE = process.env.FPKG_PHASE596_SOURCE_DATABASE
  ? fs.realpathSync.native(process.env.FPKG_PHASE596_SOURCE_DATABASE)
  : REAL;
const EXPECTED_SOURCE_SHA256 =
  "8969d5b008cb33b16bb12ab735889a198c62fb37a9aa470d0d53142a8236ff1b";

const TARGETS = [
  {
    id: PHASE596_IDS.original,
    slug: PHASE596_SLUGS.original,
    name: "Nahvalur Original Fountain Pen",
    markers: ["01010050", "Original Plus", "146.5 mm", "2019 D.C. Pen Show"],
  },
  {
    id: PHASE596_IDS.horizon,
    slug: PHASE596_SLUGS.horizon,
    name: "Nahvalur Horizon Fountain Pen",
    markers: ["07120111", "十九个", "37.5 g", "Starry Night Resins"],
  },
  {
    id: PHASE596_IDS.voyage,
    slug: PHASE596_SLUGS.voyage,
    name: "Nahvalur Voyage Fountain Pen",
    markers: ["03060390", "Nautilus", "628", "不可后插"],
  },
  {
    id: PHASE596_IDS.eclipse,
    slug: PHASE596_SLUGS.eclipse,
    name: "Nahvalur Eclipse Fountain Pen",
    markers: ["09110123", "newly engineered feed", "整杆按压", "34 g"],
  },
] as const;

const BRAND_MODEL_NAMES = [
  "Nahvalur Original Fountain Pen",
  "Nahvalur Original Plus",
  "Nahvalur Schuylkill",
  "Nahvalur Nautilus（原 Narwhal）",
  "Nahvalur Horizon Fountain Pen",
  "Nahvalur Voyage Fountain Pen",
  "Nahvalur Eclipse Fountain Pen",
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
): ApplyPhase596Options {
  return {
    workspaceRoot: ROOT,
    reviewer: "phase596-nahvalur-original-horizon-voyage-eclipse-test",
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
  const owned = createOwnedCopy(`fpkg-phase596-${label}-`, sourceSnapshot);
  const client = createClient({ url: `file:${owned.databasePath}` });
  try {
    await migrateDatabase(client);
    await mutate(client);
    await assert.rejects(
      applyPhase596NahvalurOriginalHorizonVoyageEclipseContent(
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
         (SELECT count(*)
            FROM public_entity_readiness readiness
            JOIN public_entities public ON public.id=readiness.entity_id
           WHERE readiness.contract_version=3
             AND readiness.publishable=1
             AND readiness.blocker_count=0) AS ready_count`,
    )
  )[0];
  return {
    publicCount: Number(result?.public_count),
    readyCount: Number(result?.ready_count),
  };
}

function codes(
  values: ReadonlyArray<readonly [string, string, string]>,
): string[] {
  return values.map(([, , productCode]) => productCode);
}

test("Phase 596 publishes canonical Nahvalur Original, Horizon, Voyage and Eclipse on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
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
          PHASE596_IDS.original,
          "phase596-wrong-original-id",
          "Phase 596 wrong Original identity",
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
          "phase596-slug-collision",
          PHASE596_SLUGS.horizon,
          "Phase 596 Horizon slug collision",
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
          "phase596-name-collision",
          "phase596-name-collision",
          TARGETS[2].name,
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
          "phase596-alias-collision",
          PHASE596_NAHVALUR_BRAND_ID,
          "Nahvalur Eclipse Capless Pen",
        ],
      });
    },
  );

  const owned = createOwnedCopy(
    "fpkg-phase596-nahvalur-original-horizon-voyage-eclipse-",
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

    assert.deepEqual(
      phase596NahvalurPacks.map((pack) => pack.entityId),
      [
        PHASE596_NAHVALUR_BRAND_ID,
        PHASE596_IDS.original,
        PHASE596_IDS.horizon,
        PHASE596_IDS.voyage,
        PHASE596_IDS.eclipse,
      ],
    );
    const modelPacks = phase596NahvalurPacks.filter(
      (pack) => pack.expectedType === "pen",
    );
    assert.equal(modelPacks.length, 4);
    assert.equal(new Set(modelPacks.map((pack) => pack.entityId)).size, 4);

    for (const pack of modelPacks) {
      const markdown = fs.readFileSync(
        path.join(ROOT, pack.markdownFile),
        "utf8",
      );
      assert.ok(Array.from(markdown).length >= 2_500);
      assert.match(markdown, /## summary/);
      assert.match(markdown, /## model_specs/);
      assert.match(markdown, /## body_md/);
      assert.match(markdown, /## 图片说明/);
      assert.match(markdown, /## 来源/);
      assert.match(markdown, /## (?:选购|怎么选)/);
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
        assert.match(String(source.archiveLocator), /locator=.+/);
      }
      const primary = pack.media.filter(
        (item) => item.usageStatus === "primary",
      );
      assert.equal(primary.length, 1);
      const svgPath = path.join(
        ROOT,
        "public",
        String(primary[0]?.localPath).replace(/^\//, ""),
      );
      const svg = fs.readFileSync(svgPath, "utf8");
      assert.match(svg, /width="1600"/);
      assert.match(svg, /height="900"/);
      assert.match(svg, /viewBox="0 0 1600 900"/);
      assert.match(svg, /role="img"/);
      assert.match(svg, /aria-labelledby="title desc"/);
      assert.match(svg, /<title id="title">[^<]+<\/title>/);
      assert.match(svg, /<desc id="desc">[^<]+<\/desc>/);
      assert.match(svg, /本站原创示意图/);
      assert.match(svg, /非产品照片/);
    }

    const primaryPaths = modelPacks.map(
      (pack) =>
        pack.media.find((item) => item.usageStatus === "primary")?.localPath,
    );
    assert.equal(new Set(primaryPaths).size, 4);
    assert.equal(
      new Set(
        primaryPaths.map((localPath) =>
          sha256(
            path.join(ROOT, "public", String(localPath).replace(/^\//, "")),
          ),
        ),
      ).size,
      4,
    );

    const byId = new Map(
      modelPacks.map((pack) => [pack.entityId, pack] as const),
    );
    const currentCodes = [
      ...codes(PHASE596_ORIGINAL_CURRENT_SKUS),
      ...codes(PHASE596_HORIZON_CURRENT_SKUS),
      ...codes(PHASE596_VOYAGE_CURRENT_SKUS),
      ...codes(PHASE596_ECLIPSE_BLACK_CURRENT_SKUS),
      ...codes(PHASE596_ECLIPSE_COBALT_CURRENT_SKUS),
    ];
    for (const productCode of currentCodes) {
      assert.equal(
        modelPacks.some((pack) =>
          pack.variants?.some((variant) => variant.productCode === productCode),
        ),
        true,
      );
    }
    for (const productCode of [
      ...PHASE596_HORIZON_UNAVAILABLE_CODES,
      ...PHASE596_VOYAGE_UNAVAILABLE_CODES,
    ]) {
      assert.equal(
        modelPacks.some((pack) =>
          pack.variants?.some((variant) => variant.productCode === productCode),
        ),
        false,
      );
    }
    assert.equal(
      byId
        .get(PHASE596_IDS.original)
        ?.variants?.filter((variant) => variant.variantKind === "market_sku")
        .length,
      6,
    );
    assert.equal(
      byId
        .get(PHASE596_IDS.horizon)
        ?.variants?.filter((variant) => variant.variantKind === "market_sku")
        .length,
      5,
    );
    assert.equal(
      byId
        .get(PHASE596_IDS.voyage)
        ?.variants?.filter((variant) => variant.variantKind === "market_sku")
        .length,
      5,
    );
    assert.equal(
      byId
        .get(PHASE596_IDS.eclipse)
        ?.variants?.filter((variant) => variant.variantKind === "market_sku")
        .length,
      5,
    );

    const brandMarkdown = fs.readFileSync(
      path.join(ROOT, phase596NahvalurPacks[0]?.markdownFile ?? ""),
      "utf8",
    );
    assert.ok(Array.from(brandMarkdown).length >= 2_500);
    for (const canonicalName of BRAND_MODEL_NAMES) {
      assert.ok(brandMarkdown.includes(`[[${canonicalName}]]`));
    }

    const beforeTargets = await rows(
      client,
      "SELECT id FROM entities WHERE id IN (?,?,?,?)",
      TARGETS.map((target) => target.id),
    );
    const missingBefore =
      TARGETS.length - new Set(beforeTargets.map((row) => String(row.id))).size;
    assert.equal(missingBefore, 4);

    const brandPensBeforeRows = await rows(
      client,
      `SELECT DISTINCT pen.id
         FROM public_entities pen
         JOIN entity_links maker
           ON maker.source_id=pen.id AND maker.link_type='made_by'
         WHERE pen.type='pen' AND maker.target_id=?
         ORDER BY pen.id`,
      [PHASE596_NAHVALUR_BRAND_ID],
    );
    assert.equal(brandPensBeforeRows.length, 3);
    const protectedModelDigests = new Map<string, string>();
    for (const row of brandPensBeforeRows) {
      const id = String(row.id);
      protectedModelDigests.set(id, await entityDigest(client, id));
    }
    const countsBefore = await publicationCounts(client);

    for (const [envKey, envValue] of [
      ["TURSO_DATABASE_URL", "libsql://remote.invalid"],
      ["TURSO_AUTH_TOKEN", "forged-token"],
      ["FPKG_DATABASE_URL", "file:/unauthorized.db"],
    ] as const) {
      const hashBefore = sha256(owned.databasePath);
      await assert.rejects(
        applyPhase596NahvalurOriginalHorizonVoyageEclipseContent(client, {
          ...applyOptions,
          env: {
            ...applyOptions.env,
            [envKey]: envValue,
          } as NodeJS.ProcessEnv,
        }),
        /inherited remote database selection/,
      );
      assert.equal(sha256(owned.databasePath), hashBefore);
    }

    const first =
      await applyPhase596NahvalurOriginalHorizonVoyageEclipseContent(
        client,
        applyOptions,
      );
    assert.deepEqual(
      first.entities.map((entity) => entity.entityId),
      phase596NahvalurPacks.map((pack) => pack.entityId),
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
      assert.match(String(state?.source), /^curated-content:phase596-/);
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
      assert.ok(Array.from(body).length >= 2_500);
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
                WHERE target_id=? AND link_type='reverse' AND source_id=?) AS reverse,
             (SELECT count(*) FROM model_specs WHERE entity_id=?) AS specs,
             (SELECT count(*) FROM media_assets
                WHERE entity_id=? AND usage_status='primary') AS primary_media`,
        [
          target.id,
          PHASE596_NAHVALUR_BRAND_ID,
          target.id,
          PHASE596_NAHVALUR_BRAND_ID,
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

    const variants = await rows(
      client,
      `SELECT child.model_entity_id,child.variant_kind,child.product_code,
                parent.variant_kind AS parent_kind
         FROM model_variants child
         LEFT JOIN model_variants parent ON parent.id=child.parent_variant_id
         WHERE child.model_entity_id IN (?,?,?,?)
         ORDER BY child.model_entity_id,child.product_code`,
      TARGETS.map((target) => target.id),
    );
    const persistedCodes = new Set(
      variants.map((row) => String(row.product_code)),
    );
    for (const productCode of currentCodes) {
      assert.ok(persistedCodes.has(productCode));
    }
    for (const productCode of [
      ...PHASE596_HORIZON_UNAVAILABLE_CODES,
      ...PHASE596_VOYAGE_UNAVAILABLE_CODES,
    ]) {
      assert.equal(persistedCodes.has(productCode), false);
    }
    assert.equal(
      variants.filter((row) => row.variant_kind === "edition_group").length,
      6,
    );
    assert.equal(
      variants.filter((row) => row.variant_kind === "market_sku").length,
      21,
    );
    assert.equal(
      variants
        .filter((row) => row.variant_kind === "market_sku")
        .every((row) => row.parent_kind === "edition_group"),
      true,
    );

    const specs = await rows(
      client,
      `SELECT entity_id,series_name,release_year,nib,fill_system,material,
                dimensions,weight,status
         FROM model_specs WHERE entity_id IN (?,?,?,?) ORDER BY entity_id`,
      TARGETS.map((target) => target.id),
    );
    assert.equal(specs.length, 4);
    const specById = new Map(
      specs.map((spec) => [String(spec.entity_id), spec]),
    );
    assert.match(
      String(specById.get(PHASE596_IDS.original)?.fill_system),
      /Internal piston.*not.*vacuum/i,
    );
    assert.match(
      String(specById.get(PHASE596_IDS.horizon)?.status),
      /five Soleil.*nineteen/i,
    );
    assert.match(
      String(specById.get(PHASE596_IDS.voyage)?.dimensions),
      /149 mm.*133 mm.*13 mm.*10–11\.5 mm/i,
    );
    assert.match(
      String(specById.get(PHASE596_IDS.eclipse)?.nib),
      /launch.*F\/M.*F\/M\/B/i,
    );

    const conflicts = await rows(
      client,
      `SELECT entity_id,field_key,status,count(member.id) AS member_count
         FROM fact_conflicts conflict
         LEFT JOIN fact_conflict_members member ON member.conflict_id=conflict.id
         WHERE entity_id IN (?,?,?,?)
         GROUP BY entity_id,field_key,status
         ORDER BY entity_id,field_key`,
      TARGETS.map((target) => target.id),
    );
    assert.equal(conflicts.length, 4);
    assert.ok(
      conflicts.some(
        (row) =>
          row.entity_id === PHASE596_IDS.horizon &&
          row.field_key === "variant_availability" &&
          row.status === "resolved" &&
          Number(row.member_count) === 2,
      ),
    );
    assert.ok(
      conflicts.some(
        (row) =>
          row.entity_id === PHASE596_IDS.voyage &&
          row.field_key === "model_identity" &&
          Number(row.member_count) === 2,
      ),
    );
    assert.ok(
      conflicts.some(
        (row) =>
          row.entity_id === PHASE596_IDS.eclipse &&
          row.field_key === "nib" &&
          Number(row.member_count) === 2,
      ),
    );

    const rejected = await rows(
      client,
      `SELECT spec.entity_id,evidence.field_key,source.url,
                evidence.review_status,evidence.evidence_locator AS locator
         FROM spec_field_evidence evidence
         JOIN model_specs spec ON spec.id=evidence.model_spec_id
         JOIN citations citation ON citation.id=evidence.citation_id
         JOIN source_items source ON source.id=citation.source_item_id
         WHERE spec.entity_id IN (?,?,?,?)
           AND evidence.review_status='rejected'
         ORDER BY spec.entity_id,evidence.field_key,source.url`,
      TARGETS.map((target) => target.id),
    );
    assert.ok(rejected.length >= 7);
    assert.ok(
      rejected.some(
        (row) =>
          row.entity_id === PHASE596_IDS.original &&
          row.field_key === "fill_system" &&
          /vacuum filling/.test(String(row.locator)),
      ),
    );
    assert.ok(
      rejected.some(
        (row) =>
          row.entity_id === PHASE596_IDS.horizon &&
          row.field_key === "status" &&
          /nineteen complete/.test(String(row.locator)),
      ),
    );
    assert.ok(
      rejected.some(
        (row) =>
          row.entity_id === PHASE596_IDS.voyage &&
          row.field_key === "series_name" &&
          /marketing called.*Nautilus/i.test(String(row.locator)),
      ),
    );
    assert.ok(
      rejected.some(
        (row) =>
          row.entity_id === PHASE596_IDS.eclipse &&
          row.field_key === "status" &&
          /did not use the launch version/i.test(String(row.locator)),
      ),
    );

    const brand = (
      await rows(client, "SELECT body_md FROM public_entities WHERE id=?", [
        PHASE596_NAHVALUR_BRAND_ID,
      ])
    )[0];
    const brandBody = String(brand?.body_md ?? "");
    for (const canonicalName of BRAND_MODEL_NAMES) {
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
          [PHASE596_NAHVALUR_BRAND_ID],
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
      await applyPhase596NahvalurOriginalHorizonVoyageEclipseContent(
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
