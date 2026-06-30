import { Quotes } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import type { CitationRecord } from "@/lib/library";
import {
  cleanPublicText,
  displayPublicSourceName,
  displayPublicSourceTitle,
} from "@/lib/publicText";

export function CitationList({ citations }: { citations: CitationRecord[] }) {
  if (citations.length === 0) return null;

  return (
    <div
      className="mt-4 border-t pt-3"
      style={{ borderColor: "var(--color-border-light)" }}
    >
      <div
        className="mb-2 flex items-center gap-1.5 text-xs font-medium"
        style={{ color: "var(--color-ink-muted)" }}
      >
        <Quotes size={14} />
        引用
      </div>
      <div className="flex flex-wrap gap-2">
        {citations.map((citation) => {
          const tooltip =
            cleanPublicText(citation.note) ||
            cleanPublicText(citation.claim_text) ||
            undefined;

          return (
            <span
              key={citation.id}
              className="inline-flex max-w-full flex-wrap items-center gap-1 rounded-full border px-2.5 py-1 text-xs"
              style={{
                borderColor: "var(--color-border)",
                backgroundColor: "var(--color-surface-dim)",
                color: "var(--color-ink-muted)",
              }}
              title={tooltip}
            >
              <span>{displayPublicSourceName(citation.source_name)}</span>
              {citation.source_url ? (
                <Link href={citation.source_url} className="ink-underline">
                  {displayPublicSourceTitle(
                    citation.source_title || citation.source_url,
                  )}
                </Link>
              ) : (
                <span>
                  {displayPublicSourceTitle(
                    citation.source_title || citation.claim_predicate,
                  )}
                </span>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}
