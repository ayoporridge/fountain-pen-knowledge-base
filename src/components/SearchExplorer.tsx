"use client";

import { ArrowLeft, MagnifyingGlass, PenNib } from "@phosphor-icons/react";
import Link from "next/link";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { TYPE_ICONS, TYPE_LABELS } from "@/lib/constants";
import type {
  PublicSearchResponse,
  PublicSearchResult,
  SearchIntent,
} from "@/lib/search";

function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function renderHighlighted(value: string): ReactNode[] {
  const parts = value.split(/(<mark>|<\/mark>)/g);
  const rendered: ReactNode[] = [];
  let marked = false;
  let offset = 0;
  for (const part of parts) {
    if (part === "<mark>") {
      marked = true;
      continue;
    }
    if (part === "</mark>") {
      marked = false;
      continue;
    }
    if (!part) continue;
    const key = `${offset}-${part.slice(0, 24)}`;
    offset += part.length;
    const text = decodeHtml(part);
    rendered.push(
      marked ? (
        <mark key={key} className="rounded px-0.5">
          {text}
        </mark>
      ) : (
        <span key={key}>{text}</span>
      ),
    );
  }
  return rendered;
}

const EMPTY_INTENT: SearchIntent = {
  filters: {},
  browseHref: null,
  terms: [],
  modelNumbers: [],
};

export function SearchExplorer({
  initialData,
}: {
  initialData: PublicSearchResponse;
}) {
  const [query, setQuery] = useState(initialData.query);
  const [results, setResults] = useState<PublicSearchResult[]>(
    initialData.results,
  );
  const [total, setTotal] = useState(initialData.total);
  const [intent, setIntent] = useState(initialData.intent || EMPTY_INTENT);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(Boolean(initialData.query));
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestRef = useRef<AbortController | null>(null);

  const doSearch = useCallback(async (value: string) => {
    const trimmed = value.trim();
    const url = new URL(window.location.href);
    if (trimmed) url.searchParams.set("q", trimmed);
    else url.searchParams.delete("q");
    window.history.replaceState(null, "", url.toString());

    if (!trimmed) {
      setResults([]);
      setTotal(0);
      setIntent(EMPTY_INTENT);
      setSearched(false);
      return;
    }

    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    setLoading(true);
    setSearched(true);
    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(trimmed)}&limit=30`,
        { signal: controller.signal },
      );
      if (!response.ok) throw new Error("Search request failed");
      const data = (await response.json()) as PublicSearchResponse;
      setResults(data.results);
      setTotal(data.total);
      setIntent(data.intent || EMPTY_INTENT);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setResults([]);
      setTotal(0);
      setIntent(EMPTY_INTENT);
    } finally {
      if (requestRef.current === controller) setLoading(false);
    }
  }, []);

  const handleInputChange = useCallback(
    (value: string) => {
      setQuery(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => void doSearch(value), 300);
    },
    [doSearch],
  );

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      requestRef.current?.abort();
    },
    [],
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm underline-offset-4 hover:underline"
        style={{ color: "var(--color-ink-muted)" }}
      >
        <ArrowLeft size={14} />
        首页
      </Link>
      <h1 className="mb-6 text-3xl font-bold tracking-tight">搜索</h1>

      <div className="mb-8">
        <div
          className="flex w-full items-center gap-3 rounded-xl border px-4 py-3"
          style={{
            borderColor: "var(--color-border)",
            backgroundColor: "var(--color-surface-raised)",
          }}
        >
          <MagnifyingGlass
            size={18}
            style={{ color: "var(--color-ink-muted)", flexShrink: 0 }}
          />
          <input
            type="search"
            value={query}
            onChange={(event) => handleInputChange(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && void doSearch(query)}
            placeholder="搜索钢笔、品牌、概念…"
            aria-label="搜索馆藏"
            className="min-w-0 flex-1 bg-transparent text-lg"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                void doSearch("");
              }}
              className="rounded px-2 py-1 text-sm"
              style={{ color: "var(--color-ink-muted)" }}
            >
              清除
            </button>
          )}
        </div>
      </div>

      {intent.browseHref && (
        <div
          className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border p-4"
          style={{
            borderColor: "var(--color-border)",
            backgroundColor: "var(--color-accent-light)",
          }}
        >
          <div className="min-w-0 flex-1">
            <p className="font-medium">已识别你的筛选条件</p>
            <p
              className="mt-1 text-sm"
              style={{ color: "var(--color-ink-muted)" }}
            >
              {[
                intent.filters.origin === "origin-japan" ? "日本" : null,
                intent.filters.nib_material === "gold" ? "所有金尖" : null,
                intent.filters.max_price
                  ? `¥${intent.filters.max_price} 以内`
                  : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
          <Link
            href={intent.browseHref}
            className="rounded-full px-4 py-2 text-sm font-semibold text-white"
            style={{ backgroundColor: "var(--color-accent)" }}
          >
            按这些条件筛选
          </Link>
        </div>
      )}

      {searched && (
        <div
          className="mb-4 text-sm"
          aria-live="polite"
          style={{ color: "var(--color-ink-muted)" }}
        >
          {loading ? "正在搜索…" : `找到 ${total} 个结果`}
        </div>
      )}

      <div
        className={`space-y-2 ${loading ? "opacity-60" : ""}`}
        aria-busy={loading}
      >
        {results.map((result) => {
          const Icon = TYPE_ICONS[result.type] || PenNib;
          return (
            <Link
              key={result.id}
              href={`/${result.type}/${result.slug}`}
              className="block rounded-xl border p-4 transition-all card-hover"
              style={{
                borderColor: "var(--color-border)",
                backgroundColor: "var(--color-surface-raised)",
              }}
            >
              <div className="mb-1 flex items-center gap-2">
                <span style={{ color: "var(--color-accent)" }}>
                  <Icon size={14} weight="duotone" />
                </span>
                <span
                  className="rounded-full px-1.5 py-0.5 text-xs"
                  style={{
                    backgroundColor: "var(--color-surface-dim)",
                    color: "var(--color-ink-muted)",
                  }}
                >
                  {TYPE_LABELS[result.type] || result.type}
                </span>
                <span className="font-semibold">
                  {renderHighlighted(result.name_highlight || result.name)}
                </span>
              </div>
              {(result.summary_highlight || result.summary) && (
                <p
                  className="line-clamp-2 text-sm"
                  style={{ color: "var(--color-ink-light)" }}
                >
                  {renderHighlighted(
                    result.summary_highlight || result.summary || "",
                  )}
                </p>
              )}
              {result.body_highlight && !result.summary_highlight && (
                <p
                  className="mt-1 line-clamp-2 text-sm"
                  style={{ color: "var(--color-ink-muted)" }}
                >
                  {renderHighlighted(result.body_highlight)}
                </p>
              )}
            </Link>
          );
        })}
      </div>

      {searched && !loading && results.length === 0 && (
        <div className="py-12 text-center">
          <MagnifyingGlass
            size={48}
            weight="duotone"
            className="mx-auto mb-4"
            style={{ color: "var(--color-ink-muted)" }}
          />
          <p className="mb-6" style={{ color: "var(--color-ink-muted)" }}>
            没有找到匹配「{query}」的结果
          </p>
          <Link
            href={intent.browseHref || "/browse"}
            className="text-sm underline underline-offset-4"
            style={{ color: "var(--color-accent)" }}
          >
            {intent.browseHref ? "按识别出的条件浏览" : "从全部馆藏开始浏览"}
          </Link>
        </div>
      )}
    </div>
  );
}
