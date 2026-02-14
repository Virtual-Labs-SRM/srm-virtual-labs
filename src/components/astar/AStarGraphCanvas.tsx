import { useRef, useState, useCallback, useEffect } from 'react';
import { Graph } from '@/types/graph';
import { AStarState } from '@/hooks/useAStar';
import { EditMode } from '@/components/dfs/GraphCanvas';

interface AStarGraphCanvasProps {
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

export function AStarGraphCanvas({ 
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
}: AStarGraphCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragState, setDragState] = useState<{
    nodeId: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  const getSvgPoint = useCallback((clientX: number, clientY: number) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    const viewBox = svg.viewBox.baseVal;
    const scaleX = viewBox.width / rect.width;
    const scaleY = viewBox.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
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
    if (!dragState || disabled) return;
    const point = getSvgPoint(e.clientX, e.clientY);
    const newX = Math.max(30, Math.min(570, point.x - dragState.offsetX));
    const newY = Math.max(30, Math.min(470, point.y - dragState.offsetY));
    onNodeDrag(dragState.nodeId, newX, newY);
  }, [dragState, disabled, getSvgPoint, onNodeDrag]);

  const handleMouseUp = useCallback(() => {
    setDragState(null);
  }, []);

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
    const handleGlobalMouseUp = () => setDragState(null);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

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

  return (
    <svg 
      ref={svgRef}
      className="w-full h-full"
      viewBox="0 0 600 500"
      preserveAspectRatio="xMidYMid meet"
      style={{ cursor: disabled ? 'not-allowed' : dragState ? 'grabbing' : editMode === 'addNode' ? 'crosshair' : 'default' }}
      onClick={handleCanvasClick}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <rect x="0" y="0" width="600" height="500" fill="transparent" />
      
      {editMode !== 'none' && (
        <g opacity="0.1">
          {Array.from({ length: 12 }, (_, i) => (
            <line key={`v${i}`} x1={i * 50} y1="0" x2={i * 50} y2="500" className="stroke-foreground" strokeWidth="1" />
          ))}
          {Array.from({ length: 10 }, (_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 50} x2="600" y2={i * 50} className="stroke-foreground" strokeWidth="1" />
          ))}
        </g>
      )}
      
      {/* Edges */}
      {graph.edges.map((edge, index) => {
        const fromPos = getNodePosition(edge.from);
        const toPos = getNodePosition(edge.to);
        const inPath = isInPath(edge.from, edge.to);
        return (
          <line
            key={`edge-${index}`}
            x1={fromPos.x}
            y1={fromPos.y}
            x2={toPos.x}
            y2={toPos.y}
            className={`transition-all duration-300 ${
              inPath ? 'stroke-primary stroke-[4]' : 'stroke-border stroke-2'
            }`}
          />
        );
      })}
      
      {/* Nodes */}
      {graph.nodes.map((node) => {
        const nodeState = getNodeState(node.id);
        const cost = astarState.costs.get(node.id);
        
        return (
          <g
            key={node.id}
            className={disabled ? 'cursor-not-allowed' : editMode === 'none' ? 'cursor-grab' : 'cursor-pointer'}
            onMouseDown={(e) => handleMouseDown(e, node.id)}
            onClick={(e) => {
              e.stopPropagation();
              if (!disabled && editMode === 'none') onNodeClick(node.id);
            }}
          >
            <circle
              cx={node.x}
              cy={node.y}
              r={28}
              className={`transition-all duration-300 ${
                nodeState === 'start' ? 'fill-primary stroke-primary stroke-[3]' :
                nodeState === 'goal' ? 'fill-destructive stroke-destructive stroke-[3]' :
                nodeState === 'path' ? 'fill-primary stroke-primary' :
                nodeState === 'current' ? 'fill-primary stroke-primary animate-pulse' :
                nodeState === 'closed' ? 'fill-secondary stroke-secondary' :
                nodeState === 'open' ? 'fill-primary/30 stroke-primary stroke-2' :
                'fill-card stroke-border stroke-2'
              }`}
            />
            
            {/* Node label */}
            <text
              x={node.x}
              y={node.y}
              textAnchor="middle"
              dominantBaseline="central"
              className={`text-lg font-semibold select-none pointer-events-none ${
                nodeState === 'start' || nodeState === 'goal' || nodeState === 'path' || nodeState === 'current' || nodeState === 'closed'
                  ? 'fill-primary-foreground' 
                  : 'fill-foreground'
              }`}
            >
              {node.label}
            </text>
            
            {/* f-cost display */}
            {cost && !astarState.isComplete && (
              <text
                x={node.x}
                y={node.y + 40}
                textAnchor="middle"
                className="text-xs fill-muted-foreground font-mono"
              >
                f={cost.f.toFixed(0)}
              </text>
            )}
          </g>
        );
      })}
      
      {graph.nodes.length === 0 && (
        <text x="300" y="250" textAnchor="middle" className="fill-muted-foreground text-sm">
          {editMode === 'addNode' ? 'Click to add nodes' : 'No nodes'}
        </text>
      )}
    </svg>
  );
}
