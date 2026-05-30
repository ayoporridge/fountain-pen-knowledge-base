interface Tag {
  name: string;
  slug: string;
  dimension: string;
}

interface EntityMetaProps {
  tags: Tag[];
}

const DIM_LABELS: Record<string, string> = {
  nib_type: "笔尖类型",
  fill_system: "上墨方式",
  body_material: "笔身材质",
  origin: "产地",
  price: "价位",
  usage: "用途",
  nib_material: "笔尖材质",
  brand_tier: "品牌定位",
  era: "年代",
  size: "尺寸",
  ink_type: "墨水类型",
  style: "风格",
};

const DIM_COLORS: Record<string, string> = {
  nib_type: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  fill_system: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
  body_material: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  origin: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  price: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  usage: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  nib_material: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  brand_tier: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  era: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  size: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
  ink_type: "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200",
  style: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200",
};

export function EntityMeta({ tags }: EntityMetaProps) {
  if (tags.length === 0) return null;

  // Group by dimension
  const grouped = new Map<string, Tag[]>();
  for (const tag of tags) {
    const group = grouped.get(tag.dimension) || [];
    group.push(tag);
    grouped.set(tag.dimension, group);
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
        标签
      </h2>
      <div className="space-y-3">
        {Array.from(grouped.entries()).map(([dim, dimTags]) => (
          <div key={dim}>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mr-2">
              {DIM_LABELS[dim] || dim}:
            </span>
            <div className="inline-flex flex-wrap gap-1.5 mt-1">
              {dimTags.map((tag) => (
                <span
                  key={tag.slug}
                  className={`px-2 py-0.5 text-xs rounded-full ${DIM_COLORS[dim] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"}`}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
