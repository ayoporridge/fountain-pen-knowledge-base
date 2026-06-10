export const dynamic = "force-dynamic";
import { queryOne, queryAll } from "@/lib/db";
import { getEntitiesForConcept } from "@/lib/concept-engine";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { RelatedEntities } from "@/components/RelatedEntities";
import { EntityMeta } from "@/components/EntityMeta";
import { LocalGraph } from "@/components/LocalGraph";
import { Recommendations } from "@/components/Recommendations";
import { DensityBadge } from "@/components/DensityBadge";
import { CompareButton } from "@/components/CompareBar";
import {
  PenNib,
  Buildings,
  Lightbulb,
  Drop,
  BookOpen,
  ArrowLeft,
  PencilSimple,
  Tag,
  Graph,
  Link as LinkIcon,
} from "@phosphor-icons/react/dist/ssr";

interface EntityPageProps {
  params: Promise<{ type: string; slug: string }>;
}

const TYPE_LABELS: Record<string, string> = {
  pen: "钢笔",
  brand: "品牌",
  concept: "概念",
  material: "材质",
  nib: "笔尖",
  fill_system: "上墨方式",
  article: "文章",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TYPE_ICONS: Record<string, React.ComponentType<any>> = {
  pen: PenNib,
  brand: Buildings,
  concept: Lightbulb,
  material: PenNib,
  nib: PenNib,
  fill_system: Drop,
  article: BookOpen,
};

const ATTR_LABELS: Record<string, string> = {
  nib_size: "笔尖粗细",
  fill_system: "上墨方式",
  body_material: "笔身材质",
  origin_country: "产地",
  price_range: "价位",
  writing_style: "书写风格",
  nib_material: "笔尖材质",
  founded: "创立年份",
  description: "描述",
};

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
        [c.tag_slug, c.dimension]
      )) as { name: string } | undefined;
      return {
        ...c,
        name: tag?.name || c.tag_slug,
        dimLabel: DIMENSION_LABELS[c.dimension] || c.dimension,
      };
    })
  );

  return (
    <div className="mb-8">
      <div
        className="p-5 rounded-xl border"
        style={{
          backgroundColor: "var(--color-accent-light)",
          borderColor: "var(--color-border)",
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
              <span className="font-semibold" style={{ color: "var(--color-accent)" }}>
                {c.name}
              </span>
              <span style={{ color: "var(--color-ink-muted)" }}>
                （{c.dimLabel}）
              </span>
            </span>
          ))}
          {" 的所有钢笔，共 "}
          <span className="font-semibold" style={{ color: "var(--color-accent)" }}>
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
                className="block p-3 rounded-lg border transition-all card-hover"
                style={{
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--color-surface-raised)",
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

  // Get tags
  const tags = (await queryAll(
    `SELECT t.name, t.slug, t.dimension FROM tags t
     JOIN entity_tags et ON et.tag_id = t.id
     WHERE et.entity_id = ?`,
    [entity.id]
  )) as Array<{ name: string; slug: string; dimension: string }>;

  // Get links
  const links = (await queryAll(
    `SELECT el.*, e.name as target_name, e.type as target_type, e.slug as target_slug
     FROM entity_links el
     JOIN entities e ON (e.id = el.target_id OR e.id = el.source_id) AND e.id != ?
     WHERE el.source_id = ? OR el.target_id = ?`,
    [entity.id, entity.id, entity.id]
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
  if (type === "concept") {
    conceptRule = (await queryOne(
      "SELECT * FROM concept_rules WHERE concept_id = ?",
      [entity.id]
    )) as Record<string, string | number | null> | null;
    if (conceptRule) {
      conceptEntities = (await getEntitiesForConcept(entity.id as string)) as typeof conceptEntities;
    }
  }

  // Parse attributes
  let attrs: Record<string, string> = {};
  try {
    if (entity.attributes) {
      attrs =
        typeof entity.attributes === "string"
          ? JSON.parse(entity.attributes as string)
          : (entity.attributes as unknown as Record<string, string>);
    }
  } catch {
    attrs = {};
  }

  const Icon = TYPE_ICONS[type] || PenNib;

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
      {entity.image_url && (
        <div className="mb-8 rounded-xl overflow-hidden" style={{ border: "1px solid var(--color-border-light)" }}>
          <Image
            src={String(entity.image_url)}
            alt={String(entity.name)}
            width={1200}
            height={500}
            className="w-full h-64 sm:h-80 object-cover"
            priority
          />
        </div>
      )}

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
                {TYPE_LABELS[type] || type}
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

        {entity.summary && (
          <p
            className="text-lg max-w-3xl"
            style={{ color: "var(--color-ink-light)", lineHeight: 1.7 }}
          >
            {String(entity.summary)}
          </p>
        )}

        {/* Key attributes — displayed as prominent data points */}
        {Object.keys(attrs).length > 0 && (
          <div className="flex flex-wrap gap-4 mt-6">
            {Object.entries(attrs).map(([key, value]) => (
              <div
                key={key}
                className="px-4 py-2 rounded-lg border"
                style={{
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--color-surface-raised)",
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

          {/* Body */}
          {entity.body_md && (
            <section className="mb-10">
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
              className="rounded-xl border overflow-hidden"
              style={{ borderColor: "var(--color-border)" }}
            >
              <LocalGraph
                entityId={String(entity.id)}
                entityType={type}
                entitySlug={slug}
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
              entityType={type}
              entitySlug={slug}
            />
          </section>

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
                type={type}
              />
              <Link
                href={`/new`}
                className="inline-flex items-center gap-1 text-sm transition-colors hover:underline underline-offset-4"
                style={{ color: "var(--color-ink-muted)" }}
              >
                <PencilSimple size={14} />
                编辑
              </Link>
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
