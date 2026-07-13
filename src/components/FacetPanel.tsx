"use client";

interface FacetOption {
  slug: string;
  name: string;
  count: number;
}

interface FacetPanelProps {
  facets: Record<string, FacetOption[]>;
  activeFilters: Record<string, string>;
  onFilterChange: (dimension: string, slug: string | null) => void;
  showTitle?: boolean;
}

const DIM_LABELS: Record<string, string> = {
  nib_type: "笔尖类型",
  nib_material: "笔尖材质",
  fill_system: "上墨方式",
  origin: "产地",
  era: "年代",
  body_material: "笔身材质",
};

const SEMANTIC_VALUE_LABELS: Record<string, string> = {
  "nib_material:gold": "所有金尖",
};

export function getActiveFilterLabel(
  dimension: string,
  value: string,
  facets?: Record<string, FacetOption[]>,
): string {
  const optionName = facets?.[dimension]?.find(
    (option) => option.slug === value,
  )?.name;
  return (
    SEMANTIC_VALUE_LABELS[`${dimension}:${value}`] ||
    `${DIM_LABELS[dimension] || dimension}：${optionName || value}`
  );
}

export function FacetPanel({
  facets,
  activeFilters,
  onFilterChange,
  showTitle = true,
}: FacetPanelProps) {
  return (
    <div className="space-y-4">
      {showTitle && <h2 className="text-lg font-semibold text-ink">筛选</h2>}

      {Object.entries(activeFilters).some(
        ([dimension, value]) =>
          !!SEMANTIC_VALUE_LABELS[`${dimension}:${value}`],
      ) && (
        <div
          className="rounded-lg border p-3"
          style={{
            borderColor: "var(--color-border)",
            backgroundColor: "var(--color-accent-light)",
          }}
        >
          <p className="mb-2 text-xs font-medium">当前语义条件</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(activeFilters).map(([dimension, value]) => {
              const label = SEMANTIC_VALUE_LABELS[`${dimension}:${value}`];
              if (!label) return null;
              return (
                <button
                  key={`${dimension}-${value}`}
                  type="button"
                  onClick={() => onFilterChange(dimension, null)}
                  className="rounded-full px-2.5 py-1 text-xs"
                  style={{
                    backgroundColor: "var(--color-surface-raised)",
                    color: "var(--color-accent)",
                  }}
                  aria-label={`清除${label}筛选`}
                >
                  {label} ×
                </button>
              );
            })}
          </div>
        </div>
      )}

      {Object.entries(facets).map(([dim, options]) => {
        if (options.length === 0) return null;
        const isActive = !!activeFilters[dim];

        return (
          <details
            key={dim}
            open={isActive || options.length <= 8}
            className="group"
          >
            <summary className="min-h-11 cursor-pointer select-none py-2 text-sm font-medium text-ink-light">
              {DIM_LABELS[dim] || dim}
            </summary>
            {isActive && (
              <button
                type="button"
                onClick={() => onFilterChange(dim, null)}
                className="mb-2 min-h-11 rounded-lg px-2 text-xs text-red-600 hover:text-red-800"
                aria-label={`清除${DIM_LABELS[dim] || dim}筛选`}
              >
                ✕ 清除当前条件
              </button>
            )}
            <div className="space-y-1 ml-2">
              {options.map((opt) => {
                const disabled = opt.count === 0;

                return (
                  <label
                    key={opt.slug}
                    className={`flex min-h-11 items-center gap-2 group/item ${
                      disabled
                        ? "cursor-not-allowed opacity-45"
                        : "cursor-pointer"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`facet-${dim}`}
                      checked={activeFilters[dim] === opt.slug}
                      disabled={disabled}
                      onChange={() => {
                        if (disabled) return;
                        onFilterChange(
                          dim,
                          activeFilters[dim] === opt.slug ? null : opt.slug,
                        );
                      }}
                      className="rounded border-border text-accent focus:ring-accent"
                    />
                    <span className="text-sm text-ink-muted group-hover/item:text-ink">
                      {opt.name}
                    </span>
                    <span className="text-xs text-ink-muted ml-auto">
                      {opt.count}
                    </span>
                  </label>
                );
              })}
            </div>
          </details>
        );
      })}
    </div>
  );
}
