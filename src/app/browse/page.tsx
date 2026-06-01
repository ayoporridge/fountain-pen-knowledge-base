"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { FacetPanel } from "@/components/FacetPanel";

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
};

const TYPE_COLORS: Record<string, string> = {
  pen: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  brand: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  concept: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  material: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  nib: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  fill_system: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
};

export default function BrowsePage() {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [facets, setFacets] = useState<Record<string, Array<{ slug: string; name: string; count: number }>>>({});
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
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
    fetchData(activeFilters);
  }, [activeFilters, fetchData]);

  const handleFilterChange = useCallback((dimension: string, slug: string | null) => {
    setActiveFilters((prev) => {
      const next = { ...prev };
      if (slug) {
        next[dimension] = slug;
      } else {
        delete next[dimension];
      }
      return next;
    });
  }, []);

  const filterCount = Object.keys(activeFilters).length;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ← 首页
        </Link>
        <Link
          href="/search"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          🔍 搜索
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        浏览钢笔知识图谱
      </h1>

      <div className="flex gap-8">
        {/* Facet sidebar */}
        <aside className="w-64 shrink-0 hidden md:block">
          <div className="sticky top-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
            <FacetPanel
              facets={facets}
              activeFilters={activeFilters}
              onFilterChange={handleFilterChange}
            />
          </div>
        </aside>

        {/* Results */}
        <main className="flex-1 min-w-0">
          <div className="mb-4 flex items-center gap-3">
            <span className="text-sm text-gray-500">
              {loading ? "加载中..." : `${total} 个词条`}
            </span>
            {filterCount > 0 && (
              <button
                type="button"
                onClick={() => setActiveFilters({})}
                className="text-xs text-red-500 hover:text-red-700"
              >
                清除全部筛选 ({filterCount})
              </button>
            )}
          </div>

          {/* Active filter tags */}
          {filterCount > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {Object.entries(activeFilters).map(([dim, slug]) => {
                const facetOptions = facets[dim] || [];
                const option = facetOptions.find((o) => o.slug === slug);
                return (
                  <button
                    key={dim}
                    type="button"
                    onClick={() => handleFilterChange(dim, null)}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800"
                  >
                    {option?.name || slug}
                    <span className="text-blue-500">✕</span>
                  </button>
                );
              })}
            </div>
          )}

          {entities.length === 0 && !loading ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-4xl mb-4">📚</p>
              <p>没有匹配的词条</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {entities.map((entity) => (
                <Link
                  key={entity.id}
                  href={`/${entity.type}/${entity.slug}`}
                  className="block p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-1.5 py-0.5 text-xs rounded ${TYPE_COLORS[entity.type] || "bg-gray-100 text-gray-700"}`}
                    >
                      {TYPE_LABELS[entity.type] || entity.type}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 line-clamp-1">
                    {entity.name}
                  </h3>
                  {entity.summary && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                      {entity.summary}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
