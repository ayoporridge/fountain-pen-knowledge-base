import {
  ArrowRight,
  Books,
  Flask,
  Graph,
  PenNib,
  Star,
} from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import BentoGrid from "@/components/BentoGrid";
import { EntityCardImage } from "@/components/EntityCardImage";
import { ScrollReveal } from "@/components/ScrollReveal";
import { SearchBox } from "@/components/SearchBox";
import { TYPE_LABELS } from "@/lib/constants";
import { queryAll } from "@/lib/db";
import { getPublicMediaUrl } from "@/lib/media-url";
import { PUBLIC_ENTITY_FILTER_SQL } from "@/lib/public-visibility";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "钢笔图书馆",
  description:
    "一座可追溯的钢笔资料馆：从品牌、型号、工艺、历史展览和关系图谱进入钢笔世界。",
  alternates: { canonical: "/" },
};

// Star entries per type — queried from DB at build time

const HERO_QUESTIONS = [
  {
    q: "500 以内，日系金尖有哪些选择？",
    href: "/browse?type=pen&origin=origin-japan&nib_material=gold&max_price=500",
  },
  {
    q: "活塞上墨和旋转上墨到底有什么区别？",
    href: "/concept/piston-filler",
  },
  {
    q: "百乐 823 和 743 怎么选？",
    href: "/compare?items=pilot-custom-823,%E7%99%BE%E4%B9%90-pilot-custom-743",
  },
];

const TASK_ENTRIES = [
  {
    title: "找一支笔",
    desc: "从预算、产地、笔尖和用途开始缩小范围。",
    href: "/browse?type=pen",
    Icon: PenNib,
  },
  {
    title: "品牌与历史",
    desc: "沿品牌馆和策展路径理解一支笔的来处。",
    href: "/library",
    Icon: Books,
  },
  {
    title: "工艺实验室",
    desc: "先弄清笔尖、上墨、材质和维护概念。",
    href: "/library/diagrams",
    Icon: Flask,
  },
  {
    title: "关系图谱",
    desc: "从一个型号出发，查看品牌、系列和工艺联系。",
    href: "/graph",
    Icon: Graph,
  },
];

export default async function Home() {
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "钢笔知识图谱",
    url: "https://fountain-pen-graph.vercel.app/",
    description: "一座可追溯、可漫游的钢笔资料馆。",
    potentialAction: {
      "@type": "SearchAction",
      target:
        "https://fountain-pen-graph.vercel.app/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };
  // Stats
  const stats = (await queryAll(
    `SELECT type, COUNT(*) as cnt
     FROM entities e
     WHERE ${PUBLIC_ENTITY_FILTER_SQL}
     GROUP BY type
     ORDER BY cnt DESC`,
  )) as Array<{ type: string; cnt: number }>;

  // Featured: well-tagged entries (curated, not just newest)
  const featured = (await queryAll(
    `SELECT e.type, e.name, e.slug, e.summary,
            (
              SELECT ma.id
              FROM media_assets ma
              WHERE ma.entity_id = e.id
                AND ma.asset_type = 'image'
                AND (ma.local_path IS NOT NULL OR ma.image_url IS NOT NULL)
                AND ma.review_status = 'approved'
                AND ma.usage_status IN ('primary', 'gallery')
              ORDER BY CASE ma.usage_status WHEN 'primary' THEN 0 ELSE 1 END,
                       ma.created_at DESC
              LIMIT 1
            ) as media_id,
            (
              SELECT COALESCE(ma.local_path, ma.thumbnail_url, ma.image_url)
              FROM media_assets ma
              WHERE ma.entity_id = e.id
                AND ma.asset_type = 'image'
                AND (ma.local_path IS NOT NULL OR ma.image_url IS NOT NULL)
                AND ma.review_status = 'approved'
                AND ma.usage_status IN ('primary', 'gallery')
              ORDER BY CASE ma.usage_status WHEN 'primary' THEN 0 ELSE 1 END,
                       ma.created_at DESC
              LIMIT 1
            ) as media_url,
            COUNT(DISTINCT et.tag_id) as tag_count
     FROM entities e
     LEFT JOIN entity_tags et ON et.entity_id = e.id
     WHERE ${PUBLIC_ENTITY_FILTER_SQL}
     GROUP BY e.id
     HAVING tag_count >= 1
     ORDER BY tag_count DESC, e.created_at DESC
     LIMIT 8`,
  )) as Array<{
    type: string;
    name: string;
    slug: string;
    summary: string | null;
    media_id: string | null;
    media_url: string | null;
    tag_count: number;
  }>;

  // Type breakdown with real star entries from DB
  const typeBreakdown = await Promise.all(
    stats
      .filter((s) => s.type !== "material")
      .map(async (s) => {
        const type = String(s.type);
        const stars = (await queryAll(
          `SELECT name, slug FROM entities e
           WHERE e.type = ?
             AND ${PUBLIC_ENTITY_FILTER_SQL}
           ORDER BY (SELECT COUNT(*) FROM entity_tags WHERE entity_id = e.id) DESC,
                    created_at DESC
           LIMIT ?`,
          [type, type === "pen" ? 3 : 2],
        )) as Array<{ name: string; slug: string }>;
        return {
          type,
          cnt: Number(s.cnt),
          label: TYPE_LABELS[type] || type,
          stars: stars.map((star) => ({
            name: String(star.name),
            slug: String(star.slug),
          })),
        };
      }),
  );
  const totalEntries = stats.reduce((sum, item) => sum + Number(item.cnt), 0);
  const quickStats = [
    { label: "词条", value: totalEntries },
    {
      label: "品牌",
      value: stats.find((item) => item.type === "brand")?.cnt || 0,
    },
    {
      label: "型号",
      value: stats.find((item) => item.type === "pen")?.cnt || 0,
    },
    {
      label: "专题",
      value: stats.find((item) => item.type === "article")?.cnt || 0,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: fixed site JSON-LD contains no user input
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      {/* ── Hero: library-first entry ── */}
      <section
        className="relative mb-10 min-h-[470px] overflow-hidden rounded-lg border animate-ink-bleed ink-bleed-stagger"
        style={{
          borderColor: "var(--color-border)",
          boxShadow: "var(--shadow-edge-lg)",
        }}
      >
        <Image
          src="/images/library/warm-pen-atlas/library-hero.jpg"
          alt="钢笔图书馆"
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, 1152px"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(39,31,25,0.78) 0%, rgba(39,31,25,0.58) 44%, rgba(39,31,25,0.18) 100%)",
          }}
        />
        <div className="relative z-10 flex min-h-[470px] flex-col justify-end p-5 sm:p-10">
          <p className="archive-kicker mb-3" style={{ color: "#f3c37b" }}>
            Fountain Pen Library
          </p>
          <h1 className="mb-4 max-w-3xl text-4xl font-bold tracking-tight text-[#fff7e8] sm:text-6xl">
            钢笔图书馆
          </h1>
          <p
            className="mb-7 max-w-2xl text-base sm:text-lg"
            style={{
              color: "rgba(255,247,232,0.88)",
              lineHeight: 1.7,
            }}
          >
            一座可追溯的钢笔资料馆。你可以从品牌、型号、工艺、历史展览和关系图谱进入，沿着来源看懂一支笔。
          </p>

          <div className="max-w-2xl">
            <SearchBox placeholder="搜索品牌、型号、工艺、历史专题…" />
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <div className="space-y-2">
              {HERO_QUESTIONS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 text-sm transition-colors ink-underline"
                  style={{ color: "rgba(255,247,232,0.82)" }}
                >
                  <ArrowRight size={12} style={{ color: "#f3c37b" }} />
                  {item.q}
                </Link>
              ))}
            </div>
            <Link
              href="/library"
              className="inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors hover:bg-white/10"
              style={{
                borderColor: "rgba(255,247,232,0.42)",
                color: "#fff7e8",
                fontFamily: "var(--font-label)",
              }}
            >
              进入图书馆
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      <div className="mb-10 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {quickStats.map((item) => (
          <div key={item.label} className="library-panel-muted px-4 py-3">
            <div className="numeric text-2xl font-semibold">
              {Number(item.value).toLocaleString("zh-CN")}
            </div>
            <div
              className="text-xs"
              style={{ color: "var(--color-ink-muted)" }}
            >
              {item.label}
            </div>
          </div>
        ))}
      </div>

      <ScrollReveal stagger className="mb-16">
        <h2
          className="text-xl font-semibold tracking-tight mb-6"
          style={{ color: "var(--color-ink)" }}
        >
          从这里开始
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {TASK_ENTRIES.map(({ title, desc, href, Icon }) => (
            <Link
              key={title}
              href={href}
              className="rounded-xl border p-4 card-hover"
              style={{
                borderColor: "var(--color-border)",
                backgroundColor: "var(--color-surface-raised)",
              }}
            >
              <span
                className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg"
                style={{
                  backgroundColor: "var(--color-accent-light)",
                  color: "var(--color-accent)",
                }}
              >
                <Icon size={18} weight="duotone" />
              </span>
              <h2 className="mb-1 text-base font-semibold">{title}</h2>
              <p
                className="m-0 text-sm leading-relaxed"
                style={{ color: "var(--color-ink-muted)" }}
              >
                {desc}
              </p>
            </Link>
          ))}
        </div>
      </ScrollReveal>

      {/* ── Type Bento: preview star entries, not numbers ── */}
      <ScrollReveal stagger className="mb-16">
        <h2
          className="text-xl font-semibold tracking-tight mb-6"
          style={{ color: "var(--color-ink)" }}
        >
          按类型探索
        </h2>
        <BentoGrid items={typeBreakdown} />
      </ScrollReveal>

      {/* ── Featured: well-tagged, worth reading ── */}
      <ScrollReveal>
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
            className="text-sm transition-colors ink-underline"
            style={{ color: "var(--color-ink-muted)" }}
          >
            查看全部 →
          </Link>
        </div>

        <div
          className="divide-y rounded-xl overflow-hidden"
          style={{
            backgroundColor: "var(--color-surface-raised)",
            boxShadow: "var(--shadow-raised)",
          }}
        >
          {featured.map((entity) => {
            return (
              <Link
                key={entity.slug}
                href={`/${entity.type}/${entity.slug}`}
                className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-[var(--color-surface-dim)] ink-underline"
                style={{ borderColor: "var(--color-border-light)" }}
              >
                <span className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg">
                  <EntityCardImage
                    compact
                    src={getPublicMediaUrl({
                      id: entity.media_id,
                      imageUrl: entity.media_url,
                    })}
                    name={entity.name}
                    type={entity.type}
                  />
                </span>
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
      </ScrollReveal>
    </div>
  );
}
