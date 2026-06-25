"use client";

import {
  Books,
  FileText,
  Flask,
  FunnelSimple,
  PenNib,
  X,
} from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { FacetPanel } from "@/components/FacetPanel";
import { TYPE_ICONS, TYPE_LABELS } from "@/lib/constants";

interface Entity {
  id: string;
  type: string;
  slug: string;
  name: string;
  summary: string | null;
  image_url: string | null;
}

const CONTENT_TYPES = [
  { value: "all", label: "全部", description: "所有馆藏", Icon: Books },
  { value: "pen", label: "钢笔", description: "型号档案", Icon: PenNib },
  { value: "brand", label: "品牌", description: "历史与型号", Icon: Books },
  { value: "article", label: "文章", description: "来源整理", Icon: FileText },
  {
    value: "knowledge",
    label: "工艺概念",
    description: "机制与术语",
    Icon: Flask,
  },
];

const CARD_FALLBACKS: Record<
  string,
  { title: string; subtitle: string; Icon: typeof PenNib }
> = {
  pen: { title: "型号档案", subtitle: "参数 / 故事 / 图谱", Icon: PenNib },
  brand: { title: "品牌馆", subtitle: "历史 / 型号 / 来源", Icon: Books },
  article: { title: "文章档案", subtitle: "原文整理 / 来源卡", Icon: FileText },
  concept: { title: "工艺概念", subtitle: "术语 / 结构 / 关系", Icon: Flask },
  fill_system: {
    title: "上墨机制",
    subtitle: "结构 / 维护 / 对比",
    Icon: Flask,
  },
  nib: { title: "笔尖资料", subtitle: "类型 / 书写 / 维护", Icon: PenNib },
};

export default function BrowsePage() {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [facets, setFacets] = useState<
    Record<string, Array<{ slug: string; name: string; count: number }>>
  >({});
  const [typeCounts, setTypeCounts] = useState<
    Array<{ type: string; cnt: number }>
  >([]);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>(
    {},
  );
  const [activeType, setActiveType] = useState("all");
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const PAGE_SIZE = 30;

  const fetchData = useCallback(
    async (
      filters: Record<string, string>,
      pageNum: number,
      append: boolean,
      typeValue: string,
    ) => {
      if (append) setLoadingMore(true);
      else setLoading(true);
      const params = new URLSearchParams(filters);
      if (typeValue !== "all") params.set("type", typeValue);
      params.set("limit", String(PAGE_SIZE));
      params.set("page", String(pageNum));

      try {
        const res = await fetch(`/api/browse?${params.toString()}`);
        const data = await res.json();
        setEntities((prev) =>
          append ? [...prev, ...data.entities] : data.entities,
        );
        setFacets(data.facets);
        setTypeCounts(data.typeCounts || []);
        setTotal(data.total);
        setPage(pageNum);
      } catch {
        if (!append) setEntities([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [],
  );

  useEffect(() => {
    // Read initial filters from URL
    const params = new URLSearchParams(window.location.search);
    const initial: Record<string, string> = {};
    let initialType = "all";
    for (const [key, value] of params.entries()) {
      if (key === "type") initialType = value;
      else initial[key] = value;
    }
    setActiveFilters(initial);
    setActiveType(initialType);
    fetchData(initial, 1, false, initialType);
  }, [fetchData]);

  const updateUrl = (filters: Record<string, string>, typeValue: string) => {
    const params = new URLSearchParams(filters);
    if (typeValue !== "all") params.set("type", typeValue);
    window.history.pushState(
      null,
      "",
      params.size > 0 ? `/browse?${params.toString()}` : "/browse",
    );
  };

  const handleFilterChange = (dimension: string, slug: string | null) => {
    const newFilters = { ...activeFilters };
    if (slug) {
      newFilters[dimension] = slug;
    } else {
      delete newFilters[dimension];
    }
    setActiveFilters(newFilters);

    updateUrl(newFilters, activeType);
    fetchData(newFilters, 1, false, activeType);
  };

  const handleTypeChange = (typeValue: string) => {
    setActiveType(typeValue);
    updateUrl(activeFilters, typeValue);
    fetchData(activeFilters, 1, false, typeValue);
  };

  const clearFilters = () => {
    setActiveFilters({});
    updateUrl({}, activeType);
    fetchData({}, 1, false, activeType);
  };

  const getTypeCount = (typeValue: string) => {
    if (typeValue === "all") {
      return typeCounts.reduce((sum, item) => sum + Number(item.cnt || 0), 0);
    }
    if (typeValue === "knowledge") {
      return typeCounts
        .filter((item) => ["concept", "fill_system", "nib"].includes(item.type))
        .reduce((sum, item) => sum + Number(item.cnt || 0), 0);
    }
    return Number(typeCounts.find((item) => item.type === typeValue)?.cnt || 0);
  };

  const activeTypeConfig =
    CONTENT_TYPES.find((item) => item.value === activeType) || CONTENT_TYPES[0];
  const browseTitle =
    activeTypeConfig.value === "all"
      ? "浏览全部"
      : `浏览${activeTypeConfig.label}`;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1
          className="text-3xl font-bold tracking-tight mb-2"
          style={{ color: "var(--color-ink)" }}
        >
          {browseTitle}
        </h1>
        <div className="flex flex-wrap items-center gap-3">
          <p className="m-0" style={{ color: "var(--color-ink-muted)" }}>
            {loading ? "加载中..." : `共 ${total} 个词条`}
          </p>
          <button
            type="button"
            onClick={() => setFilterOpen(true)}
            className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm lg:hidden"
            style={{
              borderColor: "var(--color-border)",
              backgroundColor: "var(--color-surface-raised)",
              color: "var(--color-ink-light)",
            }}
          >
            <FunnelSimple size={14} />
            筛选
          </button>
        </div>
        {Object.keys(activeFilters).length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {Object.entries(activeFilters).map(([dimension, slug]) => (
              <button
                key={`${dimension}-${slug}`}
                type="button"
                onClick={() => handleFilterChange(dimension, null)}
                className="rounded-full px-3 py-1 text-xs"
                style={{
                  backgroundColor: "var(--color-accent-light)",
                  color: "var(--color-accent)",
                }}
              >
                {slug} ×
              </button>
            ))}
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs underline underline-offset-4"
              style={{ color: "var(--color-ink-muted)" }}
            >
              清空全部
            </button>
          </div>
        )}
      </div>

      <div
        data-testid="browse-type-tabs"
        className="mb-6 grid gap-2 sm:grid-cols-5"
        role="tablist"
        aria-label="内容类型"
      >
        {CONTENT_TYPES.map(({ value, label, description, Icon }) => {
          const active = activeType === value;
          const count = getTypeCount(value);
          return (
            <button
              key={value}
              type="button"
              role="tab"
              aria-label={label}
              aria-selected={active}
              onClick={() => handleTypeChange(value)}
              className="rounded-xl border p-3 text-left transition-all btn-press"
              style={{
                borderColor: active
                  ? "var(--color-accent)"
                  : "var(--color-border)",
                backgroundColor: active
                  ? "var(--color-accent-light)"
                  : "var(--color-surface-raised)",
                color: active ? "var(--color-accent)" : "var(--color-ink)",
                boxShadow: active ? "var(--shadow-edge)" : undefined,
              }}
            >
              <span className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Icon size={16} weight="duotone" />
                {label}
              </span>
              <span
                className="block text-xs"
                style={{
                  color: active
                    ? "var(--color-accent-hover)"
                    : "var(--color-ink-muted)",
                }}
              >
                {count > 0 ? `${count} 个` : description}
              </span>
            </button>
          );
        })}
      </div>

      {filterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="关闭筛选"
            className="absolute inset-0 bg-black/30"
            onClick={() => setFilterOpen(false)}
          />
          <div
            className="absolute right-0 top-0 h-full w-[86vw] max-w-sm overflow-y-auto border-l p-5 shadow-xl"
            style={{
              borderColor: "var(--color-border)",
              backgroundColor: "var(--color-surface)",
            }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">筛选</h2>
              <button
                type="button"
                aria-label="关闭筛选"
                onClick={() => setFilterOpen(false)}
                className="rounded-lg p-2"
                style={{ color: "var(--color-ink-muted)" }}
              >
                <X size={18} />
              </button>
            </div>
            <FacetPanel
              facets={facets}
              activeFilters={activeFilters}
              onFilterChange={handleFilterChange}
            />
            {Object.keys(activeFilters).length > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 w-full rounded-lg border px-4 py-2 text-sm"
                style={{
                  borderColor: "var(--color-border)",
                  color: "var(--color-ink-light)",
                }}
              >
                清空全部
              </button>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-8">
        {/* Sidebar facets */}
        <aside className="w-64 flex-shrink-0 hidden lg:block">
          <FacetPanel
            facets={facets}
            activeFilters={activeFilters}
            onFilterChange={handleFilterChange}
          />
        </aside>

        {/* Entity grid */}
        <div className="flex-1">
          {loading ? (
            <div
              className="text-center py-12"
              style={{ color: "var(--color-ink-muted)" }}
            >
              加载中...
            </div>
          ) : entities.length === 0 ? (
            <div
              className="text-center py-12"
              style={{ color: "var(--color-ink-muted)" }}
            >
              <p className="text-4xl mb-4">—</p>
              <p className="mb-6">没有找到匹配的词条</p>
              <div className="space-y-4">
                <div>
                  <p
                    className="text-sm mb-2"
                    style={{ color: "var(--color-ink-muted)" }}
                  >
                    试试这些热门搜索：
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {["百乐", "万宝龙", "活塞上墨", "金尖", "日系"].map(
                      (term) => (
                        <Link
                          key={term}
                          href={`/search?q=${encodeURIComponent(term)}`}
                          className="text-sm px-3 py-1 rounded-full transition-colors"
                          style={{
                            backgroundColor: "var(--color-surface-dim)",
                            color: "var(--color-ink-light)",
                          }}
                        >
                          {term}
                        </Link>
                      ),
                    )}
                  </div>
                </div>
                <Link
                  href="/browse"
                  className="inline-block text-sm transition-colors hover:underline underline-offset-4"
                  style={{ color: "var(--color-accent)" }}
                >
                  查看全部词条 →
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {entities.map((entity) => {
                const Icon = TYPE_ICONS[entity.type] || PenNib;
                const fallback = CARD_FALLBACKS[entity.type] || {
                  title: TYPE_LABELS[entity.type] || "资料卡",
                  subtitle: "馆藏条目",
                  Icon,
                };
                const FallbackIcon = fallback.Icon;
                return (
                  <Link
                    key={entity.id}
                    href={`/${entity.type}/${entity.slug}`}
                    className={`block rounded-xl border overflow-hidden transition-all card-hover`}
                    style={{
                      borderColor: "var(--color-border)",
                      backgroundColor: "var(--color-surface-raised)",
                    }}
                  >
                    <div
                      className="relative w-full h-32 flex items-center justify-center"
                      style={{ backgroundColor: "var(--color-accent-light)" }}
                    >
                      {entity.image_url ? (
                        <Image
                          src={String(entity.image_url)}
                          alt={String(entity.name)}
                          fill
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover"
                        />
                      ) : (
                        <span
                          data-testid={`entity-card-fallback-${entity.type}`}
                          className="flex h-full w-full flex-col items-center justify-center gap-2 px-4 text-center"
                          style={{
                            color: "var(--color-accent)",
                            background:
                              "linear-gradient(135deg, var(--color-accent-light), color-mix(in srgb, var(--color-surface-raised) 45%, var(--color-accent-light)))",
                          }}
                        >
                          <FallbackIcon size={28} weight="duotone" />
                          <span className="text-base font-semibold">
                            {fallback.title}
                          </span>
                          <span
                            className="text-xs"
                            style={{ color: "var(--color-ink-muted)" }}
                          >
                            {fallback.subtitle}
                          </span>
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span style={{ color: "var(--color-accent)" }}>
                          <Icon size={14} weight="duotone" />
                        </span>
                        <span
                          className="text-xs px-1.5 py-0.5 rounded-full"
                          style={{
                            backgroundColor: "var(--color-surface-dim)",
                            color: "var(--color-ink-muted)",
                          }}
                        >
                          {TYPE_LABELS[entity.type] || entity.type}
                        </span>
                      </div>
                      <h3
                        className="font-medium mb-1 line-clamp-1"
                        style={{ color: "var(--color-ink)" }}
                      >
                        {entity.name}
                      </h3>
                      <p
                        className="text-sm line-clamp-2"
                        style={{ color: "var(--color-ink-muted)" }}
                      >
                        {entity.summary || "暂无简介"}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Load more button */}
          {!loading && entities.length > 0 && entities.length < total && (
            <div className="flex justify-center mt-6">
              <button
                type="button"
                onClick={() =>
                  fetchData(activeFilters, page + 1, true, activeType)
                }
                disabled={loadingMore}
                className="px-6 py-2 rounded-lg border transition-all hover:scale-[0.98] disabled:opacity-50"
                style={{
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--color-surface-raised)",
                  color: "var(--color-ink-light)",
                }}
              >
                {loadingMore
                  ? "加载中…"
                  : `加载更多（${entities.length} / ${total}）`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
