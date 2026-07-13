import { Clock, PenNib } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import {
  getBrandRepresentativeModels,
  getEntityAliases,
  getEntityExternalIds,
  getEntityReferences,
  getTimelineForEntity,
} from "@/lib/library";
import { IdentifierPanel } from "./IdentifierPanel";
import { SourceCards } from "./SourceCards";
import { Timeline } from "./Timeline";

export async function BrandMuseum({ entityId }: { entityId: string }) {
  const [timeline, models, sources, aliases, externalIds] = await Promise.all([
    getTimelineForEntity(entityId, 10),
    getBrandRepresentativeModels(entityId),
    getEntityReferences(entityId, 6),
    getEntityAliases(entityId),
    getEntityExternalIds(entityId),
  ]);

  return (
    <section className="mb-10 space-y-6">
      <div
        id="models"
        className="library-panel p-5"
        style={{
          borderColor: "var(--color-border)",
          backgroundColor: "var(--color-surface-raised)",
        }}
      >
        <div className="library-section-heading mb-3">
          <div className="library-section-icon" aria-hidden="true">
            <PenNib size={18} style={{ color: "var(--color-accent)" }} />
          </div>
          <h2 className="text-lg font-semibold">代表型号</h2>
        </div>
        {models.length > 0 ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {models.map((model) => (
              <Link
                key={model.slug}
                href={`/${model.type}/${model.slug}`}
                className="rounded-lg border p-3 transition-colors hover:bg-[var(--color-surface-dim)]"
                style={{
                  borderColor: "var(--color-border-light)",
                  color: "var(--color-ink)",
                }}
              >
                <div className="text-sm font-medium">{model.name}</div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
            暂无可公开展示的代表型号关系。
          </p>
        )}
      </div>

      <div
        id="timeline"
        className="library-panel p-5"
        style={{
          borderColor: "var(--color-border)",
          backgroundColor: "var(--color-surface-raised)",
        }}
      >
        <div className="library-section-heading mb-4">
          <div className="library-section-icon" aria-hidden="true">
            <Clock size={18} style={{ color: "var(--color-accent)" }} />
          </div>
          <h2 className="text-lg font-semibold">品牌时间线</h2>
        </div>
        <Timeline events={timeline} />
      </div>

      <IdentifierPanel aliases={aliases} externalIds={externalIds} />

      <div
        id="sources"
        className="library-panel p-5"
        style={{
          borderColor: "var(--color-border)",
          backgroundColor: "var(--color-surface-raised)",
        }}
      >
        <h2
          className="mb-3 text-sm font-medium"
          style={{ color: "var(--color-ink-muted)" }}
        >
          来源
        </h2>
        {sources.length > 0 ? (
          <SourceCards sources={sources} variant="compact" />
        ) : (
          <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
            暂无可公开展示的来源资料。
          </p>
        )}
      </div>
    </section>
  );
}
