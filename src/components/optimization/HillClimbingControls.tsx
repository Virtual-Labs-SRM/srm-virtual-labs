import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { HillClimbingState } from '@/hooks/useHillClimbing';

interface HillClimbingControlsProps {
  state: HillClimbingState;
  startX: number;
  stepSize: number;
  speed: number;
  onStartXChange: (x: number) => void;
  onStepSizeChange: (size: number) => void;
  onSpeedChange: (speed: number) => void;
}

export function HillClimbingControls({
  state,
  startX,
  stepSize,
  speed,
  onStartXChange,
  onStepSizeChange,
  onSpeedChange,
}: HillClimbingControlsProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label>Starting Position (x)</Label>
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

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label>Step Size</Label>
          <span className="text-sm text-muted-foreground font-mono">{stepSize.toFixed(1)}</span>
        </div>
        <Slider
          value={[stepSize]}
          onValueChange={([v]) => onStepSizeChange(v)}
          min={0.1}
          max={1.0}
          step={0.1}
          disabled={state.isRunning}
        />
      </div>

      <div className="space-y-3">
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
    </div>
  );
}
