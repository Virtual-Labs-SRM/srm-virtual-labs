import { useRef, useState, useCallback, useEffect } from 'react';
import { Graph, DFSState } from '@/types/graph';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';

export type EditMode = 'none' | 'addNode' | 'addEdge' | 'delete';

interface GraphCanvasProps {
  graph: Graph;
  dfsState: DFSState;
  selectedNode: string | null;
  onNodeClick: (nodeId: string) => void;
  editMode: EditMode;
  edgeStartNode: string | null;
  onCanvasClick: (x: number, y: number) => void;
  onNodeDrag: (nodeId: string, x: number, y: number) => void;
  onEdgeNodeSelect: (nodeId: string) => void;
  onNodeDelete: (nodeId: string) => void;
  disabled: boolean;
}

export function GraphCanvas({
  graph,
  dfsState,
  selectedNode,
  onNodeClick,
  editMode,
  edgeStartNode,
  onCanvasClick,
  onNodeDrag,
  onEdgeNodeSelect,
  onNodeDelete,
  disabled,
}: GraphCanvasProps) {
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
      x: (clientX - rect.left) * scaleX + viewBox.x,
      y: (clientY - rect.top) * scaleY + viewBox.y,
    };
  }, []);

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
  const handleResetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  const getNodeState = (nodeId: string) => {
    if (nodeId === selectedNode) return 'start';
    if (dfsState.currentNode === nodeId) return 'current';
    if (dfsState.stack.includes(nodeId)) return 'stacked';
    if (dfsState.visitedNodes.has(nodeId)) return 'visited';
    return 'unvisited';
  };

  const getEdgeState = (from: string, to: string) => {
    const key1 = `${from}-${to}`;
    const key2 = `${to}-${from}`;
    if (dfsState.traversedEdges.has(key1) || dfsState.traversedEdges.has(key2)) {
      return 'traversed';
    }
    return 'unvisited';
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

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[500px]">
      {/* Zoom Controls */}
      <div className="absolute top-3 right-3 flex flex-col gap-1 z-10">
        <Button size="icon" variant="outline" className="h-7 w-7 bg-background/80 backdrop-blur-sm" onClick={handleZoomIn} title="Zoom In">
          <ZoomIn className="h-3.5 w-3.5" />
        </Button>
        <Button size="icon" variant="outline" className="h-7 w-7 bg-background/80 backdrop-blur-sm" onClick={handleZoomOut} title="Zoom Out">
          <ZoomOut className="h-3.5 w-3.5" />
        </Button>
        <Button size="icon" variant="outline" className="h-7 w-7 bg-background/80 backdrop-blur-sm" onClick={handleResetView} title="Reset View">
          <Maximize className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Step Counter Overlay - Moved outside SVG */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none">
        <Badge variant="secondary" className="backdrop-blur-md bg-background/50 border border-neutral-300 shadow-sm w-fit text-xs text-black">
          Steps: {dfsState.visitedNodes.size + (dfsState.currentNode ? 1 : 0)}
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


        {/* Grid pattern for visual feedback in edit mode */}
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

        {/* Temporary edge line when creating edge */}
        {edgeStartNode && editMode === 'addEdge' && (
          <line
            x1={getNodePosition(edgeStartNode).x}
            y1={getNodePosition(edgeStartNode).y}
            x2={getNodePosition(edgeStartNode).x}
            y2={getNodePosition(edgeStartNode).y}
            className="stroke-primary stroke-2 stroke-dashed"
            strokeDasharray="5,5"
          />
        )}

        {/* Edges */}
        {graph.edges.map((edge) => {
          const start = getNodePosition(edge.from);
          const end = getNodePosition(edge.to);
          const edgeState = getEdgeState(edge.from, edge.to);
          const edgeKey = `${edge.from}-${edge.to}`;

          return (
            <g key={edgeKey}>
              {/* Edge line */}
              <line
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                className={`transition-all duration-500 ${edgeState === 'traversed'
                  ? 'stroke-primary stroke-[3px]'
                  : 'stroke-muted-foreground/30 stroke-2'
                  }`}
              />
            </g>
          );
        })}

        {/* Nodes */}
        {graph.nodes.map((node) => {
          const nodeState = getNodeState(node.id);
          const isSelected = selectedNode === node.id;

          return (
            <g
              key={node.id}
              className="transition-all duration-300"
              style={{
                cursor: disabled ? 'default' : 'pointer',
                // Bring current and stacked nodes to front visually using z-index equivalent in SVG order (handled by map order usually, but here just styling)
                transformBox: 'fill-box',
                transformOrigin: 'center',
              }}
              onMouseDown={(e) => handleMouseDown(e, node.id)}
              onClick={(e) => {
                e.stopPropagation();
                if (!disabled) onNodeClick(node.id);
              }}
            >
              {/* Selection Halo */}
              {isSelected && !disabled && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="28"
                  className="fill-none stroke-primary stroke-2 opacity-50 animate-pulse"
                />
              )}

              {/* Delete button (only in edit mode) */}
              {editMode === 'delete' && (
                <g onClick={(e) => {
                  e.stopPropagation();
                  onNodeDelete(node.id);
                }}>
                  <circle cx={node.x + 15} cy={node.y - 15} r="8" className="fill-destructive cursor-pointer hover:scale-110 transition-transform" />
                  <text x={node.x + 15} y={node.y - 15} textAnchor="middle" dominantBaseline="middle" className="fill-destructive-foreground text-[10px] font-bold pointer-events-none">×</text>
                </g>
              )}

              {/* Node Circle */}
              <circle
                cx={node.x}
                cy={node.y}
                r="32"
                className={`transition-all duration-300 ${nodeState === 'current' ? 'fill-primary stroke-primary animate-pulse' :
                  nodeState === 'start' ? 'fill-primary stroke-primary stroke-[3]' :
                    nodeState === 'visited' ? 'fill-secondary stroke-secondary' :
                      nodeState === 'stacked' ? 'fill-primary/30 stroke-primary stroke-2' :
                        'fill-card stroke-border stroke-2'
                  }`}
              />

              {/* Node Label */}
              <text
                x={node.x}
                y={node.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className={`text-sm font-semibold select-none pointer-events-none ${nodeState === 'current' || nodeState === 'visited' || nodeState === 'start'
                  ? 'fill-primary-foreground'
                  : 'fill-foreground'
                  }`}
              >
                {node.label}
              </text>
            </g>
          );
        })}

        {/* Empty state */}
        {graph.nodes.length === 0 && (
          <text
            x={baseWidth / 2}
            y={baseHeight / 2}
            textAnchor="middle"
            className="fill-muted-foreground text-sm"
          >
            {editMode === 'addNode' ? 'Click to add nodes' : 'No nodes - switch to Add Node mode'}
          </text>
        )}
      </svg>

      {/* Zoom indicator */}
      {zoom !== 1 && (
        <div className="absolute bottom-2 left-2 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-1 rounded">
          {(zoom * 100).toFixed(0)}%
        </div>
      )}
    </div>
  );
}
