import Link from "next/link";
import { getRecommendations } from "@/lib/recommend";

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

interface RecommendationsProps {
  entityId: string;
}

export async function Recommendations({ entityId }: RecommendationsProps) {
  const recommendations = await getRecommendations(entityId, 6);

  if (recommendations.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
        你可能想看
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {recommendations.map((rec) => (
          <Link
            key={rec.id}
            href={`/${rec.type}/${rec.slug}`}
            className="block p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
          >
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`px-1.5 py-0.5 text-xs rounded ${TYPE_COLORS[rec.type] || "bg-gray-100 text-gray-700"}`}
              >
                {TYPE_LABELS[rec.type] || rec.type}
              </span>
            </div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1 line-clamp-1">
              {rec.name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {rec.reason}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
