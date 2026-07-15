import { type APIResponse, expect, test } from "@playwright/test";

const PUBLIC_CONCEPT_SLUGS = [
  "eyedropper-filler",
  "gold-nib",
  "hooded-nib",
  "iridium-nib",
  "open-nib",
  "semi-hooded-nib",
  "steel-nib",
  "titanium-nib",
  "vacuum-filler",
] as const;

const HIDDEN_CONCEPT_SLUGS = [
  "italic-nib",
  "music-nib",
  "rotary-filler",
] as const;

const FORBIDDEN_PUBLIC_COPY =
  /待核验|资料补证|研究队列|待拆分|待重分类|当前草稿|待补来源|资料边界|来源边界|Research index|Model archive|Read first|Brand story|Brand room/i;

function expectNoStore(response: APIResponse) {
  expect(response.headers()["cache-control"] || "").toContain("no-store");
}

test.describe("Classification archive publication fixture", () => {
  test.setTimeout(60_000);

  test("homepage presents classification navigation without search or AI", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await expect(
      page.getByRole("heading", { name: "钢笔知识图谱" }),
    ).toBeVisible();
    await expect(page.getByText("一座可追溯的钢笔资料馆")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "从这里开始" }),
    ).toBeVisible();

    for (const task of ["找一支笔", "品牌与历史", "工艺实验室", "关系图谱"]) {
      await expect(
        page.getByRole("link", { name: new RegExp(task) }).first(),
      ).toBeVisible();
    }
    for (const retiredPath of ["/search", "/chat", "/compare", "/by/price"]) {
      await expect(page.locator(`a[href^="${retiredPath}"]`)).toHaveCount(0);
    }
  });

  test("fresh fixture exposes one exact, no-store public entity set", async ({
    request,
  }) => {
    const allResponse = await request.get("/api/entities");
    expect(allResponse.ok()).toBeTruthy();
    expectNoStore(allResponse);
    const all = (await allResponse.json()) as Array<{
      type: string;
      slug: string;
      name: string;
      summary: string | null;
    }>;
    expect(all.map((entity) => entity.slug).sort()).toEqual([
      ...PUBLIC_CONCEPT_SLUGS,
    ]);
    expect(new Set(all.map((entity) => entity.type))).toEqual(
      new Set(["concept"]),
    );

    for (const type of ["brand", "pen", "article"]) {
      const response = await request.get(`/api/entities?type=${type}`);
      expect(response.ok()).toBeTruthy();
      expectNoStore(response);
      expect(await response.json()).toEqual([]);
    }

    for (const slug of HIDDEN_CONCEPT_SLUGS) {
      const response = await request.get(`/api/entities/${slug}`);
      expect(response.status()).toBe(404);
      expectNoStore(response);
    }
  });

  test("browse uses exact fixture results and public facets only", async ({
    page,
    request,
  }) => {
    const response = await request.get("/api/browse?type=knowledge");
    expect(response.ok()).toBeTruthy();
    expectNoStore(response);
    const payload = (await response.json()) as {
      total: number;
      entities: Array<{ type: string; slug: string }>;
    };
    expect(payload.total).toBe(PUBLIC_CONCEPT_SLUGS.length);
    expect(payload.entities.map((entity) => entity.slug).sort()).toEqual([
      ...PUBLIC_CONCEPT_SLUGS,
    ]);
    expect(payload.entities.every((entity) => entity.type === "concept")).toBe(
      true,
    );

    await page.goto("/browse", { waitUntil: "domcontentloaded" });
    const typeTabs = page.getByTestId("browse-type-tabs");
    for (const label of ["全部", "钢笔", "品牌", "文章", "工艺概念"]) {
      await expect(typeTabs.getByText(label)).toBeVisible();
    }
    for (const retiredFacet of ["价位", "品牌定位", "用途", "风格", "尺寸"]) {
      await expect(page.getByRole("group", { name: retiredFacet })).toHaveCount(
        0,
      );
    }

    await typeTabs.getByRole("tab", { name: "工艺概念" }).click();
    await expect(page).toHaveURL(/type=knowledge/);
    await expect(
      page.getByRole("heading", { name: "浏览工艺概念" }),
    ).toBeVisible();
    const hrefs = await page
      .locator('main a[href^="/concept/"]')
      .evaluateAll((links) =>
        links.map((link) => link.getAttribute("href") || "").sort(),
      );
    expect([...new Set(hrefs)]).toEqual(
      PUBLIC_CONCEPT_SLUGS.map((slug) => `/concept/${slug}`).sort(),
    );
  });

  test("every public concept detail is concrete and reader-facing", async ({
    page,
  }) => {
    for (const slug of PUBLIC_CONCEPT_SLUGS) {
      const response = await page.goto(`/concept/${slug}`, {
        waitUntil: "domcontentloaded",
      });
      expect(response?.status(), slug).toBe(200);
      await expect(page.locator("h1"), slug).toHaveCount(1);
      await expect(page.getByTestId("entity-summary"), slug).toBeVisible();
      const text = await page.locator("body").innerText();
      expect(text, slug).not.toMatch(FORBIDDEN_PUBLIC_COPY);
      expect(text.length, slug).toBeGreaterThan(200);
    }
  });

  test("library modules render useful empty states without exposing editorial rows", async ({
    page,
  }) => {
    await page.goto("/library", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("library-hero")).toHaveCSS(
      "background-image",
      /warm-pen-atlas\/library-hero\.jpg/,
    );
    for (const moduleName of [
      "品牌馆",
      "型号档案",
      "工艺实验室",
      "历史展览",
      "来源索引",
    ]) {
      await expect(
        page.getByRole("link", { name: new RegExp(moduleName) }).first(),
      ).toBeVisible();
    }
    for (const retired of ["媒体候选池", "覆盖审计", "故事"]) {
      await expect(page.getByText(retired, { exact: true })).toHaveCount(0);
    }

    for (const [route, heading, kicker] of [
      ["/library/sources", "来源索引", "参考来源"],
      ["/library/diagrams", "图示馆", "结构与机制图"],
      ["/timeline", "历史时间线", "资料馆时间线"],
      ["/exhibits", "历史展览", "策展阅读"],
    ] as const) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await expect(page.getByRole("heading", { name: heading })).toBeVisible();
      await expect(page.getByText(kicker, { exact: true })).toBeVisible();
      expect(await page.locator("body").innerText()).not.toMatch(
        /review_status|allowed_use|source_type|research_index|publication_draft/i,
      );
    }
  });

  test("public editing and retired anonymous schema APIs stay unavailable", async ({
    request,
  }) => {
    expect((await request.get("/new")).status()).toBe(404);
    expect((await request.get("/concept/gold-nib/edit")).status()).toBe(404);
    for (const endpoint of [
      "/api/tags",
      "/api/concepts",
      "/api/entities/gold-nib/tags",
    ]) {
      expect((await request.get(endpoint)).status()).toBe(410);
    }

    const writes = await Promise.all([
      request.post("/api/entities", {
        data: { type: "brand", slug: "blocked-test", name: "Blocked Test" },
      }),
      request.put("/api/entities/gold-nib", { data: { name: "Blocked" } }),
      request.post("/api/tags", {
        data: { name: "Blocked", slug: "blocked", dimension: "test" },
      }),
      request.post("/api/links", {
        data: { source_id: "a", target_id: "b" },
      }),
      request.post("/api/concepts", {
        data: { name: "Blocked", slug: "blocked", conditions: [] },
      }),
      request.post("/api/upload", {
        multipart: {
          file: {
            name: "blocked.png",
            mimeType: "image/png",
            buffer: Buffer.from("not an image"),
          },
        },
      }),
    ]);
    for (const response of writes) expect(response.status()).toBe(403);
  });

  test("retired search, chat, compare and subjective dimensions resolve deterministically", async ({
    page,
    request,
  }) => {
    await page.goto("/search?q=gold");
    await expect(page).toHaveURL(/\/browse$/);
    await page.goto("/chat");
    await expect(page).toHaveURL(/\/library$/);
    await page.goto("/compare?items=gold-nib");
    await expect(page).toHaveURL(/\/browse\?type=pen$/);

    for (const dimension of ["price", "usage", "size", "style", "era"]) {
      expect((await request.get(`/by/${dimension}`)).status()).toBe(404);
    }
  });
});
