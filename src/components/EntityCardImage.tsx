"use client";

import { Books, FileText, Flask, PenNib } from "@phosphor-icons/react";
import Image from "next/image";
import { useState } from "react";
import { TYPE_ICONS, TYPE_LABELS } from "@/lib/constants";

const CARD_FALLBACKS: Record<
  string,
  { title: string; subtitle: string; Icon: typeof PenNib }
> = {
  pen: { title: "型号档案", subtitle: "参数 / 故事 / 图谱", Icon: PenNib },
  brand: { title: "品牌馆", subtitle: "历史 / 型号 / 来源", Icon: Books },
  article: { title: "文章档案", subtitle: "原文整理 / 来源卡", Icon: FileText },
  concept: { title: "工艺概念", subtitle: "术语 / 结构 / 关系", Icon: Flask },
  fill_system: {
    title: "上墨机制",
    subtitle: "结构 / 维护 / 对比",
    Icon: Flask,
  },
  nib: { title: "笔尖资料", subtitle: "类型 / 书写 / 维护", Icon: PenNib },
};

export function EntityCardImage({
  src,
  name,
  type,
  compact = false,
}: {
  src: string | null;
  name: string;
  type: string;
  compact?: boolean;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  const defaultIcon = TYPE_ICONS[type] || PenNib;
  const fallback = CARD_FALLBACKS[type] || {
    title: TYPE_LABELS[type] || "资料卡",
    subtitle: "馆藏条目",
    Icon: defaultIcon,
  };
  const FallbackIcon = fallback.Icon;

  if (src && failedSrc !== src) {
    return (
      <Image
        src={src}
        alt={name}
        fill
        unoptimized
        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
        className={
          type === "pen"
            ? "bg-[var(--color-surface-dim)] object-contain p-2"
            : "object-cover"
        }
        onError={() => setFailedSrc(src)}
      />
    );
  }

  if (compact) {
    return (
      <span
        className="flex h-full w-full items-center justify-center"
        style={{
          color: "var(--color-accent)",
          backgroundColor: "var(--color-accent-light)",
        }}
      >
        <FallbackIcon size={18} weight="duotone" />
      </span>
    );
  }

  return (
    <span
      data-testid={`entity-card-fallback-${type}`}
      className="flex h-full w-full flex-col items-center justify-center gap-2 px-4 text-center"
      style={{
        color: "var(--color-accent)",
        background:
          "linear-gradient(135deg, var(--color-accent-light), color-mix(in srgb, var(--color-surface-raised) 45%, var(--color-accent-light)))",
      }}
    >
      <FallbackIcon size={28} weight="duotone" />
      <span className="text-base font-semibold">{fallback.title}</span>
      <span className="text-xs" style={{ color: "var(--color-ink-muted)" }}>
        {fallback.subtitle}
      </span>
    </span>
  );
}
