import {
  ArrowRight,
  Books,
  Clock,
  Compass,
  Flask,
  LinkSimple,
  PenNib,
} from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import {
  getFeaturedBrands,
  getLibraryStats,
  getPublishedExhibits,
} from "@/lib/library";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "专题与资料",
  description: "从品牌、型号、工艺、历史专题和来源进入钢笔资料馆。",
  alternates: { canonical: "/library" },
};

const MODULES = [
  {
    title: "品牌馆",
    desc: "按品牌查看全部已发布型号、已核对时间线和参考来源。",
    href: "/browse?type=brand",
    Icon: Books,
  },
  {
    title: "型号档案",
    desc: "查看已有证据支持的规格、品牌关系与来源资料。",
    href: "/browse?type=pen",
    Icon: PenNib,
  },
  {
    title: "工艺实验室",
    desc: "用图示和术语页理解笔尖、笔舌、上墨与材质。",
    href: "/library/diagrams",
    Icon: Flask,
  },
  {
    title: "历史展览",
    desc: "策展式阅读路径，串联品牌、型号、工艺与时代。",
    href: "/exhibits",
    Icon: Compass,
  },
  {
    title: "来源索引",
    desc: "查看来源类型、授权说明、抓取方式和已登记参考资料。",
    href: "/library/sources",
    Icon: LinkSimple,
  },
];

const LIBRARY_HERO_IMAGE = "/images/library/warm-pen-atlas/library-hero.jpg";

const CATEGORY_SHORTCUTS = [
  { label: "全部型号", href: "/browse?type=pen" },
  { label: "全部品牌", href: "/browse?type=brand" },
  { label: "按笔尖", href: "/by/nib" },
  { label: "按上墨", href: "/by/fill" },
  { label: "按产地", href: "/by/origin" },
  { label: "按材质", href: "/by/material" },
];

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
            钢笔资料馆
          </p>
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            专题与资料
          </h1>
          <p
            className="text-base leading-relaxed sm:text-lg"
            style={{ color: "var(--color-ink-light)" }}
          >
            从品牌、型号、机制、历史专题和参考来源进入这座钢笔资料馆。
          </p>
        </div>
      </section>

      <nav className="mb-10 flex flex-wrap gap-2" aria-label="图书馆常用分类">
        {CATEGORY_SHORTCUTS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="inline-flex min-h-11 items-center rounded-full border px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--color-surface-dim)]"
            style={{
              borderColor: "var(--color-border)",
              backgroundColor: "var(--color-surface-raised)",
              color: "var(--color-ink-light)",
            }}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          ["来源", stats.sources || 0],
          ["事实与证据", stats.claims || 0],
          ["图示", stats.diagrams || 0],
          ["时间线", stats.events || 0],
          ["媒体", stats.media || 0],
          ["历史专题", stats.exhibits || 0],
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
                {Number(brand.event_count || 0) > 0 && (
                  <div
                    className="mt-2 text-xs"
                    style={{ color: "var(--color-ink-muted)" }}
                  >
                    已核对时间线 {brand.event_count}
                  </div>
                )}
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
