import { ImageSquare, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { StatusBadge } from "@/components/library/StatusBadge";
import { getMediaAssetIndex } from "@/lib/library";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "媒体授权 - 钢笔图书馆",
  description: "钢笔图书馆的图片、扫描件、外部媒体候选和授权审核状态。",
};

export default async function LibraryMediaPage() {
  const mediaAssets = await getMediaAssetIndex(100);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8 max-w-3xl">
        <p
          className="mb-2 flex items-center gap-2 text-sm font-medium"
          style={{ color: "var(--color-accent)" }}
        >
          <ShieldCheck size={16} />
          Media Rights
        </p>
        <h1 className="mb-3 text-3xl font-bold tracking-tight">媒体授权</h1>
        <p
          className="text-base leading-relaxed"
          style={{ color: "var(--color-ink-light)" }}
        >
          图片、扫描件、产品图和外部媒体不直接进入页面。它们先作为候选资产登记，逐项确认作者、license、署名和用途后再展示。
        </p>
      </div>

      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        {[
          ["候选", "candidate", "等待审核，可作为后续配图来源池。"],
          ["待补授权", "needs_license", "缺少 license、作者或署名细节。"],
          ["可展示", "approved", "授权信息完整，可进入页面图库。"],
        ].map(([label, status, desc]) => (
          <div
            key={status}
            className="rounded-xl border p-4"
            style={{
              borderColor: "var(--color-border)",
              backgroundColor: "var(--color-surface-raised)",
            }}
          >
            <div className="mb-2 flex items-center gap-2">
              <StatusBadge status={status} />
              <span className="font-medium">{label}</span>
            </div>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--color-ink-muted)" }}
            >
              {desc}
            </p>
          </div>
        ))}
      </div>

      <section>
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
          <ImageSquare size={20} style={{ color: "var(--color-accent)" }} />
          媒体候选池
        </h2>

        {mediaAssets.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {mediaAssets.map((asset) => {
              const previewUrl = asset.thumbnail_url || asset.image_url;

              return (
                <Link
                  key={asset.id}
                  href={asset.source_url || asset.image_url || "#"}
                  className="rounded-xl border p-4 transition-colors hover:bg-[var(--color-surface-dim)]"
                  style={{
                    borderColor: "var(--color-border)",
                    backgroundColor: "var(--color-surface-raised)",
                    color: "var(--color-ink)",
                  }}
                >
                  <div
                    className="mb-3 flex h-32 items-center justify-center overflow-hidden rounded-lg bg-cover bg-center"
                    style={{
                      backgroundColor: "var(--color-surface-dim)",
                      backgroundImage: previewUrl
                        ? `url(${JSON.stringify(previewUrl)})`
                        : undefined,
                    }}
                  >
                    {previewUrl ? (
                      <span className="sr-only">{asset.title} preview</span>
                    ) : (
                      <ImageSquare
                        size={32}
                        weight="duotone"
                        style={{ color: "var(--color-accent)" }}
                      />
                    )}
                  </div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <StatusBadge status={asset.review_status} />
                    <span
                      className="text-xs"
                      style={{ color: "var(--color-ink-muted)" }}
                    >
                      {asset.asset_type} · {asset.usage_status}
                    </span>
                  </div>
                  <h3 className="font-semibold">{asset.title}</h3>
                  {asset.entity_slug &&
                    asset.entity_type &&
                    asset.entity_name && (
                      <p
                        className="mt-1 text-sm"
                        style={{ color: "var(--color-ink-muted)" }}
                      >
                        关联：{asset.entity_name}
                      </p>
                    )}
                  <div
                    className="mt-3 space-y-1 text-xs"
                    style={{ color: "var(--color-ink-muted)" }}
                  >
                    <div>Source: {asset.source_name || "未绑定来源"}</div>
                    <div>License: {asset.license || "待确认"}</div>
                    {asset.attribution_text && (
                      <div>Attribution: {asset.attribution_text}</div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div
            className="rounded-xl border p-5 text-sm"
            style={{
              borderColor: "var(--color-border)",
              backgroundColor: "var(--color-surface-raised)",
              color: "var(--color-ink-muted)",
            }}
          >
            暂无媒体候选。后续从 Wikimedia
            Commons、品牌手册、专利图和用户投稿导入时，会先进入这里审核。
          </div>
        )}
      </section>
    </div>
  );
}
