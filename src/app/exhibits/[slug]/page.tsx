import { ArrowLeft, Compass } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { getExhibit, getExhibitSections } from "@/lib/library";

export const dynamic = "force-dynamic";

interface ExhibitDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ExhibitDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const exhibit = await getExhibit(decodeURIComponent(slug));
  if (!exhibit) return { title: "展览未找到 - 钢笔图书馆" };
  return {
    title: `${exhibit.title} - 钢笔图书馆`,
    description: exhibit.summary || "钢笔图书馆策展专题",
  };
}

function parseJsonList(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export default async function ExhibitDetailPage({
  params,
}: ExhibitDetailPageProps) {
  const { slug } = await params;
  const exhibit = await getExhibit(decodeURIComponent(slug));
  if (!exhibit) notFound();

  const sections = await getExhibitSections(exhibit.id);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link
        href="/exhibits"
        className="mb-6 inline-flex items-center gap-1 text-sm ink-underline"
        style={{ color: "var(--color-ink-muted)" }}
      >
        <ArrowLeft size={14} />
        返回展览
      </Link>

      <header className="mb-8">
        <p
          className="mb-2 flex items-center gap-2 text-sm font-medium"
          style={{ color: "var(--color-accent)" }}
        >
          <Compass size={16} />
          {exhibit.status}
        </p>
        <h1 className="mb-3 text-3xl font-bold tracking-tight">
          {exhibit.title}
        </h1>
        {exhibit.summary && (
          <p
            className="text-lg leading-relaxed"
            style={{ color: "var(--color-ink-light)" }}
          >
            {exhibit.summary}
          </p>
        )}
      </header>

      <div className="space-y-6">
        {sections.map((section) => {
          const relatedSlugs = parseJsonList(section.related_entity_slugs_json);
          const diagramSlugs = parseJsonList(section.diagram_slugs_json);
          return (
            <section
              key={section.id}
              className="rounded-xl border p-5"
              style={{
                borderColor: "var(--color-border)",
                backgroundColor: "var(--color-surface-raised)",
              }}
            >
              <div
                className="mb-2 text-xs"
                style={{ color: "var(--color-ink-muted)" }}
              >
                Section {section.position + 1}
              </div>
              <h2 className="mb-4 text-xl font-semibold">{section.title}</h2>
              <MarkdownRenderer content={section.body_md} />
              {(relatedSlugs.length > 0 || diagramSlugs.length > 0) && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {relatedSlugs.map((item) => (
                    <span
                      key={item}
                      className="rounded-full px-2.5 py-1 text-xs"
                      style={{
                        backgroundColor: "var(--color-surface-dim)",
                        color: "var(--color-ink-muted)",
                      }}
                    >
                      实体：{item}
                    </span>
                  ))}
                  {diagramSlugs.map((item) => (
                    <span
                      key={item}
                      className="rounded-full px-2.5 py-1 text-xs"
                      style={{
                        backgroundColor: "var(--color-accent-light)",
                        color: "var(--color-accent)",
                      }}
                    >
                      图示：{item}
                    </span>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
