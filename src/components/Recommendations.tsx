import Link from "next/link";
import { TYPE_LABELS } from "@/lib/constants";
import { getRecommendations } from "@/lib/recommend";

const TYPE_BADGE_COLORS: Record<string, string> = {
  pen: "bg-green-100/80 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  brand: "bg-accent-light text-accent",
  concept:
    "bg-purple-100/80 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  material:
    "bg-orange-100/80 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  nib: "bg-yellow-100/80 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  fill_system:
    "bg-teal-100/80 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300",
  article: "bg-surface-dim text-ink-light",
};

interface RecommendationsProps {
  entityId: string;
}

export async function Recommendations({ entityId }: RecommendationsProps) {
  const recommendations = await getRecommendations(entityId, 6);

  if (recommendations.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-ink mb-4">你可能想看</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {recommendations.map((rec) => (
          <Link
            key={rec.id}
            href={`/${rec.type}/${rec.slug}`}
            className="block p-4 rounded-lg border border-border hover:border-accent hover:bg-surface transition-all"
          >
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`px-1.5 py-0.5 text-xs rounded ${TYPE_BADGE_COLORS[rec.type] || "bg-surface-dim text-ink-light"}`}
              >
                {TYPE_LABELS[rec.type] || rec.type}
              </span>
            </div>
            <h3 className="font-medium text-ink mb-1 line-clamp-1">
              {rec.name}
            </h3>
            <p className="text-xs text-ink-muted">{rec.reason}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
