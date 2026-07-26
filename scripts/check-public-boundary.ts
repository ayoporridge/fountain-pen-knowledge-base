import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { createClient } from "@libsql/client";
import { NextRequest } from "next/server";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../src/lib/audit/read-only-catalog";
import { getDb, migrateDatabase } from "../src/lib/db";
import {
  publishEntity,
  recordEntityContentReview,
  setEntityPublicationStatus,
} from "../src/lib/publication";
import { publicMediaFilter } from "../src/lib/public-media";
import { cleanPublicText } from "../src/lib/publicText";
import {
  assertPhase19LockedRealCatalog,
  seedQualifiedPublicationFixture,
  type QualifiedPublicationFixtureIds,
} from "./lib/phase19-fixtures";

const RETIRED_DUPLICATE_SLUGS = [
  "百乐-pilot-custom-823",
  "百利金-pelikan-m800",
  "parker-51-vintage",
  "写乐-sailor-21k-pro-gear-大鱼雷",
  "奥罗拉-aurora",
];

const LEGACY_HIDDEN_ARTICLE_SLUGS = [
  "about-us",
  "contact-us",
  "demonstrator-pens",
  "hommel-s-meteor-fountain-pen-and-its-descendants",
  "how-to-disassemble-and-reassemble-a-parker-51",
  "parker-ivorine-pastel-and-moire-oh-my",
  "personalized-pens-the-malarkey-pen",
  "pilot-iroshizuku-ink-guide",
  "preserving-your-pens-dos-and-don-ts",
  "privacy-policy",
  "readme",
  "soviet-pens",
  "tribute-pens-and-reboots",
  "world-war-ii-and-the-fountain-pen",
  "万特佳",
  "公爵-duke",
  "半句",
  "永续",
  "犀飞利-sheaffer-品牌泛称",
  "灵感提炼",
] as const;

const LEGACY_INDEX_ARTICLE_MARKERS = [
  "品牌资料索引",
  "品牌索引",
  "品牌泛称",
  "泛称页",
  "泛称引用",
  "不代表单一钢笔型号",
  "索引条目",
] as const;

const ORACLE_FACET_DIMENSIONS = {
  nib_type: "nib_type",
  nib_material: "nib_material",
  fill_system: "fill_system",
  origin: "origin",
  body_material: "body_material",
} as const;

const ORACLE_GOLD_NIB_TAG_SLUGS = [
  "nibmat-gold",
  "nibmat-14k",
  "nibmat-18k",
  "nibmat-21k",
  "nibmat-bicolor",
] as const;

const ORACLE_PUBLIC_MODEL_IDS = [
  "boundary-public-pen",
  "boundary-public-peer",
  "boundary-public-tag-peer",
  "boundary-misaligned-current",
  "boundary-misaligned-peer",
  ...Array.from(
    { length: 14 },
    (_, index) => `boundary-brand-model-${String(index + 1).padStart(2, "0")}`,
  ),
] as const;

const ORACLE_COMPATIBILITY_CONCEPT_IDS = [
  "nbElcAgDbRRU",
  "b9V0JqOxpBPx",
  "joUC4ZhCkmTh",
  "vCvOFoDMsP8U",
  "bic3mrzjjpIp",
  "rcyhCSbAfjM3",
  "9vUWy7YhiL3W",
  "sWKs7mBIQiuo",
  "b91QvquyVqcU",
] as const;

const ORACLE_EXPECTED_PUBLIC_IDS = [
  "boundary-public-brand",
  ...ORACLE_PUBLIC_MODEL_IDS,
  "boundary-public-article",
  "boundary-public-concept",
  ...ORACLE_COMPATIBILITY_CONCEPT_IDS,
] as const;

const ORACLE_EXPECTED_PRIVATE_IDS = [
  "boundary-draft-brand",
  "boundary-draft-pen",
  "boundary-draft-concept",
  "boundary-majohn-brand",
  "boundary-majohn-a1",
  "boundary-montblanc-149",
] as const;

const BOUNDARY_QUALIFICATION_SOURCE_PREFIX = "boundary-contract";
const BOUNDARY_QUALIFICATION_SOURCE_ITEM_IDS = [
  `${BOUNDARY_QUALIFICATION_SOURCE_PREFIX}-item-primary`,
  `${BOUNDARY_QUALIFICATION_SOURCE_PREFIX}-item-secondary`,
  `${BOUNDARY_QUALIFICATION_SOURCE_PREFIX}-item-mirror`,
] as const;
const BOUNDARY_QUALIFICATION_REGISTRY_IDS = [
  `${BOUNDARY_QUALIFICATION_SOURCE_PREFIX}-registry-primary`,
  `${BOUNDARY_QUALIFICATION_SOURCE_PREFIX}-registry-secondary`,
  `${BOUNDARY_QUALIFICATION_SOURCE_PREFIX}-registry-mirror`,
] as const;

const SPEC_FIELDS = [
  "series_name",
  "release_year",
  "origin_country",
  "nib",
  "fill_system",
  "material",
  "dimensions",
  "weight",
  "price_range",
  "status",
] as const;

const ROOT = process.cwd();
const REAL_DATABASE_PATH = path.join(ROOT, "data", "fpkg.db");
const PUBLICATION_DENYLIST = new Set([
  "id",
  "entity_id",
  "status",
  "depth_tier",
  "quality_score",
  "blockers_json",
  "approved_content_hash",
  "content_revision",
  "reviewed_content_revision",
  "reviewed_contract_version",
  "reviewed_by",
  "reviewed_at",
  "published_at",
  "review_notes",
  "created_at",
  "updated_at",
]);
const PUBLICATION_STATE_DENYLIST = new Set([
  "depth_tier",
  "quality_score",
  "blockers_json",
  "approved_content_hash",
  "content_revision",
  "reviewed_content_revision",
  "reviewed_contract_version",
  "reviewed_by",
  "reviewed_at",
  "published_at",
  "review_notes",
]);

function assertCondition(
  condition: unknown,
  message: string,
): asserts condition {
  if (!condition) throw new Error(message);
}

function actualPublicViewMembership(alias: string): string {
  assertCondition(
    /^[A-Za-z_][A-Za-z0-9_]*$/.test(alias),
    `Invalid checker SQL alias: ${alias}`,
  );
  return `EXISTS (
    SELECT 1
    FROM public_entities checker_public_entity
    WHERE checker_public_entity.id = ${alias}.id
  )`;
}

function sortedUnique(values: Iterable<string>): string[] {
  return [...new Set(values)].sort((left, right) =>
    left.localeCompare(right),
  );
}

function assertSetEqual(
  actualValues: Iterable<string>,
  expectedValues: Iterable<string>,
  label: string,
): void {
  const actual = new Set(actualValues);
  const expected = new Set(expectedValues);
  const actualOnly = sortedUnique([...actual].filter((value) => !expected.has(value)));
  const expectedOnly = sortedUnique(
    [...expected].filter((value) => !actual.has(value)),
  );
  assertCondition(
    actualOnly.length === 0 && expectedOnly.length === 0,
    `${label} set mismatch; actual-only=${actualOnly.join(",") || "none"}; expected-only=${expectedOnly.join(",") || "none"}.`,
  );
}

function assertSubset(
  actualValues: Iterable<string>,
  expectedValues: Iterable<string>,
  label: string,
): void {
  const expected = new Set(expectedValues);
  const illegal = sortedUnique(
    [...actualValues].filter((value) => !expected.has(value)),
  );
  assertCondition(
    illegal.length === 0,
    `${label} emitted illegal context target(s): ${illegal.join(", ")}.`,
  );
}

async function collectParityFailure(
  failures: string[],
  label: string,
  run: () => Promise<void> | void,
): Promise<void> {
  try {
    await run();
  } catch (error) {
    failures.push(`${label}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function fileSnapshot(filePath: string) {
  if (!fs.existsSync(filePath)) return { exists: false } as const;
  const stat = fs.statSync(filePath);
  return {
    exists: true,
    inode: stat.ino,
    size: stat.size,
    mtimeMs: stat.mtimeMs,
    ctimeMs: stat.ctimeMs,
    sha256: createHash("sha256").update(fs.readFileSync(filePath)).digest("hex"),
  } as const;
}

function realDatabaseSnapshot() {
  return Object.fromEntries(
    [REAL_DATABASE_PATH, `${REAL_DATABASE_PATH}-wal`, `${REAL_DATABASE_PATH}-shm`].map(
      (filePath) => [path.basename(filePath), fileSnapshot(filePath)],
    ),
  );
}

function assertRealDatabaseUnchanged(
  before: ReturnType<typeof realDatabaseSnapshot>,
  label: string,
) {
  const after = realDatabaseSnapshot();
  assertCondition(
    JSON.stringify(after) === JSON.stringify(before),
    `${label} touched the real data/fpkg.db database.\nBefore: ${JSON.stringify(before)}\nAfter: ${JSON.stringify(after)}`,
  );
}

async function assertDisposableMigrateRunner(): Promise<void> {
  const before = realDatabaseSnapshot();
  const tempRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-public-boundary-migrate-")),
  );
  const databasePath = path.join(tempRoot, "fixture.db");

  try {
    const result = spawnSync("pnpm", ["migrate"], {
      cwd: ROOT,
      env: {
        ...process.env,
        TURSO_DATABASE_URL: "",
        TURSO_AUTH_TOKEN: "",
        FPKG_DATABASE_URL: `file:${databasePath}`,
        PUBLICATION_GATE_FIXTURE: "1",
      },
      encoding: "utf8",
    });
    assertCondition(
      result.status === 0,
      `Disposable migrate child failed.\n${result.stdout}\n${result.stderr}`,
    );

    const fixture = createClient({ url: `file:${databasePath}` });
    try {
      const applied = await fixture.execute({
        sql: "SELECT checksum FROM migrations WHERE name = ? LIMIT 1",
        args: ["030_publication_gate.sql"],
      });
      assertCondition(
        applied.rows.length === 1,
        "Disposable migrate child did not apply 030_publication_gate.sql.",
      );
    } finally {
      fixture.close();
    }
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }

  assertCondition(
    !fs.existsSync(tempRoot),
    `Disposable migrate fixture was not cleaned: ${tempRoot}`,
  );
  assertRealDatabaseUnchanged(before, "Disposable migrate regression");
}

async function insertBoundaryEntity(
  db: ReturnType<typeof createClient>,
  id: string,
  type: string,
) {
  await db.execute({
    sql: `
      INSERT INTO entities (id, type, slug, name, summary, body_md, source)
      VALUES (?, ?, ?, ?, ?, ?, 'boundary-fixture')
    `,
    args: [
      id,
      type,
      id,
      `Boundary ${id}`,
      `${id} summary`,
      `${id} body`,
    ],
  });
}

async function seedQualifiedBoundaryEntity(
  db: ReturnType<typeof createClient>,
  entityId: string,
  entityType: "brand" | "pen",
  brandEntityId?: string,
): Promise<QualifiedPublicationFixtureIds> {
  return seedQualifiedPublicationFixture(db, {
    entityId,
    entityType,
    brandEntityId,
    sharedSourcePrefix: BOUNDARY_QUALIFICATION_SOURCE_PREFIX,
    includeSecondarySurfaceRows: false,
  });
}

async function approveBoundaryEntity(
  db: ReturnType<typeof createClient>,
  entityId: string,
): Promise<void> {
  for (const reviewKind of ["fact", "language", "media"] as const) {
    await recordEntityContentReview(db, {
      entityId,
      reviewKind,
      reviewer: `boundary-${reviewKind}-reviewer`,
      status: "approved",
      notes: "Contract-v2 public-boundary fixture review.",
    });
  }
  await publishEntity(db, {
    entityId,
    reviewer: "boundary-publication-reviewer",
  });
}

async function qualifyBoundarySpecFields(
  db: ReturnType<typeof createClient>,
  entityId: string,
  fields: readonly string[],
): Promise<void> {
  for (const field of fields) {
    await db.execute({
      sql: `
        INSERT INTO spec_field_evidence (
          id, model_spec_id, field_key, citation_id, scope_id,
          evidence_locator, review_status
        ) VALUES (?, ?, ?, ?, ?, ?, 'approved')
      `,
      args: [
        `${entityId}-spec-evidence-${field}`,
        `${entityId}-spec`,
        field,
        `${entityId}-citation-spec-primary`,
        `${entityId}-scope`,
        `boundary-spec:${entityId}:${field}`,
      ],
    });
  }
}

async function seedBoundaryFixtures(db: ReturnType<typeof createClient>) {
  await seedQualifiedBoundaryEntity(db, "boundary-public-brand", "brand");
  await approveBoundaryEntity(db, "boundary-public-brand");

  await insertBoundaryEntity(db, "boundary-draft-brand", "brand");
  await insertBoundaryEntity(db, "boundary-draft-pen", "pen");

  await seedQualifiedBoundaryEntity(
    db,
    "boundary-public-pen",
    "pen",
    "boundary-public-brand",
  );
  // Adding the pen's made_by relation invalidates the brand's relationship
  // snapshot, so refresh the brand review before publishing the pen fixture.
  await approveBoundaryEntity(db, "boundary-public-brand");
  await approveBoundaryEntity(db, "boundary-public-pen");

  await insertBoundaryEntity(db, "boundary-public-article", "article");

  await db.execute(`
    INSERT INTO entity_links (id, source_id, target_id, link_type)
    VALUES (
      'boundary-draft-pen-maker',
      'boundary-draft-pen',
      'boundary-public-brand',
      'made_by'
    )
  `);
  await db.execute(`
    INSERT INTO tags (id, name, slug, dimension, level)
    VALUES
      ('boundary-tag-nib', 'Boundary Nib', 'boundary-nib', 'nib_type', 'atom'),
      ('boundary-tag-gold', 'Boundary Gold', 'nibmat-14k', 'nib_material', 'atom'),
      ('boundary-tag-origin', 'Boundary Origin', 'boundary-origin', 'origin', 'atom'),
      ('boundary-tag-material', 'Boundary Material', 'boundary-material', 'body_material', 'atom')
  `);
  await db.execute(`
    INSERT INTO entity_tags (id, entity_id, tag_id)
    VALUES
      ('boundary-public-pen-nib', 'boundary-public-pen', 'boundary-tag-nib'),
      ('boundary-public-pen-gold', 'boundary-public-pen', 'boundary-tag-gold'),
      ('boundary-draft-pen-nib', 'boundary-draft-pen', 'boundary-tag-nib'),
      ('boundary-draft-pen-gold', 'boundary-draft-pen', 'boundary-tag-gold'),
      ('boundary-public-brand-origin', 'boundary-public-brand', 'boundary-tag-origin'),
      ('boundary-draft-brand-origin', 'boundary-draft-brand', 'boundary-tag-origin'),
      ('boundary-public-article-material', 'boundary-public-article', 'boundary-tag-material')
  `);
  await db.execute(`
    INSERT INTO entity_links (id, source_id, target_id, link_type)
    VALUES
      ('boundary-public-article-pen', 'boundary-public-article', 'boundary-public-pen', 'related'),
      ('boundary-public-article-draft-brand', 'boundary-public-article', 'boundary-draft-brand', 'related'),
      ('boundary-draft-pen-public-article', 'boundary-draft-pen', 'boundary-public-article', 'related')
  `);
}

function sortedKeys(value: Record<string, unknown>): string[] {
  return Object.keys(value).sort();
}

function assertExactKeys(
  value: unknown,
  expected: readonly string[],
  label: string,
) {
  assertCondition(
    value !== null && typeof value === "object" && !Array.isArray(value),
    `${label} is not an object.`,
  );
  const actual = sortedKeys(value as Record<string, unknown>);
  assertCondition(
    JSON.stringify(actual) === JSON.stringify([...expected].sort()),
    `${label} keys differ: ${actual.join(", ")}`,
  );
}

function assertNoPublicationInternals(value: unknown, label: string): void {
  if (Array.isArray(value)) {
    value.forEach((item, index) =>
      assertNoPublicationInternals(item, `${label}[${index}]`),
    );
    return;
  }
  if (!value || typeof value !== "object") return;

  for (const [key, child] of Object.entries(value)) {
    assertCondition(
      !PUBLICATION_DENYLIST.has(key),
      `${label} leaked publication/internal key: ${key}`,
    );
    assertNoPublicationInternals(child, `${label}.${key}`);
  }
}

function assertNoPublicationStateInternals(value: unknown, label: string): void {
  if (Array.isArray(value)) {
    value.forEach((item, index) =>
      assertNoPublicationStateInternals(item, `${label}[${index}]`),
    );
    return;
  }
  if (!value || typeof value !== "object") return;

  for (const [key, child] of Object.entries(value)) {
    assertCondition(
      !PUBLICATION_STATE_DENYLIST.has(key),
      `${label} leaked publication-state key: ${key}`,
    );
    assertNoPublicationStateInternals(child, `${label}.${key}`);
  }
}

function assertJsonEqual(actual: unknown, expected: unknown, label: string) {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);
  assertCondition(
    actualJson === expectedJson,
    `${label} differs.\nExpected: ${expectedJson}\nActual: ${actualJson}`,
  );
}

function normalizeCountRows(
  rows: Array<{ type: unknown; cnt: unknown }>,
): Array<{ type: string; cnt: number }> {
  return rows
    .map((row) => ({ type: String(row.type), cnt: Number(row.cnt) }))
    .sort((a, b) => a.type.localeCompare(b.type));
}

function walkReactTree(
  value: unknown,
  visit: (props: Record<string, unknown>) => void,
): void {
  if (Array.isArray(value)) {
    value.forEach((child) => walkReactTree(child, visit));
    return;
  }
  if (!value || typeof value !== "object") return;
  const props = (value as { props?: unknown }).props;
  if (!props || typeof props !== "object" || Array.isArray(props)) return;
  const record = props as Record<string, unknown>;
  visit(record);
  walkReactTree(record.children, visit);
}

function reactText(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  if (Array.isArray(value)) return value.map(reactText).join("");
  if (!value || typeof value !== "object") return "";
  return reactText((value as { props?: { children?: unknown } }).props?.children);
}

async function expectNextControlFlow(
  run: () => Promise<unknown>,
  digestFragment: string,
  label: string,
) {
  try {
    await run();
  } catch (error) {
    const digest = String((error as { digest?: unknown })?.digest || "");
    assertCondition(
      digest.includes(digestFragment),
      `${label} threw an unexpected control-flow error: ${digest || String(error)}`,
    );
    return;
  }
  throw new Error(`${label} did not trigger ${digestFragment}.`);
}

async function runCoreDetailChecks() {
  await assertDisposableMigrateRunner();
  const before = realDatabaseSnapshot();
  const tempRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-public-boundary-core-")),
  );
  const databasePath = path.join(tempRoot, "fixture.db");
  const databaseUrl = `file:${databasePath}`;
  const fixtureDb = createClient({ url: databaseUrl });

  process.env.TURSO_DATABASE_URL = "";
  process.env.TURSO_AUTH_TOKEN = "";
  process.env.FPKG_DATABASE_URL = databaseUrl;
  process.env.PUBLICATION_GATE_FIXTURE = "1";

  try {
    await migrateDatabase(fixtureDb);
    await seedBoundaryFixtures(fixtureDb);

    const visibility = await import("../src/lib/public-visibility");
    const reactModule = await import("react");
    Object.assign(globalThis, { React: reactModule.default });
    const detail = await import("../src/app/[type]/[slug]/page");
    const sitemapModule = await import("../src/app/sitemap");
    const middlewareModule = await import("../src/middleware");

    const fixtures = [
      ["brand", "boundary-public-brand", true],
      ["brand", "boundary-draft-brand", false],
      ["pen", "boundary-public-pen", true],
      ["pen", "boundary-draft-pen", false],
      ["article", "boundary-public-article", true],
    ] as const;
    for (const [type, slug, expected] of fixtures) {
      const direct = await fixtureDb.execute({
        sql: "SELECT 1 FROM public_entities WHERE type = ? AND slug = ?",
        args: [type, slug],
      });
      assertCondition(
        (direct.rows.length === 1) === expected,
        `${type}/${slug} fixture public expectation is wrong.`,
      );
      const helper = await visibility.getPublicEntityBySlug(type, slug);
      assertCondition(
        Boolean(helper) === expected,
        `${type}/${slug} helper visibility diverged from public_entities.`,
      );
    }

    const metadata = await detail.generateMetadata({
      params: Promise.resolve({
        type: "brand",
        slug: "boundary-public-brand",
      }),
    });
    assertCondition(
      metadata.alternates?.canonical === "/brand/boundary-public-brand",
      "Published metadata did not emit its canonical path.",
    );
    await detail.default({
      params: Promise.resolve({ type: "pen", slug: "boundary-public-pen" }),
    });
    await expectNextControlFlow(
      () =>
        detail.generateMetadata({
          params: Promise.resolve({
            type: "brand",
            slug: "boundary-draft-brand",
          }),
        }),
      "404",
      "Draft metadata",
    );
    await expectNextControlFlow(
      () =>
        detail.default({
          params: Promise.resolve({
            type: "pen",
            slug: "boundary-draft-pen",
          }),
        }),
      "404",
      "Draft detail",
    );
    await expectNextControlFlow(
      () =>
        detail.generateMetadata({
          params: Promise.resolve({
            type: "pen",
            slug: "百乐-pilot-custom-823",
          }),
        }),
      "NEXT_REDIRECT",
      "Legacy alias metadata",
    );
    await expectNextControlFlow(
      () =>
        detail.generateMetadata({
          params: Promise.resolve({
            type: "pen",
            slug: "pilot-custom-823",
          }),
        }),
      "404",
      "Draft canonical alias target",
    );

    const sitemap = await sitemapModule.default();
    const sitemapUrls = new Set(sitemap.map((entry) => entry.url));
    assertCondition(
      sitemapUrls.has(
        "https://fountain-pen-graph.vercel.app/brand/boundary-public-brand",
      ),
      "Sitemap omitted the published brand fixture.",
    );
    assertCondition(
      !sitemapUrls.has(
        "https://fountain-pen-graph.vercel.app/brand/boundary-draft-brand",
      ),
      "Sitemap leaked the draft brand fixture.",
    );
    assertCondition(
      detail.dynamic === "force-dynamic" &&
        sitemapModule.dynamic === "force-dynamic",
      "Detail or sitemap is not force-dynamic.",
    );

    const draftMiddlewareResponse = await middlewareModule.middleware(
      new NextRequest(
        "https://fountain-pen-graph.vercel.app/brand/boundary-draft-brand",
      ),
    );
    assertCondition(
      draftMiddlewareResponse.status === 404 &&
        draftMiddlewareResponse.headers.get("cache-control") === "no-store" &&
        draftMiddlewareResponse.headers.get("x-robots-tag") === "noindex" &&
        !draftMiddlewareResponse.headers.has("location"),
      "Middleware did not return a hard, non-indexable, no-store 404 for the draft brand.",
    );

    const publicMiddlewareResponse = await middlewareModule.middleware(
      new NextRequest(
        "https://fountain-pen-graph.vercel.app/brand/boundary-public-brand",
      ),
    );
    assertCondition(
      publicMiddlewareResponse.headers.get("x-middleware-next") === "1",
      "Middleware did not pass the published brand through to the page renderer.",
    );
  } finally {
    try {
      getDb().close();
    } finally {
      fixtureDb.close();
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
  }

  assertCondition(!fs.existsSync(tempRoot), "Core detail fixture was not cleaned.");
  assertRealDatabaseUnchanged(before, "Core detail checks");
  console.log(
    "Core detail boundary passed: disposable migrate, helper, detail, metadata, sitemap, redirects, and middleware are fail-closed.",
  );
}

async function runCoreApiChecks() {
  const before = realDatabaseSnapshot();
  const tempRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-public-boundary-api-")),
  );
  const databasePath = path.join(tempRoot, "fixture.db");
  const databaseUrl = `file:${databasePath}`;
  const fixtureDb = createClient({ url: databaseUrl });

  process.env.TURSO_DATABASE_URL = "";
  process.env.TURSO_AUTH_TOKEN = "";
  process.env.FPKG_DATABASE_URL = databaseUrl;
  process.env.PUBLICATION_GATE_FIXTURE = "1";

  try {
    await migrateDatabase(fixtureDb);
    await seedBoundaryFixtures(fixtureDb);
    const listRoute = await import("../src/app/api/entities/route");
    const detailRoute = await import("../src/app/api/entities/[slug]/route");
    const previewRoute = await import(
      "../src/app/api/entities/[slug]/preview/route"
    );

    const listResponse = await listRoute.GET(
      new NextRequest("http://boundary.invalid/api/entities"),
    );
    assertCondition(
      listResponse.headers.get("cache-control") === "no-store",
      "Entity list API is not no-store.",
    );
    const listBody = (await listResponse.json()) as Array<
      Record<string, unknown>
    >;
    const expectedRows = await fixtureDb.execute(
      "SELECT type, slug FROM public_entities ORDER BY type, slug",
    );
    const expectedSet = expectedRows.rows
      .map((row) => `${row.type}/${row.slug}`)
      .sort();
    const actualSet = listBody
      .map((row) => `${row.type}/${row.slug}`)
      .sort();
    assertCondition(
      JSON.stringify(actualSet) === JSON.stringify(expectedSet),
      "Entity list API is not bidirectionally equal to public_entities.",
    );
    for (const [index, row] of listBody.entries()) {
      assertExactKeys(row, ["type", "slug", "name", "summary"], `list[${index}]`);
    }
    assertNoPublicationInternals(listBody, "entity list");

    const penListResponse = await listRoute.GET(
      new NextRequest("http://boundary.invalid/api/entities?type=pen"),
    );
    const penList = (await penListResponse.json()) as Array<
      Record<string, unknown>
    >;
    assertCondition(
      penList.length === 1 && penList[0]?.slug === "boundary-public-pen",
      "Typed entity list did not return exactly the published pen fixture.",
    );

    const detailResponse = await detailRoute.GET(
      new NextRequest(
        "http://boundary.invalid/api/entities/boundary-public-brand",
      ),
      { params: Promise.resolve({ slug: "boundary-public-brand" }) },
    );
    const detailBody = (await detailResponse.json()) as Record<string, unknown>;
    assertCondition(
      detailResponse.status === 200 &&
        detailResponse.headers.get("cache-control") === "no-store",
      "Entity detail API is not a no-store 200 for a published fixture.",
    );
    assertExactKeys(
      detailBody,
      ["type", "slug", "name", "summary"],
      "detail",
    );
    assertCondition(detailBody.summary === null, "Brand API summary must stay null.");
    assertNoPublicationInternals(detailBody, "entity detail");

    const previewResponse = await previewRoute.GET(
      new NextRequest(
        "http://boundary.invalid/api/entities/boundary-public-pen/preview",
      ),
      { params: Promise.resolve({ slug: "boundary-public-pen" }) },
    );
    const previewBody = (await previewResponse.json()) as Record<string, unknown>;
    assertCondition(
      previewResponse.status === 200 &&
        previewResponse.headers.get("cache-control") === "no-store",
      "Entity preview API is not a no-store 200 for a published fixture.",
    );
    assertExactKeys(
      previewBody,
      ["type", "slug", "name", "summary", "link_count", "tags"],
      "preview",
    );
    assertNoPublicationInternals(previewBody, "entity preview");

    for (const [label, response] of [
      [
        "detail",
        await detailRoute.GET(
          new NextRequest(
            "http://boundary.invalid/api/entities/boundary-draft-brand",
          ),
          { params: Promise.resolve({ slug: "boundary-draft-brand" }) },
        ),
      ],
      [
        "preview",
        await previewRoute.GET(
          new NextRequest(
            "http://boundary.invalid/api/entities/boundary-draft-pen/preview",
          ),
          { params: Promise.resolve({ slug: "boundary-draft-pen" }) },
        ),
      ],
    ] as const) {
      assertCondition(
        response.status === 404 &&
          response.headers.get("cache-control") === "no-store",
        `Draft ${label} API did not return a no-store 404.`,
      );
    }

    assertCondition(
      listRoute.dynamic === "force-dynamic" &&
        detailRoute.dynamic === "force-dynamic" &&
        previewRoute.dynamic === "force-dynamic",
      "An entity API route is not force-dynamic.",
    );
  } finally {
    try {
      getDb().close();
    } finally {
      fixtureDb.close();
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
  }

  assertCondition(!fs.existsSync(tempRoot), "Core API fixture was not cleaned.");
  assertRealDatabaseUnchanged(before, "Core API checks");
  console.log(
    "Core API boundary passed: list/detail/preview match public_entities, expose exact DTOs, and are no-store.",
  );
}

async function runDiscoveryListChecks() {
  const before = realDatabaseSnapshot();
  const tempRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-public-boundary-lists-")),
  );
  const databasePath = path.join(tempRoot, "fixture.db");
  const databaseUrl = `file:${databasePath}`;
  const fixtureDb = createClient({ url: databaseUrl });

  process.env.TURSO_DATABASE_URL = "";
  process.env.TURSO_AUTH_TOKEN = "";
  process.env.FPKG_DATABASE_URL = databaseUrl;
  process.env.PUBLICATION_GATE_FIXTURE = "1";

  try {
    await migrateDatabase(fixtureDb);
    await seedBoundaryFixtures(fixtureDb);

    const browseDataModule = await import("../src/lib/browse-data");
    const homeModule = await import("../src/app/page");
    const browsePageModule = await import("../src/app/browse/page");
    const dimensionPageModule = await import(
      "../src/app/by/[dimension]/page"
    );
    const browseRouteModule = await import("../src/app/api/browse/route");
    const reactModule = await import("react");
    Object.assign(globalThis, { React: reactModule.default });

    const expectedIdentityRows = await fixtureDb.execute(
      "SELECT type, slug FROM public_entities ORDER BY type, slug",
    );
    const expectedIdentities = expectedIdentityRows.rows.map((row) =>
      `${row.type}/${row.slug}`,
    );
    const browse = await browseDataModule.getBrowseData({ limit: "50" });
    const browseIdentities = browse.entities
      .map((entity) => `${entity.type}/${entity.slug}`)
      .sort();
    assertJsonEqual(
      browseIdentities,
      [...expectedIdentities].sort(),
      "Browse row set",
    );
    assertCondition(
      browse.total === expectedIdentities.length,
      "Browse total is not exactly the public_entities row count.",
    );
    browse.entities.forEach((entity, index) =>
      assertExactKeys(
        entity,
        [
          "type",
          "slug",
          "name",
          "summary",
          "classification",
          "source_count",
          "image_url",
        ],
        `browse.entities[${index}]`,
      ),
    );
    assertNoPublicationInternals(browse, "browse data");

    const expectedTypeRows = await fixtureDb.execute(
      `SELECT type, COUNT(*) as cnt
       FROM public_entities
       GROUP BY type`,
    );
    const expectedTypeCounts = normalizeCountRows(
      expectedTypeRows.rows as Array<{ type: unknown; cnt: unknown }>,
    );
    assertJsonEqual(
      normalizeCountRows(browse.typeCounts),
      expectedTypeCounts,
      "Browse type counts",
    );

    const expectedFacets: Record<
      string,
      Array<{ slug: string; name: string; count: number }>
    > = {};
    for (const [facetKey, info] of Object.entries(
      browseDataModule.FACET_DIMENSIONS,
    )) {
      const rows = await fixtureDb.execute({
        sql: `SELECT tag.slug, tag.name, COUNT(DISTINCT public_entity.id) as cnt
              FROM tags tag
              JOIN entity_tags tagged ON tagged.tag_id = tag.id
              JOIN public_entities public_entity
                ON public_entity.id = tagged.entity_id
              WHERE tag.dimension = ?
              GROUP BY tag.id
              HAVING cnt > 0`,
        args: [info.tagDimension],
      });
      const options = rows.rows.map((row) => ({
        slug: String(row.slug),
        name: String(row.name),
        count: Number(row.cnt),
      }));
      if (facetKey === "nib_material") {
        const gold = await fixtureDb.execute({
          sql: `SELECT COUNT(DISTINCT public_entity.id) as cnt
                FROM public_entities public_entity
                JOIN entity_tags tagged ON tagged.entity_id = public_entity.id
                JOIN tags tag ON tag.id = tagged.tag_id
                WHERE tag.dimension = 'nib_material'
                  AND tag.slug IN (${browseDataModule.GOLD_NIB_TAG_SLUGS.map(() => "?").join(", ")})`,
          args: [...browseDataModule.GOLD_NIB_TAG_SLUGS],
        });
        const count = Number(gold.rows[0]?.cnt || 0);
        if (count > 0) {
          options.push({ slug: "gold", name: "所有金尖", count });
        }
      }
      expectedFacets[facetKey] = options.sort((a, b) =>
        a.slug.localeCompare(b.slug),
      );
    }
    const actualFacets = Object.fromEntries(
      Object.entries(browse.facets).map(([key, options]) => [
        key,
        [...options].sort((a, b) => a.slug.localeCompare(b.slug)),
      ]),
    );
    assertJsonEqual(actualFacets, expectedFacets, "Browse keyed facets");

    const filteredBrowse = await browseDataModule.getBrowseData({
      nib_type: "boundary-nib",
      limit: "50",
    });
    const expectedFilteredRows = await fixtureDb.execute({
      sql: `SELECT public_entity.type, public_entity.slug
            FROM public_entities public_entity
            WHERE EXISTS (
              SELECT 1
              FROM entity_tags tagged
              JOIN tags tag ON tag.id = tagged.tag_id
              WHERE tagged.entity_id = public_entity.id
                AND tag.dimension = 'nib_type'
                AND tag.slug = ?
            )
            ORDER BY public_entity.type, public_entity.slug`,
      args: ["boundary-nib"],
    });
    assertJsonEqual(
      filteredBrowse.entities
        .map((entity) => `${entity.type}/${entity.slug}`)
        .sort(),
      expectedFilteredRows.rows
        .map((row) => `${row.type}/${row.slug}`)
        .sort(),
      "Filtered browse row set",
    );

    const apiResponse = await browseRouteModule.GET(
      new NextRequest("http://boundary.invalid/api/browse?limit=50"),
    );
    const apiBody = (await apiResponse.json()) as Record<string, unknown>;
    assertCondition(
      apiResponse.headers.get("cache-control") === "no-store",
      "Browse API is not no-store.",
    );
    assertJsonEqual(apiBody, browse, "Browse API DTO");
    assertNoPublicationInternals(apiBody, "browse API");

    const home = await browseDataModule.getHomeDiscoveryData();
    assertJsonEqual(
      normalizeCountRows(home.stats),
      expectedTypeCounts,
      "Home statistics",
    );
    const expectedFeaturedRows = await fixtureDb.execute(
      `SELECT public_entity.type,
              public_entity.slug,
              COUNT(DISTINCT tag.id) as tag_count
       FROM public_entities public_entity
       LEFT JOIN entity_tags tagged ON tagged.entity_id = public_entity.id
       LEFT JOIN tags tag
         ON tag.id = tagged.tag_id
        AND tag.dimension IN (
          'nib_type', 'nib_material', 'fill_system', 'origin', 'body_material'
        )
       GROUP BY public_entity.id
       HAVING tag_count >= 1`,
    );
    const expectedFeatured = expectedFeaturedRows.rows
      .map((row) => ({
        key: `${row.type}/${row.slug}`,
        tagCount: Number(row.tag_count),
      }))
      .sort((a, b) => a.key.localeCompare(b.key));
    const actualFeatured = home.featured
      .map((row) => ({
        key: `${row.type}/${row.slug}`,
        tagCount: row.tagCount,
      }))
      .sort((a, b) => a.key.localeCompare(b.key));
    assertJsonEqual(actualFeatured, expectedFeatured, "Home featured rows");
    assertNoPublicationInternals(home, "home discovery");

    for (const breakdown of home.typeBreakdown) {
      const expectedStars = await fixtureDb.execute({
        sql: `SELECT public_entity.name, public_entity.slug
              FROM public_entities public_entity
              WHERE public_entity.type = ?
              ORDER BY (
                         SELECT COUNT(*)
                         FROM entity_tags tagged
                         JOIN tags tag ON tag.id = tagged.tag_id
                         WHERE tagged.entity_id = public_entity.id
                           AND tag.dimension IN (
                             'nib_type', 'nib_material', 'fill_system', 'origin',
                             'body_material'
                           )
                       ) DESC,
                       public_entity.created_at DESC
              LIMIT ?`,
        args: [breakdown.type, breakdown.type === "pen" ? 3 : 2],
      });
      assertJsonEqual(
        breakdown.stars
          .map((star) => `${star.name}/${star.slug}`)
          .sort(),
        expectedStars.rows
          .map((star) => `${star.name}/${star.slug}`)
          .sort(),
        `Home ${breakdown.type} stars`,
      );
      const expectedCount = expectedTypeCounts.find(
        (row) => row.type === breakdown.type,
      )?.cnt;
      assertCondition(
        breakdown.cnt === expectedCount,
        `Home ${breakdown.type} count differs from public_entities.`,
      );
    }

    const brandDimension = await browseDataModule.getDimensionDiscoveryData(
      "brand",
      "brand",
    );
    const expectedBrandRows = await fixtureDb.execute(
      `SELECT public_brand.name,
              public_brand.slug,
              COUNT(DISTINCT public_pen.id) as entity_count
       FROM public_entities public_brand
       LEFT JOIN entity_links relation
         ON relation.target_id = public_brand.id
        AND relation.link_type = 'made_by'
       LEFT JOIN public_entities public_pen
         ON public_pen.id = relation.source_id
        AND public_pen.type = 'pen'
       WHERE public_brand.type = 'brand'
       GROUP BY public_brand.id`,
    );
    const expectedBrandItems = expectedBrandRows.rows
      .map((row) => ({
        name: String(row.name),
        slug: String(row.slug),
        dimension: "brand",
        count: Number(row.entity_count || 0),
      }))
      .sort((a, b) => a.slug.localeCompare(b.slug));
    assertJsonEqual(
      [...brandDimension.items].sort((a, b) => a.slug.localeCompare(b.slug)),
      expectedBrandItems,
      "Brand dimension rows",
    );
    const expectedBrandTotal = await fixtureDb.execute(
      `SELECT COUNT(DISTINCT public_pen.id) as total
       FROM public_entities public_brand
       JOIN entity_links relation
         ON relation.target_id = public_brand.id
        AND relation.link_type = 'made_by'
       JOIN public_entities public_pen
         ON public_pen.id = relation.source_id
        AND public_pen.type = 'pen'
       WHERE public_brand.type = 'brand'`,
    );
    assertCondition(
      brandDimension.totalEntities ===
        Number(expectedBrandTotal.rows[0]?.total || 0),
      "Brand dimension total differs from the public reverse made_by set.",
    );

    const nibDimension = await browseDataModule.getDimensionDiscoveryData(
      "nib",
      "nib_type",
    );
    const expectedNibRows = await fixtureDb.execute(
      `SELECT tag.name,
              tag.slug,
              tag.dimension,
              COUNT(DISTINCT public_entity.id) as entity_count
       FROM tags tag
       JOIN entity_tags tagged ON tagged.tag_id = tag.id
       JOIN public_entities public_entity ON public_entity.id = tagged.entity_id
       WHERE tag.dimension = 'nib_type'
       GROUP BY tag.id
       HAVING entity_count > 0`,
    );
    assertJsonEqual(
      [...nibDimension.items].sort((a, b) => a.slug.localeCompare(b.slug)),
      expectedNibRows.rows
        .map((row) => ({
          name: String(row.name),
          slug: String(row.slug),
          dimension: String(row.dimension),
          count: Number(row.entity_count || 0),
        }))
        .sort((a, b) => a.slug.localeCompare(b.slug)),
      "Tag dimension rows",
    );
    const expectedNibTotal = await fixtureDb.execute(
      `SELECT COUNT(DISTINCT public_entity.id) as total
       FROM public_entities public_entity
       JOIN entity_tags tagged ON tagged.entity_id = public_entity.id
       JOIN tags tag ON tag.id = tagged.tag_id
       WHERE tag.dimension = 'nib_type'`,
    );
    assertCondition(
      nibDimension.totalEntities === Number(expectedNibTotal.rows[0]?.total || 0),
      "Tag dimension total differs from public_entities.",
    );

    await homeModule.default();
    await browsePageModule.default({ searchParams: Promise.resolve({ limit: "50" }) });
    await dimensionPageModule.default({
      params: Promise.resolve({ dimension: "brand" }),
    });
    assertCondition(
      homeModule.dynamic === "force-dynamic" &&
        browsePageModule.dynamic === "force-dynamic" &&
        dimensionPageModule.dynamic === "force-dynamic" &&
        browseRouteModule.dynamic === "force-dynamic",
      "A discovery list page/API is not force-dynamic.",
    );
    assertCondition(
      homeModule.revalidate === undefined &&
        browsePageModule.revalidate === undefined &&
        dimensionPageModule.revalidate === undefined,
      "A discovery list page still exports ISR revalidation.",
    );
  } finally {
    try {
      getDb().close();
    } finally {
      fixtureDb.close();
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
  }

  assertCondition(
    !fs.existsSync(tempRoot),
    "Discovery list fixture was not cleaned.",
  );
  assertRealDatabaseUnchanged(before, "Discovery list checks");
  console.log(
    "Discovery list boundary passed: browse/API rows, keyed facets/counts, home, and by-dimension are exact public_entities projections with no-store responses.",
  );
}

async function runDiscoveryGraphChecks() {
  const before = realDatabaseSnapshot();
  const tempRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-public-boundary-graph-")),
  );
  const databasePath = path.join(tempRoot, "fixture.db");
  const databaseUrl = `file:${databasePath}`;
  const fixtureDb = createClient({ url: databaseUrl });

  process.env.TURSO_DATABASE_URL = "";
  process.env.TURSO_AUTH_TOKEN = "";
  process.env.FPKG_DATABASE_URL = databaseUrl;
  process.env.PUBLICATION_GATE_FIXTURE = "1";

  try {
    await migrateDatabase(fixtureDb);
    await seedBoundaryFixtures(fixtureDb);

    const graphModule = await import("../src/app/graph/page");
    const linksModule = await import("../src/app/api/links/route");
    const reactModule = await import("react");
    Object.assign(globalThis, { React: reactModule.default });

    const publicRows = await fixtureDb.execute(
      "SELECT id, type, slug FROM public_entities",
    );
    const publicKeys = new Set(
      publicRows.rows.map((row) => `${row.type}:${row.slug}`),
    );
    const publicBySlug = new Map(
      publicRows.rows.map((row) => [
        String(row.slug),
        { id: String(row.id), type: String(row.type) },
      ]),
    );

    const graphTree = await graphModule.default({
      searchParams: Promise.resolve({ entity: "boundary-public-brand" }),
    });
    const graphHubs: Array<{ slug: string; degree: number }> = [];
    const graphHrefs: string[] = [];
    walkReactTree(graphTree, (props) => {
      if (typeof props.href !== "string") return;
      graphHrefs.push(props.href);
      if (!props.href.startsWith("/graph?")) return;
      const slug = new URL(props.href, "http://boundary.invalid").searchParams.get(
        "entity",
      );
      const degree = Number(reactText(props.children).match(/·\s*(\d+)/)?.[1]);
      assertCondition(slug, "Graph hub link omitted its entity slug.");
      assertCondition(Number.isFinite(degree), `Graph hub ${slug} omitted degree.`);
      graphHubs.push({ slug, degree });
    });
    assertCondition(graphHubs.length <= 12, "Graph hub limit exceeded 12.");
    assertCondition(graphHubs.length > 0, "Graph fixture returned no public hubs.");
    assertCondition(
      graphHrefs.includes("/brand/boundary-public-brand"),
      "Graph did not select the requested public center.",
    );
    for (const hub of graphHubs) {
      const publicHub = publicBySlug.get(hub.slug);
      assertCondition(
        publicHub,
        `Graph hub ${hub.slug} is outside public_entities.`,
      );
      const expectedDegree = await fixtureDb.execute({
        sql: `SELECT COUNT(DISTINCT relation.id) as degree
              FROM entity_links relation
              JOIN public_entities public_neighbor
                ON public_neighbor.id = CASE
                  WHEN relation.source_id = ? THEN relation.target_id
                  ELSE relation.source_id
                END
              WHERE (relation.source_id = ? OR relation.target_id = ?)
                AND relation.link_type != 'reverse'`,
        args: [publicHub.id, publicHub.id, publicHub.id],
      });
      assertCondition(
        hub.degree === Number(expectedDegree.rows[0]?.degree || 0),
        `Graph hub ${hub.slug} degree counts an unpublished neighbor.`,
      );
      assertCondition(
        hub.degree > 0,
        `Graph hub ${hub.slug} has no public neighbor.`,
      );
    }
    assertCondition(
      !graphHubs.some((hub) => hub.slug.includes("boundary-draft")),
      "Graph hubs leaked a draft fixture.",
    );

    const draftTree = await graphModule.default({
      searchParams: Promise.resolve({ entity: "boundary-draft-pen" }),
    });
    let draftSelectionLeaked = false;
    walkReactTree(draftTree, (props) => {
      for (const key of ["href", "entitySlug"] as const) {
        if (
          typeof props[key] === "string" &&
          props[key].includes("boundary-draft-pen")
        ) {
          draftSelectionLeaked = true;
        }
      }
    });
    assertCondition(
      !draftSelectionLeaked,
      "Graph selected an unpublished center.",
    );
    assertCondition(
      graphModule.dynamic === "force-dynamic" &&
        graphModule.revalidate === undefined,
      "Graph page is not force-dynamic or still exports ISR revalidation.",
    );

    const graphResponse = await linksModule.GET(
      new NextRequest(
        "http://boundary.invalid/api/links?slug=boundary-public-brand&depth=2",
      ),
    );
    assertCondition(
      graphResponse.status === 200 &&
        graphResponse.headers.get("cache-control") === "no-store",
      "Links API success response is not a no-store 200.",
    );
    const graphBody = (await graphResponse.json()) as Record<string, unknown>;
    assertExactKeys(
      graphBody,
      ["forward", "backlinks", "secondHopForward", "secondHopBacklinks"],
      "links depth=2",
    );
    assertNoPublicationInternals(graphBody, "links depth=2");

    const linkKeys = [
      "source_key",
      "source_slug",
      "source_name",
      "source_type",
      "target_key",
      "target_slug",
      "target_name",
      "target_type",
      "link_type",
      "reason",
    ] as const;
    const allLinkRows: Array<Record<string, unknown>> = [];
    for (const field of [
      "forward",
      "backlinks",
      "secondHopForward",
      "secondHopBacklinks",
    ] as const) {
      const rows = graphBody[field];
      assertCondition(Array.isArray(rows), `links.${field} is not an array.`);
      for (const [index, row] of rows.entries()) {
        assertExactKeys(row, linkKeys, `links.${field}[${index}]`);
        const link = row as Record<string, unknown>;
        assertCondition(
          publicKeys.has(String(link.source_key)),
          `links.${field}[${index}] leaked source ${String(link.source_key)}.`,
        );
        assertCondition(
          publicKeys.has(String(link.target_key)),
          `links.${field}[${index}] leaked target ${String(link.target_key)}.`,
        );
        allLinkRows.push(link);
      }
    }
    assertCondition(
      allLinkRows.some(
        (row) =>
          row.source_key === "pen:boundary-public-pen" &&
          row.target_key === "brand:boundary-public-brand",
      ),
      "Links API omitted the public pen-to-brand fixture.",
    );
    const serializedGraph = JSON.stringify(graphBody);
    assertCondition(
      !serializedGraph.includes("boundary-draft-pen") &&
        !serializedGraph.includes("boundary-draft-brand"),
      "Links API leaked an unpublished neighbor or second-hop owner.",
    );

    const articleResponse = await linksModule.GET(
      new NextRequest(
        "http://boundary.invalid/api/links?slug=boundary-public-article&depth=1",
      ),
    );
    const articleBody = (await articleResponse.json()) as Record<string, unknown>;
    assertCondition(
      articleResponse.status === 200 &&
        articleResponse.headers.get("cache-control") === "no-store",
      "Links depth=1 response is not a no-store 200.",
    );
    assertExactKeys(articleBody, ["forward", "backlinks"], "links depth=1");
    assertCondition(
      !JSON.stringify(articleBody).includes("boundary-draft"),
      "Links depth=1 leaked a draft endpoint.",
    );

    const missingSlugResponse = await linksModule.GET(
      new NextRequest("http://boundary.invalid/api/links"),
    );
    const draftCenterResponse = await linksModule.GET(
      new NextRequest(
        "http://boundary.invalid/api/links?slug=boundary-draft-pen&depth=2",
      ),
    );
    assertCondition(
      missingSlugResponse.status === 400 &&
        missingSlugResponse.headers.get("cache-control") === "no-store",
      "Links missing-slug response is not a no-store 400.",
    );
    assertCondition(
      draftCenterResponse.status === 404 &&
        draftCenterResponse.headers.get("cache-control") === "no-store",
      "Links draft center response is not a no-store 404.",
    );
    assertCondition(
      linksModule.dynamic === "force-dynamic",
      "Links API is not force-dynamic.",
    );
  } finally {
    try {
      getDb().close();
    } finally {
      fixtureDb.close();
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
  }

  assertCondition(
    !fs.existsSync(tempRoot),
    "Discovery graph fixture was not cleaned.",
  );
  assertRealDatabaseUnchanged(before, "Discovery graph checks");
  console.log(
    "Discovery graph boundary passed: graph hubs/degrees and every links center, endpoint, neighbor, and second-hop alias are public-only with no-store responses.",
  );
}

async function seedSecondaryLinkFixtures(
  db: ReturnType<typeof createClient>,
): Promise<void> {
  await db.execute(`
    UPDATE model_specs
    SET brand_entity_id = 'boundary-public-brand',
        series_name = 'Boundary Series'
    WHERE id = 'boundary-public-pen-spec'
  `);
  await qualifyBoundarySpecFields(db, "boundary-public-pen", [
    "brand_entity_id",
    "series_name",
  ]);
  await db.execute(`
    INSERT INTO entity_links (id, source_id, target_id, link_type)
    VALUES (
      'boundary-public-pen-draft-direct',
      'boundary-public-pen',
      'boundary-draft-brand',
      'related'
    )
  `);
  await approveBoundaryEntity(db, "boundary-public-brand");
  await approveBoundaryEntity(db, "boundary-public-pen");

  await seedQualifiedBoundaryEntity(
    db,
    "boundary-public-peer",
    "pen",
    "boundary-public-brand",
  );
  await approveBoundaryEntity(db, "boundary-public-brand");
  await db.execute(`
    UPDATE model_specs
    SET brand_entity_id = 'boundary-public-brand',
        series_name = 'Boundary Series'
    WHERE id = 'boundary-public-peer-spec'
  `);
  await qualifyBoundarySpecFields(db, "boundary-public-peer", [
    "brand_entity_id",
    "series_name",
  ]);
  await approveBoundaryEntity(db, "boundary-public-brand");
  await approveBoundaryEntity(db, "boundary-public-peer");

  await seedQualifiedBoundaryEntity(
    db,
    "boundary-public-tag-peer",
    "pen",
    "boundary-public-brand",
  );
  await approveBoundaryEntity(db, "boundary-public-brand");
  await db.execute(`
    INSERT INTO entity_tags (id, entity_id, tag_id)
    VALUES (
      'boundary-public-tag-peer-nib',
      'boundary-public-tag-peer',
      'boundary-tag-nib'
    )
  `);
  await approveBoundaryEntity(db, "boundary-public-brand");
  await approveBoundaryEntity(db, "boundary-public-tag-peer");

  await db.execute(`
    INSERT INTO model_specs (
      id, entity_id, brand_entity_id, series_name, review_status
    ) VALUES (
      'boundary-draft-pen-spec',
      'boundary-draft-pen',
      'boundary-public-brand',
      'Boundary Series',
      'approved'
    )
  `);

  for (const suffix of ["current", "peer"] as const) {
    const entityId = `boundary-misaligned-${suffix}`;
    await seedQualifiedBoundaryEntity(
      db,
      entityId,
      "pen",
      "boundary-public-brand",
    );
    await db.execute({
      sql: `UPDATE model_specs
            SET brand_entity_id = 'boundary-draft-brand',
                series_name = 'Draft Brand Series'
            WHERE id = ?`,
      args: [`${entityId}-spec`],
    });
    await qualifyBoundarySpecFields(db, entityId, [
      "brand_entity_id",
      "series_name",
    ]);
    await approveBoundaryEntity(db, "boundary-public-brand");
    await approveBoundaryEntity(db, entityId);
  }

  await insertBoundaryEntity(db, "boundary-public-concept", "concept");
  await db.execute(`
    INSERT INTO concept_rules (id, name, slug, conditions)
    VALUES (
      'boundary-public-rule',
      'Boundary public rule',
      'boundary-public-concept',
      '[{"dimension":"nib_type","tag_slug":"boundary-nib"}]'
    )
  `);

  await insertBoundaryEntity(db, "boundary-draft-concept", "concept");
  await db.execute(`
    INSERT INTO entity_publications (entity_id, status, blockers_json)
    VALUES (
      'boundary-draft-concept',
      'draft',
      '["publication_draft"]'
    )
  `);
  await db.execute(`
    INSERT INTO concept_rules (id, name, slug, conditions)
    VALUES (
      'boundary-draft-rule',
      'Boundary draft rule',
      'boundary-draft-concept',
      '[{"dimension":"nib_type","tag_slug":"boundary-nib"}]'
    )
  `);
}

async function runSecondaryLinkChecks() {
  const before = realDatabaseSnapshot();
  const tempRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-public-boundary-secondary-links-")),
  );
  const databasePath = path.join(tempRoot, "fixture.db");
  const databaseUrl = `file:${databasePath}`;
  const fixtureDb = createClient({ url: databaseUrl });

  process.env.TURSO_DATABASE_URL = "";
  process.env.TURSO_AUTH_TOKEN = "";
  process.env.FPKG_DATABASE_URL = databaseUrl;
  process.env.PUBLICATION_GATE_FIXTURE = "1";

  try {
    await migrateDatabase(fixtureDb);
    await seedBoundaryFixtures(fixtureDb);
    await seedSecondaryLinkFixtures(fixtureDb);

    const recommendModule = await import("../src/lib/recommend");
    const conceptModule = await import("../src/lib/concept-engine");
    const markdownModule = await import("../src/components/MarkdownRenderer");
    const reactModule = await import("react");
    Object.assign(globalThis, { React: reactModule.default });

    const directPublicRows = await fixtureDb.execute(
      "SELECT id, type, slug FROM public_entities",
    );
    const publicIds = new Set(directPublicRows.rows.map((row) => String(row.id)));
    const publicPaths = new Set(
      directPublicRows.rows.map((row) => `/${row.type}/${row.slug}`),
    );

    const recommendations = await recommendModule.getRecommendations(
      "boundary-public-pen",
      30,
    );
    assertCondition(
      recommendations.length > 0,
      "Published recommendation fixture returned no candidates.",
    );
    for (const recommendation of recommendations) {
      assertCondition(
        publicIds.has(recommendation.id),
        `Recommendation leaked ${recommendation.id} outside direct public_entities oracle.`,
      );
    }
    assertCondition(
      recommendations.some((item) => item.id === "boundary-public-peer"),
      "Approved model peer with a public brand was omitted.",
    );
    assertCondition(
      recommendations.some(
        (item) => item.id === "boundary-public-tag-peer",
      ),
      "Published tag-only peer was omitted.",
    );
    assertCondition(
      !recommendations.some(
        (item) =>
          item.id === "boundary-draft-pen" ||
          item.id === "boundary-draft-brand",
      ),
      "Recommendation leaked a draft direct/model/tag candidate.",
    );
    assertJsonEqual(
      await recommendModule.getRecommendations("boundary-draft-pen", 30),
      [],
      "Draft recommendation current entity",
    );

    const misalignedRecommendations = await recommendModule.getRecommendations(
      "boundary-misaligned-current",
      30,
    );
    assertCondition(
      !misalignedRecommendations.some(
        (item) => item.id === "boundary-misaligned-peer",
      ),
      "Recommendation used an unpublished model-spec brand alias.",
    );

    const recomputed = await conceptModule.recomputeAllConceptMatches();
    assertCondition(
      recomputed.total ===
        directPublicRows.rows.filter((row) => row.type === "pen").length,
      "Concept recompute did not traverse exactly the direct public pen set.",
    );
    const materializedRows = await fixtureDb.execute(
      "SELECT concept_id, entity_id FROM concept_matches ORDER BY concept_id, entity_id",
    );
    assertCondition(
      materializedRows.rows.every(
        (row) =>
          row.concept_id === "boundary-public-rule" &&
          publicIds.has(String(row.entity_id)),
      ),
      "Concept recompute materialized an unpublished concept or entity target.",
    );
    assertCondition(
      materializedRows.rows.some(
        (row) => row.entity_id === "boundary-public-pen",
      ),
      "Concept recompute omitted the matching published pen.",
    );
    assertCondition(
      !materializedRows.rows.some(
        (row) => row.entity_id === "boundary-draft-pen",
      ),
      "Concept recompute materialized a draft pen.",
    );

    await fixtureDb.execute(`
      INSERT INTO concept_matches (id, concept_id, entity_id)
      VALUES
        ('boundary-stale-draft-pen-match', 'boundary-public-rule', 'boundary-draft-pen'),
        ('boundary-stale-draft-concept-match', 'boundary-draft-rule', 'boundary-public-pen')
    `);
    const visibleConceptEntities = (await conceptModule.getEntitiesForConcept(
      "boundary-public-rule",
    )) as Array<{ id: string }>;
    assertCondition(
      visibleConceptEntities.every((entity) => publicIds.has(entity.id)) &&
        !visibleConceptEntities.some(
          (entity) => entity.id === "boundary-draft-pen",
        ),
      "Concept read leaked a stale unpublished match.",
    );
    assertJsonEqual(
      await conceptModule.getEntitiesForConcept("boundary-draft-rule"),
      [],
      "Draft concept stale materialization",
    );

    const rendered = (await markdownModule.MarkdownRenderer({
      content:
        "[[boundary-public-pen]] / [[boundary-draft-pen]] / [[boundary-draft-concept]]",
    })) as { props?: { html?: unknown } };
    const html = String(rendered.props?.html || "");
    const wikiHrefs = [...html.matchAll(/href="([^"]+)"/g)].map(
      (match) => match[1],
    );
    assertCondition(
      wikiHrefs.includes("/pen/boundary-public-pen"),
      "Wiki renderer omitted a direct public target.",
    );
    assertCondition(
      wikiHrefs.every((href) => publicPaths.has(href)),
      `Wiki renderer emitted a target outside direct public_entities oracle: ${wikiHrefs.join(", ")}`,
    );
    assertCondition(
      !html.includes('href="/pen/boundary-draft-pen"') &&
        !html.includes('href="/concept/boundary-draft-concept"') &&
        html.includes("boundary-draft-pen") &&
        html.includes("boundary-draft-concept"),
      "Unpublished wiki targets did not degrade to readable non-link text.",
    );

    await fixtureDb.execute(`
      UPDATE entities
      SET summary = 'Critical edit invalidates the current publication review.'
      WHERE id = 'boundary-public-pen'
    `);
    assertJsonEqual(
      await recommendModule.getRecommendations("boundary-public-pen", 30),
      [],
      "Critically edited recommendation current entity",
    );
    assertCondition(
      !(await conceptModule.getEntitiesForConcept("boundary-public-rule") as Array<{ id: string }>).some(
        (entity) => entity.id === "boundary-public-pen",
      ),
      "Stale concept row survived a critical edit on the next read.",
    );
    const editedWiki = (await markdownModule.MarkdownRenderer({
      content: "[[boundary-public-pen]]",
    })) as { props?: { html?: unknown } };
    assertCondition(
      !String(editedWiki.props?.html || "").includes("href="),
      "Wiki target survived a critical edit on the next render.",
    );
  } finally {
    try {
      getDb().close();
    } finally {
      fixtureDb.close();
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
  }

  assertCondition(
    !fs.existsSync(tempRoot),
    "Secondary links fixture was not cleaned.",
  );
  assertRealDatabaseUnchanged(before, "Secondary links checks");
  console.log(
    "Secondary links boundary passed: recommendations, concept materialization/readback, stale matches, and wiki targets are direct public_entities subsets.",
  );
}

async function seedSecondaryLibraryMediaFixtures(
  db: ReturnType<typeof createClient>,
): Promise<void> {
  for (let index = 1; index <= 14; index += 1) {
    const suffix = String(index).padStart(2, "0");
    const entityId = `boundary-brand-model-${suffix}`;
    await seedQualifiedBoundaryEntity(
      db,
      entityId,
      "pen",
      "boundary-public-brand",
    );
  }

  await db.execute(`
    INSERT INTO source_registry (
      id, name, source_type, allowed_use, reliability, homepage_url
    ) VALUES (
      'boundary-library-source',
      'Boundary library source',
      'official',
      'metadata_only',
      'high_for_basic_facts',
      'https://boundary.invalid/library'
    )
  `);
  await db.execute(`
    INSERT INTO source_items (
      id, source_id, title, url, review_status
    ) VALUES
      ('boundary-public-reference-item', 'boundary-library-source',
       'Public reference', 'https://boundary.invalid/public-reference', 'approved'),
      ('boundary-public-citation-item', 'boundary-library-source',
       'Public citation', 'https://boundary.invalid/public-citation', 'approved'),
      ('boundary-draft-reference-item', 'boundary-library-source',
       'Draft reference', 'https://boundary.invalid/draft-reference', 'approved'),
      ('boundary-draft-citation-item', 'boundary-library-source',
       'Draft citation', 'https://boundary.invalid/draft-citation', 'approved')
  `);
  await db.execute(`
    INSERT INTO entity_references (
      id, entity_id, source_item_id, relation_type, review_status
    ) VALUES
      ('boundary-public-reference', 'boundary-public-brand',
       'boundary-public-reference-item', 'official', 'approved'),
      ('boundary-draft-reference', 'boundary-draft-brand',
       'boundary-draft-reference-item', 'official', 'approved')
  `);
  await db.execute(`
    INSERT INTO citations (id, target_type, target_id, source_item_id)
    VALUES
      ('boundary-public-entity-citation', 'entity', 'boundary-public-brand',
       'boundary-public-citation-item'),
      ('boundary-draft-entity-citation', 'entity', 'boundary-draft-brand',
       'boundary-draft-citation-item')
  `);

  await db.execute(`
    INSERT INTO media_assets (
      id, entity_id, title, asset_type, image_url, local_path, author,
      license, attribution_text, review_status, usage_status
    ) VALUES
      ('boundary-public-media', 'boundary-public-pen', 'Public media', 'image',
       '/images/boundary-public.png', 'public/images/boundary-public.png',
       'Boundary author', 'CC BY 4.0', 'Boundary attribution', 'approved', 'primary'),
      ('boundary-draft-media', 'boundary-draft-pen', 'Draft media', 'image',
       '/images/boundary-draft.png', 'public/images/boundary-draft.png',
       'Boundary author', 'CC BY 4.0', 'Boundary attribution', 'approved', 'primary'),
      ('boundary-orphan-media', NULL, 'Orphan media', 'image',
       '/images/boundary-orphan.png', 'public/images/boundary-orphan.png',
       'Boundary author', 'CC BY 4.0', 'Boundary attribution', 'approved', 'primary')
  `);

  const hotspots = JSON.stringify([
    {
      label: "Public target",
      x: 20,
      y: 30,
      linked_entity: "/pen/boundary-public-pen",
    },
    {
      label: "Draft target",
      x: 70,
      y: 60,
      linked_entity: "/pen/boundary-draft-pen",
    },
  ]);
  await db.execute({
    sql: `INSERT INTO diagrams (
            id, entity_id, slug, title, diagram_type, svg, hotspots_json,
            license, review_status
          ) VALUES
            ('boundary-public-diagram', 'boundary-public-brand',
             'boundary-public-diagram', 'Public diagram', 'relationship',
             '<svg viewBox="0 0 10 10"></svg>', ?, 'site-original', 'published'),
            ('boundary-draft-diagram', 'boundary-draft-brand',
             'boundary-draft-diagram', 'Draft diagram', 'relationship',
             '<svg viewBox="0 0 10 10"></svg>', ?, 'site-original', 'published'),
            ('boundary-global-diagram', NULL,
             'boundary-global-diagram', 'Global diagram', 'relationship',
             '<svg viewBox="0 0 10 10"></svg>', ?, 'site-original', 'published')`,
    args: [hotspots, hotspots, hotspots],
  });

  await approveBoundaryEntity(db, "boundary-public-brand");
  await approveBoundaryEntity(db, "boundary-public-pen");
  for (let index = 1; index <= 14; index += 1) {
    await approveBoundaryEntity(
      db,
      `boundary-brand-model-${String(index).padStart(2, "0")}`,
    );
  }
}

async function runSecondaryLibraryMediaChecks() {
  const before = realDatabaseSnapshot();
  const tempRoot = fs.realpathSync.native(
    fs.mkdtempSync(
      path.join(os.tmpdir(), "fpkg-public-boundary-secondary-library-"),
    ),
  );
  const databasePath = path.join(tempRoot, "fixture.db");
  const databaseUrl = `file:${databasePath}`;
  const fixtureDb = createClient({ url: databaseUrl });

  process.env.TURSO_DATABASE_URL = "";
  process.env.TURSO_AUTH_TOKEN = "";
  process.env.FPKG_DATABASE_URL = databaseUrl;
  process.env.PUBLICATION_GATE_FIXTURE = "1";

  try {
    await migrateDatabase(fixtureDb);
    await seedBoundaryFixtures(fixtureDb);
    await seedSecondaryLibraryMediaFixtures(fixtureDb);

    const libraryModule = await import("../src/lib/library");
    const brandModule = await import(
      "../src/components/library/BrandMuseum"
    );
    const detailModule = await import("../src/app/[type]/[slug]/page");
    const imageProxyModule = await import("../src/app/api/image-proxy/route");
    const libraryPageModule = await import("../src/app/library/page");
    const sourcePageModule = await import("../src/app/library/sources/page");
    const diagramPageModule = await import("../src/app/library/diagrams/page");
    const reactModule = await import("react");
    Object.assign(globalThis, { React: reactModule.default });

    const expectedModelRows = await fixtureDb.execute(`
      SELECT public_pen.type, public_pen.slug, public_pen.name
      FROM public_entities public_brand
      JOIN entity_links relation
        ON relation.target_id = public_brand.id
       AND relation.link_type = 'made_by'
      JOIN public_entities public_pen
        ON public_pen.id = relation.source_id
       AND public_pen.type = 'pen'
      WHERE public_brand.id = 'boundary-public-brand'
        AND public_brand.type = 'brand'
      GROUP BY public_pen.id
      ORDER BY public_pen.name, public_pen.slug
    `);
    assertCondition(
      expectedModelRows.rows.length === 15,
      `Brand fixture expected 15 public models, got ${expectedModelRows.rows.length}.`,
    );
    const expectedModelPaths = expectedModelRows.rows.map(
      (row) => `/${row.type}/${row.slug}`,
    );
    const brandModels = await libraryModule.getBrandPublicModels(
      "boundary-public-brand",
    );
    assertCondition(
      brandModels.count === expectedModelPaths.length,
      "Brand model count differs from the direct reverse made_by oracle.",
    );
    assertJsonEqual(
      brandModels.models.map(
        (model: { type: string; slug: string }) =>
          `/${model.type}/${model.slug}`,
      ),
      expectedModelPaths,
      "Complete brand model paths",
    );

    const brandTree = await brandModule.BrandMuseum({
      entityId: "boundary-public-brand",
    });
    const brandHrefs: string[] = [];
    let brandText = "";
    walkReactTree(brandTree, (props) => {
      if (typeof props.href === "string") brandHrefs.push(props.href);
      brandText += reactText(props.children);
    });
    assertJsonEqual(
      brandHrefs.filter((href) => href.startsWith("/pen/")).sort(),
      [...expectedModelPaths].sort(),
      "Brand page model links",
    );
    assertCondition(
      brandText.includes(`全部型号（${expectedModelPaths.length}）`),
      "Brand page does not expose the accurate complete model count.",
    );
    const detailTree = await detailModule.default({
      params: Promise.resolve({
        type: "brand",
        slug: "boundary-public-brand",
      }),
    });
    let detailModelNav = false;
    walkReactTree(detailTree, (props) => {
      if (
        Array.isArray(props.items) &&
        props.items.some(
          (item) =>
            typeof item === "object" &&
            item !== null &&
            (item as { href?: unknown }).href === "#models" &&
            (item as { label?: unknown }).label === "全部型号",
        )
      ) {
        detailModelNav = true;
      }
    });
    assertCondition(detailModelNav, "Brand detail nav still says representative models.");

    const publicPenBrandCounts = await fixtureDb.execute(`
      SELECT public_pen.id, COUNT(DISTINCT public_brand.id) as brand_count
      FROM public_entities public_pen
      LEFT JOIN entity_links relation
        ON relation.source_id = public_pen.id
       AND relation.link_type = 'made_by'
      LEFT JOIN public_entities public_brand
        ON public_brand.id = relation.target_id
       AND public_brand.type = 'brand'
      WHERE public_pen.type = 'pen'
      GROUP BY public_pen.id
      HAVING brand_count != 1
    `);
    assertCondition(
      publicPenBrandCounts.rows.length === 0,
      "A public pen does not resolve to exactly one direct public canonical brand.",
    );

    const registry = await libraryModule.getSourceRegistryIndex();
    const sourceItems = await libraryModule.getSourceItemIndex({ limit: 20 });
    assertSetEqual(
      sourceItems.map((item: { id: string }) => item.id),
      [
        ...BOUNDARY_QUALIFICATION_SOURCE_ITEM_IDS,
        "boundary-public-citation-item",
        "boundary-public-reference-item",
      ],
      "Owner-aware source item index",
    );
    assertSetEqual(
      registry.map((item: { id: string }) => item.id),
      [
        ...BOUNDARY_QUALIFICATION_REGISTRY_IDS,
        "boundary-library-source",
      ],
      "Owner-aware source registry index",
    );
    const libraryRegistry = registry.find(
      (item) => item.id === "boundary-library-source",
    );
    assertCondition(
      libraryRegistry &&
        Number(libraryRegistry.item_count) === 2 &&
        Number(libraryRegistry.reference_count) === 2,
      "Source registry counts include an unpublished owner.",
    );

    const media = await libraryModule.getMediaAssetIndex(20);
    assertSetEqual(
      media.map((item: { id: string }) => item.id),
      ["boundary-public-media"],
      "Owner-aware media index",
    );
    assertCondition(
      (await libraryModule.getPrimaryProductImage("boundary-draft-pen")) ===
        undefined,
      "Draft entity exposed a primary product image.",
    );

    const publicMediaResponse = await imageProxyModule.GET(
      new NextRequest(
        "http://boundary.invalid/api/image-proxy?id=boundary-public-media",
      ),
    );
    const draftMediaResponse = await imageProxyModule.GET(
      new NextRequest(
        "http://boundary.invalid/api/image-proxy?id=boundary-draft-media",
      ),
    );
    const orphanMediaResponse = await imageProxyModule.GET(
      new NextRequest(
        "http://boundary.invalid/api/image-proxy?id=boundary-orphan-media",
      ),
    );
    assertCondition(
      publicMediaResponse.status === 307 &&
        publicMediaResponse.headers.get("cache-control") === "no-store",
      "Public media redirect is not an immediate no-store response.",
    );
    for (const [label, response] of [
      ["draft", draftMediaResponse],
      ["orphan", orphanMediaResponse],
    ] as const) {
      assertCondition(
        response.status === 404 &&
          response.headers.get("cache-control") === "no-store",
        `${label} media owner did not return a no-store 404.`,
      );
    }

    const diagrams = await libraryModule.getDiagramIndex(20);
    assertJsonEqual(
      diagrams.map((diagram: { id: string }) => diagram.id).sort(),
      ["boundary-global-diagram", "boundary-public-diagram"],
      "Owner-aware diagram index",
    );
    const directPublicPaths = new Set(
      (
        await fixtureDb.execute("SELECT type, slug FROM public_entities")
      ).rows.map((row) => `/${row.type}/${row.slug}`),
    );
    for (const diagram of diagrams as Array<{
      hotspots_json: string | null;
    }>) {
      const hotspots = JSON.parse(diagram.hotspots_json || "[]") as Array<{
        label?: string;
        linked_entity?: string;
      }>;
      assertCondition(
        hotspots.some((hotspot) => hotspot.label === "Draft target"),
        "Diagram sanitizer removed the explanatory draft-target hotspot.",
      );
      assertCondition(
        hotspots.every(
          (hotspot) =>
            !hotspot.linked_entity ||
            directPublicPaths.has(hotspot.linked_entity),
        ),
        "Diagram hotspot retained an unpublished entity path.",
      );
    }
    assertJsonEqual(
      (await libraryModule.getDiagramsForEntity("boundary-draft-brand")).map(
        (diagram: { id: string }) => diagram.id,
      ),
      ["boundary-global-diagram"],
      "Draft diagram owner lookup",
    );

    assertCondition(
      libraryPageModule.dynamic === "force-dynamic" &&
        sourcePageModule.dynamic === "force-dynamic" &&
        diagramPageModule.dynamic === "force-dynamic" &&
        imageProxyModule.dynamic === "force-dynamic",
      "A library/source/diagram/media surface is not force-dynamic.",
    );
    assertCondition(
      libraryPageModule.revalidate === undefined &&
        sourcePageModule.revalidate === undefined &&
        diagramPageModule.revalidate === undefined,
      "A library/source/diagram page still exports ISR revalidation.",
    );

    const publicRouteSources = [
      "src/app/library/page.tsx",
      "src/app/library/sources/page.tsx",
      "src/app/library/diagrams/page.tsx",
      "src/app/exhibits/page.tsx",
      "src/app/timeline/page.tsx",
    ].map((filePath) => fs.readFileSync(path.join(ROOT, filePath), "utf8"));
    assertCondition(
      publicRouteSources.every(
        (source) => !source.includes("getLibraryCoverageReport"),
      ),
      "Private raw library coverage helper is reachable from a public route.",
    );
  } finally {
    try {
      getDb().close();
    } finally {
      fixtureDb.close();
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
  }

  assertCondition(
    !fs.existsSync(tempRoot),
    "Secondary library/media fixture was not cleaned.",
  );
  assertRealDatabaseUnchanged(before, "Secondary library/media checks");
  console.log(
    "Secondary library/media boundary passed: complete brand models and every source, media, image, and diagram owner/target are public with no-store delivery.",
  );
}

async function seedSecondaryExhibitTimelineFixtures(
  db: ReturnType<typeof createClient>,
): Promise<void> {
  await db.execute(`
    INSERT INTO source_registry (
      id, name, source_type, allowed_use, reliability, homepage_url
    ) VALUES (
      'boundary-exhibit-source',
      'Boundary exhibit source',
      'official',
      'metadata_only',
      'high_for_basic_facts',
      'https://boundary.invalid/exhibit'
    )
  `);
  await db.execute(`
    INSERT INTO source_items (
      id, source_id, title, url, review_status
    ) VALUES (
      'boundary-exhibit-item',
      'boundary-exhibit-source',
      'Boundary exhibit item',
      'https://boundary.invalid/exhibit-item',
      'approved'
    )
  `);
  await db.execute(`
    INSERT INTO timeline_events (
      id, entity_id, title, event_type, start_date, description,
      source_item_id, review_status
    ) VALUES
      ('boundary-public-timeline', 'boundary-public-pen',
       'Public entity event', 'model_released', '2001',
       'A public entity-owned timeline event.',
       'boundary-exhibit-item', 'approved'),
      ('boundary-draft-timeline', 'boundary-draft-pen',
       'Draft entity event', 'model_released', '2002',
       'A draft entity-owned timeline event.',
       'boundary-exhibit-item', 'approved'),
      ('boundary-global-timeline', NULL,
       'Global public event', 'community_event', '2003',
       'A non-entity event remains public.',
       'boundary-exhibit-item', 'approved')
  `);
  await db.execute(`
    INSERT INTO media_assets (
      id, entity_id, title, asset_type, image_url, local_path, author,
      license, attribution_text, review_status, usage_status
    ) VALUES (
      'boundary-cache-media',
      'boundary-public-pen',
      'Boundary cache media',
      'image',
      '/images/boundary-cache.png',
      'public/images/boundary-cache.png',
      'Boundary author',
      'site-original',
      'Boundary attribution',
      'approved',
      'primary'
    )
  `);
  await db.execute(`
    INSERT INTO diagrams (
      id, entity_id, slug, title, diagram_type, svg, hotspots_json,
      license, review_status
    ) VALUES
      ('boundary-cache-public-diagram', 'boundary-public-pen',
       'boundary-cache-public-diagram', 'Public owner diagram',
       'relationship', '<svg viewBox="0 0 10 10"></svg>', '[]',
       'site-original', 'published'),
      ('boundary-cache-draft-diagram', 'boundary-draft-pen',
       'boundary-cache-draft-diagram', 'Draft owner diagram',
       'relationship', '<svg viewBox="0 0 10 10"></svg>', '[]',
       'site-original', 'published'),
      ('boundary-cache-global-diagram', NULL,
       'boundary-cache-global-diagram', 'Global diagram',
       'relationship', '<svg viewBox="0 0 10 10"></svg>', '[]',
       'site-original', 'published')
  `);
  await db.execute(`
    INSERT INTO exhibits (id, slug, title, summary, status)
    VALUES (
      'boundary-public-exhibit',
      'boundary-public-exhibit',
      'Boundary public exhibit',
      'A published exhibit that keeps its non-entity narrative.',
      'published'
    )
  `);
  await db.execute({
    sql: `INSERT INTO exhibit_sections (
            id, exhibit_id, position, title, body_md,
            related_entity_slugs_json, diagram_slugs_json,
            source_item_ids_json
          ) VALUES (
            'boundary-public-exhibit-section',
            'boundary-public-exhibit',
            0,
            'Boundary section',
            'Public [[boundary-public-pen]] and draft [[boundary-draft-pen]] references remain readable.',
            ?,
            ?,
            ?
          )`,
    args: [
      JSON.stringify([
        'pen/boundary-public-pen',
        'pen/boundary-draft-pen',
      ]),
      JSON.stringify([
        'boundary-cache-public-diagram',
        'boundary-cache-draft-diagram',
        'boundary-cache-global-diagram',
      ]),
      JSON.stringify(['boundary-exhibit-item']),
    ],
  });

  // Timeline and primary media are publication-critical inputs, so review the
  // public pen again only after the complete fixture has been written.
  await approveBoundaryEntity(db, "boundary-public-pen");
}

function parseFixtureJsonList(value: string | null): string[] {
  if (!value) return [];
  const parsed = JSON.parse(value);
  assertCondition(Array.isArray(parsed), "Fixture JSON list is not an array.");
  return parsed.filter((item): item is string => typeof item === "string");
}

async function runSecondaryExhibitTimelineCacheChecks() {
  const before = realDatabaseSnapshot();
  const tempRoot = fs.realpathSync.native(
    fs.mkdtempSync(
      path.join(os.tmpdir(), "fpkg-public-boundary-secondary-exhibit-"),
    ),
  );
  const databasePath = path.join(tempRoot, "fixture.db");
  const databaseUrl = `file:${databasePath}`;
  const fixtureDb = createClient({ url: databaseUrl });

  process.env.TURSO_DATABASE_URL = "";
  process.env.TURSO_AUTH_TOKEN = "";
  process.env.FPKG_DATABASE_URL = databaseUrl;
  process.env.PUBLICATION_GATE_FIXTURE = "1";

  try {
    await migrateDatabase(fixtureDb);
    await seedBoundaryFixtures(fixtureDb);
    await seedSecondaryExhibitTimelineFixtures(fixtureDb);

    const libraryModule = await import("../src/lib/library");
    const recommendModule = await import("../src/lib/recommend");
    const markdownModule = await import("../src/components/MarkdownRenderer");
    const imageProxyModule = await import("../src/app/api/image-proxy/route");
    const detailModule = await import("../src/app/[type]/[slug]/page");
    const libraryPageModule = await import("../src/app/library/page");
    const sourcePageModule = await import("../src/app/library/sources/page");
    const diagramPageModule = await import("../src/app/library/diagrams/page");
    const exhibitPageModule = await import("../src/app/exhibits/page");
    const exhibitDetailModule = await import(
      "../src/app/exhibits/[slug]/page"
    );
    const timelinePageModule = await import("../src/app/timeline/page");
    const reactModule = await import("react");
    Object.assign(globalThis, { React: reactModule.default });

    const publicPathOracle = async () => {
      const rows = await fixtureDb.execute(
        "SELECT type, slug FROM public_entities ORDER BY type, slug",
      );
      return new Set(rows.rows.map((row) => `${row.type}/${row.slug}`));
    };
    const assertPathSubset = async (paths: string[], label: string) => {
      const publicPaths = await publicPathOracle();
      for (const pathValue of paths) {
        assertCondition(
          publicPaths.has(pathValue.replace(/^\//, "")),
          `${label} exposed ${pathValue} outside direct public_entities.`,
        );
      }
    };

    const recentTimeline = await libraryModule.getRecentTimeline(20);
    assertJsonEqual(
      recentTimeline.map((event: { id: string }) => event.id),
      ["boundary-public-timeline", "boundary-global-timeline"],
      "Initial owner-aware timeline",
    );
    await assertPathSubset(
      recentTimeline
        .filter(
          (event: { entity_type?: string | null; entity_slug?: string | null }) =>
            event.entity_type && event.entity_slug,
        )
        .map(
          (event: { entity_type: string; entity_slug: string }) =>
            `${event.entity_type}/${event.entity_slug}`,
        ),
      "Timeline entity targets",
    );
    assertJsonEqual(
      await libraryModule.getTimelineForEntity("boundary-draft-pen", 20),
      [],
      "Draft timeline owner",
    );

    const initialSections = await libraryModule.getExhibitSections(
      "boundary-public-exhibit",
    );
    assertCondition(initialSections.length === 1, "Published exhibit lost its section.");
    assertJsonEqual(
      parseFixtureJsonList(initialSections[0].related_entity_slugs_json),
      ["pen/boundary-public-pen"],
      "Sanitized exhibit entity paths",
    );
    assertJsonEqual(
      parseFixtureJsonList(initialSections[0].diagram_slugs_json),
      ["boundary-cache-public-diagram", "boundary-cache-global-diagram"],
      "Sanitized exhibit diagram paths",
    );
    await assertPathSubset(
      parseFixtureJsonList(initialSections[0].related_entity_slugs_json),
      "Exhibit section entity targets",
    );
    assertJsonEqual(
      (
        await libraryModule.getRelatedEntitiesByPaths([
          "pen/boundary-public-pen",
          "pen/boundary-draft-pen",
        ])
      ).map((entity: { type: string; slug: string }) =>
        `${entity.type}/${entity.slug}`,
      ),
      ["pen/boundary-public-pen"],
      "Resolved exhibit entities",
    );

    const initialMarkdown = (await markdownModule.MarkdownRenderer({
      content: initialSections[0].body_md,
    })) as { props?: { html?: unknown } };
    const initialHtml = String(initialMarkdown.props?.html || "");
    assertCondition(
      initialHtml.includes('href="/pen/boundary-public-pen"') &&
        !initialHtml.includes('href="/pen/boundary-draft-pen"'),
      "Exhibit body wiki resolution did not gate a draft entity target.",
    );

    assertCondition(
      (await libraryModule.getPublishedExhibits()).some(
        (exhibit: { id: string }) => exhibit.id === "boundary-public-exhibit",
      ),
      "Published non-entity exhibit disappeared from the list.",
    );
    const exhibitTree = await exhibitDetailModule.default({
      params: Promise.resolve({ slug: "boundary-public-exhibit" }),
    });
    let renderedRelatedSlugs: string[] | null = null;
    let renderedDiagramSlugs: string[] | null = null;
    walkReactTree(exhibitTree, (props) => {
      if (Array.isArray(props.relatedSlugs)) {
        renderedRelatedSlugs = props.relatedSlugs.filter(
          (item): item is string => typeof item === "string",
        );
      }
      if (Array.isArray(props.diagramSlugs)) {
        renderedDiagramSlugs = props.diagramSlugs.filter(
          (item): item is string => typeof item === "string",
        );
      }
    });
    assertJsonEqual(
      renderedRelatedSlugs,
      ["pen/boundary-public-pen"],
      "Exhibit detail related paths",
    );
    assertJsonEqual(
      renderedDiagramSlugs,
      ["boundary-cache-public-diagram", "boundary-cache-global-diagram"],
      "Exhibit detail diagram paths",
    );

    const timelineTree = await timelinePageModule.default();
    let timelineProps: Array<{
      entity_type?: string | null;
      entity_slug?: string | null;
    }> = [];
    walkReactTree(timelineTree, (props) => {
      if (Array.isArray(props.events)) {
        timelineProps = props.events as typeof timelineProps;
      }
    });
    await assertPathSubset(
      timelineProps
        .filter((event) => event.entity_type && event.entity_slug)
        .map((event) => `${event.entity_type}/${event.entity_slug}`),
      "Timeline page targets",
    );

    const runtimeModules = [
      detailModule,
      libraryPageModule,
      sourcePageModule,
      diagramPageModule,
      exhibitPageModule,
      exhibitDetailModule,
      timelinePageModule,
      imageProxyModule,
    ];
    assertCondition(
      runtimeModules.every((runtimeModule) => runtimeModule.dynamic === "force-dynamic"),
      "An entity-bearing secondary page/API is not force-dynamic.",
    );
    assertCondition(
      runtimeModules.every((runtimeModule) => runtimeModule.revalidate === undefined),
      "An entity-bearing secondary page/API still exports ISR revalidation.",
    );

    const planRuntimeFiles = [
      "src/lib/recommend.ts",
      "src/lib/concept-engine.ts",
      "src/components/MarkdownRenderer.tsx",
      "src/components/library/BrandMuseum.tsx",
      "src/lib/library.ts",
      "src/app/[type]/[slug]/page.tsx",
      "src/app/api/image-proxy/route.ts",
      "src/app/library/page.tsx",
      "src/app/library/sources/page.tsx",
      "src/app/library/diagrams/page.tsx",
      "src/app/exhibits/page.tsx",
      "src/app/exhibits/[slug]/page.tsx",
      "src/app/timeline/page.tsx",
    ];
    const forbiddenCachePatterns = [
      /export\s+const\s+revalidate\s*=/,
      /stale-while-revalidate/i,
      /s-maxage/i,
      /max-age/i,
      /force-cache/i,
      /unstable_cache/,
      /cacheLife\s*\(/,
      /cacheTag\s*\(/,
    ];
    for (const filePath of planRuntimeFiles) {
      const source = fs.readFileSync(path.join(ROOT, filePath), "utf8");
      assertCondition(
        forbiddenCachePatterns.every((pattern) => !pattern.test(source)),
        `${filePath} retains an entity-bearing TTL/SWR cache policy.`,
      );
    }

    const assertTargetAbsentOnNextRead = async (label: string) => {
      const publicRows = await fixtureDb.execute({
        sql: "SELECT 1 FROM public_entities WHERE id = ?",
        args: ["boundary-public-pen"],
      });
      assertCondition(
        publicRows.rows.length === 0,
        `${label}: target remained in the direct public_entities oracle.`,
      );

      const recommendations = await recommendModule.getRecommendations(
        "boundary-public-brand",
        30,
      );
      assertCondition(
        !recommendations.some(
          (item: { id: string }) => item.id === "boundary-public-pen",
        ),
        `${label}: recommendation retained the target.`,
      );

      const wiki = (await markdownModule.MarkdownRenderer({
        content: "[[boundary-public-pen]]",
      })) as { props?: { html?: unknown } };
      assertCondition(
        !String(wiki.props?.html || "").includes("href="),
        `${label}: wiki retained the target.`,
      );

      const models = await libraryModule.getBrandPublicModels(
        "boundary-public-brand",
      );
      assertCondition(
        !models.models.some(
          (model: { slug: string }) => model.slug === "boundary-public-pen",
        ),
        `${label}: brand library retained the target.`,
      );

      assertCondition(
        !(await libraryModule.getMediaAssetIndex(20)).some(
          (item: { id: string }) => item.id === "boundary-cache-media",
        ),
        `${label}: media index retained the target owner.`,
      );
      const imageResponse = await imageProxyModule.GET(
        new NextRequest(
          "http://boundary.invalid/api/image-proxy?id=boundary-cache-media",
        ),
      );
      assertCondition(
        imageResponse.status === 404 &&
          imageResponse.headers.get("cache-control") === "no-store",
        `${label}: image proxy did not immediately return a no-store 404.`,
      );

      const sections = await libraryModule.getExhibitSections(
        "boundary-public-exhibit",
      );
      assertCondition(
        sections.length === 1 &&
          parseFixtureJsonList(sections[0].related_entity_slugs_json).length ===
            0 &&
          !parseFixtureJsonList(sections[0].diagram_slugs_json).includes(
            "boundary-cache-public-diagram",
          ) &&
          parseFixtureJsonList(sections[0].diagram_slugs_json).includes(
            "boundary-cache-global-diagram",
          ),
        `${label}: exhibit section retained an entity-owned target or lost non-entity content.`,
      );
      assertJsonEqual(
        await libraryModule.getRelatedEntitiesByPaths([
          "pen/boundary-public-pen",
        ]),
        [],
        `${label}: exhibit entity resolution`,
      );

      const timeline = await libraryModule.getRecentTimeline(20);
      assertCondition(
        !timeline.some(
          (event: { id: string }) => event.id === "boundary-public-timeline",
        ) &&
          timeline.some(
            (event: { id: string }) => event.id === "boundary-global-timeline",
          ),
        `${label}: timeline retained the entity owner or lost the global event.`,
      );
    };

    await fixtureDb.execute(`
      UPDATE entities
      SET summary = 'Critical edit invalidates every secondary surface.'
      WHERE id = 'boundary-public-pen'
    `);
    await assertTargetAbsentOnNextRead("Critical edit next read");

    await publishEntity(fixtureDb, {
      entityId: "boundary-public-pen",
      reviewer: "boundary-checker",
    });
    assertCondition(
      (await fixtureDb.execute(
        "SELECT 1 FROM public_entities WHERE id = 'boundary-public-pen'",
      )).rows.length === 1,
      "Republished target did not return before retirement.",
    );
    await setEntityPublicationStatus(
      fixtureDb,
      "boundary-public-pen",
      "retired",
    );
    await assertTargetAbsentOnNextRead("Retire next read");
  } finally {
    try {
      getDb().close();
    } finally {
      fixtureDb.close();
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
  }

  assertCondition(
    !fs.existsSync(tempRoot),
    "Secondary exhibit/timeline fixture was not cleaned.",
  );
  assertRealDatabaseUnchanged(before, "Secondary exhibit/timeline/cache checks");
  console.log(
    "Secondary exhibit/timeline/cache boundary passed: draft targets are gated and critical edit/retire disappear on the next no-store read while non-entity content remains.",
  );
}

async function seedIndependentDraftShells(
  db: ReturnType<typeof createClient>,
): Promise<void> {
  await db.execute(`
    INSERT INTO entities (id, type, slug, name, summary, body_md, source)
    VALUES
      ('boundary-majohn-brand', 'brand', '末匠-majohn', '末匠 Majohn', '', '', 'boundary-fixture'),
      ('boundary-majohn-a1', 'pen', '末匠-majohn-a1-按动', '末匠 Majohn A1', '', '', 'boundary-fixture'),
      ('boundary-montblanc-149', 'pen', '万宝龙-montblanc-大班149-meisterst-ck',
       '万宝龙 Montblanc 大班 149', '', '', 'boundary-fixture')
  `);
  await db.execute(`
    INSERT INTO entity_links (id, source_id, target_id, link_type)
    VALUES (
      'boundary-majohn-a1-maker',
      'boundary-majohn-a1',
      'boundary-majohn-brand',
      'made_by'
    )
  `);
}

interface OracleEntityRow {
  id: string;
  type: string;
  slug: string;
  name: string;
}

async function readKnownOracleEntities(
  db: ReturnType<typeof createClient>,
  ids: readonly string[],
): Promise<OracleEntityRow[]> {
  const rows = await db.execute({
    sql: `SELECT id, type, slug, name
          FROM entities
          WHERE id IN (${ids.map(() => "?").join(", ")})
          ORDER BY id`,
    args: [...ids],
  });
  assertSetEqual(
    rows.rows.map((row) => String(row.id)),
    ids,
    "Independent fixture identity",
  );
  return rows.rows.map((row) => ({
    id: String(row.id),
    type: String(row.type),
    slug: String(row.slug),
    name: String(row.name),
  }));
}

function expectedPublicCte(ids: readonly string[]): {
  sql: string;
  args: string[];
} {
  assertCondition(ids.length > 0, "Expected public ID oracle is empty.");
  return {
    sql: `expected_public(id) AS (VALUES ${ids.map(() => "(?)").join(", ")})`,
    args: [...ids],
  };
}

function entityIdentity(row: { type: unknown; slug: unknown }): string {
  return `${String(row.type)}/${String(row.slug)}`;
}

async function runIndependentAllParity(): Promise<void> {
  const before = realDatabaseSnapshot();
  const tempRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-public-boundary-all-")),
  );
  const databasePath = path.join(tempRoot, "fixture.db");
  const databaseUrl = `file:${databasePath}`;
  const fixtureDb = createClient({ url: databaseUrl });
  const failures: string[] = [];

  process.env.TURSO_DATABASE_URL = "";
  process.env.TURSO_AUTH_TOKEN = "";
  process.env.FPKG_DATABASE_URL = databaseUrl;
  process.env.PUBLICATION_GATE_FIXTURE = "1";

  try {
    await migrateDatabase(fixtureDb);
    await seedBoundaryFixtures(fixtureDb);
    await seedSecondaryLinkFixtures(fixtureDb);
    await seedSecondaryLibraryMediaFixtures(fixtureDb);
    // The full parity matrix renders every qualified fixture page. Give the
    // fixture-only primary images an on-site path so the detail page's strict
    // media invariant is exercised without changing the standalone library
    // fixture's external-media expectations.
    const detailMediaEntityIds = [
      "boundary-public-brand",
      "boundary-public-peer",
      "boundary-public-tag-peer",
      "boundary-misaligned-current",
      "boundary-misaligned-peer",
      ...Array.from(
        { length: 14 },
        (_, index) =>
          `boundary-brand-model-${String(index + 1).padStart(2, "0")}`,
      ),
    ];
    await fixtureDb.execute({
      sql: `
      UPDATE media_assets
          SET image_url = '/images/fixtures/' || id || '.jpg',
              thumbnail_url = '/images/fixtures/' || id || '-thumb.jpg',
              local_path = 'public/images/fixtures/' || id || '.jpg'
      WHERE id IN (${detailMediaEntityIds.map(() => "?").join(", ")})
    `,
      args: detailMediaEntityIds.map((entityId) => `${entityId}-media`),
    });
    await approveBoundaryEntity(fixtureDb, "boundary-public-brand");
    for (const entityId of detailMediaEntityIds.slice(1)) {
      await approveBoundaryEntity(
        fixtureDb,
        entityId,
      );
    }
    await seedSecondaryExhibitTimelineFixtures(fixtureDb);
    await fixtureDb.execute(`
      INSERT INTO timeline_events (
        id, entity_id, title, event_type, start_date, description,
        source_item_id, review_status
      ) VALUES (
        'boundary-public-brand-timeline', 'boundary-public-brand',
        'Public brand milestone', 'brand_founded', '2000',
        'A second public brand timeline event for the detail contract.',
        'boundary-contract-item-primary', 'approved'
      ), (
        'boundary-public-brand-timeline-secondary', 'boundary-public-brand',
        'Independent brand milestone', 'design_milestone', '2005',
        'An independently sourced brand timeline event for the detail contract.',
        'boundary-contract-item-secondary', 'approved'
      )
    `);
    await approveBoundaryEntity(fixtureDb, "boundary-public-brand");
    await seedIndependentDraftShells(fixtureDb);

    const expectedRows = await readKnownOracleEntities(
      fixtureDb,
      ORACLE_EXPECTED_PUBLIC_IDS,
    );
    const privateRows = await readKnownOracleEntities(
      fixtureDb,
      ORACLE_EXPECTED_PRIVATE_IDS,
    );
    const expectedIds = new Set(expectedRows.map((row) => row.id));
    const expectedIdentities = expectedRows.map(entityIdentity);
    const expectedIdentityKeys = expectedRows.map(
      (row) => `${row.type}:${row.slug}`,
    );
    const expectedPaths = expectedRows.map((row) => `/${entityIdentity(row)}`);
    const expectedSlugs = new Set(expectedRows.map((row) => row.slug));
    const privateSlugs = privateRows.map((row) => row.slug);
    const oracle = expectedPublicCte(ORACLE_EXPECTED_PUBLIC_IDS);
    const publishedBlockers = await fixtureDb.execute(`
      SELECT COUNT(*) AS total
      FROM publication_blockers blocker
      JOIN entity_publications publication
        ON publication.entity_id = blocker.entity_id
       AND publication.status = 'published'
      WHERE blocker.contract_version = 2
    `);
    assertCondition(
      Number(publishedBlockers.rows[0]?.total ?? -1) === 0,
      `Published contract-v2 blocker count is ${String(publishedBlockers.rows[0]?.total)}.`,
    );

    const reactModule = await import("react");
    Object.assign(globalThis, { React: reactModule.default });
    const browseDataModule = await import("../src/lib/browse-data");
    const sitemapModule = await import("../src/app/sitemap");
    const entityListRoute = await import("../src/app/api/entities/route");
    const entityDetailRoute = await import(
      "../src/app/api/entities/[slug]/route"
    );
    const entityPreviewRoute = await import(
      "../src/app/api/entities/[slug]/preview/route"
    );
    const detailModule = await import("../src/app/[type]/[slug]/page");
    const entityPageModule = await import("../src/lib/entity-page");
    const graphModule = await import("../src/app/graph/page");
    const linksModule = await import("../src/app/api/links/route");
    const recommendModule = await import("../src/lib/recommend");
    const conceptModule = await import("../src/lib/concept-engine");
    const markdownModule = await import("../src/components/MarkdownRenderer");
    const libraryModule = await import("../src/lib/library");
    const brandModule = await import("../src/components/library/BrandMuseum");
    const imageProxyModule = await import("../src/app/api/image-proxy/route");

    await collectParityFailure(failures, "complete list equality", async () => {
      const viewRows = await fixtureDb.execute(
        "SELECT id, type, slug FROM public_entities ORDER BY id",
      );
      assertSetEqual(
        viewRows.rows.map((row) => String(row.id)),
        expectedIds,
        "public_entities actual view",
      );
      assertSetEqual(
        viewRows.rows.map(entityIdentity),
        expectedIdentities,
        "public_entities identities",
      );

      const browse = await browseDataModule.getBrowseData({ limit: "50" });
      assertSetEqual(
        browse.entities.map(entityIdentity),
        expectedIdentities,
        "browse rows",
      );
      assertCondition(
        browse.total === expectedRows.length,
        `Browse total aggregate expected ${expectedRows.length}, got ${browse.total}.`,
      );
      assertNoPublicationInternals(browse, "all-parity browse");

      const sitemap = await sitemapModule.default();
      const expectedTypes = new Set(expectedRows.map((row) => row.type));
      const sitemapEntities = sitemap
        .map((entry) => new URL(entry.url).pathname.replace(/^\/+/, ""))
        .filter((pathname) => {
          const [type, slug] = pathname.split("/");
          return Boolean(type && slug && expectedTypes.has(type));
        });
      assertSetEqual(
        sitemapEntities,
        expectedIdentities,
        "sitemap entity pages",
      );

      const listResponse = await entityListRoute.GET(
        new NextRequest("http://boundary.invalid/api/entities"),
      );
      const listBody = (await listResponse.json()) as Array<
        Record<string, unknown>
      >;
      assertCondition(
        listResponse.status === 200 &&
          listResponse.headers.get("cache-control") === "no-store",
        "Entity list API is not a no-store 200.",
      );
      assertSetEqual(
        listBody.map(entityIdentity),
        expectedIdentities,
        "entity list API",
      );
      listBody.forEach((row, index) =>
        assertExactKeys(
          row,
          ["type", "slug", "name", "summary"],
          `all-list[${index}]`,
        ),
      );
      assertNoPublicationInternals(listBody, "all-parity entity list");

      const serialized = JSON.stringify({ browse, sitemapEntities, listBody });
      assertCondition(
        privateSlugs.every((slug) => !serialized.includes(slug)),
        "A complete-list surface leaked Montblanc, Majohn, or another draft fixture.",
      );
    });

    await collectParityFailure(
      failures,
      "per-governed-ID detail/metadata/API equivalence",
      async () => {
        const allKnownIds = [
          ...ORACLE_EXPECTED_PUBLIC_IDS,
          ...ORACLE_EXPECTED_PRIVATE_IDS,
        ];
        const governed = await fixtureDb.execute({
          sql: `SELECT e.id, e.type, e.slug
                FROM entities e
                WHERE e.id IN (${allKnownIds.map(() => "?").join(", ")})
                  AND (
                    e.type IN ('brand', 'pen')
                    OR EXISTS (
                      SELECT 1 FROM entity_publications publication
                      WHERE publication.entity_id = e.id
                    )
                  )
                ORDER BY e.id`,
          args: allKnownIds,
        });

        for (const row of governed.rows) {
          const id = String(row.id);
          const type = String(row.type);
          const slug = String(row.slug);
          const expectedPublic = expectedIds.has(id);
          const direct = await fixtureDb.execute({
            sql: "SELECT 1 FROM public_entities WHERE id = ?",
            args: [id],
          });
          assertCondition(
            (direct.rows.length === 1) === expectedPublic,
            `${id} actual view membership differs from independent known-ID oracle.`,
          );

          if (expectedPublic) {
            const metadata = await detailModule.generateMetadata({
              params: Promise.resolve({ type, slug }),
            });
            assertCondition(
              metadata.alternates?.canonical === `/${type}/${slug}`,
              `${id} metadata canonical is missing or wrong.`,
            );
            await detailModule.default({
              params: Promise.resolve({ type, slug }),
            });
            if (type === "pen") {
              const pageData = await entityPageModule.getPublishedEntityPage(
                "pen",
                slug,
              );
              assertCondition(
                pageData?.canonicalBrand.slug === "boundary-public-brand",
                `${id} canonical brand link is missing or wrong.`,
              );
            }
          } else {
            await expectNextControlFlow(
              () =>
                detailModule.generateMetadata({
                  params: Promise.resolve({ type, slug }),
                }),
              "404",
              `${id} metadata`,
            );
            await expectNextControlFlow(
              () =>
                detailModule.default({
                  params: Promise.resolve({ type, slug }),
                }),
              "404",
              `${id} detail`,
            );
          }

          const detailResponse = await entityDetailRoute.GET(
            new NextRequest(`http://boundary.invalid/api/entities/${slug}`),
            { params: Promise.resolve({ slug }) },
          );
          const previewResponse = await entityPreviewRoute.GET(
            new NextRequest(
              `http://boundary.invalid/api/entities/${slug}/preview`,
            ),
            { params: Promise.resolve({ slug }) },
          );
          const expectedStatus = expectedPublic ? 200 : 404;
          assertCondition(
            detailResponse.status === expectedStatus &&
              previewResponse.status === expectedStatus,
            `${id} detail/preview API expected ${expectedStatus}, got ${detailResponse.status}/${previewResponse.status}.`,
          );
          assertCondition(
            detailResponse.headers.get("cache-control") === "no-store" &&
              previewResponse.headers.get("cache-control") === "no-store",
            `${id} detail/preview API is not no-store.`,
          );
          const detailBody = await detailResponse.json();
          const previewBody = await previewResponse.json();
          assertNoPublicationInternals(detailBody, `${id} detail API`);
          assertNoPublicationInternals(previewBody, `${id} preview API`);
        }
      },
    );

    await collectParityFailure(
      failures,
      "keyed facets/statistics/home/by aggregates",
      async () => {
        const browse = await browseDataModule.getBrowseData({ limit: "50" });
        const expectedTypeRows = await fixtureDb.execute({
          sql: `WITH ${oracle.sql}
                SELECT e.type, COUNT(*) AS cnt
                FROM entities e
                JOIN expected_public expected ON expected.id = e.id
                GROUP BY e.type
                ORDER BY e.type`,
          args: oracle.args,
        });
        const expectedTypeCounts = normalizeCountRows(
          expectedTypeRows.rows as Array<{ type: unknown; cnt: unknown }>,
        );
        assertJsonEqual(
          normalizeCountRows(browse.typeCounts),
          expectedTypeCounts,
          "Browse type aggregate",
        );

        const expectedFacets: Record<
          string,
          Array<{ slug: string; name: string; count: number }>
        > = {};
        for (const [facetKey, tagDimension] of Object.entries(
          ORACLE_FACET_DIMENSIONS,
        )) {
          const facetRows = await fixtureDb.execute({
            sql: `WITH ${oracle.sql}
                  SELECT tag.slug, tag.name, COUNT(DISTINCT e.id) AS cnt
                  FROM expected_public expected
                  JOIN entities e ON e.id = expected.id
                  JOIN entity_tags tagged ON tagged.entity_id = e.id
                  JOIN tags tag ON tag.id = tagged.tag_id
                  WHERE tag.dimension = ?
                  GROUP BY tag.id
                  HAVING cnt > 0`,
            args: [...oracle.args, tagDimension],
          });
          const options = facetRows.rows.map((row) => ({
            slug: String(row.slug),
            name: String(row.name),
            count: Number(row.cnt),
          }));
          if (facetKey === "nib_material") {
            const gold = await fixtureDb.execute({
              sql: `WITH ${oracle.sql}
                    SELECT COUNT(DISTINCT e.id) AS cnt
                    FROM expected_public expected
                    JOIN entities e ON e.id = expected.id
                    JOIN entity_tags tagged ON tagged.entity_id = e.id
                    JOIN tags tag ON tag.id = tagged.tag_id
                    WHERE tag.dimension = 'nib_material'
                      AND tag.slug IN (${ORACLE_GOLD_NIB_TAG_SLUGS.map(() => "?").join(", ")})`,
              args: [...oracle.args, ...ORACLE_GOLD_NIB_TAG_SLUGS],
            });
            const count = Number(gold.rows[0]?.cnt || 0);
            if (count > 0) {
              options.push({ slug: "gold", name: "所有金尖", count });
            }
          }
          expectedFacets[facetKey] = options.sort((left, right) =>
            left.slug.localeCompare(right.slug),
          );
        }
        const actualFacets = Object.fromEntries(
          Object.entries(browse.facets).map(([key, options]) => [
            key,
            [...options].sort((left, right) =>
              left.slug.localeCompare(right.slug),
            ),
          ]),
        );
        assertJsonEqual(actualFacets, expectedFacets, "Browse keyed facets");

        const home = await browseDataModule.getHomeDiscoveryData();
        assertJsonEqual(
          normalizeCountRows(home.stats),
          expectedTypeCounts,
          "Home type statistics",
        );
        const expectedTypeMap = new Map(
          expectedTypeCounts.map((row) => [row.type, row.cnt]),
        );
        const actualBreakdownMap = new Map(
          home.typeBreakdown.map((row) => [row.type, row.cnt]),
        );
        assertJsonEqual(
          Object.fromEntries(
            [...actualBreakdownMap.entries()].sort(([left], [right]) =>
              left.localeCompare(right),
            ),
          ),
          Object.fromEntries(
            [...expectedTypeMap.entries()].sort(([left], [right]) =>
              left.localeCompare(right),
            ),
          ),
          "Home type breakdown counts",
        );
        assertSubset(
          home.featured.map(entityIdentity),
          expectedIdentities,
          "Home featured",
        );
        for (const breakdown of home.typeBreakdown) {
          assertSubset(
            breakdown.stars.map(
              (star) =>
                `${breakdown.type}/${star.slug}`,
            ),
            expectedIdentities,
            `Home ${breakdown.type} stars`,
          );
        }

        const brandDimension = await browseDataModule.getDimensionDiscoveryData(
          "brand",
          "brand",
        );
        const expectedBrandRows = await fixtureDb.execute({
          sql: `WITH ${oracle.sql}
                SELECT brand.name, brand.slug,
                       COUNT(DISTINCT pen.id) AS entity_count
                FROM expected_public expected_brand
                JOIN entities brand ON brand.id = expected_brand.id
                LEFT JOIN entity_links relation
                  ON relation.target_id = brand.id
                 AND relation.link_type = 'made_by'
                LEFT JOIN expected_public expected_pen
                  ON expected_pen.id = relation.source_id
                LEFT JOIN entities pen
                  ON pen.id = expected_pen.id
                 AND pen.type = 'pen'
                WHERE brand.type = 'brand'
                GROUP BY brand.id
                ORDER BY brand.slug`,
          args: oracle.args,
        });
        const expectedBrandItems = expectedBrandRows.rows.map((row) => ({
          name: String(row.name),
          slug: String(row.slug),
          dimension: "brand",
          count: Number(row.entity_count || 0),
        }));
        assertJsonEqual(
          [...brandDimension.items].sort((left, right) =>
            left.slug.localeCompare(right.slug),
          ),
          expectedBrandItems,
          "Brand dimension keyed counts",
        );
        assertCondition(
          brandDimension.totalEntities === ORACLE_PUBLIC_MODEL_IDS.length,
          `Brand dimension total expected ${ORACLE_PUBLIC_MODEL_IDS.length}, got ${brandDimension.totalEntities}.`,
        );

        for (const [facetKey, tagDimension] of Object.entries(
          ORACLE_FACET_DIMENSIONS,
        )) {
          const dimension = await browseDataModule.getDimensionDiscoveryData(
            facetKey,
            tagDimension,
          );
          const expectedDimensionRows = await fixtureDb.execute({
            sql: `WITH ${oracle.sql}
                  SELECT tag.name, tag.slug, tag.dimension,
                         COUNT(DISTINCT e.id) AS entity_count
                  FROM expected_public expected
                  JOIN entities e ON e.id = expected.id
                  JOIN entity_tags tagged ON tagged.entity_id = e.id
                  JOIN tags tag ON tag.id = tagged.tag_id
                  WHERE tag.dimension = ?
                  GROUP BY tag.id
                  HAVING entity_count > 0`,
            args: [...oracle.args, tagDimension],
          });
          const expectedItems = expectedDimensionRows.rows
            .map((row) => ({
              name: String(row.name),
              slug: String(row.slug),
              dimension: String(row.dimension),
              count: Number(row.entity_count || 0),
            }))
            .sort((left, right) => left.slug.localeCompare(right.slug));
          assertJsonEqual(
            [...dimension.items].sort((left, right) =>
              left.slug.localeCompare(right.slug),
            ),
            expectedItems,
            `By-${facetKey} keyed counts`,
          );
          const expectedDimensionTotal = await fixtureDb.execute({
            sql: `WITH ${oracle.sql}
                  SELECT COUNT(DISTINCT e.id) AS total
                  FROM expected_public expected
                  JOIN entities e ON e.id = expected.id
                  JOIN entity_tags tagged ON tagged.entity_id = e.id
                  JOIN tags tag ON tag.id = tagged.tag_id
                  WHERE tag.dimension = ?`,
            args: [...oracle.args, tagDimension],
          });
          assertCondition(
            dimension.totalEntities ===
              Number(expectedDimensionTotal.rows[0]?.total || 0),
            `By-${facetKey} total aggregate differs from the independent expected set.`,
          );
        }
      },
    );

    await collectParityFailure(
      failures,
      "contextual graph/links/recommend/wiki/concept subsets",
      async () => {
        const graphTree = await graphModule.default({
          searchParams: Promise.resolve({ entity: "boundary-public-brand" }),
        });
        const graphTargets: string[] = [];
        walkReactTree(graphTree, (props) => {
          if (typeof props.href === "string") {
            if (props.href.startsWith("/graph?")) {
              const slug = new URL(
                props.href,
                "http://boundary.invalid",
              ).searchParams.get("entity");
              if (slug) graphTargets.push(slug);
            } else {
              const match = props.href.match(/^\/([^/]+)\/(.+)$/);
              if (match) graphTargets.push(match[2]);
            }
          }
          if (typeof props.entitySlug === "string") {
            graphTargets.push(props.entitySlug);
          }
        });
        assertSubset(graphTargets, expectedSlugs, "Graph page");

        for (const draftSlug of [
          "末匠-majohn-a1-按动",
          "万宝龙-montblanc-大班149-meisterst-ck",
        ]) {
          const draftTree = await graphModule.default({
            searchParams: Promise.resolve({ entity: draftSlug }),
          });
          let leaked = false;
          walkReactTree(draftTree, (props) => {
            leaked ||= Object.values(props).some(
              (value) => typeof value === "string" && value.includes(draftSlug),
            );
          });
          assertCondition(!leaked, `Graph selected draft center ${draftSlug}.`);
        }

        const linksResponse = await linksModule.GET(
          new NextRequest(
            "http://boundary.invalid/api/links?slug=boundary-public-brand&depth=2",
          ),
        );
        const linksBody = (await linksResponse.json()) as Record<string, unknown>;
        assertCondition(
          linksResponse.status === 200 &&
            linksResponse.headers.get("cache-control") === "no-store",
          "Links API is not a no-store 200.",
        );
        const linkTargets: string[] = [];
        for (const field of [
          "forward",
          "backlinks",
          "secondHopForward",
          "secondHopBacklinks",
        ]) {
          const rows = linksBody[field];
          assertCondition(Array.isArray(rows), `links.${field} is not an array.`);
          for (const row of rows as Array<Record<string, unknown>>) {
            linkTargets.push(String(row.source_key), String(row.target_key));
          }
        }
        assertSubset(linkTargets, expectedIdentityKeys, "Links API");
        assertNoPublicationInternals(linksBody, "all-parity links API");

        for (const entityId of [
          "boundary-public-brand",
          "boundary-public-pen",
        ]) {
          const recommendations = await recommendModule.getRecommendations(
            entityId,
            50,
          );
          assertSubset(
            recommendations.map((item) => item.id),
            expectedIds,
            `Recommendations for ${entityId}`,
          );
        }
        for (const entityId of [
          "boundary-majohn-a1",
          "boundary-montblanc-149",
        ]) {
          assertJsonEqual(
            await recommendModule.getRecommendations(entityId, 50),
            [],
            `Draft recommendations for ${entityId}`,
          );
        }

        await conceptModule.recomputeAllConceptMatches();
        const conceptRows = await fixtureDb.execute(
          "SELECT concept_id, entity_id FROM concept_matches ORDER BY concept_id, entity_id",
        );
        assertSubset(
          conceptRows.rows.map((row) => String(row.entity_id)),
          expectedIds,
          "Concept materialization entities",
        );
        assertCondition(
          conceptRows.rows.every(
            (row) => row.concept_id === "boundary-public-rule",
          ),
          "Concept materialization included a draft concept.",
        );
        assertSubset(
          (
            (await conceptModule.getEntitiesForConcept(
              "boundary-public-rule",
            )) as Array<{ id: string }>
          ).map((row) => row.id),
          expectedIds,
          "Concept readback",
        );
        assertJsonEqual(
          await conceptModule.getEntitiesForConcept("boundary-draft-rule"),
          [],
          "Draft concept readback",
        );

        const wikiContent = [
          ...expectedRows.map((row) => `[[${row.slug}]]`),
          ...privateRows.map((row) => `[[${row.slug}]]`),
        ].join(" / ");
        const rendered = (await markdownModule.MarkdownRenderer({
          content: wikiContent,
        })) as { props?: { html?: unknown } };
        const html = String(rendered.props?.html || "");
        const wikiHrefs = [...html.matchAll(/href="([^"]+)"/g)].map(
          (match) => match[1],
        );
        assertSubset(wikiHrefs, expectedPaths, "Wiki links");
        assertCondition(
          privateSlugs.every(
            (slug) => !html.includes(`href="/${privateRows.find((row) => row.slug === slug)?.type}/${slug}"`),
          ),
          "Wiki links exposed a draft Montblanc, Majohn, or other governed target.",
        );
      },
    );

    await collectParityFailure(
      failures,
      "complete brand-model reverse equality",
      async () => {
        const expectedBrandRows = expectedRows.filter(
          (row) => row.type === "brand",
        );
        for (const brand of expectedBrandRows) {
          const reverseRows = await fixtureDb.execute({
            sql: `WITH ${oracle.sql}
                  SELECT pen.type, pen.slug, pen.name
                  FROM entities brand
                  JOIN entity_links relation
                    ON relation.target_id = brand.id
                   AND relation.link_type = 'made_by'
                  JOIN expected_public expected_pen
                    ON expected_pen.id = relation.source_id
                  JOIN entities pen
                    ON pen.id = expected_pen.id
                   AND pen.type = 'pen'
                  WHERE brand.id = ?
                  GROUP BY pen.id
                  ORDER BY pen.name, pen.slug`,
            args: [...oracle.args, brand.id],
          });
          const expectedModelPaths = reverseRows.rows.map(
            (row) => `/${entityIdentity(row)}`,
          );
          const actual = await libraryModule.getBrandPublicModels(brand.id);
          assertCondition(
            actual.count === expectedModelPaths.length,
            `${brand.id} model count expected ${expectedModelPaths.length}, got ${actual.count}.`,
          );
          assertSetEqual(
            actual.models.map((model) => `/${entityIdentity(model)}`),
            expectedModelPaths,
            `${brand.id} complete model reverse set`,
          );

          const brandPageData =
            await entityPageModule.getPublishedEntityPage("brand", brand.slug);
          assertCondition(
            brandPageData?.type === "brand",
            `${brand.id} published brand page data is missing.`,
          );
          const brandTree = await brandModule.BrandMuseum({
            timeline: brandPageData.timeline,
            models: brandPageData.models,
          });
          const brandHrefs: string[] = [];
          let brandText = "";
          walkReactTree(brandTree, (props) => {
            if (typeof props.href === "string") brandHrefs.push(props.href);
            brandText += reactText(props.children);
          });
          assertSetEqual(
            brandHrefs.filter((href) => href.startsWith("/pen/")),
            expectedModelPaths,
            `${brand.id} rendered model links`,
          );
          assertCondition(
            brandText.includes(`全部型号（${expectedModelPaths.length}）`),
            `${brand.id} rendered model count is inaccurate.`,
          );
        }

        const ownership = await fixtureDb.execute({
          sql: `WITH ${oracle.sql}
                SELECT pen.id,
                       COUNT(relation.id) AS all_made_by,
                       COUNT(brand.id) AS public_brand_count
                FROM expected_public expected_pen
                JOIN entities pen
                  ON pen.id = expected_pen.id
                 AND pen.type = 'pen'
                LEFT JOIN entity_links relation
                  ON relation.source_id = pen.id
                 AND relation.link_type = 'made_by'
                LEFT JOIN expected_public expected_brand
                  ON expected_brand.id = relation.target_id
                LEFT JOIN entities brand
                  ON brand.id = expected_brand.id
                 AND brand.type = 'brand'
                GROUP BY pen.id`,
          args: oracle.args,
        });
        const invalid = ownership.rows.filter(
          (row) =>
            Number(row.all_made_by) !== 1 ||
            Number(row.public_brand_count) !== 1,
        );
        assertCondition(
          invalid.length === 0,
          `Public pen canonical-brand cardinality failed: ${invalid
            .map(
              (row) =>
                `${String(row.id)}(${String(row.all_made_by)}/${String(row.public_brand_count)})`,
            )
            .join(", ")}.`,
        );
        assertCondition(
          ownership.rows.length === ORACLE_PUBLIC_MODEL_IDS.length,
          `Expected ${ORACLE_PUBLIC_MODEL_IDS.length} public pens in ownership oracle, got ${ownership.rows.length}.`,
        );
      },
    );

    await collectParityFailure(
      failures,
      "source/media/diagram/exhibit/timeline subsets and API leaks",
      async () => {
        const sourceItems = await libraryModule.getSourceItemIndex({
          limit: 100,
        });
        assertSetEqual(
          sourceItems.map((item) => item.id),
          [
            ...BOUNDARY_QUALIFICATION_SOURCE_ITEM_IDS,
            "boundary-public-reference-item",
            "boundary-public-citation-item",
          ],
          "Source item public-owner usage",
        );
        assertCondition(
          sourceItems.every((item) => Number(item.reference_count) > 0),
          "Source item index included an item without a public usage.",
        );
        const registry = await libraryModule.getSourceRegistryIndex();
        assertSetEqual(
          registry.map((item) => item.id),
          [
            ...BOUNDARY_QUALIFICATION_REGISTRY_IDS,
            "boundary-library-source",
          ],
          "Source registry public usage",
        );

        const media = await libraryModule.getMediaAssetIndex(100);
        const expectedParityMediaIds = [
          "boundary-public-media",
          "boundary-cache-media",
          ...detailMediaEntityIds.map((entityId) => `${entityId}-media`),
        ];
        assertSetEqual(
          media.map((item) => item.id),
          expectedParityMediaIds,
          "Media owner subset",
        );
        assertSubset(
          media
            .filter((item) => item.entity_type && item.entity_slug)
            .map((item) => `${item.entity_type}/${item.entity_slug}`),
          expectedIdentities,
          "Media entity targets",
        );

        for (const [mediaId, expectedStatus] of [
          ["boundary-public-media", 307],
          ["boundary-cache-media", 307],
          ["boundary-draft-media", 404],
          ["boundary-orphan-media", 404],
        ] as const) {
          const response = await imageProxyModule.GET(
            new NextRequest(
              `http://boundary.invalid/api/image-proxy?id=${mediaId}`,
            ),
          );
          assertCondition(
            response.status === expectedStatus &&
              response.headers.get("cache-control") === "no-store",
            `${mediaId} image proxy expected no-store ${expectedStatus}, got ${response.status}.`,
          );
        }

        const diagrams = await libraryModule.getDiagramIndex(100);
        assertSetEqual(
          diagrams.map((diagram) => diagram.id),
          [
            "boundary-public-diagram",
            "boundary-global-diagram",
            "boundary-cache-public-diagram",
            "boundary-cache-global-diagram",
          ],
          "Diagram owner subset",
        );
        assertSubset(
          diagrams
            .filter(
              (diagram) => diagram.entity_type && diagram.entity_slug,
            )
            .map(
              (diagram) => `${diagram.entity_type}/${diagram.entity_slug}`,
            ),
          expectedIdentities,
          "Diagram owners",
        );
        for (const diagram of diagrams) {
          const hotspots = JSON.parse(diagram.hotspots_json || "[]") as Array<{
            linked_entity?: string;
          }>;
          assertSubset(
            hotspots
              .map((hotspot) => hotspot.linked_entity)
              .filter((value): value is string => Boolean(value)),
            expectedPaths,
            `${diagram.id} hotspots`,
          );
        }

        const timeline = await libraryModule.getRecentTimeline(100);
        assertSetEqual(
          timeline.map((event) => event.id),
          [
            "boundary-public-brand-timeline",
            "boundary-public-brand-timeline-secondary",
            "boundary-public-timeline",
            "boundary-global-timeline",
          ],
          "Timeline owner subset",
        );
        assertSubset(
          timeline
            .filter((event) => event.entity_type && event.entity_slug)
            .map((event) => `${event.entity_type}/${event.entity_slug}`),
          expectedIdentities,
          "Timeline targets",
        );

        const sections = await libraryModule.getExhibitSections(
          "boundary-public-exhibit",
        );
        assertCondition(sections.length === 1, "Published exhibit lost its section.");
        const relatedPaths = parseFixtureJsonList(
          sections[0].related_entity_slugs_json,
        ).map((value) => `/${value.replace(/^\/+/, "")}`);
        assertSubset(relatedPaths, expectedPaths, "Exhibit related entities");
        assertSetEqual(
          parseFixtureJsonList(sections[0].diagram_slugs_json),
          ["boundary-cache-public-diagram", "boundary-cache-global-diagram"],
          "Exhibit diagram targets",
        );
        const resolved = await libraryModule.getRelatedEntitiesByPaths([
          "pen/boundary-public-pen",
          "pen/boundary-draft-pen",
          "pen/末匠-majohn-a1-按动",
          "pen/万宝龙-montblanc-大班149-meisterst-ck",
        ]);
        assertSetEqual(
          resolved.map(entityIdentity),
          ["pen/boundary-public-pen"],
          "Exhibit path resolution",
        );

        const featuredBrands = await libraryModule.getFeaturedBrands(100);
        assertSetEqual(
          featuredBrands.map((brand) => brand.slug),
          ["boundary-public-brand"],
          "Featured brand subset",
        );

        assertNoPublicationStateInternals(
          { sourceItems, registry, media, diagrams, timeline, sections },
          "secondary public DTOs",
        );
        const serialized = JSON.stringify({
          sourceItems,
          registry,
          media,
          diagrams,
          timeline,
          sections: sections.map(({ body_md: _bodyMd, ...section }) => section),
        });
        assertCondition(
          privateSlugs.every((slug) => !serialized.includes(slug)),
          "A secondary surface leaked a draft Montblanc, Majohn, or other governed target.",
        );
      },
    );

    if (failures.length > 0) {
      for (const failure of failures) console.error(`- ${failure}`);
      throw new Error(
        `Independent four-semantics parity failed ${failures.length} category checks.`,
      );
    }

    console.log(
      `Independent public boundary passed: published_blockers=0 list_diff=0 per_id_diff=0 aggregate_diff=0 context_diff=0 reverse_diff=0; ${expectedRows.length} exact identities and ${ORACLE_PUBLIC_MODEL_IDS.length}/${ORACLE_PUBLIC_MODEL_IDS.length} complete reverse brand models. Majohn A1 and Montblanc 149 remain draft and absent.`,
    );
  } finally {
    try {
      getDb().close();
    } finally {
      fixtureDb.close();
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
  }

  assertCondition(
    !fs.existsSync(tempRoot),
    "Independent all-parity fixture was not cleaned.",
  );
  assertRealDatabaseUnchanged(before, "Independent all-parity checks");
}

async function runLegacyBoundary() {
  const sourceBefore = assertPhase19LockedRealCatalog(
    snapshotCatalogFiles(REAL_DATABASE_PATH),
  );
  const tempRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-public-boundary-legacy-")),
  );
  const databasePath = path.join(tempRoot, "catalog-copy.db");
  try {
    copyCheckpointedCatalogToDisposableCopy(
      REAL_DATABASE_PATH,
      databasePath,
      tempRoot,
      { expectedSourceSnapshot: sourceBefore },
    );
    const db = createClient({ url: `file:${databasePath}` });
    try {
      const failures: string[] = [];

  const foreignKeys = await db.execute("PRAGMA foreign_key_check");
  if (foreignKeys.rows.length > 0) {
    failures.push(`foreign_key_check returned ${foreignKeys.rows.length} row(s)`);
  }

  const publicCount = await db.execute(
    `SELECT COUNT(*) AS total,
            SUM(CASE WHEN type = 'pen' THEN 1 ELSE 0 END) AS pens
     FROM entities e
     WHERE ${actualPublicViewMembership("e")}`,
  );
  const retired = await db.execute({
    sql: `SELECT slug FROM entities e
          WHERE slug IN (${RETIRED_DUPLICATE_SLUGS.map(() => "?").join(",")})
            AND ${actualPublicViewMembership("e")}`,
    args: RETIRED_DUPLICATE_SLUGS,
  });
  if (retired.rows.length > 0) {
    failures.push(
      `retired duplicate slugs remain public: ${retired.rows
        .map((row) => row.slug)
        .join(", ")}`,
    );
  }

  const markerConditions = LEGACY_INDEX_ARTICLE_MARKERS.flatMap(() => [
    "COALESCE(name, '') LIKE ?",
    "COALESCE(summary, '') LIKE ?",
    "COALESCE(body_md, '') LIKE ?",
  ]);
  const markerArgs = LEGACY_INDEX_ARTICLE_MARKERS.flatMap((marker) => {
    const pattern = `%${marker}%`;
    return [pattern, pattern, pattern];
  });
  const unlistedIndexArticles = await db.execute({
    sql: `SELECT slug FROM entities
          WHERE type = 'article'
            AND (${markerConditions.join(" OR ")})
            AND slug NOT IN (${LEGACY_HIDDEN_ARTICLE_SLUGS.map(() => "?").join(", ")})`,
    args: [...markerArgs, ...LEGACY_HIDDEN_ARTICLE_SLUGS],
  });
  if (unlistedIndexArticles.rows.length > 0) {
    failures.push(
      `marker-matched index articles are missing from the explicit hidden list: ${unlistedIndexArticles.rows
        .map((row) => row.slug)
        .join(", ")}`,
    );
  }

  const typeErrors = await db.execute(
    `SELECT e.slug
     FROM entities e
     LEFT JOIN model_specs ms ON ms.entity_id = e.id
     WHERE e.type = 'pen'
       AND ${actualPublicViewMembership("e")}
       AND (
         lower(COALESCE(e.summary, '')) LIKE '%不是 fountain pen%'
         OR e.summary LIKE '%应按墨水线%'
         OR lower(COALESCE(ms.series_name, '')) LIKE '%brand-generic%'
       )`,
  );
  if (typeErrors.rows.length > 0) {
    failures.push(
      `known type errors remain public pens: ${typeErrors.rows
        .map((row) => row.slug)
        .join(", ")}`,
    );
  }

  const nonPenSpecs = await db.execute(
    `SELECT e.slug
     FROM model_specs ms
     JOIN entities e ON e.id = ms.entity_id
     WHERE e.type != 'pen'`,
  );
  if (nonPenSpecs.rows.length > 0) {
    failures.push(
      `non-pen entities still own model specs: ${nonPenSpecs.rows
        .map((row) => row.slug)
        .join(", ")}`,
    );
  }

  const approvedSpecs = await db.execute(
    `SELECT e.slug, ms.*
     FROM model_specs ms
     JOIN entities e ON e.id = ms.entity_id
     WHERE ms.review_status = 'approved'
       AND ${actualPublicViewMembership("e")}`,
  );
  for (const row of approvedSpecs.rows) {
    for (const field of SPEC_FIELDS) {
      const value = row[field];
      if (value && cleanPublicText(value) === null) {
        failures.push(`${row.slug}.${field} contains an internal placeholder`);
      }
    }
  }

  const unsupportedApprovedSpecs = await db.execute(
    `SELECT e.slug
     FROM model_specs ms
     JOIN entities e ON e.id = ms.entity_id
     WHERE ms.review_status = 'approved'
       AND ${actualPublicViewMembership("e")}
       AND NOT EXISTS (
         SELECT 1
         FROM citations citation
         LEFT JOIN source_items direct_source
           ON direct_source.id = citation.source_item_id
         LEFT JOIN claims claim
           ON claim.id = citation.claim_id
         LEFT JOIN source_items claim_source
           ON claim_source.id = claim.source_item_id
         WHERE citation.target_type = 'model_spec'
           AND citation.target_id = ms.id
           AND (
             direct_source.review_status = 'approved'
             OR (
               claim.review_status = 'approved'
               AND claim_source.review_status = 'approved'
             )
           )
       )`,
  );
  if (unsupportedApprovedSpecs.rows.length > 0) {
    failures.push(
      `approved specs lack an approved citation chain: ${unsupportedApprovedSpecs.rows
        .map((row) => row.slug)
        .join(", ")}`,
    );
  }

  const publicSnapshotFields = await db.execute(
    `SELECT e.slug
     FROM model_specs ms
     JOIN entities e ON e.id = ms.entity_id
     WHERE ${actualPublicViewMembership("e")}
       AND (ms.price_range IS NOT NULL OR ms.status IS NOT NULL)`,
  );
  if (publicSnapshotFields.rows.length > 0) {
    failures.push(
      `${publicSnapshotFields.rows.length} public specs still expose undated price/status snapshots`,
    );
  }

  const placeholderAttributes = await db.execute(
    `SELECT COUNT(*) AS total
     FROM entity_attributes
     WHERE value IS NULL
        OR trim(value) = ''
        OR trim(value) IN ('—', '-', '待确认', '待核验')`,
  );
  if (Number(placeholderAttributes.rows[0]?.total || 0) > 0) {
    failures.push("entity_attributes still contains explicit placeholder values");
  }

  const invalidBrandRelations = await db.execute(
    `SELECT COUNT(*) AS total
     FROM entity_links relation
     JOIN entities source_entity ON source_entity.id = relation.source_id
     JOIN entities target_entity ON target_entity.id = relation.target_id
     WHERE relation.link_type = 'brand_model'
        OR (
          relation.link_type = 'made_by'
          AND NOT (
            source_entity.type = 'pen'
            AND target_entity.type = 'brand'
          )
        )`,
  );
  if (Number(invalidBrandRelations.rows[0]?.total || 0) > 0) {
    failures.push("legacy or directionally invalid brand relations remain");
  }

  const missingReverseRelations = await db.execute(
    `SELECT COUNT(*) AS total
     FROM entity_links relation
     WHERE relation.link_type != 'reverse'
       AND NOT EXISTS (
         SELECT 1
         FROM entity_links reverse_relation
         WHERE reverse_relation.id = 'rev-' || relation.id
           AND reverse_relation.source_id = relation.target_id
           AND reverse_relation.target_id = relation.source_id
           AND reverse_relation.link_type = 'reverse'
       )`,
  );
  if (Number(missingReverseRelations.rows[0]?.total || 0) > 0) {
    failures.push("forward entity relations are missing canonical reverse rows");
  }

  const badPublicReferences = await db.execute(
    `SELECT COUNT(*) AS total
     FROM entity_references er
     JOIN source_items si ON si.id = er.source_item_id
     JOIN entities e ON e.id = er.entity_id
     WHERE ${actualPublicViewMembership("e")}
       AND er.review_status = 'approved'
       AND si.review_status != 'approved'`,
  );
  if (Number(badPublicReferences.rows[0]?.total || 0) > 0) {
    failures.push("approved entity references include unapproved source items");
  }

  const duplicatePublicReferences = await db.execute(
    `SELECT COUNT(*) AS total
     FROM (
       SELECT er.entity_id, er.source_item_id, er.relation_type,
              COALESCE(er.note, '') as note
       FROM entity_references er
       JOIN entities e ON e.id = er.entity_id
       WHERE ${actualPublicViewMembership("e")}
         AND er.review_status = 'approved'
       GROUP BY er.entity_id, er.source_item_id, er.relation_type, note
       HAVING COUNT(*) > 1
     ) duplicates`,
  );
  if (Number(duplicatePublicReferences.rows[0]?.total || 0) > 0) {
    failures.push("public entities contain duplicate semantic references");
  }

  const publicImportResidue = await db.execute(
    `SELECT e.slug
     FROM entities e
     WHERE ${actualPublicViewMembership("e")}
       AND (
         COALESCE(e.summary, '') LIKE '%参考资料索引%'
         OR COALESCE(e.body_md, '') LIKE '%参考资料索引%'
         OR COALESCE(e.body_md, '') LIKE '%以下是翻译结果%'
         OR COALESCE(e.body_md, '') LIKE '%[内容已截断]%'
         OR COALESCE(e.body_md, '') LIKE '%\`\`\`markdown%'
       )`,
  );
  if (publicImportResidue.rows.length > 0) {
    failures.push(
      `public copy contains import residue: ${publicImportResidue.rows
        .map((row) => row.slug)
        .join(", ")}`,
    );
  }

  const publicMedia = await db.execute(
    `SELECT COUNT(*) AS total
     FROM media_assets ma
     JOIN entities e ON e.id = ma.entity_id
     WHERE ${publicMediaFilter("ma")}
       AND ${actualPublicViewMembership("e")}`,
  );

  if (failures.length > 0) {
    for (const failure of failures) console.error(`- ${failure}`);
    throw new Error(`Legacy public boundary failed ${failures.length} checks.`);
  }

  console.log(
    `Public boundary OK: ${publicCount.rows[0]?.total} entities, ${publicCount.rows[0]?.pens} pens, ${approvedSpecs.rows.length} approved specs, ${publicMedia.rows[0]?.total} reusable media.`,
  );
    } finally {
      db.close();
    }
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
    assertCatalogSnapshotUnchanged(
      sourceBefore,
      assertPhase19LockedRealCatalog(
        snapshotCatalogFiles(REAL_DATABASE_PATH),
      ),
    );
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--all") || args.length === 0) {
    await runIndependentAllParity();
    return;
  }
  if (args.includes("--core-detail")) {
    await runCoreDetailChecks();
    return;
  }
  if (args.includes("--core-api-cache")) {
    await runCoreApiChecks();
    return;
  }
  if (args.includes("--discovery-lists")) {
    await runDiscoveryListChecks();
    return;
  }
  if (args.includes("--discovery-graph")) {
    await runDiscoveryGraphChecks();
    return;
  }
  if (args.includes("--secondary-links")) {
    await runSecondaryLinkChecks();
    return;
  }
  if (args.includes("--secondary-library-media")) {
    await runSecondaryLibraryMediaChecks();
    return;
  }
  if (args.includes("--secondary-exhibit-timeline-cache")) {
    await runSecondaryExhibitTimelineCacheChecks();
    return;
  }
  if (args.includes("--legacy")) {
    await runLegacyBoundary();
    return;
  }
  throw new Error(`Unknown public-boundary option: ${args.join(" ")}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
