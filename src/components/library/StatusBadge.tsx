const STATUS_LABELS: Record<string, string> = {
  draft: "基础版本",
  needs_sources: "来源较少",
  needs_media: "暂无配图",
  reviewed: "资料完整",
  published: "公开资料",
  deprecated: "已过期",
  pending: "基础信息",
  needs_review: "资料整理",
  approved: "资料完整",
  rejected: "不采用",
  needs_source: "来源较少",
  needs_license: "授权说明",
  candidate: "已登记",
  primary: "主图",
  gallery: "图库",
  hidden: "隐藏",
  ready: "资料较完整",
  starter: "基础资料",
  gap: "资料较少",
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
