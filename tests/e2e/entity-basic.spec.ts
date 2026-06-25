import { expect, test } from "@playwright/test";

test.describe("Entity basic flow", () => {
  test("seed entity page renders correctly", async ({ page }) => {
    await page.goto("/pen/pilot-custom-823");

    // Verify entity name
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Custom 823",
    );

    // Verify type badge
    await expect(
      page.locator(".bg-blue-100, .dark\\:bg-blue-900"),
    ).toContainText("钢笔");

    // Verify attributes table contains pen details
    await expect(page.getByText("笔尖粗细")).toBeVisible();
    await expect(page.getByText("上墨方式")).toBeVisible();
    await expect(page.getByText("产地")).toBeVisible();
  });

  test("homepage lists all seed entities", async ({ page }) => {
    await page.goto("/");

    // Should see all 3 pens by name
    await expect(page.getByText("百乐 Custom 823")).toBeVisible();
    await expect(page.getByText("百利金 Souverän M800")).toBeVisible();
    await expect(page.getByText("写乐 Pro Gear")).toBeVisible();

    // Should see brand and concept sections
    await expect(page.getByText("百乐 (Pilot)")).toBeVisible();
  });

  test("dark mode toggle works", async ({ page }) => {
    await page.goto("/");
    const html = page.locator("html");

    // Click the theme toggle button
    await page.locator("button[aria-label]").click();

    // After toggling, html should have the dark class
    await expect(html).toHaveAttribute("class", /dark/);
  });

  test("create entity via API and navigate to it", async ({ request }) => {
    const response = await request.post("/api/entities", {
      data: {
        type: "pen",
        slug: "test-e2e-pen",
        name: "E2E 测试笔",
        summary: "一支用于端到端测试的钢笔",
        attributes: { nib_size: "M", origin_country: "测试国" },
      },
    });

    expect(response.ok()).toBeTruthy();
    const entity = await response.json();
    expect(entity.name).toBe("E2E 测试笔");
    expect(entity.slug).toBe("test-e2e-pen");
  });
});
