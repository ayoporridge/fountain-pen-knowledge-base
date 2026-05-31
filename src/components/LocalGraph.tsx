"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ForceGraph2D from "react-force-graph-2d";

interface GraphNode {
  id: string;
  name: string;
  type: string;
  slug: string;
  isCenter?: boolean;
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

const TYPE_COLORS: Record<string, string> = {
  pen: "#22c55e",
  brand: "#3b82f6",
  concept: "#a855f7",
  material: "#f97316",
  nib: "#eab308",
  fill_system: "#14b8a6",
};

export function LocalGraph({
  entityId,
  entityType,
  entitySlug,
}: LocalGraphProps) {
  const router = useRouter();
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 300 });

  useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.offsetWidth,
        height: 300,
      });
    }
  }, []);

  useEffect(() => {
    fetch(`/api/links?entity_id=${entityId}`)
      .then((r) => r.json() as Promise<{
        forward: Array<{ target_id: string; target_name: string; target_type: string; target_slug: string; link_type: string }>;
        backlinks: Array<{ source_id: string; source_name: string; source_type: string; source_slug: string; link_type: string }>;
      }>)
      .then((data) => {
        const nodes: GraphNode[] = [
          {
            id: entityId,
            name: "",
            type: entityType,
            slug: entitySlug,
            isCenter: true,
          },
        ];
        const links: GraphLink[] = [];
        const seen = new Set<string>([entityId]);

        // Fetch center entity name
        fetch(`/api/entities/${entitySlug}`)
          .then((r) => r.json() as Promise<{ name: string }>)
          .then((e) => {
            nodes[0].name = e.name;
          });

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

        setGraphData({ nodes, links });
        setLoading(false);
      });
  }, [entityId, entityType, entitySlug]);

  const nodeCanvasObject = useCallback(
    (node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const label = node.name || node.id;
      const fontSize = node.isCenter ? 14 / globalScale : 12 / globalScale;
      const radius = node.isCenter ? 8 : 5;

      ctx.beginPath();
      ctx.arc(node.x || 0, node.y || 0, radius, 0, 2 * Math.PI);
      ctx.fillStyle = TYPE_COLORS[node.type] || "#888";
      ctx.fill();

      if (node.isCenter) {
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2 / globalScale;
        ctx.stroke();
      }

      ctx.font = `${fontSize}px Sans-Serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillStyle = document.documentElement.classList.contains("dark")
        ? "#e5e7eb"
        : "#374151";
      ctx.fillText(label, node.x || 0, (node.y || 0) + radius + 2);

      return undefined;
    },
    [],
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
      <div className="h-[300px] bg-gray-50 dark:bg-gray-800 rounded-lg animate-pulse flex items-center justify-center">
        <span className="text-sm text-gray-400">加载关系图...</span>
      </div>
    );
  }

  if (!graphData || graphData.nodes.length <= 1) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-50 dark:bg-gray-900"
    >
      <ForceGraph2D
        graphData={graphData}
        width={dimensions.width}
        height={dimensions.height}
        nodeCanvasObject={nodeCanvasObject}
        nodePointerAreaPaint={(node: GraphNode, color: string, ctx: CanvasRenderingContext2D) => {
          const radius = node.isCenter ? 8 : 5;
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(node.x || 0, node.y || 0, radius, 0, 2 * Math.PI);
          ctx.fill();
        }}
        onNodeClick={handleNodeClick}
        linkColor={() => "#94a3b8"}
        linkWidth={1.5}
        linkDirectionalArrowLength={4}
        linkDirectionalArrowRelPos={0.8}
        cooldownTicks={50}
        d3AlphaDecay={0.05}
      />
    </div>
  );
}
