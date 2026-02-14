import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, RotateCcw, Zap, Settings2 } from 'lucide-react';

interface ExpertMatchingControlsProps {
  query: string;
  setQuery: (q: string) => void;
  speed: number;
  setSpeed: (s: number) => void;
  topK: number;
  setTopK: (k: number) => void;
  isRunning: boolean;
  isPaused: boolean;
  isComplete: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onGenerateOntology: () => void;
}

export function ExpertMatchingControls({
  query,
  setQuery,
  speed,
  setSpeed,
  topK,
  setTopK,
  isRunning,
  isPaused,
  isComplete,
  onStart,
  onPause,
  onResume,
  onReset,
  onGenerateOntology,
}: ExpertMatchingControlsProps) {
  return (
    <div className="space-y-4 p-4 bg-card rounded-lg border">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Settings2 className="h-4 w-4" />
        Control Panel
      </div>

      {/* Query Input */}
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground">Domain Query</label>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., Deep Learning, Neural Networks"
          disabled={isRunning && !isPaused}
          className="text-sm"
        />
      </div>

      {/* Top-K Selector */}
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground">Top-K Experts</label>
        <Select 
          value={topK.toString()} 
          onValueChange={(v) => setTopK(parseInt(v))}
          disabled={isRunning && !isPaused}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3">Top 3</SelectItem>
            <SelectItem value="5">Top 5</SelectItem>
            <SelectItem value="10">Top 10</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Speed Control */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-xs text-muted-foreground">Animation Speed</label>
          <span className="text-xs font-medium">{speed.toFixed(1)}x</span>
        </div>
        <Slider
          value={[speed]}
          onValueChange={([v]) => setSpeed(v)}
          min={0.5}
          max={3}
          step={0.5}
          className="w-full"
        />
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        {!isRunning && !isComplete && (
          <Button onClick={onStart} className="col-span-2" disabled={!query.trim()}>
            <Play className="h-4 w-4 mr-2" />
            Start Matching
          </Button>
        )}

        {isRunning && !isPaused && (
          <Button onClick={onPause} variant="secondary" className="col-span-2">
            <Pause className="h-4 w-4 mr-2" />
            Pause
          </Button>
        )}

        {isRunning && isPaused && (
          <Button onClick={onResume} className="col-span-2">
            <Play className="h-4 w-4 mr-2" />
            Resume
          </Button>
        )}

        {(isRunning || isComplete) && (
          <Button onClick={onReset} variant="outline" className="col-span-2">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        )}

        {!isRunning && !isComplete && (
          <Button onClick={onGenerateOntology} variant="outline" className="col-span-2">
            <Zap className="h-4 w-4 mr-2" />
            Generate Ontology
          </Button>
        )}
      </div>
    </div>
  );
}