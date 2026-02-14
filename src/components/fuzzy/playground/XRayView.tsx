import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Layers, Info } from 'lucide-react';
// import { RecognitionResult } from '@/hooks/useFuzzyDigitRecognition'; // Removed hook
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface RecognitionResult {
    predictedDigit: number;
    // ... we can just use any type here or define a proper one, but since we just need result to be non-null and have metrics...
    // Let's rely on loose typing or proper interface from a shared types file if we had one.
    // For now, let's redefine what we need.
    inputGrid?: number[][];
    templateGrid?: number[][];
    overlapGrid?: number[][];
}

interface XRayViewProps {
    result: RecognitionResult | any | null;
}

interface GridDisplayProps {
    grid: number[][];
    title: string;
    colorMode: 'input' | 'template' | 'overlap';
}

function GridDisplay({ grid, title, colorMode }: GridDisplayProps) {
    const getPixelStyle = (value: number) => {
        const opacity = value;

        switch (colorMode) {
            case 'input':
                return { backgroundColor: `rgba(255, 255, 255, ${opacity})` };
            case 'template':
                return { backgroundColor: `rgba(147, 197, 253, ${opacity})` }; // Light blue
            case 'overlap':
                return { backgroundColor: `rgba(168, 85, 247, ${opacity})` }; // Purple (primary accent)
            default:
                return { backgroundColor: `rgba(255, 255, 255, ${opacity})` };
        }
    };

    return (
        <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">{title}</span>
            <div
                className="grid gap-[1px] p-1 rounded-md bg-muted/30 border border-border/50"
                style={{ gridTemplateColumns: 'repeat(10, 1fr)' }}
            >
                {grid.map((row: any, rowIdx: any) =>
                    row.map((cell: any, colIdx: any) => (
                        <div
                            key={`${rowIdx}-${colIdx}`}
                            className="w-3 h-3 sm:w-4 sm:h-4 rounded-[2px] transition-all duration-200"
                            style={getPixelStyle(cell)}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

export function XRayView({ result }: XRayViewProps) {
    const emptyGrid = Array(10).fill(null).map(() => Array(10).fill(0));

    return (
        <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Layers className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold text-foreground">X-Ray View</h3>
                    </div>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <Info className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                                <p>The colored pixels show the 'Fuzzy Intersection'—the evidence used to make the decision.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>

                <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
                    <GridDisplay
                        grid={result?.inputGrid ?? emptyGrid}
                        title="Your Input"
                        colorMode="input"
                    />
                    <GridDisplay
                        grid={result?.templateGrid ?? emptyGrid}
                        title={result ? `Template "${result.predictedDigit}"` : 'Template'}
                        colorMode="template"
                    />
                    <GridDisplay
                        grid={result?.overlapGrid ?? emptyGrid}
                        title="Overlap (IoU)"
                        colorMode="overlap"
                    />
                </div>

                <p className="text-xs text-muted-foreground text-center mt-4">
                    The <span className="text-primary font-medium">purple pixels</span> show where your drawing matches the template — the fuzzy intersection.
                </p>
            </CardContent>
        </Card>
    );
}
