import { expect, test } from "@playwright/test";

test.describe("Entity basic flow", () => {
  test("seed entity page renders correctly", async ({ page }) => {
    await page.goto("/pen/pilot-custom-823");

    // Verify entity name
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Custom 823",
    );

    // Verify the page identifies the entry as a pen archive.
    await expect(page.getByText(/型号档案|钢笔/).first()).toBeVisible();

    // Verify the approved specification block contains core pen details.
    await expect(page.getByText("已核规格")).toBeVisible();
    await expect(page.getByText("笔尖", { exact: true }).first()).toBeVisible();
    await expect(
      page.getByText("上墨方式", { exact: true }).first(),
    ).toBeVisible();
    await expect(page.getByText("产地", { exact: true }).first()).toBeVisible();
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

  test("public entity API returns a known pen without mutating data", async ({
    request,
  }) => {
    const response = await request.get("/api/entities/pilot-custom-823");

    expect(response.ok()).toBeTruthy();
    const entity = await response.json();
    expect(entity.name).toContain("823");
    expect(entity.slug).toBe("pilot-custom-823");
  });
});
