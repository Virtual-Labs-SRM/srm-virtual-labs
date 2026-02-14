import { useState, useCallback, useRef } from 'react';
import { Graph, GraphNode } from '@/types/graph';

export interface AStarCost {
  g: number;  // Cost from start
  h: number;  // Heuristic (estimated cost to goal)
  f: number;  // Total cost (g + h)
}

export interface AStarHistoryEntry {
  step: number;
  currentNode: string;
  openSet: string[];
  closedSet: string[];
  selectedNodeCost: AStarCost;
  action: string;
}

export interface AStarState {
  openSet: string[];
  closedSet: Set<string>;
  currentNode: string | null;
  path: string[];
  costs: Map<string, AStarCost>;
  parents: Map<string, string | null>;
  isRunning: boolean;
  isComplete: boolean;
  goalFound: boolean;
  history: AStarHistoryEntry[];
  currentStep: number;
}

const initialAStarState: AStarState = {
  openSet: [],
  closedSet: new Set(),
  currentNode: null,
  path: [],
  costs: new Map(),
  parents: new Map(),
  isRunning: false,
  isComplete: false,
  goalFound: false,
  history: [],
  currentStep: 0,
};

function heuristic(node: GraphNode, goal: GraphNode): number {
  // Euclidean distance (scaled for visualization)
  return Math.sqrt(Math.pow(node.x - goal.x, 2) + Math.pow(node.y - goal.y, 2)) / 10;
}

function getDistance(node1: GraphNode, node2: GraphNode): number {
  return Math.sqrt(Math.pow(node1.x - node2.x, 2) + Math.pow(node1.y - node2.y, 2)) / 10;
}

export function useEnhancedAStar(graph: Graph, speed: number) {
  const [astarState, setAStarState] = useState<AStarState>(initialAStarState);
  const isRunningRef = useRef(false);
  const isPausedRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Store algorithm state for stepping
  const algorithmStateRef = useRef<{
    openSet: string[];
    closedSet: Set<string>;
    costs: Map<string, AStarCost>;
    parents: Map<string, string | null>;
    goalId: string;
    goalNode: GraphNode;
    history: AStarHistoryEntry[];
    step: number;
  } | null>(null);

  const reset = useCallback(() => {
    isRunningRef.current = false;
    isPausedRef.current = false;
    algorithmStateRef.current = null;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setAStarState(initialAStarState);
  }, []);

  const pause = useCallback(() => {
    isPausedRef.current = true;
    isRunningRef.current = false;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setAStarState(prev => ({ ...prev, isRunning: false }));
  }, []);

  const resume = useCallback(() => {
    if (isPausedRef.current) {
      isPausedRef.current = false;
      isRunningRef.current = true;
      setAStarState(prev => ({ ...prev, isRunning: true }));
    }
  }, []);

  const initializeAlgorithm = useCallback((startId: string, goalId: string) => {
    const startNode = graph.nodes.find(n => n.id === startId);
    const goalNode = graph.nodes.find(n => n.id === goalId);
    
    if (!startNode || !goalNode) return null;

    const h = heuristic(startNode, goalNode);
    const costs = new Map<string, AStarCost>();
    costs.set(startId, { g: 0, h, f: h });
    
    const parents = new Map<string, string | null>();
    parents.set(startId, null);

    return {
      openSet: [startId],
      closedSet: new Set<string>(),
      costs,
      parents,
      goalId,
      goalNode,
      history: [{
        step: 0,
        currentNode: startId,
        openSet: [startId],
        closedSet: [],
        selectedNodeCost: { g: 0, h, f: h },
        action: `Initialize: Add ${startId} to Open Set with f(${startId}) = g + h = 0 + ${h.toFixed(1)} = ${h.toFixed(1)}`,
      }],
      step: 0,
    };
  }, [graph]);

  const executeStep = useCallback(() => {
    if (!algorithmStateRef.current) return false;
    
    const state = algorithmStateRef.current;
    const { openSet, closedSet, costs, parents, goalId, goalNode, history } = state;

    if (openSet.length === 0) {
      return false; // No path found
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

    const currentCost = costs.get(currentId)!;
    state.step++;

    // Remove from openSet, add to closedSet
    const newOpenSet = openSet.filter(n => n !== currentId);
    closedSet.add(currentId);
    state.openSet = newOpenSet;

    // Check if goal reached
    if (currentId === goalId) {
      // Reconstruct path
      const path: string[] = [];
      let current: string | null = currentId;
      while (current) {
        path.unshift(current);
        current = parents.get(current) || null;
      }

      history.push({
        step: state.step,
        currentNode: currentId,
        openSet: [...newOpenSet],
        closedSet: Array.from(closedSet),
        selectedNodeCost: currentCost,
        action: `Goal ${goalId} reached! Path found with total cost g = ${currentCost.g.toFixed(1)}`,
      });

      setAStarState(prev => ({
        ...prev,
        openSet: [...newOpenSet],
        closedSet: new Set(closedSet),
        currentNode: currentId,
        path,
        costs: new Map(costs),
        parents: new Map(parents),
        history: [...history],
        currentStep: state.step,
        isRunning: false,
        isComplete: true,
        goalFound: true,
      }));

      return true; // Goal found
    }

    // Explore neighbors
    const currentNode = graph.nodes.find(n => n.id === currentId)!;
    const neighbors = graph.adjacencyList.get(currentId) || [];
    let expandedNeighbors: string[] = [];

    for (const neighborId of neighbors) {
      if (closedSet.has(neighborId)) continue;

      const neighborNode = graph.nodes.find(n => n.id === neighborId)!;
      const edgeCost = getDistance(currentNode, neighborNode);
      const tentativeG = currentCost.g + edgeCost;

      const neighborCost = costs.get(neighborId);
      if (!neighborCost || tentativeG < neighborCost.g) {
        const h = heuristic(neighborNode, goalNode);
        costs.set(neighborId, { g: tentativeG, h, f: tentativeG + h });
        parents.set(neighborId, currentId);
        expandedNeighbors.push(neighborId);

        if (!newOpenSet.includes(neighborId)) {
          newOpenSet.push(neighborId);
        }
      }
    }

    state.openSet = newOpenSet;

    history.push({
      step: state.step,
      currentNode: currentId,
      openSet: [...newOpenSet],
      closedSet: Array.from(closedSet),
      selectedNodeCost: currentCost,
      action: `Expand ${currentId}: f(${currentId}) = ${currentCost.g.toFixed(1)} + ${currentCost.h.toFixed(1)} = ${currentCost.f.toFixed(1)}. ` +
        (expandedNeighbors.length > 0 
          ? `Updated: ${expandedNeighbors.join(', ')}`
          : 'No new neighbors'),
    });

    setAStarState(prev => ({
      ...prev,
      openSet: [...newOpenSet],
      closedSet: new Set(closedSet),
      currentNode: currentId,
      path: [],
      costs: new Map(costs),
      parents: new Map(parents),
      history: [...history],
      currentStep: state.step,
      isRunning: isRunningRef.current && !isPausedRef.current,
      isComplete: false,
      goalFound: false,
    }));

    return null; // Continue
  }, [graph]);

  const runAStar = useCallback((startId: string, goalId: string) => {
    reset();
    isRunningRef.current = true;

    const initialState = initializeAlgorithm(startId, goalId);
    if (!initialState) return;

    algorithmStateRef.current = initialState;

    setAStarState({
      openSet: [startId],
      closedSet: new Set(),
      currentNode: startId,
      path: [],
      costs: new Map(initialState.costs),
      parents: new Map(initialState.parents),
      isRunning: true,
      isComplete: false,
      goalFound: false,
      history: [...initialState.history],
      currentStep: 0,
    });

    const runStep = () => {
      if (!isRunningRef.current || isPausedRef.current) return;

      const result = executeStep();
      
      if (result === false) {
        // No path found
        setAStarState(prev => ({
          ...prev,
          isRunning: false,
          isComplete: true,
          goalFound: false,
        }));
        isRunningRef.current = false;
        return;
      }

      if (result === true) {
        // Goal found
        isRunningRef.current = false;
        return;
      }

      // Continue only if still running
      if (isRunningRef.current && !isPausedRef.current) {
        timeoutRef.current = setTimeout(runStep, 1200 / speed);
      }
    };

    timeoutRef.current = setTimeout(runStep, 500);
  }, [reset, initializeAlgorithm, executeStep, speed]);

  const stepForward = useCallback((startId?: string, goalId?: string) => {
    if (!algorithmStateRef.current && startId && goalId) {
      const initialState = initializeAlgorithm(startId, goalId);
      if (!initialState) return;
      algorithmStateRef.current = initialState;
      
      setAStarState({
        openSet: [startId],
        closedSet: new Set(),
        currentNode: startId,
        path: [],
        costs: new Map(initialState.costs),
        parents: new Map(initialState.parents),
        isRunning: false,
        isComplete: false,
        goalFound: false,
        history: [...initialState.history],
        currentStep: 0,
      });
      return;
    }

    if (astarState.isComplete) return;
    executeStep();
  }, [initializeAlgorithm, executeStep, astarState.isComplete]);

  const stepBackward = useCallback(() => {
    setAStarState(prev => {
      if (prev.currentStep <= 0 || prev.history.length <= 1) return prev;
      
      const targetStep = prev.currentStep - 1;
      const historyEntry = prev.history[targetStep];
      
      if (!historyEntry) return prev;

      return {
        ...prev,
        openSet: historyEntry.openSet,
        closedSet: new Set(historyEntry.closedSet),
        currentNode: historyEntry.currentNode,
        currentStep: targetStep,
        path: [],
        isComplete: false,
        goalFound: false,
      };
    });
  }, []);

  // Generate heuristics table
  const getHeuristicsTable = useCallback((goalId: string | null) => {
    if (!goalId) return [];
    
    const goalNode = graph.nodes.find(n => n.id === goalId);
    if (!goalNode) return [];

    return graph.nodes.map(node => ({
      nodeId: node.id,
      label: node.label,
      heuristic: heuristic(node, goalNode),
    }));
  }, [graph]);

  return {
    astarState,
    runAStar,
    reset,
    pause,
    resume,
    stepForward,
    stepBackward,
    getHeuristicsTable,
  };
}
