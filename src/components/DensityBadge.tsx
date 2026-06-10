"use client";

import { Star } from "@phosphor-icons/react/dist/ssr";

interface DensityBadgeProps {
  linkCount: number;
}

export function DensityBadge({ linkCount }: DensityBadgeProps) {
  if (linkCount < 5) return null;

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full"
      style={{
        backgroundColor: "var(--color-accent-light)",
        color: "var(--color-accent)",
      }}
    >
      <Star size={14} weight="fill" />
      <span>高频词条</span>
    </span>
  );
}
