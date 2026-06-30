import Link from "next/link";
import type { CitationRecord, DiagramRecord } from "@/lib/library";
import { CitationList } from "./CitationList";

interface DiagramHotspot {
  label: string;
  x: number;
  y: number;
  linked_entity?: string;
  explanation?: string;
}

function parseHotspots(value: string | null): DiagramHotspot[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is DiagramHotspot =>
        typeof item?.label === "string" &&
        typeof item?.x === "number" &&
        typeof item?.y === "number",
    );
  } catch {
    return [];
  }
}

export function DiagramRenderer({
  diagram,
  citations = [],
  compact = false,
}: {
  diagram: DiagramRecord;
  citations?: CitationRecord[];
  compact?: boolean;
}) {
  const hotspots = parseHotspots(diagram.hotspots_json);

  return (
    <figure
      className="rounded-xl border p-4"
      style={{
        borderColor: "var(--color-border)",
        backgroundColor: "var(--color-surface-raised)",
      }}
    >
      <div className="mb-3">
        <figcaption>
          <h3
            className={`${compact ? "text-sm" : "text-base"} font-semibold`}
            style={{ color: "var(--color-ink)" }}
          >
            {diagram.title}
          </h3>
          <p className="text-xs" style={{ color: "var(--color-ink-muted)" }}>
            {diagram.diagram_type} · {diagram.license}
          </p>
        </figcaption>
      </div>

      <div className="relative overflow-x-auto rounded-lg">
        <div
          className="min-w-[520px]"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: library diagrams are site-authored SVG records, not user-submitted HTML.
          dangerouslySetInnerHTML={{ __html: diagram.svg }}
        />
        {hotspots.map((hotspot) => {
          const marker = (
            <span
              className="absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border text-[10px] font-semibold"
              style={{
                left: `${hotspot.x}%`,
                top: `${hotspot.y}%`,
                borderColor: "var(--color-accent)",
                backgroundColor: "var(--color-surface-raised)",
                color: "var(--color-accent)",
                boxShadow: "var(--shadow-raised)",
              }}
              title={
                hotspot.explanation
                  ? `${hotspot.label}：${hotspot.explanation}`
                  : hotspot.label
              }
            >
              {hotspot.label.slice(0, 1)}
            </span>
          );

          if (hotspot.linked_entity) {
            return (
              <Link
                key={`${hotspot.label}-${hotspot.x}-${hotspot.y}`}
                href={hotspot.linked_entity}
                aria-label={hotspot.label}
              >
                {marker}
              </Link>
            );
          }

          return (
            <span key={`${hotspot.label}-${hotspot.x}-${hotspot.y}`}>
              {marker}
            </span>
          );
        })}
      </div>

      {hotspots.length > 0 && (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {hotspots.map((hotspot) => (
            <div
              key={`${hotspot.label}-text`}
              className="rounded-lg px-3 py-2 text-sm"
              style={{
                backgroundColor: "var(--color-surface-dim)",
                color: "var(--color-ink-light)",
              }}
            >
              <span className="font-medium">{hotspot.label}</span>
              {hotspot.explanation && (
                <span style={{ color: "var(--color-ink-muted)" }}>
                  ：{hotspot.explanation}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <CitationList citations={citations} />
    </figure>
  );
}
