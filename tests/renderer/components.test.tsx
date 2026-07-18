import assert from "node:assert/strict";
import { describe, it } from "node:test";
import React, { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { EncyclopediaShell } from "@/components/library/EncyclopediaShell";
import type { ModelPageData } from "@/lib/entity-page";
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
