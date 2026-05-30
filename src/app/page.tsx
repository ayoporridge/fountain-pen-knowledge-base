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

  // Stats
  const stats = db
    .prepare("SELECT type, COUNT(*) as cnt FROM entities GROUP BY type ORDER BY cnt DESC")
    .all() as Array<{ type: string; cnt: number }>;
  const totalEntities = stats.reduce((sum, s) => sum + s.cnt, 0);
  const totalLinks = (db.prepare("SELECT COUNT(*) as cnt FROM entity_links").get() as { cnt: number }).cnt;
  const totalTags = (db.prepare("SELECT COUNT(*) as cnt FROM tags").get() as { cnt: number }).cnt;

  // Recent entities (last 10)
  const recent = db
    .prepare("SELECT type, slug, name, summary FROM entities ORDER BY created_at DESC LIMIT 10")
    .all() as Array<{ type: string; slug: string; name: string; summary: string | null }>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-3">钢笔知识图谱</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
          漫游探索钢笔世界的一切——品牌、型号、工艺、文化
        </p>

        {/* Stats */}
        <div className="flex justify-center gap-6 mb-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{totalEntities}</div>
            <div className="text-sm text-gray-500">词条</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{totalLinks}</div>
            <div className="text-sm text-gray-500">关联</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{totalTags}</div>
            <div className="text-sm text-gray-500">标签</div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/search"
            className="px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            🔍 搜索
          </Link>
          <Link
            href="/browse"
            className="px-5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
          >
            📚 浏览全部
          </Link>
          <Link
            href="/new"
            className="px-5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
          >
            ✏️ 新建词条
          </Link>
        </div>
      </div>

      {/* Type breakdown */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">按类型浏览</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {stats.map((s) => (
            <Link
              key={s.type}
              href={`/browse?pen_type=${s.type}`}
              className="block p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-center"
            >
              <div className="text-2xl mb-1">{TYPE_EMOJI[s.type] || "📄"}</div>
              <div className="font-medium text-gray-900 dark:text-gray-100">
                {TYPE_LABELS[s.type] || s.type}
              </div>
              <div className="text-sm text-gray-500">{s.cnt}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Dimension shortcuts */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">按维度探索</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { href: "/by/nib", emoji: "✒️", label: "笔尖类型" },
            { href: "/by/fill", emoji: "💧", label: "上墨方式" },
            { href: "/by/origin", emoji: "🌏", label: "产地" },
            { href: "/by/price", emoji: "💰", label: "价位" },
            { href: "/by/usage", emoji: "✍️", label: "用途" },
            { href: "/by/material", emoji: "🪨", label: "笔身材质" },
          ].map((dim) => (
            <Link
              key={dim.href}
              href={dim.href}
              className="block p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-center"
            >
              <div className="text-xl mb-1">{dim.emoji}</div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {dim.label}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent additions */}
      <section>
        <h2 className="text-xl font-semibold mb-4">最近添加</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {recent.map((entity) => (
            <Link
              key={entity.slug}
              href={`/${entity.type}/${entity.slug}`}
              className="block p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm">{TYPE_EMOJI[entity.type] || "📄"}</span>
                <span className="text-xs text-gray-500">{TYPE_LABELS[entity.type] || entity.type}</span>
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
      </section>
    </div>
  );
}
