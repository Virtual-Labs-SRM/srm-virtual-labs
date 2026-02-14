import { FuzzyState, FuzzyRule } from '@/hooks/useFuzzyLogic';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, Zap } from 'lucide-react';

interface FuzzyInferenceDisplayProps {
  state: FuzzyState;
  rules: FuzzyRule[];
}

export function FuzzyInferenceDisplay({ state, rules }: FuzzyInferenceDisplayProps) {
  return (
    <div className="space-y-4">
      {/* Fuzzification Results */}
      <Card className="bg-card/50">
        <CardContent className="p-4">
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">1</span>
            Fuzzification
          </h4>
          <div className="space-y-2">
            {state.memberships.length > 0 ? (
              state.memberships.map(m => (
                <div key={m.setName} className="flex items-center gap-3">
                  <span className="text-sm w-16 truncate">{m.setName}</span>
                  <Progress value={m.degree * 100} className="flex-1 h-2" />
                  <span className="text-xs font-mono w-12 text-right">{m.degree.toFixed(2)}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground italic">Adjust input to see memberships</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Rule Firing */}
      <Card className="bg-card/50">
        <CardContent className="p-4">
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">2</span>
            Rule Evaluation
          </h4>
          <div className="space-y-2">
            {rules.map((rule, i) => {
              const fired = state.firedRules.find(f => f.ruleId === rule.id);
              const strength = fired?.firingStrength || 0;
              const isActive = strength > 0.01;

              return (
                <div
                  key={rule.id}
                  className={`p-2 rounded-lg border transition-all ${
                    isActive ? 'border-primary/40 bg-primary/5' : 'border-border bg-muted/30'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span className={isActive ? 'text-foreground' : 'text-muted-foreground'}>
                      IF {rule.antecedent.set}
                    </span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <span className={isActive ? 'text-foreground' : 'text-muted-foreground'}>
                      THEN {rule.consequent.set}
                    </span>
                    {isActive && (
                      <Zap className="h-3 w-3 text-primary ml-auto" />
                    )}
                    <span className="font-mono ml-auto">{strength.toFixed(2)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Defuzzification Result */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">3</span>
            Defuzzification (Centroid)
          </h4>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground text-sm">Output Value:</span>
            <span className="text-2xl font-bold text-primary font-mono">
              {state.defuzzifiedValue.toFixed(1)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
