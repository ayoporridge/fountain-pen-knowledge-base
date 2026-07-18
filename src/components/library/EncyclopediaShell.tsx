import Link from "next/link";
import { MarkdownHtml } from "@/components/MarkdownHtml";
import type {
  BrandPageData,
  ModelPageData,
  PublishedPageData,
  PublishedSource,
} from "@/lib/entity-page";
import type { RenderedMarkdownDocument, StoryHeading } from "@/lib/markdown";

type ShellProps = {
  data: PublishedPageData;
  document: RenderedMarkdownDocument;
};

type NavItem = {
  href: string;
  label: string;
  level?: StoryHeading["level"];
};

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
        <span>许可：{media.license}</span>
        {media.sourceUrl ? (
          <a
            href={media.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center ink-underline"
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

function SectionNav({ items }: { items: NavItem[] }) {
  if (items.length < 2) return null;
  return (
    <nav
      aria-label="词条章节"
      className="encyclopedia-section-nav mb-8 overflow-x-auto rounded-lg border p-2"
      style={{
        borderColor: "var(--color-border)",
        backgroundColor: "var(--color-surface-raised)",
      }}
    >
      <div className="flex min-w-max gap-1">
        {items.map((item) => (
          <a
            key={item.href}
            href={item.href}
            data-heading-level={item.level}
            className="inline-flex min-h-11 items-center rounded-lg px-3 py-2 text-sm font-medium text-ink-light"
          >
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

function sourceMetadata(source: PublishedSource): string {
  return [source.sourceName, source.archiveLocator].filter(Boolean).join(" · ");
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
              className="inline-flex min-h-11 max-w-full items-center break-words font-medium ink-underline"
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
                className="mt-2 inline-flex min-h-11 items-center text-sm ink-underline"
              >
                查看存档
              </a>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

function BrandFacts({ data }: { data: BrandPageData }) {
  return (
    <div className="encyclopedia-brand-facts space-y-8">
      <section id="timeline" className="scroll-mt-24">
        <h2 className="mb-4 text-xl font-semibold text-ink">品牌时间线</h2>
        <ol className="space-y-3">
          {data.timeline.map((event) => (
            <li
              key={`${event.startDate}:${event.title}`}
              className="library-panel p-4"
            >
              <p className="font-semibold text-ink">
                {event.circa ? "约 " : ""}
                {event.startDate}
                {event.endDate ? `—${event.endDate}` : ""} · {event.title}
              </p>
              {event.description ? (
                <p className="mt-2 text-sm leading-6 text-ink-light">
                  {event.description}
                </p>
              ) : null}
              <a
                href={event.source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex min-h-11 items-center text-sm ink-underline"
              >
                来源：{event.source.title}
              </a>
            </li>
          ))}
        </ol>
      </section>

      <section id="models" className="scroll-mt-24">
        <h2 className="mb-4 text-xl font-semibold text-ink">
          全部型号（{data.models.length}）
        </h2>
        <ul className="grid list-none gap-2 p-0 sm:grid-cols-2">
          {data.models.map((model) => (
            <li key={model.slug}>
              <Link
                href={`/pen/${model.slug}`}
                className="flex min-h-11 items-center rounded-lg border px-3 py-2 text-ink"
                style={{ borderColor: "var(--color-border-light)" }}
              >
                {model.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function ModelFacts({ data }: { data: ModelPageData }) {
  return (
    <div className="encyclopedia-model-facts space-y-8">
      <section id="specs" className="scroll-mt-24">
        <h2 className="mb-4 text-xl font-semibold text-ink">型号档案</h2>
        <dl className="grid gap-3 sm:grid-cols-2">
          {data.specs.map((spec) => (
            <div key={spec.key} className="library-panel p-4">
              <dt className="text-sm text-ink-muted">{spec.label}</dt>
              <dd className="mt-1 font-semibold text-ink">
                {String(spec.value)}
              </dd>
              <dd className="mt-2 text-sm text-ink-muted">
                <a
                  href={spec.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center ink-underline"
                >
                  来源：{spec.source.title}
                </a>
                {spec.source.locator ? ` · ${spec.source.locator}` : ""}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {data.variants.length > 0 ? (
        <section id="variants" className="scroll-mt-24">
          <h2 className="mb-4 text-xl font-semibold text-ink">
            版本与年代边界
          </h2>
          <ul className="space-y-3">
            {data.variants.map((variant) => (
              <li key={variant.name} className="library-panel p-4">
                <p className="font-semibold text-ink">{variant.name}</p>
                {variant.releaseYear ? (
                  <p className="mt-1 text-sm text-ink-muted">
                    发布年份：{variant.releaseYear}
                  </p>
                ) : null}
                {variant.notes ? (
                  <p className="mt-2 text-sm leading-6 text-ink-light">
                    {variant.notes}
                  </p>
                ) : null}
                <a
                  href={variant.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex min-h-11 items-center text-sm ink-underline"
                >
                  来源：{variant.source.title}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
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
          { href: "#timeline", label: "品牌时间线" },
          { href: "#models", label: `全部型号（${data.models.length}）` },
          { href: "#sources", label: "来源" },
        ]
      : [
          { href: "#brand", label: "品牌" },
          { href: "#specs", label: "型号档案" },
          ...(data.variants.length > 0
            ? [{ href: "#variants", label: "版本与年代边界" }]
            : []),
          { href: "#sources", label: "来源" },
        ];
  return [...headingItems, ...moduleItems];
}

export function EncyclopediaShell({ data, document }: ShellProps) {
  return (
    <main className="encyclopedia-shell mx-auto max-w-6xl px-4 py-8">
      <EntityHeader data={data} />
      {data.type === "pen" ? <CanonicalRelations data={data} /> : null}
      <PrimaryMedia data={data} />
      <SectionNav items={navigationItems(data, document)} />

      <div className="encyclopedia-content space-y-10">
        <StoryArticle data={data} document={document} />
        {data.type === "brand" ? (
          <BrandFacts data={data} />
        ) : (
          <ModelFacts data={data} />
        )}
        <QualifiedSources sources={data.sources} />
        <ExploreMore data={data} />
      </div>
    </main>
  );
}
