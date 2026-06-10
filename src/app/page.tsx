import { queryAll, queryOne } from "@/lib/db";
import Link from "next/link";
import {
  PenNib,
  Buildings,
  Lightbulb,
  Drop,
  BookOpen,
  ArrowRight,
  MagnifyingGlass,
  Clock,
} from "@phosphor-icons/react/dist/ssr";

export const dynamic = "force-dynamic";

const TYPE_ICONS: Record<string, React.ComponentType<{ size?: number; weight?: string; className?: string }>> = {
  pen: PenNib,
  brand: Buildings,
  concept: Lightbulb,
  material: PenNib,
  nib: PenNib,
  fill_system: Drop,
  article: BookOpen,
};

const TYPE_LABELS: Record<string, string> = {
  pen: "钢笔",
  brand: "品牌",
  concept: "概念",
  material: "材质",
  nib: "笔尖",
  fill_system: "上墨方式",
  article: "文章",
};

const BENTO_SIZES: Record<string, string> = {
  pen: "sm:col-span-2 sm:row-span-2",
  brand: "sm:col-span-2",
  concept: "sm:col-span-1",
  material: "sm:col-span-1",
  nib: "sm:col-span-1",
  fill_system: "sm:col-span-1",
  article: "sm:col-span-2",
};

export default async function Home() {
  // Stats
  const stats = (await queryAll(
    "SELECT type, COUNT(*) as cnt FROM entities GROUP BY type ORDER BY cnt DESC"
  )) as Array<{ type: string; cnt: number }>;
  const totalEntities = stats.reduce((sum, s) => sum + s.cnt, 0);

  // Recent entities
  const recent = (await queryAll(
    "SELECT type, slug, name, summary, created_at FROM entities ORDER BY created_at DESC LIMIT 8"
  )) as Array<{
    type: string;
    slug: string;
    name: string;
    summary: string | null;
    created_at: string;
  }>;

  // Type breakdown
  const typeBreakdown = stats.map((s) => ({
    ...s,
    label: TYPE_LABELS[s.type] || s.type,
    Icon: TYPE_ICONS[s.type] || PenNib,
  }));

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* ── Hero: left-aligned, search-first ── */}
      <div className="max-w-2xl mb-16 animate-fade-in-up">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          钢笔知识图谱
        </h1>
        <p
          className="text-lg mb-8"
          style={{
            color: "var(--color-ink-light)",
            lineHeight: 1.7,
          }}
        >
          漫游探索钢笔世界的一切——品牌、型号、工艺、文化。通过自由链接和多维标签，发现你不知道的关联。
        </p>

        {/* Search as primary CTA */}
        <Link
          href="/search"
          className="flex items-center gap-3 w-full max-w-md px-4 py-3 rounded-xl border transition-all card-hover"
          style={{
            borderColor: "var(--color-border)",
            backgroundColor: "var(--color-surface-raised)",
          }}
        >
          <MagnifyingGlass
            size={18}
            style={{ color: "var(--color-ink-muted)" }}
          />
          <span style={{ color: "var(--color-ink-muted)" }}>
            搜索品牌、型号、概念…
          </span>
          <kbd
            className="ml-auto text-xs px-1.5 py-0.5 rounded border"
            style={{
              color: "var(--color-ink-muted)",
              borderColor: "var(--color-border)",
            }}
          >
            /
          </kbd>
        </Link>

        <div className="flex items-center gap-4 mt-4">
          <Link
            href="/browse"
            className="flex items-center gap-1 text-sm font-medium transition-colors hover:underline underline-offset-4"
            style={{ color: "var(--color-accent)" }}
          >
            浏览全部 {totalEntities} 个词条
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* ── Type Bento Grid ── */}
      <section className="mb-16 animate-fade-in-up stagger-1">
        <h2
          className="text-xl font-semibold tracking-tight mb-6"
          style={{ color: "var(--color-ink)" }}
        >
          按类型探索
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {typeBreakdown.map(({ type, cnt, label, Icon }) => (
            <Link
              key={type}
              href={`/browse?type=${type}`}
              className={`group p-5 rounded-xl border transition-all card-hover ${BENTO_SIZES[type] || ""}`}
              style={{
                borderColor: "var(--color-border)",
                backgroundColor: "var(--color-surface-raised)",
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <Icon
                  size={type === "pen" ? 28 : 22}
                  weight="duotone"
                  style={{ color: "var(--color-accent)" }}
                />
                <span
                  className="text-2xl font-bold tracking-tight"
                  style={{ color: "var(--color-ink)" }}
                >
                  {cnt}
                </span>
              </div>
              <h3
                className="font-semibold tracking-tight"
                style={{ color: "var(--color-ink)" }}
              >
                {label}
              </h3>
              <p
                className="text-sm mt-1"
                style={{ color: "var(--color-ink-muted)" }}
              >
                个词条
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Recent Entities: timeline-style list ── */}
      <section className="animate-fade-in-up stagger-2">
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-xl font-semibold tracking-tight"
            style={{ color: "var(--color-ink)" }}
          >
            最近添加
          </h2>
          <Link
            href="/browse"
            className="text-sm transition-colors hover:underline underline-offset-4"
            style={{ color: "var(--color-ink-muted)" }}
          >
            查看全部 →
          </Link>
        </div>

        <div
          className="divide-y rounded-xl border overflow-hidden"
          style={{
            borderColor: "var(--color-border)",
            backgroundColor: "var(--color-surface-raised)",
          }}
        >
          {recent.map((entity) => {
            const Icon = TYPE_ICONS[entity.type] || PenNib;
            return (
              <Link
                key={entity.slug}
                href={`/${entity.type}/${entity.slug}`}
                className="flex items-center gap-4 px-5 py-3.5 transition-colors"
                style={{ borderColor: "var(--color-border-light)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "var(--color-surface-dim)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <Icon
                  size={16}
                  weight="duotone"
                  style={{ color: "var(--color-accent)", flexShrink: 0 }}
                />
                <div className="flex-1 min-w-0">
                  <span
                    className="font-medium truncate block"
                    style={{ color: "var(--color-ink)" }}
                  >
                    {entity.name}
                  </span>
                  {entity.summary && (
                    <span
                      className="text-sm truncate block"
                      style={{ color: "var(--color-ink-muted)" }}
                    >
                      {entity.summary}
                    </span>
                  )}
                </div>
                <span
                  className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: "var(--color-surface-dim)",
                    color: "var(--color-ink-muted)",
                  }}
                >
                  {TYPE_LABELS[entity.type] || entity.type}
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
