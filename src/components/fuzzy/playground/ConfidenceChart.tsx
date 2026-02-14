import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
// import { DigitScore } from '@/hooks/useFuzzyDigitRecognition'; // Removed hook dependency

interface DigitScore {
    digit: number;
    score: number;
}

interface ConfidenceChartProps {
    scores: DigitScore[] | null;
    predictedDigit: number | null;
}

export function ConfidenceChart({ scores, predictedDigit }: ConfidenceChartProps) {
    // Create default scores if none provided
    const displayScores = scores ?? Array.from({ length: 10 }, (_, i) => ({ digit: i, score: 0 }));

    // Sort by digit for display
    const sortedByDigit = [...displayScores].sort((a, b) => a.digit - b.digit);

    const getBarColor = (digit: number, score: number) => {
        if (digit === predictedDigit && score > 0) {
            return 'bg-primary';
        }
        if (score >= 0.5) {
            return 'bg-green-500/70';
        }
        if (score >= 0.3) {
            return 'bg-yellow-500/70';
        }
        return 'bg-muted-foreground/40';
    };

    return (
        <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Confidence Scores</h3>
                </div>

                <div className="space-y-2">
                    {sortedByDigit.map(({ digit, score }) => (
                        <div key={digit} className="flex items-center gap-3">
                            <span
                                className={`w-6 text-center font-mono font-bold text-sm ${digit === predictedDigit && score > 0
                                        ? 'text-primary'
                                        : 'text-muted-foreground'
                                    }`}
                            >
                                {digit}
                            </span>
                            <div className="flex-1 h-5 bg-muted/30 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-300 ease-out ${getBarColor(digit, score)}`}
                                    style={{ width: `${Math.max(score * 100, 0)}%` }}
                                />
                            </div>
                            <span className="w-12 text-right text-xs font-mono text-muted-foreground">
                                {(score * 100).toFixed(0)}%
                            </span>
                        </div>
                    ))}
                </div>

                <p className="text-xs text-muted-foreground text-center mt-4">
                    Live Jaccard similarity (IoU) for each digit template
                </p>
            </CardContent>
        </Card>
    );
}
