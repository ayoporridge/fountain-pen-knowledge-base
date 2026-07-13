import { Blueprint, ImagesSquare } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { DiagramRenderer } from "@/components/library/DiagramRenderer";
import { DIAGRAM_TYPE_LABELS } from "@/lib/constants";
import { getCitationsForTargets, getDiagramIndex } from "@/lib/library";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "图示馆",
  description: "钢笔图书馆的站内原创结构图、机制图和专题图示。",
  alternates: { canonical: "/library/diagrams" },
};

export default async function LibraryDiagramsPage() {
  const diagrams = await getDiagramIndex(80);
  const citations = await getCitationsForTargets(
    "diagram",
    diagrams.map((diagram) => diagram.id),
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8 max-w-3xl">
        <p
          className="mb-2 flex items-center gap-2 text-sm font-medium"
          style={{ color: "var(--color-accent)" }}
        >
          <ImagesSquare size={16} />
          结构与机制图
        </p>
        <h1 className="mb-3 text-3xl font-bold tracking-tight">图示馆</h1>
        <p
          className="text-base leading-relaxed"
          style={{ color: "var(--color-ink-light)" }}
        >
          这里用站内绘制的 SVG
          图示解释钢笔结构与工作机制；有参考资料的图示会同时列出来源。
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {Object.entries(DIAGRAM_TYPE_LABELS).map(([type, label]) => (
          <span
            key={type}
            className="rounded-full border px-3 py-1 text-sm"
            style={{
              borderColor: "var(--color-border)",
              color: "var(--color-ink-muted)",
            }}
          >
            {label}
          </span>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {diagrams.map((diagram) => (
          <div key={diagram.slug} className="min-w-0 space-y-3">
            <DiagramRenderer
              diagram={diagram}
              citations={citations.filter(
                (citation) => citation.target_id === diagram.id,
              )}
              compact
            />
            <div
              className="flex flex-wrap items-center gap-2 text-sm"
              style={{ color: "var(--color-ink-muted)" }}
            >
              <Blueprint size={16} style={{ color: "var(--color-accent)" }} />
              <span>
                {DIAGRAM_TYPE_LABELS[diagram.diagram_type] || "资料图"}
              </span>
              {diagram.entity_type &&
                diagram.entity_slug &&
                diagram.entity_name && (
                  <Link
                    href={`/${diagram.entity_type}/${diagram.entity_slug}`}
                    className="ink-underline"
                  >
                    关联：{diagram.entity_name}
                  </Link>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
