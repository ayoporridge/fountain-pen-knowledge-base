import { renderMarkdown } from "@/lib/markdown";

interface MarkdownRendererProps {
  content: string;
}

export async function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const html = await renderMarkdown(content);

  return (
    <div
      className="prose dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-a:text-blue-600 dark:prose-a:text-blue-400"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: markdown rendered via remark
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
