import {
  type APIResponse,
  expect,
  type Locator,
  type Page,
  test,
} from "@playwright/test";
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

const SITE_ORIGIN = "https://fountain-pen-graph.vercel.app";
const PUBLIC_CONCEPT_SLUGS = [
  "vacuum-filler",
  "eyedropper-filler",
  "hooded-nib",
  "open-nib",
  "semi-hooded-nib",
  "gold-nib",
  "steel-nib",
  "titanium-nib",
  "iridium-nib",
] as const;
const STATIC_SITEMAP_PATHS = [
  "/",
  "/library",
  "/library/sources",
  "/library/diagrams",
  "/browse",
  "/timeline",
  "/exhibits",
  "/graph",
  "/by/brand",
  "/by/nib",
  "/by/origin",
  "/by/fill",
  "/by/material",
] as const;
const EXPECTED_SITEMAP_PATHS = [
  ...STATIC_SITEMAP_PATHS,
  ...PUBLIC_CONCEPT_SLUGS.map((slug) => `/concept/${slug}`),
];
const PUBLIC_ENTITY_KEYS = ["name", "slug", "summary", "type"];
const PUBLIC_BROWSE_KEYS = [
  "classification",
  "image_url",
  "name",
  "slug",
  "source_count",
  "summary",
  "type",
];
const FULL_AUDIT_TIMEOUT = 180_000;
const AUDIT_BATCH_SIZE = 6;

function desktopOnly(projectName: string) {
  return projectName === "desktop";
}

function mobileOnly(projectName: string) {
  return projectName === "mobile";
}

function sorted(values: Iterable<string>) {
  return [...values].sort((left, right) => left.localeCompare(right));
}

function sitemapPaths(xml: string) {
  return sorted(
    [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => {
      const url = new URL(match[1]);
      expect(url.origin).toBe(SITE_ORIGIN);
      return `${url.pathname}${url.search}`;
    }),
  );
}

function expectNoStore(response: APIResponse) {
  expect(response.headers()["cache-control"] || "").toMatch(/\bno-store\b/i);
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
    ) {
      continue;
    }
    try {
      const url = new URL(href, SITE_ORIGIN);
      if (url.origin !== SITE_ORIGIN) continue;
      paths.add(`${url.pathname}${url.search}`);
    } catch {
      // The resolver audit below reports valid internal links only.
    }
  }
  return paths;
}

async function openHydratedDialog(
  page: Page,
  trigger: Locator,
  dialog: Locator,
) {
  await page.waitForLoadState("networkidle");
  await expect(trigger).toBeVisible();
  await trigger.click();
  await expect(dialog).toBeVisible();
}

test.describe("site quality contract", () => {
  test.setTimeout(FULL_AUDIT_TIMEOUT);

  test("homepage classification shortcuts have deterministic destinations", async ({
    page,
  }, testInfo) => {
    if (!desktopOnly(testInfo.project.name)) return;

    await page.goto("/", { waitUntil: "domcontentloaded" });
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

  test("public release keeps classification and retires search and AI", async ({
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

    await page.goto("/search?q=gold-nib");
    await expect(page).toHaveURL(/\/browse$/);
    await page.goto("/chat");
    await expect(page).toHaveURL(/\/library$/);
    await page.goto("/compare?items=gold-nib");
    await expect(page).toHaveURL(/\/browse\?type=pen$/);

    expect((await request.get("/api/search?q=gold-nib")).status()).toBe(404);
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

  test("entity and browse APIs expose the exact disposable-fixture set", async ({
    request,
  }, testInfo) => {
    if (!desktopOnly(testInfo.project.name)) return;

    for (const path of ["/api/entities", "/api/entities?type=concept"]) {
      const response = await request.get(path);
      expect(response.ok()).toBeTruthy();
      expectNoStore(response);
      const entities = (await response.json()) as Array<
        Record<string, unknown> & { slug: string; type: string }
      >;
      expect(sorted(entities.map((entity) => entity.slug))).toEqual(
        sorted(PUBLIC_CONCEPT_SLUGS),
      );
      for (const entity of entities) {
        expect(entity.type).toBe("concept");
        expect(Object.keys(entity).sort()).toEqual(PUBLIC_ENTITY_KEYS);
      }
    }

    for (const type of ["pen", "brand", "article"]) {
      const response = await request.get(`/api/entities?type=${type}`);
      expect(response.ok()).toBeTruthy();
      expectNoStore(response);
      expect(await response.json()).toEqual([]);
    }

    for (const slug of PUBLIC_CONCEPT_SLUGS) {
      const response = await request.get(`/api/entities/${slug}`);
      expect(response.ok()).toBeTruthy();
      expectNoStore(response);
      const entity = (await response.json()) as Record<string, unknown> & {
        slug: string;
        type: string;
      };
      expect(Object.keys(entity).sort()).toEqual(PUBLIC_ENTITY_KEYS);
      expect(entity).toMatchObject({ slug, type: "concept" });

      const preview = await request.get(`/api/entities/${slug}/preview`);
      expect(preview.ok()).toBeTruthy();
      expectNoStore(preview);
      expect(await preview.json()).toMatchObject({ slug, type: "concept" });
    }

    for (const path of [
      "/api/browse?limit=50",
      "/api/browse?type=knowledge&limit=50",
    ]) {
      const response = await request.get(path);
      expect(response.ok()).toBeTruthy();
      expectNoStore(response);
      const payload = (await response.json()) as {
        activeType: string;
        entities: Array<
          Record<string, unknown> & { slug: string; type: string }
        >;
        total: number;
        typeCounts: Array<{ type: string; cnt: number }>;
      };
      expect(payload.total).toBe(PUBLIC_CONCEPT_SLUGS.length);
      expect(sorted(payload.entities.map((entity) => entity.slug))).toEqual(
        sorted(PUBLIC_CONCEPT_SLUGS),
      );
      expect(payload.typeCounts).toEqual([
        { type: "concept", cnt: PUBLIC_CONCEPT_SLUGS.length },
      ]);
      for (const entity of payload.entities) {
        expect(entity.type).toBe("concept");
        expect(Object.keys(entity).sort()).toEqual(PUBLIC_BROWSE_KEYS);
      }
    }

    const emptyPens = await request.get("/api/browse?type=pen&limit=50");
    expect(emptyPens.ok()).toBeTruthy();
    expectNoStore(emptyPens);
    expect(await emptyPens.json()).toMatchObject({ entities: [], total: 0 });
  });

  test("browse server output contains every and only public fixture entity", async ({
    page,
  }, testInfo) => {
    if (!desktopOnly(testInfo.project.name)) return;

    const response = await page.goto("/browse?type=knowledge", {
      waitUntil: "domcontentloaded",
    });
    expect(response?.ok()).toBeTruthy();
    await expect(
      page.getByText(`共 ${PUBLIC_CONCEPT_SLUGS.length} 个词条`),
    ).toBeVisible();
    const hrefs = await page
      .locator('main a[href^="/concept/"]')
      .evaluateAll((anchors) =>
        anchors.map((anchor) => anchor.getAttribute("href") || ""),
      );
    expect(sorted(new Set(hrefs))).toEqual(
      sorted(PUBLIC_CONCEPT_SLUGS.map((slug) => `/concept/${slug}`)),
    );
    await expect(page.getByRole("button", { name: /加载更多/ })).toHaveCount(0);
    await expectNoHorizontalOverflow(page);
  });

  test("sitemap, canonical metadata and robots share one exact contract", async ({
    page,
    request,
  }, testInfo) => {
    if (!desktopOnly(testInfo.project.name)) return;

    const sitemapResponse = await request.get("/sitemap.xml");
    expect(sitemapResponse.ok()).toBeTruthy();
    const paths = sitemapPaths(await sitemapResponse.text());
    expect(paths).toEqual(sorted(EXPECTED_SITEMAP_PATHS));

    for (const path of paths) {
      const response = await page.goto(path, { waitUntil: "domcontentloaded" });
      expect(response?.ok()).toBeTruthy();
      expect(await getCanonical(page)).toBe(
        `${SITE_ORIGIN}${path === "/" ? "" : path}`,
      );
    }

    await page.goto("/");
    const websiteJsonLd = await page
      .locator('script[type="application/ld+json"]')
      .evaluateAll((scripts) =>
        scripts.map((script) => script.textContent || "").join("\n"),
      );
    expect(websiteJsonLd).toContain("WebSite");
    expect(websiteJsonLd).not.toContain("SearchAction");
    expect(websiteJsonLd).not.toContain("/search?q=");

    const robots = await (await request.get("/robots.txt")).text();
    for (const disallowed of ["/api/", "/admin/", "/new"]) {
      expect(robots).toContain(`Disallow: ${disallowed}`);
    }
    expect(robots).toContain(`Sitemap: ${SITE_ORIGIN}/sitemap.xml`);
  });

  test("every sitemap page resolves and hides editorial state", async ({
    request,
  }, testInfo) => {
    if (!desktopOnly(testInfo.project.name)) return;

    const paths = sitemapPaths(
      await (await request.get("/sitemap.xml")).text(),
    );
    expect(paths).toEqual(sorted(EXPECTED_SITEMAP_PATHS));
    const forbidden = [
      /identity pending/i,
      /待映射|待核验|需核验|待审核|未审核|资料核验中|研究队列|当前草稿|当前档案|待补证/,
      /\b(?:review_status|usage_status|asset_type|source_type|item_type|story_type|coverage_status)\b/,
      /\b(?:nib_material|body_material|fill_system|design_keywords|signature_technology)\b/,
      /\b(?:official_site|research_index|richardspens_profile|secondary_profile|penhero_profile)\b/,
      /\b(?:needs_source|needs_review|site-original)\b/,
    ];
    const failures: string[] = [];

    for (let offset = 0; offset < paths.length; offset += AUDIT_BATCH_SIZE) {
      await Promise.all(
        paths.slice(offset, offset + AUDIT_BATCH_SIZE).map(async (path) => {
          const response = await request.get(path);
          if (!response.ok()) {
            failures.push(`${response.status()} ${path}`);
            return;
          }
          const html = await response.text();
          if (!/<h1\b/i.test(html)) failures.push(`missing h1 ${path}`);
          const text = visibleTextFromHtml(html);
          for (const pattern of forbidden) {
            const match = text.match(pattern);
            if (match) failures.push(`${path}: ${match[0]}`);
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

    const paths = sitemapPaths(
      await (await request.get("/sitemap.xml")).text(),
    );
    expect(paths).toEqual(sorted(EXPECTED_SITEMAP_PATHS));
    const targets = new Set(paths);
    const sources = new Map<string, Set<string>>(
      paths.map((path) => [path, new Set(["sitemap"])]),
    );
    const failures: string[] = [];

    for (let offset = 0; offset < paths.length; offset += AUDIT_BATCH_SIZE) {
      await Promise.all(
        paths.slice(offset, offset + AUDIT_BATCH_SIZE).map(async (path) => {
          const response = await request.get(path);
          if (!response.ok()) {
            failures.push(`${response.status()} ${path}`);
            return;
          }
          for (const target of internalAnchorPaths(await response.text())) {
            targets.add(target);
            if (!sources.has(target)) sources.set(target, new Set());
            sources.get(target)?.add(path);
          }
        }),
      );
    }

    const allTargets = sorted(targets);
    for (
      let offset = 0;
      offset < allTargets.length;
      offset += AUDIT_BATCH_SIZE
    ) {
      await Promise.all(
        allTargets
          .slice(offset, offset + AUDIT_BATCH_SIZE)
          .map(async (path) => {
            const response = await request.get(path);
            if (!response.ok()) {
              failures.push(
                `${response.status()} ${path} from ${[
                  ...(sources.get(path) || []),
                ].join(", ")}`,
              );
              return;
            }
            if (
              !(response.headers()["content-type"] || "").includes("text/html")
            ) {
              return;
            }
            if (!/<h1\b/i.test(await response.text())) {
              failures.push(
                `200 shell ${path} from ${[...(sources.get(path) || [])].join(
                  ", ",
                )}`,
              );
            }
          }),
      );
    }

    expect(failures).toEqual([]);
  });

  test("image proxy rejects unknown and untrusted inputs without caching", async ({
    request,
  }, testInfo) => {
    if (!desktopOnly(testInfo.project.name)) return;

    const unknown = await request.get("/api/image-proxy?id=unknown-media-id");
    expect(unknown.status()).toBe(404);
    expectNoStore(unknown);

    for (const url of [
      "https://example.com/image.jpg",
      "https://127.0.0.1/image.jpg",
    ]) {
      const response = await request.get(
        `/api/image-proxy?url=${encodeURIComponent(url)}`,
      );
      expect(response.status()).toBe(403);
      expectNoStore(response);
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
      const count = Number(target.url.searchParams.get("hop") || "0") + 1;
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

  test("fixture journeys have no browser errors or broken images", async ({
    page,
  }, testInfo) => {
    if (!desktopOnly(testInfo.project.name)) return;

    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });

    for (const route of [
      "/",
      "/browse?type=knowledge",
      "/concept/gold-nib",
      "/graph",
    ]) {
      const response = await page.goto(route, { waitUntil: "networkidle" });
      expect(response?.status()).toBeLessThan(400);
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
    }
    expect(errors).toEqual([]);
  });

  test("mobile navigation and filter dialogs trap and restore focus", async ({
    page,
  }, testInfo) => {
    if (!mobileOnly(testInfo.project.name)) return;

    await page.goto("/", { waitUntil: "domcontentloaded" });
    const menuTrigger = page.getByRole("button", { name: "打开导航" });
    const menu = page.getByRole("dialog", { name: "导航" });
    await openHydratedDialog(page, menuTrigger, menu);
    await expect(menu.getByRole("heading", { name: "导航" })).toHaveCount(1);
    await expect(menu.getByRole("button", { name: "关闭导航" })).toHaveCount(1);
    await expect(menu.locator('a[href^="/search"]')).toHaveCount(0);
    await expect(menu.locator('a[href^="/chat"]')).toHaveCount(0);
    for (const name of ["分类浏览", "品牌", "笔尖类型", "上墨方式"]) {
      await expect(menu.getByRole("link", { name, exact: true })).toBeVisible();
    }

    const navigationIsolation = await page.evaluate(() => {
      const dialog = document.querySelector<HTMLElement>(
        '#mobile-navigation-dialog[role="dialog"]',
      );
      const trigger = document.querySelector<HTMLElement>(
        'button[aria-label="打开导航"]',
      );
      const outsideFocusable = Array.from(
        document.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [contenteditable="true"], [tabindex]',
        ),
      )
        .filter((element) => !dialog?.contains(element))
        .filter((element) => {
          const style = getComputedStyle(element);
          return (
            style.display !== "none" &&
            style.visibility !== "hidden" &&
            element.getClientRects().length > 0 &&
            element.tabIndex >= 0 &&
            !element.closest("[inert]") &&
            !element.closest('[aria-hidden="true"]')
          );
        });
      return {
        outsideCount: outsideFocusable.length,
        trigger: trigger
          ? {
              inert: trigger.inert,
              ariaHidden: trigger.getAttribute("aria-hidden"),
              tabIndex: trigger.tabIndex,
            }
          : null,
      };
    });
    expect(navigationIsolation.outsideCount).toBe(0);
    expect(navigationIsolation.trigger).toEqual({
      inert: true,
      ariaHidden: "true",
      tabIndex: -1,
    });

    for (let index = 0; index < 12; index += 1) {
      await page.keyboard.press("Tab");
    }
    expect(
      await page.evaluate(() =>
        Boolean(document.activeElement?.closest('[role="dialog"]')),
      ),
    ).toBeTruthy();
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(menuTrigger).toBeFocused();

    await page.goto("/browse?type=knowledge", {
      waitUntil: "domcontentloaded",
    });
    const filterTrigger = page.getByRole("button", { name: "筛选" });
    const filter = page.getByRole("dialog", { name: "筛选" });
    await openHydratedDialog(page, filterTrigger, filter);
    await expect(filter.getByRole("heading", { name: "筛选" })).toHaveCount(1);
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

  test("focus indication, reduced motion and fixture layouts remain usable", async ({
    page,
  }, testInfo) => {
    if (!mobileOnly(testInfo.project.name)) return;

    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const route of [
      "/",
      "/browse?type=knowledge",
      "/concept/gold-nib",
      "/graph",
    ]) {
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

  test("every exact sitemap page fits the mobile viewport", async ({
    context,
    request,
  }, testInfo) => {
    if (!mobileOnly(testInfo.project.name)) return;

    const paths = sitemapPaths(
      await (await request.get("/sitemap.xml")).text(),
    );
    expect(paths).toEqual(sorted(EXPECTED_SITEMAP_PATHS));
    const pages = await Promise.all(
      Array.from({ length: AUDIT_BATCH_SIZE }, () => context.newPage()),
    );
    const failures: string[] = [];

    try {
      for (let offset = 0; offset < paths.length; offset += pages.length) {
        await Promise.all(
          paths
            .slice(offset, offset + pages.length)
            .map(async (path, index) => {
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

    expect(failures).toEqual([]);
  });
});
