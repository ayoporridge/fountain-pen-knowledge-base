import { getDb } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { RelatedEntities } from "@/components/RelatedEntities";
import { EntityMeta } from "@/components/EntityMeta";
import { LocalGraph } from "@/components/LocalGraph";
import { Recommendations } from "@/components/Recommendations";
import { DensityBadge } from "@/components/DensityBadge";
import { CompareButton } from "@/components/CompareBar";

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

  // Fetch links
  const forward = db
    .prepare(
      `SELECT el.id, el.link_type, e.slug, e.name, e.type
       FROM entity_links el
       JOIN entities e ON e.id = el.target_id
       WHERE el.source_id = ? AND el.link_type != 'reverse'
       ORDER BY el.created_at`,
    )
    .all(entity.id) as Array<{
    id: string;
    link_type: string;
    slug: string;
    name: string;
    type: string;
  }>;

  const backlinks = db
    .prepare(
      `SELECT el.id, el.link_type, e.slug, e.name, e.type
       FROM entity_links el
       JOIN entities e ON e.id = el.source_id
       WHERE el.target_id = ? AND el.link_type != 'reverse'
       ORDER BY el.created_at`,
    )
    .all(entity.id) as Array<{
    id: string;
    link_type: string;
    slug: string;
    name: string;
    type: string;
  }>;

  const linkCount = forward.length + backlinks.length;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-4 flex items-center justify-between">
        <Link
          href="/"
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ← 首页
        </Link>
        <div className="flex items-center gap-2">
          <CompareButton slug={slug} name={entity.name || slug} type={type} />
          <Link
            href={`/${type}/${slug}/edit`}
            className="text-sm px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            ✏️ 编辑
          </Link>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {TYPE_LABELS[type] || type}
          </span>
          <DensityBadge linkCount={linkCount} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {entity.name}
        </h1>
      </div>

      {entity.summary && (
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
          {entity.summary}
        </p>
      )}

      <EntityMeta tags={tags} />

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

      {/* Relationship graph */}
      {linkCount > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
            关系图
          </h2>
          <LocalGraph
            entityId={entity.id as string}
            entityType={type}
            entitySlug={slug}
          />
        </div>
      )}

      <RelatedEntities forward={forward} backlinks={backlinks} />

      <Recommendations entityId={entity.id as string} />

      {/* Source attribution */}
      {entity.source_file && (
        <div className="text-xs text-gray-400 dark:text-gray-500 mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <span className="font-medium">来源:</span> {entity.source_file}
          {entity.source_url && (
            <a
              href={entity.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-blue-500 hover:underline"
            >
              原文链接
            </a>
          )}
          {entity.imported_at && (
            <span className="ml-2">导入于 {entity.imported_at}</span>
          )}
        </div>
      )}

      <div className="text-xs text-gray-400 dark:text-gray-500 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        创建于 {entity.created_at} · 更新于 {entity.updated_at}
      </div>
    </div>
  );
}
