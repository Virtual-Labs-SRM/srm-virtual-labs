import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MapPin } from 'lucide-react';

interface HeuristicEntry {
  nodeId: string;
  label: string;
  heuristic: number;
}

interface AStarHeuristicsTableProps {
  heuristics: HeuristicEntry[];
  goalNode: string | null;
  currentNode: string | null;
}

export function AStarHeuristicsTable({ heuristics, goalNode, currentNode }: AStarHeuristicsTableProps) {
  if (!goalNode) {
    return (
      <Card className="bg-card/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Heuristics Table h(n)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground italic text-center py-4">
            Select a goal node to see heuristic values
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          Heuristics to Goal {goalNode}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[200px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs h-8">Node</TableHead>
                <TableHead className="text-xs h-8 text-right">h(n)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {heuristics
                .sort((a, b) => a.heuristic - b.heuristic)
                .map((entry) => (
                  <TableRow 
                    key={entry.nodeId}
                    className={
                      entry.nodeId === goalNode 
                        ? 'bg-destructive/10' 
                        : entry.nodeId === currentNode 
                        ? 'bg-primary/10' 
                        : ''
                    }
                  >
                    <TableCell className="text-xs font-mono py-1.5">
                      <span className={
                        entry.nodeId === goalNode 
                          ? 'text-destructive font-bold' 
                          : entry.nodeId === currentNode 
                          ? 'text-primary font-bold' 
                          : ''
                      }>
                        {entry.label}
                      </span>
                      {entry.nodeId === goalNode && (
                        <span className="ml-1 text-[10px] text-destructive">(Goal)</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs font-mono py-1.5 text-right">
                      {entry.heuristic.toFixed(1)}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
