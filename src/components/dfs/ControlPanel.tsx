import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';
import { Graph, DFSState } from '@/types/graph';

interface ControlPanelProps {
  graph: Graph;
  dfsState: DFSState;
  selectedNode: string | null;
  speed: number;
  onSelectNode: (nodeId: string) => void;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onStep: () => void;
  onSpeedChange: (speed: number) => void;
}

export function ControlPanel({
  graph,
  dfsState,
  selectedNode,
  speed,
  onSelectNode,
  onStart,
  onPause,
  onResume,
  onReset,
  onStep,
  onSpeedChange,
}: ControlPanelProps) {
  const canStart = selectedNode && !dfsState.isRunning && !dfsState.isComplete;
  const canStep = selectedNode && !dfsState.isRunning && !dfsState.isComplete;

  return (
    <div className="space-y-6">
      {/* Start Node Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Start Node
        </label>
        <Select value={selectedNode || ''} onValueChange={onSelectNode}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select start node" />
          </SelectTrigger>
          <SelectContent>
            {graph.nodes.map((node) => (
              <SelectItem key={node.id} value={node.id}>
                Node {node.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Speed Control */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-foreground">
            Speed
          </label>
          <span className="text-sm text-muted-foreground font-mono">
            {speed.toFixed(1)}x
          </span>
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

      {/* Control Buttons */}
      <div className="grid grid-cols-2 gap-3">
        {!dfsState.isRunning ? (
          <Button 
            onClick={dfsState.stack.length > 0 ? onResume : onStart}
            disabled={!canStart && dfsState.stack.length === 0}
            className="gap-2"
          >
            <Play className="h-4 w-4" />
            {dfsState.stack.length > 0 ? 'Resume' : 'Start'}
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

      {/* Step Button */}
      <Button 
        onClick={onStep}
        disabled={!canStep}
        variant="outline"
        className="w-full gap-2"
      >
        <SkipForward className="h-4 w-4" />
        Step
      </Button>

      {/* Status */}
      {dfsState.isComplete && (
        <div className="p-3 rounded-md bg-primary/10 border border-primary/20">
          <p className="text-sm text-primary font-medium text-center">
            ✓ DFS Complete!
          </p>
        </div>
      )}
    </div>
  );
}
