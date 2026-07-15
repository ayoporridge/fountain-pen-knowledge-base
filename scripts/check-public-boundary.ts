import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { createClient } from "@libsql/client";
import { NextRequest } from "next/server";
import { getDb, migrateDatabase } from "../src/lib/db";
import { publishEntity } from "../src/lib/publication";
import {
  HIDDEN_ARTICLE_SLUGS,
  INDEX_ARTICLE_MARKERS,
  publicEntityFilter,
} from "../src/lib/public-visibility";
import { publicMediaFilter } from "../src/lib/public-media";
import { cleanPublicText } from "../src/lib/publicText";

const RETIRED_DUPLICATE_SLUGS = [
  "百乐-pilot-custom-823",
  "百利金-pelikan-m800",
  "派克-parker-51-经典-vintage",
  "写乐-sailor-21k-pro-gear-大鱼雷",
  "奥罗拉-aurora",
];

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

function assertCondition(
  condition: unknown,
  message: string,
): asserts condition {
  if (!condition) throw new Error(message);
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

async function insertBoundaryStory(
  db: ReturnType<typeof createClient>,
  entityId: string,
  storyType: "brand_story" | "model_story",
) {
  await db.execute({
    sql: `
      INSERT INTO stories (id, entity_id, title, story_type, body_md, status)
      VALUES (?, ?, ?, ?, ?, 'published')
    `,
    args: [
      `story-${entityId}`,
      entityId,
      `${entityId} story`,
      storyType,
      `${entityId} reviewed story body`,
    ],
  });
}

async function seedBoundaryFixtures(db: ReturnType<typeof createClient>) {
  await insertBoundaryEntity(db, "boundary-public-brand", "brand");
  await insertBoundaryStory(db, "boundary-public-brand", "brand_story");
  await publishEntity(db, {
    entityId: "boundary-public-brand",
    reviewer: "boundary-checker",
  });

  await insertBoundaryEntity(db, "boundary-draft-brand", "brand");
  await insertBoundaryEntity(db, "boundary-draft-pen", "pen");

  await insertBoundaryEntity(db, "boundary-public-pen", "pen");
  await insertBoundaryStory(db, "boundary-public-pen", "model_story");
  await db.execute(`
    INSERT INTO entity_links (id, source_id, target_id, link_type)
    VALUES (
      'boundary-public-pen-maker',
      'boundary-public-pen',
      'boundary-public-brand',
      'made_by'
    )
  `);
  await publishEntity(db, {
    entityId: "boundary-public-pen",
    reviewer: "boundary-checker",
  });

  await insertBoundaryEntity(db, "boundary-public-article", "article");
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

    const middlewareResponse = middlewareModule.middleware(
      new NextRequest(
        "https://fountain-pen-graph.vercel.app/brand/boundary-draft-brand",
      ),
    );
    assertCondition(
      middlewareResponse.headers.get("x-middleware-next") === "1",
      "Middleware still authorizes brand slugs instead of deferring to the page gate.",
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

async function runLegacyBoundary() {
  const db = createClient({ url: "file:data/fpkg.db" });
  const failures: string[] = [];

  const foreignKeys = await db.execute("PRAGMA foreign_key_check");
  if (foreignKeys.rows.length > 0) {
    failures.push(`foreign_key_check returned ${foreignKeys.rows.length} row(s)`);
  }

  const publicCount = await db.execute(
    `SELECT COUNT(*) AS total,
            SUM(CASE WHEN type = 'pen' THEN 1 ELSE 0 END) AS pens
     FROM entities e
     WHERE ${publicEntityFilter("e")}`,
  );
  const retired = await db.execute({
    sql: `SELECT slug FROM entities e
          WHERE slug IN (${RETIRED_DUPLICATE_SLUGS.map(() => "?").join(",")})
            AND ${publicEntityFilter("e")}`,
    args: RETIRED_DUPLICATE_SLUGS,
  });
  if (retired.rows.length > 0) {
    failures.push(
      `retired duplicate slugs remain public: ${retired.rows
        .map((row) => row.slug)
        .join(", ")}`,
    );
  }

  const markerConditions = INDEX_ARTICLE_MARKERS.flatMap(() => [
    "COALESCE(name, '') LIKE ?",
    "COALESCE(summary, '') LIKE ?",
    "COALESCE(body_md, '') LIKE ?",
  ]);
  const markerArgs = INDEX_ARTICLE_MARKERS.flatMap((marker) => {
    const pattern = `%${marker}%`;
    return [pattern, pattern, pattern];
  });
  const unlistedIndexArticles = await db.execute({
    sql: `SELECT slug FROM entities
          WHERE type = 'article'
            AND (${markerConditions.join(" OR ")})
            AND slug NOT IN (${HIDDEN_ARTICLE_SLUGS.map(() => "?").join(", ")})`,
    args: [...markerArgs, ...HIDDEN_ARTICLE_SLUGS],
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
       AND ${publicEntityFilter("e")}
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
       AND ${publicEntityFilter("e")}`,
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
       AND ${publicEntityFilter("e")}
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
     WHERE ${publicEntityFilter("e")}
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
     WHERE ${publicEntityFilter("e")}
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
       WHERE ${publicEntityFilter("e")}
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
     WHERE ${publicEntityFilter("e")}
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
       AND ${publicEntityFilter("e")}`,
  );

  if (failures.length > 0) {
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }

  console.log(
    `Public boundary OK: ${publicCount.rows[0]?.total} entities, ${publicCount.rows[0]?.pens} pens, ${approvedSpecs.rows.length} approved specs, ${publicMedia.rows[0]?.total} reusable media.`,
  );
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--core-detail")) {
    await runCoreDetailChecks();
    return;
  }
  if (args.includes("--core-api-cache")) {
    await runCoreApiChecks();
    return;
  }
  await runLegacyBoundary();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
