"use client";

import { Star, Link as LinkIcon, Paperclip, CircleDashed } from "@phosphor-icons/react/dist/ssr";

interface DensityBadgeProps {
  linkCount: number;
}

export function DensityBadge({ linkCount }: DensityBadgeProps) {
  let label: string;
  let color: string;
  let Icon: React.ComponentType<{ size?: number; className?: string }>;

  if (linkCount >= 10) {
    label = "Hub 节点";
    color = "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
    Icon = Star;
  } else if (linkCount >= 5) {
    label = "连接丰富";
    color = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    Icon = LinkIcon;
  } else if (linkCount >= 2) {
    label = "有连接";
    color = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    Icon = Paperclip;
  } else if (linkCount === 1) {
    label = "需要补充关联";
    color = "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
    Icon = CircleDashed;
  } else {
    label = "孤岛 — 急需关联";
    color = "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
    Icon = CircleDashed;
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full ${color}`}>
      <Icon size={14} />
      <span>{label} ({linkCount})</span>
    </span>
  );
}
