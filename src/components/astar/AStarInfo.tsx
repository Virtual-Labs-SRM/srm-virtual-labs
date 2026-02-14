import { AStarState } from '@/hooks/useAStar';
import { Graph } from '@/types/graph';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Target, Layers } from 'lucide-react';

interface AStarInfoProps {
  astarState: AStarState;
  graph: Graph;
}

export function AStarInfo({ astarState, graph }: AStarInfoProps) {
  return (
    <div className="space-y-4">
      {/* Path Result */}
      {astarState.path.length > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Optimal Path
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {astarState.path.map((nodeId, index) => (
                <div key={`${nodeId}-${index}`} className="flex items-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold bg-primary text-primary-foreground">
                    {nodeId}
                  </span>
                  {index < astarState.path.length - 1 && (
                    <ArrowRight className="h-3 w-3 mx-1 text-primary" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Open Set */}
      <Card className="bg-card/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            Open Set (Frontier)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {astarState.openSet.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {astarState.openSet.map((nodeId, index) => {
                const cost = astarState.costs.get(nodeId);
                return (
                  <div
                    key={`open-${nodeId}-${index}`}
                    className="px-2 py-1 rounded-md text-xs font-mono bg-primary/20 text-primary"
                  >
                    {nodeId}
                    {cost && <span className="ml-1 opacity-70">f={cost.f.toFixed(0)}</span>}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">Empty</p>
          )}
        </CardContent>
      </Card>

      {/* Algorithm Stats */}
      <Card className="bg-card/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Algorithm Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Nodes Explored:</span>
            <span className="font-mono font-medium">{astarState.closedSet.size}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Frontier Size:</span>
            <span className="font-mono font-medium">{astarState.openSet.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status:</span>
            <span className={`font-medium ${astarState.isComplete ? (astarState.goalFound ? 'text-primary' : 'text-destructive') : 'text-foreground'}`}>
              {astarState.isComplete 
                ? (astarState.goalFound ? 'Path Found' : 'No Path') 
                : astarState.isRunning ? 'Searching...' : 'Idle'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
