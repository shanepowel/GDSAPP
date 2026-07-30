'use client';

import { useEffect, useRef, forwardRef, useImperativeHandle, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { Button } from '@/components/ui/Button';
import { ZoomIn, ZoomOut, Maximize2, Focus, Map as MapIcon } from 'lucide-react';
import type { DesignGraphEntity, DesignGraphRelationship } from '@/lib/org-design/types';

type Entity = DesignGraphEntity;
type Relationship = DesignGraphRelationship;

export type LayoutMode = 'force' | 'tree' | 'radial';

interface OrgChartProps {
  entities: Entity[];
  relationships: Relationship[];
  onEntitySelect: (entity: Entity | null) => void;
  selectedEntity: Entity | null;
  layout?: LayoutMode;
  readOnly?: boolean;
  height?: number;
}

export interface OrgChartHandle {
  exportSvg: () => string | null;
  exportPng: (scale?: number, opts?: ExportImageOpts) => Promise<string | null>;
  exportPdf: (opts?: ExportImageOpts) => Promise<Blob | null>;
}

export interface ExportImageOpts {
  title?: string;
  footer?: string;
}

const TYPE_COLORS: Record<string, string> = {
  circle: '#003cb4',
  role: '#1e7a46',
  product: '#b26a00',
};

interface HNode {
  id: string;
  name: string;
  data: Entity | null;
  children: HNode[];
}

function buildHierarchy(entities: Entity[], relationships: Relationship[]): HNode {
  const includesMap = new Map<string, string>();
  relationships.filter(r => r.type === "includes").forEach(r => {
    includesMap.set(r.targetId, r.sourceId);
  });
  const hierarchyMap = new Map<string, string | null>();
  for (const e of entities) {
    hierarchyMap.set(e.id, e.parentId || includesMap.get(e.id) || null);
  }
  const idSet = new Set(entities.map(e => e.id));
  const roots: Entity[] = [];
  const childrenOf = new Map<string, Entity[]>();
  for (const e of entities) {
    const parent = hierarchyMap.get(e.id);
    if (parent && idSet.has(parent)) {
      if (!childrenOf.has(parent)) childrenOf.set(parent, []);
      childrenOf.get(parent)!.push(e);
    } else {
      roots.push(e);
    }
  }
  if (!roots.length && entities.length) roots.push(entities[0]);
  function build(node: Entity, visited = new Set<string>()): HNode {
    if (visited.has(node.id)) return { id: node.id, name: node.name, data: node, children: [] };
    visited.add(node.id);
    return {
      id: node.id,
      name: node.name,
      data: node,
      children: (childrenOf.get(node.id) || []).map(c => build(c, visited)),
    };
  }
  if (roots.length === 1) return build(roots[0]);
  return { id: "__virtual__", name: "Organization", data: null, children: roots.map(r => build(r)) };
}

// Build the set of entity ids in the selected entity's subtree (children via parentId or includes-relationships)
function computeSubtreeIds(rootId: string, entities: Entity[], relationships: Relationship[]): Set<string> {
  const childrenOf = new Map<string, Set<string>>();
  for (const e of entities) {
    if (e.parentId) {
      if (!childrenOf.has(e.parentId)) childrenOf.set(e.parentId, new Set());
      childrenOf.get(e.parentId)!.add(e.id);
    }
  }
  for (const r of relationships) {
    if (r.type === "includes") {
      if (!childrenOf.has(r.sourceId)) childrenOf.set(r.sourceId, new Set());
      childrenOf.get(r.sourceId)!.add(r.targetId);
    }
  }
  const subtree = new Set<string>([rootId]);
  const queue: string[] = [rootId];
  while (queue.length) {
    const cur = queue.shift()!;
    const kids = childrenOf.get(cur);
    if (!kids) continue;
    kids.forEach(k => {
      if (!subtree.has(k)) {
        subtree.add(k);
        queue.push(k);
      }
    });
  }
  return subtree;
}

interface PositionedNode { id: string; x: number; y: number; type: string; }

const OrgChart = forwardRef<OrgChartHandle, OrgChartProps>(function OrgChart(
  { entities, relationships, onEntitySelect, selectedEntity, layout = "force", readOnly, height = 600 },
  ref,
) {
  const svgRef = useRef<SVGSVGElement>(null);
  const minimapRef = useRef<SVGSVGElement>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const positionsRef = useRef<PositionedNode[]>([]);
  const transformRef = useRef<d3.ZoomTransform>(d3.zoomIdentity);
  const [focusMode, setFocusMode] = useState(false);
  const [showMinimap, setShowMinimap] = useState(true);

  const focusIds = useMemo(() => {
    if (!focusMode || !selectedEntity) return null;
    return computeSubtreeIds(selectedEntity.id, entities, relationships);
  }, [focusMode, selectedEntity, entities, relationships]);

  const exportSvgImpl = (): string | null => {
    if (!svgRef.current) return null;
    const clone = svgRef.current.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const allText = clone.querySelectorAll("text");
    allText.forEach(t => t.setAttribute("fill", t.getAttribute("fill") === "currentColor" ? "#374151" : (t.getAttribute("fill") || "#374151")));
    const allStrokes = clone.querySelectorAll("[stroke='currentColor']");
    allStrokes.forEach(s => s.setAttribute("stroke", "#9ca3af"));
    const serializer = new XMLSerializer();
    return serializer.serializeToString(clone);
  };

  const renderToCanvas = async (scale: number, opts?: ExportImageOpts): Promise<HTMLCanvasElement | null> => {
    if (!svgRef.current) return null;
    const svgString = exportSvgImpl();
    if (!svgString) return null;
    const w = svgRef.current.clientWidth || 800;
    const h = svgRef.current.clientHeight || 600;
    const headerH = opts?.title ? 56 : 0;
    const footerH = opts?.footer ? 32 : 0;
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    try {
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load SVG image"));
        img.src = url;
      });
      const canvas = document.createElement("canvas");
      canvas.width = w * scale;
      canvas.height = (h + headerH + footerH) * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      ctx.scale(scale, scale);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h + headerH + footerH);
      if (opts?.title) {
        ctx.fillStyle = "#111827";
        ctx.font = "600 22px system-ui, -apple-system, sans-serif";
        ctx.textBaseline = "middle";
        ctx.fillText(opts.title, 24, headerH / 2);
      }
      ctx.drawImage(img, 0, headerH, w, h);
      if (opts?.footer) {
        ctx.fillStyle = "#6b7280";
        ctx.font = "12px system-ui, -apple-system, sans-serif";
        ctx.textBaseline = "middle";
        ctx.fillText(opts.footer, 24, h + headerH + footerH / 2);
      }
      return canvas;
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  useImperativeHandle(ref, () => ({
    exportSvg: exportSvgImpl,
    exportPng: async (scale = 2, opts) => {
      const canvas = await renderToCanvas(scale, opts);
      return canvas ? canvas.toDataURL("image/png") : null;
    },
    exportPdf: async () => {
      // PDF export requires jspdf; PNG/SVG remain available without it.
      return null;
    },
  }));

  useEffect(() => {
    if (!svgRef.current || !entities.length) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    const width = 800;
    svg.attr("viewBox", `0 0 ${width} ${height}`).attr("preserveAspectRatio", "xMidYMid meet");

    const defs = svg.append("defs");
    Object.entries({
      "arrow-includes": "#a855f7",
      "arrow-reports-to": "#f97316",
      "arrow-collaborates-with": "#06b6d4",
      "arrow-default": "#9ca3af",
    }).forEach(([id, color]) => {
      defs.append("marker")
        .attr("id", id).attr("viewBox", "0 -5 10 10")
        .attr("refX", 28).attr("refY", 0)
        .attr("markerWidth", 6).attr("markerHeight", 6)
        .attr("orient", "auto").append("path")
        .attr("d", "M0,-5L10,0L0,5").attr("fill", color);
    });

    const container = svg.append("g").attr("class", "zoom-container");
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 4])
      .on("zoom", (event) => {
        container.attr("transform", event.transform.toString());
        transformRef.current = event.transform;
        renderMinimap();
      });
    zoomBehaviorRef.current = zoom;
    svg.call(zoom);

    const entityIds = new Set(entities.map(e => e.id));
    const validRelationships = relationships.filter(r => entityIds.has(r.sourceId) && entityIds.has(r.targetId));

    const linkColor = (d: Relationship) => {
      switch (d.type) {
        case "includes": return "#a855f7";
        case "reports-to": return "#f97316";
        case "collaborates-with": return "#06b6d4";
        default: return "#9ca3af";
      }
    };

    const isInFocus = (id: string): boolean => !focusIds || focusIds.has(id);
    const nodeOpacity = (id: string) => (isInFocus(id) ? 1 : 0.18);
    const linkOpacity = (l: Relationship) => (isInFocus(l.sourceId) && isInFocus(l.targetId) ? 0.7 : 0.08);

    const updatePositionsForMinimap = (sourceNodes: Array<{ id: string; x?: number | null; y?: number | null; type: string }>) => {
      positionsRef.current = sourceNodes
        .map(n => (typeof n.x === "number" && typeof n.y === "number"
          ? { id: n.id, x: n.x, y: n.y, type: n.type }
          : null))
        .filter((v): v is PositionedNode => v !== null);
      renderMinimap();
    };

    const renderNodes = (positions: Map<string, { x: number; y: number }>) => {
      const linkData = validRelationships.map(r => ({
        ...r,
        s: positions.get(r.sourceId)!,
        t: positions.get(r.targetId)!,
      })).filter(l => l.s && l.t);

      container.append("g").attr("class", "links")
        .selectAll("line").data(linkData).enter().append("line")
        .attr("stroke", (d) => linkColor(d as unknown as Relationship))
        .attr("stroke-opacity", (d) => linkOpacity(d as unknown as Relationship))
        .attr("stroke-width", 2)
        .attr("marker-end", (d) => `url(#arrow-${(d as Relationship).type || "default"})`)
        .attr("x1", (d) => d.s.x).attr("y1", (d) => d.s.y)
        .attr("x2", (d) => d.t.x).attr("y2", (d) => d.t.y);

      const node = container.append("g").attr("class", "nodes")
        .selectAll("g").data(entities).enter().append("g")
        .attr("class", "entity").style("cursor", readOnly ? "default" : "pointer")
        .attr("opacity", (d) => nodeOpacity(d.id))
        .attr("transform", (d) => {
          const p = positions.get(d.id);
          return p ? `translate(${p.x}, ${p.y})` : "translate(0,0)";
        });

      node.append("circle")
        .attr("r", (d) => d.type === "circle" ? 28 : d.type === "role" ? 22 : 18)
        .attr("fill", (d) => TYPE_COLORS[d.type] || "#6B7280")
        .attr("stroke", (d) => selectedEntity?.id === d.id ? "#EF4444" : "currentColor")
        .attr("stroke-width", (d) => selectedEntity?.id === d.id ? 4 : 2)
        .attr("stroke-opacity", (d) => selectedEntity?.id === d.id ? 1 : 0.4);

      node.append("text").text((d) => d.name)
        .attr("x", 0).attr("y", 42).attr("text-anchor", "middle")
        .attr("font-size", "12px").attr("font-weight", "600").attr("fill", "currentColor");

      node.append("text").text((d) => d.type)
        .attr("x", 0).attr("y", -34).attr("text-anchor", "middle")
        .attr("font-size", "10px").attr("fill", "currentColor").attr("opacity", 0.6);

      node.append("title").text((d) => d.purpose || d.name);

      if (!readOnly) {
        node.on("click", (event, d) => {
          event.stopPropagation();
          onEntitySelect(d as Entity);
        });
      }

      positionsRef.current = entities.map(e => {
        const p = positions.get(e.id);
        return p ? { id: e.id, x: p.x, y: p.y, type: e.type } : null;
      }).filter((v): v is PositionedNode => v !== null);
      renderMinimap();
    };

    if (layout === "force") {
      type SimNode = Entity & d3.SimulationNodeDatum;
      const simNodes = entities.map(e => ({ ...e })) as SimNode[];
      const links = validRelationships.map(rel => ({
        ...rel, source: rel.sourceId, target: rel.targetId,
      }));
      const sim = d3.forceSimulation<SimNode>(simNodes)
        .force("link", d3.forceLink<SimNode, d3.SimulationLinkDatum<SimNode>>(links as unknown as d3.SimulationLinkDatum<SimNode>[]).id((d) => d.id).distance(120))
        .force("charge", d3.forceManyBody().strength(-400))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide().radius(60));

      const link = container.append("g").attr("class", "links")
        .selectAll("line").data(links).enter().append("line")
        .attr("stroke", (d) => linkColor(d as unknown as Relationship))
        .attr("stroke-opacity", (d) => linkOpacity(d as unknown as Relationship))
        .attr("stroke-width", 2)
        .attr("marker-end", (d) => `url(#arrow-${(d as unknown as Relationship).type || "default"})`);

      const node = container.append("g").attr("class", "nodes")
        .selectAll("g").data(simNodes).enter().append("g")
        .attr("class", "entity").style("cursor", readOnly ? "default" : "pointer")
        .attr("opacity", (d) => nodeOpacity(d.id));

      if (!readOnly) {
        node.call(d3.drag<SVGGElement, SimNode>()
          .on("start", (event, d) => {
            if (!event.active) sim.alphaTarget(0.3).restart();
            d.fx = d.x; d.fy = d.y;
          })
          .on("drag", (event, d) => { d.fx = event.x; d.fy = event.y; })
          .on("end", (event, d) => {
            if (!event.active) sim.alphaTarget(0);
            d.fx = null; d.fy = null;
          }));
      }

      node.append("circle")
        .attr("r", (d) => d.type === "circle" ? 28 : d.type === "role" ? 22 : 18)
        .attr("fill", (d) => TYPE_COLORS[d.type] || "#6B7280")
        .attr("stroke", (d) => selectedEntity?.id === d.id ? "#EF4444" : "currentColor")
        .attr("stroke-width", (d) => selectedEntity?.id === d.id ? 4 : 2)
        .attr("stroke-opacity", (d) => selectedEntity?.id === d.id ? 1 : 0.4);

      node.append("text").text((d) => d.name)
        .attr("x", 0).attr("y", 42).attr("text-anchor", "middle")
        .attr("font-size", "12px").attr("font-weight", "600").attr("fill", "currentColor");
      node.append("text").text((d) => d.type)
        .attr("x", 0).attr("y", -34).attr("text-anchor", "middle")
        .attr("font-size", "10px").attr("fill", "currentColor").attr("opacity", 0.6);
      node.append("title").text((d) => d.purpose || d.name);

      if (!readOnly) {
        node.on("click", (event, d) => {
          event.stopPropagation();
          onEntitySelect(d as Entity);
        });
      }

      sim.on("tick", () => {
        type LinkPos = { source: { x: number; y: number }; target: { x: number; y: number } };
        link
          .attr("x1", (d) => (d as unknown as LinkPos).source.x)
          .attr("y1", (d) => (d as unknown as LinkPos).source.y)
          .attr("x2", (d) => (d as unknown as LinkPos).target.x)
          .attr("y2", (d) => (d as unknown as LinkPos).target.y);
        node.attr("transform", (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
        updatePositionsForMinimap(simNodes);
      });

      svg.on("click", () => onEntitySelect(null));
      return () => { sim.stop(); };
    }

    const root = d3.hierarchy(buildHierarchy(entities, validRelationships));
    const positions = new Map<string, { x: number; y: number }>();

    if (layout === "tree") {
      const treeLayout = d3.tree<HNode>().size([width - 80, height - 100]);
      treeLayout(root as d3.HierarchyNode<HNode>);
      root.descendants().forEach((d) => {
        const node = d as d3.HierarchyPointNode<HNode>;
        if (node.data.id !== "__virtual__") positions.set(node.data.id, { x: node.x + 40, y: node.y + 50 });
      });
    } else {
      const radius = Math.min(width, height) / 2 - 40;
      const treeLayout = d3.tree<HNode>()
        .size([2 * Math.PI, radius])
        .separation((a, b) => (a.parent === b.parent ? 1 : 2) / Math.max(a.depth, 1));
      treeLayout(root as d3.HierarchyNode<HNode>);
      root.descendants().forEach((d) => {
        const node = d as d3.HierarchyPointNode<HNode>;
        if (node.data.id !== "__virtual__") {
          const r = node.y; const a = node.x - Math.PI / 2;
          positions.set(node.data.id, { x: width / 2 + r * Math.cos(a), y: height / 2 + r * Math.sin(a) });
        }
      });
    }
    entities.forEach((e, i) => {
      if (!positions.has(e.id)) positions.set(e.id, { x: 80 + (i % 8) * 80, y: height - 60 });
    });

    renderNodes(positions);
    svg.on("click", () => onEntitySelect(null));
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entities, relationships, selectedEntity, onEntitySelect, layout, readOnly, height, focusIds]);

  function renderMinimap() {
    if (!minimapRef.current || !showMinimap) return;
    const positions = positionsRef.current;
    if (!positions.length) return;
    const mm = d3.select(minimapRef.current);
    mm.selectAll("*").remove();
    const xs = positions.map(p => p.x);
    const ys = positions.map(p => p.y);
    const minX = Math.min(...xs) - 40;
    const maxX = Math.max(...xs) + 40;
    const minY = Math.min(...ys) - 40;
    const maxY = Math.max(...ys) + 40;
    mm.attr("viewBox", `${minX} ${minY} ${maxX - minX} ${maxY - minY}`).attr("preserveAspectRatio", "xMidYMid meet");
    mm.append("g").attr("class", "mm-nodes")
      .selectAll("circle").data(positions).enter().append("circle")
      .attr("cx", d => d.x).attr("cy", d => d.y)
      .attr("r", d => d.type === "circle" ? 12 : d.type === "role" ? 10 : 8)
      .attr("fill", d => TYPE_COLORS[d.type] || "#6B7280")
      .attr("opacity", 0.85);
    const t = transformRef.current;
    const viewW = 800 / t.k;
    const viewH = height / t.k;
    const viewX = -t.x / t.k;
    const viewY = -t.y / t.k;
    mm.append("rect")
      .attr("x", viewX).attr("y", viewY).attr("width", viewW).attr("height", viewH)
      .attr("fill", "none").attr("stroke", "#ef4444").attr("stroke-width", 4).attr("stroke-dasharray", "4,4");
  }

  useEffect(() => { renderMinimap(); }, [showMinimap, height]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleZoomIn = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().call(zoomBehaviorRef.current.scaleBy, 1.3);
    }
  };
  const handleZoomOut = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().call(zoomBehaviorRef.current.scaleBy, 0.7);
    }
  };
  const handleResetZoom = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
    }
  };

  if (!entities.length) {
    return (
      <div className="flex items-center justify-center h-96 text-muted-foreground">
        <div className="text-center">
          <p className="font-medium">No entities to display</p>
          <p className="text-sm mt-2">Create your first entity or load a template to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="relative">
        <svg
          ref={svgRef}
          className="w-full border rounded-md bg-muted/20"
          style={{ height: `${height}px` }}
          data-testid="org-chart-svg"
        />
        <div className="absolute right-2 top-2 flex flex-col gap-1 rounded-md border border-border bg-surface/90 p-1 backdrop-blur-sm">
          <Button
            variant="secondary"
            size="sm"
            className="!h-9 !w-9 !px-0"
            onClick={handleZoomIn}
            aria-label="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="!h-9 !w-9 !px-0"
            onClick={handleZoomOut}
            aria-label="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="!h-9 !w-9 !px-0"
            onClick={handleResetZoom}
            aria-label="Reset zoom"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button
            variant={focusMode ? 'primary' : 'secondary'}
            size="sm"
            className="!h-9 !w-9 !px-0"
            onClick={() => setFocusMode((v) => !v)}
            aria-label="Focus mode"
            aria-pressed={focusMode}
          >
            <Focus className="h-4 w-4" />
          </Button>
          <Button
            variant={showMinimap ? 'primary' : 'secondary'}
            size="sm"
            className="!h-9 !w-9 !px-0"
            onClick={() => setShowMinimap((v) => !v)}
            aria-label="Toggle mini-map"
            aria-pressed={showMinimap}
          >
            <MapIcon className="h-4 w-4" />
          </Button>
        </div>
        {showMinimap && (
          <div
            className="absolute bottom-2 right-2 h-32 w-40 rounded-md border border-border bg-surface/90 p-1"
            data-testid="org-chart-minimap"
          >
            <svg ref={minimapRef} className="h-full w-full" />
          </div>
        )}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-text">
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 rounded-full bg-blue-500" />
          <span>Circle</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 rounded-full bg-green-500" />
          <span>Role</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 rounded-full bg-yellow-500" />
          <span>Product</span>
        </div>
        <div className="ml-auto text-xs text-text-muted">
          {focusMode && selectedEntity
            ? "Focus: showing the selected entity's subtree"
            : layout === 'force'
              ? 'Drag nodes to reposition · Scroll to zoom · Click to select'
              : 'Scroll to zoom · Click to select'}
        </div>
      </div>
    </div>
  );
});

export default OrgChart;
