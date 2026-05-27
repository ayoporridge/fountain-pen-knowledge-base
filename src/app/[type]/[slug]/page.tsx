import { getDb } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";

interface EntityPageProps {
  params: Promise<{ type: string; slug: string }>;
}

const TYPE_LABELS: Record<string, string> = {
  pen: "钢笔",
  brand: "品牌",
  concept: "概念",
  material: "材质",
  nib: "笔尖",
  fill_system: "上墨方式",
};

export default async function EntityPage({ params }: EntityPageProps) {
  const { type, slug } = await params;
  const db = getDb();

  const entity = db
    .prepare("SELECT * FROM entities WHERE slug = ? AND type = ?")
    .get(slug, type) as Record<string, string | null> | undefined;

  if (!entity) {
    notFound();
  }

  const attrs = db
    .prepare("SELECT key, value FROM entity_attributes WHERE entity_id = ?")
    .all(entity.id) as Array<{ key: string; value: string }>;

  const ATTR_LABELS: Record<string, string> = {
    nib_size: "笔尖粗细",
    fill_system: "上墨方式",
    body_material: "笔身材质",
    origin_country: "产地",
    price_range: "价位",
    writing_style: "书写风格",
    nib_material: "笔尖材质",
    founded: "创立年份",
    description: "描述",
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-4">
        <Link
          href="/"
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ← 首页
        </Link>
      </div>

      <div className="mb-6">
        <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mb-2">
          {TYPE_LABELS[type] || type}
        </span>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {entity.name}
        </h1>
      </div>

      {entity.summary && (
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
          {entity.summary}
        </p>
      )}

      {attrs.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
            属性
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full">
              <tbody>
                {attrs.map((attr) => (
                  <tr
                    key={attr.key}
                    className="border-b border-gray-100 dark:border-gray-700 last:border-0"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 w-1/3">
                      {ATTR_LABELS[attr.key] || attr.key}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      {attr.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {entity.body_md && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
            详细内容
          </h2>
          <div className="prose dark:prose-invert max-w-none">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              {entity.body_md}
            </pre>
          </div>
        </div>
      )}

      <div className="text-xs text-gray-400 dark:text-gray-500 mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
        创建于 {entity.created_at} · 更新于 {entity.updated_at}
      </div>
    </div>
  );
}
