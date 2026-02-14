import { useState, useCallback, useRef } from 'react';

export type HillClimbingMode = 'maximize' | 'minimize';

export interface HillClimbingState {
  currentX: number;
  currentY: number;
  history: { x: number; y: number }[];
  neighbors: { x: number; y: number; value: number }[];
  isRunning: boolean;
  isComplete: boolean;
  stepsCount: number;
  localOptimumReached: boolean;
  phase: 'idle' | 'expanding' | 'moving' | 'complete';
}

const initialState: HillClimbingState = {
  currentX: 0,
  currentY: 0,
  history: [],
  neighbors: [],
  isRunning: false,
  isComplete: false,
  stepsCount: 0,
  localOptimumReached: false,
  phase: 'idle',
};

export function useHillClimbing(speed: number, costFn: (x: number) => number, mode: HillClimbingMode = 'maximize') {
  const [state, setState] = useState<HillClimbingState>(initialState);
  const isRunningRef = useRef(false);
  const isPausedRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const costFnRef = useRef(costFn);
  costFnRef.current = costFn;
  const modeRef = useRef(mode);
  modeRef.current = mode;

  // Use a ref to track internal variables during simulation to avoid stale closures in setTimeout
  const simStateRef = useRef({
    currentX: 0,
    currentY: 0,
    history: [] as { x: number; y: number }[],
    neighbors: [] as { x: number; y: number; value: number }[],
    stepsCount: 0,
    phase: 'idle' as 'idle' | 'expanding' | 'moving' | 'complete'
  });

  const isBetter = (a: number, b: number) => {
    return modeRef.current === 'maximize' ? a > b : a < b;
  };

  // History for step navigation
  const historyRef = useRef<HillClimbingState[]>([]);
  const currentStepRef = useRef(-1);

  const saveToHistory = useCallback((newState: HillClimbingState) => {
    historyRef.current.push(newState);
    currentStepRef.current = historyRef.current.length - 1;
  }, []);

  const restoreFromHistory = useCallback((index: number) => {
    const entry = historyRef.current[index];
    if (!entry) return;

    currentStepRef.current = index;
    setState({ ...entry, isRunning: false });

    // Sync refs
    simStateRef.current = {
      currentX: entry.currentX,
      currentY: entry.currentY,
      history: [...entry.history],
      neighbors: [...entry.neighbors],
      stepsCount: entry.stepsCount,
      phase: entry.phase
    };
  }, []);

  const reset = useCallback(() => {
    isRunningRef.current = false;
    isPausedRef.current = false;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setState(initialState);
    simStateRef.current = {
      currentX: 0,
      currentY: 0,
      history: [],
      neighbors: [],
      stepsCount: 0,
      phase: 'idle'
    };
    historyRef.current = [];
    currentStepRef.current = -1;
  }, []);

  const pause = useCallback(() => {
    isPausedRef.current = true;
    isRunningRef.current = false;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setState(prev => ({ ...prev, isRunning: false }));
  }, []);

  const resume = useCallback(() => {
    if (!isPausedRef.current) return;
    isPausedRef.current = false;
    isRunningRef.current = true;
    setState(prev => ({ ...prev, isRunning: true }));
    // No need to call runStep here, it will be called by the existing timeout mechanism if it was waiting
  }, []);

  const runHillClimbing = useCallback((startX: number, stepSize: number) => {
    reset();
    isRunningRef.current = true;
    isPausedRef.current = false;

    const fn = costFnRef.current;
    const s = simStateRef.current;

    s.currentX = startX;
    s.currentY = fn(startX);
    s.history = [{ x: s.currentX, y: s.currentY }];
    s.stepsCount = 0;
    s.phase = 'expanding';
    s.neighbors = [];

    const startState: HillClimbingState = {
      currentX: s.currentX,
      currentY: s.currentY,
      history: [...s.history],
      neighbors: [],
      isRunning: true,
      isComplete: false,
      stepsCount: 0,
      localOptimumReached: false,
      phase: 'expanding'
    };

    saveToHistory(startState);
    setState(startState);

    const runStep = () => {
      if (!isRunningRef.current) return;

      if (isPausedRef.current) {
        timeoutRef.current = setTimeout(runStep, 100);
        return;
      }

      const f = costFnRef.current;
      const s = simStateRef.current;

      if (s.phase === 'expanding') {
        const leftX = s.currentX - stepSize;
        const rightX = s.currentX + stepSize;
        const leftY = f(leftX);
        const rightY = f(rightX);

        s.neighbors = [
          { x: leftX, y: leftY, value: leftY },
          { x: rightX, y: rightY, value: rightY },
        ];

        s.phase = 'moving';

        const newState: HillClimbingState = {
          ...state,
          currentX: s.currentX,
          currentY: s.currentY,
          history: [...s.history],
          neighbors: [...s.neighbors],
          isRunning: true,
          isComplete: false,
          stepsCount: s.stepsCount,
          localOptimumReached: false,
          phase: 'expanding'
        };

        saveToHistory(newState);
        setState(newState);

        timeoutRef.current = setTimeout(runStep, 600 / speed);
        return;
      }

      if (s.phase === 'moving') {
        let bestNeighbor = null;
        let bestValue = s.currentY;

        for (const neighbor of s.neighbors) {
          if (isBetter(neighbor.value, bestValue)) {
            bestValue = neighbor.value;
            bestNeighbor = neighbor;
          }
        }

        if (bestNeighbor === null) {
          const completeState: HillClimbingState = {
            currentX: s.currentX,
            currentY: s.currentY,
            history: [...s.history],
            neighbors: [...s.neighbors],
            isRunning: false,
            isComplete: true,
            stepsCount: s.stepsCount,
            localOptimumReached: true,
            phase: 'complete'
          };
          saveToHistory(completeState);
          setState(completeState);
          isRunningRef.current = false;
          s.phase = 'complete';
          return;
        }

        s.currentX = bestNeighbor.x;
        s.currentY = bestNeighbor.y;
        s.history.push({ x: s.currentX, y: s.currentY });
        s.stepsCount++;
        s.phase = 'expanding';

        const newState: HillClimbingState = {
          currentX: s.currentX,
          currentY: s.currentY,
          history: [...s.history],
          neighbors: [],
          isRunning: true,
          isComplete: false,
          stepsCount: s.stepsCount,
          localOptimumReached: false,
          phase: 'moving'
        };

        saveToHistory(newState);
        setState(newState);

        if (s.stepsCount >= 50 || s.currentX < -15 || s.currentX > 15) {
          const timeoutState: HillClimbingState = {
            ...newState,
            isRunning: false,
            isComplete: true,
            phase: 'complete'
          };
          saveToHistory(timeoutState);
          setState(timeoutState);
          isRunningRef.current = false;
          s.phase = 'complete';
          return;
        }

        timeoutRef.current = setTimeout(runStep, 800 / speed);
      }
    };

    timeoutRef.current = setTimeout(runStep, 600 / speed);
  }, [reset, speed, state, isBetter, saveToHistory]);

  const stepForward = useCallback((startX: number, stepSize: number) => {
    if (currentStepRef.current < historyRef.current.length - 1) {
      restoreFromHistory(currentStepRef.current + 1);
      return;
    }

    const f = costFnRef.current;
    const s = simStateRef.current;

    if (s.phase === 'complete' || s.phase === 'idle') {
      s.currentX = startX;
      s.currentY = f(startX);
      s.history = [{ x: s.currentX, y: s.currentY }];
      s.stepsCount = 0;
      s.phase = 'expanding';

      const newState: HillClimbingState = {
        currentX: s.currentX,
        currentY: s.currentY,
        history: [...s.history],
        neighbors: [],
        isRunning: false,
        isComplete: false,
        stepsCount: 0,
        localOptimumReached: false,
        phase: 'expanding'
      };
      saveToHistory(newState);
      setState(newState);
      return;
    }

    if (s.phase === 'expanding') {
      const leftX = s.currentX - stepSize;
      const rightX = s.currentX + stepSize;
      const leftY = f(leftX);
      const rightY = f(rightX);

      s.neighbors = [
        { x: leftX, y: leftY, value: leftY },
        { x: rightX, y: rightY, value: rightY },
      ];
      s.phase = 'moving';

      const newState: HillClimbingState = {
        currentX: s.currentX,
        currentY: s.currentY,
        history: [...s.history],
        neighbors: [...s.neighbors],
        isRunning: false,
        isComplete: false,
        stepsCount: s.stepsCount,
        localOptimumReached: false,
        phase: 'expanding'
      };
      saveToHistory(newState);
      setState(newState);
      return;
    }

    if (s.phase === 'moving') {
      let bestNeighbor = null;
      let bestValue = s.currentY;

      for (const neighbor of s.neighbors) {
        if (isBetter(neighbor.value, bestValue)) {
          bestValue = neighbor.value;
          bestNeighbor = neighbor;
        }
      }

      if (bestNeighbor === null) {
        const completeState: HillClimbingState = {
          currentX: s.currentX,
          currentY: s.currentY,
          history: [...s.history],
          neighbors: [...s.neighbors],
          isRunning: false,
          isComplete: true,
          stepsCount: s.stepsCount,
          localOptimumReached: true,
          phase: 'complete'
        };
        saveToHistory(completeState);
        setState(completeState);
        s.phase = 'complete';
        return;
      }

      s.currentX = bestNeighbor.x;
      s.currentY = bestNeighbor.y;
      s.history.push({ x: s.currentX, y: s.currentY });
      s.stepsCount++;
      s.phase = 'expanding';

      const newState: HillClimbingState = {
        currentX: s.currentX,
        currentY: s.currentY,
        history: [...s.history],
        neighbors: [],
        isRunning: false,
        isComplete: false,
        stepsCount: s.stepsCount,
        localOptimumReached: false,
        phase: 'moving'
      };
      saveToHistory(newState);
      setState(newState);
    }
  }, [isBetter, saveToHistory, restoreFromHistory]);

  const stepBackward = useCallback(() => {
    if (currentStepRef.current > 0) {
      restoreFromHistory(currentStepRef.current - 1);
    }
  }, [restoreFromHistory]);

  return {
    state,
    runHillClimbing,
    reset,
    pause,
    resume,
    stepOnce: stepForward,
    stepBackward,
    currentStep: currentStepRef.current,
    historyLength: historyRef.current.length
  };
}
