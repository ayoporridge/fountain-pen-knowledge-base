import { queryOne } from "@/lib/db";
import { renderMarkdown } from "@/lib/markdown";
import { MarkdownHtml } from "./MarkdownHtml";

interface MarkdownRendererProps {
  content: string;
}

export async function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Resolve wiki-links: [[slug]] → /{type}/{slug}
  const resolveHref = async (slug: string): Promise<string | null> => {
    const entity = (await queryOne(
      `SELECT type, slug
       FROM public_entities
       WHERE slug = ?
       ORDER BY type, slug
       LIMIT 1`,
      [slug],
    )) as { type: string; slug: string } | undefined;
    if (entity) {
      return `/${entity.type}/${entity.slug}`;
    }
    return null;
  };

  const html = await renderMarkdown(content, resolveHref);

  return <MarkdownHtml html={html} />;
}
