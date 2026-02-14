import { BFSState } from '@/hooks/useBFS';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, ListStart } from 'lucide-react';

interface BFSTraversalInfoProps {
  bfsState: BFSState;
}

export function BFSTraversalInfo({ bfsState }: BFSTraversalInfoProps) {
  return (
    <div className="space-y-4">
      <Card className="bg-card/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-primary" />
            Traversal Order
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bfsState.traversalOrder.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {bfsState.traversalOrder.map((nodeId, index) => (
                <div key={`${nodeId}-${index}`} className="flex items-center">
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                    nodeId === bfsState.currentNode 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-secondary text-secondary-foreground'
                  }`}>
                    {nodeId}
                  </span>
                  {index < bfsState.traversalOrder.length - 1 && (
                    <ArrowRight className="h-3 w-3 mx-1 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">Select a start node and begin BFS</p>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <ListStart className="h-4 w-4 text-primary" />
            Queue (FIFO)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bfsState.queue.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {bfsState.queue.map((nodeId, index) => (
                <div
                  key={`queue-${nodeId}-${index}`}
                  className={`px-3 py-1.5 rounded-md text-sm font-mono ${
                    index === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {nodeId}
                  {index === 0 && <span className="ml-1 text-xs opacity-80">← front</span>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">Queue is empty</p>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Algorithm Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Nodes Visited:</span>
            <span className="font-mono font-medium">{bfsState.traversalOrder.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Current Level:</span>
            <span className="font-mono font-medium">{bfsState.currentLevel}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status:</span>
            <span className={`font-medium ${bfsState.isComplete ? 'text-primary' : 'text-foreground'}`}>
              {bfsState.isComplete ? 'Complete' : bfsState.isRunning ? 'Running' : 'Idle'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
