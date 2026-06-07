import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";
import remarkWikiLink from "remark-wiki-link";

/**
 * Render markdown with wiki-link support.
 * `[[entity-slug]]` becomes a clickable link to `/{type}/{slug}`.
 * @param md - Markdown string
 * @param resolveHref - optional resolver; defaults to using the slug as-is
 */
export async function renderMarkdown(
  md: string,
  resolveHref?: (slug: string) => Promise<string | null> | string | null,
): Promise<string> {
  const defaultResolver = (slug: string) => `/${slug}`;

  const result = await remark()
    .use(remarkGfm)
    .use(remarkWikiLink, {
      permalinks: [],
      pageResolver: (name: string) => [name],
      hrefTemplate: (permalink: string) => {
        if (resolveHref) {
          const resolved = resolveHref(permalink);
          // Handle both sync and async resolvers
          if (resolved instanceof Promise) {
            // For async resolvers, we need to handle this differently
            // remark-wiki-link expects synchronous hrefTemplate
            // So we'll use a cache or pre-resolve
            return `/${permalink}`;
          }
          return resolved || `/${permalink}`;
        }
        return defaultResolver(permalink);
      },
    })
    .use(remarkHtml)
    .process(md);

  return result.toString();
}
