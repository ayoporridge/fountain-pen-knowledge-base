import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import remarkWikiLink from "remark-wiki-link";

const RICHARDS_PENS_BASE = "https://www.richardspens.com/";
const BLOCKED_LEGACY_IMAGE_PATHS = new Set([
  "/images/pixel.gif",
  "/images/ref/adventures/04/dome.jpg",
  "/images/ref/fillers/capillary/Fr1040173A-5.png",
  "/images/ref/fillers/piston/US20140241783A-3.png",
  "/images/ref/history/dip_less/handi_pen.jpg",
  "/images/ref/history/war_and_fp/p-51_ad.jpg",
  "/images/ref/nibs/beyond/angle.gif",
  "/images/ref/pendoctor/speedline_filler.jpg",
  "/images/ref/penshows/susan_colo_2014.jpg",
]);

const LEGACY_IMAGE_BADGES = new Map([
  ["/images/icons/lg/info.png", "说明"],
  ["/images/icons/lg/caution.png", "注意"],
  ["/images/icons/lg/warning.png", "警告"],
  ["/images/ref/pendoctor/q.png", "问"],
  ["/images/ref/pendoctor/rx.png", "答"],
]);

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

export type StoryHeading = {
  id: string;
  label: string;
  level: 2 | 3;
};

export type RenderedMarkdownDocument = {
  html: string;
  headings: StoryHeading[];
};

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
  const trimmed = value.trim().replaceAll("&amp;", "&");
  if (/^https?:/i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      if (
        ["richardspens.com", "www.richardspens.com"].includes(
          parsed.hostname.toLowerCase(),
        )
      ) {
        parsed.protocol = "https:";
        parsed.pathname = parsed.pathname.replace(
          "/images/ref/repair/plush/",
          "/images/ref/repair/plunger/",
        );
        return parsed.toString();
      }
    } catch {
      return trimmed;
    }
    return trimmed;
  }
  if (/^(?:mailto:|#)/i.test(trimmed)) return trimmed;
  if (/^(?:\.\.?\/|\/)?[^?#]+\.html?(?:[?#].*)?$/i.test(trimmed)) {
    return new URL(trimmed.replace(/^\/+/, ""), RICHARDS_PENS_BASE).toString();
  }
  if (/^\/(?:books|pdf|ref|images|xf)\//i.test(trimmed)) {
    return new URL(trimmed.slice(1), RICHARDS_PENS_BASE).toString();
  }
  if (/^(?:books|pdf|ref|images|xf)\//i.test(trimmed)) {
    return new URL(trimmed, RICHARDS_PENS_BASE).toString();
  }
  return trimmed;
}

function decodeLegacyAlert(value: string): string {
  try {
    return decodeURIComponent(value.replace(/\\'/g, "'").replace(/\\"/g, '"'));
  } catch {
    return value;
  }
}

/**
 * RichardsPens used javascript: links for glossary popups and image viewers.
 * Preserve their readable label (and alert definition), but never emit a fake
 * or executable link in the archive.
 */
function normalizeLegacyJavascriptLinks(md: string): string {
  return md
    .split("\n")
    .map((originalLine) => {
      let line = originalLine;

      while (/\]\((?:<)?javascript:/i.test(line)) {
        const markerMatch = /\]\((?:<)?javascript:/i.exec(line);
        if (!markerMatch) break;
        const labelClose = markerMatch.index;
        let depth = 1;
        let labelOpen = labelClose - 1;
        for (; labelOpen >= 0; labelOpen -= 1) {
          if (line[labelOpen] === "]") depth += 1;
          if (line[labelOpen] === "[") {
            depth -= 1;
            if (depth === 0) break;
          }
        }
        if (labelOpen < 0) break;

        const destinationStart = labelClose + 2;
        const destinationTail = line.slice(destinationStart);
        const usesAngles = destinationTail.startsWith("<");
        let end = line.length;
        if (usesAngles) {
          const angleEnd = line.indexOf(">", destinationStart);
          if (angleEnd >= 0) {
            const suffix = line.slice(angleEnd + 1).match(/^\s*(?:"[^"]*")?\)/);
            end = angleEnd + 1 + (suffix?.[0].length || 0);
          }
        } else {
          const suffix = destinationTail.match(/;\s*(?:"[^"]*")?\)/);
          if (suffix?.index !== undefined) {
            end = destinationStart + suffix.index + suffix[0].length;
          }
        }

        const label = line.slice(labelOpen + 1, labelClose);
        const destination = line.slice(destinationStart, end);
        const alertMatch = destination.match(
          /javascript:alert\\?\('([\s\S]*)'\\?\)/i,
        );
        const replacement = /javascript:self\.history\.back/i.test(destination)
          ? ""
          : alertMatch
            ? `${label}（${decodeLegacyAlert(alertMatch[1])}）`
            : label;
        line = `${line.slice(0, labelOpen)}${replacement}${line.slice(end)}`;
      }

      return line;
    })
    .join("\n");
}

function legacyImageBadge(value: string): string | null {
  try {
    return (
      LEGACY_IMAGE_BADGES.get(new URL(value, RICHARDS_PENS_BASE).pathname) ||
      null
    );
  } catch {
    return null;
  }
}

function isBlockedLegacyImage(value: string): boolean {
  if (/^https?:\/\/example\.com\//i.test(value)) return true;
  if (
    /^\/(?:article|brand|browse|by|concept|exhibits|fill_system|graph|library|material|nib|pen|timeline)(?:\/|\?|#|$)/i.test(
      value,
    )
  ) {
    return true;
  }
  try {
    const parsed = new URL(value, RICHARDS_PENS_BASE);
    return (
      ["richardspens.com", "www.richardspens.com"].includes(
        parsed.hostname.toLowerCase(),
      ) && BLOCKED_LEGACY_IMAGE_PATHS.has(parsed.pathname)
    );
  } catch {
    return true;
  }
}

function normalizeLegacyImageCaptions(md: string): string {
  return md.replace(
    /!\[([^\]]*)\]\(([^)\s]+)\)\s{0,2}\n---\s{0,2}\n[\u00a0\s]*\|\s*([^\n]+)/g,
    (_, alt: string, src: string, caption: string) => {
      const normalizedSrc = normalizeRichardsPensUrl(src);
      const publicAlt = alt.trim() || caption.trim() || "资料插图";
      return `<figure class="image-figure"><img src="${escapeHtmlAttr(
        normalizedSrc,
      )}" alt="${escapeHtmlAttr(publicAlt)}" /><figcaption>${escapeHtmlText(
        caption.trim(),
      )}</figcaption></figure>\n`;
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

function normalizeLegacyMarkdownLinkDestinations(md: string): string {
  return md.replace(
    /\]\(<((?:books|pdf|ref|images|xf)\/[^>]+)>\s*(?:"([^"]*)")?\)/gi,
    (_, legacyPath: string, title: string | undefined) => {
      const href = normalizeRichardsPensUrl(legacyPath);
      return `](${href}${title ? ` "${title}"` : ""})`;
    },
  );
}

function normalizeLegacyTableSeparators(md: string): string {
  return md
    .split("\n")
    .filter((line) => !/^\s*>?\s*-{2,}\s*\|\s*-{2,}\s*$/.test(line))
    .join("\n");
}

function removeLegacyInteractionNotes(md: string): string {
  const lines = md.split("\n");
  const output: string[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]
      .replace(/[（(]点击图片可查看(?:放大)?(?:细节|细节大图|大图)[）)]/g, "")
      .replace(/[（(]点击(?:上图|图片)可放大查看[）)]/g, "");
    if (
      /^\s*>/.test(line) &&
      /javascript:showPop|images\/icons\/lg\//i.test(line)
    ) {
      const block: string[] = [line];
      while (index + 1 < lines.length && /^\s*>/.test(lines[index + 1])) {
        index += 1;
        block.push(lines[index]);
      }
      const text = block.join("\n");
      if (
        /本页部分图片[^\n]*(?:点击|放大)|图片可点击放大|鼠标悬停|触屏设备|长按图片/.test(
          text,
        )
      ) {
        continue;
      }
      output.push(...block);
      continue;
    }

    if (
      /javascript:/i.test(line) &&
      /返回上一页|返回顶部|返回目录|上一页|下一页|关闭窗口|打印本页/.test(line)
    ) {
      continue;
    }

    if (
      /本页部分图片[^\n]*(?:点击|放大)|图片可点击放大|鼠标悬停|触屏设备|长按图片/.test(
        line,
      )
    ) {
      continue;
    }

    if (
      /^(?:本文|本页|本内容)(?:所含|所载)?信息(?:力求|尽可能)/.test(line.trim())
    ) {
      const creditStart = line.search(
        /特别感谢|部分[^\n]{0,30}信息由|关于[^\n]{0,40}信息由|需特别说明|感谢[A-Za-z\u4e00-\u9fff]/,
      );
      if (creditStart >= 0) output.push(line.slice(creditStart).trim());
      continue;
    }

    if (
      /^(?:#{1,6}\s*)?(?:本文|本内容)(?:亦|也)?收录于|^(?:#{1,6}\s*)?(?:本文|本内容)节选自/.test(
        line.trim(),
      ) &&
      /电子书|电子版|e-?book|RichardsPens(?:钢笔指南| Guide)|购买Richard/i.test(
        line,
      )
    ) {
      continue;
    }
    output.push(line);
  }

  return output.join("\n");
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
      .map((image, imageIndex) => {
        const src = normalizeRichardsPensUrl(image.src);
        const caption =
          captions[imageIndex] || meaningfulImageCaption(image.alt);
        const alt = image.alt.trim() || caption || "资料插图";
        const tagName = caption ? "figure" : "div";
        return `<${tagName} class="image-row-item"><img class="image-row-img" src="${escapeHtmlAttr(
          src,
        )}" alt="${escapeHtmlAttr(alt)}" />${
          caption ? `<figcaption>${escapeHtmlText(caption)}</figcaption>` : ""
        }</${tagName}>`;
      })
      .join("");

    output.push(`<div class="image-row">${figures}</div>`, "");
  }

  return output.join("\n");
}

function meaningfulImageCaption(value: string | undefined): string {
  const caption = String(value || "").trim();
  if (!caption) return "";
  if (
    /^(?:资料插图|图片|照片|钢笔|fountain\s*pen|pen|photo|image)(?:\s*\d+)?$/i.test(
      caption,
    )
  ) {
    return "";
  }
  return caption;
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
      "",
    );
  }

  return output.join("\n");
}

function normalizeResidualBoldHtml(html: string): string {
  const withInlineHtml = html.replace(
    /\*\*((?:(?!\*\*)[^\n])*?<((?:strong|em|a|span|code))\b[^>\n]*>.*?<\/\2>(?:(?!\*\*)[^\n])*?)\*\*/gi,
    (_, inner: string) => `<strong>${inner}</strong>`,
  );

  return withInlineHtml
    .split(/(<[^>]+>)/g)
    .map((part) => {
      if (part.startsWith("<")) return part;
      return part.replace(
        /\*\*([^*\n]{1,500})\*\*/g,
        (_, inner: string) => `<strong>${inner}</strong>`,
      );
    })
    .join("");
}

/**
 * Rehype plugin: sanitize dangerous URLs in href and src attributes.
 */
function rehypeSanitizeUrls() {
  return (tree: HastNode) => {
    const seenImageSources = new Set<string>();
    visitElements(tree, (node): false | undefined => {
      const properties = ensureProperties(node);

      if (
        new Set([
          "script",
          "iframe",
          "object",
          "embed",
          "form",
          "input",
          "button",
          "textarea",
          "select",
          "option",
          "meta",
          "link",
          "base",
        ]).has(node.tagName)
      ) {
        node.tagName = "span";
        node.properties = { hidden: true, ariaHidden: true };
        node.children = [];
        return false;
      }

      for (const propertyName of Object.keys(properties)) {
        if (/^on/i.test(propertyName)) {
          delete properties[propertyName];
        }
      }
      if (
        properties.style &&
        /(?:expression\s*\(|javascript\s*:|behavior\s*:)/i.test(
          String(properties.style),
        )
      ) {
        delete properties.style;
      }

      if (node.tagName === "a" && properties.href) {
        const href = String(properties.href);
        if (/^\s*javascript:/i.test(href)) {
          node.tagName = "span";
          node.properties = {};
        } else {
          const normalizedHref = normalizeRichardsPensUrl(href).replace(
            /\.mdx?$/i,
            "",
          );
          if (
            /^(?:https?:|#)/i.test(normalizedHref) ||
            /^\/$/.test(normalizedHref) ||
            /^\/(?:article|brand|browse|by|compare|concept|exhibits|fill_system|graph|library|material|nib|pen|timeline)(?:\/|\?|#|$)/.test(
              normalizedHref,
            )
          ) {
            properties.href = normalizedHref;
          } else if (
            /^\/?(?:books|pdf|images|ref|xf)\//i.test(normalizedHref)
          ) {
            properties.href = new URL(
              normalizedHref.replace(/^\/+/, ""),
              RICHARDS_PENS_BASE,
            ).toString();
          } else {
            node.tagName = "span";
            node.properties = {};
          }
        }
      }

      // Rewrite richardspens.com image URLs through our proxy
      if (node.tagName === "img" && properties.src) {
        const src = String(properties.src);
        if (/^\s*javascript:/i.test(src)) {
          node.tagName = "span";
          node.properties = { hidden: true, ariaHidden: true };
          node.children = [];
        } else {
          const normalizedSrc = normalizeRichardsPensUrl(src);
          const badge = legacyImageBadge(normalizedSrc);
          if (badge) {
            node.tagName = "span";
            node.properties = { className: ["legacy-note-badge"] };
            node.children = [{ type: "text", value: badge }];
          } else if (isBlockedLegacyImage(normalizedSrc)) {
            node.tagName = "span";
            node.properties = { hidden: true, ariaHidden: true };
            node.children = [];
          } else if (/richardspens\.com/i.test(normalizedSrc)) {
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
        properties.alt = String(properties.alt || "").trim() || "资料插图";
        properties.loading = "lazy";
        properties.decoding = "async";
        const publicSrc = String(properties.src || "");
        if (publicSrc && seenImageSources.has(publicSrc)) {
          node.tagName = "span";
          node.properties = { hidden: true, ariaHidden: true };
          node.children = [];
        } else if (publicSrc) {
          seenImageSources.add(publicSrc);
        }
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
          node.tagName = "span";
          node.properties = { hidden: true, ariaHidden: true };
          node.children = [];
        }
      }

      if (node.tagName === "a" && !node.properties?.href) {
        node.tagName = "span";
        delete properties.title;
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

    if (headings.length === 0) return;

    const levelOffset = 2 - headings[0].level;
    const newLevels: number[] = [2];
    for (let i = 1; i < headings.length; i++) {
      const prev = newLevels[i - 1];
      const cur = Math.min(6, Math.max(2, headings[i].level + levelOffset));
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

function readableNodeText(node: HastNode): string {
  if (node.type === "text") return String(node.value || "");
  return (node.children || []).map(readableNodeText).join("");
}

function headingSlug(label: string, fallbackIndex: number): string {
  const slug = label
    .normalize("NFKC")
    .trim()
    .toLocaleLowerCase("zh-CN")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  return slug || `section-${fallbackIndex + 1}`;
}

function rehypeCollectHeadingIds(headings: StoryHeading[]) {
  return (tree: HastNode) => {
    const counts = new Map<string, number>();
    visitElements(tree, (node): undefined => {
      if (node.tagName !== "h2" && node.tagName !== "h3") return undefined;

      const label = readableNodeText(node).replace(/\s+/g, " ").trim();
      if (!label) return undefined;
      const baseId = headingSlug(label, headings.length);
      const occurrence = (counts.get(baseId) || 0) + 1;
      counts.set(baseId, occurrence);
      const id = occurrence === 1 ? baseId : `${baseId}-${occurrence}`;
      ensureProperties(node).id = id;
      headings.push({
        id,
        label,
        level: node.tagName === "h2" ? 2 : 3,
      });
      return undefined;
    });
  };
}

function rehypeImageFigures() {
  return (tree: HastNode) => {
    visitElements(tree, (node, index, parent) => {
      if (
        !parent?.children ||
        index === undefined ||
        !isElementNode(node, "p")
      ) {
        return;
      }

      const meaningfulChildren = (node.children || []).filter(
        (child) => child.type !== "text" || String(child.value || "").trim(),
      );
      if (meaningfulChildren.length !== 1) return;

      const onlyChild = meaningfulChildren[0];
      const image = isElementNode(onlyChild, "img")
        ? onlyChild
        : isElementNode(onlyChild, "a")
          ? (onlyChild.children || []).find((child) =>
              isElementNode(child, "img"),
            )
          : undefined;
      if (!image || !isElementNode(image, "img")) return;

      const caption = meaningfulImageCaption(
        String(image.properties?.alt || ""),
      );
      if (!caption) return;
      parent.children[index] = {
        type: "element",
        tagName: "figure",
        properties: { className: ["image-figure"] },
        children: [
          onlyChild,
          ...(caption
            ? [
                {
                  type: "element",
                  tagName: "figcaption",
                  properties: {},
                  children: [{ type: "text", value: caption }],
                } as HastNode,
              ]
            : []),
        ],
      };
      return false;
    });
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
      let isImageRow = false;
      let seenBr = false;
      let afterBrText = "";
      let imageAfterBr = false;

      const pushImage = (container: ImageContainer) => {
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
          } else if (text.includes("|")) {
            isImageRow = true;
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

      const rowChildren = imageContainers.map(
        ({ wrapper, img }, imageIndex) => {
          const caption =
            captionTexts[imageIndex] ||
            meaningfulImageCaption(String(img.properties?.alt || ""));
          const imgWithClass: HastNode = {
            ...img,
            properties: {
              ...img.properties,
              alt:
                String(img.properties?.alt || "").trim() ||
                caption ||
                "资料插图",
              className: ["image-row-img"],
            },
          };
          const content: HastNode = wrapper
            ? { ...wrapper, children: [imgWithClass] }
            : imgWithClass;

          return {
            type: "element",
            tagName: caption ? "figure" : "div",
            properties: { className: ["image-row-item"] },
            children: [
              content,
              ...(caption
                ? [
                    {
                      type: "element",
                      tagName: "figcaption",
                      properties: {},
                      children: [{ type: "text", value: caption }],
                    } as HastNode,
                  ]
                : []),
            ],
          };
        },
      );

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
export async function renderMarkdownDocument(
  md: string,
  resolveHref?: (slug: string) => Promise<string | null> | string | null,
): Promise<RenderedMarkdownDocument> {
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
        normalizeLegacyTableSeparators(
          normalizeBoldMarkdownLinks(
            normalizeLegacyMarkdownLinkDestinations(
              removeLegacyInteractionNotes(normalizeLegacyJavascriptLinks(md)),
            ),
          ),
        ),
      ),
    ),
  );
  if (resolvedMap) {
    processed = processed.replace(
      /\[\[([^\]]+)\]\]/g,
      (original, rawSlug: string) =>
        resolvedMap?.has(rawSlug.trim()) ? original : rawSlug.trim(),
    );
  }
  // Bold wrapping a same-line inline HTML element. Restricting the tag set is
  // important: a closing ** from one paragraph must never consume block HTML
  // until the next bold marker.
  processed = processed.replace(
    /\*\*(<((?:a|em|span|code|small|mark|kbd|sup|sub))\b[^>]*>.*?<\/\2\s*>)\*\*/gi,
    (_, html) => `<strong>${html}</strong>`,
  );
  // Bold wrapping same-line phrasing elements such as **<img...>**.
  processed = processed.replace(
    /\*\*(<(?:br|img|wbr)[^>]*\/?\s*>)\*\*/gi,
    (_, html) => `<strong>${html}</strong>`,
  );

  const headings: StoryHeading[] = [];
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
    .use(rehypeImageFigures)
    .use(rehypeNormalizeHeadings)
    .use(() => rehypeCollectHeadingIds(headings))
    .use(rehypeSanitizeUrls)
    .use(rehypeStringify)
    .process(processed);

  return {
    html: normalizeResidualBoldHtml(result.toString()),
    headings,
  };
}

export async function renderMarkdown(
  md: string,
  resolveHref?: (slug: string) => Promise<string | null> | string | null,
): Promise<string> {
  return (await renderMarkdownDocument(md, resolveHref)).html;
}
