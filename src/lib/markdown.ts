import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import remarkWikiLink from "remark-wiki-link";

const RICHARDS_PENS_BASE = "https://www.richardspens.com/";

type HastPropertyValue =
  | string
  | number
  | boolean
  | null
  | Array<string | number | boolean>;

type HastProperties = Record<string, HastPropertyValue | undefined>;

interface HastNode {
  type: string;
  tagName?: string;
  properties?: HastProperties;
  children?: HastNode[];
  value?: string;
  __remove?: boolean;
}

interface HastElement extends HastNode {
  type: "element";
  tagName: string;
}

interface ImageContainer {
  wrapper: HastNode | null;
  img: HastNode;
}

function isElementNode(node: HastNode, tagName?: string): node is HastElement {
  return (
    node.type === "element" &&
    (!tagName || node.tagName?.toLowerCase() === tagName)
  );
}

function ensureProperties(node: HastNode): HastProperties {
  if (!node.properties) {
    node.properties = {};
  }
  return node.properties;
}

function visitElements(
  node: HastNode,
  visitor: (
    node: HastElement,
    index: number | undefined,
    parent: HastNode | undefined,
  ) => false | undefined,
  index?: number,
  parent?: HastNode,
) {
  if (isElementNode(node)) {
    const result = visitor(node, index, parent);
    if (result === false) return;
  }

  if (!node.children) return;
  for (let i = 0; i < node.children.length; i++) {
    visitElements(node.children[i], visitor, i, node);
  }
}

function escapeHtmlText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeHtmlAttr(value: string): string {
  return escapeHtmlText(value).replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function normalizeRichardsPensUrl(value: string): string {
  const trimmed = value.trim();
  if (/^(?:https?:|mailto:|#)/i.test(trimmed)) return trimmed;
  if (/^\/(?:ref|images)\//i.test(trimmed)) {
    return new URL(trimmed.slice(1), RICHARDS_PENS_BASE).toString();
  }
  if (/^(?:ref|images)\//i.test(trimmed)) {
    return new URL(trimmed, RICHARDS_PENS_BASE).toString();
  }
  return trimmed;
}

function normalizeLegacyImageCaptions(md: string): string {
  return md.replace(
    /!\[([^\]]*)\]\(([^)\s]+)\)\s{0,2}\n---\s{0,2}\n[\u00a0\s]*\|\s*([^\n]+)/g,
    (_, alt: string, src: string, caption: string) => {
      const normalizedSrc = normalizeRichardsPensUrl(src);
      return `<figure class="image-figure"><img src="${escapeHtmlAttr(
        normalizedSrc,
      )}" alt="${escapeHtmlAttr(alt)}" /><figcaption>${escapeHtmlText(
        caption.trim(),
      )}</figcaption></figure>`;
    },
  );
}

function normalizeBoldMarkdownLinks(md: string): string {
  return md.replace(
    /\*\*\[([^\]]+)\]\((<[^>]+>|[^)\s]+)(?:\s+"([^"]+)")?\)\*\*/g,
    (_, text: string, href: string, title: string | undefined) => {
      const normalizedHref = normalizeRichardsPensUrl(
        href.replace(/^<|>$/g, ""),
      );
      return `<strong><a href="${escapeHtmlAttr(normalizedHref)}"${
        title ? ` title="${escapeHtmlAttr(title)}"` : ""
      }>${escapeHtmlText(text)}</a></strong>`;
    },
  );
}

function normalizeLegacyTableSeparators(md: string): string {
  return md
    .split("\n")
    .filter((line) => !/^\s*>?\s*-{2,}\s*\|\s*-{2,}\s*$/.test(line))
    .join("\n");
}

function parseMarkdownImages(line: string) {
  const imagePattern = /!\[([^\]]*)\]\((<[^>]+>|[^)\s]+)(?:\s+"[^"]*")?\)/g;
  return [...line.matchAll(imagePattern)].map((match) => ({
    alt: match[1],
    src: match[2].replace(/^<|>$/g, ""),
  }));
}

function normalizeMarkdownImageRows(md: string): string {
  const lines = md.split("\n");
  const output: string[] = [];
  let inFence = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      output.push(line);
      continue;
    }

    if (inFence) {
      output.push(line);
      continue;
    }

    const images = parseMarkdownImages(line);
    const withoutImages = line
      .replace(/!\[([^\]]*)\]\((<[^>]+>|[^)\s]+)(?:\s+"[^"]*")?\)/g, "")
      .replace(/\u00a0/g, " ")
      .trim();
    const isImageRow = images.length >= 2 && /^[|\s]*$/.test(withoutImages);

    if (!isImageRow) {
      output.push(line);
      continue;
    }

    const nextLine = lines[i + 1] || "";
    const captionParts = nextLine
      .split("|")
      .map((part) => part.replace(/\u00a0/g, " ").trim())
      .filter(Boolean);
    const captions =
      !nextLine.includes("![") && captionParts.length === images.length
        ? captionParts
        : [];
    if (captions.length > 0) i += 1;

    const figures = images
      .map((image, index) => {
        const src = normalizeRichardsPensUrl(image.src);
        const caption = captions[index];
        return `<figure class="image-row-item"><img class="image-row-img" src="${escapeHtmlAttr(
          src,
        )}" alt="${escapeHtmlAttr(image.alt)}" />${
          caption ? `<figcaption>${escapeHtmlText(caption)}</figcaption>` : ""
        }</figure>`;
      })
      .join("");

    output.push(`<div class="image-row">${figures}</div>`);
  }

  return output.join("\n");
}

function renderLegacyPipeCell(value: string): string {
  const withoutHeading = value
    .replace(/^>\s*/, "")
    .replace(/^#{1,6}\s*/, "")
    .trim()
    .replace(
      /\[(!\[[^\]]*\]\((<[^>]+>|[^)\s]+)(?:\s+"[^"]+")?\))\]\([^)]*\)/g,
      "$1",
    )
    .replace(/^\[\s*/, "")
    .replace(/\]\(<javascript:[\s\S]*$/i, "");
  const withImages = withoutHeading.replace(
    /!\[([^\]]*)\]\((<[^>]+>|[^)\s]+)(?:\s+"[^"]*")?\)/g,
    (_, alt: string, src: string) => {
      const normalizedSrc = normalizeRichardsPensUrl(src.replace(/^<|>$/g, ""));
      return `<img src="${escapeHtmlAttr(normalizedSrc)}" alt="${escapeHtmlAttr(
        alt,
      )}" />`;
    },
  );
  const escaped = withImages
    .split(/(<img\b[^>]*>)/g)
    .map((part) => {
      if (part.startsWith("<img")) return part;
      return escapeHtmlText(part)
        .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
        .replace(/\*([^*]+)\*/g, "<em>$1</em>");
    })
    .join("");
  return escaped || "&nbsp;";
}

function normalizeMarkdownPipeImageRows(md: string): string {
  const lines = md.split("\n");
  const output: string[] = [];
  let inFence = false;

  for (const line of lines) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      output.push(line);
      continue;
    }

    if (
      inFence ||
      !line.includes("|") ||
      parseMarkdownImages(line).length === 0
    ) {
      output.push(line);
      continue;
    }

    const cells = line
      .split("|")
      .map((cell) => cell.replace(/\u00a0/g, " ").trim())
      .filter(Boolean);

    if (cells.length < 1) {
      output.push(line);
      continue;
    }

    output.push(
      `<div class="legacy-pipe-row">${cells
        .map(
          (cell) =>
            `<div class="legacy-pipe-cell">${renderLegacyPipeCell(cell)}</div>`,
        )
        .join("")}</div>`,
    );
  }

  return output.join("\n");
}

function normalizeResidualBoldHtml(html: string): string {
  return html
    .replace(
      /\*\*([^*<>\n]{1,120})<strong>/g,
      (_, text: string) => `<strong>${text}</strong>`,
    )
    .replace(
      /<\/strong>([^*<>\n]{1,120})\*\*/g,
      (_, text: string) => `</strong><strong>${text}</strong>`,
    )
    .replace(/\*\*((?:(?!\*\*)[\s\S])*?)\*\*/g, (match, inner) => {
      const value = String(inner).trim();
      if (!value || value.length > 500) return match;
      return `<strong>${inner}</strong>`;
    });
}

function cleanImageRowCaption(value: string): string | null {
  const caption = value
    .split("|")
    .map((part) => part.replace(/\u00a0/g, " ").trim())
    .filter(Boolean)
    .at(-1);
  return caption || null;
}

/**
 * Rehype plugin: sanitize dangerous URLs in href and src attributes.
 */
function rehypeSanitizeUrls() {
  return (tree: HastNode) => {
    visitElements(tree, (node): undefined => {
      const properties = ensureProperties(node);

      if (node.tagName === "a" && properties.href) {
        const href = String(properties.href);
        if (/^\s*javascript:/i.test(href)) {
          properties.href = "#";
          properties.title = "(链接已移除)";
        } else {
          properties.href = normalizeRichardsPensUrl(href).replace(
            /\.mdx?$/i,
            "",
          );
        }
      }

      // Rewrite richardspens.com image URLs through our proxy
      if (node.tagName === "img" && properties.src) {
        const src = String(properties.src);
        if (/^\s*javascript:/i.test(src)) {
          properties.src = "";
          properties.alt = properties.alt || "(图片已移除)";
        } else {
          const normalizedSrc = normalizeRichardsPensUrl(src);
          if (/richardspens\.com/i.test(normalizedSrc)) {
            properties.src = `/api/image-proxy?url=${encodeURIComponent(
              normalizedSrc,
            )}`;
          } else {
            properties.src = normalizedSrc;
          }
        }
      }

      // Keep image markup CSP-friendly. Broken images fall back to native browser UI.
      if (node.tagName === "img") {
        properties.loading = "lazy";
        properties.decoding = "async";
      }

      // Fix richardspens icon-only links:
      // <a><img alt="返回"></a> → ↩, <a><img alt="链接"></a> → 链接
      if (node.tagName === "a" && node.children) {
        const iconImg = node.children.find(
          (child) =>
            isElementNode(child, "img") &&
            (child.properties?.alt === "返回" ||
              child.properties?.alt === "链接" ||
              String(child.properties?.src || "").includes("go_up") ||
              String(child.properties?.src || "").includes("/icons/sm/link")),
        );
        const hasOnlyIcon =
          iconImg &&
          node.children.every(
            (child) =>
              isElementNode(child, "img") ||
              (child.type === "text" &&
                String(child.value || "").trim() === ""),
          );
        if (hasOnlyIcon) {
          const alt = String(iconImg.properties?.alt || "");
          node.children = [
            { type: "text", value: alt === "返回" ? "↩" : "链接" },
          ];
        }
      }
      return undefined;
    });
  };
}

/**
 * Rehype plugin: normalize heading levels so they never skip a level.
 */
function rehypeNormalizeHeadings() {
  return (tree: HastNode) => {
    const headings: { node: HastElement; level: number }[] = [];
    visitElements(tree, (node): undefined => {
      if (/^h[1-6]$/.test(node.tagName)) {
        headings.push({ node, level: parseInt(node.tagName.charAt(1), 10) });
      }
      return undefined;
    });

    if (headings.length < 2) return;

    const newLevels: number[] = [headings[0].level];
    for (let i = 1; i < headings.length; i++) {
      const prev = newLevels[i - 1];
      const cur = headings[i].level;
      if (cur <= prev + 1) {
        newLevels.push(cur);
      } else {
        newLevels.push(prev + 1);
      }
    }

    for (let i = 0; i < headings.length; i++) {
      const newLevel = newLevels[i];
      if (newLevel <= 6) {
        headings[i].node.tagName = `h${newLevel}`;
      }
    }
  };
}

/**
 * Rehype plugin: transform paragraphs that contain only images separated by
 * `|` into a horizontal flex row. Handles images wrapped in <a> links.
 */
function rehypeImageRows() {
  return (tree: HastNode) => {
    visitElements(tree, (node, index, parent) => {
      if (
        !parent?.children ||
        index === undefined ||
        !isElementNode(node, "p")
      ) {
        return;
      }

      const children = node.children ?? [];
      const imageContainers: ImageContainer[] = [];
      const leadingCaptions: Array<string | null> = [];
      let isImageRow = false;
      let seenBr = false;
      let afterBrText = "";
      let imageAfterBr = false;
      let pendingText = "";

      const pushImage = (container: ImageContainer) => {
        leadingCaptions.push(cleanImageRowCaption(pendingText));
        pendingText = "";
        imageContainers.push(container);
      };

      for (const child of children) {
        if (isElementNode(child, "img")) {
          if (seenBr) imageAfterBr = true;
          pushImage({ wrapper: null, img: child });
        } else if (isElementNode(child, "a")) {
          const imgs = (child.children ?? []).filter((childNode) =>
            isElementNode(childNode, "img"),
          );
          if (imgs.length === 1) {
            if (seenBr) imageAfterBr = true;
            pushImage({ wrapper: child, img: imgs[0] });
          } else {
            return;
          }
        } else if (child.type === "text") {
          const value = String(child.value ?? "");
          const text = value.trim();
          if (seenBr) {
            afterBrText += value;
          } else if (text === "|") {
            isImageRow = true;
            pendingText += value;
          } else if (text.includes("|")) {
            isImageRow = true;
            pendingText += value;
          } else if (text !== "") {
            pendingText += value;
          }
        } else if (isElementNode(child, "br")) {
          seenBr = true;
        } else {
          return;
        }
      }

      if (imageContainers.length < 2) return;
      if (!isImageRow && !seenBr) return;

      // Look for captions: first try in the same <p> (after <br>), then next sibling
      let captionTexts: string[] = [];

      // Case 1: captions in same <p> after <br>
      if (!imageAfterBr && afterBrText.trim()) {
        const texts = afterBrText
          .split("|")
          .map((s: string) => s.trim())
          .filter(Boolean);
        if (texts.length === imageContainers.length) {
          captionTexts = texts;
        }
      }

      // Case 2: captions in next sibling <p>
      if (captionTexts.length === 0) {
        const nextSibling = parent.children[index + 1];
        if (nextSibling && isElementNode(nextSibling, "p")) {
          const captionChildren = nextSibling.children ?? [];
          let allText = true;
          const texts: string[] = [];
          for (const child of captionChildren) {
            if (child.type === "text") {
              texts.push(
                ...String(child.value ?? "")
                  .split("|")
                  .map((s: string) => s.trim())
                  .filter(Boolean),
              );
            } else if (isElementNode(child, "br")) {
              // ok
            } else {
              allText = false;
              break;
            }
          }
          if (allText && texts.length === imageContainers.length) {
            captionTexts = texts;
            nextSibling.__remove = true;
          }
        }
      }

      if (
        captionTexts.length === 0 &&
        leadingCaptions.some((caption) => caption)
      ) {
        captionTexts = leadingCaptions.map((caption) => caption || "");
      }

      const rowChildren = imageContainers.map(({ wrapper, img }, i) => {
        const imgWithClass: HastNode = {
          ...img,
          properties: { ...img.properties, className: ["image-row-img"] },
        };
        const content: HastNode = wrapper
          ? { ...wrapper, children: [imgWithClass] }
          : imgWithClass;

        return {
          type: "element",
          tagName: "figure",
          properties: { className: ["image-row-item"] },
          children: [
            content,
            ...(captionTexts[i]
              ? [
                  {
                    type: "element",
                    tagName: "figcaption",
                    properties: {},
                    children: [{ type: "text", value: captionTexts[i] }],
                  },
                ]
              : []),
          ],
        };
      });

      parent.children[index] = {
        type: "element",
        tagName: "div",
        properties: { className: ["image-row"] },
        children: rowChildren,
      };
      return false;
    });

    visitElements(tree, (node): undefined => {
      if (node.children) {
        node.children = node.children.filter((child) => !child.__remove);
      }
      return undefined;
    });
  };
}

/**
 * Render markdown with wiki-link support.
 */
export async function renderMarkdown(
  md: string,
  resolveHref?: (slug: string) => Promise<string | null> | string | null,
): Promise<string> {
  let resolvedMap: Map<string, string> | null = null;

  if (resolveHref) {
    const slugPattern = /\[\[([^\]]+)\]\]/g;
    const slugs = new Set<string>();
    let match: RegExpExecArray | null;

    match = slugPattern.exec(md);
    while (match !== null) {
      slugs.add(match[1].trim());
      match = slugPattern.exec(md);
    }

    if (slugs.size > 0) {
      resolvedMap = new Map();
      const entries = await Promise.all(
        Array.from(slugs).map(async (slug) => {
          const href = await resolveHref(slug);
          return [slug, href] as const;
        }),
      );
      for (const [slug, href] of entries) {
        if (href) {
          resolvedMap.set(slug, href);
        }
      }
    }
  }

  // Pre-process: fix bold/italic markup around inline HTML elements
  let processed = normalizeLegacyImageCaptions(
    normalizeMarkdownPipeImageRows(
      normalizeMarkdownImageRows(
        normalizeLegacyTableSeparators(normalizeBoldMarkdownLinks(md)),
      ),
    ),
  );
  // Bold wrapping any inline HTML element: **<tag...>...</tag>**
  processed = processed.replace(
    /\*\*(<[a-z][a-z0-9]*\b[^>]*>.*?<\/[a-z][a-z0-9]*\s*>)\*\*/gi,
    (_, html) => `<strong>${html}</strong>`,
  );
  // Bold wrapping self-closing elements: **<br />**, **<img.../>**, **<hr>**
  processed = processed.replace(
    /\*\*(<(?:br|img|hr|input|meta|link|area|col|embed|source|track|wbr)[^>]*\/?\s*>)\*\*/gi,
    (_, html) => `<strong>${html}</strong>`,
  );
  // Bold wrapping mixed text + inline HTML: **text <em>more</em> tail**
  processed = processed.replace(
    /\*\*((?:(?!\*\*)[\s\S])*?<[a-z][a-z0-9]*\b[^>]*>.*?<\/[a-z][a-z0-9]*\s*>(?:(?!\*\*)[\s\S])*?)\*\*/gi,
    (m, inner) => {
      const innerStars = (inner.match(/\*\*/g) || []).length;
      return innerStars === 0 ? `<strong>${inner}</strong>` : m;
    },
  );

  const result = await remark()
    .use(remarkGfm)
    .use(remarkWikiLink, {
      permalinks: [],
      pageResolver: (name: string) => [name],
      hrefTemplate: (permalink: string) => {
        const resolvedHref = resolvedMap?.get(permalink);
        if (resolvedHref) {
          return resolvedHref;
        }
        return `/${permalink}`;
      },
    })
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeImageRows)
    .use(rehypeNormalizeHeadings)
    .use(rehypeSanitizeUrls)
    .use(rehypeStringify)
    .process(processed);

  return normalizeResidualBoldHtml(result.toString());
}
