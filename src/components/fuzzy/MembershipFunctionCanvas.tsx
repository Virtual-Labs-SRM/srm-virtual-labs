import { useMemo } from 'react';
import { FuzzySet, getMembership } from '@/hooks/useFuzzyLogic';

interface MembershipFunctionCanvasProps {
  sets: FuzzySet[];
  inputValue?: number;
  title: string;
  showInput?: boolean;
}

export function MembershipFunctionCanvas({
  sets,
  inputValue = 50,
  title,
  showInput = true,
}: MembershipFunctionCanvasProps) {
  const width = 500;
  const height = 200;
  const padding = 40;
  const graphWidth = width - padding * 2;
  const graphHeight = height - padding * 1.5;

  const toScreenX = (x: number) => padding + (x / 100) * graphWidth;
  const toScreenY = (y: number) => padding + graphHeight - y * graphHeight;

  const curvePaths = useMemo(() => {
    return sets.map(set => {
      const points: string[] = [];
      for (let x = 0; x <= 100; x += 1) {
        const y = getMembership(x, set);
        points.push(`${toScreenX(x)},${toScreenY(y)}`);
      }
      return points.join(' ');
    });
  }, [sets]);

  const memberships = sets.map(set => ({
    name: set.name,
    degree: getMembership(inputValue, set),
    color: set.color,
  }));

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-foreground">{title}</h4>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full border border-border rounded-lg bg-card"
      >
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(x => (
          <line
            key={`v-${x}`}
            x1={toScreenX(x)}
            y1={padding}
            x2={toScreenX(x)}
            y2={padding + graphHeight}
            className="stroke-border"
            strokeWidth="0.5"
          />
        ))}
        {[0, 0.5, 1].map(y => (
          <line
            key={`h-${y}`}
            x1={padding}
            y1={toScreenY(y)}
            x2={padding + graphWidth}
            y2={toScreenY(y)}
            className="stroke-border"
            strokeWidth="0.5"
          />
        ))}

        {/* Axes */}
        <line
          x1={padding}
          y1={toScreenY(0)}
          x2={padding + graphWidth}
          y2={toScreenY(0)}
          className="stroke-foreground"
          strokeWidth="1.5"
        />
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={padding + graphHeight}
          className="stroke-foreground"
          strokeWidth="1.5"
        />

        {/* X-axis labels */}
        {[0, 25, 50, 75, 100].map(x => (
          <text
            key={`x-${x}`}
            x={toScreenX(x)}
            y={height - 8}
            textAnchor="middle"
            className="fill-muted-foreground text-xs"
          >
            {x}
          </text>
        ))}

        {/* Y-axis labels */}
        {[0, 0.5, 1].map(y => (
          <text
            key={`y-${y}`}
            x={padding - 8}
            y={toScreenY(y) + 4}
            textAnchor="end"
            className="fill-muted-foreground text-xs"
          >
            {y}
          </text>
        ))}

        {/* Membership function curves */}
        {sets.map((set, i) => (
          <polyline
            key={set.name}
            points={curvePaths[i]}
            fill="none"
            stroke={set.color}
            strokeWidth="2.5"
          />
        ))}

        {/* Input indicator line */}
        {showInput && (
          <line
            x1={toScreenX(inputValue)}
            y1={padding}
            x2={toScreenX(inputValue)}
            y2={padding + graphHeight}
            className="stroke-primary"
            strokeWidth="2"
            strokeDasharray="5,3"
          />
        )}

        {/* Membership degree markers */}
        {showInput && memberships.filter(m => m.degree > 0.01).map((m, i) => (
          <circle
            key={m.name}
            cx={toScreenX(inputValue)}
            cy={toScreenY(m.degree)}
            r={6}
            fill={m.color}
            className="stroke-background"
            strokeWidth="2"
          />
        ))}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-2">
        {sets.map(set => (
          <div key={set.name} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: set.color }}
            />
            <span className="text-xs text-muted-foreground">{set.name}</span>
            {showInput && (
              <span className="text-xs font-mono text-foreground">
                ({getMembership(inputValue, set).toFixed(2)})
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
