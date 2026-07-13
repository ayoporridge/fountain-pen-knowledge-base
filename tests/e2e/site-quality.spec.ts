import path from "node:path";
import { expect, type Page, test } from "@playwright/test";
import Database from "better-sqlite3";
import {
  ENTITY_DETAIL_LOADING_CONTAINER_CLASS,
  ENTITY_DETAIL_LOADING_SUMMARY_CLASS,
} from "../../src/app/[type]/[slug]/loading";
import {
  fetchExternalImage,
  MAX_MEDIA_BYTES,
  type MediaFetcher,
  type MediaHostResolver,
} from "../../src/lib/media-url";
import { publicEntityFilter } from "../../src/lib/public-visibility";

const HIDDEN_BRAND_SLUGS = ["banju", "saier", "shanghai", "yongxu"];
const RETIRED_DUPLICATE_SLUGS = [
  "百乐-pilot-custom-823",
  "百利金-pelikan-m800",
  "派克-parker-51-经典-vintage",
  "写乐-sailor-21k-pro-gear-大鱼雷",
  "奥罗拉-aurora",
];
const AUDIT_BATCH_SIZE = Math.max(
  1,
  Math.min(
    16,
    Number.parseInt(process.env.E2E_AUDIT_BATCH_SIZE || "16", 10) || 16,
  ),
);
const FULL_AUDIT_TIMEOUT = process.env.E2E_BASE_URL ? 900_000 : 300_000;
const LOAD_MORE_TIMEOUT = process.env.E2E_BASE_URL ? 45_000 : 5_000;

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
         WHERE id = 'media-warm-pen-atlas-pilot-brand-cover'
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

function visibleTextFromHtml(html: string) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--([\s\S]*?)-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function internalAnchorPaths(html: string) {
  const paths = new Set<string>();
  for (const match of html.matchAll(
    /<a\b[^>]*\bhref=(?:"([^"]*)"|'([^']*)')[^>]*>/gi,
  )) {
    const href = (match[1] || match[2] || "").replace(/&amp;/g, "&");
    if (
      !href ||
      href.startsWith("#") ||
      /^(?:mailto:|tel:|javascript:)/i.test(href)
    )
      continue;
    try {
      const url = new URL(href, "https://fountain-pen-graph.vercel.app");
      if (url.hostname !== "fountain-pen-graph.vercel.app") continue;
      paths.add(`${url.pathname}${url.search}`);
    } catch {
      // malformed links are reported by the page-level content audit instead
    }
  }
  return paths;
}

function htmlAttribute(tag: string, name: string) {
  const match = tag.match(
    new RegExp(`\\b${name}=(?:"([^"]*)"|'([^']*)')`, "i"),
  );
  return (match?.[1] || match?.[2] || "").replace(/&amp;/g, "&");
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
  test.setTimeout(process.env.E2E_BASE_URL ? FULL_AUDIT_TIMEOUT : 90_000);

  test("homepage classification shortcuts have deterministic destinations", async ({
    page,
  }, testInfo) => {
    if (!desktopOnly(testInfo.project.name)) return;

    await page.goto("/");
    for (const [name, href] of [
      ["钢笔型号", "/browse?type=pen"],
      ["品牌", "/browse?type=brand"],
      ["笔尖", "/by/nib"],
      ["上墨方式", "/by/fill"],
      ["材质", "/by/material"],
      ["历史专题", "/exhibits"],
    ] as const) {
      await expect(
        page.getByRole("link", { name, exact: true }).first(),
      ).toHaveAttribute("href", href);
    }
    await expect(
      page.getByRole("link", { name: "查看全部分类" }),
    ).toHaveAttribute("href", "/browse");
  });

  test("public release exposes classification only and retires search and AI", async ({
    page,
    request,
  }, testInfo) => {
    if (!desktopOnly(testInfo.project.name)) return;

    for (const route of ["/", "/library"]) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await expect(page.locator('input[type="search"]')).toHaveCount(0);
      await expect(page.locator('a[href^="/search"]')).toHaveCount(0);
      await expect(page.locator('a[href^="/chat"]')).toHaveCount(0);
      await expect(page.locator('a[href^="/compare"]')).toHaveCount(0);
      await expect(page.locator('a[href^="/by/price"]')).toHaveCount(0);
    }

    await page.goto("/");
    await page.keyboard.press("/");
    await expect(page).toHaveURL(/\/$/);

    await page.goto("/search?q=823");
    await expect(page).toHaveURL(/\/browse$/);
    await page.goto("/chat");
    await expect(page).toHaveURL(/\/library$/);
    await page.goto("/compare?items=pilot-custom-823");
    await expect(page).toHaveURL(/\/browse\?type=pen$/);

    expect((await request.get("/api/search?q=823")).status()).toBe(404);
    expect((await request.get("/api/chat")).status()).toBe(404);
    expect((await request.get("/by/price")).status()).toBe(404);
    expect(
      (
        await request.post("/api/chat", {
          data: { messages: [{ role: "user", content: "test" }] },
        })
      ).status(),
    ).toBe(404);
  });

  test("legacy identities resolve to one canonical public entity", async ({
    page,
    request,
  }, testInfo) => {
    if (!desktopOnly(testInfo.project.name)) return;

    const redirects = [
      ["/pen/百乐-pilot-custom-823", "/pen/pilot-custom-823"],
      ["/pen/百利金-pelikan-m800", "/pen/pelikan-souveran-m800"],
      ["/pen/the-parker-51", "/pen/parker-51-vintage"],
      ["/pen/派克-parker-51-经典-vintage", "/pen/parker-51-vintage"],
      ["/pen/写乐-sailor-21k-pro-gear-大鱼雷", "/pen/sailor-pro-gear"],
      ["/pen/奥罗拉-aurora", "/brand/aurora"],
      [
        "/pen/kimberly-the-pen-that-saved-eversharp",
        "/article/kimberly-pockette-ballpoint-history",
      ],
      ["/pen/百乐-pilot-iroshizuku色彩雫", "/browse?type=article"],
    ] as const;
    for (const [legacy, canonical] of redirects) {
      await page.goto(legacy, { waitUntil: "domcontentloaded" });
      await expect
        .poll(() => {
          const current = new URL(page.url());
          return `${current.pathname}${current.search}`;
        })
        .toBe(canonical);
      await expect(
        page.getByRole("heading", { level: 1 }).first(),
      ).toBeVisible();
    }

    for (const retired of [
      "/library/media",
      "/library/coverage",
      "/library/community",
    ]) {
      await page.goto(retired, { waitUntil: "domcontentloaded" });
      await expect(page).toHaveURL(/\/library$/);
    }

    expect(
      (
        await request.get(
          "/07-%E7%BB%8F%E5%85%B8%E5%9E%8B%E5%8F%B7%E6%A1%A3%E6%A1%88/51",
        )
      ).status(),
    ).toBe(404);

    const pens = (await (
      await request.get("/api/entities?type=pen")
    ).json()) as Array<{ slug: string; type: string }>;
    const penSlugs = new Set(pens.map((entity) => entity.slug));
    for (const slug of RETIRED_DUPLICATE_SLUGS) {
      expect(penSlugs.has(slug)).toBeFalsy();
    }
    expect(penSlugs.has("kimberly-pockette-ballpoint-history")).toBeFalsy();
    expect(penSlugs.has("pilot-iroshizuku-ink-guide")).toBeFalsy();
  });

  test("browse uses OR inside semantic facets and ships server results", async ({
    page,
    request,
  }, testInfo) => {
    if (!desktopOnly(testInfo.project.name)) return;
    const path = "/browse?type=pen&origin=origin-japan&nib_material=gold";
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
        .poll(
          () =>
            page
              .locator(
                'main a[href^="/pen/"], main a[href^="/brand/"], main a[href^="/article/"]',
              )
              .count(),
          { timeout: LOAD_MORE_TIMEOUT },
        )
        .toBeGreaterThan(before);
    }
  });

  test("dimension totals are distinct and facet counts respect the active type", async ({
    page,
    request,
  }, testInfo) => {
    if (!desktopOnly(testInfo.project.name)) return;

    const database = new Database(path.join(process.cwd(), "data/fpkg.db"), {
      readonly: true,
    });
    try {
      for (const [route, dimension] of [
        ["nib", "nib_type"],
        ["material", "body_material"],
      ] as const) {
        const row = database
          .prepare(
            `SELECT COUNT(DISTINCT e.id) as total
             FROM entity_tags et
             JOIN tags t ON t.id = et.tag_id
             JOIN entities e ON e.id = et.entity_id
             WHERE t.dimension = ? AND ${publicEntityFilter("e")}`,
          )
          .get(dimension) as { total: number };
        await page.goto(`/by/${route}`, { waitUntil: "domcontentloaded" });
        await expect(page.getByText(`覆盖 ${row.total} 个词条`)).toBeVisible();
      }
    } finally {
      database.close();
    }

    const knowledgeResponse = await request.get("/api/browse?type=knowledge");
    expect(knowledgeResponse.ok()).toBeTruthy();
    const payload = (await knowledgeResponse.json()) as {
      total: number;
      facets: Record<string, Array<{ count: number }>>;
    };
    for (const options of Object.values(payload.facets)) {
      for (const option of options) {
        expect(option.count).toBeLessThanOrEqual(payload.total);
      }
    }
  });

  test("public entity and graph APIs do not expose hidden records", async ({
    request,
  }, testInfo) => {
    if (!desktopOnly(testInfo.project.name)) return;

    const brandsResponse = await request.get("/api/entities?type=brand");
    expect(brandsResponse.ok()).toBeTruthy();
    const brands = (await brandsResponse.json()) as Array<{
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
      for (const suffix of ["", "/preview"]) {
        const response = await request.get(
          `/api/entities/${encodeURIComponent(entity.slug)}${suffix}`,
        );
        expect(response.status()).toBe(404);
      }
      expect(
        (
          await request.get(
            `/api/entities/${encodeURIComponent(entity.slug)}/tags`,
          )
        ).status(),
      ).toBe(410);
      const links = await request.get(
        `/api/links?slug=${encodeURIComponent(entity.slug)}&depth=2`,
      );
      expect(links.status()).toBe(404);
    }

    const publicEntity = await request.get("/api/entities/pilot-custom-823");
    expect(publicEntity.ok()).toBeTruthy();
    const publicPayload = (await publicEntity.json()) as Record<
      string,
      unknown
    >;
    expect(Object.keys(publicPayload).sort()).toEqual(
      ["name", "slug", "summary", "type"].sort(),
    );
    for (const internalField of [
      "id",
      "source",
      "source_file",
      "source_url",
      "body_md",
      "created_at",
      "updated_at",
    ]) {
      expect(publicPayload).not.toHaveProperty(internalField);
    }
    const publicPreview = await request.get(
      "/api/entities/pilot-custom-823/preview",
    );
    expect(publicPreview.ok()).toBeTruthy();
    const previewPayload = (await publicPreview.json()) as {
      summary: string | null;
      tags: Array<{ name: string; dimension: string }>;
    };
    expect(previewPayload.summary).toBeNull();
    const publicDimensions = new Set([
      "nib_type",
      "nib_material",
      "fill_system",
      "origin",
      "body_material",
    ]);
    for (const tag of previewPayload.tags) {
      expect(publicDimensions.has(tag.dimension)).toBeTruthy();
    }
    const browseResponse = await request.get("/api/browse?type=pen");
    expect(browseResponse.ok()).toBeTruthy();
    const browsePayload = (await browseResponse.json()) as {
      entities: Array<Record<string, unknown>>;
    };
    expect(browsePayload.entities.length).toBeGreaterThan(0);
    expect(Object.keys(browsePayload.entities[0]).sort()).toEqual(
      [
        "type",
        "slug",
        "name",
        "summary",
        "classification",
        "source_count",
        "image_url",
      ].sort(),
    );
    expect(browsePayload.entities[0].summary).toBeNull();
    const links = await request.get("/api/links?slug=pilot-custom-823&depth=2");
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
        expect(Object.keys(link).sort()).toEqual(
          [
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
          ].sort(),
        );
        for (const value of Object.values(link)) {
          expect(HIDDEN_BRAND_SLUGS.includes(value)).toBeFalsy();
          expect(hiddenIds.has(value)).toBeFalsy();
        }
      }
    }
    expect(
      (await request.get("/api/links?entity_id=legacy-internal-id")).status(),
    ).toBe(400);
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

  test("public media is reusable, unique on each page, and never a rotating placeholder", async ({
    page,
    request,
  }, testInfo) => {
    if (!desktopOnly(testInfo.project.name)) return;

    expect(
      (
        await request.get(
          "/api/image-proxy?id=warm-pen-atlas-card-article-1-who-made-this-pen",
        )
      ).status(),
    ).toBe(404);
    expect(
      (
        await request.get("/api/image-proxy?id=media-commerce-169b0fb4640bf4")
      ).status(),
    ).toBe(404);
    expect(
      (
        await request.get("/api/image-proxy?id=media-commons-0e62ab801d9015")
      ).status(),
    ).toBe(404);

    await page.goto("/pen/pilot-custom-823", {
      waitUntil: "domcontentloaded",
    });
    await expect(
      page.locator('img[src*="vacuum-filler-model-cover.jpg"]'),
    ).toHaveCount(1);
    await expect(page.locator("#archive img")).toHaveCount(0);

    await page.goto("/pen/弘典-hongdian-517-517s", {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByText("暂无可公开复用的对应图片")).toBeVisible();

    await page.goto("/article/1-who-made-this-pen", {
      waitUntil: "domcontentloaded",
    });
    await expect(page.locator(".legacy-note-badge")).toHaveCount(0);
    await expect(page.locator('img[src*="info.png"]')).toHaveCount(0);

    await page.goto("/article/xxxvi", { waitUntil: "domcontentloaded" });
    await expect(page.locator(".legacy-note-badge").first()).toBeVisible();
    await expect(
      page.locator('img[src*="warning.png"], img[src*="caution.png"]'),
    ).toHaveCount(0);

    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.ok()).toBeTruthy();
    const sitemapXml = await sitemap.text();
    const paths = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
      (match) => new URL(match[1]).pathname,
    );
    const failures: string[] = [];
    for (let offset = 0; offset < paths.length; offset += AUDIT_BATCH_SIZE) {
      await Promise.all(
        paths.slice(offset, offset + AUDIT_BATCH_SIZE).map(async (path) => {
          const response = await request.get(path);
          if (!response.ok()) return;
          const html = await response.text();
          const seen = new Set<string>();
          for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
            const tag = match[0];
            const src = htmlAttribute(tag, "src");
            const alt = htmlAttribute(tag, "alt").trim();
            if (!src) failures.push(`${path}: image without src`);
            if (!alt) failures.push(`${path}: image without alt (${src})`);
            if (
              /^http:\/\//i.test(src) ||
              /example\.com|pixel\.gif|\/article\/yyy|\/repair\/plush\/|\/icons\/lg\/(?:info|caution|warning)\.png|\/pendoctor\/(?:q|rx)\.png/i.test(
                src,
              )
            ) {
              failures.push(`${path}: blocked image ${src}`);
            }
            if (src && seen.has(src)) {
              failures.push(`${path}: repeated image ${src}`);
            }
            if (src) seen.add(src);
          }
        }),
      );
    }
    expect(failures).toEqual([]);
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
    const publicTransport = (response: Response) => ({
      response,
      connectedAddress: "8.8.8.8",
    });
    await expect(
      fetchExternalImage("https://media.example/image.jpg", {
        resolver: privateResolver,
        fetcher: unusedFetcher,
      }),
    ).rejects.toMatchObject({ status: 403 });

    const reboundAtConnection: MediaFetcher = async (target) => {
      expect(target.hostname).toBe("media.example");
      expect(target.address).toBe("8.8.8.8");
      return {
        response: new Response(new Uint8Array([1]), {
          status: 200,
          headers: { "content-type": "image/png" },
        }),
        connectedAddress: "127.0.0.1",
      };
    };
    await expect(
      fetchExternalImage("https://media.example/image.jpg", {
        resolver: publicResolver,
        fetcher: reboundAtConnection,
      }),
    ).rejects.toMatchObject({ status: 403 });

    const redirectPrivate: MediaFetcher = async () =>
      publicTransport(
        new Response(null, {
          status: 302,
          headers: { location: "https://127.0.0.1/private.jpg" },
        }),
      );
    await expect(
      fetchExternalImage("https://media.example/image.jpg", {
        resolver: publicResolver,
        fetcher: redirectPrivate,
      }),
    ).rejects.toMatchObject({ status: 403 });

    const redirectLoop: MediaFetcher = async (target) => {
      const current = target.url;
      const count = Number(current.searchParams.get("hop") || "0") + 1;
      return publicTransport(
        new Response(null, {
          status: 302,
          headers: {
            location: `https://media.example/image.jpg?hop=${count}`,
          },
        }),
      );
    };
    await expect(
      fetchExternalImage("https://media.example/image.jpg", {
        resolver: publicResolver,
        fetcher: redirectLoop,
      }),
    ).rejects.toMatchObject({ status: 508 });

    const declaredOversize: MediaFetcher = async () =>
      publicTransport(
        new Response(new Uint8Array([1]), {
          status: 200,
          headers: {
            "content-type": "image/png",
            "content-length": String(MAX_MEDIA_BYTES + 1),
          },
        }),
      );
    await expect(
      fetchExternalImage("https://media.example/image.jpg", {
        resolver: publicResolver,
        fetcher: declaredOversize,
      }),
    ).rejects.toMatchObject({ status: 413 });

    const streamedOversize: MediaFetcher = async () =>
      publicTransport(
        new Response(new Uint8Array(MAX_MEDIA_BYTES + 1), {
          status: 200,
          headers: { "content-type": "image/png" },
        }),
      );
    await expect(
      fetchExternalImage("https://media.example/image.jpg", {
        resolver: publicResolver,
        fetcher: streamedOversize,
      }),
    ).rejects.toMatchObject({ status: 413 });

    const wrongMime: MediaFetcher = async () =>
      publicTransport(
        new Response("not an image", {
          status: 200,
          headers: { "content-type": "text/plain" },
        }),
      );
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
      "/library/diagrams",
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
    const websiteJsonLd = await page
      .locator('script[type="application/ld+json"]')
      .evaluateAll((scripts) =>
        scripts.map((script) => script.textContent || "").join("\n"),
      );
    expect(websiteJsonLd).toContain("WebSite");
    expect(websiteJsonLd).not.toContain("SearchAction");
    expect(websiteJsonLd).not.toContain("/search?q=");
    await page.goto("/library");
    await expect(
      page.locator('script[type="application/ld+json"]'),
    ).toHaveCount(0);

    await page.goto("/compare", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/browse\?type=pen$/);

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
    for (const retired of [
      "/library/media",
      "/library/coverage",
      "/library/community",
      ...RETIRED_DUPLICATE_SLUGS.map((slug) => `/pen/${slug}`),
    ]) {
      expect(sitemap).not.toContain(
        `<loc>https://fountain-pen-graph.vercel.app${retired}`,
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
    for (const route of ["/api/browse?type=pen"]) {
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

  test("every sitemap page hides editorial states and internal field names", async ({
    request,
  }, testInfo) => {
    if (!desktopOnly(testInfo.project.name)) return;
    testInfo.setTimeout(FULL_AUDIT_TIMEOUT);

    const sitemap = await (await request.get("/sitemap.xml")).text();
    const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
      (match) => match[1],
    );
    expect(urls.length).toBeGreaterThan(500);

    const forbidden = [
      /identity pending/i,
      /待映射|待核验|需核验|待审核|未审核|资料核验中|研究队列|当前草稿|当前档案|待补证/,
      /\b(?:review_status|usage_status|asset_type|source_type|item_type|story_type|coverage_status)\b/,
      /\b(?:nib_material|body_material|fill_system|design_keywords|signature_technology)\b/,
      /\b(?:official_site|research_index|richardspens_profile|secondary_profile|penhero_profile)\b/,
      /\b(?:needs_source|needs_review|site-original)\b/,
    ];
    const failures: string[] = [];

    for (let offset = 0; offset < urls.length; offset += AUDIT_BATCH_SIZE) {
      const batch = urls.slice(offset, offset + AUDIT_BATCH_SIZE);
      await Promise.all(
        batch.map(async (url) => {
          const parsed = new URL(url);
          const response = await request.get(
            `${parsed.pathname}${parsed.search}`,
          );
          if (!response.ok()) {
            failures.push(`${response.status()} ${url}`);
            return;
          }
          const text = visibleTextFromHtml(await response.text());
          for (const pattern of forbidden) {
            const match = text.match(pattern);
            if (match) failures.push(`${url}: ${match[0]}`);
          }
        }),
      );
    }

    expect(failures).toEqual([]);
  });

  test("every public internal link resolves to a real page", async ({
    request,
  }, testInfo) => {
    if (!desktopOnly(testInfo.project.name)) return;
    testInfo.setTimeout(FULL_AUDIT_TIMEOUT);

    const sitemap = await (await request.get("/sitemap.xml")).text();
    const sitemapPaths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
      (match) => {
        const url = new URL(match[1]);
        return `${url.pathname}${url.search}`;
      },
    );
    const targets = new Set(sitemapPaths);
    const targetSources = new Map<string, Set<string>>(
      sitemapPaths.map((path) => [path, new Set(["sitemap"])]),
    );
    const failures: string[] = [];

    for (
      let offset = 0;
      offset < sitemapPaths.length;
      offset += AUDIT_BATCH_SIZE
    ) {
      const batch = sitemapPaths.slice(offset, offset + AUDIT_BATCH_SIZE);
      await Promise.all(
        batch.map(async (path) => {
          const response = await request.get(path);
          if (!response.ok()) {
            failures.push(`${response.status()} ${path}`);
            return;
          }
          for (const target of internalAnchorPaths(await response.text())) {
            targets.add(target);
            if (!targetSources.has(target))
              targetSources.set(target, new Set());
            targetSources.get(target)?.add(path);
          }
        }),
      );
    }

    const allTargets = [...targets];
    for (
      let offset = 0;
      offset < allTargets.length;
      offset += AUDIT_BATCH_SIZE
    ) {
      const batch = allTargets.slice(offset, offset + AUDIT_BATCH_SIZE);
      await Promise.all(
        batch.map(async (path) => {
          const response = await request.get(path);
          if (!response.ok()) {
            failures.push(
              `${response.status()} ${path} from ${[
                ...(targetSources.get(path) || []),
              ].join(", ")}`,
            );
            return;
          }
          const contentType = response.headers()["content-type"] || "";
          if (!contentType.includes("text/html")) return;
          const html = await response.text();
          if (!/<h1\b/i.test(html)) {
            failures.push(
              `200 shell ${path} from ${[
                ...(targetSources.get(path) || []),
              ].join(", ")}`,
            );
          }
        }),
      );
    }

    expect(failures).toEqual([]);
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
      "/browse?type=pen&origin=origin-japan&nib_material=gold",
      "/pen/pilot-custom-823",
      "/concept/gold-nib",
      "/graph",
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
    await expect(menu.locator('a[href^="/search"]')).toHaveCount(0);
    await expect(menu.locator('a[href^="/chat"]')).toHaveCount(0);
    for (const name of ["分类浏览", "品牌", "笔尖类型", "上墨方式"]) {
      await expect(menu.getByRole("link", { name, exact: true })).toBeVisible();
    }
    const menuBox = await menu.boundingBox();
    expect(menuBox?.height || 0).toBeGreaterThan(
      (page.viewportSize()?.height || 0) * 0.9,
    );
    const navigationIsolation = await page.evaluate(() => {
      const dialog = document.querySelector<HTMLElement>(
        '#mobile-navigation-dialog[role="dialog"]',
      );
      const trigger = document.querySelector<HTMLElement>(
        'button[aria-label="打开导航"]',
      );
      const focusable = Array.from(
        document.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [contenteditable="true"], [tabindex]',
        ),
      );
      const outsideFocusable = focusable
        .filter((element) => !dialog?.contains(element))
        .filter((element) => {
          const style = getComputedStyle(element);
          const visible =
            style.display !== "none" &&
            style.visibility !== "hidden" &&
            element.getClientRects().length > 0;
          return (
            visible &&
            element.tabIndex >= 0 &&
            !element.closest("[inert]") &&
            !element.closest('[aria-hidden="true"]')
          );
        })
        .map(
          (element) =>
            element.getAttribute("aria-label") ||
            element.textContent?.trim() ||
            element.tagName,
        );
      return {
        outsideFocusable,
        trigger: trigger
          ? {
              inert: trigger.inert,
              ariaHidden: trigger.getAttribute("aria-hidden"),
              tabIndex: trigger.tabIndex,
            }
          : null,
      };
    });
    expect(navigationIsolation.outsideFocusable).toEqual([]);
    expect(navigationIsolation.trigger).toEqual({
      inert: true,
      ariaHidden: "true",
      tabIndex: -1,
    });
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
    await expect(menuTrigger).not.toHaveAttribute("aria-hidden", "true");
    await expect(menuTrigger).not.toHaveAttribute("inert", "");
    await expect(menuTrigger).not.toHaveAttribute("tabindex", "-1");

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

  test("detail loading skeleton fits narrow mobile viewports", async ({
    page,
  }, testInfo) => {
    if (!mobileOnly(testInfo.project.name)) return;

    await page.goto("/", { waitUntil: "domcontentloaded" });
    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 844 });
      await page.locator("body").evaluate(
        (body, classes) => {
          body.innerHTML = `<div class="${classes.container}"><div class="${classes.summary}"></div></div>`;
        },
        {
          container: ENTITY_DETAIL_LOADING_CONTAINER_CLASS,
          summary: ENTITY_DETAIL_LOADING_SUMMARY_CLASS,
        },
      );
      await expectNoHorizontalOverflow(page);
    }
  });

  test("every sitemap page fits the mobile viewport", async ({
    context,
    request,
  }, testInfo) => {
    if (!mobileOnly(testInfo.project.name)) return;
    testInfo.setTimeout(FULL_AUDIT_TIMEOUT);

    const sitemap = await (await request.get("/sitemap.xml")).text();
    const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => {
      const url = new URL(match[1]);
      return `${url.pathname}${url.search}`;
    });
    const pages = await Promise.all(
      Array.from({ length: Math.min(6, AUDIT_BATCH_SIZE) }, () =>
        context.newPage(),
      ),
    );
    const failures: string[] = [];

    try {
      for (let offset = 0; offset < paths.length; offset += pages.length) {
        const batch = paths.slice(offset, offset + pages.length);
        await Promise.all(
          batch.map(async (path, index) => {
            const auditPage = pages[index];
            const response = await auditPage.goto(path, {
              waitUntil: "domcontentloaded",
            });
            if (!response?.ok()) {
              failures.push(`${response?.status() || "ERR"} ${path}`);
              return;
            }
            await auditPage.evaluate(
              () =>
                new Promise<void>((resolve) =>
                  requestAnimationFrame(() =>
                    requestAnimationFrame(() => resolve()),
                  ),
                ),
            );
            const dimensions = await auditPage.evaluate(() => ({
              viewport: document.documentElement.clientWidth,
              page: document.documentElement.scrollWidth,
            }));
            if (dimensions.page > dimensions.viewport + 1) {
              failures.push(
                `${path}: ${dimensions.page}px > ${dimensions.viewport}px`,
              );
            }
          }),
        );
      }
    } finally {
      await Promise.all(pages.map((auditPage) => auditPage.close()));
    }

    expect(paths.length).toBeGreaterThanOrEqual(550);
    expect(failures).toEqual([]);
  });
});
