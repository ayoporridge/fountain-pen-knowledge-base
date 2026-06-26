import {
  BookOpen,
  Clock,
  PenNib,
  Quotes,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import {
  getBrandRepresentativeModels,
  getCitationsForTarget,
  getClaimsForEntity,
  getEntityAliases,
  getEntityExternalIds,
  getEntityReferences,
  getStoriesForEntity,
  getTimelineForEntity,
} from "@/lib/library";
import { CitationList } from "./CitationList";
import { ClaimCards } from "./ClaimCards";
import { IdentifierPanel } from "./IdentifierPanel";
import { SourceCards } from "./SourceCards";
import { StatusBadge } from "./StatusBadge";
import { Timeline } from "./Timeline";

export async function BrandMuseum({
  entityId,
  attrs,
}: {
  entityId: string;
  attrs: Record<string, string>;
}) {
  const [stories, timeline, models, sources, aliases, externalIds, claims] =
    await Promise.all([
      getStoriesForEntity(entityId),
      getTimelineForEntity(entityId, 10),
      getBrandRepresentativeModels(entityId),
      getEntityReferences(entityId, 6),
      getEntityAliases(entityId),
      getEntityExternalIds(entityId),
      getClaimsForEntity(entityId, 8),
    ]);
  const story = stories[0];
  const storyCitations = story
    ? await getCitationsForTarget("story", story.id)
    : [];

  return (
    <section className="mb-10 space-y-6">
      <div
        id="archive"
        className="rounded-xl border p-5"
        style={{
          borderColor: "var(--color-border)",
          backgroundColor: "var(--color-surface-raised)",
        }}
      >
        <div className="mb-4 flex items-center gap-2">
          <BookOpen size={18} style={{ color: "var(--color-accent)" }} />
          <h2 className="text-lg font-semibold">品牌馆</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ["国家/地区", attrs.origin_country],
            ["创立时间", attrs.founded],
            ["设计关键词", attrs.design_keywords],
            ["代表技术", attrs.signature_technology],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-lg px-3 py-2"
              style={{ backgroundColor: "var(--color-surface-dim)" }}
            >
              <div
                className="text-xs"
                style={{ color: "var(--color-ink-muted)" }}
              >
                {label}
              </div>
              <div
                className="text-sm font-medium"
                style={{ color: "var(--color-ink)" }}
              >
                {value || "暂无资料"}
              </div>
            </div>
          ))}
        </div>
      </div>

      <IdentifierPanel aliases={aliases} externalIds={externalIds} />

      <ClaimCards claims={claims} />

      <div
        id="story"
        className="rounded-xl border p-5"
        style={{
          borderColor: "var(--color-border)",
          backgroundColor: "var(--color-surface-raised)",
        }}
      >
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Quotes size={18} style={{ color: "var(--color-accent)" }} />
          <h2 className="text-lg font-semibold">
            {story?.title || "品牌故事整理中"}
          </h2>
          {story && <StatusBadge status={story.status} />}
        </div>
        {story ? (
          <>
            <MarkdownRenderer content={story.body_md} />
            <CitationList citations={storyCitations} />
          </>
        ) : (
          <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
            这个品牌还没有通过来源审核的品牌故事。资料馆会先抽取
            claims，再生成可核验草稿。
          </p>
        )}
      </div>

      <div
        id="sources"
        className="rounded-xl border p-5"
        style={{
          borderColor: "var(--color-border)",
          backgroundColor: "var(--color-surface-raised)",
        }}
      >
        <div className="mb-4 flex items-center gap-2">
          <Clock size={18} style={{ color: "var(--color-accent)" }} />
          <h2 className="text-lg font-semibold">品牌时间线</h2>
        </div>
        <Timeline events={timeline} />
      </div>

      <div
        className="rounded-xl border p-5"
        style={{
          borderColor: "var(--color-border)",
          backgroundColor: "var(--color-surface-raised)",
        }}
      >
        <div className="mb-4 flex items-center gap-2">
          <PenNib size={18} style={{ color: "var(--color-accent)" }} />
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
                {model.summary && (
                  <p
                    className="mt-1 line-clamp-2 text-xs leading-relaxed"
                    style={{ color: "var(--color-ink-muted)" }}
                  >
                    {model.summary}
                  </p>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
            暂无已整理代表型号关系。
          </p>
        )}
      </div>

      <div
        className="rounded-xl border p-5"
        style={{
          borderColor: "var(--color-border)",
          backgroundColor: "var(--color-surface-raised)",
        }}
      >
        <h2 className="mb-4 text-lg font-semibold">来源卡片</h2>
        <SourceCards sources={sources} />
      </div>
    </section>
  );
}
