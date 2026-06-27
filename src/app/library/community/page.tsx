import { ChatsCircle, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { StatusBadge } from "@/components/library/StatusBadge";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { getCommunitySummaryIndex } from "@/lib/library";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "玩家口碑 - 钢笔图书馆",
  description: "钢笔图书馆的社区口碑聚合摘要与 Reddit/论坛使用边界。",
};

function parseMetadata(value: string | null) {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}

export default async function LibraryCommunityPage() {
  const summaries = await getCommunitySummaryIndex(80);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8 max-w-3xl">
        <p
          className="mb-2 flex items-center gap-2 text-sm font-medium"
          style={{ color: "var(--color-accent)" }}
        >
          <ChatsCircle size={16} />
          Community Notes
        </p>
        <h1 className="mb-3 text-3xl font-bold tracking-tight">玩家口碑</h1>
        <p
          className="text-base leading-relaxed"
          style={{ color: "var(--color-ink-light)" }}
        >
          社区内容只做趋势、问题和争议点的聚合摘要。默认不保存 Reddit
          或论坛评论正文，也不把玩家表达当作未经核验的事实。
        </p>
      </div>

      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        {[
          ["只存元数据", "post id、标题、链接、分数、评论数、标签。"],
          ["只写原创摘要", "页面展示的是站内归纳，不复制社区评论全文。"],
          [
            "事实以来源为准",
            "规格、年份、版本差异会回到官方、书籍或可靠资料。",
          ],
        ].map(([title, desc]) => (
          <div
            key={title}
            className="rounded-xl border p-4"
            style={{
              borderColor: "var(--color-border)",
              backgroundColor: "var(--color-surface-raised)",
            }}
          >
            <div className="mb-2 flex items-center gap-2 font-medium">
              <ShieldCheck size={16} style={{ color: "var(--color-accent)" }} />
              {title}
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

      <div className="grid gap-4 lg:grid-cols-2">
        {summaries.map((summary) => {
          const metadata = parseMetadata(summary.metadata_json);
          return (
            <article
              key={summary.id}
              className="rounded-xl border p-5"
              style={{
                borderColor: "var(--color-border)",
                backgroundColor: "var(--color-surface-raised)",
              }}
            >
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <StatusBadge status={summary.status} />
                <span
                  className="text-xs"
                  style={{ color: "var(--color-ink-muted)" }}
                >
                  {summary.source_name}
                </span>
              </div>
              <h2 className="mb-1 text-lg font-semibold">
                <Link
                  href={`/${summary.entity_type}/${summary.entity_slug}`}
                  className="ink-underline"
                >
                  {summary.entity_name}
                </Link>
              </h2>
              {summary.entity_summary && (
                <p
                  className="mb-4 text-sm leading-relaxed"
                  style={{ color: "var(--color-ink-muted)" }}
                >
                  {summary.entity_summary}
                </p>
              )}
              <MarkdownRenderer content={summary.summary_md} />
              {metadata && (
                <div
                  className="mt-4 grid gap-2 text-xs sm:grid-cols-3"
                  style={{ color: "var(--color-ink-muted)" }}
                >
                  {Object.entries(metadata).map(([key, value]) => (
                    <div
                      key={key}
                      className="rounded-lg px-3 py-2"
                      style={{ backgroundColor: "var(--color-surface-dim)" }}
                    >
                      <div className="font-medium">{key}</div>
                      <div>{String(value)}</div>
                    </div>
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
