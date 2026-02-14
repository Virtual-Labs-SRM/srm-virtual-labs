import { useRef, useState, useCallback, useEffect } from 'react';
import { Graph } from '@/types/graph';
import { AStarState } from '@/hooks/useEnhancedAStar';
import { EditMode } from '@/components/dfs/GraphCanvas';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface EnhancedAStarCanvasProps {
  graph: Graph;
  astarState: AStarState;
  startNode: string | null;
  goalNode: string | null;
  onNodeClick: (nodeId: string) => void;
  editMode: EditMode;
  edgeStartNode: string | null;
  onCanvasClick: (x: number, y: number) => void;
  onNodeDrag: (nodeId: string, x: number, y: number) => void;
  onEdgeNodeSelect: (nodeId: string) => void;
  onNodeDelete: (nodeId: string) => void;
  disabled: boolean;
}

export function EnhancedAStarCanvas({
  graph,
  astarState,
  startNode,
  goalNode,
  onNodeClick,
  editMode,
  edgeStartNode,
  onCanvasClick,
  onNodeDrag,
  onEdgeNodeSelect,
  onNodeDelete,
  disabled,
}: EnhancedAStarCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [dragState, setDragState] = useState<{
    nodeId: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  // Base viewBox dimensions
  const baseWidth = 600;
  const baseHeight = 500;

  const getSvgPoint = useCallback((clientX: number, clientY: number) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    const viewBox = svg.viewBox.baseVal;
    const scaleX = viewBox.width / rect.width;
    const scaleY = viewBox.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX - pan.x,
      y: (clientY - rect.top) * scaleY - pan.y,
    };
  }, [pan]);

  const handleMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    if (disabled) return;
    if (editMode === 'delete') {
      e.preventDefault();
      e.stopPropagation();
      onNodeDelete(nodeId);
      return;
    }
    if (editMode === 'addEdge') {
      e.preventDefault();
      e.stopPropagation();
      onEdgeNodeSelect(nodeId);
      return;
    }
    if (editMode === 'none') {
      e.preventDefault();
      const point = getSvgPoint(e.clientX, e.clientY);
      const node = graph.nodes.find(n => n.id === nodeId);
      if (node) {
        setDragState({
          nodeId,
          offsetX: point.x - node.x,
          offsetY: point.y - node.y,
        });
      }
    }
  }, [disabled, editMode, getSvgPoint, graph.nodes, onNodeDelete, onEdgeNodeSelect]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning && !dragState) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
      return;
    }
    if (!dragState || disabled) return;
    const point = getSvgPoint(e.clientX, e.clientY);
    const newX = Math.max(30, Math.min(570, point.x - dragState.offsetX));
    const newY = Math.max(30, Math.min(470, point.y - dragState.offsetY));
    onNodeDrag(dragState.nodeId, newX, newY);
  }, [dragState, disabled, getSvgPoint, onNodeDrag, isPanning, panStart]);

  const handleMouseUp = useCallback(() => {
    setDragState(null);
    setIsPanning(false);
  }, []);

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as Element).tagName === 'svg' || (e.target as Element).tagName === 'rect') {
      if (editMode === 'none' && e.button === 0) {
        setIsPanning(true);
        setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      }
    }
  }, [editMode, pan]);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    if ((e.target as Element).tagName === 'svg' || (e.target as Element).tagName === 'rect') {
      if (editMode === 'addNode') {
        const point = getSvgPoint(e.clientX, e.clientY);
        onCanvasClick(point.x, point.y);
      }
    }
  }, [disabled, editMode, getSvgPoint, onCanvasClick]);

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setDragState(null);
      setIsPanning(false);
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  const handleZoomIn = () => setZoom(z => Math.min(z * 1.2, 2));
  const handleZoomOut = () => setZoom(z => Math.max(z / 1.2, 0.5));
  const handleReset = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  const getNodeState = (nodeId: string) => {
    if (nodeId === startNode) return 'start';
    if (nodeId === goalNode) return 'goal';
    if (astarState.path.includes(nodeId)) return 'path';
    if (astarState.currentNode === nodeId) return 'current';
    if (astarState.closedSet.has(nodeId)) return 'closed';
    if (astarState.openSet.includes(nodeId)) return 'open';
    return 'unvisited';
  };

  const isInPath = (from: string, to: string) => {
    const path = astarState.path;
    for (let i = 0; i < path.length - 1; i++) {
      if ((path[i] === from && path[i + 1] === to) || (path[i] === to && path[i + 1] === from)) {
        return true;
      }
    }
    return false;
  };

  const getNodePosition = (nodeId: string) => {
    const node = graph.nodes.find(n => n.id === nodeId);
    return node ? { x: node.x, y: node.y } : { x: 0, y: 0 };
  };

  // Calculate viewBox based on zoom and pan
  const viewBoxX = -pan.x / zoom;
  const viewBoxY = -pan.y / zoom;
  const viewBoxWidth = baseWidth / zoom;
  const viewBoxHeight = baseHeight / zoom;

  // Calculate edge weight
  const getEdgeWeight = (from: string, to: string) => {
    const fromNode = graph.nodes.find(n => n.id === from);
    const toNode = graph.nodes.find(n => n.id === to);
    if (!fromNode || !toNode) return 0;
    return Math.sqrt(Math.pow(fromNode.x - toNode.x, 2) + Math.pow(fromNode.y - toNode.y, 2)) / 10;
  };

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[500px]">
      {/* Zoom Controls */}
      <div className="absolute top-2 right-2 flex gap-1 z-10">
        <Button size="icon" variant="outline" className="h-7 w-7" onClick={handleZoomIn}>
          <ZoomIn className="h-3 w-3" />
        </Button>
        <Button size="icon" variant="outline" className="h-7 w-7" onClick={handleZoomOut}>
          <ZoomOut className="h-3 w-3" />
        </Button>
        <Button size="icon" variant="outline" className="h-7 w-7" onClick={handleReset}>
          <RotateCcw className="h-3 w-3" />
        </Button>
      </div>

      {/* Step Counter Overlay - Moved outside SVG */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none">
        <Badge variant="secondary" className="backdrop-blur-md bg-background/50 border border-neutral-300 shadow-sm w-fit text-xs text-black">
          Steps: {astarState.path.length > 0 ? astarState.path.length : astarState.closedSet.size}
        </Badge>
      </div>

      <svg
        ref={svgRef}
        className="w-full h-full"
        viewBox={`${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ cursor: disabled ? 'not-allowed' : isPanning ? 'grabbing' : dragState ? 'grabbing' : editMode === 'addNode' ? 'crosshair' : 'grab' }}
        onClick={handleCanvasClick}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <rect x={viewBoxX} y={viewBoxY} width={viewBoxWidth} height={viewBoxHeight} className="fill-background" />


        {/* Grid */}
        {editMode !== 'none' && (
          <g opacity="0.1">
            {Array.from({ length: 20 }, (_, i) => (
              <line key={`v${i}`} x1={i * 50} y1={0} x2={i * 50} y2={baseHeight} className="stroke-foreground" strokeWidth="1" />
            ))}
            {Array.from({ length: 15 }, (_, i) => (
              <line key={`h${i}`} x1={0} y1={i * 50} x2={baseWidth} y2={i * 50} className="stroke-foreground" strokeWidth="1" />
            ))}
          </g>
        )}

        {/* Edges with weights */}
        {graph.edges.map((edge, index) => {
          const fromPos = getNodePosition(edge.from);
          const toPos = getNodePosition(edge.to);
          const inPath = isInPath(edge.from, edge.to);
          const weight = getEdgeWeight(edge.from, edge.to);
          const midX = (fromPos.x + toPos.x) / 2;
          const midY = (fromPos.y + toPos.y) / 2;

          return (
            <g key={`edge-${index}`}>
              <line
                x1={fromPos.x}
                y1={fromPos.y}
                x2={toPos.x}
                y2={toPos.y}
                className={`transition-all duration-300 ${inPath ? 'stroke-primary stroke-[4]' : 'stroke-border stroke-2'
                  }`}
              />
              {/* Edge weight label */}
              <rect
                x={midX - 12}
                y={midY - 8}
                width="24"
                height="16"
                rx="3"
                className={inPath ? 'fill-primary' : 'fill-muted'}
              />
              <text
                x={midX}
                y={midY + 4}
                textAnchor="middle"
                className={`text-[10px] font-mono font-semibold ${inPath ? 'fill-primary-foreground' : 'fill-foreground'}`}
              >
                {weight.toFixed(0)}
              </text>
            </g>
          );
        })}

        {/* Nodes */}
        {graph.nodes.map((node) => {
          const nodeState = getNodeState(node.id);
          const cost = astarState.costs.get(node.id);
          const pos = { x: node.x, y: node.y };
          const nodeRadius = 32;

          return (
            <g
              key={node.id}
              style={{
                cursor: disabled ? 'default' : 'pointer',
                // Bring current nodes to front visually using styling
                transformBox: 'fill-box',
                transformOrigin: 'center',
              }}
              onMouseDown={(e) => handleMouseDown(e, node.id)}
              onClick={(e) => {
                e.stopPropagation();
                if (!disabled && editMode === 'none') onNodeClick(node.id);
              }}
            >
              {/* Node circle */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={nodeRadius}
                className={`transition-all duration-300 ${nodeState === 'start' ? 'fill-primary stroke-primary stroke-[3]' :
                  nodeState === 'goal' ? 'fill-destructive stroke-destructive stroke-[3]' :
                    nodeState === 'path' ? 'fill-primary stroke-primary' :
                      nodeState === 'current' ? 'fill-primary stroke-primary animate-pulse' :
                        nodeState === 'closed' ? 'fill-secondary stroke-secondary' :
                          nodeState === 'open' ? 'fill-primary/30 stroke-primary stroke-2' :
                            'fill-card stroke-border stroke-2'
                  }`}
              />

              {/* Node Label */}
              <text
                x={pos.x}
                y={pos.y + (cost ? -6 : 1)}
                textAnchor="middle"
                dominantBaseline="middle"
                className={`text-sm font-semibold select-none pointer-events-none ${nodeState === 'start' || nodeState === 'goal' || nodeState === 'path' || nodeState === 'current' || nodeState === 'closed'
                  ? 'fill-primary-foreground'
                  : 'fill-foreground'
                  }`}
              >
                {node.label}
              </text>

              {/* Heuristic value h(n) displayed below node name */}
              {cost && (
                <text
                  x={pos.x}
                  y={pos.y + 10}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className={`text-[10px] font-mono select-none pointer-events-none ${nodeState === 'start' || nodeState === 'goal' || nodeState === 'path' || nodeState === 'current' || nodeState === 'closed'
                    ? 'fill-primary-foreground/80'
                    : 'fill-muted-foreground'
                    }`}
                >
                  h={cost.h.toFixed(0)}
                </text>
              )}

              {/* f-cost display outside node */}
              {cost && !astarState.isComplete && (
                <g>
                  <rect
                    x={pos.x + nodeRadius - 5}
                    y={pos.y - nodeRadius - 5}
                    width="32"
                    height="18"
                    rx="3"
                    className="fill-background stroke-primary/50"
                  />
                  <text
                    x={pos.x + nodeRadius + 11}
                    y={pos.y - nodeRadius + 6}
                    textAnchor="middle"
                    className="text-[10px] fill-primary font-mono font-bold"
                  >
                    f={cost.f.toFixed(0)}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {graph.nodes.length === 0 && (
          <text x={baseWidth / 2} y={baseHeight / 2} textAnchor="middle" className="fill-muted-foreground text-sm">
            {editMode === 'addNode' ? 'Click to add nodes' : 'No nodes'}
          </text>
        )}
      </svg>

      {/* Zoom indicator */}
      <div className="absolute bottom-2 left-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
        Zoom: {(zoom * 100).toFixed(0)}%
      </div>
    </div>
  );
}
