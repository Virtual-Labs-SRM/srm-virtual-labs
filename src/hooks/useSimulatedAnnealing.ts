import { useState, useCallback, useRef } from 'react';
import { costFunction } from './useHillClimbing';

export interface SimulatedAnnealingState {
  currentX: number;
  currentY: number;
  bestX: number;
  bestY: number;
  temperature: number;
  history: { x: number; y: number; temp: number; accepted: boolean }[];
  isRunning: boolean;
  isComplete: boolean;
  stepsCount: number;
  acceptedDownhill: number;
}

const initialState: SimulatedAnnealingState = {
  currentX: 0,
  currentY: 0,
  bestX: 0,
  bestY: 0,
  temperature: 100,
  history: [],
  isRunning: false,
  isComplete: false,
  stepsCount: 0,
  acceptedDownhill: 0,
};

export function useSimulatedAnnealing(speed: number) {
  const [state, setState] = useState<SimulatedAnnealingState>(initialState);
  const isRunningRef = useRef(false);
  const isPausedRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const reset = useCallback(() => {
    isRunningRef.current = false;
    isPausedRef.current = false;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setState(initialState);
  }, []);

  const pause = useCallback(() => {
    isPausedRef.current = true;
    setState(prev => ({ ...prev, isRunning: false }));
  }, []);

  const resume = useCallback(() => {
    isPausedRef.current = false;
    setState(prev => ({ ...prev, isRunning: true }));
  }, []);

  const runSimulatedAnnealing = useCallback((
    startX: number,
    initialTemp: number,
    coolingRate: number
  ) => {
    reset();
    isRunningRef.current = true;

    let currentX = startX;
    let currentY = costFunction(currentX);
    let bestX = currentX;
    let bestY = currentY;
    let temperature = initialTemp;
    const history: SimulatedAnnealingState['history'] = [
      { x: currentX, y: currentY, temp: temperature, accepted: true }
    ];
    let stepsCount = 0;
    let acceptedDownhill = 0;

    setState({
      currentX,
      currentY,
      bestX,
      bestY,
      temperature,
      history: [...history],
      isRunning: true,
      isComplete: false,
      stepsCount: 0,
      acceptedDownhill: 0,
    });

    const runStep = () => {
      if (!isRunningRef.current) return;

      if (isPausedRef.current) {
        timeoutRef.current = setTimeout(runStep, 100);
        return;
      }

      // Generate random neighbor
      const stepSize = (Math.random() - 0.5) * 2; // Random step between -1 and 1
      const neighborX = currentX + stepSize;
      const neighborY = costFunction(neighborX);

      const delta = neighborY - currentY;
      let accepted = false;

      if (delta > 0) {
        // Better solution, always accept
        accepted = true;
      } else {
        // Worse solution, accept with probability e^(delta/T)
        const probability = Math.exp(delta / temperature);
        accepted = Math.random() < probability;
        if (accepted) acceptedDownhill++;
      }

      if (accepted) {
        currentX = neighborX;
        currentY = neighborY;
        
        if (currentY > bestY) {
          bestX = currentX;
          bestY = currentY;
        }
      }

      // Cool down
      temperature *= coolingRate;
      stepsCount++;

      history.push({
        x: currentX,
        y: currentY,
        temp: temperature,
        accepted,
      });

      setState({
        currentX,
        currentY,
        bestX,
        bestY,
        temperature,
        history: [...history],
        isRunning: true,
        isComplete: false,
        stepsCount,
        acceptedDownhill,
      });

      // Stop conditions
      if (temperature < 0.1 || stepsCount >= 100) {
        setState(prev => ({
          ...prev,
          isRunning: false,
          isComplete: true,
        }));
        isRunningRef.current = false;
        return;
      }

      timeoutRef.current = setTimeout(runStep, 600 / speed);
    };

    timeoutRef.current = setTimeout(runStep, 500);
  }, [reset, speed]);

  return {
    state,
    runSimulatedAnnealing,
    reset,
    pause,
    resume,
  };
}
