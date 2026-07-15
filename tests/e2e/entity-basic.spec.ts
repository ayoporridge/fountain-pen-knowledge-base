import { expect, test } from "@playwright/test";

const EXTERNAL_E2E = Boolean(process.env.E2E_BASE_URL);
const MISSING_ENTITY_SLUG = "e2e-deliberately-unpublished-pen";

function expectNoStore(headers: Record<string, string>) {
  expect(headers["cache-control"] || "").toContain("no-store");
}

test.describe("Entity basic flow", () => {
  test("an unpublished entity route fails closed with a hard 404", async ({
    page,
  }) => {
    const response = await page.goto(`/pen/${MISSING_ENTITY_SLUG}`, {
      waitUntil: "domcontentloaded",
    });

    expect(response?.status()).toBe(404);
    expectNoStore(response?.headers() || {});
    expect(response?.headers()["x-robots-tag"] || "").toContain("noindex");
    expect(page.url()).toContain(`/pen/${MISSING_ENTITY_SLUG}`);
  });

  test("homepage exposes the main curated routes", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: /钢笔图书馆|钢笔知识图谱/ }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /找一支笔/ })).toBeVisible();
    await expect(
      page.getByRole("link", { name: /品牌|历史/ }).first(),
    ).toBeVisible();
  });

  test("dark mode toggle works", async ({ page }) => {
    await page.goto("/");
    const html = page.locator("html");

    // Click the theme toggle button
    await page.getByRole("button", { name: /切换到.*模式/ }).click();

    // After toggling, html should have the dark class
    await expect(html).toHaveAttribute("class", /dark/);
  });

  test("public entity API is no-store and fails closed", async ({
    request,
  }) => {
    const listResponse = await request.get("/api/entities?type=pen");
    expect(listResponse.ok()).toBeTruthy();
    expectNoStore(listResponse.headers());
    const pens = (await listResponse.json()) as Array<{
      name: string;
      slug: string;
      summary: null;
      type: string;
    }>;

    if (!EXTERNAL_E2E) expect(pens).toEqual([]);
    for (const pen of pens) {
      expect(Object.keys(pen).sort()).toEqual([
        "name",
        "slug",
        "summary",
        "type",
      ]);
      expect(pen.type).toBe("pen");
      expect(pen.summary).toBeNull();
    }

    const missingResponse = await request.get(
      `/api/entities/${MISSING_ENTITY_SLUG}`,
      { maxRedirects: 0 },
    );
    expect(missingResponse.status()).toBe(404);
    expectNoStore(missingResponse.headers());
    expect(await missingResponse.json()).toEqual({ error: "Entity not found" });
  });
});
