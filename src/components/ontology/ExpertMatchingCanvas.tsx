'use client';

import { useRef, useState } from 'react';

export type NodeState = 'unvisited' | 'visited' | 'current' | 'query';
export type EdgeState = 'unvisited' | 'traversed';

type OntologyNode = {
  id: string;
  label: string;
  x: number;
  y: number;
  type: 'concept' | 'expert';
};

type OntologyEdge = {
  from: string;
  to: string;
  type: 'parent-child' | 'hasExpert';
};

type Props = {
  ontologyNodes: OntologyNode[];
  ontologyEdges: OntologyEdge[];
  getNodeState: (id: string) => NodeState;
  getEdgeState: (from: string, to: string) => EdgeState;
  updateNodePosition?: (
    id: string,
    x: number,
    y: number,
    isExpert?: boolean
  ) => void;
  onNodeClick?: (id: string) => void;
  selectedNodeId?: string | null;
  isRunning?: boolean;
  currentNode?: string | null;
};

export function ExpertMatchingCanvas({
  ontologyNodes,
  ontologyEdges,
  getNodeState,
  getEdgeState,
  onNodeClick,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);


  /* ================= STYLES ================= */

  const nodeStyle = (state: NodeState, type: string) => {
    if (type === 'expert') return '#ddd6fe'; // soft purple

    switch (state) {
      case 'current':
        return '#fde047';
      case 'visited':
        return '#bbf7d0';
      case 'query':
        return '#93c5fd';
      default:
        return '#ffffff';
    }
  };

  /* ================= RENDER ================= */

  return (
    <g>
      {/* EDGES */}
      {ontologyEdges.map(edge => {
        const from = ontologyNodes.find(n => n.id === edge.from);
        const to = ontologyNodes.find(n => n.id === edge.to);
        if (!from || !to) return null;

        const state = getEdgeState(edge.from, edge.to);

        const strokeColor = edge.type === 'hasExpert'
          ? (state === 'traversed' ? '#7c3aed' : '#c4b5fd')
          : (state === 'traversed' ? '#ef4444' : '#94a3b8');

        const strokeWidth = edge.type === 'hasExpert' ? (state === 'traversed' ? 2 : 1) : (state === 'traversed' ? 2.5 : 1.5);
        const dash = edge.type === 'hasExpert' ? (state === 'traversed' ? '2 2' : '6 4') : (state === 'traversed' ? '0' : '6 4');

        return (
          <line
            key={`${edge.from}-${edge.to}`}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={dash}
          />
        );
      })}

      {/* NODES */}
      {ontologyNodes.map(node => {
        const state = getNodeState(node.id);
        const width = 150;
        const height = 44;

        return (
          <g
            key={node.id}
            transform={`translate(${node.x - width / 2}, ${
              node.y - height / 2
            })`}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onNodeClick?.(node.id);
            }}
            style={{ cursor: 'pointer' }}
          >
            <rect
              width={width}
              height={height}
              rx={10}
              ry={10}
              fill={nodeStyle(state, node.type)}
              stroke="#334155"
              strokeWidth={state === 'current' ? 2.5 : 1.5}
            />
            <text
              x={width / 2}
              y={height / 2 + 4}
              textAnchor="middle"
              fontSize="13"
              fontWeight={state !== 'unvisited' ? '600' : '400'}
              fill="#0f172a"
            >
              {node.label}
            </text>
          </g>
        );
      })}
    </g>
  );

}
