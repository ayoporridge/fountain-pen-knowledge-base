import { type APIResponse, expect, test } from "@playwright/test";

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
const HIDDEN_CONCEPT_SLUGS = [
  "italic-nib",
  "music-nib",
  "rotary-filler",
] as const;
const PUBLIC_ENTITY_KEYS = ["name", "slug", "summary", "type"];

function sorted(values: Iterable<string>) {
  return [...values].sort((left, right) => left.localeCompare(right));
}

function expectNoStore(response: APIResponse) {
  expect(response.headers()["cache-control"] || "").toMatch(/\bno-store\b/i);
}

function conceptSlugsFromSitemap(xml: string) {
  const slugs: string[] = [];
  for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const url = new URL(match[1]);
    expect(url.origin).toBe(SITE_ORIGIN);
    const concept = url.pathname.match(/^\/concept\/([^/]+)$/);
    if (concept) slugs.push(decodeURIComponent(concept[1]));
  }
  return sorted(slugs);
}

test.describe("Public concept contract", () => {
  test("public APIs and sitemap expose exactly the reviewed concept set", async ({
    page,
    request,
  }) => {
    const entitiesResponse = await request.get("/api/entities?type=concept");
    expect(entitiesResponse.ok()).toBeTruthy();
    expectNoStore(entitiesResponse);
    const entities = (await entitiesResponse.json()) as Array<
      Record<string, unknown> & {
        name: string;
        slug: string;
        summary: string | null;
        type: string;
      }
    >;
    expect(sorted(entities.map((entity) => entity.slug))).toEqual(
      sorted(PUBLIC_CONCEPT_SLUGS),
    );
    for (const entity of entities) {
      expect(Object.keys(entity).sort()).toEqual(PUBLIC_ENTITY_KEYS);
      expect(entity.type).toBe("concept");
      expect(entity.name.trim()).not.toBe("");
      expect(entity.summary?.trim()).not.toBe("");
    }

    const browseResponse = await request.get(
      "/api/browse?type=knowledge&limit=50",
    );
    expect(browseResponse.ok()).toBeTruthy();
    expectNoStore(browseResponse);
    const browse = (await browseResponse.json()) as {
      activeType: string;
      entities: Array<{ slug: string; type: string }>;
      total: number;
      typeCounts: Array<{ type: string; cnt: number }>;
    };
    expect(browse.activeType).toBe("knowledge");
    expect(browse.total).toBe(PUBLIC_CONCEPT_SLUGS.length);
    expect(sorted(browse.entities.map((entity) => entity.slug))).toEqual(
      sorted(PUBLIC_CONCEPT_SLUGS),
    );
    expect(browse.entities.every((entity) => entity.type === "concept")).toBe(
      true,
    );
    expect(browse.typeCounts).toEqual([
      { type: "concept", cnt: PUBLIC_CONCEPT_SLUGS.length },
    ]);

    const sitemapResponse = await request.get("/sitemap.xml");
    expect(sitemapResponse.ok()).toBeTruthy();
    expect(conceptSlugsFromSitemap(await sitemapResponse.text())).toEqual(
      sorted(PUBLIC_CONCEPT_SLUGS),
    );

    for (const slug of PUBLIC_CONCEPT_SLUGS) {
      const detailResponse = await request.get(`/api/entities/${slug}`);
      expect(detailResponse.ok()).toBeTruthy();
      expectNoStore(detailResponse);
      expect(await detailResponse.json()).toMatchObject({
        slug,
        type: "concept",
      });

      const pageResponse = await page.goto(`/concept/${slug}`, {
        waitUntil: "domcontentloaded",
      });
      expect(pageResponse?.ok()).toBeTruthy();
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        `${SITE_ORIGIN}/concept/${slug}`,
      );
    }
  });

  test("internal concept and tag schemas are retired from anonymous GET", async ({
    request,
  }) => {
    for (const path of [
      "/api/concepts",
      "/api/tags?level=atom",
      "/api/entities/gold-nib/tags",
    ]) {
      const response = await request.get(path);
      expect(response.status()).toBe(410);
      const payload = await response.json();
      expect(Object.keys(payload)).toEqual(["error"]);
      expect(JSON.stringify(payload)).not.toMatch(
        /\b(?:id|slug|dimension|conditions)\b/,
      );
    }
  });

  test("unreliable concept drafts are absent from pages, APIs and sitemap", async ({
    request,
  }) => {
    const sitemap = await (await request.get("/sitemap.xml")).text();
    const publicSlugs = conceptSlugsFromSitemap(sitemap);

    for (const slug of HIDDEN_CONCEPT_SLUGS) {
      expect(publicSlugs).not.toContain(slug);

      const pageResponse = await request.get(`/concept/${slug}`);
      expect(pageResponse.status()).toBe(404);

      const entityResponse = await request.get(`/api/entities/${slug}`);
      expect(entityResponse.status()).toBe(404);
      expectNoStore(entityResponse);
    }
  });

  test("concept pages render classification as natural Chinese prose", async ({
    page,
  }) => {
    for (const contract of [
      {
        slug: "gold-nib",
        heading: "金尖",
        summary: /笔尖主体使用金合金/,
        body: /金尖的主体由金合金制成/,
      },
      {
        slug: "vacuum-filler",
        heading: "真空上墨",
        summary: /柱塞.*墨水.*笔杆墨仓/,
        body: /真空上墨通常使用.*柱塞杆/,
      },
    ]) {
      const response = await page.goto(`/concept/${contract.slug}`, {
        waitUntil: "domcontentloaded",
      });
      expect(response?.ok()).toBeTruthy();
      await expect(page.getByRole("heading", { level: 1 })).toContainText(
        contract.heading,
      );
      await expect(page.getByTestId("entity-summary")).toContainText(
        contract.summary,
      );
      await expect(page.locator("main")).toContainText(contract.body);
      await expect(
        page.getByText("概念", { exact: true }).first(),
      ).toBeVisible();
      await expect(page.locator("main")).not.toContainText(
        /nib_material|fill_system|tag_slug|conditions/,
      );
    }
  });
});
