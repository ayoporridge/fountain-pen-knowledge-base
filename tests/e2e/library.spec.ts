import { expect, test } from "@playwright/test";

const FORBIDDEN_PUBLIC_COPY =
  /待核验|资料补证|研究队列|待拆分|待重分类|当前草稿|待补来源|资料边界|来源边界|Research index|Model archive|Read first|Brand story|Brand room/i;

test.describe("Classification archive", () => {
  test.setTimeout(60_000);

  test("homepage presents the classification archive", async ({ page }) => {
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
    await expect(page.locator('a[href^="/search"]')).toHaveCount(0);
    await expect(page.locator('a[href^="/chat"]')).toHaveCount(0);
    await expect(page.locator('a[href^="/compare"]')).toHaveCount(0);
    await expect(page.locator('a[href^="/by/price"]')).toHaveCount(0);
  });

  test("browse separates content types and exposes only public facets", async ({
    page,
  }) => {
    await page.goto("/browse", { waitUntil: "networkidle" });

    const typeTabs = page.getByTestId("browse-type-tabs");
    for (const label of ["全部", "钢笔", "品牌", "文章", "工艺概念"]) {
      await expect(typeTabs.getByText(label)).toBeVisible();
    }
    for (const retiredFacet of ["价位", "品牌定位", "用途", "风格", "尺寸"]) {
      await expect(page.getByRole("group", { name: retiredFacet })).toHaveCount(
        0,
      );
    }

    await typeTabs.getByRole("tab", { name: "文章" }).click();
    await expect(page).toHaveURL(/type=article/);
    await expect(page.getByRole("heading", { name: "浏览文章" })).toBeVisible();
    await expect(page.locator('a[href^="/article/"]').first()).toBeVisible();
  });

  test("detail navigation matches the source-led page structure", async ({
    page,
  }) => {
    await page.goto("/pen/%E6%B0%B8%E7%94%9F-wingsung-601a", {
      waitUntil: "domcontentloaded",
    });

    const sectionNav = page.getByRole("navigation", { name: "词条章节" });
    for (const label of ["档案", "图谱", "来源"]) {
      await expect(sectionNav.getByRole("link", { name: label })).toBeVisible();
    }
    await expect(sectionNav.getByRole("link", { name: "故事" })).toHaveCount(0);
    await expect(page.getByTestId("entity-summary")).toHaveCount(0);
    expect(await page.locator("body").innerText()).not.toMatch(
      FORBIDDEN_PUBLIC_COPY,
    );
  });

  test("source-backed pen profiles attribute first person to the author", async ({
    page,
  }) => {
    await page.goto("/pen/the-parker-180", {
      waitUntil: "domcontentloaded",
    });

    const sourceMaterial = page.locator("#source-material");
    await expect(
      sourceMaterial.getByRole("heading", { name: "来源资料译文/整理" }),
    ).toBeVisible();
    await expect(sourceMaterial).toContainText(
      "文中的第一人称、使用经历和判断属于原作者，不代表本站实测",
    );
    await expect(
      sourceMaterial.locator(
        'a[href="https://www.richardspens.com/ref/profiles/180.htm"]',
      ),
    ).toBeVisible();
  });

  test("only evidence-backed model specs are public", async ({ page }) => {
    await page.goto("/pen/%E5%87%8C%E7%BE%8E-lamy-lamy-2000", {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByText("规格已核对")).toBeVisible();
    await expect(page.getByRole("heading", { name: "规格速览" })).toBeVisible();
    await expect(page.getByText("价位", { exact: true })).toHaveCount(0);

    await page.goto("/pen/%E4%B8%8A%E6%B5%B7-shanghai-97%E5%9B%9E%E5%BD%92", {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByRole("heading", { name: "规格速览" })).toHaveCount(
      0,
    );
    await expect(page.getByText("规格已核对")).toHaveCount(0);
  });

  test("brand pages contain models, reviewed chronology and sources, not stories", async ({
    page,
  }) => {
    await page.goto("/brand/lamy", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("heading", { name: "代表型号" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "品牌时间线" }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "来源" })).toBeVisible();
    expect(await page.locator("body").innerText()).not.toMatch(
      FORBIDDEN_PUBLIC_COPY,
    );
  });

  test("recommendations never infer a cross-brand series from a generic name", async ({
    page,
  }) => {
    await page.goto("/pen/the-esterbrook-dollar-pen", {
      waitUntil: "domcontentloaded",
    });
    const recommendations = page.getByTestId("recommendations");
    await expect(recommendations).toBeVisible();
    await expect(recommendations).not.toContainText("同属「Dollar Pen」系列");
  });

  test("article body has one page H1 and no import residue", async ({
    page,
  }) => {
    await page.goto("/article/the-esterbrook-model-j-family", {
      waitUntil: "domcontentloaded",
    });

    await expect(page.locator("h1")).toHaveCount(1);
    const body = await page.locator("body").innerText();
    expect(body).not.toMatch(
      /以下是翻译结果|```markdown|\[内容已截断\]|参考资料索引\s*\|\s*钢笔百科/i,
    );
    await expect(page.getByTestId("entity-summary")).toBeVisible();
    const sourceUrls = await page
      .locator("#sources a[href]")
      .evaluateAll((links) => links.map((link) => link.getAttribute("href")));
    expect(new Set(sourceUrls).size).toBe(sourceUrls.length);
  });

  test("library index exposes only current public modules", async ({
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
  });

  test("source and diagram indexes render public-facing labels", async ({
    page,
  }) => {
    await page.goto("/library/sources", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "来源索引" })).toBeVisible();
    await expect(page.getByText("参考来源", { exact: true })).toBeVisible();
    await expect(page.getByText("公开资料检索", { exact: true })).toHaveCount(
      0,
    );
    expect(await page.locator("body").innerText()).not.toMatch(
      /review_status|allowed_use|source_type|research_index/,
    );

    await page.goto("/library/diagrams", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "图示馆" })).toBeVisible();
    await expect(page.getByText("结构与机制图", { exact: true })).toBeVisible();
    await expect(page.locator("figure").first()).toBeVisible();
  });

  test("timeline and exhibits use reader-facing Chinese labels", async ({
    page,
  }) => {
    await page.goto("/timeline", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("资料馆时间线", { exact: true })).toBeVisible();
    await expect(
      page.getByText("Library Timeline", { exact: true }),
    ).toHaveCount(0);

    await page.goto("/exhibits", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("策展阅读", { exact: true })).toBeVisible();
    await expect(page.getByText("Exhibits", { exact: true })).toHaveCount(0);
    await expect(page.getByText("Exhibit", { exact: true })).toHaveCount(0);
  });

  test("public editing and retired anonymous schema APIs are unavailable", async ({
    request,
  }) => {
    expect((await request.get("/new")).status()).toBe(404);
    expect((await request.get("/brand/pilot/edit")).status()).toBe(404);
    for (const endpoint of [
      "/api/tags",
      "/api/concepts",
      "/api/entities/pilot-custom-823/tags",
    ]) {
      expect((await request.get(endpoint)).status()).toBe(410);
    }

    const writes = await Promise.all([
      request.post("/api/entities", {
        data: { type: "brand", slug: "blocked-test", name: "Blocked Test" },
      }),
      request.put("/api/entities/pilot", { data: { name: "Pilot" } }),
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
    for (const response of writes) {
      expect(response.status()).toBe(403);
    }
  });

  test("retired search, chat, compare and subjective dimension routes resolve deterministically", async ({
    page,
    request,
  }) => {
    await page.goto("/search?q=823");
    await expect(page).toHaveURL(/\/browse$/);
    await page.goto("/chat");
    await expect(page).toHaveURL(/\/library$/);
    await page.goto("/compare?items=pilot-custom-823");
    await expect(page).toHaveURL(/\/browse\?type=pen$/);

    for (const dimension of ["price", "usage", "size", "style", "era"]) {
      expect((await request.get(`/by/${dimension}`)).status()).toBe(404);
    }
  });
});
