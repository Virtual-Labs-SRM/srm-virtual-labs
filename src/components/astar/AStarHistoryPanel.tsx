import { AStarState } from '@/hooks/useEnhancedAStar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { History, Calculator, ArrowRight } from 'lucide-react';

interface AStarHistoryPanelProps {
  astarState: AStarState;
}

export function AStarHistoryPanel({ astarState }: AStarHistoryPanelProps) {
  return (
    <div className="space-y-4">
      {/* Step-by-Step Calculations */}
      <Card className="bg-card/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calculator className="h-4 w-4 text-primary" />
            Current Step Calculation
          </CardTitle>
        </CardHeader>
        <CardContent>
          {astarState.currentNode && astarState.costs.get(astarState.currentNode) ? (
            <div className="space-y-3">
              <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-xs text-muted-foreground mb-1">Selected Node</p>
                <p className="text-lg font-bold text-primary">{astarState.currentNode}</p>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 bg-muted/50 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">g(n)</p>
                  <p className="text-sm font-mono font-bold text-foreground">
                    {astarState.costs.get(astarState.currentNode)?.g.toFixed(1)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Actual Cost</p>
                </div>
                <div className="p-2 bg-muted/50 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">h(n)</p>
                  <p className="text-sm font-mono font-bold text-secondary-foreground">
                    {astarState.costs.get(astarState.currentNode)?.h.toFixed(1)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Heuristic</p>
                </div>
                <div className="p-2 bg-primary/20 rounded-lg text-center">
                  <p className="text-xs text-primary">f(n)</p>
                  <p className="text-sm font-mono font-bold text-primary">
                    {astarState.costs.get(astarState.currentNode)?.f.toFixed(1)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Total</p>
                </div>
              </div>

              <div className="p-2 bg-muted/30 rounded text-xs font-mono text-center">
                f({astarState.currentNode}) = g({astarState.currentNode}) + h({astarState.currentNode}) = {' '}
                {astarState.costs.get(astarState.currentNode)?.g.toFixed(1)} + {' '}
                {astarState.costs.get(astarState.currentNode)?.h.toFixed(1)} = {' '}
                <span className="font-bold text-primary">
                  {astarState.costs.get(astarState.currentNode)?.f.toFixed(1)}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic text-center py-4">
              Start the algorithm to see calculations
            </p>
          )}
        </CardContent>
      </Card>

      {/* Open/Closed Sets */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-primary/5">
          <CardHeader className="pb-1 px-3 pt-3">
            <CardTitle className="text-xs flex items-center justify-between">
              <span>Open Set</span>
              <Badge variant="outline" className="text-[10px]">{astarState.openSet.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <ScrollArea className="h-[80px]">
              <div className="flex flex-wrap gap-1">
                {astarState.openSet.map(nodeId => {
                  const cost = astarState.costs.get(nodeId);
                  return (
                    <div
                      key={nodeId}
                      className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-primary/20 text-primary"
                    >
                      {nodeId}
                      {cost && <span className="opacity-70">({cost.f.toFixed(0)})</span>}
                    </div>
                  );
                })}
                {astarState.openSet.length === 0 && (
                  <span className="text-[10px] text-muted-foreground italic">Empty</span>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="bg-secondary/10">
          <CardHeader className="pb-1 px-3 pt-3">
            <CardTitle className="text-xs flex items-center justify-between">
              <span>Closed Set</span>
              <Badge variant="outline" className="text-[10px]">{astarState.closedSet.size}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <ScrollArea className="h-[80px]">
              <div className="flex flex-wrap gap-1">
                {Array.from(astarState.closedSet).map(nodeId => (
                  <div
                    key={nodeId}
                    className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-secondary text-secondary-foreground"
                  >
                    {nodeId}
                  </div>
                ))}
                {astarState.closedSet.size === 0 && (
                  <span className="text-[10px] text-muted-foreground italic">Empty</span>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* History Log */}
      <Card className="bg-card/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <History className="h-4 w-4 text-primary" />
            Step History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[180px]">
            <div className="space-y-2">
              {astarState.history.map((entry, i) => (
                <div
                  key={i}
                  className={`p-2 rounded-lg text-xs border ${
                    i === astarState.currentStep 
                      ? 'bg-primary/10 border-primary/30' 
                      : 'bg-muted/30 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-[10px] px-1">
                      Step {entry.step}
                    </Badge>
                    <span className="font-semibold text-foreground">
                      Node: {entry.currentNode}
                    </span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {entry.action}
                  </p>
                </div>
              ))}
              {astarState.history.length === 0 && (
                <p className="text-xs text-muted-foreground italic text-center py-4">
                  No steps yet
                </p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Path Result */}
      {astarState.path.length > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-primary" />
              Optimal Path Found!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-1">
              {astarState.path.map((nodeId, index) => (
                <div key={`${nodeId}-${index}`} className="flex items-center">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold bg-primary text-primary-foreground">
                    {nodeId}
                  </span>
                  {index < astarState.path.length - 1 && (
                    <ArrowRight className="h-3 w-3 mx-1 text-primary" />
                  )}
                </div>
              ))}
            </div>
            {astarState.costs.get(astarState.path[astarState.path.length - 1]) && (
              <p className="text-xs text-muted-foreground mt-2">
                Total path cost: {astarState.costs.get(astarState.path[astarState.path.length - 1])?.g.toFixed(1)}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
