"use client";

import { Graph } from "@phosphor-icons/react/dist/ssr";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  type ComponentType,
  type RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
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
  source: string;
  target: string;
  link_type: string;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

interface LocalGraphProps {
  entityId: string;
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
    globalScale: number,
  ) => void;
  onNodeClick: (node: GraphNode) => void;
  linkColor: () => string;
  linkWidth: number;
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
  {
    ssr: false,
  },
) as unknown as ComponentType<LocalForceGraph2DProps>;

const MAX_DIRECT_NODES = 12;

function truncateLabel(name: string, maxLen: number) {
  if (name.length <= maxLen) return name;
  return `${name.slice(0, maxLen - 1)}…`;
}

function getGraphHeight(width: number) {
  return Math.min(340, Math.max(240, Math.round(width * 0.42)));
}

export function LocalGraph({
  entityId,
  entityType,
  entitySlug,
}: LocalGraphProps) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [overflow, setOverflow] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 360 });
  const graphRef = useRef<ForceGraphInstance | undefined>(undefined);
  const startTimeRef = useRef(Date.now());

  const isDark = resolvedTheme === "dark";
  const labelColor = isDark ? "#e8e4dc" : "#1a1814";
  const linkColor = isDark ? "#2e2b26" : "#ddd8ce";
  const bgColor = isDark ? "#141210" : "#f7f5f0";
  const graphWidth = dimensions.width;
  const graphHeight = dimensions.height;

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateDimensions = (width: number) => {
      const safeWidth = Math.max(320, Math.round(width));
      const nextHeight = getGraphHeight(safeWidth);
      setDimensions((prev) => {
        if (prev.width === safeWidth && prev.height === nextHeight) {
          return prev;
        }
        return {
          width: safeWidth,
          height: nextHeight,
        };
      });
    };

    const measure = () => {
      updateDimensions(
        el.getBoundingClientRect().width ||
          el.offsetWidth ||
          el.parentElement?.getBoundingClientRect().width ||
          400,
      );
    };

    measure();
    const frame = requestAnimationFrame(measure);

    const observer = new ResizeObserver(() => {
      measure();
    });
    observer.observe(el);
    window.addEventListener("resize", measure);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  useEffect(() => {
    if (
      !graphData ||
      !graphRef.current ||
      graphWidth <= 0 ||
      graphHeight <= 0
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      graphRef.current?.zoomToFit(350, 28);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [graphData, graphWidth, graphHeight]);

  useEffect(() => {
    Promise.all([
      fetch(`/api/entities/${entitySlug}`).then((r) => r.json()),
      fetch(`/api/links?entity_id=${entityId}&depth=2`).then((r) => r.json()),
    ]).then(([centerEntity, data]) => {
      const allNodes: GraphNode[] = [];
      const links: GraphLink[] = [];
      const seen = new Set<string>([entityId]);
      const seenNeighborKeys = new Set<string>();

      // Collect all 1-hop neighbors first
      const neighbors: Array<{
        id: string;
        name: string;
        type: string;
        slug: string;
        direction: "fwd" | "back";
      }> = [];

      const addNeighbor = (
        id: string,
        name: string,
        type: string,
        slug: string,
        direction: "fwd" | "back",
      ) => {
        const key = entityIdentityKey({ type, slug, name });
        if (seen.has(id) || seenNeighborKeys.has(key)) return;

        seen.add(id);
        seenNeighborKeys.add(key);
        neighbors.push({ id, name, type, slug, direction });
      };

      for (const link of data.forward || []) {
        addNeighbor(
          link.target_id,
          link.target_name,
          link.target_type,
          link.target_slug,
          "fwd",
        );
      }

      for (const link of data.backlinks || []) {
        addNeighbor(
          link.source_id,
          link.source_name,
          link.source_type,
          link.source_slug,
          "back",
        );
      }

      // Limit displayed 1-hop nodes
      const displayedNeighbors = neighbors.slice(0, MAX_DIRECT_NODES);
      const hiddenCount = neighbors.length - displayedNeighbors.length;
      setOverflow(hiddenCount);

      const displayedIds = new Set<string>();
      const displayedIdentityKeys = new Set<string>();
      const addDisplayedNode = (node: GraphNode) => {
        const key = entityIdentityKey(node);
        if (displayedIds.has(node.id) || displayedIdentityKeys.has(key)) {
          return false;
        }

        allNodes.push(node);
        displayedIds.add(node.id);
        displayedIdentityKeys.add(key);
        return true;
      };

      addDisplayedNode({
        id: entityId,
        name: centerEntity.name || entitySlug,
        type: entityType,
        slug: entitySlug,
        isCenter: true,
      });

      for (const n of displayedNeighbors) {
        addDisplayedNode({
          id: n.id,
          name: n.name,
          type: n.type,
          slug: n.slug,
        });
      }

      const linkKeys = new Set<string>();
      const addVisibleLink = (
        source: string,
        target: string,
        linkType: string,
      ) => {
        if (source === target) return;
        if (!displayedIds.has(source) || !displayedIds.has(target)) return;

        const key = `${source}:${target}:${linkType}`;
        if (linkKeys.has(key)) return;

        linkKeys.add(key);
        links.push({ source, target, link_type: linkType });
      };

      for (const link of data.forward || []) {
        addVisibleLink(entityId, link.target_id, link.link_type);
      }

      for (const link of data.backlinks || []) {
        addVisibleLink(link.source_id, entityId, link.link_type);
      }

      // 2-hop: only add if both endpoints are displayed
      for (const link of data.secondHopForward || []) {
        if (!seen.has(link.target_id)) {
          seen.add(link.target_id);
        }
        if (
          displayedIds.has(link.source_id) &&
          !displayedIds.has(link.target_id)
        ) {
          addDisplayedNode({
            id: link.target_id,
            name: link.target_name,
            type: link.target_type,
            slug: link.target_slug,
            isSecondHop: true,
          });
        }
        if (
          displayedIds.has(link.source_id) &&
          displayedIds.has(link.target_id)
        ) {
          addVisibleLink(link.source_id, link.target_id, link.link_type);
        }
      }

      for (const link of data.secondHopBacklinks || []) {
        if (!seen.has(link.source_id)) {
          seen.add(link.source_id);
        }
        if (
          displayedIds.has(link.target_id) &&
          !displayedIds.has(link.source_id)
        ) {
          addDisplayedNode({
            id: link.source_id,
            name: link.source_name,
            type: link.source_type,
            slug: link.source_slug,
            isSecondHop: true,
          });
        }
        if (
          displayedIds.has(link.source_id) &&
          displayedIds.has(link.target_id)
        ) {
          addVisibleLink(link.source_id, link.target_id, link.link_type);
        }
      }

      setGraphData({ nodes: allNodes, links });
      setLoading(false);
    });
  }, [entityId, entityType, entitySlug]);

  const nodeCanvasObject = useCallback(
    (node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const rawFontSize = node.isCenter ? 13 : node.isSecondHop ? 9 : 11;
      const fontSize = Math.min(rawFontSize / globalScale, 16);
      const baseRadius = node.isCenter ? 7 : node.isSecondHop ? 3.5 : 4.5;

      // Pulse animation for center node
      let radius = baseRadius;
      if (node.isCenter) {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        const pulse = Math.sin((elapsed * 2 * Math.PI) / 2) * 0.15 + 1; // 2s cycle, ±15%
        radius = baseRadius * pulse;
      }

      // Draw node circle
      ctx.beginPath();
      ctx.arc(node.x || 0, node.y || 0, radius, 0, 2 * Math.PI);
      ctx.fillStyle = TYPE_COLORS[node.type] || "#7a756d";
      ctx.globalAlpha = node.isSecondHop ? 0.5 : 1;
      ctx.fill();
      ctx.globalAlpha = 1;

      if (node.isCenter) {
        ctx.strokeStyle = isDark ? "#1e1c18" : "#ffffff";
        ctx.lineWidth = 1.5 / globalScale;
        ctx.stroke();

        // Add glow effect for center node
        const gradient = ctx.createRadialGradient(
          node.x || 0,
          node.y || 0,
          radius,
          node.x || 0,
          node.y || 0,
          radius * 2.5,
        );
        gradient.addColorStop(0, TYPE_COLORS[node.type] || "#7a756d");
        gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient;
        ctx.globalAlpha = 0.15;
        ctx.beginPath();
        ctx.arc(node.x || 0, node.y || 0, radius * 2.5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Draw label with background for readability
      const maxLabelLen = node.isCenter ? 20 : 14;
      const label = truncateLabel(node.name || node.id, maxLabelLen);
      ctx.font = `${node.isCenter ? 600 : 400} ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";

      const textX = node.x || 0;
      const textY = (node.y || 0) + radius + 2;

      // Semi-transparent background behind text
      const metrics = ctx.measureText(label);
      const textWidth = metrics.width;
      const textHeight = fontSize * 1.2;
      ctx.fillStyle = isDark ? "rgba(20,18,16,0.75)" : "rgba(247,245,240,0.85)";
      ctx.fillRect(
        textX - textWidth / 2 - 2,
        textY - 1,
        textWidth + 4,
        textHeight + 1,
      );

      ctx.fillStyle = labelColor;
      ctx.globalAlpha = node.isSecondHop ? 0.6 : 1;
      ctx.fillText(label, textX, textY);
      ctx.globalAlpha = 1;

      return undefined;
    },
    [isDark, labelColor],
  );

  const handleNodeClick = useCallback(
    (node: GraphNode) => {
      if (!node.isCenter) {
        router.push(`/${node.type}/${node.slug}`);
      }
    },
    [router],
  );

  if (loading) {
    return (
      <div
        ref={containerRef}
        className="h-[240px] rounded-xl animate-pulse flex items-center justify-center"
        style={{ backgroundColor: bgColor }}
      >
        <span className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
          加载关系图…
        </span>
      </div>
    );
  }

  if (!graphData || graphData.nodes.length <= 1) {
    return (
      <div
        ref={containerRef}
        className="h-[240px] rounded-xl flex flex-col items-center justify-center gap-3"
        style={{ backgroundColor: bgColor }}
      >
        <Graph
          size={32}
          weight="duotone"
          style={{ color: "var(--color-ink-muted)" }}
        />
        <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
          暂无关联数据
        </p>
      </div>
    );
  }

  const listedNodes = graphData.nodes.filter((node) => !node.isCenter);
  const legendTypes = Array.from(
    new Set(graphData.nodes.map((node) => node.type)),
  );

  return (
    <div className="space-y-3">
      <div
        ref={containerRef}
        data-testid="local-graph-canvas"
        className="rounded-xl overflow-hidden relative"
        style={{ backgroundColor: bgColor }}
      >
        <div
          className="absolute left-3 top-3 z-10 flex flex-wrap gap-2 rounded-lg border px-3 py-2 text-xs"
          style={{
            backgroundColor: isDark
              ? "rgba(20,18,16,0.82)"
              : "rgba(255,255,255,0.88)",
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
          key={`${graphWidth}x${graphHeight}`}
          ref={graphRef}
          graphData={graphData}
          width={graphWidth}
          height={graphHeight}
          backgroundColor={bgColor}
          nodeCanvasObject={nodeCanvasObject}
          nodePointerAreaPaint={(
            node: GraphNode,
            color: string,
            ctx: CanvasRenderingContext2D,
          ) => {
            const radius = node.isCenter ? 12 : node.isSecondHop ? 8 : 10;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(node.x || 0, node.y || 0, radius, 0, 2 * Math.PI);
            ctx.fill();
          }}
          onNodeClick={handleNodeClick}
          linkColor={() => linkColor}
          linkWidth={1}
          linkDirectionalArrowLength={3}
          linkDirectionalArrowRelPos={0.8}
          cooldownTicks={100}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.15}
          enablePanInteraction={false}
          enableNodeDrag={false}
          onEngineStop={() => graphRef.current?.zoomToFit(250, 28)}
        />
        {overflow > 0 && (
          <div
            className="absolute bottom-2 right-2 text-xs px-2 py-1 rounded-full"
            style={{
              backgroundColor: isDark
                ? "rgba(20,18,16,0.8)"
                : "rgba(247,245,240,0.9)",
              color: "var(--color-ink-muted)",
              border: "1px solid var(--color-border)",
            }}
          >
            还有 {overflow} 个关联未显示
          </div>
        )}
      </div>
      <div
        className="rounded-xl border p-3"
        style={{
          borderColor: "var(--color-border)",
          backgroundColor: "var(--color-surface-raised)",
        }}
      >
        <p
          className="mb-2 text-sm font-medium"
          style={{ color: "var(--color-ink)" }}
        >
          关系列表
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {listedNodes.slice(0, 12).map((node) => (
            <button
              key={node.id}
              type="button"
              onClick={() => handleNodeClick(node)}
              className="flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm"
              style={{
                borderColor: "var(--color-border-light)",
                color: "var(--color-ink-light)",
              }}
            >
              <span className="truncate">{node.name}</span>
              <span
                className="ml-3 shrink-0 text-xs"
                style={{ color: "var(--color-ink-muted)" }}
              >
                {TYPE_LABELS[node.type] || node.type}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
