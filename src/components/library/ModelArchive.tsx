import { Books, PenNib } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import type { ReactNode } from "react";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import {
  getEntityAliases,
  getEntityExternalIds,
  getEntityReferences,
  getModelSpec,
} from "@/lib/library";
import { cleanPublicText } from "@/lib/publicText";
import { IdentifierPanel } from "./IdentifierPanel";
import { SourceCards } from "./SourceCards";

function sectionIcon(icon: ReactNode) {
  return (
    <div className="library-section-icon" aria-hidden="true">
      {icon}
    </div>
  );
}

function prepareSourceMaterial(body: string) {
  const lines = body.trim().split("\n");
  while (lines[0]?.trim() === "") lines.shift();
  if (/^#\s+/.test(lines[0] || "")) lines.shift();
  while (lines[0]?.trim() === "") lines.shift();
  if (/^>\s*来源[：:]/.test(lines[0] || "")) lines.shift();
  return lines.join("\n").trim();
}

export async function ModelArchive({
  entityId,
  sourceBody,
  sourceUrl,
}: {
  entityId: string;
  sourceBody?: string | null;
  sourceUrl?: string | null;
}) {
  const [spec, sources, aliases, externalIds] = await Promise.all([
    getModelSpec(entityId),
    getEntityReferences(entityId, 6),
    getEntityAliases(entityId),
    getEntityExternalIds(entityId),
  ]);
  const sourceMaterial = sourceBody ? prepareSourceMaterial(sourceBody) : "";
  const hasSourceMaterial = Boolean(sourceMaterial && sourceUrl);
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
        <div className="library-section-heading mb-4">
          {sectionIcon(
            <PenNib size={18} style={{ color: "var(--color-accent)" }} />,
          )}
          <h2 className="text-lg font-semibold">型号档案</h2>
        </div>

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

      {hasSourceMaterial && (
        <div
          id="source-material"
          className="library-panel p-5 sm:p-6"
          style={{
            borderColor: "var(--color-border)",
            backgroundColor: "var(--color-surface-raised)",
          }}
        >
          <div className="library-section-heading mb-4">
            {sectionIcon(
              <Books size={18} style={{ color: "var(--color-accent)" }} />,
            )}
            <h2 className="text-lg font-semibold">来源资料译文/整理</h2>
          </div>
          <div
            className="mb-6 rounded-lg border p-4 text-sm leading-relaxed"
            style={{
              borderColor: "var(--color-border-light)",
              backgroundColor: "var(--color-surface-dim)",
              color: "var(--color-ink-muted)",
            }}
          >
            <p className="m-0">
              以下内容整理自第三方原文。文中的第一人称、使用经历和判断属于原作者，不代表本站实测。
            </p>
            <Link
              href={String(sourceUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex ink-underline"
              style={{ color: "var(--color-accent)" }}
            >
              查看原始来源
            </Link>
          </div>
          <div className="reading-measure">
            <MarkdownRenderer content={sourceMaterial} />
          </div>
        </div>
      )}

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
        {sources.length > 0 ? (
          <SourceCards sources={sources} variant="compact" />
        ) : (
          <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
            {hasSourceMaterial
              ? "本页译文所据原文见上方链接，暂无其他可展示来源。"
              : "暂无可公开展示的来源资料。"}
          </p>
        )}
      </div>
    </section>
  );
}
