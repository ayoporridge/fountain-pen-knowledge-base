import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createClient, type Client } from "@libsql/client";
import { expect, type Locator, test } from "@playwright/test";
import {
  publishEntity,
  recordEntityContentReview,
} from "../../src/lib/publication";

const BRAND_NAME = "Renderer 测试品牌";
const MODEL_NAME = "Renderer 型号 01";
const BRAND_SUMMARY =
  "这是一个只用于 Renderer 合同测试的完整品牌摘要，覆盖历史脉络、产品谱系与资料边界，并以独立来源和明确归属验证公开页面只读取当前发布快照。";
const MODEL_SUMMARY =
  "这是一个只用于 Renderer 合同测试的完整型号摘要，概括产品定位、结构设计、书写体验与购买检查，并以字段证据和来源定位验证页面不会回退到旧正文。";
const TOPIC_SENTINELS = [
  "型号身份与产品线哨兵：Renderer One 属于测试品牌的核心产品线。",
  "历史沿革哨兵：该型号的演进节点由独立档案逐项记录。",
  "设计尺寸材质人体工学哨兵：尺寸、材质与握持重心均在本段完整说明。",
  "笔尖哨兵：十四金中尖的结构与调校边界在这里单独说明。",
  "署名书写体验哨兵：测试作者记录了纸面反馈与出墨节奏。",
  "上墨维护哨兵：活塞上墨、清洗周期与日常维护步骤保持完整。",
  "版本边界哨兵：地区版本、年份差异与适用范围不得混写。",
  "购买检查哨兵：购买前应核对笔尖、活塞、裂纹与来源凭据。",
] as const;
const FORBIDDEN = [
  "LEGACY_BODY_SENTINEL_RENDERER",
  "DEPRECATED_STORY_SENTINEL_RENDERER",
  "WRONG_TYPE_STORY_SENTINEL_RENDERER",
  "UNQUALIFIED_SPEC_SENTINEL_RENDERER",
  "UNQUALIFIED_VARIANT_SENTINEL_RENDERER",
  "UNQUALIFIED_SOURCE_SENTINEL_RENDERER",
  "UNQUALIFIED_TIMELINE_SENTINEL_RENDERER",
  "GALLERY_MEDIA_SENTINEL_RENDERER",
  "REMOTE_MEDIA_SENTINEL_RENDERER",
  "MISSING_ATTRIBUTION_MEDIA_SENTINEL_RENDERER",
] as const;

type AssetEvidence = {
  entityId: string;
  name: string;
  imageUrl: string;
  sha256: string;
  attribution: string;
  license: string;
  sourceUrl: string;
};

type AssetManifest = { brand: AssetEvidence; model: AssetEvidence };

const evidenceDir = process.env.RENDERER_EVIDENCE_DIR;
const baseUrl = process.env.E2E_BASE_URL?.replace(/\/$/, "");
const databaseUrl = process.env.FPKG_DATABASE_URL;
const assetManifest = process.env.RENDERER_ASSET_MANIFEST_JSON
  ? (JSON.parse(process.env.RENDERER_ASSET_MANIFEST_JSON) as AssetManifest)
  : null;

function assertOwnedFixture(): void {
  if (
    process.env.RENDERER_FIXTURE !== "1" ||
    process.env.PUBLICATION_GATE_FIXTURE !== "1" ||
    !evidenceDir ||
    !baseUrl ||
    !databaseUrl ||
    !assetManifest
  ) {
    throw new Error(
      "Renderer E2E requires the owned renderer fixture, database, base URL, evidence directory, and asset manifest.",
    );
  }
  const parsedBase = new URL(baseUrl);
  if (parsedBase.protocol !== "http:" || parsedBase.hostname !== "127.0.0.1") {
    throw new Error("Renderer E2E base URL must be explicit loopback HTTP.");
  }
  if (!databaseUrl.startsWith("file:") || /[?#]/.test(databaseUrl)) {
    throw new Error("Renderer E2E database must be an explicit local file URL.");
  }
  const databasePath = path.resolve(decodeURIComponent(databaseUrl.slice(5)));
  if (
    !databasePath.startsWith(
      `${path.join(fs.realpathSync.native(os.tmpdir()), "fpkg-renderer-")}`,
    )
  ) {
    throw new Error("Renderer E2E database must live in an owned renderer root.");
  }
}

export async function expectNoHorizontalOverflow(
  locator: Locator,
): Promise<void> {
  const geometry = await locator.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
  }));
  expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.clientWidth);
}

async function expectTouchTarget(locator: Locator): Promise<void> {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
}

async function expectSharedRendererSurface(
  page: import("@playwright/test").Page,
  asset: AssetEvidence,
): Promise<void> {
  await expectNoHorizontalOverflow(page.locator("html"));
  const image = page.locator(".encyclopedia-primary-media img");
  await expect(image).toHaveAttribute("src", asset.imageUrl);
  await expect(image).toHaveAttribute("alt", new RegExp(asset.name));
  await expect
    .poll(() => image.evaluate((node) => (node as HTMLImageElement).naturalWidth))
    .toBeGreaterThan(0);
  const caption = page.locator(".encyclopedia-primary-media figcaption");
  await expect(caption).toContainText(asset.attribution);
  await expect(caption).toContainText(`许可：${asset.license}`);
  await expect(caption.getByRole("link", { name: /查看图片来源/ })).toHaveAttribute(
    "href",
    asset.sourceUrl,
  );

  const headingHrefs = await page.locator("article h2[id]").evaluateAll((nodes) =>
    nodes.map((node) => `#${node.id}`),
  );
  const navigationHrefs = await page
    .locator(".encyclopedia-toc a, .encyclopedia-mobile-nav a")
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("href")));
  for (const href of headingHrefs) {
    expect(navigationHrefs.filter((candidate) => candidate === href)).toHaveLength(2);
  }

  const source = page.locator("#sources a").first();
  await expect(source).toHaveAttribute("target", "_blank");
  await expect(source).toHaveAttribute("rel", /noopener/);
  await expectTouchTarget(source);
  await source.focus();
  expect(
    await source.evaluate((node) => getComputedStyle(node).outlineStyle),
  ).not.toBe("none");
}

test.beforeAll(() => {
  assertOwnedFixture();
});

test.describe("@renderer independent encyclopedia renderer", () => {
  test("brand exposes complete server HTML, exact relations, and viewport evidence", async ({
    page,
    request,
  }, testInfo) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const response = await request.get("/brand/renderer-brand");
    expect(response.status()).toBe(200);
    const html = await response.text();
    expect(html).toContain(BRAND_SUMMARY);
    expect(html).toContain("Renderer 品牌历史正文");
    expect(html).toContain("Renderer 官方档案");
    expect(html).toContain("/pen/renderer-model-01");
    expect(html).toContain("全部型号（15）");

    await page.goto("/brand/renderer-brand", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(BRAND_NAME);
    await expect(page.getByTestId("entity-summary")).toHaveText(BRAND_SUMMARY);
    await expect(page.locator("#story")).toContainText("Renderer 品牌历史正文");
    const modelLinks = page.locator('#models a[href^="/pen/"]');
    await expect(modelLinks).toHaveCount(15);
    const hrefs = await modelLinks.evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute("href")),
    );
    expect(new Set(hrefs).size).toBe(15);
    await expect(page.locator("#models h2")).toHaveText("全部型号（15）");
    await expectTouchTarget(modelLinks.first());
    await expectSharedRendererSurface(page, assetManifest?.brand as AssetEvidence);
    for (const sentinel of FORBIDDEN) {
      await expect(page.locator("body")).not.toContainText(sentinel);
    }
    await expect(page.locator("html")).toHaveCSS("scroll-behavior", "auto");
    await page.screenshot({
      path: path.join(
        evidenceDir as string,
        `brand-${testInfo.project.name}.png`,
      ),
      fullPage: true,
    });
  });

  test("model exposes all PAGE-06 topics and exactly one canonical brand", async ({
    page,
    request,
  }, testInfo) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const response = await request.get("/pen/renderer-model-01");
    expect(response.status()).toBe(200);
    const html = await response.text();
    expect(html).toContain(MODEL_SUMMARY);
    expect(html).toContain("Renderer 官方档案");
    expect(html).toContain("/brand/renderer-brand");
    for (const sentinel of TOPIC_SENTINELS) expect(html).toContain(sentinel);

    await page.goto("/pen/renderer-model-01", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(MODEL_NAME);
    await expect(page.getByTestId("entity-summary")).toHaveText(MODEL_SUMMARY);
    for (const sentinel of TOPIC_SENTINELS) {
      await expect(page.locator("#story")).toContainText(sentinel);
    }
    const canonicalBrand = page.locator('#brand a[href="/brand/renderer-brand"]');
    await expect(canonicalBrand).toHaveCount(1);
    await expect(canonicalBrand).toHaveText(BRAND_NAME);
    await expectTouchTarget(canonicalBrand);
    await expect(page.locator("#specs")).toContainText("重量");
    await expect(page.locator("#specs")).toContainText("0");
    await expectSharedRendererSurface(page, assetManifest?.model as AssetEvidence);
    for (const sentinel of FORBIDDEN) {
      await expect(page.locator("body")).not.toContainText(sentinel);
    }
    await page.screenshot({
      path: path.join(
        evidenceDir as string,
        `model-${testInfo.project.name}.png`,
      ),
      fullPage: true,
    });
  });
});

test.describe("@boundary Phase 20 public boundary", () => {
  test.describe.configure({ mode: "serial" });
  let client: Client;

  test.beforeAll(() => {
    client = createClient({ url: databaseUrl as string });
  });

  test.afterAll(() => {
    client.close();
  });

  test("nonpublic content is 404 while the complete fixture is readable", async ({
    request,
  }) => {
    expect((await request.get("/pen/renderer-unqualified-spec")).status()).toBe(404);
    expect((await request.get("/pen/renderer-model-01")).status()).toBe(200);
  });

  test("a publication-critical story mutation removes the model on the next request", async ({
    request,
  }) => {
    await client.execute({
      sql: `UPDATE stories
            SET body_md = body_md || '\n\nBOUNDARY_MUTATION_RENDERER'
            WHERE id = 'renderer-model-01-story-1'`,
    });
    expect((await request.get("/pen/renderer-model-01?boundary=mutated")).status()).toBe(
      404,
    );
  });

  test("current-hash fixture review and republish restores the model", async ({
    request,
  }) => {
    for (const reviewKind of ["fact", "language", "media"] as const) {
      await recordEntityContentReview(client, {
        entityId: "renderer-model-01",
        reviewKind,
        reviewer: "renderer-boundary",
        status: "approved",
        notes: "Phase 20 fixture-only boundary rereview.",
      });
    }
    await publishEntity(client, {
      entityId: "renderer-model-01",
      reviewer: "renderer-boundary",
    });
    const response = await request.get("/pen/renderer-model-01?boundary=republished");
    expect(response.status()).toBe(200);
    expect(await response.text()).toContain("BOUNDARY_MUTATION_RENDERER");
  });
});
