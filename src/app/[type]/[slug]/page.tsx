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
import { getDetailHeroImageByIndex } from "@/lib/detail-hero-images";
import { getEntityReferences } from "@/lib/library";
import { isPublicEntity } from "@/lib/public-visibility";
import { cleanPublicText } from "@/lib/publicText";
import { toPlainTextSummary } from "@/lib/text";

interface EntityPageProps {
  params: Promise<{ type: string; slug: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string; slug: string }>;
}): Promise<Metadata> {
  const { type, slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const entity = (await queryOne(
    "SELECT type, slug, name, summary, body_md FROM entities WHERE slug = ?",
    [slug],
  )) as
    | {
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

  const desc = entity.summary
    ? toPlainTextSummary(entity.summary, 120)
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
  const heroIndexRow = (await queryOne(
    `SELECT COUNT(*) as detail_index
     FROM entities
     WHERE type < ? OR (type = ? AND slug <= ?)`,
    [entityType, entityType, entitySlug],
  )) as { detail_index: number } | undefined;
  const heroImageUrl = getDetailHeroImageByIndex(
    Number(heroIndexRow?.detail_index || 1) - 1,
  );

  const Icon = TYPE_ICONS[entityType] || PenNib;
  const hasGraph = ["brand", "pen"].includes(entityType) || links.length > 0;
  const sectionNavItems = [
    ["brand", "pen"].includes(entityType)
      ? {
          href: "#archive",
          label: entityType === "brand" ? "品牌馆" : "档案",
        }
      : entity.body_md
        ? { href: "#body", label: "正文" }
        : null,
    ["brand", "pen"].includes(entityType)
      ? { href: "#story", label: "故事" }
      : null,
    entityType === "brand" ? { href: "#timeline", label: "时间线" } : null,
    hasGraph ? { href: "#graph", label: "图谱" } : null,
    ["brand", "pen"].includes(entityType) || sidebarSources.length > 0
      ? { href: "#sources", label: "来源" }
      : null,
  ].filter(Boolean) as Array<{ href: string; label: string }>;

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
            const plainSummary = cleanPublicText(
              toPlainTextSummary(String(entity.summary)),
            );
            return plainSummary ? (
              <p
                data-testid="entity-summary"
                className="text-lg max-w-3xl"
                style={{ color: "var(--color-ink-light)", lineHeight: 1.8 }}
              >
                {plainSummary}
              </p>
            ) : null;
          })()}

        {/* Key attributes — pen specs live in the model archive below. */}
        {entityType !== "pen" &&
          Object.entries(attrs).some(([, value]) => cleanPublicText(value)) && (
            <div className="flex flex-wrap gap-4 mt-6">
              {Object.entries(attrs)
                .map(([key, value]) => [key, cleanPublicText(value)] as const)
                .filter(([, value]) => value)
                .map(([key, value]) => (
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
            <BrandMuseum entityId={String(entity.id)} attrs={attrs} />
          )}

          {entityType === "pen" && (
            <ModelArchive entityId={String(entity.id)} />
          )}

          {/* Body */}
          {entity.body_md && !["brand", "pen"].includes(entityType) && (
            <section id="body" className="mb-10 manuscript-border p-6 sm:p-8">
              <MarkdownRenderer content={String(entity.body_md)} />
            </section>
          )}

          {/* Graph */}
          {hasGraph && (
            <section id="graph" className="mb-10">
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
          )}
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
            <section id="sources" className="mb-6">
              <h3
                className="text-xs font-medium mb-2"
                style={{ color: "var(--color-ink-muted)" }}
              >
                来源
              </h3>
              <SourceCards sources={sidebarSources} variant="compact" />
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
