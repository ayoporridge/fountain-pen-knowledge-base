"use client";

import Link from "next/link";
import { useCallback, useState } from "react";

interface SearchResult {
  id: string;
  type: string;
  slug: string;
  name: string;
  summary: string | null;
  name_highlight: string;
  summary_highlight: string;
  body_highlight: string;
  rank: number;
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

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setTotal(0);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=30`);
      const data = await res.json() as { results: SearchResult[]; total: number };
      setResults(data.results);
      setTotal(data.total);
    } catch {
      setResults([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Link
        href="/"
        className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-6 inline-block"
      >
        ← 首页
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        搜索
      </h1>

      <div className="mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch(query)}
          placeholder="搜索钢笔、品牌、概念..."
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={() => handleSearch(query)}
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            搜索
          </button>
          <Link
            href="/browse"
            className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm"
          >
            浏览全部 →
          </Link>
        </div>
      </div>

      {loading && (
        <div className="text-center py-8 text-gray-500">搜索中...</div>
      )}

      {searched && !loading && (
        <div className="mb-4 text-sm text-gray-500">
          找到 {total} 个结果
        </div>
      )}

      <div className="space-y-3">
        {results.map((r) => (
          <Link
            key={r.id}
            href={`/${r.type}/${r.slug}`}
            className="block p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`px-1.5 py-0.5 text-xs rounded ${TYPE_COLORS[r.type] || "bg-gray-100 text-gray-700"}`}
              >
                {TYPE_LABELS[r.type] || r.type}
              </span>
              <span
                className="font-semibold text-gray-900 dark:text-gray-100"
                dangerouslySetInnerHTML={{ __html: r.name_highlight || r.name }}
              />
            </div>
            {(r.summary_highlight || r.summary) && (
              <p
                className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2"
                dangerouslySetInnerHTML={{
                  __html: r.summary_highlight || r.summary || "",
                }}
              />
            )}
            {r.body_highlight && !r.summary_highlight && (
              <p
                className="text-sm text-gray-500 dark:text-gray-500 line-clamp-2 mt-1"
                dangerouslySetInnerHTML={{ __html: r.body_highlight }}
              />
            )}
          </Link>
        ))}
      </div>

      {searched && !loading && results.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-4xl mb-4">🔍</p>
          <p>没有找到匹配「{query}」的结果</p>
        </div>
      )}
    </div>
  );
}
