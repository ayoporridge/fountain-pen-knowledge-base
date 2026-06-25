export const dynamic = "force-dynamic";

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
import { CompareButton } from "@/components/CompareBar";
import { DensityBadge } from "@/components/DensityBadge";
import { EntityMeta } from "@/components/EntityMeta";
import { LocalGraph } from "@/components/LocalGraph";
import { BrandMuseum } from "@/components/library/BrandMuseum";
import { ModelArchive } from "@/components/library/ModelArchive";
import { SourceCards } from "@/components/library/SourceCards";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { Recommendations } from "@/components/Recommendations";
import { RelatedEntities } from "@/components/RelatedEntities";
import { getEntitiesForConcept } from "@/lib/concept-engine";
import { ATTR_LABELS, TYPE_ICONS, TYPE_LABELS } from "@/lib/constants";
import { queryAll, queryOne } from "@/lib/db";
import { getEntityReferences } from "@/lib/library";

interface EntityPageProps {
  params: Promise<{ type: string; slug: string }>;
}

function getHeroFallbackImage(entityType: string) {
  const fallbackByType: Record<string, string> = {
    article: "/images/library/warm-pen-atlas/library-hero.jpg",
    brand: "/images/library/warm-pen-atlas/brand-museum-cover.jpg",
    concept: "/images/library/warm-pen-atlas/mechanism-lab-cover.jpg",
    fill_system: "/images/library/warm-pen-atlas/mechanism-lab-cover.jpg",
    material: "/images/library/warm-pen-atlas/brand-museum-cover.jpg",
    nib: "/images/library/warm-pen-atlas/mechanism-lab-cover.jpg",
    pen: "/images/library/warm-pen-atlas/piston-demonstrator-model-cover.jpg",
  };

  return fallbackByType[entityType] || fallbackByType.article;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string; slug: string }>;
}): Promise<Metadata> {
  const { type, slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const entity = (await queryOne(
    "SELECT type, slug, name, summary FROM entities WHERE slug = ?",
    [slug],
  )) as
    | { type: string; slug: string; name: string; summary: string | null }
    | undefined;

  if (!entity) {
    return { title: "词条未找到 - 钢笔知识图谱" };
  }

  if (entity.type !== type || entity.slug !== slug) {
    permanentRedirect(`/${entity.type}/${entity.slug}`);
  }

  const desc = entity.summary
    ? entity.summary.slice(0, 120)
    : `${entity.name} — 钢笔知识图谱收录词条`;

  return {
    title: `${entity.name} - 钢笔知识图谱`,
    description: desc,
    openGraph: {
      title: entity.name,
      description: desc,
      siteName: "钢笔知识图谱",
      type: "website",
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
    origin: "产地",
    fill_system: "上墨方式",
    usage: "用途",
    era: "年代",
    size: "尺寸",
    body_material: "笔身材质",
    writing_style: "书写风格",
  };

  const condWithNames = await Promise.all(
    conditions.map(async (c) => {
      const tag = (await queryOne(
        "SELECT name FROM tags WHERE slug = ? AND dimension = ?",
        [c.tag_slug, c.dimension],
      )) as { name: string } | undefined;
      return {
        ...c,
        name: tag?.name || c.tag_slug,
        dimLabel: DIMENSION_LABELS[c.dimension] || c.dimension,
      };
    }),
  );

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
          {condWithNames.map((c, i) => (
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

export default async function EntityPage({ params }: EntityPageProps) {
  const { type, slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);

  const entity = (await queryOne("SELECT * FROM entities WHERE slug = ?", [
    slug,
  ])) as Record<string, string | number | null> | undefined;

  if (!entity) {
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
     WHERE et.entity_id = ?`,
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
     GROUP BY e.id, e.name, e.type, e.slug
     ORDER BY e.type, e.name`,
    [entity.id, entity.id, entity.id],
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
      "SELECT * FROM concept_rules WHERE concept_id = ?",
      [entity.id],
    )) as Record<string, string | number | null> | null;
    if (conceptRule) {
      conceptEntities = (await getEntitiesForConcept(
        conceptRule.id as string,
      )) as typeof conceptEntities;
    }
  }

  // Parse attributes from entity_attributes table (not from a JSON column)
  const attrRows = (await queryAll(
    "SELECT key, value FROM entity_attributes WHERE entity_id = ?",
    [entity.id],
  )) as Array<{ key: string; value: string }>;
  const attrs: Record<string, string> = Object.fromEntries(
    attrRows.map((a) => [a.key, a.value]),
  );
  const sidebarSources = ["brand", "pen"].includes(entityType)
    ? []
    : await getEntityReferences(String(entity.id), 6);
  const approvedMedia = (await queryOne(
    `SELECT image_url, thumbnail_url
     FROM media_assets
     WHERE entity_id = ?
       AND asset_type = 'image'
       AND image_url IS NOT NULL
       AND review_status = 'approved'
       AND usage_status IN ('primary', 'gallery')
     ORDER BY CASE usage_status WHEN 'primary' THEN 0 ELSE 1 END, created_at DESC
     LIMIT 1`,
    [entity.id],
  )) as { image_url: string | null; thumbnail_url: string | null } | undefined;
  const heroImageUrl =
    entity.image_url ||
    approvedMedia?.thumbnail_url ||
    approvedMedia?.image_url ||
    getHeroFallbackImage(entityType);

  const Icon = TYPE_ICONS[entityType] || PenNib;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Back link */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm transition-colors hover:underline underline-offset-4"
          style={{ color: "var(--color-ink-muted)" }}
        >
          <ArrowLeft size={14} />
          首页
        </Link>
      </div>

      {/* ── Hero Image ── */}
      <div
        className="mb-8 rounded-xl overflow-hidden"
        style={{ boxShadow: "var(--shadow-raised)" }}
      >
        <Image
          src={String(heroImageUrl)}
          alt={String(entity.name)}
          width={1200}
          height={500}
          className="w-full h-64 sm:h-80 object-cover"
          priority
        />
      </div>

      {/* ── Primary Zone: Name + Summary + Key Attributes ── */}
      <div className="mb-10">
        <div className="flex items-start gap-4 mb-4">
          <div
            className="p-3 rounded-xl"
            style={{ backgroundColor: "var(--color-accent-light)" }}
          >
            <Icon
              size={28}
              weight="duotone"
              style={{ color: "var(--color-accent)" }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: "var(--color-surface-dim)",
                  color: "var(--color-ink-muted)",
                }}
              >
                {TYPE_LABELS[entityType] || entityType}
              </span>
              <DensityBadge linkCount={links.length} />
            </div>
            <h1
              className="text-3xl sm:text-4xl font-bold tracking-tight"
              style={{ color: "var(--color-ink)" }}
            >
              {String(entity.name)}
            </h1>
          </div>
        </div>

        {entity.summary &&
          (() => {
            // Strip markdown syntax for plain-text display
            const plainSummary = String(entity.summary)
              .replace(/!\[[^\]]*\]\([^)]+\)/g, "") // ![alt](url) → remove
              .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // [text](url) → text
              .replace(/\*\*([^*]+)\*\*/g, "$1") // **bold** → bold
              .replace(/\*([^*]+)\*/g, "$1") // *italic* → italic
              .replace(/_{1,2}([^_]+)_{1,2}/g, "$1") // _italic_ → italic
              .replace(/#{1,6}\s*/g, "") // ### heading → heading
              .replace(/^>\s*/gm, "") // > quote at line start
              .replace(/\s*>\s*/g, " ") // > inline → space
              .replace(/^[-*]\s+/gm, "") // - list → list
              .replace(/`([^`]+)`/g, "$1") // `code` → code
              .replace(/\|/g, " ") // | pipe → space
              .replace(/\n{2,}/g, " ") // newlines → space
              .replace(/\n/g, " ")
              .replace(/\s{2,}/g, " ") // collapse spaces
              .trim();
            return plainSummary ? (
              <p
                className="text-lg max-w-3xl"
                style={{ color: "var(--color-ink-light)", lineHeight: 1.8 }}
              >
                {plainSummary}
              </p>
            ) : null;
          })()}

        {/* Key attributes — displayed as prominent data points */}
        {Object.keys(attrs).length > 0 && (
          <div className="flex flex-wrap gap-4 mt-6">
            {Object.entries(attrs).map(([key, value]) => (
              <div
                key={key}
                className="px-4 py-2 rounded-lg"
                style={{
                  backgroundColor: "var(--color-surface-raised)",
                  boxShadow: "var(--shadow-edge)",
                }}
              >
                <div
                  className="text-xs font-medium mb-0.5"
                  style={{ color: "var(--color-ink-muted)" }}
                >
                  {ATTR_LABELS[key] || key}
                </div>
                <div
                  className="text-sm font-semibold"
                  style={{ color: "var(--color-ink)" }}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
            <BrandMuseum entityId={String(entity.id)} attrs={attrs} />
          )}

          {entityType === "pen" && (
            <ModelArchive entityId={String(entity.id)} />
          )}

          {/* Body */}
          {entity.body_md && (
            <section className="mb-10 manuscript-border p-6 sm:p-8">
              <MarkdownRenderer content={String(entity.body_md)} />
            </section>
          )}

          {/* Graph */}
          <section className="mb-10">
            <h2
              className="flex items-center gap-2 text-lg font-semibold tracking-tight mb-4"
              style={{ color: "var(--color-ink)" }}
            >
              <Graph size={18} style={{ color: "var(--color-accent)" }} />
              关系图谱
            </h2>
            <div
              className="rounded-xl overflow-hidden"
              style={{ boxShadow: "var(--shadow-raised)" }}
            >
              <LocalGraph
                entityId={String(entity.id)}
                entityType={entityType}
                entitySlug={entitySlug}
              />
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Meta */}
          <section className="mb-6">
            <EntityMeta
              createdAt={String(entity.created_at)}
              updatedAt={String(entity.updated_at)}
              sourceUrl={entity.source_url ? String(entity.source_url) : null}
              entityId={String(entity.id)}
              entityType={entityType}
              entitySlug={entitySlug}
            />
          </section>

          {sidebarSources.length > 0 && (
            <section className="mb-6">
              <h3
                className="text-sm font-semibold mb-3"
                style={{ color: "var(--color-ink)" }}
              >
                来源卡片
              </h3>
              <SourceCards sources={sidebarSources} />
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

          {/* Actions */}
          <section>
            <div className="flex flex-col gap-2">
              <CompareButton
                slug={String(entity.slug)}
                name={String(entity.name)}
                type={entityType}
              />
            </div>
          </section>
        </div>
      </div>

      {/* ── Tertiary Zone: Recommendations ── */}
      <section className="mt-12">
        <Recommendations entityId={String(entity.id)} />
      </section>
    </div>
  );
}
