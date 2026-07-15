import { expect, test } from "@playwright/test";
import { HIDDEN_ARTICLE_SLUGS } from "../../src/lib/public-visibility";

const EXTERNAL_E2E = Boolean(process.env.E2E_BASE_URL);
const BATCH_SIZE = Math.max(
  1,
  Math.min(
    12,
    Number.parseInt(process.env.E2E_AUDIT_BATCH_SIZE || "12", 10) || 12,
  ),
);
const FULL_AUDIT_TIMEOUT = process.env.E2E_BASE_URL ? 900_000 : 240_000;
const ARTICLE_REQUEST_TIMEOUT = process.env.E2E_BASE_URL ? 90_000 : 30_000;
const VOID_ELEMENTS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

const FORBIDDEN_VISIBLE_COPY: Array<[RegExp, string]> = [
  [/javascript\s*:/i, "javascript residue"],
  [
    /点击(?:图片|此处|上图|缩略图)?(?:即可|可)?(?:查看|放大)|点击放大/,
    "click-to-enlarge instruction",
  ],
  [/鼠标(?:移入|悬停)|悬停(?:查看|放大)/, "mouse-hover instruction"],
  [/长按(?:图片|可)?/, "long-press instruction"],
  [/↩/, "legacy return symbol"],
  [
    /(?:本文|本页)(?:所载)?信息(?:力求|尽可能|尽量)(?:准确|无误)/,
    "generic accuracy disclaimer",
  ],
  [
    /如(?:果)?发现(?:任何)?错误[^。]{0,60}(?:联系|更正|指正)/,
    "generic correction disclaimer",
  ],
  [/本文(?:也|亦)?(?:收录于|收录在|节选自)/, "ebook promotion"],
  [/电子书[^。\n]{0,50}(?:购买|购书|获取|下载)/, "ebook purchase promotion"],
  [/(?:购买|购书|获取|下载)[^。\n]{0,30}电子书/, "ebook purchase promotion"],
];

function decodeHtml(text: string): string {
  const named: Record<string, string> = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    nbsp: " ",
    quot: '"',
  };
  return text.replace(
    /&(?:#(\d+)|#x([\da-f]+)|([a-z]+));/gi,
    (entity, decimal: string, hexadecimal: string, name: string) => {
      if (decimal) return String.fromCodePoint(Number.parseInt(decimal, 10));
      if (hexadecimal)
        return String.fromCodePoint(Number.parseInt(hexadecimal, 16));
      return named[name.toLowerCase()] ?? entity;
    },
  );
}

function visibleTextFromHtml(html: string): string {
  return decodeHtml(
    html
      .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
      .replace(/<!--([\s\S]*?)-->/g, " ")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim();
}

function htmlAttribute(tag: string, name: string): string | null {
  const match = tag.match(
    new RegExp(`\\b${name}=(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"),
  );
  if (!match) return null;
  return decodeHtml(match[1] || match[2] || match[3] || "");
}

function extractElementByClass(html: string, className: string): string | null {
  const startPattern = new RegExp(
    `<([a-z][\\w:-]*)\\b[^>]*\\bclass=(?:"[^"]*\\b${className}\\b[^"]*"|'[^']*\\b${className}\\b[^']*')[^>]*>`,
    "i",
  );
  const start = startPattern.exec(html);
  if (!start) return null;

  const tagName = start[1].toLowerCase();
  if (VOID_ELEMENTS.has(tagName)) return "";
  const tagPattern = new RegExp(`<\\/?${tagName}\\b[^>]*>`, "gi");
  tagPattern.lastIndex = start.index + start[0].length;
  let depth = 1;
  let tag = tagPattern.exec(html);
  while (tag) {
    if (/^<\//.test(tag[0])) depth--;
    else if (!/\/$/.test(tag[0].slice(0, -1).trim())) depth++;
    if (depth === 0) {
      return html.slice(start.index + start[0].length, tag.index);
    }
    tag = tagPattern.exec(html);
  }
  return null;
}

function allTags(html: string, tagName: string): string[] {
  return [...html.matchAll(new RegExp(`<${tagName}\\b[^>]*>`, "gi"))].map(
    (match) => match[0],
  );
}

function articlePathsFromSitemap(xml: string): string[] {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((match) => new URL(decodeHtml(match[1])).pathname)
    .filter((path) => path.startsWith("/article/"));
}

test.describe("public article quality contract", () => {
  test("incomplete and internal imports stay outside the public archive", async ({
    request,
  }, testInfo) => {
    if (testInfo.project.name !== "desktop") return;

    const sitemap = await (await request.get("/sitemap.xml")).text();
    for (const slug of HIDDEN_ARTICLE_SLUGS) {
      expect(sitemap).not.toContain(`/article/${slug}<`);
      const response = await request.get(
        `/article/${encodeURIComponent(slug)}`,
        {
          maxRedirects: 0,
        },
      );
      expect(response.status(), slug).toBe(404);
    }
  });

  test("every public article is structurally clean and free of import residue", async ({
    request,
  }, testInfo) => {
    if (testInfo.project.name !== "desktop") return;
    testInfo.setTimeout(FULL_AUDIT_TIMEOUT);

    const sitemapResponse = await request.get("/sitemap.xml");
    expect(sitemapResponse.ok()).toBeTruthy();
    const articlePaths = articlePathsFromSitemap(await sitemapResponse.text());
    expect(new Set(articlePaths).size).toBe(articlePaths.length);
    if (EXTERNAL_E2E) expect(articlePaths.length).toBeGreaterThan(0);
    else expect(articlePaths).toEqual([]);

    const failures: string[] = [];
    for (let offset = 0; offset < articlePaths.length; offset += BATCH_SIZE) {
      await Promise.all(
        articlePaths.slice(offset, offset + BATCH_SIZE).map(async (path) => {
          const response = await request.get(path, {
            timeout: ARTICLE_REQUEST_TIMEOUT,
          });
          if (response.status() !== 200) {
            failures.push(
              `${path}: expected 200, received ${response.status()}`,
            );
            return;
          }

          const html = await response.text();
          const body = extractElementByClass(html, "prose-body");
          if (body === null) {
            failures.push(`${path}: missing .prose-body`);
            return;
          }

          const pageH1Count = (html.match(/<h1\b/gi) || []).length;
          if (pageH1Count !== 1) {
            failures.push(
              `${path}: expected exactly one page h1, found ${pageH1Count}`,
            );
          }

          const headingLevels = [...body.matchAll(/<h([1-6])\b/gi)].map(
            (match) => Number(match[1]),
          );
          if (headingLevels.includes(1)) {
            failures.push(`${path}: article body contains h1`);
          }
          if (headingLevels.length > 0 && headingLevels[0] !== 2) {
            failures.push(
              `${path}: first body heading is h${headingLevels[0]}, not h2`,
            );
          }
          for (let index = 1; index < headingLevels.length; index++) {
            if (headingLevels[index] > headingLevels[index - 1] + 1) {
              failures.push(
                `${path}: body heading jumps from h${headingLevels[index - 1]} to h${headingLevels[index]}`,
              );
            }
          }

          for (const anchor of allTags(body, "a")) {
            if (htmlAttribute(anchor, "href") === null) {
              failures.push(`${path}: body contains an anchor without href`);
            }
          }

          const visibleBody = visibleTextFromHtml(body);
          for (const [pattern, description] of FORBIDDEN_VISIBLE_COPY) {
            if (pattern.test(visibleBody)) {
              failures.push(`${path}: visible body contains ${description}`);
            }
          }

          for (const image of allTags(body, "img")) {
            const alt = (htmlAttribute(image, "alt") || "").trim();
            if (!alt) failures.push(`${path}: body image has no alt text`);
          }

          const figures = [
            ...body.matchAll(/<figure\b[^>]*>([\s\S]*?)<\/figure>/gi),
          ];
          for (const figure of figures) {
            const captionMatch = figure[1].match(
              /<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>/i,
            );
            const caption = visibleTextFromHtml(captionMatch?.[1] || "");
            if (
              !caption ||
              /^(?:资料插图|插图|图片|image|photo|fountain pen|pen)$/i.test(
                caption,
              )
            ) {
              failures.push(
                `${path}: figure is missing a meaningful figcaption`,
              );
            }
          }
        }),
      );
    }

    expect(failures).toEqual([]);
  });
});
