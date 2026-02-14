import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Graph } from '@/types/graph';
import { AStarState } from '@/hooks/useAStar';

interface AStarControlPanelProps {
  graph: Graph;
  astarState: AStarState;
  startNode: string | null;
  goalNode: string | null;
  speed: number;
  onSelectStart: (nodeId: string) => void;
  onSelectGoal: (nodeId: string) => void;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
}

export function AStarControlPanel({
  graph,
  astarState,
  startNode,
  goalNode,
  speed,
  onSelectStart,
  onSelectGoal,
  onStart,
  onPause,
  onResume,
  onReset,
  onSpeedChange,
}: AStarControlPanelProps) {
  const canStart = startNode && goalNode && startNode !== goalNode && !astarState.isRunning && !astarState.isComplete;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Start Node</label>
        <Select value={startNode || ''} onValueChange={onSelectStart}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select start" />
          </SelectTrigger>
          <SelectContent>
            {graph.nodes.map((node) => (
              <SelectItem key={node.id} value={node.id} disabled={node.id === goalNode}>
                Node {node.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Goal Node</label>
        <Select value={goalNode || ''} onValueChange={onSelectGoal}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select goal" />
          </SelectTrigger>
          <SelectContent>
            {graph.nodes.map((node) => (
              <SelectItem key={node.id} value={node.id} disabled={node.id === startNode}>
                Node {node.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-foreground">Speed</label>
          <span className="text-sm text-muted-foreground font-mono">{speed.toFixed(1)}x</span>
        </div>
        <Slider
          value={[speed]}
          onValueChange={([value]) => onSpeedChange(value)}
          min={0.5}
          max={3}
          step={0.5}
          className="w-full"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {!astarState.isRunning ? (
          <Button 
            onClick={astarState.openSet.length > 0 ? onResume : onStart}
            disabled={!canStart && astarState.openSet.length === 0}
            className="gap-2"
          >
            <Play className="h-4 w-4" />
            {astarState.openSet.length > 0 ? 'Resume' : 'Find Path'}
          </Button>
        ) : (
          <Button onClick={onPause} variant="secondary" className="gap-2">
            <Pause className="h-4 w-4" />
            Pause
          </Button>
        )}
        
        <Button onClick={onReset} variant="outline" className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>

      {astarState.isComplete && (
        <div className={`p-3 rounded-md border ${
          astarState.goalFound 
            ? 'bg-primary/10 border-primary/20' 
            : 'bg-destructive/10 border-destructive/20'
        }`}>
          <p className={`text-sm font-medium text-center ${
            astarState.goalFound ? 'text-primary' : 'text-destructive'
          }`}>
            {astarState.goalFound 
              ? `✓ Path found! Length: ${astarState.path.length}` 
              : '✗ No path exists'
            }
          </p>
        </div>
      )}
    </div>
  );
}
