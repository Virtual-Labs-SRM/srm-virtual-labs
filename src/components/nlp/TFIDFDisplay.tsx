import { BowResult, TFIDFResult } from '@/hooks/useNLP';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface TFIDFDisplayProps {
  bowResults: BowResult[];
  tfidfResults: TFIDFResult[][];
  documents: string[];
}

export function TFIDFDisplay({ bowResults, tfidfResults, documents }: TFIDFDisplayProps) {
  return (
    <div className="space-y-6">
      {/* Bag of Words */}
      {bowResults.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Bag of Words</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-48 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-32">Term</TableHead>
                    <TableHead className="text-right">Count</TableHead>
                    <TableHead className="text-right">Frequency</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bowResults.slice(0, 10).map((result, i) => (
                    <TableRow key={result.term}>
                      <TableCell className="font-mono text-sm">{result.term}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">{result.count}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs">
                        {result.frequency.toFixed(3)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {bowResults.length > 10 && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Showing top 10 of {bowResults.length} terms
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* TF-IDF Comparison */}
      {tfidfResults.length === 2 && tfidfResults[0].length > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          {tfidfResults.map((results, docIndex) => (
            <Card key={docIndex}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  <span>Document {docIndex + 1}</span>
                  <Badge variant="outline" className="text-xs">
                    TF-IDF
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-64 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Term</TableHead>
                        <TableHead className="text-right w-16">TF</TableHead>
                        <TableHead className="text-right w-16">IDF</TableHead>
                        <TableHead className="text-right w-20">TF-IDF</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.slice(0, 8).map(result => (
                        <TableRow key={result.term}>
                          <TableCell className="font-mono text-xs">{result.term}</TableCell>
                          <TableCell className="text-right font-mono text-xs">
                            {result.tf.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs">
                            {result.idf.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            <span
                              className="font-mono text-xs px-1.5 py-0.5 rounded"
                              style={{
                                backgroundColor: `hsl(var(--primary) / ${Math.min(result.tfidf * 2, 1)})`,
                                color: result.tfidf > 0.3 ? 'hsl(var(--primary-foreground))' : 'inherit',
                              }}
                            >
                              {result.tfidf.toFixed(3)}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Visual Comparison */}
      {tfidfResults.length === 2 && tfidfResults[0].length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Term Importance Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array.from(new Set([
                ...tfidfResults[0].slice(0, 5).map(r => r.term),
                ...tfidfResults[1].slice(0, 5).map(r => r.term),
              ])).slice(0, 8).map(term => {
                const score1 = tfidfResults[0].find(r => r.term === term)?.tfidf || 0;
                const score2 = tfidfResults[1].find(r => r.term === term)?.tfidf || 0;
                const maxScore = Math.max(score1, score2, 0.01);

                return (
                  <div key={term} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-mono">{term}</span>
                    </div>
                    <div className="flex gap-1 items-center">
                      <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${(score1 / maxScore) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground w-8">D1</span>
                    </div>
                    <div className="flex gap-1 items-center">
                      <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-secondary transition-all"
                          style={{ width: `${(score2 / maxScore) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground w-8">D2</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
