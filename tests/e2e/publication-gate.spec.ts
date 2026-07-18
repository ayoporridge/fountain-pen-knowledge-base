import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { type Client, createClient } from "@libsql/client";
import {
  type APIRequestContext,
  type APIResponse,
  expect,
  request as playwrightRequest,
  test,
} from "@playwright/test";
import { seedQualifiedPublicationFixture } from "../../scripts/lib/phase19-fixtures";
import { resolveDatabaseConnection } from "../../src/lib/db";
import {
  publishEntity,
  recordEntityContentReview,
  setEntityPublicationStatus,
} from "../../src/lib/publication";

const BRAND_ID = "publication-brand";
const BRAND_SLUG = "publication-brand";
const BRAND_PATH = `/brand/${BRAND_SLUG}`;
const MODEL_IDS = Array.from(
  { length: 15 },
  (_, index) => `publication-model-${String(index + 1).padStart(2, "0")}`,
);
const MODEL_SLUGS = [...MODEL_IDS];
const MODEL_PATHS = MODEL_SLUGS.map((slug) => `/pen/${slug}`);
const LIFECYCLE_ID = MODEL_IDS.at(-1) as string;
const LIFECYCLE_SLUG = MODEL_SLUGS.at(-1) as string;
const ARTICLE_SLUG = "publication-wiki";
const PRIVATE_SLUGS = [
  "末匠-majohn",
  "末匠-majohn-a1-按动",
  "万宝龙-montblanc",
  "万宝龙-montblanc-大班149-meisterst-ck",
] as const;
const PRIVATE_MODEL_SLUGS = [PRIVATE_SLUGS[1], PRIVATE_SLUGS[3]] as const;
const PUBLIC_MEDIA_ID = "publication-public-media";
const PRIVATE_MEDIA_IDS = [
  "publication-majohn-media",
  "publication-montblanc-media",
] as const;
const QUALIFICATION_SOURCE_PREFIX = "publication-contract";
const SQLITE_BUSY_RETRY_DELAYS_MS = [50, 100, 250, 500, 1_000] as const;

type FixtureGetOptions = NonNullable<Parameters<APIRequestContext["get"]>[1]>;
type FixtureHeadOptions = NonNullable<Parameters<APIRequestContext["head"]>[1]>;

type FileState = {
  exists: boolean;
  size?: number;
  inode?: number;
  mtimeMs?: number;
  ctimeMs?: number;
  sha256?: string;
};

type FileContentState =
  | { exists: false }
  | { exists: true; size: number; sha256: string };

let fixtureDb: Client;
let fixtureBaseUrl = "";
let fixtureRequest: APIRequestContext;
let realDatabaseBefore: Record<string, FileState>;

function fixtureGet(
  url: string,
  options: FixtureGetOptions = {},
): Promise<APIResponse> {
  return fixtureRequest.get(url, { ...options, maxRetries: 1 });
}

function fixtureHead(
  url: string,
  options: FixtureHeadOptions = {},
): Promise<APIResponse> {
  return fixtureRequest.head(url, { ...options, maxRetries: 1 });
}

function isSqliteBusy(error: unknown): boolean {
  const seen = new Set<unknown>();
  let current = error;
  while (current && typeof current === "object" && !seen.has(current)) {
    seen.add(current);
    const details = current as {
      cause?: unknown;
      code?: unknown;
      message?: unknown;
    };
    if (
      String(details.code ?? "").toUpperCase() === "SQLITE_BUSY" ||
      /\bSQLITE_BUSY\b/.test(String(details.message ?? ""))
    ) {
      return true;
    }
    current = details.cause;
  }
  return false;
}

async function executeCleanup(sql: string): Promise<void> {
  for (let attempt = 0; ; attempt += 1) {
    try {
      await fixtureDb.execute(sql);
      return;
    } catch (error) {
      const delay = SQLITE_BUSY_RETRY_DELAYS_MS[attempt];
      if (delay === undefined || !isSqliteBusy(error)) throw error;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

function snapshotRealDatabase(): Record<string, FileState> {
  const databasePath = path.join(process.cwd(), "data", "fpkg.db");
  return Object.fromEntries(
    [databasePath, `${databasePath}-wal`, `${databasePath}-shm`].map(
      (filePath) => {
        if (!fs.existsSync(filePath)) {
          return [path.basename(filePath), { exists: false }];
        }
        const stat = fs.statSync(filePath);
        return [
          path.basename(filePath),
          {
            exists: true,
            size: stat.size,
            inode: stat.ino,
            mtimeMs: stat.mtimeMs,
            ctimeMs: stat.ctimeMs,
            sha256: createHash("sha256")
              .update(fs.readFileSync(filePath))
              .digest("hex"),
          },
        ];
      },
    ),
  );
}

function fileContentState(state: FileState): FileContentState {
  if (!state.exists) return { exists: false };
  return {
    exists: true,
    size: state.size as number,
    sha256: state.sha256 as string,
  };
}

function expectRealDatabaseUnchanged(
  before: Record<string, FileState>,
  after: Record<string, FileState>,
): void {
  expect(
    after["fpkg.db"],
    "real main database content/metadata changed",
  ).toEqual(before["fpkg.db"]);
  expect(
    fileContentState(after["fpkg.db-wal"]),
    "real WAL existence or content changed",
  ).toEqual(fileContentState(before["fpkg.db-wal"]));
  expect(
    fileContentState(after["fpkg.db-shm"]),
    "real SHM existence, size, or content changed",
  ).toEqual(fileContentState(before["fpkg.db-shm"]));
}

async function insertEntity(
  id: string,
  type: "brand" | "pen" | "article",
  slug: string,
  name: string,
  summary: string | null,
  bodyMd: string | null,
): Promise<void> {
  await fixtureDb.execute({
    sql: `INSERT INTO entities (id, type, slug, name, summary, body_md)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [id, type, slug, name, summary, bodyMd],
  });
}

async function approveCurrentContentAndPublish(
  entityId: string,
  reviewer = "publication-e2e",
): Promise<void> {
  for (const reviewKind of ["fact", "language", "media"] as const) {
    await recordEntityContentReview(fixtureDb, {
      entityId,
      reviewKind,
      reviewer: `${reviewer}-${reviewKind}`,
      status: "approved",
      notes: "Contract-v2 browser fixture review.",
    });
  }
  await publishEntity(fixtureDb, { entityId, reviewer });
}

async function cleanupPublicationFixtureRows(): Promise<void> {
  await executeCleanup("DELETE FROM entities WHERE id LIKE 'publication-%'");
  await executeCleanup(
    `DELETE FROM citations
     WHERE id LIKE 'publication-%'
        OR source_item_id LIKE 'publication-%'
        OR claim_id LIKE 'publication-%'`,
  );
  await executeCleanup(
    "DELETE FROM source_items WHERE id LIKE 'publication-%'",
  );
  await executeCleanup(
    "DELETE FROM source_registry WHERE id LIKE 'publication-%'",
  );
}

async function seedFixture(): Promise<void> {
  const migration = await fixtureDb.execute({
    sql: "SELECT checksum FROM migrations WHERE name = ? LIMIT 1",
    args: ["031_evidence_readiness_v2.sql"],
  });
  if (migration.rows.length !== 1) {
    throw new Error(
      "Publication E2E requires the Phase 19 wrapper's canonical migration 031 database.",
    );
  }
  await cleanupPublicationFixtureRows();

  await fixtureDb.execute(`
    INSERT INTO source_registry (
      id, name, source_type, allowed_use, reliability, homepage_url
    ) VALUES
      ('publication-public-source', 'Publication Public Source', 'official',
       'metadata_only', 'high_for_basic_facts', 'https://fixture.invalid/public'),
      ('publication-private-source', 'Publication Private Source', 'official',
       'metadata_only', 'high_for_basic_facts', 'https://fixture.invalid/private')
  `);
  await fixtureDb.execute(`
    INSERT INTO source_items (
      id, source_id, title, url, review_status
    ) VALUES
      ('publication-public-item', 'publication-public-source',
       'Publication Public Evidence', 'https://fixture.invalid/public/model', 'approved'),
      ('publication-private-item', 'publication-private-source',
       'Publication Private Evidence', 'https://fixture.invalid/private/model', 'approved')
  `);

  await seedQualifiedPublicationFixture(fixtureDb, {
    entityId: BRAND_ID,
    entityType: "brand",
    sharedSourcePrefix: QUALIFICATION_SOURCE_PREFIX,
    includeSecondarySurfaceRows: false,
  });
  await fixtureDb.execute({
    sql: `UPDATE entities
          SET name = ?, summary = ?, body_md = ?
          WHERE id = ?`,
    args: [
      "Publication Brand",
      "A synthetic brand reviewed specifically for the publication gate.",
      "Publication Brand 的页面必须完整列出每一个已发布型号。",
      BRAND_ID,
    ],
  });
  await approveCurrentContentAndPublish(BRAND_ID);

  await insertEntity(
    "publication-majohn-brand",
    "brand",
    PRIVATE_SLUGS[0],
    "末匠 Majohn",
    null,
    null,
  );
  await insertEntity(
    "publication-majohn-a1",
    "pen",
    PRIVATE_SLUGS[1],
    "末匠 Majohn A1 按动",
    null,
    null,
  );
  await fixtureDb.execute(`
    INSERT INTO entity_links (id, source_id, target_id, link_type)
    VALUES (
      'publication-majohn-maker',
      'publication-majohn-a1',
      'publication-majohn-brand',
      'made_by'
    )
  `);
  await insertEntity(
    "publication-montblanc-brand",
    "brand",
    PRIVATE_SLUGS[2],
    "万宝龙 Montblanc",
    null,
    null,
  );
  await insertEntity(
    "publication-montblanc-149",
    "pen",
    PRIVATE_SLUGS[3],
    "万宝龙 Montblanc 大班 149",
    null,
    null,
  );
  await fixtureDb.execute(`
    INSERT INTO entity_links (id, source_id, target_id, link_type)
    VALUES (
      'publication-montblanc-maker',
      'publication-montblanc-149',
      'publication-montblanc-brand',
      'made_by'
    )
  `);
  await fixtureDb.execute(`
    INSERT INTO entity_references (
      id, entity_id, source_item_id, relation_type, review_status
    ) VALUES (
      'publication-private-reference',
      'publication-majohn-a1',
      'publication-private-item',
      'reference',
      'approved'
    )
  `);

  for (const [index, entityId] of MODEL_IDS.entries()) {
    const number = String(index + 1).padStart(2, "0");
    const fixture = await seedQualifiedPublicationFixture(fixtureDb, {
      entityId,
      entityType: "pen",
      brandEntityId: BRAND_ID,
      sharedSourcePrefix: QUALIFICATION_SOURCE_PREFIX,
      includeSecondarySurfaceRows: false,
    });
    if (!fixture.modelSpecId || !fixture.primarySpecCitationId) {
      throw new Error(`${entityId} qualification fixture omitted spec IDs.`);
    }
    await fixtureDb.execute({
      sql: `UPDATE entities
            SET name = ?, summary = ?, body_md = ?
            WHERE id = ?`,
      args: [
        `Publication Model ${number}`,
        `Publication Model ${number} has reviewed identity, maker, specifications and narrative.`,
        `Publication Model ${number} 的型号页包含真实发布事务核准的摘要、故事、规格和品牌关系。`,
        entityId,
      ],
    });
    await fixtureDb.execute({
      sql: "UPDATE model_specs SET series_name = 'Publication Series' WHERE id = ?",
      args: [fixture.modelSpecId],
    });
    await fixtureDb.execute({
      sql: `INSERT INTO spec_field_evidence (
              id, model_spec_id, field_key, citation_id, scope_id,
              evidence_locator, review_status
            ) VALUES (?, ?, 'series_name', ?, ?, ?, 'approved')`,
      args: [
        `${entityId}-spec-evidence-series-name`,
        fixture.modelSpecId,
        fixture.primarySpecCitationId,
        fixture.scopeId,
        `publication-spec:${entityId}:series_name`,
      ],
    });
    if (index < MODEL_IDS.length - 1) {
      await approveCurrentContentAndPublish(entityId);
    }
  }

  await fixtureDb.execute(`
    INSERT INTO entity_references (
      id, entity_id, source_item_id, relation_type, review_status
    ) VALUES (
      'publication-public-reference',
      'publication-model-01',
      'publication-public-item',
      'reference',
      'approved'
    )
  `);
  await fixtureDb.execute(`
    INSERT INTO media_assets (
      id, entity_id, title, asset_type, image_url, local_path,
      license, attribution_text, review_status, usage_status
    ) VALUES
      ('publication-public-media', 'publication-model-01', 'Public model image',
       'image', '/images/library/warm-pen-atlas/library-hero.jpg',
       'public/images/library/warm-pen-atlas/library-hero.jpg',
       'site-original', 'Publication fixture', 'approved', 'primary'),
      ('publication-majohn-media', 'publication-majohn-a1', 'Private Majohn image',
       'image', '/images/library/warm-pen-atlas/library-hero.jpg',
       'public/images/library/warm-pen-atlas/library-hero.jpg',
       'site-original', 'Publication fixture', 'approved', 'primary'),
      ('publication-montblanc-media', 'publication-montblanc-149', 'Private Montblanc image',
       'image', '/images/library/warm-pen-atlas/library-hero.jpg',
       'public/images/library/warm-pen-atlas/library-hero.jpg',
       'site-original', 'Publication fixture', 'approved', 'primary')
  `);

  // The first public model gained publication-critical source/media rows after
  // its initial review, so the fixture deliberately performs a fresh review.
  await approveCurrentContentAndPublish(MODEL_IDS[0]);

  await insertEntity(
    "publication-wiki",
    "article",
    ARTICLE_SLUG,
    "Publication Wiki Boundary",
    "A public wiki-link fixture.",
    `公开型号 [[${MODEL_SLUGS[0]}]]；草稿型号 [[${PRIVATE_MODEL_SLUGS[0]}]] 与 [[${PRIVATE_MODEL_SLUGS[1]}]] 只能保留为不可点击文字。`,
  );
}

function encodedPath(type: string, slug: string): string {
  return `/${type}/${encodeURIComponent(slug)}`;
}

function expectNoStore(response: APIResponse): void {
  expect(response.headers()["cache-control"] || "").toContain("no-store");
}

async function sitemapPaths(): Promise<string[]> {
  const response = await fixtureGet("/sitemap.xml");
  expect(response.ok()).toBeTruthy();
  return [...(await response.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (match) => decodeURIComponent(new URL(match[1]).pathname),
  );
}

async function publicPenSlugs(): Promise<string[]> {
  const response = await fixtureGet("/api/entities?type=pen");
  expect(response.ok()).toBeTruthy();
  expectNoStore(response);
  const rows = (await response.json()) as Array<{ slug: string }>;
  return rows.map((row) => row.slug).sort();
}

async function expectLifecycleVisible(visible: boolean): Promise<void> {
  const pageResponse = await fixtureGet(`/pen/${LIFECYCLE_SLUG}`);
  expect(pageResponse.status()).toBe(visible ? 200 : 404);
  const pageBody = await pageResponse.text();
  const metadataResponse = await fixtureHead(`/pen/${LIFECYCLE_SLUG}`);
  expect(metadataResponse.status()).toBe(visible ? 200 : 404);
  if (visible) {
    expect(pageBody).toContain("application/ld+json");
    expect(pageResponse.headers()["x-robots-tag"] || "").not.toContain(
      "noindex",
    );
  } else {
    expectNoStore(pageResponse);
    expect(pageResponse.headers()["x-robots-tag"]).toContain("noindex");
    expect(pageBody).not.toContain("application/ld+json");
    expectNoStore(metadataResponse);
    expect(metadataResponse.headers()["x-robots-tag"]).toContain("noindex");
  }
  const apiResponse = await fixtureGet(`/api/entities/${LIFECYCLE_SLUG}`);
  expect(apiResponse.status()).toBe(visible ? 200 : 404);
  expectNoStore(apiResponse);
  expect((await publicPenSlugs()).includes(LIFECYCLE_SLUG)).toBe(visible);
  expect((await sitemapPaths()).includes(`/pen/${LIFECYCLE_SLUG}`)).toBe(
    visible,
  );
}

test.describe("publication gate browser contract", () => {
  test.describe.configure({ mode: "serial" });
  test.setTimeout(120_000);

  test.beforeAll(async () => {
    test.setTimeout(120_000);
    realDatabaseBefore = snapshotRealDatabase();
    const connection = resolveDatabaseConnection(process.env);
    if (
      process.env.PUBLICATION_GATE_FIXTURE !== "1" ||
      !connection.localPath ||
      !process.env.FPKG_DATABASE_URL
    ) {
      throw new Error(
        "Publication E2E must run through scripts/check-phase19-regression.ts with one explicit disposable database.",
      );
    }
    fixtureDb = createClient({ url: process.env.FPKG_DATABASE_URL });
    await seedFixture();

    fixtureBaseUrl =
      process.env.E2E_BASE_URL?.replace(/\/$/, "") || "http://127.0.0.1:3107";
    fixtureRequest = await playwrightRequest.newContext({
      baseURL: fixtureBaseUrl,
      extraHTTPHeaders: { "Cache-Control": "no-cache" },
    });
  });

  test.afterEach(async ({ page: _page }, testInfo) => {
    expect(testInfo.retry).toBe(0);
  });

  test.afterAll(async () => {
    test.setTimeout(120_000);
    await fixtureRequest?.dispose();
    if (fixtureDb) {
      try {
        await cleanupPublicationFixtureRows();
      } finally {
        fixtureDb.close();
      }
    }
    expectRealDatabaseUnchanged(realDatabaseBefore, snapshotRealDatabase());
  });

  test("Majohn A1 and Montblanc 149 draft shells are absent from every public surface", async ({
    page,
  }) => {
    const shellState = await fixtureDb.execute(`
      SELECT e.slug, e.type, ep.status,
             EXISTS(SELECT 1 FROM public_entities public WHERE public.id = e.id)
               AS is_public
      FROM entities e
      JOIN entity_publications ep ON ep.entity_id = e.id
      WHERE e.id IN ('publication-majohn-a1', 'publication-montblanc-149')
      ORDER BY e.id
    `);
    expect(
      shellState.rows.map((row) => ({
        slug: String(row.slug),
        type: String(row.type),
        status: String(row.status),
        isPublic: Number(row.is_public),
      })),
    ).toEqual([
      {
        slug: PRIVATE_MODEL_SLUGS[0],
        type: "pen",
        status: "draft",
        isPublic: 0,
      },
      {
        slug: PRIVATE_MODEL_SLUGS[1],
        type: "pen",
        status: "draft",
        isPublic: 0,
      },
    ]);

    const browseResponse = await fixtureGet("/api/browse?type=pen");
    expect(browseResponse.ok()).toBeTruthy();
    expectNoStore(browseResponse);
    const browse = (await browseResponse.json()) as {
      entities: Array<{ slug: string }>;
    };
    const browseSlugs = browse.entities.map((entity) => entity.slug);
    const sitemap = await sitemapPaths();
    const articleUrl = `${fixtureBaseUrl}/article/${ARTICLE_SLUG}`;

    for (const slug of PRIVATE_MODEL_SLUGS) {
      const detail = encodedPath("pen", slug);
      const detailResponse = await fixtureGet(detail, {
        maxRedirects: 0,
      });
      const detailBody = await detailResponse.text();
      expect(
        detailResponse.status(),
        `${detail} resolved as ${detailResponse.status()} at ${detailResponse.url()}: ${detailBody.slice(0, 240)}`,
      ).toBe(404);
      expect(new URL(detailResponse.url()).pathname).toBe(detail);
      expectNoStore(detailResponse);
      expect(detailResponse.headers()["x-robots-tag"]).toContain("noindex");
      expect(detailBody).not.toContain("application/ld+json");
      const metadataResponse = await fixtureHead(detail, {
        maxRedirects: 0,
      });
      expect(
        metadataResponse.status(),
        `HEAD ${detail} resolved as ${metadataResponse.status()} at ${metadataResponse.url()}`,
      ).toBe(404);
      expect(new URL(metadataResponse.url()).pathname).toBe(detail);
      expectNoStore(metadataResponse);
      expect(metadataResponse.headers()["x-robots-tag"]).toContain("noindex");

      for (const suffix of ["", "/preview"] as const) {
        const response = await fixtureGet(
          `/api/entities/${encodeURIComponent(slug)}${suffix}`,
        );
        expect(response.status()).toBe(404);
        expectNoStore(response);
      }
      expect(
        (
          await fixtureGet(
            `/api/links?slug=${encodeURIComponent(slug)}&depth=2`,
          )
        ).status(),
      ).toBe(404);
      expect(browseSlugs).not.toContain(slug);
      expect(sitemap).not.toContain(`/pen/${slug}`);

      const graph = await page.goto(
        `${fixtureBaseUrl}/graph?entity=${encodeURIComponent(slug)}`,
        { waitUntil: "domcontentloaded" },
      );
      expect(graph?.ok()).toBeTruthy();
      expect(await page.locator("body").innerText()).not.toContain(slug);
      const graphHrefs = await page
        .locator("a[href]")
        .evaluateAll((links) =>
          links.map((link) =>
            decodeURIComponent(link.getAttribute("href") || ""),
          ),
        );
      expect(graphHrefs.some((href) => href.includes(slug))).toBe(false);
    }

    for (const mediaId of PRIVATE_MEDIA_IDS) {
      const response = await fixtureGet(`/api/image-proxy?id=${mediaId}`, {
        maxRedirects: 0,
      });
      expect(response.status()).toBe(404);
      expectNoStore(response);
    }

    await page.goto(articleUrl, { waitUntil: "domcontentloaded" });
    for (const slug of PRIVATE_MODEL_SLUGS) {
      await expect(page.locator(`a[href="/pen/${slug}"]`)).toHaveCount(0);
    }
    await expect(page.locator(`a[href="/pen/${MODEL_SLUGS[0]}"]`)).toHaveCount(
      1,
    );

    const sourceIndex = await fixtureGet("/library/sources");
    expect(sourceIndex.ok()).toBeTruthy();
    const sourceHtml = await sourceIndex.text();
    expect(sourceHtml).not.toContain("Publication Private Evidence");
    expect(sourceHtml).not.toContain("Publication Private Source");
    expect(await publicPenSlugs()).toEqual(MODEL_SLUGS.slice(0, 14).sort());
    await expectLifecycleVisible(false);
  });

  test("a true publish transaction changes the next request from 404 to 200", async () => {
    await expectLifecycleVisible(false);
    await approveCurrentContentAndPublish(LIFECYCLE_ID);
    await expectLifecycleVisible(true);
  });

  test("all 15 models appear on every applicable surface with exact reverse brand links", async ({
    page,
  }) => {
    expect(await publicPenSlugs()).toEqual([...MODEL_SLUGS].sort());

    const brandsResponse = await fixtureGet("/api/entities?type=brand");
    expect(brandsResponse.ok()).toBeTruthy();
    expectNoStore(brandsResponse);
    const brands = (await brandsResponse.json()) as Array<{ slug: string }>;
    expect(brands.map((brand) => brand.slug)).toEqual([BRAND_SLUG]);

    const browseResponse = await fixtureGet("/api/browse?type=pen");
    expect(browseResponse.ok()).toBeTruthy();
    expectNoStore(browseResponse);
    const browse = (await browseResponse.json()) as {
      total: number;
      entities: Array<{ slug: string }>;
    };
    expect(browse.total).toBe(15);
    expect(browse.entities.map((entity) => entity.slug).sort()).toEqual(
      [...MODEL_SLUGS].sort(),
    );

    const sitemap = await sitemapPaths();
    expect(MODEL_PATHS.every((modelPath) => sitemap.includes(modelPath))).toBe(
      true,
    );
    expect(sitemap).toContain(BRAND_PATH);

    await page.goto(`${fixtureBaseUrl}${BRAND_PATH}`, {
      waitUntil: "domcontentloaded",
    });
    await expect(
      page.getByRole("heading", { name: "全部型号（15）" }),
    ).toBeVisible();
    const renderedModels = await page
      .locator('#models a[href^="/pen/"]')
      .evaluateAll((links) =>
        links.map((link) => link.getAttribute("href") || "").sort(),
      );
    expect(renderedModels).toEqual([...MODEL_PATHS].sort());

    for (const modelPath of MODEL_PATHS) {
      const response = await fixtureGet(modelPath);
      expect(response.status(), modelPath).toBe(200);
      const html = await response.text();
      expect(html, modelPath).toContain("型号档案");
      expect(html, modelPath).toContain("Publication Series");
      const brandPaths = new Set(
        [...html.matchAll(/href="(\/brand\/[^"]+)"/g)].map((match) => match[1]),
      );
      expect([...brandPaths], modelPath).toEqual([BRAND_PATH]);
    }

    const linksResponse = await fixtureGet(
      `/api/links?slug=${BRAND_SLUG}&depth=2`,
    );
    expect(linksResponse.ok()).toBeTruthy();
    expectNoStore(linksResponse);
    const linkPayload = (await linksResponse.json()) as Record<
      string,
      Array<{ source_slug: string; target_slug: string }>
    >;
    const directlyLinkedModels = new Set<string>();
    for (const link of [
      ...(linkPayload.forward || []),
      ...(linkPayload.backlinks || []),
    ]) {
      if (MODEL_SLUGS.includes(link.source_slug))
        directlyLinkedModels.add(link.source_slug);
      if (MODEL_SLUGS.includes(link.target_slug))
        directlyLinkedModels.add(link.target_slug);
    }
    expect([...directlyLinkedModels].sort()).toEqual([...MODEL_SLUGS].sort());

    const graph = await fixtureGet(`/graph?entity=${BRAND_SLUG}`);
    expect(graph.ok()).toBeTruthy();
    const graphHtml = await graph.text();
    for (const privateSlug of PRIVATE_SLUGS) {
      expect(graphHtml).not.toContain(privateSlug);
    }

    await page.goto(`${fixtureBaseUrl}/pen/${MODEL_SLUGS[0]}`, {
      waitUntil: "domcontentloaded",
    });
    const recommendationHrefs = await page
      .locator('[data-testid="recommendations"] a[href]')
      .evaluateAll((links) =>
        links.map((link) => link.getAttribute("href") || ""),
      );
    for (const href of recommendationHrefs) {
      expect(MODEL_PATHS.includes(href) || href === BRAND_PATH).toBeTruthy();
    }

    const sourceIndex = await fixtureGet("/library/sources");
    expect(sourceIndex.ok()).toBeTruthy();
    const sourceHtml = await sourceIndex.text();
    expect(sourceHtml).toContain("Publication Public Evidence");
    expect(sourceHtml).not.toContain("Publication Private Evidence");

    const publicMedia = await fixtureGet(
      `/api/image-proxy?id=${PUBLIC_MEDIA_ID}`,
      { maxRedirects: 0 },
    );
    expect(publicMedia.status()).toBe(307);
    expectNoStore(publicMedia);
  });

  test("critical edits and retirement fail closed until a fresh review", async () => {
    await fixtureDb.execute({
      sql: `UPDATE entities
            SET summary = ?, updated_at = datetime('now')
            WHERE id = ?`,
      args: [
        "Publication Model 15 changed after its approved review.",
        LIFECYCLE_ID,
      ],
    });
    await expectLifecycleVisible(false);

    await approveCurrentContentAndPublish(
      LIFECYCLE_ID,
      "publication-e2e-rereview",
    );
    await expectLifecycleVisible(true);

    await setEntityPublicationStatus(fixtureDb, LIFECYCLE_ID, "retired");
    await expectLifecycleVisible(false);

    await publishEntity(fixtureDb, {
      entityId: LIFECYCLE_ID,
      reviewer: "publication-e2e-return",
    });
    await expectLifecycleVisible(true);
  });
});
