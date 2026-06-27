import {
  ArrowRight,
  Books,
  ChartBar,
  Clock,
  Compass,
  Flask,
  Images,
  LinkSimple,
  PenNib,
  ShieldCheck,
  Sparkle,
} from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { SearchBox } from "@/components/SearchBox";
import {
  getFeaturedBrands,
  getLibraryStats,
  getPublishedExhibits,
} from "@/lib/library";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "钢笔图书馆 - 钢笔知识图谱",
  description: "从品牌、型号、工艺、历史、图示和玩家口碑进入钢笔资料馆。",
};

const MODULES = [
  {
    title: "品牌馆",
    desc: "按品牌进入展厅：身份卡、故事、时间线、代表型号和来源。",
    href: "/browse",
    Icon: Books,
  },
  {
    title: "型号档案",
    desc: "把每支笔拆成参数、历史背景、版本、图示和常见对比。",
    href: "/browse",
    Icon: PenNib,
  },
  {
    title: "工艺实验室",
    desc: "用机制图看懂笔尖、笔舌、上墨、材质和维护。",
    href: "/timeline",
    Icon: Flask,
  },
  {
    title: "历史展览",
    desc: "策展式阅读路径，串联品牌、型号、工艺与时代。",
    href: "/exhibits",
    Icon: Compass,
  },
  {
    title: "玩家口碑",
    desc: "聚合社区趋势和常见争议，只保留元数据与摘要。",
    href: "/library/community",
    Icon: Sparkle,
  },
  {
    title: "来源索引",
    desc: "查看来源类型、授权说明、抓取方式和已登记参考资料。",
    href: "/library/sources",
    Icon: LinkSimple,
  },
  {
    title: "媒体授权",
    desc: "图片、扫描件和外部媒体会标明来源与授权说明。",
    href: "/library/media",
    Icon: ShieldCheck,
  },
  {
    title: "图示馆",
    desc: "站内原创 SVG、结构图、机制图、时间线和系列树。",
    href: "/library/diagrams",
    Icon: Images,
  },
  {
    title: "覆盖审计",
    desc: "按品牌和型号查看故事、来源、图示、媒体和规格的缺口。",
    href: "/library/coverage",
    Icon: ChartBar,
  },
];

const LIBRARY_HERO_IMAGE = "/images/library/warm-pen-atlas/library-hero.jpg";

export default async function LibraryPage() {
  const [stats, brands, exhibits] = await Promise.all([
    getLibraryStats(),
    getFeaturedBrands(8),
    getPublishedExhibits(),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <section
        data-testid="library-hero"
        className="mb-6 flex min-h-[340px] items-start rounded-lg bg-cover bg-left p-6 sm:min-h-[380px] sm:p-8 lg:p-10"
        style={{
          backgroundImage: `url(${LIBRARY_HERO_IMAGE})`,
          border: "1px solid var(--color-border)",
        }}
      >
        <div className="max-w-[17rem] sm:max-w-xl">
          <p
            className="mb-2 text-sm font-medium"
            style={{ color: "var(--color-accent)" }}
          >
            Fountain Pen Library
          </p>
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            钢笔图书馆
          </h1>
          <p
            className="text-base leading-relaxed sm:text-lg"
            style={{ color: "var(--color-ink-light)" }}
          >
            从品牌、型号、机制、历史展览和玩家口碑进入一个可追溯的钢笔资料馆。
          </p>
        </div>
      </section>

      <div className="mb-10 max-w-3xl">
        <SearchBox placeholder="搜索品牌、型号、工艺、历史专题…" />
      </div>

      <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          ["来源", stats.sources || 0],
          ["Claims", stats.claims || 0],
          ["故事", stats.stories || 0],
          ["图示", stats.diagrams || 0],
          ["时间线", stats.events || 0],
          ["媒体", stats.media || 0],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl border p-4"
            style={{
              borderColor: "var(--color-border)",
              backgroundColor: "var(--color-surface-raised)",
            }}
          >
            <div
              className="text-2xl font-semibold"
              style={{ color: "var(--color-ink)" }}
            >
              {value}
            </div>
            <div
              className="text-xs"
              style={{ color: "var(--color-ink-muted)" }}
            >
              {label}
            </div>
          </div>
        ))}
      </div>

      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold">馆区入口</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map(({ title, desc, href, Icon }) => (
            <Link
              key={title}
              href={href}
              className="rounded-xl border p-5 card-hover"
              style={{
                borderColor: "var(--color-border)",
                backgroundColor: "var(--color-surface-raised)",
              }}
            >
              <span
                className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg"
                style={{
                  backgroundColor: "var(--color-accent-light)",
                  color: "var(--color-accent)",
                }}
              >
                <Icon size={20} weight="duotone" />
              </span>
              <h3 className="mb-1 font-semibold">{title}</h3>
              <p
                className="mb-3 text-sm leading-relaxed"
                style={{ color: "var(--color-ink-muted)" }}
              >
                {desc}
              </p>
              <span
                className="inline-flex items-center gap-1 text-sm"
                style={{ color: "var(--color-accent)" }}
              >
                进入
                <ArrowRight size={14} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
            <Books size={20} style={{ color: "var(--color-accent)" }} />
            品牌馆样例
          </h2>
          <div className="grid gap-2">
            {brands.map((brand) => (
              <Link
                key={brand.slug}
                href={`/${brand.type}/${brand.slug}`}
                className="rounded-xl border p-4 transition-colors hover:bg-[var(--color-surface-dim)]"
                style={{
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--color-surface-raised)",
                  color: "var(--color-ink)",
                }}
              >
                <div className="font-medium">{brand.name}</div>
                {brand.summary && (
                  <p
                    className="mt-1 line-clamp-2 text-sm"
                    style={{ color: "var(--color-ink-muted)" }}
                  >
                    {brand.summary}
                  </p>
                )}
                <div
                  className="mt-2 text-xs"
                  style={{ color: "var(--color-ink-muted)" }}
                >
                  故事 {brand.story_count || 0} · 时间线{" "}
                  {brand.event_count || 0}
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
            <Clock size={20} style={{ color: "var(--color-accent)" }} />
            历史展览
          </h2>
          <div className="grid gap-2">
            {exhibits.slice(0, 6).map((exhibit) => (
              <Link
                key={exhibit.slug}
                href={`/exhibits/${exhibit.slug}`}
                className="rounded-xl border p-4 transition-colors hover:bg-[var(--color-surface-dim)]"
                style={{
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--color-surface-raised)",
                  color: "var(--color-ink)",
                }}
              >
                <div className="font-medium">{exhibit.title}</div>
                {exhibit.summary && (
                  <p
                    className="mt-1 text-sm leading-relaxed"
                    style={{ color: "var(--color-ink-muted)" }}
                  >
                    {exhibit.summary}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
