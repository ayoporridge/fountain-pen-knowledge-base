const STATUS_LABELS: Record<string, string> = {
  draft: "草稿",
  needs_sources: "需核验",
  needs_media: "待配图",
  reviewed: "已审核",
  published: "已发布",
  deprecated: "已过期",
  pending: "待核验",
  needs_review: "需复核",
  approved: "已核准",
  rejected: "不采用",
  needs_source: "需核验",
  needs_license: "待补授权",
  candidate: "候选",
  primary: "主图",
  gallery: "图库",
  hidden: "隐藏",
  ready: "资料较完整",
  starter: "基础资料",
  gap: "待扩充",
  store_full: "可存全文",
  store_excerpt: "可存摘录",
  summary_only: "只存摘要",
  metadata_only: "只存元数据",
  link_only: "只展示外链",
  forbidden: "禁止使用",
};

const EMPHASIS_STATUSES = new Set([
  "approved",
  "published",
  "reviewed",
  "ready",
  "primary",
  "gallery",
]);

export function StatusBadge({ status }: { status: string }) {
  const isEmphasis = EMPHASIS_STATUSES.has(status);
  return (
    <span
      className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium"
      style={{
        borderColor: isEmphasis
          ? "color-mix(in srgb, var(--color-accent) 32%, var(--color-border))"
          : "var(--color-border)",
        backgroundColor: isEmphasis
          ? "var(--color-accent-light)"
          : "var(--color-surface-dim)",
        color: isEmphasis ? "var(--color-accent)" : "var(--color-ink-muted)",
        fontFamily: "var(--font-label)",
      }}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
}
