"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 300 });

  const isDark = resolvedTheme === "dark";
  const labelColor = isDark ? "#e8e4dc" : "#1a1814";
  const linkColor = isDark ? "#2e2b26" : "#ddd8ce";
  const bgColor = isDark ? "#141210" : "#f7f5f0";

  useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.offsetWidth,
        height: 300,
      });
    }
  }, []);

  useEffect(() => {
    // Fetch center entity name + 2-hop links in parallel
    Promise.all([
      fetch(`/api/entities/${entitySlug}`).then((r) => r.json()),
      fetch(`/api/links?entity_id=${entityId}&depth=2`).then((r) => r.json()),
    ]).then(([centerEntity, data]) => {
      const nodes: GraphNode[] = [
        {
          id: entityId,
          name: centerEntity.name || entitySlug,
          type: entityType,
          slug: entitySlug,
          isCenter: true,
        },
      ];
      const links: GraphLink[] = [];
      const seen = new Set<string>([entityId]);

      // 1-hop forward links
      for (const link of data.forward || []) {
        if (!seen.has(link.target_id)) {
          seen.add(link.target_id);
          nodes.push({
            id: link.target_id,
            name: link.target_name,
            type: link.target_type,
            slug: link.target_slug,
          });
        }
        links.push({
          source: entityId,
          target: link.target_id,
          link_type: link.link_type,
        });
      }

      // 1-hop backlinks
      for (const link of data.backlinks || []) {
        if (!seen.has(link.source_id)) {
          seen.add(link.source_id);
          nodes.push({
            id: link.source_id,
            name: link.source_name,
            type: link.source_type,
            slug: link.source_slug,
          });
        }
        links.push({
          source: link.source_id,
          target: entityId,
          link_type: link.link_type,
        });
      }

      // 2-hop forward (neighbor → neighbor's target)
      for (const link of data.secondHopForward || []) {
        if (!seen.has(link.target_id)) {
          seen.add(link.target_id);
          nodes.push({
            id: link.target_id,
            name: link.target_name,
            type: link.target_type,
            slug: link.target_slug,
            isSecondHop: true,
          });
        }
        // Only add link if both ends are in our graph
        if (seen.has(link.source_id) && seen.has(link.target_id)) {
          links.push({
            source: link.source_id,
            target: link.target_id,
            link_type: link.link_type,
          });
        }
      }

      // 2-hop backlinks (neighbor's source → neighbor)
      for (const link of data.secondHopBacklinks || []) {
        if (!seen.has(link.source_id)) {
          seen.add(link.source_id);
          nodes.push({
            id: link.source_id,
            name: link.source_name,
            type: link.source_type,
            slug: link.source_slug,
            isSecondHop: true,
          });
        }
        if (seen.has(link.source_id) && seen.has(link.target_id)) {
          links.push({
            source: link.source_id,
            target: link.target_id,
            link_type: link.link_type,
          });
        }
      }

      setGraphData({ nodes, links });
      setLoading(false);
    });
  }, [entityId, entityType, entitySlug]);

  const nodeCanvasObject = useCallback(
    (node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
      // Don't draw labels until force simulation has settled
      if (!settled) return undefined;

      const label = node.name || node.id;
      const rawFontSize = node.isCenter ? 14 : node.isSecondHop ? 10 : 12;
      const fontSize = Math.min(rawFontSize / globalScale, 20);
      const radius = node.isCenter ? 8 : node.isSecondHop ? 4 : 5;

      ctx.beginPath();
      ctx.arc(node.x || 0, node.y || 0, radius, 0, 2 * Math.PI);
      ctx.fillStyle = TYPE_COLORS[node.type] || "#7a756d";
      ctx.globalAlpha = node.isSecondHop ? 0.6 : 1;
      ctx.fill();
      ctx.globalAlpha = 1;

      if (node.isCenter) {
        ctx.strokeStyle = isDark ? "#1e1c18" : "#ffffff";
        ctx.lineWidth = 2 / globalScale;
        ctx.stroke();
      }

      ctx.font = `500 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillStyle = labelColor;
      ctx.globalAlpha = node.isSecondHop ? 0.6 : 1;
      ctx.fillText(label, node.x || 0, (node.y || 0) + radius + 2);
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
        className="h-[300px] rounded-xl animate-pulse flex items-center justify-center"
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
        className="h-[300px] rounded-xl flex flex-col items-center justify-center gap-3"
        style={{ backgroundColor: bgColor }}
      >
        <Graph size={32} weight="duotone" style={{ color: "var(--color-ink-muted)" }} />
        <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
          暂无关联数据
        </p>
        <Link
          href={`/${entityType}/${entitySlug}/edit`}
          className="text-xs hover:underline underline-offset-4"
          style={{ color: "var(--color-accent)" }}
        >
          可通过编辑添加关系
        </Link>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="rounded-xl overflow-hidden"
      style={{ backgroundColor: bgColor }}
    >
      <ForceGraph2D
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
        linkWidth={1.5}
        linkDirectionalArrowLength={4}
        linkDirectionalArrowRelPos={0.8}
        cooldownTicks={50}
        d3AlphaDecay={0.05}
        onEngineStop={() => setSettled(true)}
      />
    </div>
  );
}
