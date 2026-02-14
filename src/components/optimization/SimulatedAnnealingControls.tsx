import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { SimulatedAnnealingState } from '@/hooks/useSimulatedAnnealing';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface SimulatedAnnealingControlsProps {
  state: SimulatedAnnealingState;
  startX: number;
  initialTemp: number;
  coolingRate: number;
  speed: number;
  onStartXChange: (x: number) => void;
  onInitialTempChange: (temp: number) => void;
  onCoolingRateChange: (rate: number) => void;
  onSpeedChange: (speed: number) => void;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
}

export function SimulatedAnnealingControls({
  state,
  startX,
  initialTemp,
  coolingRate,
  speed,
  onStartXChange,
  onInitialTempChange,
  onCoolingRateChange,
  onSpeedChange,
  onStart,
  onPause,
  onResume,
  onReset,
}: SimulatedAnnealingControlsProps) {
  const canStart = !state.isRunning && !state.isComplete;
  const canResume = !state.isRunning && state.history.length > 0 && !state.isComplete;

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label>Starting Position</Label>
          <span className="text-sm text-muted-foreground font-mono">{startX.toFixed(1)}</span>
        </div>
        <Slider
          value={[startX]}
          onValueChange={([v]) => onStartXChange(v)}
          min={-3}
          max={3}
          step={0.1}
          disabled={state.isRunning || state.history.length > 0}
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label>Initial Temperature</Label>
          <span className="text-sm text-muted-foreground font-mono">{initialTemp}</span>
        </div>
        <Slider
          value={[initialTemp]}
          onValueChange={([v]) => onInitialTempChange(v)}
          min={20}
          max={200}
          step={10}
          disabled={state.isRunning || state.history.length > 0}
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label>Cooling Rate</Label>
          <span className="text-sm text-muted-foreground font-mono">{coolingRate.toFixed(2)}</span>
        </div>
        <Slider
          value={[coolingRate]}
          onValueChange={([v]) => onCoolingRateChange(v)}
          min={0.85}
          max={0.99}
          step={0.01}
          disabled={state.isRunning || state.history.length > 0}
        />
        <p className="text-xs text-muted-foreground">
          Higher = slower cooling, more exploration
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label>Animation Speed</Label>
          <span className="text-sm text-muted-foreground font-mono">{speed.toFixed(1)}x</span>
        </div>
        <Slider
          value={[speed]}
          onValueChange={([v]) => onSpeedChange(v)}
          min={0.5}
          max={3}
          step={0.5}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {!state.isRunning ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={canResume ? onResume : onStart}
                disabled={!canStart && !canResume}
                className="gap-2"
              >
                <Play className="h-4 w-4" />
                {canResume ? 'Resume' : 'Start'}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Begin simulated annealing</TooltipContent>
          </Tooltip>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={onPause} variant="secondary" className="gap-2">
                <Pause className="h-4 w-4" />
                Pause
              </Button>
            </TooltipTrigger>
            <TooltipContent>Pause the animation</TooltipContent>
          </Tooltip>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={onReset} variant="outline" className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </TooltipTrigger>
          <TooltipContent>Reset to initial state</TooltipContent>
        </Tooltip>
      </div>

      {state.isComplete && (
        <div className="p-3 rounded-md bg-primary/10 border border-primary/20">
          <p className="text-sm font-medium text-center text-primary">
            ✓ Annealing Complete!
          </p>
          <p className="text-xs text-muted-foreground text-center mt-1">
            Best: f({state.bestX.toFixed(2)}) = {state.bestY.toFixed(3)}
          </p>
        </div>
      )}
    </div>
  );
}
