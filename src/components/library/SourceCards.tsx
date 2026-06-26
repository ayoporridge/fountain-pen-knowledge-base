import Link from "next/link";
import type { SourceItemRecord } from "@/lib/library";
import { StatusBadge } from "./StatusBadge";

export function SourceCards({ sources }: { sources: SourceItemRecord[] }) {
  if (sources.length === 0) {
    return (
      <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
        暂无可展示来源卡片。正式故事会优先展示已审核来源。
      </p>
    );
  }

  return (
    <div className="grid gap-2">
      {sources.map((source) => (
        <Link
          key={source.id}
          href={source.url}
          className="rounded-lg border p-3 transition-colors hover:bg-[var(--color-surface-dim)]"
          style={{
            borderColor: "var(--color-border-light)",
            color: "var(--color-ink)",
          }}
        >
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span
              className="text-xs font-medium"
              style={{ color: "var(--color-accent)" }}
            >
              {source.source_name}
            </span>
            <span
              className="text-xs"
              style={{ color: "var(--color-ink-muted)" }}
            >
              {source.allowed_use || "未标注用途"}
            </span>
            <StatusBadge status={source.review_status} />
          </div>
          <div className="text-sm font-medium">{source.title}</div>
          <div
            className="mt-1 flex flex-wrap gap-2 text-xs"
            style={{ color: "var(--color-ink-muted)" }}
          >
            <span>{source.item_type}</span>
            {source.reference_count > 0 && (
              <span>引用 {source.reference_count}</span>
            )}
          </div>
          {source.license && (
            <div
              className="mt-1 text-xs"
              style={{ color: "var(--color-ink-muted)" }}
            >
              License: {source.license}
            </div>
          )}
        </Link>
      ))}
    </div>
  );
}
