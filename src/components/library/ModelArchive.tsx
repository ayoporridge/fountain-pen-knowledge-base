import {
  Blueprint,
  Books,
  GitBranch,
  PenNib,
} from "@phosphor-icons/react/dist/ssr";
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
  getStoriesForEntity,
} from "@/lib/library";
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
  ] = await Promise.all([
    getModelSpec(entityId),
    getModelVariants(entityId),
    getStoriesForEntity(entityId),
    getDiagramsForEntity(entityId),
    getEntityReferences(entityId, 6),
    getEntityAliases(entityId),
    getEntityExternalIds(entityId),
    getClaimsForEntity(entityId, 8),
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

  return (
    <section className="mb-10 space-y-6">
      <div
        id="archive"
        className="rounded-xl border p-5"
        style={{
          borderColor: "var(--color-border)",
          backgroundColor: "var(--color-surface-raised)",
        }}
      >
        <div className="mb-4 flex items-center gap-2">
          <PenNib size={18} style={{ color: "var(--color-accent)" }} />
          <h2 className="text-lg font-semibold">型号档案</h2>
          {spec && <StatusBadge status={spec.review_status} />}
        </div>
        {spec ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              [
                "品牌",
                spec.brand_slug && spec.brand_name
                  ? `${spec.brand_name}`
                  : null,
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
            ].map(([label, value]) => (
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
                    value || "暂无资料"
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
            这个型号还没有结构化档案。资料馆会按品牌、系列、年份、笔尖、上墨、材质和版本核验。
          </p>
        )}
      </div>

      <IdentifierPanel aliases={aliases} externalIds={externalIds} />

      <ClaimCards claims={claims} />

      <div
        id="story"
        className="rounded-xl border p-5"
        style={{
          borderColor: "var(--color-border)",
          backgroundColor: "var(--color-surface-raised)",
        }}
      >
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Books size={18} style={{ color: "var(--color-accent)" }} />
          <h2 className="text-lg font-semibold">
            {story?.title || "型号故事整理中"}
          </h2>
          {story && <StatusBadge status={story.status} />}
        </div>
        {story ? (
          <>
            <MarkdownRenderer content={story.body_md} />
            <CitationList citations={storyCitations} />
          </>
        ) : (
          <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
            型号故事会基于已审核 claims
            生成，未确认的年份、材质、价格会显式标记。
          </p>
        )}
      </div>

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
                {variant.notes && (
                  <p
                    className="mt-1 text-sm"
                    style={{ color: "var(--color-ink-muted)" }}
                  >
                    {variant.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
            暂无已整理版本与变体。
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
        className="rounded-xl border p-5"
        style={{
          borderColor: "var(--color-border)",
          backgroundColor: "var(--color-surface-raised)",
        }}
      >
        <h2 className="mb-4 text-lg font-semibold">来源卡片</h2>
        <SourceCards sources={sources} />
      </div>
    </section>
  );
}
