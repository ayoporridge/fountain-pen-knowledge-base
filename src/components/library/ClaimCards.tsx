import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import type { ClaimRecord } from "@/lib/library";
import { cleanPublicText } from "@/lib/publicText";
import { StatusBadge } from "./StatusBadge";

const PREDICATE_LABELS: Record<string, string> = {
  history_milestone: "历史节点",
  design_milestone: "设计节点",
  model_released: "发布信息",
  official_series: "官方系列",
  material: "材质",
  fill_system: "上墨方式",
  official_history_anchor: "官方历史线索",
  wikidata_description: "Wikidata 描述",
};

function formatConfidence(value: number) {
  return `${Math.round(value * 100)}%`;
}

function claimText(claim: ClaimRecord) {
  if (claim.object_entity_name) return claim.object_entity_name;
  return claim.object_text || "暂无可展示文本";
}

export function ClaimCards({ claims }: { claims: ClaimRecord[] }) {
  const visibleClaims = claims.filter((claim) =>
    cleanPublicText(claimText(claim)),
  );

  if (visibleClaims.length === 0) return null;

  return (
    <div
      className="rounded-xl border p-5"
      style={{
        borderColor: "var(--color-border)",
        backgroundColor: "var(--color-surface-raised)",
      }}
    >
      <div className="mb-4 flex items-center gap-2">
        <CheckCircle size={18} style={{ color: "var(--color-accent)" }} />
        <h2 className="text-lg font-semibold">事实与证据</h2>
      </div>

      <div className="grid gap-3">
        {visibleClaims.map((claim) => (
          <div
            key={claim.id}
            className="rounded-lg border p-3"
            style={{ borderColor: "var(--color-border-light)" }}
          >
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span
                className="text-xs font-medium"
                style={{ color: "var(--color-accent)" }}
              >
                {PREDICATE_LABELS[claim.predicate] || claim.predicate}
              </span>
              <StatusBadge status={claim.review_status} />
              <span
                className="text-xs"
                style={{ color: "var(--color-ink-muted)" }}
              >
                {formatConfidence(claim.confidence)}
              </span>
            </div>

            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--color-ink)" }}
            >
              {claim.object_entity_type &&
              claim.object_entity_slug &&
              claim.object_entity_name ? (
                <Link
                  href={`/${claim.object_entity_type}/${claim.object_entity_slug}`}
                  className="ink-underline"
                >
                  {claimText(claim)}
                </Link>
              ) : (
                claimText(claim)
              )}
            </p>

            {(claim.source_title || claim.source_name) && (
              <div
                className="mt-2 flex flex-wrap items-center gap-2 text-xs"
                style={{ color: "var(--color-ink-muted)" }}
              >
                <span>{claim.source_name || "来源"}</span>
                {claim.source_url ? (
                  <Link href={claim.source_url} className="ink-underline">
                    {claim.source_title || claim.source_url}
                  </Link>
                ) : (
                  <span>{claim.source_title}</span>
                )}
                {claim.allowed_use && (
                  <StatusBadge status={claim.allowed_use} />
                )}
                {claim.evidence_locator && (
                  <span>{claim.evidence_locator}</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
