import { useState, useCallback, useRef } from 'react';
import { Graph } from '@/types/graph';

export interface BFSState {
  visitedNodes: Set<string>;
  currentNode: string | null;
  queue: string[];
  traversalOrder: string[];
  traversedEdges: Set<string>;
  isRunning: boolean;
  isComplete: boolean;
  currentLevel: number;
  levelNodes: Map<number, string[]>;
}

export interface BFSHistoryEntry {
  visitedNodes: string[];
  currentNode: string | null;
  queue: string[];
  traversalOrder: string[];
  traversedEdges: string[];
  isComplete: boolean;
  currentLevel: number;
  levelNodes: [number, string[]][];
}

const initialBFSState: BFSState = {
  visitedNodes: new Set(),
  currentNode: null,
  queue: [],
  traversalOrder: [],
  traversedEdges: new Set(),
  isRunning: false,
  isComplete: false,
  currentLevel: 0,
  levelNodes: new Map(),
};

export function useBFS(graph: Graph, speed: number) {
  const [bfsState, setBFSState] = useState<BFSState>(initialBFSState);
  const isRunningRef = useRef(false);
  const isPausedRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // History for step-based navigation
  const historyRef = useRef<BFSHistoryEntry[]>([]);
  const currentStepRef = useRef(0);
  const parentMapRef = useRef(new Map<string, string>());
  const nodeLevelRef = useRef(new Map<string, number>());

  // Mutable state refs for animation loop
  const queueRef = useRef<string[]>([]);
  const visitedRef = useRef<Set<string>>(new Set());
  const traversalOrderRef = useRef<string[]>([]);
  const traversedEdgesRef = useRef<Set<string>>(new Set());
  const levelNodesRef = useRef<Map<number, string[]>>(new Map());

  const getEdgeKey = (from: string, to: string) => `${from}-${to}`;

  const reset = useCallback(() => {
    isRunningRef.current = false;
    isPausedRef.current = false;
    historyRef.current = [];
    currentStepRef.current = 0;
    parentMapRef.current = new Map();
    nodeLevelRef.current = new Map();
    queueRef.current = [];
    visitedRef.current = new Set();
    traversalOrderRef.current = [];
    traversedEdgesRef.current = new Set();
    levelNodesRef.current = new Map();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setBFSState(initialBFSState);
  }, []);

  const saveToHistory = useCallback((state: {
    visitedNodes: Set<string>;
    currentNode: string | null;
    queue: string[];
    traversalOrder: string[];
    traversedEdges: Set<string>;
    isComplete: boolean;
    currentLevel: number;
    levelNodes: Map<number, string[]>;
  }) => {
    const entry: BFSHistoryEntry = {
      visitedNodes: Array.from(state.visitedNodes),
      currentNode: state.currentNode,
      queue: [...state.queue],
      traversalOrder: [...state.traversalOrder],
      traversedEdges: Array.from(state.traversedEdges),
      isComplete: state.isComplete,
      currentLevel: state.currentLevel,
      levelNodes: Array.from(state.levelNodes.entries()),
    };
    historyRef.current.push(entry);
    currentStepRef.current = historyRef.current.length - 1;
  }, []);

  const restoreFromHistory = useCallback((index: number) => {
    const entry = historyRef.current[index];
    if (!entry) return;
    currentStepRef.current = index;
    setBFSState({
      visitedNodes: new Set(entry.visitedNodes),
      currentNode: entry.currentNode,
      queue: [...entry.queue],
      traversalOrder: [...entry.traversalOrder],
      traversedEdges: new Set(entry.traversedEdges),
      isRunning: false,
      isComplete: entry.isComplete,
      currentLevel: entry.currentLevel,
      levelNodes: new Map(entry.levelNodes),
    });

    // Synchronize mutable refs so animation loop can resume correctly
    queueRef.current = [...entry.queue];
    visitedRef.current = new Set(entry.visitedNodes);
    traversalOrderRef.current = [...entry.traversalOrder];
    traversedEdgesRef.current = new Set(entry.traversedEdges);
    levelNodesRef.current = new Map(entry.levelNodes);
  }, []);

  // The core animation loop — can be called from both runBFS and resume
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

      const queue = queueRef.current;
      const visited = visitedRef.current;
      const traversalOrder = traversalOrderRef.current;
      const traversedEdges = traversedEdgesRef.current;
      const levelNodes = levelNodesRef.current;
      const parentMap = parentMapRef.current;
      const nodeLevel = nodeLevelRef.current;

      if (queue.length === 0) {
        const finalState = {
          visitedNodes: new Set(visited),
          currentNode: null as string | null,
          queue: [] as string[],
          traversalOrder: [...traversalOrder],
          traversedEdges: new Set(traversedEdges),
          isComplete: true,
          currentLevel: 0,
          levelNodes: new Map(levelNodes),
        };
        saveToHistory(finalState);
        setBFSState({ ...finalState, isRunning: false });
        isRunningRef.current = false;
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        return;
      }

      // Dequeue
      const current = queue.shift()!;
      traversalOrder.push(current);

      const currentLvl = nodeLevel.get(current) || 0;

      // Mark edge from parent
      const parent = parentMap.get(current);
      if (parent) {
        traversedEdges.add(getEdgeKey(parent, current));
        traversedEdges.add(getEdgeKey(current, parent));
      }

      // Get unvisited neighbors
      const neighbors = graph.adjacencyList.get(current) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
          parentMap.set(neighbor, current);

          const nextLevel = currentLvl + 1;
          nodeLevel.set(neighbor, nextLevel);
          if (!levelNodes.has(nextLevel)) {
            levelNodes.set(nextLevel, []);
          }
          levelNodes.get(nextLevel)!.push(neighbor);
        }
      }

      const newState = {
        visitedNodes: new Set(visited),
        currentNode: current,
        queue: [...queue],
        traversalOrder: [...traversalOrder],
        traversedEdges: new Set(traversedEdges),
        isComplete: queue.length === 0,
        currentLevel: currentLvl,
        levelNodes: new Map(levelNodes),
      };

      saveToHistory(newState);

      setBFSState({
        ...newState,
        isRunning: queue.length > 0,
      });

      if (queue.length === 0) {
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
  }, [graph.adjacencyList, speed, saveToHistory]);

  const pause = useCallback(() => {
    isPausedRef.current = true;
    isRunningRef.current = false;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setBFSState(prev => ({ ...prev, isRunning: false }));
  }, []);

  const resume = useCallback(() => {
    if (!isPausedRef.current) return;
    isPausedRef.current = false;
    isRunningRef.current = true;
    setBFSState(prev => ({ ...prev, isRunning: true }));
    // Restart the animation loop
    runAnimationLoop();
  }, [runAnimationLoop]);

  const runBFS = useCallback((startNodeId: string) => {
    reset();
    isRunningRef.current = true;
    isPausedRef.current = false;

    queueRef.current = [startNodeId];
    visitedRef.current = new Set<string>([startNodeId]);
    traversalOrderRef.current = [];
    traversedEdgesRef.current = new Set<string>();
    parentMapRef.current = new Map<string, string>();
    const levelNodes = new Map<number, string[]>();
    levelNodes.set(0, [startNodeId]);
    levelNodesRef.current = levelNodes;
    const nodeLevel = new Map<string, number>();
    nodeLevel.set(startNodeId, 0);
    nodeLevelRef.current = nodeLevel;

    // Save initial state to history
    saveToHistory({
      visitedNodes: new Set([startNodeId]),
      currentNode: startNodeId,
      queue: [startNodeId],
      traversalOrder: [],
      traversedEdges: new Set<string>(),
      isComplete: false,
      currentLevel: 0,
      levelNodes: new Map(levelNodes),
    });

    setBFSState({
      visitedNodes: new Set([startNodeId]),
      currentNode: startNodeId,
      queue: [startNodeId],
      traversalOrder: [],
      traversedEdges: new Set<string>(),
      isRunning: true,
      isComplete: false,
      currentLevel: 0,
      levelNodes: new Map(levelNodes),
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
    setBFSState(prev => {
      if (prev.isComplete) return prev;

      let queue = prev.queue.length > 0 ? [...prev.queue] : startNodeId ? [startNodeId] : [];
      const visited = new Set(prev.visitedNodes);
      const traversalOrder = [...prev.traversalOrder];
      const traversedEdges = new Set(prev.traversedEdges);
      const levelNodes = new Map(prev.levelNodes);

      if (queue.length === 0 && startNodeId) {
        visited.add(startNodeId);
        levelNodes.set(0, [startNodeId]);
      }

      if (queue.length === 0) {
        return { ...prev, isComplete: true };
      }

      const current = queue.shift()!;
      traversalOrder.push(current);

      const neighbors = graph.adjacencyList.get(current) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
          traversedEdges.add(getEdgeKey(current, neighbor));
          traversedEdges.add(getEdgeKey(neighbor, current));
        }
      }

      const newState = {
        visitedNodes: visited,
        currentNode: current,
        queue,
        traversalOrder,
        traversedEdges,
        isRunning: false,
        isComplete: queue.length === 0,
        currentLevel: prev.currentLevel,
        levelNodes,
      };

      // Save to history
      const entry: BFSHistoryEntry = {
        visitedNodes: Array.from(visited),
        currentNode: current,
        queue: [...queue],
        traversalOrder: [...traversalOrder],
        traversedEdges: Array.from(traversedEdges),
        isComplete: queue.length === 0,
        currentLevel: prev.currentLevel,
        levelNodes: Array.from(levelNodes.entries()),
      };
      historyRef.current.push(entry);
      currentStepRef.current = historyRef.current.length - 1;

      // Update mutable refs so resume works after stepping
      queueRef.current = [...queue];
      visitedRef.current = new Set(visited);
      traversalOrderRef.current = [...traversalOrder];
      traversedEdgesRef.current = new Set(traversedEdges);
      levelNodesRef.current = new Map(levelNodes);

      return newState;
    });
  }, [graph.adjacencyList, restoreFromHistory]);

  const stepBackward = useCallback(() => {
    if (currentStepRef.current <= 0) return;
    restoreFromHistory(currentStepRef.current - 1);
  }, [restoreFromHistory]);

  return {
    bfsState,
    runBFS,
    reset,
    pause,
    resume,
    stepOnce: stepForward,
    stepForward,
    stepBackward,
  };
}
