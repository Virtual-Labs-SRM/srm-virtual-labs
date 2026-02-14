export interface GraphNode {
  id: string;
  x: number;
  y: number;
  label: string;
}

export interface GraphEdge {
  from: string;
  to: string;
}

export interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  adjacencyList: Map<string, string[]>;
}

export type NodeState = 'unvisited' | 'current' | 'visited';
export type EdgeState = 'unvisited' | 'traversed';

export interface DFSState {
  visitedNodes: Set<string>;
  currentNode: string | null;
  stack: string[];
  traversalOrder: string[];
  traversedEdges: Set<string>;
  isRunning: boolean;
  isComplete: boolean;
}
