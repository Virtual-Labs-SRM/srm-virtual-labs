import { useRef, useMemo } from 'react';
import { SimulatedAnnealingState } from '@/hooks/useSimulatedAnnealing';
import { costFunction } from '@/hooks/useHillClimbing';

interface SimulatedAnnealingCanvasProps {
  state: SimulatedAnnealingState;
  startX: number;
}

export function SimulatedAnnealingCanvas({ state, startX }: SimulatedAnnealingCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  const curvePoints = useMemo(() => {
    const points: string[] = [];
    for (let x = -4; x <= 4; x += 0.1) {
      const y = costFunction(x);
      const screenX = ((x + 4) / 8) * 560 + 20;
      const screenY = 320 - ((y + 5) / 15) * 280;
      points.push(`${screenX},${screenY}`);
    }
    return points.join(' ');
  }, []);

  const toScreenCoords = (x: number, y: number) => ({
    screenX: ((x + 4) / 8) * 560 + 20,
    screenY: 320 - ((y + 5) / 15) * 280,
  });

  const startCoords = toScreenCoords(startX, costFunction(startX));
  const currentCoords = state.currentX !== undefined
    ? toScreenCoords(state.currentX, state.currentY)
    : startCoords;
  const bestCoords = state.bestX !== undefined
    ? toScreenCoords(state.bestX, state.bestY)
    : startCoords;

  // Temperature bar height
  const tempHeight = Math.min((state.temperature / 100) * 100, 100);

  return (
    <svg
      ref={svgRef}
      className="w-full h-full"
      viewBox="0 0 600 450"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Background grid */}
      <defs>
        <pattern id="sa-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" className="stroke-border" strokeWidth="0.5" />
        </pattern>
        <linearGradient id="temp-gradient" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="hsl(200, 80%, 50%)" />
          <stop offset="50%" stopColor="hsl(45, 80%, 50%)" />
          <stop offset="100%" stopColor="hsl(0, 80%, 50%)" />
        </linearGradient>
      </defs>
      <rect x="20" y="30" width="500" height="290" fill="url(#sa-grid)" />

      {/* Temperature indicator */}
      <rect x="540" y="30" width="40" height="290" className="fill-muted stroke-border" strokeWidth="1" />
      <rect
        x="545"
        y={30 + (290 - tempHeight * 2.9)}
        width="30"
        height={tempHeight * 2.9}
        fill="url(#temp-gradient)"
        className="transition-all duration-300"
      />
      <text x="560" y="335" textAnchor="middle" className="fill-muted-foreground text-xs">
        Temp
      </text>
      <text x="560" y="350" textAnchor="middle" className="fill-foreground text-sm font-mono">
        {state.temperature.toFixed(1)}
      </text>

      {/* Cost function curve */}
      <polyline
        points={curvePoints}
        fill="none"
        className="stroke-primary"
        strokeWidth="3"
      />

      {/* History trail */}
      {state.history.length > 1 && (
        <g>
          {state.history.slice(0, -1).map((point, i) => {
            const coords = toScreenCoords(point.x, point.y);
            const nextCoords = toScreenCoords(state.history[i + 1].x, state.history[i + 1].y);
            const accepted = state.history[i + 1].accepted;
            return (
              <line
                key={i}
                x1={coords.screenX}
                y1={coords.screenY}
                x2={nextCoords.screenX}
                y2={nextCoords.screenY}
                className={accepted ? 'stroke-secondary' : 'stroke-destructive/30'}
                strokeWidth="1.5"
                strokeDasharray={accepted ? 'none' : '3,3'}
              />
            );
          })}
        </g>
      )}

      {/* Best position marker */}
      {state.history.length > 0 && state.bestX !== state.currentX && (
        <g>
          <circle
            cx={bestCoords.screenX}
            cy={bestCoords.screenY}
            r={10}
            className="fill-primary/30 stroke-primary"
            strokeWidth="2"
          />
          <text
            x={bestCoords.screenX}
            y={bestCoords.screenY - 15}
            textAnchor="middle"
            className="fill-primary text-xs font-medium"
          >
            Best
          </text>
        </g>
      )}

      {/* Current position */}
      {state.history.length > 0 && (
        <g>
          <circle
            cx={currentCoords.screenX}
            cy={currentCoords.screenY}
            r={12}
            className="fill-secondary"
          />
          {state.isRunning && (
            <circle
              cx={currentCoords.screenX}
              cy={currentCoords.screenY}
              r={12}
              className="fill-transparent stroke-secondary stroke-2 animate-ping"
            />
          )}
        </g>
      )}

      {/* Start position */}
      {state.history.length === 0 && (
        <circle
          cx={startCoords.screenX}
          cy={startCoords.screenY}
          r={8}
          className="fill-muted stroke-primary"
          strokeWidth="2"
        />
      )}

      {/* Info panel */}
      <rect x="20" y="350" width="500" height="90" rx="8" className="fill-card stroke-border" />
      <text x="40" y="375" className="fill-foreground text-sm font-medium">
        Current: x = {state.currentX.toFixed(3)}, f(x) = {state.currentY.toFixed(3)}
      </text>
      <text x="40" y="395" className="fill-primary text-sm">
        Best: x = {state.bestX.toFixed(3)}, f(x) = {state.bestY.toFixed(3)}
      </text>
      <text x="40" y="415" className="fill-muted-foreground text-xs">
        Steps: {state.stepsCount} | Downhill Accepts: {state.acceptedDownhill}
      </text>
      <text x="40" y="432" className="fill-muted-foreground text-xs">
        Temperature: {state.temperature.toFixed(2)}
      </text>
    </svg>
  );
}
