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
import { TYPE_LABELS } from "@/lib/constants";
import { queryAll } from "@/lib/db";
import { getPublicMediaUrl } from "@/lib/media-url";
import { publicMediaFilter } from "@/lib/public-media";
import { PUBLIC_ENTITY_FILTER_SQL } from "@/lib/public-visibility";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "钢笔资料馆",
  description:
    "一座可追溯的钢笔资料馆：从品牌、型号、工艺、历史展览和关系图谱进入钢笔世界。",
  alternates: { canonical: "/" },
};

// Star entries per type — queried from DB at build time

const HERO_CATEGORIES = [
  { label: "钢笔型号", href: "/browse?type=pen" },
  { label: "品牌", href: "/browse?type=brand" },
  { label: "笔尖", href: "/by/nib" },
  { label: "上墨方式", href: "/by/fill" },
  { label: "材质", href: "/by/material" },
  { label: "历史专题", href: "/exhibits" },
];

const TASK_ENTRIES = [
  {
    title: "找一支笔",
    desc: "从产地、笔尖、上墨方式和笔身材质开始浏览。",
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
    description: "一座可追溯、可按分类漫游的钢笔资料馆。",
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
                AND ${publicMediaFilter("ma")}
              ORDER BY CASE ma.usage_status WHEN 'primary' THEN 0 ELSE 1 END,
                       ma.created_at DESC,
                       ma.id
              LIMIT 1
            ) as media_id,
            (
              SELECT COALESCE(ma.local_path, ma.thumbnail_url, ma.image_url)
              FROM media_assets ma
              WHERE ma.entity_id = e.id
                AND ${publicMediaFilter("ma")}
              ORDER BY CASE ma.usage_status WHEN 'primary' THEN 0 ELSE 1 END,
                       ma.created_at DESC,
                       ma.id
              LIMIT 1
            ) as media_url,
            COUNT(DISTINCT featured_tag.id) as tag_count
     FROM entities e
     LEFT JOIN entity_tags et ON et.entity_id = e.id
     LEFT JOIN tags featured_tag ON featured_tag.id = et.tag_id
       AND featured_tag.dimension IN (
         'nib_type', 'nib_material', 'fill_system', 'origin',
         'body_material'
       )
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
           ORDER BY (
                      SELECT COUNT(*)
                      FROM entity_tags star_et
                      JOIN tags star_tag ON star_tag.id = star_et.tag_id
                      WHERE star_et.entity_id = e.id
                        AND star_tag.dimension IN (
                          'nib_type', 'nib_material', 'fill_system', 'origin',
                          'body_material'
                        )
                    ) DESC,
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
            钢笔资料馆
          </p>
          <h1 className="mb-4 max-w-3xl text-4xl font-bold tracking-tight text-[#fff7e8] sm:text-6xl">
            钢笔知识图谱
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

          <nav className="flex max-w-3xl flex-wrap gap-2" aria-label="常用分类">
            {HERO_CATEGORIES.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex min-h-11 items-center rounded-full border px-4 py-2 text-sm font-semibold transition-colors hover:bg-white/10"
                style={{
                  borderColor: "rgba(255,247,232,0.42)",
                  color: "#fff7e8",
                  backgroundColor: "rgba(39,31,25,0.24)",
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/browse"
              className="inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white transition-colors hover:brightness-110"
              style={{ backgroundColor: "var(--color-accent)" }}
            >
              查看全部分类
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/library"
              className="inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors hover:bg-white/10"
              style={{
                borderColor: "rgba(255,247,232,0.42)",
                color: "#fff7e8",
                fontFamily: "var(--font-label)",
              }}
            >
              查看馆区与专题
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
                  {!["pen", "brand"].includes(entity.type) && entity.summary ? (
                    <span
                      className="text-sm truncate block"
                      style={{ color: "var(--color-ink-muted)" }}
                    >
                      {entity.summary}
                    </span>
                  ) : entity.tag_count > 0 ? (
                    <span
                      className="text-sm truncate block"
                      style={{ color: "var(--color-ink-muted)" }}
                    >
                      {entity.tag_count} 个分类标签
                    </span>
                  ) : null}
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
