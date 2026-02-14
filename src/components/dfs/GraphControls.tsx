import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Shuffle, 
  Plus, 
  GitBranch, 
  Trash2, 
  MousePointer,
  RotateCcw,
  Home
} from 'lucide-react';
import { EditMode } from './GraphCanvas';

interface GraphControlsProps {
  editMode: EditMode;
  nodeCount: number;
  disabled: boolean;
  onEditModeChange: (mode: EditMode) => void;
  onNodeCountChange: (count: number) => void;
  onGenerateRandom: () => void;
  onClearGraph: () => void;
  onResetDefault: () => void;
}

export function GraphControls({
  editMode,
  nodeCount,
  disabled,
  onEditModeChange,
  onNodeCountChange,
  onGenerateRandom,
  onClearGraph,
  onResetDefault,
}: GraphControlsProps) {
  const editModes: { mode: EditMode; icon: React.ReactNode; label: string }[] = [
    { mode: 'none', icon: <MousePointer className="h-4 w-4" />, label: 'Select' },
    { mode: 'addNode', icon: <Plus className="h-4 w-4" />, label: 'Add Node' },
    { mode: 'addEdge', icon: <GitBranch className="h-4 w-4" />, label: 'Add Edge' },
    { mode: 'delete', icon: <Trash2 className="h-4 w-4" />, label: 'Delete' },
  ];

  return (
    <div className="space-y-4">
      {/* Edit Mode Toggle */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Edit Mode
        </label>
        <div className="grid grid-cols-2 gap-2">
          {editModes.map(({ mode, icon, label }) => (
            <Button
              key={mode}
              variant={editMode === mode ? 'default' : 'outline'}
              size="sm"
              disabled={disabled}
              onClick={() => onEditModeChange(mode)}
              className="gap-2 text-xs"
            >
              {icon}
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Random Graph Generation */}
      <div className="space-y-3 pt-2 border-t border-border">
        <label className="text-sm font-medium text-foreground">
          Random Graph
        </label>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Nodes</span>
            <span className="text-xs font-mono text-foreground">{nodeCount}</span>
          </div>
          <Slider
            value={[nodeCount]}
            onValueChange={([value]) => onNodeCountChange(value)}
            min={3}
            max={15}
            step={1}
            disabled={disabled}
          />
        </div>
        <Button
          onClick={onGenerateRandom}
          disabled={disabled}
          variant="secondary"
          className="w-full gap-2"
        >
          <Shuffle className="h-4 w-4" />
          Generate Random
        </Button>
      </div>

      {/* Graph Actions */}
      <div className="space-y-2 pt-2 border-t border-border">
        <Button
          onClick={onResetDefault}
          disabled={disabled}
          variant="outline"
          size="sm"
          className="w-full gap-2"
        >
          <Home className="h-4 w-4" />
          Default Graph
        </Button>
        <Button
          onClick={onClearGraph}
          disabled={disabled}
          variant="outline"
          size="sm"
          className="w-full gap-2 text-destructive hover:text-destructive"
        >
          <RotateCcw className="h-4 w-4" />
          Clear All
        </Button>
      </div>
    </div>
  );
}
