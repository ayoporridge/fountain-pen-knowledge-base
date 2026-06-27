import {
  Blueprint,
  Books,
  GitBranch,
  PenNib,
} from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import {
  getCitationsForTarget,
  getCitationsForTargets,
  getClaimsForEntity,
  getDiagramsForEntity,
  getEntityAliases,
  getEntityExternalIds,
  getEntityReferences,
  getModelSpec,
  getModelVariants,
  getPrimaryProductImage,
  getStoriesForEntity,
} from "@/lib/library";
import { cleanPublicText, displayPublicSourceName } from "@/lib/publicText";
import { CitationList } from "./CitationList";
import { ClaimCards } from "./ClaimCards";
import { DiagramRenderer } from "./DiagramRenderer";
import { IdentifierPanel } from "./IdentifierPanel";
import { SourceCards } from "./SourceCards";
import { StatusBadge } from "./StatusBadge";

export async function ModelArchive({ entityId }: { entityId: string }) {
  const [
    spec,
    variants,
    stories,
    diagrams,
    sources,
    aliases,
    externalIds,
    claims,
    productImage,
  ] = await Promise.all([
    getModelSpec(entityId),
    getModelVariants(entityId),
    getStoriesForEntity(entityId),
    getDiagramsForEntity(entityId),
    getEntityReferences(entityId, 6),
    getEntityAliases(entityId),
    getEntityExternalIds(entityId),
    getClaimsForEntity(entityId, 8),
    getPrimaryProductImage(entityId),
  ]);
  const story =
    stories.find((item) => item.story_type === "model_story") || stories[0];
  const featuredDiagrams = diagrams.slice(0, 2);
  const [storyCitations, diagramCitations] = await Promise.all([
    story ? getCitationsForTarget("story", story.id) : [],
    getCitationsForTargets(
      "diagram",
      featuredDiagrams.map((diagram) => diagram.id),
    ),
  ]);
  const specFields = spec
    ? [
        [
          "品牌",
          spec.brand_slug && spec.brand_name ? `${spec.brand_name}` : null,
        ],
        ["系列", spec.series_name],
        ["发布年份", spec.release_year],
        ["产地", spec.origin_country],
        ["笔尖", spec.nib],
        ["上墨", spec.fill_system],
        ["材质", spec.material],
        ["尺寸", spec.dimensions],
        ["重量", spec.weight],
        ["价位", spec.price_range],
        ["状态", spec.status],
      ]
        .map(([label, value]) => [label, cleanPublicText(value)] as const)
        .filter(([, value]) => value !== null)
    : [];

  return (
    <section className="mb-10 space-y-6">
      <div
        id="archive"
        className="library-panel p-5"
        style={{
          borderColor: "var(--color-border)",
          backgroundColor: "var(--color-surface-raised)",
        }}
      >
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <PenNib size={18} style={{ color: "var(--color-accent)" }} />
          <div>
            <p className="archive-kicker">Model archive</p>
            <h2 className="text-lg font-semibold">型号档案</h2>
          </div>
          {spec && (
            <span
              className="rounded-full border px-2 py-0.5 text-xs font-medium"
              style={{
                borderColor: "var(--color-border)",
                color: "var(--color-ink-muted)",
                fontFamily: "var(--font-label)",
              }}
            >
              {spec.review_status === "approved" ? "资料已核准" : "资料核验中"}
            </span>
          )}
        </div>

        {productImage && (
          <figure
            className="mb-5 overflow-hidden rounded-lg border"
            style={{
              borderColor: "var(--color-border-light)",
              backgroundColor: "var(--color-surface-dim)",
            }}
          >
            <div className="flex min-h-[220px] items-center justify-center p-4 sm:min-h-[280px]">
              <Image
                src={productImage.thumbnail_url || productImage.image_url}
                alt={`${spec?.series_name || "钢笔型号"} 实物图`}
                width={900}
                height={360}
                className="max-h-[320px] w-full object-contain"
                unoptimized
              />
            </div>
            <figcaption
              className="border-t px-3 py-2 text-xs leading-relaxed"
              style={{
                borderColor: "var(--color-border-light)",
                color: "var(--color-ink-muted)",
              }}
            >
              <span>实物图：{cleanPublicText(productImage.title)}</span>
              {productImage.source_url && (
                <Link
                  href={productImage.source_url}
                  className="ml-2 ink-underline"
                >
                  {displayPublicSourceName(productImage.source_name) || "来源"}
                </Link>
              )}
              {productImage.license && (
                <span className="ml-2">{productImage.license}</span>
              )}
            </figcaption>
          </figure>
        )}

        {spec && specFields.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {specFields.map(([label, value]) => (
              <div
                key={label}
                className="rounded-lg px-3 py-2"
                style={{ backgroundColor: "var(--color-surface-dim)" }}
              >
                <div
                  className="text-xs"
                  style={{ color: "var(--color-ink-muted)" }}
                >
                  {label}
                </div>
                <div
                  className="text-sm font-medium"
                  style={{ color: "var(--color-ink)" }}
                >
                  {label === "品牌" && spec.brand_slug && spec.brand_name ? (
                    <Link
                      href={`/brand/${spec.brand_slug}`}
                      className="ink-underline"
                    >
                      {spec.brand_name}
                    </Link>
                  ) : (
                    value
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
            这个型号暂时没有可公开展示的结构化规格。页面只显示已有来源能支撑的字段。
          </p>
        )}
      </div>

      <div
        id="story"
        className="library-panel p-5"
        style={{
          borderColor: "var(--color-border)",
          backgroundColor: "var(--color-surface-raised)",
        }}
      >
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Books size={18} style={{ color: "var(--color-accent)" }} />
          <div>
            <p className="archive-kicker">Read first</p>
            <h2 className="text-lg font-semibold">
              {story?.title || "型号故事整理中"}
            </h2>
          </div>
          {story && <StatusBadge status={story.status} />}
        </div>
        {story ? (
          <div className="reading-measure">
            <MarkdownRenderer content={story.body_md} />
            <CitationList citations={storyCitations} />
          </div>
        ) : (
          <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
            这个型号暂时只有来源卡片和关系信息；正文会在有稳定来源时展示。
          </p>
        )}
      </div>

      <IdentifierPanel aliases={aliases} externalIds={externalIds} />

      <ClaimCards claims={claims} />

      <div
        className="rounded-xl border p-5"
        style={{
          borderColor: "var(--color-border)",
          backgroundColor: "var(--color-surface-raised)",
        }}
      >
        <div className="mb-4 flex items-center gap-2">
          <GitBranch size={18} style={{ color: "var(--color-accent)" }} />
          <h2 className="text-lg font-semibold">版本与变体</h2>
        </div>
        {variants.length > 0 ? (
          <div className="grid gap-2">
            {variants.map((variant) => (
              <div
                key={variant.id}
                className="rounded-lg border p-3"
                style={{ borderColor: "var(--color-border-light)" }}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium">
                    {variant.variant_name}
                  </span>
                  {variant.release_year && (
                    <span
                      className="text-xs"
                      style={{ color: "var(--color-ink-muted)" }}
                    >
                      {variant.release_year}
                    </span>
                  )}
                  <StatusBadge status={variant.review_status} />
                </div>
                {cleanPublicText(variant.notes) && (
                  <p
                    className="mt-1 text-sm"
                    style={{ color: "var(--color-ink-muted)" }}
                  >
                    {cleanPublicText(variant.notes)}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
            暂无可公开对照的版本与变体。
          </p>
        )}
      </div>

      {featuredDiagrams.length > 0 && (
        <div id="diagrams" className="space-y-3">
          <div className="flex items-center gap-2">
            <Blueprint size={18} style={{ color: "var(--color-accent)" }} />
            <h2 className="text-lg font-semibold">图示</h2>
          </div>
          {featuredDiagrams.map((diagram) => (
            <DiagramRenderer
              key={diagram.id}
              diagram={diagram}
              citations={diagramCitations.filter(
                (citation) => citation.target_id === diagram.id,
              )}
            />
          ))}
        </div>
      )}

      <div
        id="sources"
        className="library-panel p-5"
        style={{
          borderColor: "var(--color-border)",
          backgroundColor: "var(--color-surface-raised)",
        }}
      >
        <h2
          className="mb-3 text-sm font-medium"
          style={{ color: "var(--color-ink-muted)" }}
        >
          来源
        </h2>
        <SourceCards sources={sources} variant="compact" />
      </div>
    </section>
  );
}
