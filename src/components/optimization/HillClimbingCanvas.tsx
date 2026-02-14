import { useRef, useEffect, useMemo } from 'react';
import { HillClimbingState, costFunction } from '@/hooks/useHillClimbing';

interface HillClimbingCanvasProps {
  state: HillClimbingState;
  startX: number;
}

export function HillClimbingCanvas({ state, startX }: HillClimbingCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Generate cost function curve
  const curvePoints = useMemo(() => {
    const points: string[] = [];
    for (let x = -4; x <= 4; x += 0.1) {
      const y = costFunction(x);
      const screenX = ((x + 4) / 8) * 560 + 20;
      const screenY = 400 - ((y + 5) / 15) * 350;
      points.push(`${screenX},${screenY}`);
    }
    return points.join(' ');
  }, []);

  const toScreenCoords = (x: number, y: number) => ({
    screenX: ((x + 4) / 8) * 560 + 20,
    screenY: 400 - ((y + 5) / 15) * 350,
  });

  const startCoords = toScreenCoords(startX, costFunction(startX));
  const currentCoords = state.currentX !== undefined 
    ? toScreenCoords(state.currentX, state.currentY)
    : startCoords;

  return (
    <svg
      ref={svgRef}
      className="w-full h-full"
      viewBox="0 0 600 450"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Background grid */}
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" className="stroke-border" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect x="20" y="30" width="560" height="370" fill="url(#grid)" />
      
      {/* Axes */}
      <line x1="20" y1="400" x2="580" y2="400" className="stroke-foreground" strokeWidth="2" />
      <line x1="300" y1="30" x2="300" y2="400" className="stroke-foreground" strokeWidth="1" strokeDasharray="5,5" />
      
      {/* X-axis labels */}
      {[-4, -2, 0, 2, 4].map(x => {
        const screenX = ((x + 4) / 8) * 560 + 20;
        return (
          <text key={x} x={screenX} y="420" textAnchor="middle" className="fill-muted-foreground text-xs">
            {x}
          </text>
        );
      })}
      
      {/* Cost function curve */}
      <polyline
        points={curvePoints}
        fill="none"
        className="stroke-primary"
        strokeWidth="3"
      />
      
      {/* History path */}
      {state.history.length > 1 && (
        <polyline
          points={state.history.map(p => {
            const coords = toScreenCoords(p.x, p.y);
            return `${coords.screenX},${coords.screenY}`;
          }).join(' ')}
          fill="none"
          className="stroke-secondary"
          strokeWidth="2"
          strokeDasharray="5,5"
        />
      )}
      
      {/* History points */}
      {state.history.map((point, i) => {
        const coords = toScreenCoords(point.x, point.y);
        return (
          <circle
            key={i}
            cx={coords.screenX}
            cy={coords.screenY}
            r={i === state.history.length - 1 ? 0 : 5}
            className="fill-secondary"
          />
        );
      })}
      
      {/* Neighbor indicators */}
      {state.neighbors.map((neighbor, i) => {
        const coords = toScreenCoords(neighbor.x, neighbor.y);
        return (
          <g key={i}>
            <circle
              cx={coords.screenX}
              cy={coords.screenY}
              r={8}
              className="fill-muted stroke-muted-foreground"
              strokeWidth="2"
            />
            <text
              x={coords.screenX}
              y={coords.screenY - 15}
              textAnchor="middle"
              className="fill-muted-foreground text-xs font-mono"
            >
              {neighbor.value.toFixed(1)}
            </text>
          </g>
        );
      })}
      
      {/* Current position */}
      {state.history.length > 0 && (
        <g>
          <circle
            cx={currentCoords.screenX}
            cy={currentCoords.screenY}
            r={14}
            className="fill-primary"
          />
          {state.isRunning && (
            <circle
              cx={currentCoords.screenX}
              cy={currentCoords.screenY}
              r={14}
              className="fill-transparent stroke-primary stroke-2 animate-ping"
            />
          )}
          <text
            x={currentCoords.screenX}
            y={currentCoords.screenY + 30}
            textAnchor="middle"
            className="fill-foreground text-sm font-semibold"
          >
            x={state.currentX.toFixed(2)}
          </text>
          <text
            x={currentCoords.screenX}
            y={currentCoords.screenY + 45}
            textAnchor="middle"
            className="fill-muted-foreground text-xs"
          >
            f(x)={state.currentY.toFixed(2)}
          </text>
        </g>
      )}
      
      {/* Start position marker */}
      {state.history.length === 0 && (
        <g>
          <circle
            cx={startCoords.screenX}
            cy={startCoords.screenY}
            r={10}
            className="fill-muted stroke-primary"
            strokeWidth="2"
          />
          <text
            x={startCoords.screenX}
            y={startCoords.screenY + 25}
            textAnchor="middle"
            className="fill-muted-foreground text-xs"
          >
            Start: x={startX.toFixed(1)}
          </text>
        </g>
      )}
      
      {/* Labels */}
      <text x="300" y="20" textAnchor="middle" className="fill-foreground text-sm font-medium">
        Cost Function: f(x)
      </text>
      
      {/* Local max indicator */}
      {state.localMaxReached && (
        <g>
          <rect
            x={currentCoords.screenX - 60}
            y={currentCoords.screenY - 70}
            width="120"
            height="30"
            rx="5"
            className="fill-primary/20 stroke-primary"
          />
          <text
            x={currentCoords.screenX}
            y={currentCoords.screenY - 50}
            textAnchor="middle"
            className="fill-primary text-sm font-medium"
          >
            Local Maximum!
          </text>
        </g>
      )}
    </svg>
  );
}
