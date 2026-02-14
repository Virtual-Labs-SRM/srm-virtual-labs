import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Network, Layers, Trophy, Users } from 'lucide-react';
import { ExpertNode, TraversalState, OntologyNode } from '@/hooks/useExpertMatchingOntology';

interface ExpertMatchingPanelsProps {
  traversalState: TraversalState;
  rankedExperts: ExpertNode[];
  ontologyNodes: OntologyNode[];
  queryTerms: string[];
  topK: number;
}

export function ExpertMatchingPanels({
  traversalState,
  rankedExperts,
  ontologyNodes,
  queryTerms,
  topK,
}: ExpertMatchingPanelsProps) {
  const getNodeLabel = (nodeId: string) => {
    const node = ontologyNodes.find(n => n.id === nodeId);
    return node?.label || nodeId;
  };

  return (
    <div className="space-y-4">
      {/* Traversal Panel */}
      <Card>
        <CardHeader className="py-3 px-4">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Network className="h-4 w-4 text-primary" />
            Traversal State
          </CardTitle>
        </CardHeader>
        <CardContent className="py-2 px-4 space-y-3">
          {/* Query Terms */}
          <div>
            <p className="text-xs text-muted-foreground mb-1">Query Terms</p>
            <div className="flex flex-wrap gap-1">
              {queryTerms.length > 0 ? (
                queryTerms.map((term, i) => (
                  <Badge key={i} variant="default" className="text-xs">
                    {term}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-muted-foreground italic">No query entered</span>
              )}
            </div>
          </div>

          {/* Current Node */}
          <div>
            <p className="text-xs text-muted-foreground mb-1">Current Node</p>
            {traversalState.currentNode ? (
              <Badge className="bg-yellow-500 text-yellow-950">
                {getNodeLabel(traversalState.currentNode)}
              </Badge>
            ) : (
              <span className="text-xs text-muted-foreground italic">
                {traversalState.isComplete ? 'Traversal complete' : 'Not started'}
              </span>
            )}
          </div>

          {/* Stack */}
          <div>
            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <Layers className="h-3 w-3" />
              Stack ({traversalState.stack.length})
            </p>
            <ScrollArea className="h-16">
              <div className="flex flex-wrap gap-1">
                {traversalState.stack.length > 0 ? (
                  traversalState.stack.map((nodeId, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {getNodeLabel(nodeId)}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground italic">Empty</span>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Expansion Order */}
          <div>
            <p className="text-xs text-muted-foreground mb-1">
              Expansion Order ({traversalState.expansionOrder.length})
            </p>
            <ScrollArea className="h-20">
              <div className="flex flex-wrap gap-1">
                {traversalState.expansionOrder.map((nodeId, i) => (
                  <Badge 
                    key={i} 
                    variant="secondary" 
                    className="text-xs bg-green-500/20 text-green-700"
                  >
                    {i + 1}. {getNodeLabel(nodeId)}
                  </Badge>
                ))}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      {/* Expert Ranking Panel */}
      <Card>
        <CardHeader className="py-3 px-4">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Trophy className="h-4 w-4 text-primary" />
            Expert Ranking (Top {topK})
          </CardTitle>
        </CardHeader>
        <CardContent className="py-2 px-4">
          <ScrollArea className="h-[200px]">
            {rankedExperts.length > 0 ? (
              <div className="space-y-2">
                {rankedExperts.slice(0, topK).map((expert, i) => (
                  <div 
                    key={expert.id} 
                    className="p-2 rounded-md bg-muted/50 border border-border/50"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-primary">#{i + 1}</span>
                        <span className="text-sm font-medium">{expert.name}</span>
                      </div>
                      <Badge variant="default" className="text-xs">
                        {(expert.relevanceScore * 100).toFixed(0)}%
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      {expert.experience}y exp • {expert.publications} pubs
                    </div>
                    {expert.matchingSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {expert.matchingSkills.map((skill, j) => (
                          <Badge 
                            key={j} 
                            variant="outline" 
                            className="text-[10px] px-1 py-0"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Enter a query and start matching</p>
                <p className="text-xs">to see expert rankings</p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}