import { useState, useCallback, useRef } from 'react';
import { Graph, GraphNode, GraphEdge } from '@/types/graph';

export interface AStarNode extends GraphNode {
  g: number;  // Cost from start
  h: number;  // Heuristic (estimated cost to goal)
  f: number;  // Total cost (g + h)
  parent: string | null;
}

export interface AStarState {
  openSet: string[];
  closedSet: Set<string>;
  currentNode: string | null;
  path: string[];
  costs: Map<string, { g: number; h: number; f: number }>;
  isRunning: boolean;
  isComplete: boolean;
  goalFound: boolean;
}

const initialAStarState: AStarState = {
  openSet: [],
  closedSet: new Set(),
  currentNode: null,
  path: [],
  costs: new Map(),
  isRunning: false,
  isComplete: false,
  goalFound: false,
};

function heuristic(node: GraphNode, goal: GraphNode): number {
  // Euclidean distance
  return Math.sqrt(Math.pow(node.x - goal.x, 2) + Math.pow(node.y - goal.y, 2));
}

function getDistance(node1: GraphNode, node2: GraphNode): number {
  return Math.sqrt(Math.pow(node1.x - node2.x, 2) + Math.pow(node1.y - node2.y, 2));
}

export function useAStar(graph: Graph, speed: number) {
  const [astarState, setAStarState] = useState<AStarState>(initialAStarState);
  const isRunningRef = useRef(false);
  const isPausedRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const reset = useCallback(() => {
    isRunningRef.current = false;
    isPausedRef.current = false;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setAStarState(initialAStarState);
  }, []);

  const pause = useCallback(() => {
    isPausedRef.current = true;
    setAStarState(prev => ({ ...prev, isRunning: false }));
  }, []);

  const resume = useCallback(() => {
    isPausedRef.current = false;
    setAStarState(prev => ({ ...prev, isRunning: true }));
  }, []);

  const runAStar = useCallback((startId: string, goalId: string) => {
    reset();
    isRunningRef.current = true;

    const startNode = graph.nodes.find(n => n.id === startId);
    const goalNode = graph.nodes.find(n => n.id === goalId);
    
    if (!startNode || !goalNode) return;

    let openSet = [startId];
    let closedSet = new Set<string>();
    const costs = new Map<string, { g: number; h: number; f: number }>();
    const parents = new Map<string, string | null>();

    const h = heuristic(startNode, goalNode);
    costs.set(startId, { g: 0, h, f: h });
    parents.set(startId, null);

    setAStarState({
      openSet: [...openSet],
      closedSet: new Set(closedSet),
      currentNode: startId,
      path: [],
      costs: new Map(costs),
      isRunning: true,
      isComplete: false,
      goalFound: false,
    });

    const runStep = () => {
      if (!isRunningRef.current) return;
      
      if (isPausedRef.current) {
        timeoutRef.current = setTimeout(runStep, 100);
        return;
      }

      if (openSet.length === 0) {
        setAStarState(prev => ({
          ...prev,
          isRunning: false,
          isComplete: true,
          goalFound: false,
        }));
        isRunningRef.current = false;
        return;
      }

      // Find node in openSet with lowest f
      let lowestF = Infinity;
      let currentId = openSet[0];
      for (const nodeId of openSet) {
        const cost = costs.get(nodeId);
        if (cost && cost.f < lowestF) {
          lowestF = cost.f;
          currentId = nodeId;
        }
      }

      // Remove from openSet, add to closedSet
      openSet = openSet.filter(n => n !== currentId);
      closedSet.add(currentId);

      // Check if goal reached
      if (currentId === goalId) {
        // Reconstruct path
        const path: string[] = [];
        let current: string | null = currentId;
        while (current) {
          path.unshift(current);
          current = parents.get(current) || null;
        }

        setAStarState(prev => ({
          ...prev,
          openSet: [...openSet],
          closedSet: new Set(closedSet),
          currentNode: currentId,
          path,
          isRunning: false,
          isComplete: true,
          goalFound: true,
        }));
        isRunningRef.current = false;
        return;
      }

      const currentNode = graph.nodes.find(n => n.id === currentId)!;
      const neighbors = graph.adjacencyList.get(currentId) || [];

      for (const neighborId of neighbors) {
        if (closedSet.has(neighborId)) continue;

        const neighborNode = graph.nodes.find(n => n.id === neighborId)!;
        const currentCost = costs.get(currentId)!;
        const tentativeG = currentCost.g + getDistance(currentNode, neighborNode);

        const neighborCost = costs.get(neighborId);
        if (!neighborCost || tentativeG < neighborCost.g) {
          const h = heuristic(neighborNode, goalNode);
          costs.set(neighborId, { g: tentativeG, h, f: tentativeG + h });
          parents.set(neighborId, currentId);

          if (!openSet.includes(neighborId)) {
            openSet.push(neighborId);
          }
        }
      }

      setAStarState({
        openSet: [...openSet],
        closedSet: new Set(closedSet),
        currentNode: currentId,
        path: [],
        costs: new Map(costs),
        isRunning: true,
        isComplete: false,
        goalFound: false,
      });

      timeoutRef.current = setTimeout(runStep, 1000 / speed);
    };

    timeoutRef.current = setTimeout(runStep, 500);
  }, [reset, graph, speed]);

  const stepOnce = useCallback((startId: string, goalId: string) => {
    // For simplicity, step mode just runs the algorithm
    // A full implementation would track state between steps
    setAStarState(prev => {
      if (prev.isComplete) return prev;
      // Simplified - in production you'd track all state
      return prev;
    });
  }, []);

  return {
    astarState,
    runAStar,
    reset,
    pause,
    resume,
    stepOnce,
  };
}
