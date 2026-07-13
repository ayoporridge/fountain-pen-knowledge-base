import { queryOne } from "@/lib/db";
import { renderMarkdown } from "@/lib/markdown";
import { publicEntityFilter } from "@/lib/public-visibility";
import { MarkdownHtml } from "./MarkdownHtml";

interface MarkdownRendererProps {
  content: string;
}

export async function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Resolve wiki-links: [[slug]] → /{type}/{slug}
  const resolveHref = async (slug: string): Promise<string | null> => {
    const entity = (await queryOne(
      `SELECT e.type, e.slug FROM entities e
       WHERE e.slug = ? AND ${publicEntityFilter("e")}`,
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
