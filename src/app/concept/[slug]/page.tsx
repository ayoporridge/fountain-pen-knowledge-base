import Link from "next/link";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { getEntitiesForConcept } from "@/lib/concept-engine";

export const dynamic = "force-dynamic";

interface ConceptPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ConceptPage({ params }: ConceptPageProps) {
  const { slug } = await params;
  const db = await getDb();

  const concept = await db
    .prepare("SELECT * FROM concept_rules WHERE slug = ?")
    .bind(slug)
    .first() as { id: string; name: string; description: string | null; conditions: string } | null;

  if (!concept) {
    notFound();
  }

  const entities = await getEntitiesForConcept(slug) as Array<{
    id: string;
    type: string;
    slug: string;
    name: string;
    summary: string | null;
  }>;

  const conditions = JSON.parse(concept.conditions) as Array<{
    dimension: string;
    tag_slug: string;
  }>;

  // Resolve condition tag names
  const condWithNames = [];
  for (const c of conditions) {
    const tag = await db
      .prepare("SELECT name FROM tags WHERE slug = ? AND dimension = ?")
      .bind(c.tag_slug, c.dimension)
      .first() as { name: string } | null;
    condWithNames.push({ ...c, name: tag?.name || c.tag_slug });
  }

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
          {concept.name}
        </h1>
      </div>

      {concept.description && (
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
          {concept.description}
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
