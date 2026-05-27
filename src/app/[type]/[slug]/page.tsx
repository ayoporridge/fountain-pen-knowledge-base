import { getDb } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

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

  const tags = db
    .prepare(
      `SELECT t.name, t.slug, t.dimension FROM tags t
       JOIN entity_tags et ON et.tag_id = t.id
       WHERE et.entity_id = ?
       ORDER BY t.dimension, t.name`,
    )
    .all(entity.id) as Array<{ name: string; slug: string; dimension: string }>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-4 flex items-center justify-between">
        <Link
          href="/"
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ← 首页
        </Link>
        <Link
          href={`/${type}/${slug}/edit`}
          className="text-sm px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          ✏️ 编辑
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

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {tags.map((tag) => (
            <span
              key={tag.slug}
              className="inline-block px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              {tag.name}
            </span>
          ))}
        </div>
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
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <MarkdownRenderer content={entity.body_md} />
          </div>
        </div>
      )}

      <div className="text-xs text-gray-400 dark:text-gray-500 mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
        创建于 {entity.created_at} · 更新于 {entity.updated_at}
      </div>
    </div>
  );
}
