import { ArrowSquareOut, Clock } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

interface EntityMetaProps {
  createdAt: string;
  updatedAt: string;
  sourceUrl: string | null;
  entityId: string;
  entityType: string;
  entitySlug: string;
}

export function EntityMeta({
  createdAt,
  updatedAt,
  sourceUrl,
}: EntityMetaProps) {
  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return d;
    }
  };

  return (
    <div
      className="p-4 rounded-xl border"
      style={{
        borderColor: "var(--color-border)",
        backgroundColor: "var(--color-surface-raised)",
      }}
    >
      <h3
        className="text-sm font-semibold mb-3"
        style={{ color: "var(--color-ink)" }}
      >
        元信息
      </h3>
      <div className="space-y-2 text-sm">
        <div
          className="flex items-center gap-2"
          style={{ color: "var(--color-ink-muted)" }}
        >
          <Clock size={14} />
          <span>创建于 {formatDate(createdAt)}</span>
        </div>
        <div
          className="flex items-center gap-2"
          style={{ color: "var(--color-ink-muted)" }}
        >
          <Clock size={14} />
          <span>更新于 {formatDate(updatedAt)}</span>
        </div>
        {sourceUrl && (
          <Link
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 transition-colors hover:underline"
            style={{ color: "var(--color-accent)" }}
          >
            <ArrowSquareOut size={14} />
            <span>来源链接</span>
          </Link>
        )}
      </div>
    </div>
  );
}
