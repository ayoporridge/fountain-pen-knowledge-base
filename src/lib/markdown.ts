import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeRaw from "rehype-raw";
import remarkWikiLink from "remark-wiki-link";

/**
 * Rehype plugin: sanitize dangerous URLs in href and src attributes.
 */
function rehypeSanitizeUrls() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { visit } = require("unist-util-visit");
  return (tree: any) => {
    visit(tree, "element", (node: any) => {
      if (node.tagName === "a" && node.properties?.href) {
        const href = String(node.properties.href);
        if (/^\s*javascript:/i.test(href)) {
          node.properties.href = "#";
          node.properties.title = "(链接已移除)";
        } else {
          node.properties.href = href.replace(/\.mdx?$/i, "");
        }
      }
      if (node.properties?.src) {
        const src = String(node.properties.src);
        if (/^\s*javascript:/i.test(src)) {
          node.properties.src = "";
          node.properties.alt = node.properties.alt || "(图片已移除)";
        }
      }
      // Add onerror fallback for broken external images
      if (node.tagName === "img") {
        const alt = node.properties?.alt || "图片";
        node.properties.onerror = `this.outerHTML='<span class=\"broken-image\">🖼 ${String(alt).replace(/'/g, "\\'")}</span>'`;
        node.properties.loading = "lazy";
      }
    });
  };
}

/**
 * Rehype plugin: normalize heading levels so they never skip a level.
 */
function rehypeNormalizeHeadings() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { visit } = require("unist-util-visit");
  return (tree: any) => {
    const headings: { node: any; level: number }[] = [];
    visit(tree, "element", (node: any) => {
      if (/^h[1-6]$/.test(node.tagName)) {
        headings.push({ node, level: parseInt(node.tagName.charAt(1)) });
      }
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
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { visit } = require("unist-util-visit");
  return (tree: any) => {
    visit(tree, "element", (node: any, index: number | undefined, parent: any) => {
      if (!parent || index === undefined || node.tagName !== "p") return;

      const children = node.children;
      const imageContainers: any[] = [];
      let isImageRow = false;

      for (const child of children) {
        if (child.type === "element" && child.tagName === "img") {
          imageContainers.push({ wrapper: null, img: child });
        } else if (child.type === "element" && child.tagName === "a") {
          const imgs = (child.children || []).filter(
            (c: any) => c.type === "element" && c.tagName === "img"
          );
          if (imgs.length === 1) {
            imageContainers.push({ wrapper: child, img: imgs[0] });
          } else {
            return;
          }
        } else if (child.type === "text") {
          const text = child.value.trim();
          if (text === "|") {
            isImageRow = true;
          } else if (text !== "") {
            return;
          }
        } else if (child.type === "element" && child.tagName === "br") {
          // ignore line breaks
        } else {
          return;
        }
      }

      if (imageContainers.length < 2 || !isImageRow) return;

      let captionTexts: string[] = [];
      const nextSibling = parent.children[index + 1];
      if (nextSibling && nextSibling.type === "element" && nextSibling.tagName === "p") {
        const captionChildren = nextSibling.children;
        let allText = true;
        const texts: string[] = [];
        for (const child of captionChildren) {
          if (child.type === "text") {
            texts.push(...child.value.split("|").map((s: string) => s.trim()).filter(Boolean));
          } else if (child.type === "element" && child.tagName === "br") {
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

      const rowChildren = imageContainers.map(({ wrapper, img }: any, i: number) => {
        const imgWithClass = {
          ...img,
          properties: { ...img.properties, className: ["image-row-img"] },
        };
        const content = wrapper
          ? { ...wrapper, children: [imgWithClass] }
          : imgWithClass;

        return {
          type: "element",
          tagName: "figure",
          properties: { className: ["image-row-item"] },
          children: [
            content,
            ...(captionTexts[i] ? [{
              type: "element",
              tagName: "figcaption",
              properties: {},
              children: [{ type: "text", value: captionTexts[i] }],
            }] : []),
          ],
        };
      });

      parent.children[index] = {
        type: "element",
        tagName: "div",
        properties: { className: ["image-row"] },
        children: rowChildren,
      };
    });

    visit(tree, "element", (node: any) => {
      if (node.children) {
        node.children = node.children.filter((child: any) => !child.__remove);
      }
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

    while ((match = slugPattern.exec(md)) !== null) {
      slugs.add(match[1].trim());
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
  let processed = md;
  // Bold wrapping any inline HTML element: **<tag...>...</tag>**
  processed = processed.replace(
    /\*\*(<[a-z][a-z0-9]*\b[^>]*>.*?<\/[a-z][a-z0-9]*\s*>)\*\*/gi,
    (_, html) => `<strong>${html}</strong>`
  );
  // Bold wrapping self-closing elements: **<br />**, **<img.../>**, **<hr>**
  processed = processed.replace(
    /\*\*(<(?:br|img|hr|input|meta|link|area|col|embed|source|track|wbr)[^>]*\/?\s*>)\*\*/gi,
    (_, html) => `<strong>${html}</strong>`
  );
  // Bold wrapping mixed text + inline HTML: **text <em>more</em> tail**
  processed = processed.replace(
    /\*\*((?:(?!\*\*)[\s\S])*?<[a-z][a-z0-9]*\b[^>]*>.*?<\/[a-z][a-z0-9]*\s*>(?:(?!\*\*)[\s\S])*?)\*\*/gi,
    (m, inner) => {
      const innerStars = (inner.match(/\*\*/g) || []).length;
      return innerStars === 0 ? `<strong>${inner}</strong>` : m;
    }
  );

  const result = await remark()
    .use(remarkGfm)
    .use(remarkWikiLink, {
      permalinks: [],
      pageResolver: (name: string) => [name],
      hrefTemplate: (permalink: string) => {
        if (resolvedMap?.has(permalink)) {
          return resolvedMap.get(permalink)!;
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

  return result.toString();
}
