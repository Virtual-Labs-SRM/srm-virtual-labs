import { useRef, useMemo, useCallback, useState, useEffect } from 'react';
import { HillClimbingState, HillClimbingMode } from '@/hooks/useHillClimbing';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface EnhancedHillClimbingCanvasProps {
  state: HillClimbingState;
  startX: number;
  costFunction: (x: number) => number;
  domainMin: number;
  domainMax: number;
  mode: HillClimbingMode;
}

export function EnhancedHillClimbingCanvas({
  state,
  startX,
  costFunction,
  domainMin,
  domainMax,
  mode,
}: EnhancedHillClimbingCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const [dimensions, setDimensions] = useState({ width: 600, height: 450 });

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const baseWidth = dimensions.width;
  const baseHeight = dimensions.height;
  const padding = 50;

  // Calculate Y range dynamically
  const yRange = useMemo(() => {
    let minY = Infinity;
    let maxY = -Infinity;
    for (let x = domainMin; x <= domainMax; x += 0.05) {
      try {
        const y = costFunction(x);
        if (!isNaN(y) && isFinite(y)) {
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
        }
      } catch {
        // Skip invalid values
      }
    }

    // Ensure symmetry around origin for Y
    const absY = Math.max(Math.abs(minY), Math.abs(maxY), 1);
    const symmetricMax = absY * 1.2;
    return { min: -symmetricMax, max: symmetricMax };
  }, [costFunction, domainMin, domainMax]);

  // Convert data coords to base SVG coords (NO zoom/pan applied here)
  const toScreen = useCallback((x: number, y: number) => {
    const sx = ((x - domainMin) / (domainMax - domainMin)) * (baseWidth - 2 * padding) + padding;
    const sy = baseHeight - padding - ((y - yRange.min) / (yRange.max - yRange.min)) * (baseHeight - 2 * padding);
    return { sx, sy };
  }, [domainMin, domainMax, yRange]);

  // Origin position in screen coords
  const origin = useMemo(() => {
    const clampedX = Math.max(domainMin, Math.min(domainMax, 0));
    const clampedY = Math.max(yRange.min, Math.min(yRange.max, 0));
    return toScreen(clampedX, clampedY);
  }, [domainMin, domainMax, yRange, toScreen]);

  // Generate cost function curve points
  const curvePoints = useMemo(() => {
    const points: string[] = [];
    const step = (domainMax - domainMin) / 300;
    for (let x = domainMin; x <= domainMax; x += step) {
      try {
        const y = costFunction(x);
        if (!isNaN(y) && isFinite(y)) {
          const { sx, sy } = toScreen(x, y);
          points.push(`${sx},${sy}`);
        }
      } catch { /* skip */ }
    }
    return points.join(' ');
  }, [costFunction, domainMin, domainMax, toScreen]);

  // Grid lines — ticks at nice intervals through origin
  const gridLines = useMemo(() => {
    const xLines: { x: number; label: string; isOrigin: boolean }[] = [];
    const yLines: { y: number; label: string; isOrigin: boolean }[] = [];

    // Calculate nice step for X
    const xRange = domainMax - domainMin;
    const xStep = xRange <= 4 ? 0.5 : xRange <= 10 ? 1 : Math.ceil(xRange / 8);
    // Start from a nice multiple below domainMin
    const xStart = Math.ceil(domainMin / xStep) * xStep;
    for (let xv = xStart; xv <= domainMax; xv += xStep) {
      const { sx } = toScreen(xv, 0);
      xLines.push({ x: sx, label: xv.toFixed(xStep < 1 ? 1 : 0), isOrigin: Math.abs(xv) < 0.001 });
    }

    // Calculate nice step for Y
    const yRangeTotal = yRange.max - yRange.min;
    const yStep = yRangeTotal <= 4 ? 0.5 : yRangeTotal <= 10 ? 1 : yRangeTotal <= 20 ? 2 : Math.ceil(yRangeTotal / 6);
    const yStart = Math.ceil(yRange.min / yStep) * yStep;
    for (let yv = yStart; yv <= yRange.max; yv += yStep) {
      const { sy } = toScreen(0, yv);
      yLines.push({ y: sy, label: yv.toFixed(yStep < 1 ? 1 : 0), isOrigin: Math.abs(yv) < 0.001 });
    }
    return { xLines, yLines };
  }, [domainMin, domainMax, yRange, toScreen]);

  const startCoords = toScreen(startX, costFunction(startX));
  const currentCoords = state.currentX !== undefined
    ? toScreen(state.currentX, state.currentY)
    : startCoords;

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }
  };
  const handleMouseUp = () => setIsPanning(false);

  // Zoom via scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom(z => Math.min(Math.max(z * delta, 0.5), 3));
    };
    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  const handleZoomIn = () => setZoom(z => Math.min(z * 1.2, 3));
  const handleZoomOut = () => setZoom(z => Math.max(z / 1.2, 0.5));
  const handleReset = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  // Update zoom constraints/reset on resize if needed, but usually not required for SVG viewBox approach unless we want to maintain absolute scale.
  // We'll keep relative scale.

  useEffect(() => {
    handleReset();
  }, [costFunction, domainMin, domainMax]);

  // ViewBox-based zoom
  const vbW = baseWidth / zoom;
  const vbH = baseHeight / zoom;
  const vbX = (baseWidth - vbW) / 2 - pan.x / zoom;
  const vbY = (baseHeight - vbH) / 2 - pan.y / zoom;

  // Determine if origin is within viewport
  const originInX = domainMin <= 0 && domainMax >= 0;
  const originInY = yRange.min <= 0 && yRange.max >= 0;

  const optimumLabel = mode === 'maximize' ? 'Local Maximum' : 'Local Minimum';
  const optimumEmoji = mode === 'maximize' ? '🏔️' : '🕳️';

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {/* Zoom Controls */}
      <div className="absolute top-3 right-3 flex flex-col gap-1 z-10">
        <Button size="icon" variant="outline" className="h-7 w-7 bg-background/80 backdrop-blur-sm" onClick={handleZoomIn} title="Zoom In">
          <ZoomIn className="h-3.5 w-3.5" />
        </Button>
        <Button size="icon" variant="outline" className="h-7 w-7 bg-background/80 backdrop-blur-sm" onClick={handleZoomOut} title="Zoom Out">
          <ZoomOut className="h-3.5 w-3.5" />
        </Button>
        <Button size="icon" variant="outline" className="h-7 w-7 bg-background/80 backdrop-blur-sm" onClick={handleReset} title="Reset View">
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
      </div>

      <svg
        className="w-full h-full"
        viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Background */}
        <rect x={vbX} y={vbY} width={vbW} height={vbH} className="fill-background" />

        {/* Grid lines */}
        {gridLines.xLines.map((line, i) => (
          <g key={`x-${i}`}>
            {!line.isOrigin && (
              <line
                x1={line.x} y1={padding}
                x2={line.x} y2={baseHeight - padding}
                className="stroke-border/20" strokeWidth="1" strokeDasharray="4,4"
              />
            )}
            <text
              x={line.x} y={originInY ? Math.min(origin.sy + 16, baseHeight - padding + 18) : baseHeight - padding + 18}
              textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: '10px' }}
            >
              {line.label}
            </text>
          </g>
        ))}
        {gridLines.yLines.map((line, i) => (
          <g key={`y-${i}`}>
            {!line.isOrigin && (
              <line
                x1={padding} y1={line.y}
                x2={baseWidth - padding} y2={line.y}
                className="stroke-border/20" strokeWidth="1" strokeDasharray="4,4"
              />
            )}
            <text
              x={originInX ? Math.max(origin.sx - 8, padding - 8) : padding - 8}
              y={line.y + 4}
              textAnchor="end" className="fill-muted-foreground" style={{ fontSize: '10px' }}
            >
              {line.label}
            </text>
          </g>
        ))}

        {/* X-Axis through origin (or at bottom if origin not in range) */}
        <line
          x1={padding} y1={originInY ? origin.sy : baseHeight - padding}
          x2={baseWidth - padding} y2={originInY ? origin.sy : baseHeight - padding}
          className="stroke-foreground/60" strokeWidth="1.5"
        />
        {/* Y-Axis through origin (or at left if origin not in range) */}
        <line
          x1={originInX ? origin.sx : padding} y1={padding}
          x2={originInX ? origin.sx : padding} y2={baseHeight - padding}
          className="stroke-foreground/60" strokeWidth="1.5"
        />

        {/* Origin label */}
        {originInX && originInY && (
          <text
            x={origin.sx - 8} y={origin.sy + 16}
            textAnchor="end" className="fill-foreground/50" style={{ fontSize: '10px', fontWeight: 600 }}
          >
            0
          </text>
        )}

        {/* Axis labels */}
        <text
          x={baseWidth - padding + 16} y={originInY ? origin.sy + 4 : baseHeight - padding + 4}
          textAnchor="middle" className="fill-foreground/70" style={{ fontSize: '12px', fontWeight: 600 }}
        >
          x
        </text>
        <text
          x={originInX ? origin.sx : padding} y={padding - 12}
          textAnchor="middle" className="fill-foreground/70" style={{ fontSize: '12px', fontWeight: 600 }}
        >
          f(x)
        </text>

        {/* Arrowheads */}
        {/* X-axis arrow */}
        <polygon
          points={`${baseWidth - padding + 5},${originInY ? origin.sy : baseHeight - padding} ${baseWidth - padding - 3},${(originInY ? origin.sy : baseHeight - padding) - 4} ${baseWidth - padding - 3},${(originInY ? origin.sy : baseHeight - padding) + 4}`}
          className="fill-foreground/60"
        />
        {/* Y-axis arrow (points up) */}
        <polygon
          points={`${originInX ? origin.sx : padding},${padding - 5} ${(originInX ? origin.sx : padding) - 4},${padding + 3} ${(originInX ? origin.sx : padding) + 4},${padding + 3}`}
          className="fill-foreground/60"
        />

        {/* Cost function curve */}
        <polyline
          points={curvePoints}
          fill="none"
          className="stroke-primary"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* History path */}
        {state.history.length > 1 && (
          <polyline
            points={state.history.map(p => {
              const c = toScreen(p.x, p.y);
              return `${c.sx},${c.sy}`;
            }).join(' ')}
            fill="none"
            className="stroke-secondary"
            strokeWidth="2"
            strokeDasharray="6,3"
          />
        )}

        {/* History points */}
        {state.history.map((point, i) => {
          const c = toScreen(point.x, point.y);
          const isLast = i === state.history.length - 1;
          return (
            <g key={i}>
              {!isLast && (
                <circle cx={c.sx} cy={c.sy} r={5} className="fill-secondary/80" />
              )}
              {i === 0 && (
                <text x={c.sx} y={c.sy - 12} textAnchor="middle"
                  className="fill-secondary" style={{ fontSize: '11px', fontWeight: 500 }}>
                  Start
                </text>
              )}
            </g>
          );
        })}

        {/* Neighbor indicators */}
        {state.neighbors.map((neighbor, i) => {
          const c = toScreen(neighbor.x, neighbor.y);
          // Simple logic to find which neighbor is "better" for highlighting
          const currentY = state.currentY;
          const isBetterNeighbor = mode === 'maximize' ? neighbor.value > currentY : neighbor.value < currentY;
          const otherNeighbor = state.neighbors[1 - i];
          const isBest = isBetterNeighbor && (!otherNeighbor || (mode === 'maximize' ? neighbor.value >= otherNeighbor.value : neighbor.value <= otherNeighbor.value));

          return (
            <g
              key={i}
              className={`transition-all duration-500 ${state.phase === 'expanding' ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
              style={{ transform: `translate(${c.sx}px, ${c.sy}px)` }}
            >
              {isBest && state.phase === 'expanding' && (
                <circle
                  cx={0} cy={0} r={14}
                  className="fill-primary/20 animate-pulse"
                />
              )}
              <circle
                cx={0} cy={0} r={9}
                className={`transition-colors duration-300 ${isBest ? 'fill-primary stroke-primary' : 'fill-muted stroke-muted-foreground'}`}
                strokeWidth="2"
              />
              <text x={0} y={-16} textAnchor="middle"
                className="fill-muted-foreground font-mono" style={{ fontSize: '10px' }}>
                {neighbor.value.toFixed(2)}
              </text>
              <text x={0} y={4} textAnchor="middle"
                className={`${isBest ? 'fill-primary-foreground' : 'fill-foreground'}`} style={{ fontSize: '11px', fontWeight: 700 }}>
                {i === 0 ? 'L' : 'R'}
              </text>
            </g>
          );
        })}

        {/* Current position */}
        {state.history.length > 0 && (
          <g
            className="transition-all duration-700 ease-in-out"
            style={{ transform: `translate(${currentCoords.sx}px, ${currentCoords.sy}px)` }}
          >
            <circle cx={0} cy={0} r={18} className="fill-primary/20" />
            <circle cx={0} cy={0} r={12}
              className="fill-primary stroke-primary-foreground stroke-2" />
            {state.isRunning && (
              <circle cx={0} cy={0} r={12}
                className="fill-transparent stroke-primary stroke-2 animate-ping" />
            )}
            <text x={0} y={32} textAnchor="middle"
              className="fill-foreground font-semibold" style={{ fontSize: '12px' }}>
              x = {state.currentX.toFixed(3)}
            </text>
            <text x={0} y={46} textAnchor="middle"
              className="fill-muted-foreground" style={{ fontSize: '10px' }}>
              f(x) = {state.currentY.toFixed(3)}
            </text>
          </g>
        )}

        {/* Start position marker (before run) */}
        {state.history.length === 0 && (
          <g>
            <circle cx={startCoords.sx} cy={startCoords.sy} r={10}
              className="fill-muted stroke-primary" strokeWidth="3" strokeDasharray="4,2" />
            <text x={startCoords.sx} y={startCoords.sy + 26} textAnchor="middle"
              className="fill-muted-foreground" style={{ fontSize: '11px' }}>
              Start: x = {startX.toFixed(1)}
            </text>
          </g>
        )}

        {/* Title */}
        <text x={baseWidth / 2} y={20} textAnchor="middle"
          className="fill-foreground" style={{ fontSize: '13px', fontWeight: 500 }}>
          Hill Climbing — {mode === 'maximize' ? 'Maximize' : 'Minimize'} f(x)
        </text>

        {/* Local optimum indicator */}
        {state.localOptimumReached && (
          <g>
            <rect
              x={currentCoords.sx - 70} y={currentCoords.sy - 70}
              width="140" height="30" rx="6"
              className="fill-primary/90"
            />
            <text x={currentCoords.sx} y={currentCoords.sy - 50} textAnchor="middle"
              className="fill-primary-foreground" style={{ fontSize: '12px', fontWeight: 700 }}>
              {optimumEmoji} {optimumLabel}!
            </text>
          </g>
        )}
      </svg>

      {/* Zoom indicator */}
      {zoom !== 1 && (
        <div className="absolute bottom-2 left-2 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-1 rounded">
          {(zoom * 100).toFixed(0)}%
        </div>
      )}
    </div>
  );
}
