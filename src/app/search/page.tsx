"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  MagnifyingGlass,
  ArrowLeft,
  PenNib,
} from "@phosphor-icons/react";
import { TYPE_LABELS, TYPE_ICONS } from "@/lib/constants";

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

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setTotal(0);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);

    // Sync URL so search results are bookmarkable
    const url = new URL(window.location.href);
    if (q.trim()) {
      url.searchParams.set("q", q.trim());
    } else {
      url.searchParams.delete("q");
    }
    window.history.replaceState(null, "", url.toString());

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=30`);
      const data = await res.json();
      setResults(data.results);
      setTotal(data.total);
    } catch {
      setResults([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search on input change
  const handleInputChange = useCallback(
    (value: string) => {
      setQuery(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => doSearch(value), 300);
    },
    [doSearch],
  );

  // Read ?q= from URL on mount (e.g. from hero question links)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlQuery = params.get("q");
    if (urlQuery) {
      setQuery(urlQuery);
      doSearch(urlQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm transition-colors hover:underline underline-offset-4 mb-6"
        style={{ color: "var(--color-ink-muted)" }}
      >
        <ArrowLeft size={14} />
        首页
      </Link>

      <h1
        className="text-3xl font-bold tracking-tight mb-6"
        style={{ color: "var(--color-ink)" }}
      >
        搜索
      </h1>

      <div className="mb-8">
        <div
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border transition-all"
          style={{
            borderColor: "var(--color-border)",
            backgroundColor: "var(--color-surface-raised)",
          }}
        >
          <MagnifyingGlass size={18} style={{ color: "var(--color-ink-muted)", flexShrink: 0 }} />
          <input
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && doSearch(query)}
            placeholder="搜索钢笔、品牌、概念..."
            className="flex-1 bg-transparent outline-none text-lg"
            style={{ color: "var(--color-ink)" }}
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setResults([]);
                setTotal(0);
                setSearched(false);
              }}
              className="text-sm px-2 py-0.5 rounded transition-colors"
              style={{ color: "var(--color-ink-muted)" }}
            >
              清除
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div className="text-center py-8" style={{ color: "var(--color-ink-muted)" }}>
          搜索中…
        </div>
      )}

      {searched && !loading && (
        <div className="mb-4 text-sm" style={{ color: "var(--color-ink-muted)" }}>
          找到 {total} 个结果
        </div>
      )}

      <div className="space-y-2">
        {results.map((r, i) => {
          const Icon = TYPE_ICONS[r.type] || PenNib;
          return (
            <Link
              key={r.id}
              href={`/${r.type}/${r.slug}`}
              className={`block p-4 rounded-xl border transition-all card-hover animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}
              style={{
                borderColor: "var(--color-border)",
                backgroundColor: "var(--color-surface-raised)",
              }}
            >
              <div className="flex items-center gap-2 mb-1">
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
                  {TYPE_LABELS[r.type] || r.type}
                </span>
                <span
                  className="font-semibold"
                  style={{ color: "var(--color-ink)" }}
                  dangerouslySetInnerHTML={{ __html: r.name_highlight || r.name }}
                />
              </div>
              {(r.summary_highlight || r.summary) && (
                <p
                  className="text-sm line-clamp-2"
                  style={{ color: "var(--color-ink-light)" }}
                  dangerouslySetInnerHTML={{
                    __html: r.summary_highlight || r.summary || "",
                  }}
                />
              )}
              {r.body_highlight && !r.summary_highlight && (
                <p
                  className="text-sm line-clamp-2 mt-1"
                  style={{ color: "var(--color-ink-muted)" }}
                  dangerouslySetInnerHTML={{ __html: r.body_highlight }}
                />
              )}
            </Link>
          );
        })}
      </div>

      {searched && !loading && results.length === 0 && (
        <div className="text-center py-12">
          <div style={{ color: "var(--color-ink-muted)", margin: "0 auto 1rem", width: "fit-content" }}>
            <MagnifyingGlass size={48} weight="duotone" />
          </div>
          <p className="mb-6" style={{ color: "var(--color-ink-muted)" }}>
            没有找到匹配「{query}」的结果
          </p>
          <div className="space-y-4">
            <div>
              <p className="text-sm mb-2" style={{ color: "var(--color-ink-muted)" }}>
                试试这些热门搜索：
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {["百乐", "万宝龙", "活塞上墨", "金尖", "日系"].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      setQuery(term);
                      doSearch(term);
                    }}
                    className="text-sm px-3 py-1 rounded-full transition-colors"
                    style={{
                      backgroundColor: "var(--color-surface-dim)",
                      color: "var(--color-ink-light)",
                    }}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
            <Link
              href="/browse"
              className="inline-block text-sm transition-colors hover:underline underline-offset-4"
              style={{ color: "var(--color-accent)" }}
            >
              随便逛逛 → /browse
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
