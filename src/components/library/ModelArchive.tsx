import { Books, PenNib } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import {
  getEntityAliases,
  getEntityExternalIds,
  getEntityReferences,
  getModelSpec,
  getPrimaryProductImage,
  getStoriesForEntity,
} from "@/lib/library";
import { cleanPublicText, displayPublicPrice } from "@/lib/publicText";
import { IdentifierPanel } from "./IdentifierPanel";
import { SourceCards } from "./SourceCards";

function sectionIcon(icon: ReactNode) {
  return (
    <div className="library-section-icon" aria-hidden="true">
      {icon}
    </div>
  );
}

export async function ModelArchive({ entityId }: { entityId: string }) {
  const [spec, stories, sources, aliases, externalIds, productImage] =
    await Promise.all([
      getModelSpec(entityId),
      getStoriesForEntity(entityId),
      getEntityReferences(entityId, 6),
      getEntityAliases(entityId),
      getEntityExternalIds(entityId),
      getPrimaryProductImage(entityId),
    ]);
  const story =
    stories.find((item) => item.story_type === "model_story") || stories[0];
  const priceSource = sources.find(
    (source) => source.source_type === "retailer",
  );
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
        [
          "价位",
          displayPublicPrice(spec.price_range, priceSource?.source_name),
        ],
        ["状态", spec.status],
      ]
        .map(
          ([label, value]) =>
            [label, label === "价位" ? value : cleanPublicText(value)] as const,
        )
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
        <div className="library-section-heading mb-4">
          {sectionIcon(
            <PenNib size={18} style={{ color: "var(--color-accent)" }} />,
          )}
          <div>
            <p className="archive-kicker">Model archive</p>
            <h2 className="text-lg font-semibold">型号档案</h2>
          </div>
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
        <div className="library-section-heading mb-3">
          {sectionIcon(
            <Books size={18} style={{ color: "var(--color-accent)" }} />,
          )}
          <div>
            <p className="archive-kicker">Read first</p>
            <h2 className="text-lg font-semibold">
              {story?.title || "型号故事整理中"}
            </h2>
          </div>
        </div>
        {story ? (
          <div className="reading-measure">
            <MarkdownRenderer content={story.body_md} />
          </div>
        ) : (
          <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
            这个型号暂时只有来源卡片和关系信息；正文会在有稳定来源时展示。
          </p>
        )}
      </div>

      <IdentifierPanel aliases={aliases} externalIds={externalIds} />

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
