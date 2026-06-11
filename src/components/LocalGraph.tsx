"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import ForceGraph2D from "react-force-graph-2d";
import { Graph } from "@phosphor-icons/react/dist/ssr";
import { TYPE_COLORS } from "@/lib/constants";

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

const MAX_DIRECT_NODES = 12;

export function LocalGraph({
  entityId,
  entityType,
  entitySlug,
}: LocalGraphProps) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [settled, setSettled] = useState(false);
  const [overflow, setOverflow] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 450 });
  const graphRef = useRef<any>(null);

  const isDark = resolvedTheme === "dark";
  const labelColor = isDark ? "#e8e4dc" : "#1a1814";
  const linkColor = isDark ? "#2e2b26" : "#ddd8ce";
  const bgColor = isDark ? "#141210" : "#f7f5f0";

  useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.offsetWidth,
        height: 450,
      });
    }
  }, []);

  useEffect(() => {
    Promise.all([
      fetch(`/api/entities/${entitySlug}`).then((r) => r.json()),
      fetch(`/api/links?entity_id=${entityId}&depth=2`).then((r) => r.json()),
    ]).then(([centerEntity, data]) => {
      const allNodes: GraphNode[] = [];
      const links: GraphLink[] = [];
      const seen = new Set<string>([entityId]);

      // Collect all 1-hop neighbors first
      const neighbors: Array<{ id: string; name: string; type: string; slug: string; direction: "fwd" | "back" }> = [];

      for (const link of data.forward || []) {
        if (!seen.has(link.target_id)) {
          seen.add(link.target_id);
          neighbors.push({
            id: link.target_id,
            name: link.target_name,
            type: link.target_type,
            slug: link.target_slug,
            direction: "fwd",
          });
        }
        links.push({ source: entityId, target: link.target_id, link_type: link.link_type });
      }

      for (const link of data.backlinks || []) {
        if (!seen.has(link.source_id)) {
          seen.add(link.source_id);
          neighbors.push({
            id: link.source_id,
            name: link.source_name,
            type: link.source_type,
            slug: link.source_slug,
            direction: "back",
          });
        }
        links.push({ source: link.source_id, target: entityId, link_type: link.link_type });
      }

      // Limit displayed 1-hop nodes
      const displayedNeighbors = neighbors.slice(0, MAX_DIRECT_NODES);
      const hiddenCount = neighbors.length - displayedNeighbors.length;
      setOverflow(hiddenCount);

      // Center node
      allNodes.push({
        id: entityId,
        name: centerEntity.name || entitySlug,
        type: entityType,
        slug: entitySlug,
        isCenter: true,
      });

      // Add displayed 1-hop nodes
      const displayedIds = new Set<string>([entityId]);
      for (const n of displayedNeighbors) {
        allNodes.push({ id: n.id, name: n.name, type: n.type, slug: n.slug });
        displayedIds.add(n.id);
      }

      // 2-hop: only add if both endpoints are displayed
      for (const link of data.secondHopForward || []) {
        if (!seen.has(link.target_id)) {
          seen.add(link.target_id);
        }
        if (displayedIds.has(link.source_id) && !displayedIds.has(link.target_id)) {
          allNodes.push({
            id: link.target_id,
            name: link.target_name,
            type: link.target_type,
            slug: link.target_slug,
            isSecondHop: true,
          });
          displayedIds.add(link.target_id);
        }
        if (displayedIds.has(link.source_id) && displayedIds.has(link.target_id)) {
          links.push({ source: link.source_id, target: link.target_id, link_type: link.link_type });
        }
      }

      for (const link of data.secondHopBacklinks || []) {
        if (!seen.has(link.source_id)) {
          seen.add(link.source_id);
        }
        if (displayedIds.has(link.target_id) && !displayedIds.has(link.source_id)) {
          allNodes.push({
            id: link.source_id,
            name: link.source_name,
            type: link.source_type,
            slug: link.source_slug,
            isSecondHop: true,
          });
          displayedIds.add(link.source_id);
        }
        if (displayedIds.has(link.source_id) && displayedIds.has(link.target_id)) {
          links.push({ source: link.source_id, target: link.target_id, link_type: link.link_type });
        }
      }

      setGraphData({ nodes: allNodes, links });
      setLoading(false);
    });
  }, [entityId, entityType, entitySlug]);

  // After settling, zoom to fit
  useEffect(() => {
    if (settled && graphRef.current) {
      setTimeout(() => {
        graphRef.current?.zoomToFit(400, 40);
      }, 100);
    }
  }, [settled]);

  const truncateLabel = (name: string, maxLen: number) => {
    if (name.length <= maxLen) return name;
    return name.slice(0, maxLen - 1) + "…";
  };

  const nodeCanvasObject = useCallback(
    (node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
      if (!settled) return undefined;

      const rawFontSize = node.isCenter ? 13 : node.isSecondHop ? 9 : 11;
      const fontSize = Math.min(rawFontSize / globalScale, 16);
      const radius = node.isCenter ? 7 : node.isSecondHop ? 3.5 : 4.5;

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
      ctx.fillRect(textX - textWidth / 2 - 2, textY - 1, textWidth + 4, textHeight + 1);

      ctx.fillStyle = labelColor;
      ctx.globalAlpha = node.isSecondHop ? 0.6 : 1;
      ctx.fillText(label, textX, textY);
      ctx.globalAlpha = 1;

      return undefined;
    },
    [isDark, labelColor, settled],
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
        className="h-[450px] rounded-xl animate-pulse flex items-center justify-center"
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
        className="h-[450px] rounded-xl flex flex-col items-center justify-center gap-3"
        style={{ backgroundColor: bgColor }}
      >
        <Graph size={32} weight="duotone" style={{ color: "var(--color-ink-muted)" }} />
        <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
          暂无关联数据
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="rounded-xl overflow-hidden relative"
      style={{ backgroundColor: bgColor }}
    >
      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor={bgColor}
        nodeCanvasObject={nodeCanvasObject}
        nodePointerAreaPaint={(node: GraphNode, color: string, ctx: CanvasRenderingContext2D) => {
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
        onEngineStop={() => setSettled(true)}
      />
      {overflow > 0 && (
        <div
          className="absolute bottom-2 right-2 text-xs px-2 py-1 rounded-full"
          style={{
            backgroundColor: isDark ? "rgba(20,18,16,0.8)" : "rgba(247,245,240,0.9)",
            color: "var(--color-ink-muted)",
            border: "1px solid var(--color-border)",
          }}
        >
          还有 {overflow} 个关联未显示
        </div>
      )}
    </div>
  );
}
