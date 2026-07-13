"use client";

import {
  Books,
  FileText,
  Flask,
  FunnelSimple,
  PenNib,
  X,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { EntityCardImage } from "@/components/EntityCardImage";
import { FacetPanel, getActiveFilterLabel } from "@/components/FacetPanel";
import type { BrowseData } from "@/lib/browse-data";
import { TYPE_ICONS, TYPE_LABELS } from "@/lib/constants";

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

const PAGE_SIZE = 30;

function readLocationState(): {
  filters: Record<string, string>;
  type: string;
} {
  const params = new URLSearchParams(window.location.search);
  const filters: Record<string, string> = {};
  let type = "all";
  for (const [key, value] of params.entries()) {
    if (key === "type") type = value;
    else if (key !== "page" && key !== "limit") filters[key] = value;
  }
  return { filters, type };
}

export function BrowseExplorer({ initialData }: { initialData: BrowseData }) {
  const [data, setData] = useState(initialData);
  const [activeFilters, setActiveFilters] = useState(initialData.activeFilters);
  const [activeType, setActiveType] = useState(initialData.activeType);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const pageContentRef = useRef<HTMLDivElement>(null);
  const filterDialogRef = useRef<HTMLDivElement>(null);
  const closeFilter = useCallback(() => setFilterOpen(false), []);

  const fetchData = useCallback(
    async (
      filters: Record<string, string>,
      page: number,
      append: boolean,
      type: string,
    ) => {
      append ? setLoadingMore(true) : setLoading(true);
      const params = new URLSearchParams(filters);
      if (type !== "all") params.set("type", type);
      params.set("limit", String(PAGE_SIZE));
      params.set("page", String(page));
      try {
        const response = await fetch(`/api/browse?${params.toString()}`);
        if (!response.ok) throw new Error("Browse request failed");
        const nextData = (await response.json()) as BrowseData;
        setData((current) => ({
          ...nextData,
          entities: append
            ? [...current.entities, ...nextData.entities]
            : nextData.entities,
        }));
      } catch {
        // Preserve the current server-rendered results when a later request fails.
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [],
  );

  useEffect(() => {
    const onPopState = () => {
      const next = readLocationState();
      setActiveFilters(next.filters);
      setActiveType(next.type);
      void fetchData(next.filters, 1, false, next.type);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [fetchData]);

  useEffect(() => {
    if (!filterOpen) return;
    const content = pageContentRef.current;
    const previousOverflow = document.body.style.overflow;
    content?.setAttribute("inert", "");
    content?.setAttribute("aria-hidden", "true");
    const portalRoot = filterDialogRef.current?.parentElement;
    const backgroundElements = Array.from(document.body.children).filter(
      (element): element is HTMLElement =>
        element instanceof HTMLElement &&
        element !== portalRoot &&
        !element.contains(portalRoot || null),
    );
    const backgroundState = backgroundElements.map((element) => ({
      element,
      inert: element.hasAttribute("inert"),
      ariaHidden: element.getAttribute("aria-hidden"),
    }));
    for (const element of backgroundElements) {
      element.setAttribute("inert", "");
      element.setAttribute("aria-hidden", "true");
    }
    document.body.style.overflow = "hidden";

    const focusableSelector = [
      "button:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      "a[href]",
      "summary",
      '[tabindex]:not([tabindex="-1"])',
    ].join(",");
    const animationFrame = requestAnimationFrame(() => {
      filterDialogRef.current
        ?.querySelector<HTMLElement>(focusableSelector)
        ?.focus();
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeFilter();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = Array.from(
        filterDialogRef.current?.querySelectorAll<HTMLElement>(
          focusableSelector,
        ) || [],
      ).filter((element) => element.getClientRects().length > 0);
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      cancelAnimationFrame(animationFrame);
      document.removeEventListener("keydown", onKeyDown);
      content?.removeAttribute("inert");
      content?.removeAttribute("aria-hidden");
      for (const state of backgroundState) {
        if (!state.inert) state.element.removeAttribute("inert");
        if (state.ariaHidden === null) {
          state.element.removeAttribute("aria-hidden");
        } else {
          state.element.setAttribute("aria-hidden", state.ariaHidden);
        }
      }
      document.body.style.overflow = previousOverflow;
      filterButtonRef.current?.focus();
    };
  }, [closeFilter, filterOpen]);

  const updateUrl = (filters: Record<string, string>, type: string) => {
    const params = new URLSearchParams(filters);
    if (type !== "all") params.set("type", type);
    window.history.pushState(
      null,
      "",
      params.size > 0 ? `/browse?${params.toString()}` : "/browse",
    );
  };

  const changeFilters = (
    nextFilters: Record<string, string>,
    nextType = activeType,
  ) => {
    setActiveFilters(nextFilters);
    setActiveType(nextType);
    updateUrl(nextFilters, nextType);
    void fetchData(nextFilters, 1, false, nextType);
  };

  const handleFilterChange = (dimension: string, slug: string | null) => {
    const next = { ...activeFilters };
    if (slug) next[dimension] = slug;
    else delete next[dimension];
    changeFilters(next);
  };

  const clearFilters = () => changeFilters({});

  const getTypeCount = (type: string) => {
    if (type === "all") {
      return data.typeCounts.reduce((sum, item) => sum + Number(item.cnt), 0);
    }
    if (type === "knowledge") {
      return data.typeCounts
        .filter((item) => ["concept", "fill_system", "nib"].includes(item.type))
        .reduce((sum, item) => sum + Number(item.cnt), 0);
    }
    return Number(data.typeCounts.find((item) => item.type === type)?.cnt || 0);
  };

  const typeConfig =
    CONTENT_TYPES.find((item) => item.value === activeType) || CONTENT_TYPES[0];

  return (
    <div ref={pageContentRef} className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">
          {typeConfig.value === "all" ? "浏览全部" : `浏览${typeConfig.label}`}
        </h1>
        <div className="flex flex-wrap items-center gap-3">
          <p className="m-0" style={{ color: "var(--color-ink-muted)" }}>
            {loading ? "正在更新…" : `共 ${data.total} 个词条`}
          </p>
          <button
            ref={filterButtonRef}
            type="button"
            onClick={() => setFilterOpen(true)}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border px-3 py-2 text-sm lg:hidden"
            style={{
              borderColor: "var(--color-border)",
              backgroundColor: "var(--color-surface-raised)",
            }}
          >
            <FunnelSimple size={16} />
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
                aria-label={`清除${getActiveFilterLabel(
                  dimension,
                  slug,
                  data.facets,
                )}筛选`}
              >
                {getActiveFilterLabel(dimension, slug, data.facets)} ×
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
              onClick={() => changeFilters(activeFilters, value)}
              className="rounded-xl border p-3 text-left transition-all btn-press"
              style={{
                borderColor: active
                  ? "var(--color-accent)"
                  : "var(--color-border)",
                backgroundColor: active
                  ? "var(--color-accent-light)"
                  : "var(--color-surface-raised)",
                color: active ? "var(--color-accent)" : "var(--color-ink)",
              }}
            >
              <span className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Icon size={16} weight="duotone" />
                {label}
              </span>
              <span
                className="block text-xs"
                style={{ color: "var(--color-ink-muted)" }}
              >
                {count > 0 ? `${count} 个` : description}
              </span>
            </button>
          );
        })}
      </div>

      {filterOpen &&
        createPortal(
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              aria-hidden="true"
              tabIndex={-1}
              className="absolute inset-0 bg-black/30"
              onClick={closeFilter}
            />
            <div
              ref={filterDialogRef}
              data-testid="mobile-filter-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="browse-filter-title"
              className="absolute right-0 top-0 flex h-full w-[86vw] max-w-sm flex-col border-l shadow-xl"
              style={{
                borderColor: "var(--color-border)",
                backgroundColor: "var(--color-surface)",
              }}
            >
              <div
                className="flex items-center justify-between border-b p-5"
                style={{ borderColor: "var(--color-border)" }}
              >
                <h2 id="browse-filter-title" className="text-lg font-semibold">
                  筛选
                </h2>
                <button
                  type="button"
                  aria-label="关闭筛选"
                  onClick={closeFilter}
                  className="min-h-11 min-w-11 rounded-lg p-2"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5">
                <FacetPanel
                  showTitle={false}
                  facets={data.facets}
                  activeFilters={activeFilters}
                  onFilterChange={handleFilterChange}
                />
              </div>
              <div
                className="grid grid-cols-2 gap-2 border-t p-4"
                style={{ borderColor: "var(--color-border)" }}
              >
                <button
                  type="button"
                  onClick={clearFilters}
                  className="min-h-11 rounded-lg border px-3 text-sm"
                >
                  清空
                </button>
                <button
                  type="button"
                  onClick={closeFilter}
                  className="min-h-11 rounded-lg px-3 text-sm font-semibold text-white"
                  style={{ backgroundColor: "var(--color-accent)" }}
                >
                  查看 {data.total} 个结果
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      <div className="flex gap-8">
        <aside className="hidden w-64 flex-shrink-0 lg:block">
          <FacetPanel
            facets={data.facets}
            activeFilters={activeFilters}
            onFilterChange={handleFilterChange}
          />
        </aside>

        <div className="min-w-0 flex-1" aria-busy={loading}>
          {data.entities.length === 0 ? (
            <div
              className="py-12 text-center"
              style={{ color: "var(--color-ink-muted)" }}
            >
              <p className="mb-4 text-4xl">—</p>
              <p className="mb-6">没有找到匹配的词条</p>
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm underline underline-offset-4"
              >
                清除筛选并查看全部
              </button>
            </div>
          ) : (
            <div
              data-testid="browse-entity-grid"
              className={`grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 ${loading ? "opacity-60" : ""}`}
            >
              {data.entities.map((entity) => {
                const Icon = TYPE_ICONS[entity.type] || PenNib;
                return (
                  <Link
                    key={entity.id}
                    data-testid="browse-entity-card"
                    href={`/${entity.type}/${entity.slug}`}
                    className="block overflow-hidden rounded-xl border transition-all card-hover"
                    style={{
                      borderColor: "var(--color-border)",
                      backgroundColor: "var(--color-surface-raised)",
                    }}
                  >
                    <div
                      className="relative flex h-32 w-full items-center justify-center"
                      style={{ backgroundColor: "var(--color-accent-light)" }}
                    >
                      <EntityCardImage
                        src={entity.image_url}
                        name={entity.name}
                        type={entity.type}
                      />
                    </div>
                    <div className="p-4">
                      <div className="mb-2 flex items-center gap-2">
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
                          {TYPE_LABELS[entity.type] || entity.type}
                        </span>
                      </div>
                      <h3 className="mb-1 line-clamp-1 font-medium">
                        {entity.name}
                      </h3>
                      {(entity.summary ||
                        entity.classification ||
                        entity.source_count > 0) && (
                        <p
                          className="line-clamp-2 text-sm"
                          style={{ color: "var(--color-ink-muted)" }}
                        >
                          {entity.summary ||
                            entity.classification ||
                            `已登记 ${entity.source_count} 条参考来源`}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {data.entities.length > 0 && data.entities.length < data.total && (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() =>
                  void fetchData(activeFilters, data.page + 1, true, activeType)
                }
                disabled={loadingMore}
                className="rounded-lg border px-6 py-2 transition-all disabled:opacity-50"
                style={{
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--color-surface-raised)",
                }}
              >
                {loadingMore
                  ? "加载中…"
                  : `加载更多（${data.entities.length} / ${data.total}）`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
