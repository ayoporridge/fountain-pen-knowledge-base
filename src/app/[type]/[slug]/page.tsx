export const dynamic = "force-dynamic";
import { queryOne, queryAll } from "@/lib/db";
import { getEntitiesForConcept } from "@/lib/concept-engine";
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
  article: "文章",
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

/**
 * Render concept rule page (synthetic concepts defined by tag conditions)
 */
async function ConceptRulePage({
  rule,
  entities,
}: {
  rule: { id: string; name: string; description: string | null; conditions: string };
  entities: Array<{ id: string; type: string; slug: string; name: string; summary: string | null }>;
}) {
  const conditions = JSON.parse(rule.conditions) as Array<{
    dimension: string;
    tag_slug: string;
  }>;

  const condWithNames = await Promise.all(conditions.map(async (c) => {
    const tag = await queryOne(
      "SELECT name FROM tags WHERE slug = ? AND dimension = ?",
      [c.tag_slug, c.dimension]
    ) as { name: string } | undefined;
    return { ...c, name: tag?.name || c.tag_slug };
  }));

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Link
        href="/"
        className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-6 inline-block"
      >
        ← 首页
      </Link>

      <div className="mb-6">
        <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 mb-2">
          概念
        </span>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {rule.name}
        </h1>
      </div>

      {rule.description && (
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
          {rule.description}
        </p>
      )}

      {condWithNames.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <h2 className="text-sm font-medium text-gray-500 mb-2">匹配条件</h2>
          <div className="flex flex-wrap gap-2">
            {condWithNames.map((c) => (
              <span
                key={`${c.dimension}-${c.tag_slug}`}
                className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
              >
                {c.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mb-4 text-sm text-gray-500">
        匹配 {entities.length} 个词条
      </div>

      {entities.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-4xl mb-4">📭</p>
          <p>暂无匹配此概念的词条</p>
          <p className="text-sm mt-2">尝试为词条添加更多标签来触发匹配</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {entities.map((entity) => (
            <Link
              key={entity.id}
              href={`/${entity.type}/${entity.slug}`}
              className="block p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                  {TYPE_LABELS[entity.type] || entity.type}
                </span>
              </div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                {entity.name}
              </h3>
              {entity.summary && (
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                  {entity.summary}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Regular entity page
 */
function EntityPageView({
  entity,
  type,
  slug,
  attrs,
  tags,
  forward,
  backlinks,
}: {
  entity: Record<string, string | null>;
  type: string;
  slug: string;
  attrs: Array<{ key: string; value: string }>;
  tags: Array<{ name: string; slug: string; dimension: string }>;
  forward: Array<{ id: string; link_type: string; slug: string; name: string; type: string }>;
  backlinks: Array<{ id: string; link_type: string; slug: string; name: string; type: string }>;
}) {
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

      {attrs.length > 0 && (
        <div className="mb-6">
          <EntityMeta attrs={attrs} labels={ATTR_LABELS} />
        </div>
      )}

      {tags.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-medium text-gray-500 mb-2">标签</h2>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link
                key={`${tag.dimension}-${tag.slug}`}
                href={`/by/${tag.dimension}/${tag.slug}`}
                className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
              >
                {tag.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {entity.body_md && (
        <div className="mb-6">
          <MarkdownRenderer content={entity.body_md} />
        </div>
      )}

      <div className="mb-6">
        <LocalGraph
          entityId={entity.id as string}
          entityType={type}
          entitySlug={slug}
        />
      </div>

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

export default async function EntityPage({ params }: EntityPageProps) {
  const { type, slug } = await params;

  // Special handling for concepts: check concept_rules first
  if (type === "concept") {
    const conceptRule = await queryOne(
      "SELECT * FROM concept_rules WHERE slug = ?",
      [slug]
    ) as { id: string; name: string; description: string | null; conditions: string } | undefined;

    if (conceptRule) {
      const entities = await getEntitiesForConcept(slug) as Array<{
        id: string;
        type: string;
        slug: string;
        name: string;
        summary: string | null;
      }>;
      return <ConceptRulePage rule={conceptRule} entities={entities} />;
    }
  }

  // Regular entity lookup
  const entity = await queryOne(
    "SELECT * FROM entities WHERE slug = ? AND type = ?",
    [slug, type]
  ) as Record<string, string | null> | undefined;

  if (!entity) {
    notFound();
  }

  const attrs = await queryAll(
    "SELECT key, value FROM entity_attributes WHERE entity_id = ?",
    [entity.id]
  ) as Array<{ key: string; value: string }>;

  const tags = await queryAll(
    `SELECT t.name, t.slug, t.dimension FROM tags t
     JOIN entity_tags et ON et.tag_id = t.id
     WHERE et.entity_id = ?
     ORDER BY t.dimension, t.name`,
    [entity.id]
  ) as Array<{ name: string; slug: string; dimension: string }>;

  // Fetch links
  const forward = await queryAll(
    `SELECT el.id, el.link_type, e.slug, e.name, e.type
     FROM entity_links el
     JOIN entities e ON e.id = el.target_id
     WHERE el.source_id = ? AND el.link_type != 'reverse'
     ORDER BY el.created_at`,
    [entity.id]
  ) as Array<{ id: string; link_type: string; slug: string; name: string; type: string }>;

  const backlinks = await queryAll(
    `SELECT el.id, el.link_type, e.slug, e.name, e.type
     FROM entity_links el
     JOIN entities e ON e.id = el.source_id
     WHERE el.target_id = ? AND el.link_type != 'reverse'
     ORDER BY el.created_at`,
    [entity.id]
  ) as Array<{ id: string; link_type: string; slug: string; name: string; type: string }>;

  return (
    <EntityPageView
      entity={entity}
      type={type}
      slug={slug}
      attrs={attrs}
      tags={tags}
      forward={forward}
      backlinks={backlinks}
    />
  );
}
