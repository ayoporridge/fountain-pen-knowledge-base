const STATUS_LABELS: Record<string, string> = {
  draft: "草稿",
  needs_sources: "待补来源",
  needs_media: "待补图",
  reviewed: "已审核",
  published: "已发布",
  deprecated: "已过期",
  pending: "待审核",
  approved: "已批准",
  rejected: "已拒绝",
  needs_source: "待补来源",
  needs_license: "待补授权",
  candidate: "候选",
  primary: "主图",
  gallery: "图库",
  hidden: "隐藏",
  ready: "较完整",
  starter: "起步",
  gap: "缺口",
  store_full: "可存全文",
  store_excerpt: "可存摘录",
  summary_only: "只存摘要",
  metadata_only: "只存元数据",
  link_only: "只展示外链",
  forbidden: "禁止使用",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs"
      style={{
        borderColor: "var(--color-border)",
        backgroundColor: "var(--color-surface-dim)",
        color: "var(--color-ink-muted)",
      }}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
}
