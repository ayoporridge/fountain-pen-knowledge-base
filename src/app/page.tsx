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
  Star,
  Sparkle,
} from "@phosphor-icons/react/dist/ssr";

export const dynamic = "force-dynamic";

const TYPE_ICONS: Record<string, React.ComponentType<Record<string, unknown>>> = {
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

// Pre-selected star entries per type for Bento preview
const TYPE_STARS: Record<string, string[]> = {
  pen: ["百乐 Heritage 92", "万宝龙 149", "永生 601"],
  brand: ["百乐 (Pilot)"],
  concept: ["活塞上墨"],
  nib: ["笔尖类型"],
  fill_system: ["上墨方式"],
  article: ["钢笔历史", "修复指南"],
};

const HERO_QUESTIONS = [
  {
    q: "500 以内，日系金尖有哪些选择？",
    href: "/search?q=日系+金尖+500",
  },
  {
    q: "活塞上墨和旋转上墨到底有什么区别？",
    href: "/concept/piston-filler",
  },
  {
    q: "百乐 823 和 743 怎么选？",
    href: "/search?q=百乐+823+743",
  },
];

export default async function Home() {
  // Stats
  const stats = (await queryAll(
    "SELECT type, COUNT(*) as cnt FROM entities GROUP BY type ORDER BY cnt DESC"
  )) as Array<{ type: string; cnt: number }>;
  const totalEntities = stats.reduce((sum, s) => sum + s.cnt, 0);

  // Featured: well-tagged entries (curated, not just newest)
  const featured = (await queryAll(
    `SELECT e.type, e.name, e.slug, e.summary, e.image_url, COUNT(DISTINCT et.tag_id) as tag_count
     FROM entities e
     LEFT JOIN entity_tags et ON et.entity_id = e.id
     GROUP BY e.id
     HAVING tag_count >= 1
     ORDER BY tag_count DESC, e.created_at DESC
     LIMIT 8`
  )) as Array<{
    type: string;
    name: string;
    slug: string;
    summary: string | null;
    image_url: string | null;
    tag_count: number;
  }>;

  // Type breakdown with star names
  const typeBreakdown = stats
    .filter((s) => s.type !== "material") // hide empty material
    .map((s) => ({
      ...s,
      label: TYPE_LABELS[s.type] || s.type,
      Icon: TYPE_ICONS[s.type] || PenNib,
      stars: TYPE_STARS[s.type] || [],
    }));

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* ── Hero: concrete, not abstract ── */}
      <div className="max-w-2xl mb-16 animate-fade-in-up">
        <div className="flex items-center gap-2 mb-4">
          <Sparkle
            size={20}
            weight="duotone"
            style={{ color: "var(--color-accent)" }}
          />
          <span
            className="text-sm font-medium"
            style={{ color: "var(--color-accent)" }}
          >
            {totalEntities} 个词条 · {stats.length} 种类型
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          找一支适合你的钢笔
        </h1>
        <p
          className="text-lg mb-8"
          style={{
            color: "var(--color-ink-light)",
            lineHeight: 1.7,
          }}
        >
          看懂一支你已经买了的笔，搞清两支笔到底差在哪。品牌、型号、工艺、上墨方式——这里有你想知道的一切。
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

        {/* Real question hooks */}
        <div className="mt-6 space-y-2">
          {HERO_QUESTIONS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 text-sm transition-colors hover:underline underline-offset-4"
              style={{ color: "var(--color-ink-muted)" }}
            >
              <ArrowRight size={12} style={{ color: "var(--color-accent)" }} />
              {item.q}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4 mt-6">
          <Link
            href="/browse"
            className="flex items-center gap-1 text-sm font-medium transition-colors hover:underline underline-offset-4"
            style={{ color: "var(--color-accent)" }}
          >
            浏览全部词条
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* ── Type Bento: preview star entries, not numbers ── */}
      <section className="mb-16 animate-fade-in-up stagger-1">
        <h2
          className="text-xl font-semibold tracking-tight mb-6"
          style={{ color: "var(--color-ink)" }}
        >
          按类型探索
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {typeBreakdown.map(({ type, label, Icon, stars, cnt }) => (
            <Link
              key={type}
              href={`/browse?type=${type}`}
              className="group p-5 rounded-xl border transition-all card-hover"
              style={{
                borderColor: "var(--color-border)",
                backgroundColor: "var(--color-surface-raised)",
                gridColumn: type === "pen" ? "span 2" : undefined,
                gridRow: type === "pen" ? "span 2" : undefined,
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span style={{ color: "var(--color-accent)" }}>
                  <Icon size={type === "pen" ? 28 : 22} weight="duotone" />
                </span>
                <h3
                  className="font-semibold tracking-tight"
                  style={{ color: "var(--color-ink)" }}
                >
                  {label}
                </h3>
              </div>
              {stars.length > 0 && (
                <div className="space-y-1.5">
                  {stars.map((name) => (
                    <p
                      key={name}
                      className="text-sm truncate"
                      style={{ color: "var(--color-ink-light)" }}
                    >
                      {name}
                    </p>
                  ))}
                </div>
              )}
              <p
                className="text-xs mt-3"
                style={{ color: "var(--color-ink-muted)" }}
              >
                {cnt} 个词条 →
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured: well-tagged, worth reading ── */}
      <section className="animate-fade-in-up stagger-2">
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-xl font-semibold tracking-tight flex items-center gap-2"
            style={{ color: "var(--color-ink)" }}
          >
            <Star
              size={20}
              weight="duotone"
              style={{ color: "var(--color-accent)" }}
            />
            值得一读
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
          {featured.map((entity) => {
            const Icon = TYPE_ICONS[entity.type] || PenNib;
            return (
              <Link
                key={entity.slug}
                href={`/${entity.type}/${entity.slug}`}
                className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-[var(--color-surface-dim)]"
                style={{ borderColor: "var(--color-border-light)" }}
              >
                {entity.image_url ? (
                  <img
                    src={String(entity.image_url)}
                    alt={String(entity.name)}
                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                    loading="lazy"
                  />
                ) : (
                  <span style={{ color: "var(--color-accent)", flexShrink: 0 }}>
                    <Icon size={16} weight="duotone" />
                  </span>
                )}
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
