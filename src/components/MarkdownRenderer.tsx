import { getDb } from "@/lib/db";
import { renderMarkdown } from "@/lib/markdown";

interface MarkdownRendererProps {
  content: string;
}

export async function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const db = await getDb();

  // Pre-fetch all entity slugs referenced in wiki-links
  // Extract [[slug]] patterns from content
  const wikiLinkRegex = /\[\[([^\]]+)\]\]/g;
  const slugs: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = wikiLinkRegex.exec(content)) !== null) {
    slugs.push(match[1]);
  }

  // Build a lookup map for resolved hrefs
  const hrefMap = new Map<string, string>();
  for (const slug of slugs) {
    const entity = await db
      .prepare("SELECT type, slug FROM entities WHERE slug = ?")
      .bind(slug)
      .first() as { type: string; slug: string } | null;
    if (entity) {
      hrefMap.set(slug, `/${entity.type}/${entity.slug}`);
    }
  }

  // Resolve wiki-links: [[slug]] → /{type}/{slug}
  const resolveHref = (slug: string): string | null => {
    return hrefMap.get(slug) || null;
  };

  const html = await renderMarkdown(content, resolveHref);

  return (
    <div
      className="prose dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: markdown rendered via remark
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
