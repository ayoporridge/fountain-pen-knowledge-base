"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { FacetPanel } from "@/components/FacetPanel";
import { PenNib, Buildings, Lightbulb, Drop, BookOpen, Circle } from "@phosphor-icons/react/dist/ssr";

interface Entity {
  id: string;
  type: string;
  slug: string;
  name: string;
  summary: string | null;
}

const TYPE_LABELS: Record<string, string> = {
  pen: "钢笔",
  brand: "品牌",
  concept: "概念",
  material: "材质",
  nib: "笔尖",
  fill_system: "上墨方式",
  article: "文章",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TYPE_ICONS: Record<string, React.ComponentType<any>> = {
  pen: PenNib,
  brand: Buildings,
  concept: Lightbulb,
  material: Circle,
  nib: PenNib,
  fill_system: Drop,
  article: BookOpen,
};

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

  const fetchData = useCallback(async (filters: Record<string, string>) => {
    setLoading(true);
    const params = new URLSearchParams(filters);
    params.set("limit", "30");

    try {
      const res = await fetch(`/api/browse?${params.toString()}`);
      const data = await res.json();
      setEntities(data.entities);
      setFacets(data.facets);
      setTotal(data.total);
    } catch {
      setEntities([]);
    } finally {
      setLoading(false);
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
    fetchData(initial);
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

    fetchData(newFilters);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6 animate-fade-in-up">
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
              <p>没有找到匹配的词条</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {entities.map((entity, i) => {
                const Icon = TYPE_ICONS[entity.type] || PenNib;
                return (
                  <Link
                    key={entity.id}
                    href={`/${entity.type}/${entity.slug}`}
                    className={`block p-4 rounded-xl border transition-all card-hover animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}
                    style={{
                      borderColor: "var(--color-border)",
                      backgroundColor: "var(--color-surface-raised)",
                    }}
                  >
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
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
