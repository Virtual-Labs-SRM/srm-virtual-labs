import { BFSState } from '@/hooks/useBFS';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, ListStart } from 'lucide-react';

interface BFSTraversalInfoProps {
  bfsState: BFSState;
  showSimpleExplanation?: boolean;
}

export function BFSSimpleExplanation({ bfsState }: { bfsState: BFSState }) {
  const nextNode = bfsState.queue.length > 0 ? bfsState.queue[0] : null;
  const nextParent = nextNode ? bfsState.parentMap.get(nextNode) : undefined;

  return (
    <Card className="bg-card/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Simple Explanation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {bfsState.isComplete ? (
          <p className="text-sm text-muted-foreground">
            All reachable nodes were visited level by level using the queue.
          </p>
        ) : nextNode ? (
          <>
            <p className="text-sm text-muted-foreground">
              BFS explores in waves: it always takes the front of the queue next.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>
                <span className="font-medium text-foreground">Dequeue</span>{' '}
                <span className="font-mono">{nextNode}</span>.
              </li>
              <li>
                Visit any <span className="font-medium text-foreground">unvisited neighbors</span>{' '}
                and enqueue them at the back (next frontier).
              </li>
            </ul>
            {nextParent && (
              <p className="text-xs text-muted-foreground">
                This node was reached from <span className="font-mono">{nextParent}</span>.
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            When you press start, BFS will enqueue the start node and then repeatedly dequeue the queue front.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function BFSTraversalInfo({
  bfsState,
  showSimpleExplanation = true,
}: BFSTraversalInfoProps) {
  const nextNode = bfsState.queue.length > 0 ? bfsState.queue[0] : null;

  const nextNodeLevel = (() => {
    if (!nextNode) return null;
    for (const [level, nodesAtLevel] of bfsState.levelNodes.entries()) {
      if (nodesAtLevel.includes(nextNode)) return level;
    }
    return null;
  })();

  const nextParent = nextNode ? bfsState.parentMap.get(nextNode) : undefined;

  return (
    <div className="space-y-4">
      {/* Next Step */}
      <Card className="bg-card/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-primary" />
            Next Step
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {bfsState.isComplete ? (
            <p className="text-sm font-medium text-primary">✓ BFS complete!</p>
          ) : nextNode ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-muted-foreground">Dequeue:</span>
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                  {nextNode}
                </span>
                {nextNodeLevel !== null && (
                  <span className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-mono">
                    Level {nextNodeLevel}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {nextParent ? (
                  <>
                    Reached from <span className="font-mono">{nextParent}</span>
                  </>
                ) : (
                  <>Start node (no parent)</>
                )}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Select a start node and begin BFS
            </p>
          )}
        </CardContent>
      </Card>

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

      {showSimpleExplanation && <BFSSimpleExplanation bfsState={bfsState} />}
    </div>
  );
}
