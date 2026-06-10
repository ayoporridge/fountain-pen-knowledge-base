import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";
import remarkWikiLink from "remark-wiki-link";

/**
 * Render markdown with wiki-link support.
 * `[[entity-slug]]` becomes a clickable link to `/{type}/{slug}`.
 *
 * Fixes the sync/async mismatch: remark-wiki-link's hrefTemplate is synchronous,
 * but resolveHref (DB lookup) is async. We pre-resolve all [[slug]] matches
 * before invoking remark, then look up the results synchronously.
 *
 * @param md - Markdown string
 * @param resolveHref - optional async resolver for slug → href
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
        [...slugs].map(async (slug) => {
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
    .use(remarkHtml)
    .process(md);

  return result.toString();
}
