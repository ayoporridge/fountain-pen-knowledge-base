import Link from "next/link";
import type { TimelineEventRecord } from "@/lib/library";
import { StatusBadge } from "./StatusBadge";

const EVENT_LABELS: Record<string, string> = {
  brand_founded: "创立",
  model_released: "型号发布",
  patent_filed: "专利",
  acquisition: "并购",
  discontinued: "停产",
  revival: "复刻",
  design_milestone: "设计节点",
  community_event: "社区事件",
};

export function Timeline({
  events,
  compact = false,
}: {
  events: Array<
    TimelineEventRecord & {
      entity_type?: string | null;
      entity_slug?: string | null;
      entity_name?: string | null;
    }
  >;
  compact?: boolean;
}) {
  if (events.length === 0) {
    return (
      <div
        className="rounded-xl border p-4 text-sm"
        style={{
          borderColor: "var(--color-border)",
          color: "var(--color-ink-muted)",
          backgroundColor: "var(--color-surface-raised)",
        }}
      >
        时间线待补完。后续会从品牌官网、Wikidata、目录、专利和社区资料中补充。
      </div>
    );
  }

  return (
    <ol
      className="relative space-y-4 border-l pl-5"
      style={{ borderColor: "var(--color-border)" }}
    >
      {events.map((event) => (
        <li key={event.id} className="relative">
          <span
            className="absolute -left-[27px] top-1 h-3 w-3 rounded-full border"
            style={{
              backgroundColor: "var(--color-accent)",
              borderColor: "var(--color-surface-raised)",
            }}
          />
          <div className="flex flex-wrap items-center gap-2">
            <time
              className="text-sm font-semibold"
              style={{ color: "var(--color-accent)" }}
            >
              {event.circa ? `约 ${event.start_date}` : event.start_date}
            </time>
            <span
              className="rounded-full px-2 py-0.5 text-xs"
              style={{
                backgroundColor: "var(--color-accent-light)",
                color: "var(--color-accent)",
              }}
            >
              {EVENT_LABELS[event.event_type] || event.event_type}
            </span>
            <StatusBadge status={event.review_status} />
          </div>
          <h3
            className={`${compact ? "text-sm" : "text-base"} mt-1 font-semibold`}
            style={{ color: "var(--color-ink)" }}
          >
            {event.entity_slug && event.entity_type && event.entity_name ? (
              <>
                <Link
                  href={`/${event.entity_type}/${event.entity_slug}`}
                  className="ink-underline"
                >
                  {event.entity_name}
                </Link>
                <span> · {event.title}</span>
              </>
            ) : (
              event.title
            )}
          </h3>
          {event.description && (
            <p
              className="mt-1 text-sm leading-relaxed"
              style={{ color: "var(--color-ink-muted)" }}
            >
              {event.description}
            </p>
          )}
          {event.source_url && event.source_title && (
            <Link
              href={event.source_url}
              className="mt-1 inline-flex text-xs ink-underline"
              style={{ color: "var(--color-ink-muted)" }}
            >
              来源：{event.source_title}
            </Link>
          )}
        </li>
      ))}
    </ol>
  );
}
