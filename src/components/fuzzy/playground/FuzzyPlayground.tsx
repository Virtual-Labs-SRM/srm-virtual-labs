
import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DrawingCanvas } from "./DrawingCanvas";
import { PredictionDisplay } from "./PredictionDisplay";
import { predictDigit, PredictionResult, loadModel, FUZZY_TEMPLATES as import_FUZZY_TEMPLATES } from "@/lib/fuzzyLogic";
import { Loader2, Pencil, Brain } from "lucide-react";

export function FuzzyPlayground() {
    const initialGrid = Array(28).fill(0).map(() => Array(28).fill(0));

    const [inputGrid, setInputGrid] = useState<number[][]>(initialGrid);
    const [predictions, setPredictions] = useState<PredictionResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modelReady, setModelReady] = useState(false);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                await loadModel();
                if (mounted) {
                    const preds = await predictDigit(initialGrid);
                    setPredictions(preds);
                    setIsLoading(false);
                    setModelReady(true);
                }
            } catch (error) {
                console.error('Failed to load model:', error);
                setIsLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, []);

    const handleInput = useCallback(async (grid: number[][]) => {
        setInputGrid(grid);
        try {
            const preds = await predictDigit(grid);
            setPredictions(preds);
        } catch (error) {
            console.error('Prediction error:', error);
        }
    }, []);

    if (!modelReady) {
        return (
            <div className="flex items-center justify-center p-12">
                <Card className="w-full max-w-md">
                    <CardContent className="p-8 text-center">
                        <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
                        <h3 className="text-lg font-semibold mb-2">Initializing Fuzzy Logic System</h3>
                        <p className="text-muted-foreground text-sm">Loading template matching engine...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Instructions */}
            <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
                <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Brain className="w-5 h-5 text-primary" />

                        Fuzzy Logic Digit Recognition Demo
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                        Experience how <strong>Fuzzy Set Theory</strong> and <strong>Neural Networks</strong> work together.
                        Draw a digit, then click <strong>"Visualize Process"</strong> for a slow-motion replay!
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        <div className="bg-background/50 p-2 rounded">
                            <strong>1. Fuzzification</strong>
                            <p className="text-muted-foreground">Convert pixels to fuzzy values</p>
                        </div>
                        <div className="bg-background/50 p-2 rounded">
                            <strong>2. Preprocessing</strong>
                            <p className="text-muted-foreground">Center and normalize</p>
                        </div>
                        <div className="bg-background/50 p-2 rounded">
                            <strong>3. Inference</strong>
                            <p className="text-muted-foreground">Compare with templates</p>
                        </div>
                        <div className="bg-background/50 p-2 rounded">
                            <strong>4. Defuzzification</strong>
                            <p className="text-muted-foreground">Get crisp prediction</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Main Content - Side by Side */}
            <div className="grid lg:grid-cols-5 gap-6">
                {/* Left: Drawing Canvas (2 cols) */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Pencil className="w-4 h-4" />
                                Drawing Canvas
                            </CardTitle>
                            <CardDescription>Draw a single digit (0-9)</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center">
                            <DrawingCanvas onDraw={handleInput} />

                            {/* Drawing Tips */}
                            <div className="mt-4 p-3 bg-muted/30 rounded-lg w-full max-w-[280px]">
                                <h4 className="text-xs font-semibold uppercase tracking-wider mb-2 text-muted-foreground">
                                    Tips for Best Results
                                </h4>
                                <ul className="text-xs text-muted-foreground space-y-1">
                                    <li>• Draw <strong>large</strong> - fill most of the canvas</li>
                                    <li>• Use <strong>thick strokes</strong> for better detection</li>
                                    <li>• Keep digit <strong>centered</strong> in the box</li>
                                    <li>• Draw <strong>clearly</strong> - avoid overlapping lines</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Target Templates Gallery */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <Brain className="w-4 h-4 text-indigo-500" />
                                Target Templates
                            </CardTitle>
                            <CardDescription>The system compares your input against these 10 patterns.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-5 gap-2">
                                {import_FUZZY_TEMPLATES.map((template, digit) => (
                                    <div key={digit} className="text-center">
                                        <div className="bg-slate-950 p-1 rounded border border-border/50 aspect-square flex items-center justify-center">
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(28, 1fr)', width: '100%', aspectRatio: '1/1' }}>
                                                {template.flat().map((val, i) => (
                                                    <div key={i} style={{ backgroundColor: val > 0 ? 'rgb(99, 102, 241)' : 'transparent' }} />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="text-xs font-mono mt-1 text-muted-foreground">{digit}</div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right: Prediction and Analysis (3 cols) */}
                <div className="lg:col-span-3">
                    <PredictionDisplay
                        inputGrid={inputGrid}
                        predictions={predictions}
                        isLoading={isLoading}
                    />
                </div>
            </div>
        </div>
    );
}
