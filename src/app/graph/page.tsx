import { Graph } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { LocalGraph } from "@/components/LocalGraph";
import { TYPE_LABELS } from "@/lib/constants";
import { queryAll, queryOne } from "@/lib/db";
import { publicEntityFilter } from "@/lib/public-visibility";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "关系图谱",
  description:
    "从高连接度的品牌与型号出发，查看一跳和二跳关系，并继续进入真实词条。",
  alternates: { canonical: "/graph" },
};

type GraphPageProps = {
  searchParams?: Promise<{ entity?: string }>;
};

type HubEntity = {
  id: string;
  type: string;
  slug: string;
  name: string;
  summary: string | null;
  degree: number;
};

const HUB_QUERY = `
  SELECT e.id, e.type, e.slug, e.name, e.summary,
         COUNT(DISTINCT CASE WHEN el.link_type != 'reverse' THEN el.id END) as degree
  FROM entities e
  LEFT JOIN entity_links el ON el.source_id = e.id OR el.target_id = e.id
  WHERE ${publicEntityFilter("e")}
  GROUP BY e.id, e.type, e.slug, e.name, e.summary
  HAVING degree > 0
  ORDER BY degree DESC, e.name
  LIMIT 12`;

export default async function GraphPage({ searchParams }: GraphPageProps) {
  const params = (await searchParams) || {};
  const hubs = (await queryAll(HUB_QUERY)) as HubEntity[];
  const requestedSlug =
    typeof params.entity === "string" ? decodeURIComponent(params.entity) : "";
  const selected = requestedSlug
    ? ((await queryOne(
        `SELECT e.id, e.type, e.slug, e.name, e.summary,
                COUNT(DISTINCT CASE WHEN el.link_type != 'reverse' THEN el.id END) as degree
         FROM entities e
         LEFT JOIN entity_links el ON el.source_id = e.id OR el.target_id = e.id
         WHERE e.slug = ? AND ${publicEntityFilter("e")}
         GROUP BY e.id, e.type, e.slug, e.name, e.summary
         HAVING degree > 0`,
        [requestedSlug],
      )) as HubEntity | undefined)
    : hubs[0];
  const current = selected || hubs[0];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8 max-w-3xl">
        <p className="mb-2 flex items-center gap-2 text-sm font-medium text-accent">
          <Graph size={18} weight="duotone" />
          Local Knowledge Graph
        </p>
        <h1 className="mb-3 text-3xl font-bold tracking-tight">关系图谱</h1>
        <p className="m-0 text-base leading-relaxed text-ink-light">
          这里不是一次铺开全部词条的“毛线球”，而是从一个可靠起点查看有限的一跳、二跳关系。点击节点或关系列表即可继续漫游。
        </p>
      </header>

      {current ? (
        <>
          <section className="mb-6" aria-labelledby="graph-hub-title">
            <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 id="graph-hub-title" className="mb-1 text-xl font-semibold">
                  选择探索起点
                </h2>
                <p className="m-0 text-sm text-ink-muted">
                  优先列出公开且连接度较高的词条。
                </p>
              </div>
              <Link
                href={`/${current.type}/${current.slug}`}
                className="inline-flex min-h-11 items-center rounded-lg border px-4 py-2 text-sm font-medium"
                style={{ borderColor: "var(--color-border)" }}
              >
                查看「{current.name}」词条
              </Link>
            </div>
            <nav
              className="flex gap-2 overflow-x-auto pb-2"
              aria-label="图谱起点"
            >
              {hubs.map((hub) => {
                const active = hub.id === current.id;
                return (
                  <Link
                    key={hub.id}
                    href={`/graph?entity=${encodeURIComponent(hub.slug)}`}
                    aria-current={active ? "page" : undefined}
                    className="min-h-11 shrink-0 rounded-full border px-4 py-2 text-sm font-medium"
                    style={{
                      borderColor: active
                        ? "var(--color-accent)"
                        : "var(--color-border)",
                      backgroundColor: active
                        ? "var(--color-accent-light)"
                        : "var(--color-surface-raised)",
                      color: active
                        ? "var(--color-accent)"
                        : "var(--color-ink-light)",
                    }}
                  >
                    {hub.name}
                    <span className="ml-2 text-xs opacity-70">
                      {TYPE_LABELS[hub.type] || hub.type} · {hub.degree}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </section>

          <section
            className="min-w-0 rounded-2xl border p-3 sm:p-5"
            style={{
              borderColor: "var(--color-border)",
              backgroundColor: "var(--color-surface-raised)",
              boxShadow: "var(--shadow-raised)",
            }}
            aria-labelledby="current-graph-title"
          >
            <div className="mb-4">
              <p className="mb-1 text-xs font-medium text-accent">
                当前起点 · {TYPE_LABELS[current.type] || current.type}
              </p>
              <h2
                id="current-graph-title"
                className="m-0 text-2xl font-semibold"
              >
                {current.name}
              </h2>
            </div>
            <LocalGraph
              entityId={current.id}
              entityType={current.type}
              entitySlug={current.slug}
            />
          </section>
        </>
      ) : (
        <div
          className="rounded-xl border p-8 text-center text-ink-muted"
          style={{ borderColor: "var(--color-border)" }}
        >
          暂无可展示的公开关系。
        </div>
      )}
    </div>
  );
}
