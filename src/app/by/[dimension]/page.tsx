export const dynamic = "force-dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";

const VALID_DIMENSIONS: Record<string, { label: string; tagDimension: string }> = {
  brand: { label: "品牌", tagDimension: "brand_tier" },
  price: { label: "价位", tagDimension: "price" },
  nib: { label: "笔尖类型", tagDimension: "nib_type" },
  origin: { label: "产地", tagDimension: "origin" },
  fill: { label: "上墨方式", tagDimension: "fill_system" },
  usage: { label: "用途", tagDimension: "usage" },
  era: { label: "年代", tagDimension: "era" },
  size: { label: "尺寸", tagDimension: "size" },
  material: { label: "笔身材质", tagDimension: "body_material" },
};

interface DimensionPageProps {
  params: Promise<{ dimension: string }>;
}

export default async function DimensionPage({ params }: DimensionPageProps) {
  const { dimension } = await params;
  const dimConfig = VALID_DIMENSIONS[dimension];

  if (!dimConfig) {
    notFound();
  }

  const db = getDb();

  // Get all tags in this dimension with entity counts
  const tags = db
    .prepare(
      `SELECT t.id, t.name, t.slug, t.dimension, COUNT(et.entity_id) as entity_count
       FROM tags t
       LEFT JOIN entity_tags et ON et.tag_id = t.id
       WHERE t.dimension = ?
       GROUP BY t.id
       HAVING entity_count > 0
       ORDER BY entity_count DESC`,
    )
    .all(dimConfig.tagDimension) as Array<{
    id: string;
    name: string;
    slug: string;
    dimension: string;
    entity_count: number;
  }>;

  const totalEntities = tags.reduce((sum, t) => sum + t.entity_count, 0);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/"
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ← 首页
        </Link>
        <Link
          href="/browse"
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          浏览
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        按{dimConfig.label}浏览
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        共 {tags.length} 个{dimConfig.label}分类，覆盖 {totalEntities} 个词条
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {tags.map((tag) => (
          <Link
            key={tag.id}
            href={`/browse?${dimension === "brand" ? "brand_tier" : dimension === "fill" ? "fill_system" : dimension === "nib" ? "nib_type" : dimension === "material" ? "body_material" : dimension}=${tag.slug}`}
            className="block p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
          >
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
              {tag.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {tag.entity_count} 个词条
            </p>
          </Link>
        ))}
      </div>

      {tags.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-4xl mb-4">📂</p>
          <p>暂无{dimConfig.label}分类数据</p>
        </div>
      )}
    </div>
  );
}
