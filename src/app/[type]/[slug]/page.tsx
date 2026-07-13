export const revalidate = 600;

import {
  ArrowLeft,
  Graph,
  Link as LinkIcon,
  PenNib,
  Tag,
} from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { LocalGraph } from "@/components/LocalGraph";
import { BrandMuseum } from "@/components/library/BrandMuseum";
import { ModelArchive } from "@/components/library/ModelArchive";
import { SourceCards } from "@/components/library/SourceCards";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { Recommendations } from "@/components/Recommendations";
import { RelatedEntities } from "@/components/RelatedEntities";
import { getEntitiesForConcept } from "@/lib/concept-engine";
import { TYPE_ICONS, TYPE_LABELS } from "@/lib/constants";
import { queryAll, queryOne } from "@/lib/db";
import { getCanonicalEntityPath } from "@/lib/entity-redirects";
import {
  getEntityReferences,
  getModelSpec,
  getPrimaryProductImage,
  type ModelSpecRecord,
} from "@/lib/library";
import { getPublicMediaUrl } from "@/lib/media-url";
import { isPublicEntity, publicEntityFilter } from "@/lib/public-visibility";
import { cleanPublicText, isPlaceholderSourceUrl } from "@/lib/publicText";
import { toPlainTextSummary } from "@/lib/text";

interface EntityPageProps {
  params: Promise<{ type: string; slug: string }>;
}

function preparePublicBody(body: string) {
  let removedPageTitle = false;
  return body
    .split("\n")
    .flatMap((line) => {
      if (!/^#\s+/.test(line)) return [line];
      if (!removedPageTitle) {
        removedPageTitle = true;
        return [];
      }
      return [line.replace(/^#\s+/, "## ")];
    })
    .join("\n")
    .trim();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string; slug: string }>;
}): Promise<Metadata> {
  const { type, slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const canonicalPath = getCanonicalEntityPath(type, slug);
  if (canonicalPath) permanentRedirect(canonicalPath);
  const entity = (await queryOne(
    "SELECT id, type, slug, name, summary, body_md FROM entities WHERE slug = ?",
    [slug],
  )) as
    | {
        id: string;
        type: string;
        slug: string;
        name: string;
        summary: string | null;
        body_md: string | null;
      }
    | undefined;

  if (!entity || !isPublicEntity(entity)) {
    return { title: "词条未找到 - 钢笔知识图谱" };
  }

  if (entity.type !== type || entity.slug !== slug) {
    permanentRedirect(`/${entity.type}/${entity.slug}`);
  }

  const desc =
    !["pen", "brand"].includes(entity.type) && entity.summary
      ? toPlainTextSummary(entity.summary, 120)
      : `${entity.name} — 可追溯的钢笔分类资料页`;

  const productImage = await getPrimaryProductImage(entity.id);
  const socialImage = productImage
    ? getPublicMediaUrl({
        id: productImage.id,
        localPath: productImage.local_path,
        thumbnailUrl: productImage.thumbnail_url,
        imageUrl: productImage.image_url,
      })
    : null;
  const canonical = `/${entity.type}/${entity.slug}`;

  return {
    title: entity.name,
    description: desc,
    alternates: { canonical },
    openGraph: {
      title: entity.name,
      description: desc,
      siteName: "钢笔知识图谱",
      type: "website",
      url: canonical,
      images: socialImage
        ? [{ url: socialImage, alt: entity.name }]
        : [
            {
              url: "/images/library/warm-pen-atlas/library-hero.jpg",
              width: 1200,
              height: 630,
              alt: "钢笔知识图谱资料馆",
            },
          ],
    },
    twitter: {
      card: "summary_large_image",
      title: entity.name,
      description: desc,
      images: socialImage
        ? [socialImage]
        : ["/images/library/warm-pen-atlas/library-hero.jpg"],
    },
  };
}

/**
 * Concept rule page — rendered in natural language, not raw schema
 */
async function ConceptRulePage({
  rule,
  entities,
}: {
  rule: {
    id: string;
    name: string;
    description: string | null;
    conditions: string;
  };
  entities: Array<{
    id: string;
    type: string;
    slug: string;
    name: string;
    summary: string | null;
  }>;
}) {
  const conditions = JSON.parse(rule.conditions) as Array<{
    dimension: string;
    tag_slug: string;
  }>;

  const DIMENSION_LABELS: Record<string, string> = {
    brand_tier: "品牌层级",
    price: "价位",
    nib_type: "笔尖类型",
    nib_material: "笔尖材质",
    origin: "产地",
    fill_system: "上墨方式",
    usage: "用途",
    era: "年代",
    size: "尺寸",
    body_material: "笔身材质",
    writing_style: "书写风格",
    style: "风格",
  };

  const condWithNames = await Promise.all(
    conditions.map(async (c) => {
      const tag = (await queryOne(
        "SELECT name FROM tags WHERE slug = ? AND dimension = ?",
        [c.tag_slug, c.dimension],
      )) as { name: string } | undefined;
      if (!tag?.name || !DIMENSION_LABELS[c.dimension]) return null;
      return {
        ...c,
        name: tag.name,
        dimLabel: DIMENSION_LABELS[c.dimension],
      };
    }),
  );
  const publicConditions = condWithNames.filter(
    (condition): condition is NonNullable<typeof condition> =>
      condition !== null,
  );
  if (publicConditions.length !== conditions.length) return null;

  return (
    <div className="mb-8">
      <div
        className="p-5 rounded-xl"
        style={{
          backgroundColor: "var(--color-accent-light)",
          boxShadow: "var(--shadow-edge)",
        }}
      >
        <p
          className="text-base leading-relaxed"
          style={{ color: "var(--color-ink)" }}
        >
          该概念覆盖：
          {publicConditions.map((c, i) => (
            <span key={c.tag_slug}>
              {i > 0 && " × "}
              <span
                className="font-semibold"
                style={{ color: "var(--color-accent)" }}
              >
                {c.name}
              </span>
              <span style={{ color: "var(--color-ink-muted)" }}>
                （{c.dimLabel}）
              </span>
            </span>
          ))}
          {" 的所有钢笔，共 "}
          <span
            className="font-semibold"
            style={{ color: "var(--color-accent)" }}
          >
            {entities.length}
          </span>
          {" 支。"}
        </p>
        {rule.description && (
          <p
            className="text-sm mt-2"
            style={{ color: "var(--color-ink-light)" }}
          >
            {String(rule.description)}
          </p>
        )}
      </div>
      {entities.length > 0 && (
        <div className="mt-4">
          <h3
            className="text-sm font-semibold mb-3"
            style={{ color: "var(--color-ink)" }}
          >
            符合条件的词条
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {entities.map((e) => (
              <Link
                key={e.id}
                href={`/${e.type}/${e.slug}`}
                className="block p-3 rounded-lg card-hover"
                style={{
                  backgroundColor: "var(--color-surface-raised)",
                  boxShadow: "var(--shadow-raised)",
                }}
              >
                <div
                  className="font-medium"
                  style={{ color: "var(--color-ink)" }}
                >
                  {e.name}
                </div>
                {e.summary && (
                  <div
                    className="text-sm mt-0.5 line-clamp-2"
                    style={{ color: "var(--color-ink-muted)" }}
                  >
                    {e.summary}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SectionNav({
  items,
}: {
  items: Array<{ href: string; label: string }>;
}) {
  if (items.length === 0) return null;

  return (
    <nav
      aria-label="词条章节"
      className="mb-8 overflow-x-auto rounded-xl border p-2"
      style={{
        borderColor: "var(--color-border)",
        backgroundColor: "var(--color-surface-raised)",
        boxShadow: "var(--shadow-raised)",
      }}
    >
      <div className="flex min-w-max gap-1">
        {items.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-[var(--color-accent-light)] hover:text-[var(--color-accent)]"
            style={{ color: "var(--color-ink-light)" }}
          >
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

export default async function EntityPage({ params }: EntityPageProps) {
  const { type, slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const canonicalPath = getCanonicalEntityPath(type, slug);
  if (canonicalPath) permanentRedirect(canonicalPath);

  const entity = (await queryOne("SELECT * FROM entities WHERE slug = ?", [
    slug,
  ])) as Record<string, string | number | null> | undefined;

  if (!entity) {
    notFound();
  }

  if (!isPublicEntity(entity)) {
    notFound();
  }

  const entityType = String(entity.type);
  const entitySlug = String(entity.slug);
  if (entityType !== type || entitySlug !== slug) {
    permanentRedirect(`/${entityType}/${entitySlug}`);
  }

  // Get tags
  const tags = (await queryAll(
    `SELECT t.name, t.slug, t.dimension FROM tags t
     JOIN entity_tags et ON et.tag_id = t.id
     WHERE et.entity_id = ?
       AND t.dimension IN (
         'nib_type', 'nib_material', 'fill_system', 'origin',
         'body_material'
       )`,
    [entity.id],
  )) as Array<{ name: string; slug: string; dimension: string }>;

  // Get links (deduplicated by related entity)
  const links = (await queryAll(
    `SELECT MIN(el.link_type) as link_type,
            e.name as target_name,
            e.type as target_type,
            e.slug as target_slug
     FROM entity_links el
     JOIN entities e ON (e.id = el.target_id OR e.id = el.source_id) AND e.id != ?
     WHERE (el.source_id = ? OR el.target_id = ?)
       AND el.link_type != 'reverse'
       AND ${publicEntityFilter("e")}
       AND NOT (
         ? = 'pen'
         AND e.type = 'brand'
         AND EXISTS (
           SELECT 1
           FROM model_specs ms
           WHERE ms.entity_id = ?
             AND ms.brand_entity_id = e.id
         )
       )
     GROUP BY e.id, e.name, e.type, e.slug
     ORDER BY e.type, e.name`,
    [entity.id, entity.id, entity.id, entityType, entity.id],
  )) as Array<{
    link_type: string;
    target_name: string;
    target_type: string;
    target_slug: string;
  }>;

  // Get concept rules if applicable
  let conceptRule = null;
  let conceptEntities: Array<{
    id: string;
    type: string;
    slug: string;
    name: string;
    summary: string | null;
  }> = [];
  if (entityType === "concept") {
    conceptRule = (await queryOne(
      "SELECT * FROM concept_rules WHERE slug = ?",
      [entitySlug],
    )) as Record<string, string | number | null> | null;
    if (conceptRule) {
      conceptEntities = (await getEntitiesForConcept(
        conceptRule.id as string,
      )) as typeof conceptEntities;
    }
  }

  const [
    sidebarSources,
    productImage,
    evidenceCounts,
    approvedSpec,
    brandParent,
  ] = await Promise.all([
    getEntityReferences(String(entity.id), 12),
    getPrimaryProductImage(String(entity.id)),
    queryOne(
      `SELECT
         (SELECT COUNT(DISTINCT LOWER(TRIM(si.url)))
          FROM entity_references er
          JOIN source_items si ON si.id = er.source_item_id
          WHERE er.entity_id = ?
            AND er.review_status = 'approved'
            AND si.review_status = 'approved') as source_count,
         (SELECT COUNT(*)
          FROM model_specs ms
          WHERE ms.entity_id = ?
            AND ms.review_status = 'approved'
            AND EXISTS (
              SELECT 1
              FROM citations c
              LEFT JOIN claims cl ON cl.id = c.claim_id
              JOIN source_items si
                ON si.id = COALESCE(c.source_item_id, cl.source_item_id)
              WHERE c.target_type = 'model_spec'
                AND c.target_id = ms.id
                AND si.review_status = 'approved'
                AND (c.claim_id IS NULL OR cl.review_status = 'approved')
            )) as approved_specs`,
      [entity.id, entity.id],
    ) as Promise<{
      source_count: number;
      approved_specs: number;
    } | null>,
    entityType === "pen"
      ? getModelSpec(String(entity.id))
      : Promise.resolve(undefined),
    entityType === "pen"
      ? (queryOne(
          `SELECT b.id, b.type, b.slug, b.name
           FROM entity_links relation
           JOIN entities b ON b.id = relation.target_id
           WHERE relation.source_id = ?
             AND relation.link_type = 'made_by'
             AND b.type = 'brand'
             AND ${publicEntityFilter("b")}
           LIMIT 1`,
          [entity.id],
        ) as Promise<
          { id: string; type: string; slug: string; name: string } | undefined
        >)
      : Promise.resolve(undefined),
  ]);
  const heroImageUrl = productImage
    ? getPublicMediaUrl({
        id: productImage.id,
        localPath: productImage.local_path,
        thumbnailUrl: productImage.thumbnail_url,
        imageUrl: productImage.image_url,
      })
    : null;
  const hasEntityHeroImage = Boolean(heroImageUrl);
  const evidenceBadges = [
    Number(evidenceCounts?.source_count || 0) > 0
      ? `参考来源 ${Number(evidenceCounts?.source_count || 0)}`
      : null,
    Number(evidenceCounts?.approved_specs || 0) > 0 ? "规格已核对" : null,
  ].filter((badge): badge is string => Boolean(badge));
  const bodyTextLength = entity.body_md ? String(entity.body_md).length : 0;
  const publicBody = entity.body_md
    ? preparePublicBody(String(entity.body_md))
    : null;
  const directSourceUrl =
    entity.source_url &&
    !isPlaceholderSourceUrl(String(entity.source_url)) &&
    /^https?:\/\//i.test(String(entity.source_url))
      ? String(entity.source_url)
      : null;
  const penSourceBody =
    entityType === "pen" && directSourceUrl && bodyTextLength >= 1200
      ? String(entity.body_md)
      : null;
  const approvedSpecLabels: Record<string, string> = {
    series_name: "系列",
    release_year: "发布年份",
    origin_country: "产地",
    nib: "笔尖",
    fill_system: "上墨方式",
    material: "材质",
    dimensions: "尺寸",
    weight: "重量",
  };
  const approvedSpecEntries: Array<[string, string]> = [];
  if (approvedSpec) {
    for (const key of Object.keys(approvedSpecLabels)) {
      const value = cleanPublicText(
        (approvedSpec as ModelSpecRecord)[key as keyof ModelSpecRecord],
      );
      if (value) approvedSpecEntries.push([key, value]);
    }
  }
  const sourceGroups = sidebarSources.reduce<
    Record<string, typeof sidebarSources>
  >((groups, source) => {
    const label = isPlaceholderSourceUrl(source.url)
      ? "其他资料"
      : source.source_type === "official"
        ? "官方"
        : source.source_type === "retailer"
          ? "经销商"
          : ["forum", "reddit", "user_submission"].includes(source.source_type)
            ? "社区"
            : "媒体与资料";
    if (!groups[label]) groups[label] = [];
    groups[label].push(source);
    return groups;
  }, {});

  const Icon = TYPE_ICONS[entityType] || PenNib;
  const hasGraph = ["brand", "pen"].includes(entityType) || links.length > 0;
  const sectionNavItems = [
    entityType === "brand"
      ? { href: "#models", label: "代表型号" }
      : entityType === "pen"
        ? { href: "#archive", label: "档案" }
        : entity.body_md
          ? { href: "#body", label: "正文" }
          : null,
    penSourceBody ? { href: "#source-material", label: "来源资料" } : null,
    entityType === "brand" ? { href: "#timeline", label: "时间线" } : null,
    hasGraph ? { href: "#graph", label: "图谱" } : null,
    ["brand", "pen"].includes(entityType) || sidebarSources.length > 0
      ? { href: "#sources", label: "来源" }
      : null,
  ].filter(Boolean) as Array<{ href: string; label: string }>;
  const canonicalUrl = `https://fountain-pen-graph.vercel.app/${entityType}/${entitySlug}`;
  const typeCrumb = brandParent
    ? {
        name: brandParent.name,
        href: `/${brandParent.type}/${brandParent.slug}`,
      }
    : {
        name: TYPE_LABELS[entityType] || entityType,
        href: `/browse?type=${entityType}`,
      };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "首页",
        item: "https://fountain-pen-graph.vercel.app/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: typeCrumb.name,
        item: `https://fountain-pen-graph.vercel.app${typeCrumb.href}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: String(entity.name),
        item: canonicalUrl,
      },
    ],
  };
  const entityJsonLd = {
    "@context": "https://schema.org",
    "@type":
      entityType === "pen"
        ? "Product"
        : entityType === "brand"
          ? "Organization"
          : entityType === "article"
            ? "Article"
            : "DefinedTerm",
    name: String(entity.name),
    url: canonicalUrl,
    description:
      !["pen", "brand"].includes(entityType) && entity.summary
        ? cleanPublicText(toPlainTextSummary(String(entity.summary), 180))
        : `${String(entity.name)}的分类、来源与关联资料。`,
    image: hasEntityHeroImage
      ? new URL(
          String(heroImageUrl),
          "https://fountain-pen-graph.vercel.app",
        ).toString()
      : undefined,
    ...(entityType === "pen" && brandParent
      ? { brand: { "@type": "Brand", name: brandParent.name } }
      : {}),
    ...(approvedSpecEntries.length > 0
      ? {
          additionalProperty: approvedSpecEntries.map(([key, value]) => ({
            "@type": "PropertyValue",
            name: approvedSpecLabels[key] || key,
            value: cleanPublicText(value),
          })),
        }
      : {}),
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: serialized JSON-LD is angle-bracket escaped
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replaceAll("<", "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: serialized JSON-LD is angle-bracket escaped
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(entityJsonLd).replaceAll("<", "\\u003c"),
        }}
      />
      <nav
        aria-label="面包屑"
        className="mb-6 flex min-w-0 items-center gap-2 text-sm text-ink-muted"
      >
        <Link
          href="/"
          className="inline-flex min-h-11 shrink-0 items-center gap-1 transition-colors hover:underline underline-offset-4"
        >
          <ArrowLeft size={14} />
          首页
        </Link>
        <span aria-hidden="true">›</span>
        <Link
          href={typeCrumb.href}
          className="min-w-0 truncate hover:underline underline-offset-4"
        >
          {typeCrumb.name}
        </Link>
        <span aria-hidden="true">›</span>
        <span aria-current="page" className="min-w-0 truncate text-ink">
          {String(entity.name)}
        </span>
      </nav>

      {/* ── Primary Zone: Name + Summary + Key Attributes ── */}
      <div className="mb-10">
        <div className="detail-title-lockup mb-4">
          <div
            className="detail-title-icon"
            style={{ backgroundColor: "var(--color-accent-light)" }}
          >
            <Icon
              size={28}
              weight="duotone"
              style={{ color: "var(--color-accent)" }}
            />
          </div>
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: "var(--color-surface-dim)",
                  color: "var(--color-ink-muted)",
                }}
              >
                {TYPE_LABELS[entityType] || entityType}
              </span>
            </div>
            <h1
              className="text-3xl sm:text-4xl font-bold tracking-tight"
              style={{ color: "var(--color-ink)" }}
            >
              {String(entity.name)}
            </h1>
          </div>
        </div>

        {!["pen", "brand"].includes(entityType) &&
          entity.summary &&
          (() => {
            const plainSummary = cleanPublicText(
              toPlainTextSummary(String(entity.summary)),
            );
            return plainSummary ? (
              <div className="max-w-3xl">
                <p className="archive-kicker mb-1">内容提要</p>
                <p
                  data-testid="entity-summary"
                  className="m-0 text-lg"
                  style={{ color: "var(--color-ink-light)", lineHeight: 1.8 }}
                >
                  {plainSummary}
                </p>
              </div>
            ) : null;
          })()}

        {evidenceBadges.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {evidenceBadges.map((badge) => (
              <span
                key={badge}
                className="rounded-full border px-3 py-1 text-xs font-medium"
                style={{
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--color-accent-light)",
                  color: "var(--color-accent)",
                }}
              >
                {badge}
              </span>
            ))}
          </div>
        )}

        {entityType === "pen" && approvedSpecEntries.length > 0 && (
          <section className="mt-6" aria-labelledby="approved-specs-title">
            <h2
              id="approved-specs-title"
              className="mb-3 text-sm font-semibold text-ink"
            >
              规格速览
            </h2>
            <dl className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {approvedSpecEntries.map(([key, value]) => (
                <div
                  key={key}
                  className="rounded-lg border px-3 py-2"
                  style={{
                    borderColor: "var(--color-border-light)",
                    backgroundColor: "var(--color-surface-raised)",
                  }}
                >
                  <dt className="text-xs text-ink-muted">
                    {approvedSpecLabels[key] || "规格"}
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-ink">
                    {cleanPublicText(value)}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )}
      </div>

      {/* ── Hero Image ── */}
      {hasEntityHeroImage ? (
        <figure
          className="mb-8 overflow-hidden rounded-lg border"
          style={{
            borderColor: "var(--color-border)",
            backgroundColor: "var(--color-surface-dim)",
            boxShadow: "var(--shadow-raised)",
          }}
        >
          <Image
            src={String(heroImageUrl)}
            alt={`${String(entity.name)} 资料图片`}
            width={1200}
            height={500}
            className="h-56 w-full object-scale-down p-3 sm:h-72"
            priority
            unoptimized
          />
          <figcaption
            className="flex flex-wrap gap-x-2 border-t px-4 py-2 text-xs"
            style={{
              borderColor: "var(--color-border-light)",
              color: "var(--color-ink-muted)",
            }}
          >
            {productImage?.license === "site-original" ? (
              <span>
                资料馆原创示意图，仅用于说明设计与机制，不代表实物照片
              </span>
            ) : (
              <>
                <span>{productImage?.title || String(entity.name)}</span>
                {productImage?.author && (
                  <span>作者：{productImage.author}</span>
                )}
                {productImage?.license && (
                  <span>许可：{productImage.license}</span>
                )}
              </>
            )}
            {productImage?.source_url && (
              <a
                href={productImage.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="ink-underline"
              >
                查看原始来源
              </a>
            )}
          </figcaption>
        </figure>
      ) : (
        <div
          className="mb-8 flex min-h-44 items-center justify-center gap-3 rounded-lg border px-6 text-center"
          style={{
            borderColor: "var(--color-border)",
            background:
              "linear-gradient(135deg, var(--color-surface-dim), var(--color-surface-raised))",
            color: "var(--color-ink-muted)",
            boxShadow: "var(--shadow-raised)",
          }}
        >
          <Icon size={30} weight="duotone" aria-hidden="true" />
          <div>
            <div className="font-medium" style={{ color: "var(--color-ink)" }}>
              {TYPE_LABELS[entityType] || "馆藏"}资料卡
            </div>
            <div className="mt-1 text-sm">暂无可公开复用的对应图片</div>
          </div>
        </div>
      )}

      <SectionNav items={sectionNavItems} />

      {/* ── Two-column layout: Content + Sidebar ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2">
          {/* Concept rules */}
          {conceptRule && (
            <ConceptRulePage
              rule={
                conceptRule as {
                  id: string;
                  name: string;
                  description: string | null;
                  conditions: string;
                }
              }
              entities={conceptEntities}
            />
          )}

          {entityType === "brand" && (
            <BrandMuseum entityId={String(entity.id)} />
          )}

          {entityType === "pen" && (
            <ModelArchive
              entityId={String(entity.id)}
              sourceBody={penSourceBody}
              sourceUrl={directSourceUrl}
            />
          )}

          {/* Body */}
          {publicBody && !["brand", "pen"].includes(entityType) && (
            <section id="body" className="mb-10 manuscript-border p-6 sm:p-8">
              {(entityType === "article" || bodyTextLength > 4000) && (
                <div
                  className="mb-6 rounded-lg border p-4 text-sm"
                  style={{
                    borderColor: "var(--color-border-light)",
                    backgroundColor: "var(--color-surface-raised)",
                    color: "var(--color-ink-muted)",
                  }}
                >
                  <div
                    className="mb-1 font-medium"
                    style={{ color: "var(--color-ink)" }}
                  >
                    正文说明
                  </div>
                  <p className="m-0">
                    {entityType === "article" && directSourceUrl
                      ? `以下内容为来源资料译文或整理，文中的第一人称、使用经历和判断属于原作者。${
                          bodyTextLength > 4000
                            ? `全文约 ${Math.round(bodyTextLength / 500)} 屏，保留原资料的章节结构。`
                            : ""
                        }`
                      : bodyTextLength > 4000
                        ? `这是一篇较长的资料整理，约 ${Math.round(
                            bodyTextLength / 500,
                          )} 屏阅读量。正文保留原资料的章节结构。`
                        : "以下为来源资料整理正文。"}
                  </p>
                  {entity.source_url &&
                    !isPlaceholderSourceUrl(String(entity.source_url)) && (
                      <Link
                        href={String(entity.source_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex text-xs ink-underline"
                        style={{ color: "var(--color-accent)" }}
                      >
                        查看原始来源
                      </Link>
                    )}
                </div>
              )}
              <MarkdownRenderer content={publicBody} />
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {!["pen", "brand"].includes(entityType) &&
            sidebarSources.length > 0 && (
              <section id="sources" className="mb-6">
                <h3
                  className="mb-3 text-sm font-semibold"
                  style={{ color: "var(--color-ink)" }}
                >
                  来源分级
                </h3>
                <div className="space-y-4">
                  {["官方", "经销商", "媒体与资料", "社区", "其他资料"].map(
                    (label) => {
                      const sources = sourceGroups[label];
                      if (!sources?.length) return null;
                      return (
                        <div key={label}>
                          <h4 className="mb-1 text-xs font-medium text-ink-muted">
                            {label} · {sources.length}
                          </h4>
                          <SourceCards sources={sources} variant="compact" />
                        </div>
                      );
                    },
                  )}
                </div>
              </section>
            )}

          {/* Tags */}
          {tags.length > 0 && (
            <section className="mb-6">
              <h3
                className="flex items-center gap-2 text-sm font-semibold mb-3"
                style={{ color: "var(--color-ink)" }}
              >
                <Tag size={14} style={{ color: "var(--color-accent)" }} />
                标签
              </h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Link
                    key={tag.slug}
                    href={`/browse?${tag.dimension}=${tag.slug}`}
                    className="inline-block text-xs px-2.5 py-1 rounded-full transition-colors btn-press hover:bg-[var(--color-accent-light)] hover:text-[var(--color-accent)]"
                    style={{
                      backgroundColor: "var(--color-surface-dim)",
                      color: "var(--color-ink-light)",
                    }}
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Related entities from links */}
          {links.length > 0 && (
            <section className="mb-6">
              <h3
                className="flex items-center gap-2 text-sm font-semibold mb-3"
                style={{ color: "var(--color-ink)" }}
              >
                <LinkIcon size={14} style={{ color: "var(--color-accent)" }} />
                关联词条
              </h3>
              <RelatedEntities links={links} />
            </section>
          )}
        </div>
      </div>

      {hasGraph && (
        <section
          id="graph"
          className="mt-12 min-w-0"
          data-testid="entity-graph-section"
        >
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="mb-1 flex items-center gap-2 text-xl font-semibold tracking-tight text-ink">
                <Graph size={20} style={{ color: "var(--color-accent)" }} />
                关系图谱
              </h2>
              <p className="m-0 text-sm text-ink-muted">
                查看有限的一跳与二跳关系；每条关系都可从列表继续进入词条。
              </p>
            </div>
            <Link
              href={`/graph?entity=${encodeURIComponent(entitySlug)}`}
              className="inline-flex min-h-11 items-center rounded-lg border px-4 py-2 text-sm font-medium"
              style={{ borderColor: "var(--color-border)" }}
            >
              在图谱页继续探索
            </Link>
          </div>
          <div
            className="min-w-0 rounded-xl"
            style={{ boxShadow: "var(--shadow-raised)" }}
          >
            <LocalGraph entityType={entityType} entitySlug={entitySlug} />
          </div>
        </section>
      )}

      {/* ── Tertiary Zone: Recommendations ── */}
      <section className="mt-12">
        <Recommendations entityId={String(entity.id)} />
      </section>
    </div>
  );
}
