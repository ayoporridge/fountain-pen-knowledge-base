import Link from "next/link";
import { BrandMuseum } from "@/components/library/BrandMuseum";
import { ModelArchive } from "@/components/library/ModelArchive";
import { MarkdownHtml } from "@/components/MarkdownHtml";
import { MEDIA_LICENSE_LABELS } from "@/lib/constants";
import type { PublishedPageData, PublishedSource } from "@/lib/entity-page";
import type { RenderedMarkdownDocument, StoryHeading } from "@/lib/markdown";
import { displayPublicSourceMetadata } from "@/lib/publicText";

type ShellProps = {
  data: PublishedPageData;
  document: RenderedMarkdownDocument;
};

type NavItem = {
  href: string;
  label: string;
  level?: StoryHeading["level"];
};

type NavVariant = "desktop" | "mobile";

function EntityHeader({ data }: { data: PublishedPageData }) {
  const typeLabel = data.type === "brand" ? "品牌" : "钢笔型号";
  const parent = data.type === "pen" ? data.canonicalBrand : null;

  return (
    <>
      <nav
        aria-label="面包屑"
        className="encyclopedia-breadcrumb mb-6 flex min-w-0 flex-wrap items-center gap-2 text-sm text-ink-muted"
      >
        <Link className="inline-flex min-h-11 items-center" href="/">
          首页
        </Link>
        <span aria-hidden="true">›</span>
        {parent ? (
          <Link
            className="inline-flex min-h-11 min-w-0 items-center"
            href={`/brand/${parent.slug}`}
          >
            {parent.name}
          </Link>
        ) : (
          <Link
            className="inline-flex min-h-11 items-center"
            href={`/browse?type=${data.type}`}
          >
            {typeLabel}
          </Link>
        )}
        <span aria-hidden="true">›</span>
        <span aria-current="page" className="min-w-0 text-ink">
          {data.name}
        </span>
      </nav>

      <header className="encyclopedia-header mb-6 min-w-0">
        <p className="archive-kicker mb-2">{typeLabel}</p>
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          {data.name}
        </h1>
        <p
          data-testid="entity-summary"
          className="encyclopedia-summary mt-4 max-w-[72ch] text-lg leading-8 text-ink-light"
        >
          {data.summary}
        </p>
      </header>
    </>
  );
}

function PrimaryMedia({ data }: { data: PublishedPageData }) {
  const media = data.primaryMedia;
  return (
    <figure
      className="encyclopedia-primary-media mb-8 overflow-hidden rounded-lg border"
      style={{
        borderColor: "var(--color-border)",
        backgroundColor: "var(--color-surface-dim)",
      }}
    >
      {/* biome-ignore lint/performance/noImgElement: qualified same-origin media is rendered without a Next optimizer fallback */}
      <img
        src={media.imageUrl}
        alt={`${data.name}：${media.title}`}
        className="max-h-[560px] w-full object-contain"
      />
      <figcaption className="flex min-h-11 flex-wrap items-center gap-x-2 border-t px-4 py-3 text-sm text-ink-muted">
        <span>{media.attribution}</span>
        <span>
          许可：{MEDIA_LICENSE_LABELS[media.license] ?? media.license}
        </span>
        {media.sourceUrl ? (
          <a
            href={media.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="查看图片来源（在新窗口打开）"
            className="encyclopedia-source-link ink-underline"
          >
            查看图片来源
          </a>
        ) : null}
      </figcaption>
    </figure>
  );
}

function StoryArticle({
  data,
  document,
}: {
  data: PublishedPageData;
  document: RenderedMarkdownDocument;
}) {
  return (
    <article
      id="story"
      aria-label={data.story.title}
      className="encyclopedia-story reading-measure min-w-0 scroll-mt-24"
    >
      <MarkdownHtml html={document.html} />
    </article>
  );
}

function SectionNav({
  items,
  variant,
}: {
  items: NavItem[];
  variant: NavVariant;
}) {
  if (items.length < 2) return null;
  const isMobile = variant === "mobile";
  return (
    <nav
      aria-label={isMobile ? "移动词条目录" : "桌面词条目录"}
      className={
        isMobile
          ? "encyclopedia-mobile-nav encyclopedia-local-scroll"
          : "encyclopedia-toc"
      }
    >
      <ul>
        {items.map((item, index) => (
          <li key={item.href}>
            <a
              href={item.href}
              data-heading-level={item.level}
              aria-current={index === 0 ? "location" : undefined}
              className="text-sm text-ink-light"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function sourceMetadata(source: PublishedSource): string {
  return displayPublicSourceMetadata(source.sourceName, source.archiveLocator);
}

function archiveLinkLabel(source: PublishedSource): string {
  return source.archiveLocator?.startsWith("project-evidence-snapshot:")
    ? "查看证据快照"
    : "查看存档";
}

function QualifiedSources({ sources }: { sources: PublishedSource[] }) {
  if (sources.length === 0) return null;
  return (
    <section id="sources" className="encyclopedia-sources scroll-mt-24">
      <h2 className="mb-4 text-xl font-semibold text-ink">来源</h2>
      <ul className="grid list-none gap-3 p-0 sm:grid-cols-2">
        {sources.map((source) => (
          <li
            key={`${source.url}:${source.title}`}
            className="library-panel min-w-0 p-4"
          >
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${source.title}（在新窗口打开）`}
              className="encyclopedia-source-link max-w-full font-medium ink-underline"
            >
              {source.title}
            </a>
            <p className="mt-1 break-words text-sm text-ink-muted">
              {sourceMetadata(source)}
            </p>
            {source.archiveUrl ? (
              <a
                href={source.archiveUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${source.title}${archiveLinkLabel(source)}（在新窗口打开）`}
                className="encyclopedia-source-link mt-2 text-sm ink-underline"
              >
                {archiveLinkLabel(source)}
              </a>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

function CanonicalRelations({ data }: { data: PublishedPageData }) {
  if (data.type !== "pen") return null;
  return (
    <section id="brand" className="encyclopedia-canonical-brand scroll-mt-24">
      <h2 className="mb-3 text-xl font-semibold text-ink">品牌</h2>
      <Link
        href={`/brand/${data.canonicalBrand.slug}`}
        className="inline-flex min-h-11 items-center rounded-lg border px-4 py-2 font-medium text-ink"
        style={{ borderColor: "var(--color-border)" }}
      >
        {data.canonicalBrand.name}
      </Link>
    </section>
  );
}

function ExploreMore({ data }: { data: PublishedPageData }) {
  return (
    <section className="encyclopedia-explore mt-12 border-t pt-8">
      <h2 className="text-xl font-semibold text-ink">继续探索</h2>
      <Link
        href={`/graph?entity=${encodeURIComponent(data.slug)}`}
        className="mt-3 inline-flex min-h-11 items-center rounded-lg border px-4 py-2 font-medium text-ink"
        style={{ borderColor: "var(--color-border)" }}
      >
        继续探索关系图谱
      </Link>
    </section>
  );
}

function navigationItems(
  data: PublishedPageData,
  document: RenderedMarkdownDocument,
): NavItem[] {
  const headingItems = document.headings.map((heading) => ({
    href: `#${heading.id}`,
    label: heading.label,
    level: heading.level,
  }));
  const moduleItems: NavItem[] =
    data.type === "brand"
      ? [
          ...(data.timeline.length > 0
            ? [{ href: "#timeline", label: "品牌时间线" }]
            : []),
          ...(data.models.length > 0
            ? [
                {
                  href: "#models",
                  label: `全部型号（${data.models.length}）`,
                },
              ]
            : []),
          ...(data.sources.length > 0
            ? [{ href: "#sources", label: "来源" }]
            : []),
        ]
      : [
          { href: "#brand", label: "品牌" },
          ...(data.specs.length > 0
            ? [{ href: "#specs", label: "核心规格" }]
            : []),
          ...(data.variants.length > 0
            ? [{ href: "#variants", label: "版本差异" }]
            : []),
          ...(data.sources.length > 0
            ? [{ href: "#sources", label: "来源" }]
            : []),
        ];
  return [{ href: "#story", label: "正文" }, ...headingItems, ...moduleItems];
}

export function EncyclopediaShell({ data, document }: ShellProps) {
  const items = navigationItems(data, document);
  return (
    <main className="encyclopedia-page">
      <EntityHeader data={data} />
      {data.type === "pen" ? <CanonicalRelations data={data} /> : null}
      <PrimaryMedia data={data} />
      <SectionNav items={items} variant="mobile" />

      <div className="encyclopedia-grid">
        <div className="encyclopedia-main">
          <StoryArticle data={data} document={document} />
          {data.type === "brand" ? (
            <BrandMuseum timeline={data.timeline} models={data.models} />
          ) : (
            <ModelArchive specs={data.specs} variants={data.variants} />
          )}
          <QualifiedSources sources={data.sources} />
          <ExploreMore data={data} />
        </div>
        <aside className="encyclopedia-rail" aria-label="词条目录栏">
          <SectionNav items={items} variant="desktop" />
        </aside>
      </div>
    </main>
  );
}
