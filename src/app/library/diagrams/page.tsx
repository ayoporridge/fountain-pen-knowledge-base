import { Blueprint, ImagesSquare } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { DiagramRenderer } from "@/components/library/DiagramRenderer";
import { StatusBadge } from "@/components/library/StatusBadge";
import { getCitationsForTargets, getDiagramIndex } from "@/lib/library";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "图示馆 - 钢笔图书馆",
  description: "钢笔图书馆的站内原创结构图、机制图和专题图示。",
};

const DIAGRAM_TYPE_LABELS: Record<string, string> = {
  mechanism: "机制图",
  structure: "结构图",
  timeline: "时间线",
  family_tree: "系列树",
  size_compare: "尺寸对比",
  relationship: "关系图",
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
          Diagram Gallery
        </p>
        <h1 className="mb-3 text-3xl font-bold tracking-tight">图示馆</h1>
        <p
          className="text-base leading-relaxed"
          style={{ color: "var(--color-ink-light)" }}
        >
          这里集中展示站内原创 SVG
          图示。机制和结构先用可追溯的教育图解释，真实产品图片则进入媒体授权流程。
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
          <div key={diagram.slug} className="space-y-3">
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
                {DIAGRAM_TYPE_LABELS[diagram.diagram_type] ||
                  diagram.diagram_type}
              </span>
              <StatusBadge status={diagram.review_status} />
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
