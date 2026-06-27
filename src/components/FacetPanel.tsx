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
}

const DIM_LABELS: Record<string, string> = {
  nib_type: "笔尖类型",
  nib_material: "笔尖材质",
  fill_system: "上墨方式",
  origin: "产地",
  price: "价位",
  brand_tier: "品牌定位",
  era: "年代",
  size: "尺寸",
  usage: "用途",
  style: "风格",
  ink_type: "墨水类型",
  body_material: "笔身材质",
};

export function FacetPanel({
  facets,
  activeFilters,
  onFilterChange,
}: FacetPanelProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-ink">筛选</h2>

      {Object.entries(facets).map(([dim, options]) => {
        if (options.length === 0) return null;
        const isActive = !!activeFilters[dim];

        return (
          <details
            key={dim}
            open={isActive || options.length <= 8}
            className="group"
          >
            <summary className="cursor-pointer text-sm font-medium text-ink-light mb-2 select-none">
              {DIM_LABELS[dim] || dim}
              {isActive && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    onFilterChange(dim, null);
                  }}
                  className="ml-2 text-xs text-red-500 hover:text-red-700"
                >
                  ✕ 清除
                </button>
              )}
            </summary>
            <div className="space-y-1 ml-2">
              {options.map((opt) => {
                const disabled = opt.count === 0;

                return (
                  <label
                    key={opt.slug}
                    className={`flex items-center gap-2 group/item ${
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
