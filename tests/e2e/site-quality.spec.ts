import path from "node:path";
import { expect, type Page, test } from "@playwright/test";
import Database from "better-sqlite3";
import {
  fetchExternalImage,
  MAX_MEDIA_BYTES,
  type MediaFetcher,
  type MediaHostResolver,
} from "../../src/lib/media-url";
import {
  searchPublicEntities,
  withEntitiesFtsFallback,
} from "../../src/lib/search";

const HIDDEN_BRAND_SLUGS = ["banju", "saier", "shanghai", "yongxu"];
const GOLD_SLUGS = new Set([
  "nibmat-gold",
  "nibmat-14k",
  "nibmat-18k",
  "nibmat-21k",
  "nibmat-bicolor",
]);
const PRICE_UP_TO_500 = new Set(["price-entry", "price-mid"]);

type LocalEntityRow = { id: string; slug: string; name: string };

function readLocalContract() {
  const database = new Database(path.join(process.cwd(), "data/fpkg.db"), {
    readonly: true,
  });
  try {
    const compare = database
      .prepare(
        `SELECT id, slug, name FROM entities
         WHERE slug IN ('pilot-custom-823', '百乐-pilot-custom-743')`,
      )
      .all() as LocalEntityRow[];
    const hiddenArticle = database
      .prepare(
        `SELECT id, slug, name FROM entities
         WHERE type = 'article'
           AND (
             name LIKE '%品牌资料索引%'
             OR summary LIKE '%品牌资料索引%'
             OR body_md LIKE '%品牌资料索引%'
             OR name LIKE '%品牌泛称%'
             OR summary LIKE '%品牌泛称%'
             OR body_md LIKE '%品牌泛称%'
           )
         ORDER BY slug LIMIT 1`,
      )
      .get() as LocalEntityRow | undefined;
    const hiddenBrands = database
      .prepare(
        `SELECT id, slug, name FROM entities
         WHERE slug IN ('banju', 'saier', 'shanghai', 'yongxu')
         ORDER BY slug`,
      )
      .all() as LocalEntityRow[];
    const approvedMedia = database
      .prepare(
        `SELECT id, COALESCE(thumbnail_url, image_url) AS name, '' AS slug
         FROM media_assets
         WHERE id = 'media-commerce-169b0fb4640bf4'
           AND review_status = 'approved'
           AND usage_status IN ('primary', 'gallery')`,
      )
      .get() as LocalEntityRow | undefined;
    const exhibit = database
      .prepare(
        `SELECT id, slug, title AS name FROM exhibits
         WHERE status IN ('published', 'reviewed') ORDER BY slug LIMIT 1`,
      )
      .get() as LocalEntityRow | undefined;
    return { compare, hiddenArticle, hiddenBrands, approvedMedia, exhibit };
  } finally {
    database.close();
  }
}

const localContract = readLocalContract();

function desktopOnly(projectName: string) {
  return projectName === "desktop";
}

function mobileOnly(projectName: string) {
  return projectName === "mobile";
}

async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    page: document.documentElement.scrollWidth,
  }));
  expect(dimensions.page).toBeLessThanOrEqual(dimensions.viewport + 1);
}

async function getCanonical(page: Page) {
  return page.locator('link[rel="canonical"]').getAttribute("href");
}

async function openHydratedDialog(
  trigger: ReturnType<Page["getByRole"]>,
  dialog: ReturnType<Page["getByRole"]>,
) {
  await expect(trigger).toBeVisible();
  await expect(async () => {
    await trigger.click();
    await expect(dialog).toBeVisible({ timeout: 1_500 });
  }).toPass({ timeout: 15_000 });
}

test.describe("site quality contract", () => {
  test.setTimeout(90_000);

  test("homepage curated questions have deterministic destinations", async ({
    page,
  }, testInfo) => {
    if (!desktopOnly(testInfo.project.name)) return;

    const known823 = localContract.compare.find(
      (entity) => entity.slug === "pilot-custom-823",
    );
    const known743 = localContract.compare.find(
      (entity) => entity.slug === "百乐-pilot-custom-743",
    );
    expect(known823?.name).toContain("823");
    expect(known743?.name).toContain("743");

    await page.goto("/");
    const budget = page.getByRole("link", {
      name: "500 以内，日系金尖有哪些选择？",
    });
    await expect(budget).toHaveAttribute(
      "href",
      "/browse?type=pen&origin=origin-japan&nib_material=gold&max_price=500",
    );
    await budget.click();
    await expect(page).toHaveURL(/origin=origin-japan/);
    await expect(page.getByText("所有金尖").first()).toBeVisible();
    await expect(page.getByText("¥500 以内").first()).toBeVisible();

    await page.goto("/");
    const piston = page.getByRole("link", {
      name: "活塞上墨和旋转上墨到底有什么区别？",
    });
    await expect(piston).toHaveAttribute("href", "/concept/piston-filler");
    await piston.click();
    await expect(page).toHaveURL(/\/concept\/piston-filler$/);

    await page.goto("/");
    const comparison = page.getByRole("link", {
      name: "百乐 823 和 743 怎么选？",
    });
    await expect(comparison).toHaveAttribute(
      "href",
      "/compare?items=pilot-custom-823,%E7%99%BE%E4%B9%90-pilot-custom-743",
    );
    await comparison.click();
    await expect(page).toHaveURL(/items=pilot-custom-823/);
    await expect(page.getByText(/Custom 823/).first()).toBeVisible();
    await expect(page.getByText(/Custom 743/).first()).toBeVisible();
  });

  test("Chinese search intent constrains every budget result", async ({
    request,
  }, testInfo) => {
    if (!desktopOnly(testInfo.project.name)) return;

    const response = await request.get(
      "/api/search?q=500%E4%BB%A5%E5%86%85%EF%BC%8C%E6%97%A5%E7%B3%BB%E9%87%91%E5%B0%96%E6%9C%89%E5%93%AA%E4%BA%9B%E9%80%89%E6%8B%A9&limit=50",
    );
    expect(response.ok()).toBeTruthy();
    const payload = (await response.json()) as {
      intent: {
        filters: Record<string, string>;
        browseHref: string;
      };
      results: Array<{ slug: string; type: string }>;
    };
    expect(payload.intent.filters).toMatchObject({
      type: "pen",
      origin: "origin-japan",
      nib_material: "gold",
      max_price: "500",
    });
    expect(payload.intent.browseHref).toBe(
      "/browse?type=pen&origin=origin-japan&nib_material=gold&max_price=500",
    );
    expect(payload.results.length).toBeGreaterThan(0);

    for (const result of payload.results) {
      expect(result.type).toBe("pen");
      const detailResponse = await request.get(
        `/api/entities/${encodeURIComponent(result.slug)}`,
      );
      expect(detailResponse.ok()).toBeTruthy();
      const detail = (await detailResponse.json()) as {
        type: string;
        tags: Array<{ slug: string }>;
      };
      const slugs = new Set(detail.tags.map((tag) => tag.slug));
      expect(detail.type).toBe("pen");
      expect(slugs.has("origin-japan")).toBeTruthy();
      expect([...GOLD_SLUGS].some((slug) => slugs.has(slug))).toBeTruthy();
      expect([...PRICE_UP_TO_500].some((slug) => slugs.has(slug))).toBeTruthy();
    }

    const models = await request.get(
      "/api/search?q=%E7%99%BE%E4%B9%90%20823%20743&limit=50",
    );
    const modelPayload = (await models.json()) as {
      results: Array<{ slug: string }>;
    };
    const resultSlugs = new Set(modelPayload.results.map((item) => item.slug));
    expect(resultSlugs.has("pilot-custom-823")).toBeTruthy();
    expect(resultSlugs.has("百乐-pilot-custom-743")).toBeTruthy();

    const hostile = await request.get(
      `/api/search?q=${encodeURIComponent('" OR * NEAR (')}`,
    );
    expect(hostile.status()).toBeLessThan(500);
  });

  test("search only falls back for a missing entities FTS table", async ({
    request: _request,
  }, testInfo) => {
    if (!desktopOnly(testInfo.project.name)) return;

    const missingFts = Object.assign(
      new Error("SQLite error: no such table: entities_fts"),
      { code: "SQLITE_UNKNOWN" },
    );
    const attemptedSql: string[] = [];
    const response = await searchPublicEntities({
      query: "823",
      queryRunner: async (sql) => {
        attemptedSql.push(sql);
        if (attemptedSql.length === 1) throw missingFts;
        return [
          {
            id: "test-823",
            type: "pen",
            slug: "pilot-custom-823",
            name: "百乐 Custom 823",
            summary: "test",
            body_md: "",
            source: "test",
            aliases: null,
            tag_count: 1,
            total_count: 1,
          },
        ];
      },
    });
    expect(attemptedSql).toHaveLength(2);
    expect(attemptedSql[0]).toContain("entities_fts MATCH");
    expect(attemptedSql[1]).not.toContain("entities_fts MATCH");
    expect(response.results.map((result) => result.slug)).toEqual([
      "pilot-custom-823",
    ]);

    const fallbackResult = await withEntitiesFtsFallback(
      async () => {
        throw missingFts;
      },
      async () => ["parameterized-like-result"],
    );
    expect(fallbackResult).toEqual(["parameterized-like-result"]);

    const unrelatedError = new Error(
      "SQLite error: no such table: entity_tags",
    );
    await expect(
      withEntitiesFtsFallback(
        async () => {
          throw unrelatedError;
        },
        async () => ["must-not-run"],
      ),
    ).rejects.toBe(unrelatedError);
  });

  test("browse uses OR inside semantic facets and ships server results", async ({
    page,
    request,
  }, testInfo) => {
    if (!desktopOnly(testInfo.project.name)) return;
    const path =
      "/browse?type=pen&origin=origin-japan&nib_material=gold&max_price=500";
    const api = await request.get(`/api${path}`);
    expect(api.ok()).toBeTruthy();
    const payload = (await api.json()) as {
      total: number;
      entities: Array<{ slug: string }>;
      activeFilters: Record<string, string>;
    };
    expect(payload.total).toBeGreaterThan(0);
    expect(payload.entities.length).toBeGreaterThan(0);
    expect(payload.activeFilters).toMatchObject({
      origin: "origin-japan",
      nib_material: "gold",
      max_price: "500",
    });

    const response = await page.goto(path, { waitUntil: "domcontentloaded" });
    expect(response?.ok()).toBeTruthy();
    await expect(
      page.getByText(new RegExp(`共 ${payload.total} 个词条`)),
    ).toBeVisible();
    await expect(page.locator('main a[href^="/pen/"]').first()).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await page.goto("/browse", { waitUntil: "domcontentloaded" });
    const before = await page
      .locator(
        'main a[href^="/pen/"], main a[href^="/brand/"], main a[href^="/article/"]',
      )
      .count();
    const loadMore = page.getByRole("button", { name: /加载更多/ });
    if (await loadMore.isVisible()) {
      await loadMore.click();
      await expect
        .poll(() =>
          page
            .locator(
              'main a[href^="/pen/"], main a[href^="/brand/"], main a[href^="/article/"]',
            )
            .count(),
        )
        .toBeGreaterThan(before);
    }
  });

  test("public entity and graph APIs do not expose hidden records", async ({
    request,
  }, testInfo) => {
    if (!desktopOnly(testInfo.project.name)) return;

    const brandsResponse = await request.get("/api/entities?type=brand");
    expect(brandsResponse.ok()).toBeTruthy();
    const brands = (await brandsResponse.json()) as Array<{
      id: string;
      slug: string;
    }>;
    const visibleSlugs = new Set(brands.map((entity) => entity.slug));
    for (const slug of HIDDEN_BRAND_SLUGS) {
      expect(visibleSlugs.has(slug)).toBeFalsy();
    }

    const hiddenEntities = [
      ...localContract.hiddenBrands,
      ...(localContract.hiddenArticle ? [localContract.hiddenArticle] : []),
    ];
    expect(hiddenEntities.length).toBeGreaterThanOrEqual(5);
    for (const entity of hiddenEntities) {
      for (const suffix of ["", "/preview", "/tags"]) {
        const response = await request.get(
          `/api/entities/${encodeURIComponent(entity.slug)}${suffix}`,
        );
        expect(response.status()).toBe(404);
      }
      const links = await request.get(
        `/api/links?entity_id=${encodeURIComponent(entity.id)}&depth=2`,
      );
      expect(links.status()).toBe(404);
    }

    const publicEntity = await request.get("/api/entities/pilot-custom-823");
    expect(publicEntity.ok()).toBeTruthy();
    const publicPayload = (await publicEntity.json()) as { id: string };
    const links = await request.get(
      `/api/links?entity_id=${encodeURIComponent(publicPayload.id)}&depth=2`,
    );
    expect(links.ok()).toBeTruthy();
    const linkPayload = (await links.json()) as Record<
      string,
      Array<Record<string, string>>
    >;
    const hiddenIds = new Set(hiddenEntities.map((entity) => entity.id));
    for (const collection of [
      "forward",
      "backlinks",
      "secondHopForward",
      "secondHopBacklinks",
    ]) {
      for (const link of linkPayload[collection] || []) {
        for (const value of Object.values(link)) {
          expect(HIDDEN_BRAND_SLUGS.includes(value)).toBeFalsy();
          expect(hiddenIds.has(value)).toBeFalsy();
        }
      }
    }
  });

  test("media proxy enforces approved id and legacy host contracts", async ({
    request,
  }, testInfo) => {
    if (!desktopOnly(testInfo.project.name)) return;

    expect(localContract.approvedMedia?.id).toBeTruthy();
    const approved = await request.get(
      `/api/image-proxy?id=${encodeURIComponent(localContract.approvedMedia?.id || "")}`,
    );
    expect(approved.status()).toBe(200);
    expect(approved.headers()["content-type"]).toMatch(/^image\//);

    expect(
      (await request.get("/api/image-proxy?id=unknown-media-id")).status(),
    ).toBe(404);
    expect(
      (
        await request.get(
          `/api/image-proxy?url=${encodeURIComponent("https://example.com/image.jpg")}`,
        )
      ).status(),
    ).toBe(403);
    expect(
      (
        await request.get(
          `/api/image-proxy?url=${encodeURIComponent("https://127.0.0.1/image.jpg")}`,
        )
      ).status(),
    ).toBe(403);

    const legacy = await request.get(
      `/api/image-proxy?url=${encodeURIComponent(
        "https://www.richardspens.com/images/ref/anatomy/51/51_capped_capcut.jpg",
      )}`,
    );
    expect([200, 403, 404, 429, 502]).toContain(legacy.status());
    if (legacy.status() === 200) {
      expect(legacy.headers()["content-type"]).toMatch(/^image\//);
    }
  });

  test("media fetcher blocks DNS rebinding, redirects and oversized bodies", async ({
    request: _request,
  }, testInfo) => {
    if (!desktopOnly(testInfo.project.name)) return;

    const publicResolver: MediaHostResolver = async () => [
      { address: "8.8.8.8", family: 4 },
    ];
    const privateResolver: MediaHostResolver = async () => [
      { address: "127.0.0.1", family: 4 },
    ];
    const unusedFetcher: MediaFetcher = async () => {
      throw new Error("fetch must not run");
    };
    await expect(
      fetchExternalImage("https://media.example/image.jpg", {
        resolver: privateResolver,
        fetcher: unusedFetcher,
      }),
    ).rejects.toMatchObject({ status: 403 });

    const redirectPrivate: MediaFetcher = async () =>
      new Response(null, {
        status: 302,
        headers: { location: "https://127.0.0.1/private.jpg" },
      });
    await expect(
      fetchExternalImage("https://media.example/image.jpg", {
        resolver: publicResolver,
        fetcher: redirectPrivate,
      }),
    ).rejects.toMatchObject({ status: 403 });

    const redirectLoop: MediaFetcher = async (input) => {
      const current = new URL(String(input));
      const count = Number(current.searchParams.get("hop") || "0") + 1;
      return new Response(null, {
        status: 302,
        headers: { location: `https://media.example/image.jpg?hop=${count}` },
      });
    };
    await expect(
      fetchExternalImage("https://media.example/image.jpg", {
        resolver: publicResolver,
        fetcher: redirectLoop,
      }),
    ).rejects.toMatchObject({ status: 508 });

    const declaredOversize: MediaFetcher = async () =>
      new Response(new Uint8Array([1]), {
        status: 200,
        headers: {
          "content-type": "image/png",
          "content-length": String(MAX_MEDIA_BYTES + 1),
        },
      });
    await expect(
      fetchExternalImage("https://media.example/image.jpg", {
        resolver: publicResolver,
        fetcher: declaredOversize,
      }),
    ).rejects.toMatchObject({ status: 413 });

    const streamedOversize: MediaFetcher = async () =>
      new Response(new Uint8Array(MAX_MEDIA_BYTES + 1), {
        status: 200,
        headers: { "content-type": "image/png" },
      });
    await expect(
      fetchExternalImage("https://media.example/image.jpg", {
        resolver: publicResolver,
        fetcher: streamedOversize,
      }),
    ).rejects.toMatchObject({ status: 413 });

    const wrongMime: MediaFetcher = async () =>
      new Response("not an image", {
        status: 200,
        headers: { "content-type": "text/plain" },
      });
    await expect(
      fetchExternalImage("https://media.example/image.jpg", {
        resolver: publicResolver,
        fetcher: wrongMime,
      }),
    ).rejects.toMatchObject({ status: 415 });
  });

  test("detail, relationship graph and recommendations explain their evidence", async ({
    page,
  }, testInfo) => {
    if (!desktopOnly(testInfo.project.name)) return;

    await page.goto("/pen/pilot-custom-823", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("navigation", { name: /面包屑/ }),
    ).toContainText(/首页/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("823");
    await expect(page.getByText(/来源|证据/).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: /关系图谱/ })).toBeVisible();
    await expect(
      page.getByText(/同品牌|品牌型号|品牌制造|相关/).first(),
    ).toBeVisible();
    const genericReasons = page.getByText(/^共享 \d+ 个标签$/);
    await expect(genericReasons).toHaveCount(0);
    await expectNoHorizontalOverflow(page);

    await page.goto("/graph", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "关系图谱",
    );
    await expect(
      page.locator('a[href^="/pen/"], a[href^="/brand/"]').first(),
    ).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("canonical, JSON-LD, noindex, sitemap and robots agree", async ({
    page,
    request,
  }, testInfo) => {
    if (!desktopOnly(testInfo.project.name)) return;

    const indexablePaths = [
      "/",
      "/browse",
      "/library",
      "/library/sources",
      "/library/media",
      "/library/diagrams",
      "/library/coverage",
      "/library/community",
      "/exhibits",
      `/exhibits/${localContract.exhibit?.slug || "japanese-big-three"}`,
      "/timeline",
      "/graph",
      "/by/brand",
      "/pen/pilot-custom-823",
    ];
    for (const route of indexablePaths) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      expect(await getCanonical(page)).toBe(
        `https://fountain-pen-graph.vercel.app${route === "/" ? "" : route}`,
      );
    }

    await page.goto("/");
    await expect(
      page.locator('script[type="application/ld+json"]'),
    ).toHaveCount(1);
    expect(
      await page
        .locator('script[type="application/ld+json"]')
        .evaluateAll((scripts) =>
          scripts.map((script) => script.textContent || "").join("\n"),
        ),
    ).toContain("WebSite");
    await page.goto("/library");
    await expect(
      page.locator('script[type="application/ld+json"]'),
    ).toHaveCount(0);

    for (const route of ["/search", "/chat", "/compare"]) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
        "content",
        /noindex/,
      );
    }

    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).toContain("/graph");
    expect(sitemap).toContain(`/exhibits/${localContract.exhibit?.slug}`);
    for (const hidden of HIDDEN_BRAND_SLUGS)
      expect(sitemap).not.toContain(`/${hidden}<`);
    if (localContract.hiddenArticle) {
      expect(sitemap).not.toContain(`/${localContract.hiddenArticle.slug}<`);
    }
    for (const tool of ["/search", "/chat", "/compare", "/api/", "/new"]) {
      expect(sitemap).not.toContain(
        `<loc>https://fountain-pen-graph.vercel.app${tool}`,
      );
    }

    const robots = await (await request.get("/robots.txt")).text();
    for (const disallowed of ["/api/", "/admin/", "/new"]) {
      expect(robots).toContain(`Disallow: ${disallowed}`);
    }
  });

  test("cacheable read surfaces advertise shared caching", async ({
    request,
  }, testInfo) => {
    if (!desktopOnly(testInfo.project.name)) return;
    for (const route of ["/api/browse?type=pen", "/api/search?q=823"]) {
      const first = await request.get(route);
      const second = await request.get(route);
      expect(first.ok()).toBeTruthy();
      expect(second.ok()).toBeTruthy();
      const headers = second.headers();
      if (headers["cache-control"]?.includes("s-maxage")) continue;

      // Vercel consumes s-maxage at the edge and exposes the browser-safe
      // remainder. In production, age or an edge HIT/STALE proves reuse.
      expect(headers["cache-control"]).toContain("public");
      expect(
        Number.parseInt(headers.age || "", 10) >= 0 ||
          /^(HIT|STALE)$/.test(headers["x-vercel-cache"] || ""),
      ).toBeTruthy();
    }
  });

  test("critical journeys have no browser errors or broken images", async ({
    page,
  }, testInfo) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (
        message.type() === "error" &&
        !/Failed to load resource: the server responded with a status of 429/.test(
          message.text(),
        )
      ) {
        errors.push(message.text());
      }
    });
    const routes = [
      "/",
      "/browse?type=pen&origin=origin-japan&nib_material=gold&max_price=500",
      "/pen/pilot-custom-823",
      "/graph",
      "/compare?items=pilot-custom-823,%E7%99%BE%E4%B9%90-pilot-custom-743",
    ];
    for (const [index, route] of routes.entries()) {
      const response = await page.goto(route, {
        waitUntil: "domcontentloaded",
      });
      expect(response?.status()).toBeLessThan(400);
      await page.waitForTimeout(250);
      await expectNoHorizontalOverflow(page);
      const brokenImages = await page
        .locator("img")
        .evaluateAll(
          (images) =>
            images.filter(
              (image) =>
                image instanceof HTMLImageElement &&
                image.complete &&
                image.naturalWidth === 0,
            ).length,
        );
      expect(brokenImages).toBe(0);
      if (index === 0 || route === "/graph") {
        await page.screenshot({
          path: testInfo.outputPath(
            `${testInfo.project.name}-${index === 0 ? "home" : "graph"}.png`,
          ),
          fullPage: false,
        });
      }
    }
    expect(errors).toEqual([]);
  });

  test("mobile navigation and filter dialogs trap focus and restore it", async ({
    page,
  }, testInfo) => {
    if (!mobileOnly(testInfo.project.name)) return;

    await page.goto("/", { waitUntil: "domcontentloaded" });
    const menuTrigger = page.getByRole("button", { name: "打开导航" });
    const menu = page.getByRole("dialog", { name: "导航" });
    await openHydratedDialog(menuTrigger, menu);
    await expect(menu.getByRole("heading", { name: "导航" })).toHaveCount(1);
    await expect(menu.getByRole("button", { name: "关闭导航" })).toHaveCount(1);
    for (let index = 0; index < 12; index += 1)
      await page.keyboard.press("Tab");
    expect(
      await page.evaluate(() =>
        Boolean(document.activeElement?.closest('[role="dialog"]')),
      ),
    ).toBeTruthy();
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(menuTrigger).toBeFocused();

    await page.goto("/browse", { waitUntil: "domcontentloaded" });
    const filterTrigger = page.getByRole("button", { name: "筛选" });
    const filter = page.getByRole("dialog", { name: "筛选" });
    await openHydratedDialog(filterTrigger, filter);
    await expect(filter.getByRole("heading", { name: "筛选" })).toHaveCount(1);
    await expect(filter.getByRole("button", { name: "关闭筛选" })).toHaveCount(
      1,
    );
    await page.keyboard.press("Shift+Tab");
    expect(
      await page.evaluate(() =>
        Boolean(document.activeElement?.closest('[role="dialog"]')),
      ),
    ).toBeTruthy();
    await page.keyboard.press("Escape");
    await expect(filter).toBeHidden();
    await expect(filterTrigger).toBeFocused();
    await expectNoHorizontalOverflow(page);
  });

  test("focus indication, reduced motion and mobile layouts remain usable", async ({
    page,
  }, testInfo) => {
    if (!mobileOnly(testInfo.project.name)) return;

    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const route of ["/", "/browse", "/pen/pilot-custom-823", "/graph"]) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await expectNoHorizontalOverflow(page);
    }
    await page.goto("/");
    await page.keyboard.press("Tab");
    const focusStyle = await page.evaluate(() => {
      const active = document.activeElement;
      if (!(active instanceof HTMLElement)) return null;
      const style = getComputedStyle(active);
      return {
        outlineStyle: style.outlineStyle,
        outlineWidth: style.outlineWidth,
      };
    });
    expect(focusStyle).not.toBeNull();
    expect(focusStyle?.outlineStyle).not.toBe("none");
    expect(focusStyle?.outlineWidth).not.toBe("0px");

    const animationDuration = await page
      .locator(".animate-ink-bleed")
      .first()
      .evaluate((element) => getComputedStyle(element).animationDuration);
    expect(["0s", "0.001s", "0.01ms"]).toContain(animationDuration);
  });
});
