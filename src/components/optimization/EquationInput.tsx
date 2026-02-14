import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FunctionSquare, Play } from 'lucide-react';

interface EquationInputProps {
  onEquationChange: (equation: string) => void;
  disabled?: boolean;
}

const PRESET_EQUATIONS = [
  { label: 'Default: Multi-peak', value: 'default', equation: '-x^4/10 + x^3/2 + 2*x^2 - 3*x + 2' },
  { label: 'y = -x²', value: 'parabola', equation: '-x^2' },
  { label: 'y = x²', value: 'parabola-up', equation: 'x^2' },
  { label: 'y = sin(x)', value: 'sine', equation: 'sin(x)' },
  { label: 'y = -x² + 4x', value: 'quadratic', equation: '-x^2 + 4*x' },
  { label: 'y = cos(x) + 0.5sin(2x)', value: 'complex', equation: 'cos(x) + 0.5*sin(2*x)' },
  { label: 'Custom', value: 'custom', equation: '' },
];

export function EquationInput({ onEquationChange, disabled }: EquationInputProps) {
  const [preset, setPreset] = useState('default');
  const [customEquation, setCustomEquation] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handlePresetChange = (value: string) => {
    setPreset(value);
    if (value !== 'custom') {
      const selected = PRESET_EQUATIONS.find(p => p.value === value);
      if (selected) {
        setError(null);
        onEquationChange(selected.equation);
      }
    }
  };

  const handleApplyCustom = () => {
    try {
      // Validate equation by testing with x = 0
      const testFn = new Function('x', `return ${customEquation.replace(/\^/g, '**')}`);
      const result = testFn(0);
      if (typeof result !== 'number' || isNaN(result)) {
        throw new Error('Invalid result');
      }
      setError(null);
      onEquationChange(customEquation);
    } catch {
      setError('Invalid equation. Use x as variable. Example: x^2 + 2*x - 1');
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <FunctionSquare className="h-4 w-4 text-primary" />
          Custom Equation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <Label className="text-xs">Preset Function</Label>
          <Select value={preset} onValueChange={handlePresetChange} disabled={disabled}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRESET_EQUATIONS.map(eq => (
                <SelectItem key={eq.value} value={eq.value} className="text-xs">
                  {eq.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {preset === 'custom' && (
          <div className="space-y-2">
            <Label className="text-xs">f(x) = </Label>
            <Input
              value={customEquation}
              onChange={(e) => setCustomEquation(e.target.value)}
              placeholder="e.g., x^2 + sin(x)"
              className="h-8 text-xs font-mono"
              disabled={disabled}
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        )}

        {preset === 'custom' && (
          <Button
            size="sm"
            onClick={handleApplyCustom}
            disabled={disabled || !customEquation}
            className="w-full h-8 text-xs gap-1"
          >
            <Play className="h-3 w-3" />
            Apply Equation
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
