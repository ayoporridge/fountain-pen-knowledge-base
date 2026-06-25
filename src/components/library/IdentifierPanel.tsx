import { LinkSimple } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import type { EntityAliasRecord, ExternalIdRecord } from "@/lib/library";

function ExternalIdCard({ externalId }: { externalId: ExternalIdRecord }) {
  return (
    <div
      className="rounded-lg border px-3 py-2"
      style={{ borderColor: "var(--color-border-light)" }}
    >
      <div className="text-xs" style={{ color: "var(--color-ink-muted)" }}>
        {externalId.provider}
      </div>
      <div className="text-sm font-medium">{externalId.external_id}</div>
    </div>
  );
}

export function IdentifierPanel({
  aliases,
  externalIds,
}: {
  aliases: EntityAliasRecord[];
  externalIds: ExternalIdRecord[];
}) {
  if (aliases.length === 0 && externalIds.length === 0) return null;

  return (
    <div
      className="rounded-xl border p-5"
      style={{
        borderColor: "var(--color-border)",
        backgroundColor: "var(--color-surface-raised)",
      }}
    >
      <div className="mb-4 flex items-center gap-2">
        <LinkSimple size={18} style={{ color: "var(--color-accent)" }} />
        <h2 className="text-lg font-semibold">外部标识与别名</h2>
      </div>

      {externalIds.length > 0 && (
        <div className="mb-4 grid gap-2 sm:grid-cols-2">
          {externalIds.map((externalId) => {
            const label = `${externalId.provider}: ${externalId.external_id}`;

            return externalId.url ? (
              <Link
                key={externalId.id}
                href={externalId.url}
                aria-label={label}
                className="transition-colors hover:bg-[var(--color-surface-dim)]"
              >
                <ExternalIdCard externalId={externalId} />
              </Link>
            ) : (
              <ExternalIdCard key={externalId.id} externalId={externalId} />
            );
          })}
        </div>
      )}

      {aliases.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {aliases.map((alias) => (
            <span
              key={alias.id}
              className="rounded-full border px-3 py-1 text-sm"
              style={{
                borderColor: "var(--color-border)",
                backgroundColor: "var(--color-surface-dim)",
                color: "var(--color-ink-muted)",
              }}
              title={alias.source_name || alias.language}
            >
              {alias.alias}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
