export const dynamic = "force-dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { getEntitiesForConcept } from "@/lib/concept-engine";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { RelatedEntities } from "@/components/RelatedEntities";
import { EntityMeta } from "@/components/EntityMeta";

interface ConceptPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ConceptPage({ params }: ConceptPageProps) {
  const { slug } = await params;
  const db = getDb();

  // First check concept_rules (Phase 7 synthetic concepts)
  const conceptRule = db
    .prepare("SELECT * FROM concept_rules WHERE slug = ?")
    .get(slug) as { id: string; name: string; description: string | null; conditions: string } | undefined;

  if (conceptRule) {
    // Render as concept rule page
    const entities = getEntitiesForConcept(slug) as Array<{
      id: string;
      type: string;
      slug: string;
      name: string;
      summary: string | null;
    }>;

    const conditions = JSON.parse(conceptRule.conditions) as Array<{
      dimension: string;
      tag_slug: string;
    }>;

    const condWithNames = conditions.map((c) => {
      const tag = db
        .prepare("SELECT name FROM tags WHERE slug = ? AND dimension = ?")
        .get(c.tag_slug, c.dimension) as { name: string } | undefined;
      return { ...c, name: tag?.name || c.tag_slug };
    });

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
            {conceptRule.name}
          </h1>
        </div>

        {conceptRule.description && (
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
            {conceptRule.description}
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
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {entities.map((entity) => (
              <Link
                key={entity.id}
                href={`/${entity.type}/${entity.slug}`}
                className="block p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
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

  // Fallback: check entities table (imported content with type="concept")
  const entity = db
    .prepare("SELECT * FROM entities WHERE slug = ? AND type = 'concept'")
    .get(slug) as Record<string, string | null> | undefined;

  if (!entity) {
    notFound();
  }

  // Render as regular entity page (minimal — avoid 500 from complex components)
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

  const forward = db
    .prepare(
      `SELECT el.id, el.link_type, e.slug, e.name, e.type
       FROM entity_links el
       JOIN entities e ON e.id = el.target_id
       WHERE el.source_id = ? AND el.link_type != 'reverse'`,
    )
    .all(entity.id) as Array<{ id: string; link_type: string; slug: string; name: string; type: string }>;

  const backlinks = db
    .prepare(
      `SELECT el.id, el.link_type, e.slug, e.name, e.type
       FROM entity_links el
       JOIN entities e ON e.id = el.source_id
       WHERE el.target_id = ? AND el.link_type != 'reverse'`,
    )
    .all(entity.id) as Array<{ id: string; link_type: string; slug: string; name: string; type: string }>;

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
          {entity.name}
        </h1>
      </div>

      {entity.summary && (
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
          {entity.summary}
        </p>
      )}

      <EntityMeta tags={tags} />

      {entity.body_md && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">详细内容</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <MarkdownRenderer content={entity.body_md} />
          </div>
        </div>
      )}

      <RelatedEntities forward={forward} backlinks={backlinks} />

      {entity.source_file && (
        <div className="text-xs text-gray-400 dark:text-gray-500 mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <span className="font-medium">来源:</span> {entity.source_file}
        </div>
      )}
    </div>
  );
}
