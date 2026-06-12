import { queryAll, queryOne } from "@/lib/db";
import Link from "next/link";
import BentoGrid from "@/components/BentoGrid";
import Image from "next/image";
import type { Metadata } from "next";
import {
  PenNib,
  ArrowRight,
  MagnifyingGlass,
  Star,
} from "@phosphor-icons/react/dist/ssr";
import { TYPE_LABELS, TYPE_ICONS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "钢笔知识图谱 - 找一支适合你的钢笔",
  description:
    "看懂一支你已经买了的笔，搞清两支笔到底差在哪。品牌、型号、工艺、上墨方式——AI 时代的钢笔百科全书，自由链接、多维探索。",
};

// Star entries per type — queried from DB at build time

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

  // Type breakdown with real star entries from DB
  const typeBreakdown = await Promise.all(
    stats
      .filter((s) => s.type !== "material")
      .map(async (s) => {
        const stars = (await queryAll(
          `SELECT name, slug FROM entities
           WHERE type = ?
           ORDER BY (SELECT COUNT(*) FROM entity_tags WHERE entity_id = entities.id) DESC,
                    created_at DESC
           LIMIT ?`,
          [s.type, s.type === "pen" ? 3 : 2]
        )) as Array<{ name: string; slug: string }>;
        return {
          ...s,
          label: TYPE_LABELS[s.type] || s.type,
          stars,
        };
      })
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* ── Hero: concrete, not abstract ── */}
      <div className="max-w-2xl mb-16 manuscript-border p-8 sm:p-10">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 font-serif">
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
      <section className="mb-16">
        <h2
          className="text-xl font-semibold tracking-tight mb-6"
          style={{ color: "var(--color-ink)" }}
        >
          按类型探索
        </h2>
        <BentoGrid items={typeBreakdown} />
      </section>

      {/* ── Featured: well-tagged, worth reading ── */}
      <section>
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
                  <Image
                    src={String(entity.image_url)}
                    alt={String(entity.name)}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
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
