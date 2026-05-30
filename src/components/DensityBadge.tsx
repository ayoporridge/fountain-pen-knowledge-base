"use client";

interface DensityBadgeProps {
  linkCount: number;
}

export function DensityBadge({ linkCount }: DensityBadgeProps) {
  let label: string;
  let color: string;
  let emoji: string;

  if (linkCount >= 10) {
    label = "Hub 节点";
    color = "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
    emoji = "⭐";
  } else if (linkCount >= 5) {
    label = "连接丰富";
    color = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    emoji = "🔗";
  } else if (linkCount >= 2) {
    label = "有连接";
    color = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    emoji = "📎";
  } else if (linkCount === 1) {
    label = "需要补充关联";
    color = "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
    emoji = "🔗";
  } else {
    label = "孤岛 — 急需关联";
    color = "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
    emoji = "🏝️";
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full ${color}`}>
      {emoji} {label} ({linkCount})
    </span>
  );
}
