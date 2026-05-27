import { getDb } from "@/lib/db";
import Link from "next/link";

const TYPE_LABELS: Record<string, string> = {
  pen: "钢笔",
  brand: "品牌",
  concept: "概念",
  material: "材质",
  nib: "笔尖",
  fill_system: "上墨方式",
};

const TYPE_EMOJI: Record<string, string> = {
  pen: "🖊️",
  brand: "🏢",
  concept: "💡",
  material: "🪨",
  nib: "✒️",
  fill_system: "💧",
};

export default function Home() {
  const db = getDb();
  const entities = db
    .prepare("SELECT type, slug, name, summary FROM entities ORDER BY type, name")
    .all() as Array<{ type: string; slug: string; name: string; summary: string | null }>;

  const grouped = entities.reduce(
    (acc, e) => {
      (acc[e.type] = acc[e.type] || []).push(e);
      return acc;
    },
    {} as Record<string, typeof entities>,
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-3">钢笔知识图谱</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          漫游探索钢笔世界的一切——品牌、型号、工艺、文化
        </p>
      </div>

      {entities.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            还没有词条，从创建第一个开始吧！
          </p>
          <Link
            href="/new"
            className="inline-block px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            新建词条
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([type, items]) => (
            <section key={type}>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span>{TYPE_EMOJI[type] || "📄"}</span>
                <span>{TYPE_LABELS[type] || type}</span>
                <span className="text-sm font-normal text-gray-400">
                  ({items.length})
                </span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((entity) => (
                  <Link
                    key={entity.slug}
                    href={`/${entity.type}/${entity.slug}`}
                    className="block p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all"
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
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
