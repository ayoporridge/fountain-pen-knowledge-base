"use client";

import { Graph } from "@phosphor-icons/react/dist/ssr";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  type ComponentType,
  type RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ForceGraphMethods } from "react-force-graph-2d";
import { TYPE_COLORS, TYPE_LABELS } from "@/lib/constants";
import { entityIdentityKey } from "@/lib/entity-identity";

interface GraphNode {
  id: string;
  name: string;
  type: string;
  slug: string;
  isCenter?: boolean;
  isSecondHop?: boolean;
  x?: number;
  y?: number;
}

interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  linkType: string;
  reason?: string | null;
  isSecondHop?: boolean;
}

interface ApiLink {
  source_key: string;
  target_key: string;
  link_type: string;
  reason?: string | null;
  source_name?: string;
  source_type?: string;
  source_slug?: string;
  target_name?: string;
  target_type?: string;
  target_slug?: string;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

interface LocalGraphProps {
  entityType: string;
  entitySlug: string;
}

type ForceGraphInstance = ForceGraphMethods<GraphNode, GraphLink>;

interface LocalForceGraph2DProps {
  ref?: RefObject<ForceGraphInstance | undefined>;
  graphData: GraphData;
  width: number;
  height: number;
  backgroundColor: string;
  nodeCanvasObject: (
    node: GraphNode,
    ctx: CanvasRenderingContext2D,
    globalScale: number,
  ) => void;
  nodePointerAreaPaint: (
    node: GraphNode,
    color: string,
    ctx: CanvasRenderingContext2D,
  ) => void;
  onNodeClick: (node: GraphNode) => void;
  linkColor: (link: GraphLink) => string;
  linkWidth: (link: GraphLink) => number;
  linkLineDash: (link: GraphLink) => number[] | null;
  linkDirectionalArrowLength: number;
  linkDirectionalArrowRelPos: number;
  cooldownTicks: number;
  d3AlphaDecay: number;
  d3VelocityDecay: number;
  enablePanInteraction: boolean;
  enableNodeDrag: boolean;
  onEngineStop: () => void;
}

const ForceGraph2D = dynamic(
  () => import("react-force-graph-2d").then((mod) => mod.default),
  { ssr: false },
) as unknown as ComponentType<LocalForceGraph2DProps>;

const MAX_DIRECT_NODES = 12;
const MAX_SECOND_HOP_NODES = 8;

const RELATION_LABELS: Record<string, string> = {
  brand_model: "品牌型号",
  made_by: "品牌制造",
  same_brand: "同品牌",
  same_series: "同系列",
  uses: "使用 / 采用",
  implements: "实现 / 应用",
  predecessor: "前代型号",
  successor: "后继型号",
  related_to: "相关",
  related: "相关",
  instance_of: "属于",
};

export function getRelationLabel(linkType: string) {
  return RELATION_LABELS[linkType] || "相关";
}

function relationExplanation(
  link: GraphLink,
  source: GraphNode,
  target: GraphNode,
) {
  if (link.reason && /[\u3400-\u9fff]/u.test(link.reason)) {
    return link.reason.trim();
  }
  if (link.linkType === "brand_model") {
    return `${target.name} 是 ${source.name} 的品牌型号`;
  }
  if (link.linkType === "made_by") {
    return `${source.name} 由 ${target.name} 制造`;
  }
  if (link.linkType === "same_series") {
    return `${source.name} 与 ${target.name} 属于同一系列`;
  }
  if (link.linkType === "same_brand") {
    return `${source.name} 与 ${target.name} 属于同一品牌`;
  }
  if (link.linkType === "predecessor" || link.linkType === "successor") {
    return `${source.name} 与 ${target.name} 是前后代型号`;
  }
  return `${source.name} 与 ${target.name} 存在${getRelationLabel(link.linkType)}关系`;
}

function linkId(value: string | GraphNode) {
  return typeof value === "string" ? value : value.id;
}

function truncateLabel(name: string, maxLength: number) {
  return name.length <= maxLength ? name : `${name.slice(0, maxLength - 1)}…`;
}

function getGraphHeight(width: number) {
  return Math.min(430, Math.max(280, Math.round(width * 0.48)));
}

export function LocalGraph({ entityType, entitySlug }: LocalGraphProps) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [allData, setAllData] = useState<GraphData | null>(null);
  const [depth, setDepth] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [overflow, setOverflow] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<ForceGraphInstance | undefined>(undefined);
  const [dimensions, setDimensions] = useState({ width: 300, height: 280 });

  const isDark = resolvedTheme === "dark";
  const labelColor = isDark ? "#e8e4dc" : "#1a1814";
  const backgroundColor = isDark ? "#141210" : "#f7f5f0";

  useLayoutEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const measure = () => {
      const width = Math.max(
        300,
        Math.round(element.getBoundingClientRect().width),
      );
      setDimensions({ width, height: getGraphHeight(width) });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(false);

    Promise.all([
      fetch(`/api/entities/${encodeURIComponent(entitySlug)}`, {
        signal: controller.signal,
      }),
      fetch(`/api/links?slug=${encodeURIComponent(entitySlug)}&depth=2`, {
        signal: controller.signal,
      }),
    ])
      .then(async ([entityResponse, linksResponse]) => {
        if (!entityResponse.ok || !linksResponse.ok) {
          throw new Error("Graph data unavailable");
        }
        return Promise.all([entityResponse.json(), linksResponse.json()]);
      })
      .then(([centerEntity, response]) => {
        const nodes: GraphNode[] = [];
        const links: GraphLink[] = [];
        const nodesById = new Map<string, GraphNode>();
        const identityKeys = new Set<string>();
        const linkKeys = new Set<string>();
        const centerKey = `${entityType}:${entitySlug}`;

        const addNode = (node: GraphNode) => {
          const identity = entityIdentityKey(node);
          if (nodesById.has(node.id) || identityKeys.has(identity))
            return false;
          nodes.push(node);
          nodesById.set(node.id, node);
          identityKeys.add(identity);
          return true;
        };
        addNode({
          id: centerKey,
          name: centerEntity.name || entitySlug,
          type: entityType,
          slug: entitySlug,
          isCenter: true,
        });

        const directCandidates = new Map<string, GraphNode>();
        for (const link of (response.forward || []) as ApiLink[]) {
          if (
            !link.target_key ||
            !link.target_name ||
            !link.target_type ||
            !link.target_slug
          )
            continue;
          directCandidates.set(link.target_key, {
            id: link.target_key,
            name: link.target_name,
            type: link.target_type,
            slug: link.target_slug,
          });
        }
        for (const link of (response.backlinks || []) as ApiLink[]) {
          if (
            !link.source_key ||
            !link.source_name ||
            !link.source_type ||
            !link.source_slug
          )
            continue;
          directCandidates.set(link.source_key, {
            id: link.source_key,
            name: link.source_name,
            type: link.source_type,
            slug: link.source_slug,
          });
        }

        const directNodes = Array.from(directCandidates.values()).slice(
          0,
          MAX_DIRECT_NODES,
        );
        for (const node of directNodes) addNode(node);
        setOverflow(Math.max(0, directCandidates.size - directNodes.length));

        const addLink = (apiLink: ApiLink, isSecondHop = false) => {
          if (
            !nodesById.has(apiLink.source_key) ||
            !nodesById.has(apiLink.target_key)
          )
            return;
          const key = `${apiLink.source_key}:${apiLink.target_key}:${apiLink.link_type}`;
          if (linkKeys.has(key)) return;
          linkKeys.add(key);
          links.push({
            source: apiLink.source_key,
            target: apiLink.target_key,
            linkType: apiLink.link_type,
            reason: apiLink.reason,
            isSecondHop,
          });
        };

        for (const link of (response.forward || []) as ApiLink[]) addLink(link);
        for (const link of (response.backlinks || []) as ApiLink[])
          addLink(link);

        let remainingSecondHop = MAX_SECOND_HOP_NODES;
        const addSecondHop = (link: ApiLink, side: "source" | "target") => {
          const nextId = side === "source" ? link.source_key : link.target_key;
          const attachedId =
            side === "source" ? link.target_key : link.source_key;
          if (!nodesById.has(attachedId)) return;
          if (!nodesById.has(nextId)) {
            if (remainingSecondHop <= 0) return;
            const name =
              side === "source" ? link.source_name : link.target_name;
            const type =
              side === "source" ? link.source_type : link.target_type;
            const slug =
              side === "source" ? link.source_slug : link.target_slug;
            if (!name || !type || !slug) return;
            if (addNode({ id: nextId, name, type, slug, isSecondHop: true })) {
              remainingSecondHop -= 1;
            }
          }
          addLink(link, true);
        };

        for (const link of (response.secondHopForward || []) as ApiLink[]) {
          addSecondHop(link, "target");
        }
        for (const link of (response.secondHopBacklinks || []) as ApiLink[]) {
          addSecondHop(link, "source");
        }

        setAllData({ nodes, links });
        setLoading(false);
      })
      .catch((reason) => {
        if (reason instanceof DOMException && reason.name === "AbortError")
          return;
        setError(true);
        setLoading(false);
      });

    return () => controller.abort();
  }, [entitySlug, entityType]);

  const graphData = useMemo<GraphData | null>(() => {
    if (!allData) return null;
    if (depth === 2) return allData;
    const nodes = allData.nodes.filter((node) => !node.isSecondHop);
    const nodeIds = new Set(nodes.map((node) => node.id));
    return {
      nodes,
      links: allData.links.filter(
        (link) =>
          !link.isSecondHop &&
          nodeIds.has(linkId(link.source)) &&
          nodeIds.has(linkId(link.target)),
      ),
    };
  }, [allData, depth]);

  useEffect(() => {
    if (
      !graphData ||
      !graphRef.current ||
      dimensions.width <= 0 ||
      dimensions.height <= 0
    )
      return;
    const timer = window.setTimeout(
      () => graphRef.current?.zoomToFit(300, 34),
      320,
    );
    return () => window.clearTimeout(timer);
  }, [graphData, dimensions]);

  const nodeCanvasObject = useCallback(
    (
      node: GraphNode,
      context: CanvasRenderingContext2D,
      globalScale: number,
    ) => {
      const radius = node.isCenter ? 7 : node.isSecondHop ? 3.5 : 4.8;
      context.beginPath();
      context.arc(node.x || 0, node.y || 0, radius, 0, Math.PI * 2);
      context.fillStyle = TYPE_COLORS[node.type] || "#7a756d";
      context.globalAlpha = node.isSecondHop ? 0.55 : 1;
      context.fill();
      context.globalAlpha = 1;

      if (node.isCenter) {
        context.strokeStyle = isDark ? "#141210" : "#ffffff";
        context.lineWidth = 2 / globalScale;
        context.stroke();
      }

      const fontSize = Math.min((node.isCenter ? 13 : 11) / globalScale, 16);
      const label = truncateLabel(
        node.name || node.id,
        node.isCenter ? 20 : 14,
      );
      context.font = `${node.isCenter ? 650 : 450} ${fontSize}px system-ui, sans-serif`;
      context.textAlign = "center";
      context.textBaseline = "top";
      const x = node.x || 0;
      const y = (node.y || 0) + radius + 2;
      const width = context.measureText(label).width;
      context.fillStyle = isDark
        ? "rgba(20,18,16,.86)"
        : "rgba(247,245,240,.9)";
      context.fillRect(x - width / 2 - 2, y - 1, width + 4, fontSize * 1.25);
      context.fillStyle = labelColor;
      context.globalAlpha = node.isSecondHop ? 0.68 : 1;
      context.fillText(label, x, y);
      context.globalAlpha = 1;
    },
    [isDark, labelColor],
  );

  const handleNodeClick = useCallback(
    (node: GraphNode) => {
      if (!node.isCenter) router.push(`/${node.type}/${node.slug}`);
    },
    [router],
  );

  if (loading) {
    return (
      <div
        ref={containerRef}
        className="flex h-[280px] items-center justify-center rounded-xl animate-pulse"
        style={{ backgroundColor }}
        aria-busy="true"
        aria-label="正在加载关系图谱"
        role="status"
      >
        <span className="text-sm text-ink-muted">正在整理关系…</span>
      </div>
    );
  }

  if (error || !graphData || graphData.nodes.length <= 1) {
    return (
      <div
        ref={containerRef}
        className="flex h-[280px] flex-col items-center justify-center gap-3 rounded-xl"
        style={{ backgroundColor }}
      >
        <Graph size={32} weight="duotone" className="text-ink-muted" />
        <p className="m-0 text-sm text-ink-muted">
          {error ? "关系数据暂时无法载入" : "暂无可展示的公开关系"}
        </p>
      </div>
    );
  }

  const nodesById = new Map(graphData.nodes.map((node) => [node.id, node]));
  const relationships = graphData.links.flatMap((link) => {
    const source = nodesById.get(linkId(link.source));
    const target = nodesById.get(linkId(link.target));
    if (!source || !target) return [];
    const destination = source.isCenter
      ? target
      : target.isCenter
        ? source
        : source.isSecondHop
          ? source
          : target;
    return [{ link, source, target, destination }];
  });
  const legendTypes = Array.from(
    new Set(graphData.nodes.map((node) => node.type)),
  );

  return (
    <div className="min-w-0 max-w-full space-y-3" data-testid="local-graph">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className="inline-flex rounded-lg border p-1"
          style={{ borderColor: "var(--color-border)" }}
        >
          {([1, 2] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setDepth(value)}
              aria-pressed={depth === value}
              className="min-h-11 rounded-md px-3 py-2 text-sm font-medium"
              style={{
                backgroundColor:
                  depth === value ? "var(--color-accent-light)" : "transparent",
                color:
                  depth === value
                    ? "var(--color-accent)"
                    : "var(--color-ink-muted)",
              }}
            >
              {value === 1 ? "一跳关系" : "含二跳"}
            </button>
          ))}
        </div>
        <p className="m-0 text-xs text-ink-muted">
          实线为直接关系，虚线为二跳关系
        </p>
      </div>

      <div
        ref={containerRef}
        data-testid="local-graph-canvas"
        className="relative min-w-0 overflow-hidden rounded-xl"
        style={{ backgroundColor }}
      >
        <div
          className="absolute left-3 top-3 z-10 flex max-w-[calc(100%-1.5rem)] flex-wrap gap-2 rounded-lg border px-3 py-2 text-xs"
          style={{
            backgroundColor: isDark
              ? "rgba(20,18,16,.86)"
              : "rgba(255,255,255,.9)",
            borderColor: "var(--color-border)",
            color: "var(--color-ink-muted)",
          }}
        >
          {legendTypes.map((type) => (
            <span key={type} className="inline-flex items-center gap-1">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: TYPE_COLORS[type] || "#7a756d" }}
              />
              {TYPE_LABELS[type] || type}
            </span>
          ))}
        </div>
        <ForceGraph2D
          key={`${dimensions.width}x${dimensions.height}:${depth}`}
          ref={graphRef}
          graphData={graphData}
          width={dimensions.width}
          height={dimensions.height}
          backgroundColor={backgroundColor}
          nodeCanvasObject={nodeCanvasObject}
          nodePointerAreaPaint={(node, color, context) => {
            context.fillStyle = color;
            context.beginPath();
            context.arc(
              node.x || 0,
              node.y || 0,
              node.isCenter ? 13 : 10,
              0,
              Math.PI * 2,
            );
            context.fill();
          }}
          onNodeClick={handleNodeClick}
          linkColor={(link) =>
            link.isSecondHop
              ? isDark
                ? "rgba(201,193,179,.28)"
                : "rgba(113,107,98,.3)"
              : isDark
                ? "rgba(214,164,97,.56)"
                : "rgba(154,91,34,.5)"
          }
          linkWidth={(link) => (link.isSecondHop ? 0.75 : 1.35)}
          linkLineDash={(link) => (link.isSecondHop ? [3, 3] : null)}
          linkDirectionalArrowLength={3}
          linkDirectionalArrowRelPos={0.82}
          cooldownTicks={100}
          d3AlphaDecay={0.022}
          d3VelocityDecay={0.18}
          enablePanInteraction={false}
          enableNodeDrag={false}
          onEngineStop={() => graphRef.current?.zoomToFit(250, 34)}
        />
        {overflow > 0 && depth === 1 && (
          <div
            className="absolute bottom-2 right-2 rounded-full border px-2 py-1 text-xs text-ink-muted"
            style={{ backgroundColor, borderColor: "var(--color-border)" }}
          >
            另有 {overflow} 个直接关联未显示
          </div>
        )}
      </div>

      <div
        className="rounded-xl border p-4"
        style={{
          borderColor: "var(--color-border)",
          backgroundColor: "var(--color-surface-raised)",
        }}
      >
        <h3 className="mb-1 text-sm font-semibold text-ink">关系列表</h3>
        <p className="mb-3 text-xs text-ink-muted">
          画布与列表使用同一组关系；键盘和触屏也可在这里继续探索。
        </p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {relationships
            .slice(0, 20)
            .map(({ link, source, target, destination }) => (
              <li
                key={`${source.id}:${target.id}:${link.linkType}`}
                className="min-w-0"
              >
                <Link
                  href={`/${destination.type}/${destination.slug}`}
                  className="flex min-h-11 min-w-0 max-w-full items-start justify-between gap-3 overflow-hidden rounded-lg border px-3 py-2 text-left text-sm"
                  style={{
                    borderColor: "var(--color-border-light)",
                    color: "var(--color-ink-light)",
                  }}
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-ink">
                      {destination.name}
                    </span>
                    <span className="mt-0.5 block break-words text-xs leading-relaxed text-ink-muted [overflow-wrap:anywhere]">
                      {relationExplanation(link, source, target)}
                    </span>
                  </span>
                  <span
                    className="shrink-0 rounded-full px-2 py-0.5 text-xs"
                    style={{
                      backgroundColor: "var(--color-accent-light)",
                      color: "var(--color-accent)",
                    }}
                  >
                    {getRelationLabel(link.linkType)}
                  </span>
                </Link>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}
