"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { FacetPanel } from "@/components/FacetPanel";
import { PenNib } from "@phosphor-icons/react/dist/ssr";
import { TYPE_LABELS, TYPE_ICONS } from "@/lib/constants";

interface Entity {
  id: string;
  type: string;
  slug: string;
  name: string;
  summary: string | null;
  image_url: string | null;
}

export default function BrowsePage() {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [facets, setFacets] = useState<
    Record<string, Array<{ slug: string; name: string; count: number }>>
  >({});
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>(
    {}
  );
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const PAGE_SIZE = 30;

  const fetchData = useCallback(async (filters: Record<string, string>, pageNum: number, append: boolean) => {
    if (append) setLoadingMore(true); else setLoading(true);
    const params = new URLSearchParams(filters);
    params.set("limit", String(PAGE_SIZE));
    params.set("page", String(pageNum));

    try {
      const res = await fetch(`/api/browse?${params.toString()}`);
      const data = await res.json();
      setEntities(prev => append ? [...prev, ...data.entities] : data.entities);
      setFacets(data.facets);
      setTotal(data.total);
      setPage(pageNum);
    } catch {
      if (!append) setEntities([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    // Read initial filters from URL
    const params = new URLSearchParams(window.location.search);
    const initial: Record<string, string> = {};
    for (const [key, value] of params.entries()) {
      initial[key] = value;
    }
    setActiveFilters(initial);
    fetchData(initial, 1, false);
  }, [fetchData]);

  const handleFilterChange = (dimension: string, slug: string | null) => {
    const newFilters = { ...activeFilters };
    if (slug) {
      newFilters[dimension] = slug;
    } else {
      delete newFilters[dimension];
    }
    setActiveFilters(newFilters);

    // Update URL
    const params = new URLSearchParams(newFilters);
    window.history.pushState(null, "", `/browse?${params.toString()}`);

    fetchData(newFilters, 1, false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1
          className="text-3xl font-bold tracking-tight mb-2"
          style={{ color: "var(--color-ink)" }}
        >
          浏览全部
        </h1>
        <p style={{ color: "var(--color-ink-muted)" }}>
          {loading ? "加载中..." : `共 ${total} 个词条`}
        </p>
      </div>

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
                  <p className="text-sm mb-2" style={{ color: "var(--color-ink-muted)" }}>
                    试试这些热门搜索：
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {["百乐", "万宝龙", "活塞上墨", "金尖", "日系"].map((term) => (
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
                    ))}
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
              {entities.map((entity, i) => {
                const Icon = TYPE_ICONS[entity.type] || PenNib;
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
                    <div className="w-full h-32 flex items-center justify-center" style={{ backgroundColor: "var(--color-accent-light)" }}>
                      {entity.image_url ? (
                        <img
                          src={String(entity.image_url)}
                          alt={String(entity.name)}
                          className="w-full h-32 object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <span
                          className="text-3xl font-bold"
                          style={{ color: "var(--color-accent)" }}
                        >
                          {entity.name.charAt(0)}
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
                onClick={() => fetchData(activeFilters, page + 1, true)}
                disabled={loadingMore}
                className="px-6 py-2 rounded-lg border transition-all hover:scale-[0.98] disabled:opacity-50"
                style={{
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--color-surface-raised)",
                  color: "var(--color-ink-light)",
                }}
              >
                {loadingMore ? "加载中…" : `加载更多（${entities.length} / ${total}）`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
