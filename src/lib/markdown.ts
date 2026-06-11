import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeRaw from "rehype-raw";
import remarkWikiLink from "remark-wiki-link";

/**
 * Rehype plugin: transform paragraphs that contain only images separated by
 * `|` into a horizontal flex row. This handles the pattern:
 *   ![img1](url1) | ![img2](url2) | ![img3](url3)
 * which the original Richard's Pens content uses for side-by-side comparisons.
 */
function rehypeImageRows() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { visit } = require("unist-util-visit");
  return (tree: any) => {
    visit(tree, "element", (node: any, index: number | undefined, parent: any) => {
      if (!parent || index === undefined || node.tagName !== "p") return;

      const children = node.children;
      const images: any[] = [];
      let isImageRow = false;

      for (const child of children) {
        if (child.type === "element" && child.tagName === "img") {
          images.push(child);
        } else if (child.type === "text") {
          const text = child.value.trim();
          if (text === "|") {
            isImageRow = true;
          } else if (text !== "") {
            return; // Non-image, non-pipe text → not an image row
          }
        } else if (child.type === "element" && child.tagName === "br") {
          // ignore line breaks
        } else {
          return; // Any other element → not a pure image row
        }
      }

      // Must have 2+ images and pipe separators to qualify
      if (images.length < 2 || !isImageRow) return;

      // Check if the next sibling is a caption row (e.g. "垂直握持 | 逆时针旋转 | 顺时针旋转")
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
        if (allText && texts.length === images.length) {
          captionTexts = texts;
          nextSibling.__remove = true;
        }
      }

      // Build a flex container with figures
      const rowChildren = images.map((img: any, i: number) => ({
        type: "element",
        tagName: "figure",
        properties: { className: ["image-row-item"] },
        children: [
          { ...img, properties: { ...img.properties, className: ["image-row-img"] } },
          ...(captionTexts[i] ? [{
            type: "element",
            tagName: "figcaption",
            properties: {},
            children: [{ type: "text", value: captionTexts[i] }],
          }] : []),
        ],
      }));

      parent.children[index] = {
        type: "element",
        tagName: "div",
        properties: { className: ["image-row"] },
        children: rowChildren,
      };
    });

    // Remove caption paragraphs that were consumed
    visit(tree, "element", (node: any) => {
      if (node.children) {
        node.children = node.children.filter((child: any) => !child.__remove);
      }
    });
  };
}

/**
 * Render markdown with wiki-link support.
 * `[[entity-slug]]` becomes a clickable link to `/{type}/{slug}`.
 */
export async function renderMarkdown(
  md: string,
  resolveHref?: (slug: string) => Promise<string | null> | string | null,
): Promise<string> {
  // Pre-resolve all wiki-links if an async resolver is provided
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
    .use(rehypeStringify)
    .process(md);

  return result.toString();
}
