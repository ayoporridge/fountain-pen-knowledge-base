import { queryOne } from "@/lib/db";
import { renderMarkdown } from "@/lib/markdown";

interface MarkdownRendererProps {
  content: string;
}

export async function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Resolve wiki-links: [[slug]] → /{type}/{slug}
  const resolveHref = async (slug: string): Promise<string | null> => {
    const entity = await queryOne(
      "SELECT type, slug FROM entities WHERE slug = ?",
      [slug]
    ) as { type: string; slug: string } | undefined;
    if (entity) {
      return `/${entity.type}/${entity.slug}`;
    }
    return null;
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
