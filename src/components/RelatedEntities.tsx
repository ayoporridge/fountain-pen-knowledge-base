import Link from "next/link";

interface LinkItem {
  id: string;
  link_type: string;
  slug: string;
  name: string;
  type: string;
}

interface RelatedEntitiesProps {
  forward: LinkItem[];
  backlinks: LinkItem[];
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

export function RelatedEntities({ forward, backlinks }: RelatedEntitiesProps) {
  if (forward.length === 0 && backlinks.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
        关联词条
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {forward.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              链接到 ({forward.length})
            </h3>
            <ul className="space-y-2">
              {forward.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/${item.type}/${item.slug}`}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <span
                      className={`px-1.5 py-0.5 text-xs rounded ${TYPE_COLORS[item.type] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"}`}
                    >
                      {TYPE_LABELS[item.type] || item.type}
                    </span>
                    <span className="text-sm text-gray-900 dark:text-gray-100">
                      {item.name}
                    </span>
                    <span className="text-xs text-gray-400 ml-auto">
                      {item.link_type}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        {backlinks.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              被引用 ({backlinks.length})
            </h3>
            <ul className="space-y-2">
              {backlinks.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/${item.type}/${item.slug}`}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <span
                      className={`px-1.5 py-0.5 text-xs rounded ${TYPE_COLORS[item.type] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"}`}
                    >
                      {TYPE_LABELS[item.type] || item.type}
                    </span>
                    <span className="text-sm text-gray-900 dark:text-gray-100">
                      {item.name}
                    </span>
                    <span className="text-xs text-gray-400 ml-auto">
                      {item.link_type}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
