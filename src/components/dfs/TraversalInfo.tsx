import { DFSState } from '@/types/graph';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Layers } from 'lucide-react';

interface TraversalInfoProps {
  dfsState: DFSState;
}

export function TraversalInfo({ dfsState }: TraversalInfoProps) {
  return (
    <div className="space-y-4">
      {/* Traversal Order */}
      <Card className="bg-card/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-primary" />
            Traversal Order
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dfsState.traversalOrder.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {dfsState.traversalOrder.map((nodeId, index) => (
                <div key={`${nodeId}-${index}`} className="flex items-center">
                  <span 
                    className={`
                      inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold
                      ${nodeId === dfsState.currentNode 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-secondary text-secondary-foreground'
                      }
                    `}
                  >
                    {nodeId}
                  </span>
                  {index < dfsState.traversalOrder.length - 1 && (
                    <ArrowRight className="h-3 w-3 mx-1 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Select a start node and begin DFS
            </p>
          )}
        </CardContent>
      </Card>

      {/* Stack Visualization */}
      <Card className="bg-card/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            Recursion Stack
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dfsState.stack.length > 0 ? (
            <div className="flex flex-col-reverse gap-1">
              {dfsState.stack.map((nodeId, index) => (
                <div
                  key={`stack-${nodeId}-${index}`}
                  className={`
                    px-3 py-2 rounded-md text-sm font-mono text-center
                    ${index === dfsState.stack.length - 1
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                    }
                  `}
                >
                  {nodeId}
                  {index === dfsState.stack.length - 1 && (
                    <span className="ml-2 text-xs opacity-80">← top</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Stack is empty
            </p>
          )}
        </CardContent>
      </Card>

      {/* Algorithm Info */}
      <Card className="bg-card/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Algorithm Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Nodes Visited:</span>
            <span className="font-mono font-medium">{dfsState.visitedNodes.size}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Edges Traversed:</span>
            <span className="font-mono font-medium">{Math.floor(dfsState.traversedEdges.size / 2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status:</span>
            <span className={`font-medium ${dfsState.isComplete ? 'text-primary' : 'text-foreground'}`}>
              {dfsState.isComplete ? 'Complete' : dfsState.isRunning ? 'Running' : 'Idle'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
