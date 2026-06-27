import { Books, LinkSimple } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { SourceCards } from "@/components/library/SourceCards";
import { StatusBadge } from "@/components/library/StatusBadge";
import { getSourceItemIndex, getSourceRegistryIndex } from "@/lib/library";
import { displayPublicSourceName } from "@/lib/publicText";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "来源索引 - 钢笔图书馆",
  description: "钢笔图书馆的来源、授权说明、抓取方式和参考资料索引。",
};

const SOURCE_TYPE_LABELS: Record<string, string> = {
  official: "官方",
  wikimedia: "Wikimedia",
  book: "书籍",
  patent: "专利",
  blog: "博客/资料站",
  forum: "论坛",
  reddit: "Reddit",
  retailer: "零售商",
  user_submission: "用户投稿",
};

const SOURCE_TYPE_ORDER = [
  "official",
  "wikimedia",
  "book",
  "patent",
  "blog",
  "reddit",
  "forum",
  "retailer",
  "user_submission",
];

type LibrarySourcesPageProps = {
  searchParams?: Promise<{
    type?: string;
    source?: string;
  }>;
};

function filterHref(params: { type?: string; source?: string }) {
  const query = new URLSearchParams();
  if (params.type) query.set("type", params.type);
  if (params.source) query.set("source", params.source);
  const queryString = query.toString();
  return queryString ? `/library/sources?${queryString}` : "/library/sources";
}

function chipClass(active: boolean) {
  return `rounded-full border px-3 py-1 text-sm transition-colors ${
    active ? "font-semibold" : ""
  }`;
}

export default async function LibrarySourcesPage({
  searchParams,
}: LibrarySourcesPageProps) {
  const params = (await searchParams) || {};
  const registry = await getSourceRegistryIndex();
  const requestedSource =
    typeof params.source === "string" ? params.source : "";
  const requestedType = typeof params.type === "string" ? params.type : "";
  const selectedSource =
    registry.find((source) => source.id === requestedSource) || null;
  const selectedType =
    !selectedSource &&
    registry.some((source) => source.source_type === requestedType)
      ? requestedType
      : null;
  const sourceItems = await getSourceItemIndex({
    limit: selectedSource || selectedType ? 160 : 120,
    sourceId: selectedSource?.id,
    sourceType: selectedType,
  });
  const typeStats = SOURCE_TYPE_ORDER.map((type) => ({
    type,
    label: SOURCE_TYPE_LABELS[type] || type,
    itemCount: registry
      .filter((source) => source.source_type === type)
      .reduce((sum, source) => sum + Number(source.item_count || 0), 0),
    referenceCount: registry
      .filter((source) => source.source_type === type)
      .reduce((sum, source) => sum + Number(source.reference_count || 0), 0),
  })).filter((item) => item.itemCount > 0 || item.referenceCount > 0);
  const activeLabel =
    (selectedSource ? displayPublicSourceName(selectedSource.name) : "") ||
    (selectedType
      ? SOURCE_TYPE_LABELS[selectedType] || selectedType
      : "全部来源");

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8 max-w-3xl">
        <p
          className="mb-2 flex items-center gap-2 text-sm font-medium"
          style={{ color: "var(--color-accent)" }}
        >
          <LinkSimple size={16} />
          Library Sources
        </p>
        <h1 className="mb-3 text-3xl font-bold tracking-tight">来源索引</h1>
        <p
          className="text-base leading-relaxed"
          style={{ color: "var(--color-ink-light)" }}
        >
          这里集中展示资料库使用哪些来源、如何使用、授权说明是什么，以及已经登记到馆藏里的具体参考资料。
        </p>
      </div>

      <section className="mb-10">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
          <Books size={20} style={{ color: "var(--color-accent)" }} />
          来源登记
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {registry.map((source) => (
            <Link
              key={source.id}
              href={source.homepage_url || "#"}
              className="rounded-xl border p-4 transition-colors hover:bg-[var(--color-surface-dim)]"
              style={{
                borderColor: "var(--color-border)",
                backgroundColor: "var(--color-surface-raised)",
                color: "var(--color-ink)",
              }}
            >
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span
                  className="rounded-full px-2 py-0.5 text-xs"
                  style={{
                    backgroundColor: "var(--color-accent-light)",
                    color: "var(--color-accent)",
                  }}
                >
                  {SOURCE_TYPE_LABELS[source.source_type] || source.source_type}
                </span>
                <span
                  className="text-xs"
                  style={{ color: "var(--color-ink-muted)" }}
                >
                  {source.allowed_use}
                </span>
              </div>
              <h3 className="font-semibold">
                {displayPublicSourceName(source.name)}
              </h3>
              {source.notes && (
                <p
                  className="mt-2 line-clamp-3 text-sm leading-relaxed"
                  style={{ color: "var(--color-ink-muted)" }}
                >
                  {source.notes}
                </p>
              )}
              <div
                className="mt-3 text-xs"
                style={{ color: "var(--color-ink-muted)" }}
              >
                参考 {source.item_count || 0} · 引用{" "}
                {source.reference_count || 0} · {source.fetch_method}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">已登记参考资料</h2>
            <p
              className="mt-1 text-sm"
              style={{ color: "var(--color-ink-muted)" }}
            >
              当前筛选：{activeLabel} · 显示 {sourceItems.length} 条
            </p>
          </div>
          <Link
            href="/library/sources"
            className={chipClass(!selectedSource && !selectedType)}
            style={{
              borderColor: "var(--color-border)",
              backgroundColor:
                !selectedSource && !selectedType
                  ? "var(--color-accent-light)"
                  : "var(--color-surface-raised)",
              color:
                !selectedSource && !selectedType
                  ? "var(--color-accent)"
                  : "var(--color-ink-muted)",
            }}
          >
            全部
          </Link>
        </div>

        <div className="mb-3 flex flex-wrap gap-2">
          {typeStats.map((item) => (
            <Link
              key={item.type}
              href={filterHref({ type: item.type })}
              className={chipClass(selectedType === item.type)}
              style={{
                borderColor: "var(--color-border)",
                backgroundColor:
                  selectedType === item.type
                    ? "var(--color-accent-light)"
                    : "var(--color-surface-raised)",
                color:
                  selectedType === item.type
                    ? "var(--color-accent)"
                    : "var(--color-ink-muted)",
              }}
            >
              {item.label} · {item.itemCount}
            </Link>
          ))}
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {registry
            .filter((source) => Number(source.item_count || 0) > 0)
            .map((source) => (
              <Link
                key={source.id}
                href={filterHref({ source: source.id })}
                className={chipClass(selectedSource?.id === source.id)}
                style={{
                  borderColor: "var(--color-border)",
                  backgroundColor:
                    selectedSource?.id === source.id
                      ? "var(--color-accent-light)"
                      : "var(--color-surface-raised)",
                  color:
                    selectedSource?.id === source.id
                      ? "var(--color-accent)"
                      : "var(--color-ink-muted)",
                }}
              >
                {displayPublicSourceName(source.name)} · {source.item_count}
              </Link>
            ))}
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          {["summary_only", "metadata_only", "store_full", "link_only"].map(
            (status) => (
              <StatusBadge key={status} status={status} />
            ),
          )}
        </div>
        <SourceCards sources={sourceItems} />
      </section>
    </div>
  );
}
