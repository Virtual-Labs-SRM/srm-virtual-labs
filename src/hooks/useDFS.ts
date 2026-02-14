import { useState, useCallback, useRef } from 'react';
import { Graph, DFSState } from '@/types/graph';

export interface DFSHistoryEntry {
  visitedNodes: string[];
  currentNode: string | null;
  stack: string[];
  traversalOrder: string[];
  traversedEdges: string[];
  isComplete: boolean;
}

const initialDFSState: DFSState = {
  visitedNodes: new Set(),
  currentNode: null,
  stack: [],
  traversalOrder: [],
  traversedEdges: new Set(),
  isRunning: false,
  isComplete: false,
};

export function useDFS(graph: Graph, speed: number) {
  const [dfsState, setDFSState] = useState<DFSState>(initialDFSState);
  const isRunningRef = useRef(false);
  const isPausedRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // History for step-based navigation
  const historyRef = useRef<DFSHistoryEntry[]>([]);
  const currentStepRef = useRef(0);
  const parentMapRef = useRef(new Map<string, string>());

  // Mutable state refs for the animation loop to use across pause/resume
  const stackRef = useRef<string[]>([]);
  const visitedRef = useRef<Set<string>>(new Set());
  const traversalOrderRef = useRef<string[]>([]);
  const traversedEdgesRef = useRef<Set<string>>(new Set());
  const stepsCountRef = useRef(0);

  const getEdgeKey = (from: string, to: string) => `${from}-${to}`;

  const reset = useCallback(() => {
    isRunningRef.current = false;
    isPausedRef.current = false;
    historyRef.current = [];
    currentStepRef.current = 0;
    parentMapRef.current = new Map();
    stackRef.current = [];
    visitedRef.current = new Set();
    traversalOrderRef.current = [];
    traversedEdgesRef.current = new Set();
    stepsCountRef.current = 0;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setDFSState(initialDFSState);
  }, []);

  const saveToHistory = useCallback((state: {
    visitedNodes: Set<string>;
    currentNode: string | null;
    stack: string[];
    traversalOrder: string[];
    traversedEdges: Set<string>;
    isComplete: boolean;
  }) => {
    const entry: DFSHistoryEntry = {
      visitedNodes: Array.from(state.visitedNodes),
      currentNode: state.currentNode,
      stack: [...state.stack],
      traversalOrder: [...state.traversalOrder],
      traversedEdges: Array.from(state.traversedEdges),
      isComplete: state.isComplete,
    };
    historyRef.current.push(entry);
    currentStepRef.current = historyRef.current.length - 1;
  }, []);

  const restoreFromHistory = useCallback((index: number) => {
    const entry = historyRef.current[index];
    if (!entry) return;
    currentStepRef.current = index;
    setDFSState({
      visitedNodes: new Set(entry.visitedNodes),
      currentNode: entry.currentNode,
      stack: [...entry.stack],
      traversalOrder: [...entry.traversalOrder],
      traversedEdges: new Set(entry.traversedEdges),
      isRunning: false,
      isComplete: entry.isComplete,
    });

    // Synchronize mutable refs so animation loop can resume correctly
    stackRef.current = [...entry.stack];
    visitedRef.current = new Set(entry.visitedNodes);
    traversalOrderRef.current = [...entry.traversalOrder];
    traversedEdgesRef.current = new Set(entry.traversedEdges);
  }, []);

  const step = useCallback((
    stack: string[],
    visited: Set<string>,
    traversalOrder: string[],
    traversedEdges: Set<string>,
    parentMap: Map<string, string>
  ): {
    newStack: string[];
    newVisited: Set<string>;
    newTraversalOrder: string[];
    newTraversedEdges: Set<string>;
    currentNode: string | null;
    isComplete: boolean;
  } => {
    if (stack.length === 0) {
      return {
        newStack: [],
        newVisited: visited,
        newTraversalOrder: traversalOrder,
        newTraversedEdges: traversedEdges,
        currentNode: null,
        isComplete: true
      };
    }

    const current = stack[stack.length - 1];
    const newStack = [...stack];
    const newVisited = new Set(visited);
    const newTraversalOrder = [...traversalOrder];
    const newTraversedEdges = new Set(traversedEdges);

    if (!newVisited.has(current)) {
      newVisited.add(current);
      newTraversalOrder.push(current);

      // Mark edge from parent to current as traversed
      const parent = parentMap.get(current);
      if (parent) {
        newTraversedEdges.add(getEdgeKey(parent, current));
        newTraversedEdges.add(getEdgeKey(current, parent));
      }
    }

    // Get neighbors
    const neighbors = graph.adjacencyList.get(current) || [];
    let foundUnvisited = false;

    for (const neighbor of neighbors) {
      if (!newVisited.has(neighbor)) {
        newStack.push(neighbor);
        parentMap.set(neighbor, current);
        foundUnvisited = true;
        break; // DFS explores one neighbor at a time
      }
    }

    if (!foundUnvisited) {
      newStack.pop(); // Backtrack
    }

    return {
      newStack,
      newVisited,
      newTraversalOrder,
      newTraversedEdges,
      currentNode: newStack.length > 0 ? newStack[newStack.length - 1] : current,
      isComplete: newStack.length === 0
    };
  }, [graph.adjacencyList]);

  // The core animation loop — can be called from both runDFS and resume
  const runAnimationLoop = useCallback(() => {
    const runStep = () => {
      if (!isRunningRef.current) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        return;
      }

      if (isPausedRef.current) {
        timeoutRef.current = setTimeout(runStep, 100);
        return;
      }

      const result = step(
        stackRef.current,
        visitedRef.current,
        traversalOrderRef.current,
        traversedEdgesRef.current,
        parentMapRef.current
      );
      stackRef.current = result.newStack;
      visitedRef.current = result.newVisited;
      traversalOrderRef.current = result.newTraversalOrder;
      traversedEdgesRef.current = result.newTraversedEdges;

      const newState = {
        visitedNodes: new Set(result.newVisited),
        currentNode: result.currentNode,
        stack: [...result.newStack],
        traversalOrder: [...result.newTraversalOrder],
        traversedEdges: new Set(result.newTraversedEdges),
        isComplete: result.isComplete,
      };

      saveToHistory(newState);

      setDFSState({
        ...newState,
        isRunning: !result.isComplete,
      });

      if (result.isComplete) {
        isRunningRef.current = false;
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        return;
      }

      if (isRunningRef.current && !isPausedRef.current) {
        timeoutRef.current = setTimeout(runStep, 1000 / speed);
      }
    };

    timeoutRef.current = setTimeout(runStep, 500);
  }, [step, speed, saveToHistory]);

  const pause = useCallback(() => {
    isPausedRef.current = true;
    isRunningRef.current = false;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setDFSState(prev => ({ ...prev, isRunning: false }));
  }, []);

  const resume = useCallback(() => {
    if (!isPausedRef.current) return;
    isPausedRef.current = false;
    isRunningRef.current = true;
    setDFSState(prev => ({ ...prev, isRunning: true }));
    // Restart the animation loop
    runAnimationLoop();
  }, [runAnimationLoop]);

  const runDFS = useCallback((startNodeId: string) => {
    reset();
    isRunningRef.current = true;
    isPausedRef.current = false;

    stackRef.current = [startNodeId];
    visitedRef.current = new Set<string>();
    traversalOrderRef.current = [];
    traversedEdgesRef.current = new Set<string>();
    parentMapRef.current = new Map<string, string>();

    // Save initial state to history
    saveToHistory({
      visitedNodes: new Set<string>(),
      currentNode: startNodeId,
      stack: [startNodeId],
      traversalOrder: [],
      traversedEdges: new Set<string>(),
      isComplete: false,
    });

    setDFSState({
      visitedNodes: new Set<string>(),
      currentNode: startNodeId,
      stack: [startNodeId],
      traversalOrder: [],
      traversedEdges: new Set<string>(),
      isRunning: true,
      isComplete: false,
    });

    runAnimationLoop();
  }, [reset, saveToHistory, runAnimationLoop]);

  const stepForward = useCallback((startNodeId?: string) => {
    // If we can step forward in history, do that
    if (currentStepRef.current < historyRef.current.length - 1) {
      restoreFromHistory(currentStepRef.current + 1);
      return;
    }

    // Otherwise compute a new step
    setDFSState(prev => {
      if (prev.isComplete) return prev;

      let stack = prev.stack.length > 0 ? [...prev.stack] : startNodeId ? [startNodeId] : [];
      if (stack.length === 0) return prev;

      const parentMap = parentMapRef.current;

      const result = step(
        stack,
        prev.visitedNodes,
        prev.traversalOrder,
        prev.traversedEdges,
        parentMap
      );

      const newState = {
        visitedNodes: result.newVisited,
        currentNode: result.currentNode,
        stack: result.newStack,
        traversalOrder: result.newTraversalOrder,
        traversedEdges: result.newTraversedEdges,
        isRunning: false,
        isComplete: result.isComplete,
      };

      // Save to history
      const entry: DFSHistoryEntry = {
        visitedNodes: Array.from(result.newVisited),
        currentNode: result.currentNode,
        stack: [...result.newStack],
        traversalOrder: [...result.newTraversalOrder],
        traversedEdges: Array.from(result.newTraversedEdges),
        isComplete: result.isComplete,
      };
      historyRef.current.push(entry);
      currentStepRef.current = historyRef.current.length - 1;

      // Also update the mutable refs so resume works after stepping
      stackRef.current = result.newStack;
      visitedRef.current = result.newVisited;
      traversalOrderRef.current = result.newTraversalOrder;
      traversedEdgesRef.current = result.newTraversedEdges;

      return newState;
    });
  }, [step, restoreFromHistory]);

  const stepBackward = useCallback(() => {
    if (currentStepRef.current <= 0) return;
    restoreFromHistory(currentStepRef.current - 1);
  }, [restoreFromHistory]);

  return {
    dfsState,
    runDFS,
    reset,
    pause,
    resume,
    stepOnce: stepForward,
    stepForward,
    stepBackward,
    currentStep: currentStepRef.current,
    historyLength: historyRef.current.length,
  };
}
