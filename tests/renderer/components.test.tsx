import assert from "node:assert/strict";
import { describe, it } from "node:test";
import React, { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { BrandMuseum } from "@/components/library/BrandMuseum";
import { EncyclopediaShell } from "@/components/library/EncyclopediaShell";
import { ModelArchive } from "@/components/library/ModelArchive";
import type { BrandPageData, ModelPageData } from "@/lib/entity-page";
import { renderMarkdownDocument } from "@/lib/markdown";

Object.assign(globalThis, { React });

const SUMMARY =
  "这是一段独立于正文的完整中文内容提要，用来说明型号身份、设计重点、书写特征与购买边界，并确保首屏直接提供可判断的信息。";

function modelPage(overrides: Partial<ModelPageData> = {}): ModelPageData {
  return {
    id: "renderer-model",
    type: "pen",
    slug: "renderer-model",
    name: "Renderer Model",
    summary: SUMMARY,
    story: {
      title: "Renderer Model 正式正文",
      bodyMd:
        "## 身份与产品线\n\nPAGE06_IDENTITY_PRODUCT_LINE\n\n### 书写体验\n\nPAGE06_ATTRIBUTED_WRITING_EXPERIENCE",
    },
    sources: [
      {
        title: "Renderer 官方资料",
        url: "https://example.com/model-source",
        sourceName: "Example Archive",
        archiveUrl: "https://archive.example.com/model-source",
        archiveLocator: "2026-07-18",
      },
    ],
    primaryMedia: {
      title: "Renderer Model 侧面全貌",
      imageUrl: "/media/renderer-model.jpg",
      thumbnailUrl: null,
      author: "Fixture Photographer",
      license: "CC BY 4.0",
      attribution: "Fixture Photographer / CC BY 4.0",
      sourceUrl: "https://example.com/model-image",
    },
    specs: [
      {
        key: "weight",
        label: "重量",
        value: 0,
        source: {
          title: "Renderer 官方资料",
          url: "https://example.com/model-source",
          sourceName: "Example Archive",
          locator: "规格表第 3 行",
        },
      },
    ],
    variants: [],
    canonicalBrand: {
      type: "brand",
      slug: "renderer-brand",
      name: "Renderer Brand",
      summary: "Renderer Brand summary",
    },
    ...overrides,
  };
}

function brandPage(overrides: Partial<BrandPageData> = {}): BrandPageData {
  return {
    id: "renderer-brand",
    type: "brand",
    slug: "renderer-brand",
    name: "Renderer Brand",
    summary: SUMMARY,
    story: {
      title: "Renderer Brand 正式正文",
      bodyMd: "## 品牌历史\n\nBRAND_STORY_SENTINEL",
    },
    sources: modelPage().sources,
    primaryMedia: {
      ...modelPage().primaryMedia,
      title: "Renderer Brand 标志与产品全貌",
      imageUrl: "/media/renderer-brand.jpg",
    },
    timeline: [
      {
        title: "品牌创立",
        startDate: "1900",
        endDate: null,
        circa: true,
        description: "品牌开始生产书写工具。",
        source: {
          title: "品牌档案一",
          url: "https://example.com/brand-history-1",
          sourceName: "Example Archive",
        },
      },
      {
        title: "产品线扩展",
        startDate: "1950",
        endDate: null,
        circa: false,
        description: "品牌推出新的钢笔产品线。",
        source: {
          title: "品牌档案二",
          url: "https://example.com/brand-history-2",
          sourceName: "Example Archive",
        },
      },
    ],
    models: Array.from({ length: 15 }, (_, index) => ({
      type: "pen" as const,
      slug: `renderer-model-${index + 1}`,
      name: `Renderer Model ${index + 1}`,
      summary: `Renderer Model ${index + 1} summary`,
    })),
    ...overrides,
  };
}

describe("same-AST heading document", () => {
  it("assigns deterministic unique heading IDs and returns the same heading list", async () => {
    const document = await renderMarkdownDocument(
      "## 书写体验\n\n第一段。\n\n### 细节与手感\n\n第二段。\n\n## 书写体验\n\n第三段。",
    );

    assert.deepEqual(document.headings, [
      { id: "书写体验", label: "书写体验", level: 2 },
      { id: "细节与手感", label: "细节与手感", level: 3 },
      { id: "书写体验-2", label: "书写体验", level: 2 },
    ]);
    assert.match(document.html, /<h2 id="书写体验">书写体验<\/h2>/);
    assert.match(document.html, /<h3 id="细节与手感">细节与手感<\/h3>/);
    assert.match(document.html, /<h2 id="书写体验-2">书写体验<\/h2>/);
  });
});

describe("Markdown threat boundary", () => {
  it("removes executable raw HTML", async () => {
    const document = await renderMarkdownDocument(
      '## 安全正文\n\n<script>alert(\'raw HTML\')</script><iframe src="https://evil.example"></iframe><p onclick="alert(1)">保留文字</p>',
    );

    assert.doesNotMatch(document.html, /<script|<iframe|onclick=/i);
    assert.doesNotMatch(document.html, /alert\(['"]raw HTML/i);
    assert.match(document.html, /保留文字/);
  });

  it("makes every javascript URL inert", async () => {
    const document = await renderMarkdownDocument(
      "## 安全链接\n\n[危险链接](javascript:alert('x'))\n\n<a href=\"javascript:alert(2)\">原始危险链接</a>",
    );

    assert.doesNotMatch(document.html, /javascript:/i);
    assert.doesNotMatch(document.html, /href=["']javascript:/i);
    assert.match(document.html, /危险链接/);
    assert.match(document.html, /原始危险链接/);
  });
});

describe("server markup encyclopedia shell", () => {
  it("renders summary, story, exact media, sources, and canonical relation before hydration", async () => {
    const data = modelPage();
    const document = await renderMarkdownDocument(data.story.bodyMd);
    const html = renderToStaticMarkup(
      createElement(EncyclopediaShell, { data, document }),
    );

    assert.equal((html.match(/<h1\b/g) || []).length, 1);
    assert.match(html, new RegExp(SUMMARY));
    assert.match(html, /PAGE06_IDENTITY_PRODUCT_LINE/);
    assert.match(html, /PAGE06_ATTRIBUTED_WRITING_EXPERIENCE/);
    assert.match(html, /src="\/media\/renderer-model\.jpg"/);
    assert.match(html, /Fixture Photographer \/ CC BY 4\.0/);
    assert.match(html, /Renderer 官方资料/);
    assert.match(html, /href="\/brand\/renderer-brand"/);
    assert.match(html, /href="#身份与产品线"/);
    assert.match(html, /href="#书写体验"/);
  });

  it("omits absent optional modules and their navigation targets", async () => {
    const data = modelPage({ variants: [] });
    const document = await renderMarkdownDocument(data.story.bodyMd);
    const html = renderToStaticMarkup(
      createElement(EncyclopediaShell, { data, document }),
    );

    assert.doesNotMatch(html, /id="variants"|href="#variants"|版本与年代边界/);
    assert.doesNotMatch(html, /暂无|没有可公开|placeholder/i);
  });
});

describe("evidence modules", () => {
  it("renders the complete sourced brand timeline and all fifteen unique model links", () => {
    const data = brandPage();
    const html = renderToStaticMarkup(
      createElement(BrandMuseum, {
        timeline: data.timeline,
        models: data.models,
      }),
    );
    const modelLinks = [
      ...html.matchAll(/href="\/pen\/(renderer-model-\d+)"/g),
    ].map((match) => match[1]);

    assert.match(html, /全部型号（15）/);
    assert.equal(modelLinks.length, 15);
    assert.equal(new Set(modelLinks).size, 15);
    assert.match(html, /品牌档案一/);
    assert.match(html, /品牌档案二/);
    assert.doesNotMatch(html, /暂无|待补充|未知|LEGACY_INVALID_SENTINEL/);
  });

  it("renders evidence for every model fact, preserves zero, and includes qualified variants", () => {
    const data = modelPage({
      variants: [
        {
          name: "早期版本",
          releaseYear: "2021",
          notes: "首发版本采用明确记录的结构。",
          source: {
            title: "版本资料",
            url: "https://example.com/variant-source",
            sourceName: "Example Archive",
          },
        },
      ],
    });
    const html = renderToStaticMarkup(
      createElement(ModelArchive, {
        specs: data.specs,
        variants: data.variants,
      }),
    );

    assert.match(html, /核心规格/);
    assert.match(html, />重量</);
    assert.match(html, />0</);
    assert.match(html, /来源：Renderer 官方资料/);
    assert.match(html, /规格表第 3 行/);
    assert.match(html, /版本差异/);
    assert.match(html, /早期版本/);
    assert.match(html, /来源：版本资料/);
    assert.doesNotMatch(
      html,
      /review_status|published|approved|暂无|待补充|未知|LEGACY_INVALID_SENTINEL/,
    );
  });

  it("omits the complete variants module when no qualified variant exists", () => {
    const data = modelPage({ variants: [] });
    const html = renderToStaticMarkup(
      createElement(ModelArchive, {
        specs: data.specs,
        variants: data.variants,
      }),
    );

    assert.doesNotMatch(html, /id="variants"|版本差异|暂无|待补充|未知/);
  });
});
