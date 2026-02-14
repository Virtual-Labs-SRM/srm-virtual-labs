import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, HelpCircle } from 'lucide-react';
// import { RecognitionResult } from '@/hooks/useFuzzyDigitRecognition'; // Removed hook

interface RecognitionResult {
    predictedDigit: number;
    confidence: number;
}

interface PredictionCardProps {
    result: RecognitionResult | null;
}

export function PredictionCard({ result }: PredictionCardProps) {
    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 70) return 'text-green-500';
        if (confidence >= 40) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getConfidenceLabel = (confidence: number) => {
        if (confidence >= 70) return 'High Confidence';
        if (confidence >= 40) return 'Medium Confidence';
        if (confidence > 0) return 'Low Confidence';
        return 'No Input';
    };

    return (
        <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/30">
            <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Brain className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Prediction</h3>
                </div>

                <div className="text-center space-y-2">
                    {result && result.confidence > 0 ? (
                        <>
                            <div className="text-7xl font-bold text-foreground transition-all duration-300">
                                {result.predictedDigit}
                            </div>
                            <div className={`text-2xl font-semibold ${getConfidenceColor(result.confidence)} transition-all duration-300`}>
                                {result.confidence.toFixed(1)}%
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {getConfidenceLabel(result.confidence)}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="text-7xl font-bold text-muted-foreground/30">
                                <HelpCircle className="h-20 w-20 mx-auto" />
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Draw a digit to see the prediction
                            </div>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
