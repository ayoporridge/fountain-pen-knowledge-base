import {
  Books,
  ChartBar,
  MagnifyingGlass,
  PenNib,
  WarningCircle,
} from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { StatusBadge } from "@/components/library/StatusBadge";
import {
  getLibraryCoverageReport,
  type LibraryCoverageEntityRecord,
} from "@/lib/library";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "馆藏覆盖 - 钢笔图书馆",
  description: "钢笔图书馆的品牌与型号内容覆盖审计。",
};

const TYPE_LABELS: Record<string, string> = {
  brand: "品牌",
  pen: "型号",
};

function percent(value: number, total: number) {
  if (total === 0) return "0%";
  return `${Math.round((value / total) * 100)}%`;
}

function CoverageEntityCard({
  entity,
}: {
  entity: LibraryCoverageEntityRecord;
}) {
  return (
    <Link
      href={`/${entity.type}/${entity.slug}`}
      className="rounded-xl border p-4 transition-colors hover:bg-[var(--color-surface-dim)]"
      style={{
        borderColor: "var(--color-border)",
        backgroundColor: "var(--color-surface-raised)",
        color: "var(--color-ink)",
      }}
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <StatusBadge status={entity.coverage_status} />
        <span className="text-xs" style={{ color: "var(--color-ink-muted)" }}>
          {TYPE_LABELS[entity.type] || entity.type} · {entity.coverage_score}
        </span>
      </div>
      <h3 className="font-semibold">{entity.name}</h3>
      {entity.summary && (
        <p
          className="mt-1 line-clamp-2 text-sm leading-relaxed"
          style={{ color: "var(--color-ink-muted)" }}
        >
          {entity.summary}
        </p>
      )}
      <div
        className="mt-3 flex flex-wrap gap-1 text-xs"
        style={{ color: "var(--color-ink-muted)" }}
      >
        {entity.missing_items.slice(0, 7).map((item) => (
          <span
            key={item}
            className="rounded-full border px-2 py-0.5"
            style={{ borderColor: "var(--color-border)" }}
          >
            缺{item}
          </span>
        ))}
      </div>
      <div
        className="mt-3 grid grid-cols-3 gap-2 text-xs"
        style={{ color: "var(--color-ink-muted)" }}
      >
        <span>故事 {entity.story_count}</span>
        <span>事实 {entity.claim_count}</span>
        <span>来源 {entity.reference_count}</span>
        <span>媒体 {entity.media_count}</span>
        <span>图示 {entity.diagram_count}</span>
        <span>时间线 {entity.event_count}</span>
      </div>
    </Link>
  );
}

export default async function LibraryCoveragePage() {
  const report = await getLibraryCoverageReport(18);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8 max-w-3xl">
        <p
          className="mb-2 flex items-center gap-2 text-sm font-medium"
          style={{ color: "var(--color-accent)" }}
        >
          <MagnifyingGlass size={16} />
          Library Coverage
        </p>
        <h1 className="mb-3 text-3xl font-bold tracking-tight">馆藏覆盖</h1>
        <p
          className="text-base leading-relaxed"
          style={{ color: "var(--color-ink-light)" }}
        >
          用同一套指标审视品牌和型号的资料完整度，优先找出缺故事、缺来源、缺规格、缺图示和缺媒体的页面。
        </p>
      </div>

      <div className="mb-8 grid gap-3 md:grid-cols-2">
        {report.summaries.map((summary) => (
          <section
            key={summary.type}
            className="rounded-xl border p-5"
            style={{
              borderColor: "var(--color-border)",
              backgroundColor: "var(--color-surface-raised)",
            }}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-xl font-semibold">
                {summary.type === "brand" ? (
                  <Books size={20} style={{ color: "var(--color-accent)" }} />
                ) : (
                  <PenNib size={20} style={{ color: "var(--color-accent)" }} />
                )}
                {TYPE_LABELS[summary.type]}覆盖
              </h2>
              <div
                className="text-2xl font-semibold"
                style={{ color: "var(--color-accent)" }}
              >
                {summary.average_score}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <div className="font-medium">{summary.total}</div>
                <div style={{ color: "var(--color-ink-muted)" }}>总量</div>
              </div>
              <div>
                <div className="font-medium">{summary.ready}</div>
                <div style={{ color: "var(--color-ink-muted)" }}>ready</div>
              </div>
              <div>
                <div className="font-medium">{summary.gap}</div>
                <div style={{ color: "var(--color-ink-muted)" }}>gap</div>
              </div>
            </div>
            <div
              className="mt-4 grid grid-cols-2 gap-2 text-sm"
              style={{ color: "var(--color-ink-muted)" }}
            >
              <span>
                有故事 {summary.with_stories}/{summary.total} ·{" "}
                {percent(summary.with_stories, summary.total)}
              </span>
              <span>
                有事实 {summary.with_claims}/{summary.total} ·{" "}
                {percent(summary.with_claims, summary.total)}
              </span>
              <span>
                有来源 {summary.with_references}/{summary.total} ·{" "}
                {percent(summary.with_references, summary.total)}
              </span>
              <span>
                有媒体 {summary.with_media}/{summary.total} ·{" "}
                {percent(summary.with_media, summary.total)}
              </span>
              <span>
                有图示 {summary.with_diagrams}/{summary.total} ·{" "}
                {percent(summary.with_diagrams, summary.total)}
              </span>
              <span>
                有时间线 {summary.with_events}/{summary.total} ·{" "}
                {percent(summary.with_events, summary.total)}
              </span>
            </div>
          </section>
        ))}
      </div>

      <section className="mb-10">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
          <WarningCircle size={20} style={{ color: "var(--color-accent)" }} />
          优先补全
        </h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <h3 className="mb-3 flex items-center gap-2 font-semibold">
              <Books size={18} style={{ color: "var(--color-accent)" }} />
              品牌
            </h3>
            <div className="grid gap-3">
              {report.priorityBrands.map((entity) => (
                <CoverageEntityCard key={entity.id} entity={entity} />
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-3 flex items-center gap-2 font-semibold">
              <PenNib size={18} style={{ color: "var(--color-accent)" }} />
              型号
            </h3>
            <div className="grid gap-3">
              {report.priorityPens.map((entity) => (
                <CoverageEntityCard key={entity.id} entity={entity} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        className="rounded-xl border p-5"
        style={{
          borderColor: "var(--color-border)",
          backgroundColor: "var(--color-surface-raised)",
        }}
      >
        <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold">
          <ChartBar size={20} style={{ color: "var(--color-accent)" }} />
          覆盖指标
        </h2>
        <div
          className="grid gap-2 text-sm md:grid-cols-2"
          style={{ color: "var(--color-ink-muted)" }}
        >
          <p>品牌：故事、事实、来源、时间线、媒体候选、外部标识、别名。</p>
          <p>型号：故事、规格、事实、来源、媒体候选、图示、时间线。</p>
        </div>
      </section>
    </div>
  );
}
