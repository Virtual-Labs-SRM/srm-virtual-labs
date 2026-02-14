import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, Zap, Target, Layers, Calculator, Cpu, GitBranch, Activity, Search, Scan, Play, X, CheckCircle2 } from "lucide-react";
import { FUZZY_TEMPLATES, getLastProcessingSteps } from "@/lib/fuzzyLogic";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface PredictionResult {
    digit: number;
    score: number;
    confidence: 'low' | 'medium' | 'high';
}

interface PredictionDisplayProps {
    inputGrid: number[][];
    predictions: PredictionResult[];
    isLoading?: boolean;
}

// Semantic colors that work in both light and dark modes
const confidenceConfig = {
    low: {
        color: "text-red-600 dark:text-red-400",
        bg: "bg-red-50 dark:bg-red-900/10",
        border: "border-red-200 dark:border-red-900/50",
        badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
        label: "Low"
    },
    medium: {
        color: "text-amber-600 dark:text-amber-400",
        bg: "bg-amber-50 dark:bg-amber-900/10",
        border: "border-amber-200 dark:border-amber-900/50",
        badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
        label: "Medium"
    },
    high: {
        color: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-50 dark:bg-emerald-900/10",
        border: "border-emerald-200 dark:border-emerald-900/50",
        badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
        label: "High"
    }
};

function MiniGrid({ grid, size = 48, type = 'input' }: { grid: number[][]; size?: number; type?: 'input' | 'template' | 'overlap' }) {
    const gridSize = grid.length;
    return (
        <div className="rounded border border-border bg-muted/30 overflow-hidden shadow-sm" style={{ width: size, height: size }}>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${gridSize}, 1fr)`, width: '100%', height: '100%' }}>
                {grid.flat().map((val, i) => {
                    let color: string;
                    // Use semantic colors for grids
                    if (type === 'template') color = val > 0 ? 'hsl(var(--primary))' : 'transparent';
                    else if (type === 'overlap') color = val > 0 ? 'hsl(var(--success))' : 'transparent';
                    else {
                        // Grayscale for input
                        const opacity = Math.min(val, 1).toFixed(2);
                        color = `rgba(0, 0, 0, ${opacity})`; // Default black ink on light
                    }
                    return <div key={i} style={{ backgroundColor: color }} className={val > 0 ? "" : "bg-card dark:bg-muted/10"} />;
                })}
            </div>
        </div >
    );
}

export function PredictionDisplay({ inputGrid, predictions, isLoading }: PredictionDisplayProps) {
    const [processingSteps, setProcessingSteps] = useState<ReturnType<typeof getLastProcessingSteps>>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [currentStep, setCurrentStep] = useState(0); // 0: Idle, 1: Input, 2: Preprocess, 3: Match, 4: Result

    useEffect(() => {
        setProcessingSteps(getLastProcessingSteps());
    }, [predictions]);

    // Animation Sequencer
    useEffect(() => {
        if (!isAnimating) return;

        const stepDurations = [0, 2000, 2500, 2500, 3000]; // Duration for each step

        if (currentStep < 4) {
            const timer = setTimeout(() => {
                setCurrentStep(prev => prev + 1);
            }, stepDurations[currentStep]);
            return () => clearTimeout(timer);
        } else {
            // End animation after step 4
            const timer = setTimeout(() => {
                setIsAnimating(false);
                setCurrentStep(0);
            }, stepDurations[4]);
            return () => clearTimeout(timer);
        }
    }, [isAnimating, currentStep]);

    const startAnimation = () => {
        setIsAnimating(true);
        setCurrentStep(1);
    };

    if (!predictions || predictions.length === 0) {
        return (
            <Card className="border-dashed">
                <CardContent className="p-8 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
                    <p className="text-muted-foreground">Initializing system...</p>
                </CardContent>
            </Card>
        );
    }

    const top = predictions[0];
    const topTemplate = (processingSteps as any)?.bestMatchTemplate || FUZZY_TEMPLATES[top.digit];
    const conf = confidenceConfig[top?.confidence || 'low'];
    const metrics = processingSteps?.metrics;

    const overlapGrid = (processingSteps?.centeredGrid || inputGrid).map((row, y) =>
        row.map((val, x) => (val > 0.2 && (topTemplate[y]?.[x] || 0) > 0) ? 1 : 0)
    );

    return (
        <div className="space-y-6 font-sans">
            {/* ANIMATION OVERLAY */}
            {isAnimating && (
                <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-6 right-6 hover:bg-destructive/10 hover:text-destructive transition-colors"
                        onClick={() => setIsAnimating(false)}
                    >
                        <X className="w-6 h-6" />
                    </Button>

                    <div className="w-full max-w-4xl space-y-12">
                        {/* Progress Stepper */}
                        <div className="relative flex justify-between items-center px-12 md:px-24">
                            {/* Connecting Line */}
                            <div className="absolute top-6 left-24 right-24 h-0.5 bg-border -z-10">
                                <div
                                    className="h-full bg-primary transition-all duration-700 ease-in-out"
                                    style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                                />
                            </div>

                            {[1, 2, 3, 4].map((step) => (
                                <div key={step} className="flex flex-col items-center gap-4 relative group">
                                    <div className={cn(
                                        "w-12 h-12 rounded-full flex items-center justify-center border-2 text-lg font-bold transition-all duration-500 bg-background",
                                        currentStep === step ? "border-primary text-primary scale-125 shadow-lg ring-4 ring-primary/20" :
                                            currentStep > step ? "bg-primary border-primary text-primary-foreground" : "border-muted text-muted-foreground"
                                    )}>
                                        {currentStep > step ? <CheckCircle2 className="w-6 h-6" /> : step}
                                    </div>
                                    <span className={cn(
                                        "text-xs font-bold uppercase tracking-widest absolute -bottom-8 w-32 text-center transition-all duration-300",
                                        currentStep === step ? "text-primary translate-y-0 opacity-100" : "text-muted-foreground translate-y-1 opacity-70"
                                    )}>
                                        {["Input", "Preprocess", "Match", "Result"][step - 1]}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Step Content Container - Uses grid overlapping for cross-fade */}
                        <div className="relative min-h-[450px] w-full grid place-items-center">

                            {/* STEP 1: INPUT */}
                            <div className={cn(
                                "col-start-1 row-start-1 w-full flex flex-col items-center text-center space-y-8 transition-all duration-700 ease-in-out",
                                currentStep === 1 ? "opacity-100 translate-y-0 scale-100 blur-0" : "opacity-0 translate-y-8 scale-95 blur-sm pointer-events-none absolute"
                            )}>
                                <div className="space-y-2">
                                    <h2 className="text-4xl font-black tracking-tight text-foreground">1. Fuzzification</h2>
                                    <p className="text-xl text-muted-foreground max-w-xl mx-auto">
                                        We scan your drawing on a 28×28 grid. Every pixel is converted into a
                                        <span className="text-primary font-bold"> fuzzy membership value</span> between 0 (white) and 1 (black).
                                    </p>
                                </div>

                                <div className="relative p-6 bg-card rounded-2xl shadow-2xl border-2 border-primary/20">
                                    <div className="absolute inset-0 bg-primary/5 animate-pulse rounded-2xl" />
                                    <MiniGrid grid={inputGrid} size={280} />

                                    {/* Scanline Effect */}
                                    <div className="absolute inset-0 w-full h-1 bg-primary/50 shadow-[0_0_15px_rgba(var(--primary),0.5)] animate-[scan_2s_ease-in-out_infinite]" />
                                </div>

                                {/* Code Block */}
                                <div className="w-full max-w-lg bg-slate-900 rounded-xl p-4 border border-blue-500/30 mt-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="bg-blue-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">1</span>
                                        <span className="text-blue-400 font-semibold text-sm">Fuzzification Code</span>
                                    </div>
                                    <pre className="text-[11px] text-green-400 overflow-x-auto leading-relaxed">
                                        <code>{`# Convert 28×28 pixel grid to fuzzy values
                                            def fuzzify(canvas_pixels):
                                            grid = np.zeros((28, 28))
                                            for y in range(28):
                                            for x in range(28):
                                            # Membership μ ∈ [0, 1]
                                            grid[y][x] = canvas_pixels[y][x] / 255.0
    return grid  # Fuzzy membership matrix`}</code>
                                    </pre>
                                </div>
                            </div>

                            {/* STEP 2: PREPROCESS */}
                            <div className={cn(
                                "col-start-1 row-start-1 w-full flex flex-col items-center space-y-10 transition-all duration-700 ease-in-out",
                                currentStep === 2 ? "opacity-100 translate-y-0 scale-100 blur-0" : "opacity-0 translate-y-8 scale-95 blur-sm pointer-events-none absolute"
                            )}>
                                <div className="text-center space-y-2">
                                    <h2 className="text-4xl font-black tracking-tight text-foreground">2. Normalization</h2>
                                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                                        To make the recognition robust, we <span className="text-sky-500 font-bold">center</span> the digit by its center of mass and <span className="text-sky-500 font-bold">scale</span> it to fit a 20×20 box inside the grid.
                                    </p>
                                </div>

                                <div className="flex items-center gap-12">
                                    <div className="flex flex-col items-center gap-3 opacity-50">
                                        <MiniGrid grid={inputGrid} size={140} />
                                        <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Original</div>
                                    </div>

                                    <ArrowRight className="w-16 h-16 text-primary animate-pulse" />

                                    <div className="relative">
                                        <div className="absolute -inset-6 bg-sky-500/20 blur-2xl rounded-full" />
                                        <div className="relative p-3 bg-card rounded-xl border-2 border-sky-500 shadow-2xl scale-125">
                                            <MiniGrid grid={processingSteps?.centeredGrid || inputGrid} size={180} />
                                        </div>
                                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap">
                                            <Badge variant="secondary" className="bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300 border-sky-200">
                                                Centered & Scaled
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                {/* Code Block */}
                                <div className="w-full max-w-lg bg-slate-900 rounded-xl p-4 border border-sky-500/30 mt-8">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="bg-sky-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">2</span>
                                        <span className="text-sky-400 font-semibold text-sm">Normalization Code</span>
                                    </div>
                                    <pre className="text-[11px] text-green-400 overflow-x-auto leading-relaxed">
                                        <code>{`def normalize(grid):
                                            # Find bounding box of digit
    rows, cols = np.where(grid > 0.2)
                                            bbox = (rows.min(), cols.min(),
                                            rows.max(), cols.max())

                                            # Center by mass & scale to 20×20
                                            cy, cx = np.mean(rows), np.mean(cols)
                                            centered = shift_to_center(grid, cy, cx)
    return scale_to_box(centered, 20, 20)`}</code>
                                    </pre>
                                </div>
                            </div>

                            {/* STEP 3: MATCHING */}
                            <div className={cn(
                                "col-start-1 row-start-1 w-full flex flex-col items-center text-center space-y-10 transition-all duration-700 ease-in-out",
                                currentStep === 3 ? "opacity-100 translate-y-0 scale-100 blur-0" : "opacity-0 translate-y-8 scale-95 blur-sm pointer-events-none absolute"
                            )}>
                                <div className="space-y-2">
                                    <h2 className="text-4xl font-black tracking-tight text-foreground">3. Pattern Matching</h2>
                                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                                        We compare your normalized drawing against <span className="text-indigo-500 font-bold">ideal templates</span>.
                                        The <strong>Jaccard Similarity</strong> (Overlap) determines the score.
                                    </p>
                                </div>

                                <div className="flex items-center justify-center gap-8 p-8 bg-card/50 rounded-3xl border border-border/50 backdrop-blur-sm">
                                    <div className="space-y-3">
                                        <MiniGrid grid={processingSteps?.centeredGrid || inputGrid} size={180} />
                                        <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Input</div>
                                    </div>

                                    <div className="flex flex-col items-center gap-2">
                                        <div className="text-6xl font-black text-muted-foreground/20">×</div>
                                        <Badge variant="outline" className="border-indigo-500/30 text-indigo-500">Intersection</Badge>
                                    </div>

                                    <div className="space-y-3 relative">
                                        <div className="absolute -top-3 -right-3 z-10">
                                            <Badge className="bg-primary text-primary-foreground hover:bg-primary shadow-lg scale-110">
                                                Best Match
                                            </Badge>
                                        </div>
                                        <MiniGrid grid={topTemplate} size={180} type="template" />
                                        <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Template {top.digit}</div>
                                    </div>

                                    <div className="flex flex-col items-center gap-2">
                                        <div className="text-6xl font-black text-muted-foreground/20">=</div>
                                    </div>

                                    <div className="space-y-3">
                                        <MiniGrid grid={overlapGrid} size={180} type="overlap" />
                                        <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                                            {Math.round(top.score * 100)}%
                                        </div>
                                    </div>
                                </div>

                                {/* Code Block */}
                                <div className="w-full max-w-lg bg-slate-900 rounded-xl p-4 border border-indigo-500/30 mt-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="bg-indigo-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">3</span>
                                        <span className="text-indigo-400 font-semibold text-sm">Pattern Matching Code</span>
                                    </div>
                                    <pre className="text-[11px] text-green-400 overflow-x-auto leading-relaxed">
                                        <code>{`def jaccard_similarity(input_grid, template):
                                            # Intersection: pixels ON in both
                                            intersection = np.sum(
        (input_grid > 0.2) & (template > 0)
                                            )
                                            # Union: pixels ON in either
                                            union = np.sum(
        (input_grid > 0.2) | (template > 0)
                                            )
    return intersection / union  # J(A,B)`}</code>
                                    </pre>
                                </div>
                            </div>

                            {/* STEP 4: RESULT */}
                            <div className={cn(
                                "col-start-1 row-start-1 w-full flex flex-col items-center text-center space-y-12 transition-all duration-700 ease-in-out",
                                currentStep === 4 ? "opacity-100 translate-y-0 scale-100 blur-0" : "opacity-0 translate-y-8 scale-95 blur-sm pointer-events-none absolute"
                            )}>
                                <div className="relative">
                                    <div className={`absolute inset-0 ${conf.bg} blur-[120px] opacity-60 rounded-full animate-pulse`} />
                                    <div className={`relative text-[14rem] leading-none font-black ${conf.color} drop-shadow-2xl scale-110`}>
                                        {top.digit}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h2 className="text-5xl font-black text-foreground tracking-tight">It's a {top.digit}!</h2>
                                    <p className="text-xl text-muted-foreground">
                                        Confidence: <span className={`font-bold ${conf.color}`}>{(metrics?.neuralPrediction ? metrics.neuralPrediction.confidence * 100 : top.score * 100).toFixed(1)}%</span>
                                    </p>
                                </div>

                                <div className="flex gap-6">
                                    <div className="flex items-center gap-4 px-6 py-4 bg-card rounded-2xl border shadow-lg">
                                        <div className={`p-4 rounded-full ${conf.bg}`}>
                                            {metrics?.neuralPrediction ? <Zap className={`w-8 h-8 ${conf.color}`} /> : <Layers className={`w-8 h-8 ${conf.color}`} />}
                                        </div>
                                        <div className="text-left">
                                            <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Engine</div>
                                            <div className="font-bold text-xl">{metrics?.neuralPrediction ? "Neural Network" : "Fuzzy Logic"}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Code Block */}
                                <div className="w-full max-w-lg bg-slate-900 rounded-xl p-4 border border-emerald-500/30 mt-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="bg-emerald-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">4</span>
                                        <span className="text-emerald-400 font-semibold text-sm">Defuzzification Code</span>
                                    </div>
                                    <pre className="text-[11px] text-green-400 overflow-x-auto leading-relaxed">
                                        <code>{`def defuzzify(scores):
                                            # scores = {digit: jaccard_score}
                                            # Select digit with highest membership
                                            best = max(scores, key=scores.get)
                                            confidence = scores[best]
    
    if confidence > 0.6: level = "high"
    elif confidence > 0.3: level = "medium"
                                            else: level = "low"
    
    return best, confidence, level`}</code>
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}


            {/* 1. Hero Prediction Card - Vibey Clean Look */}
            <div className={`relative overflow-hidden rounded-xl border-2 ${conf.border} ${conf.bg} shadow-sm transition-all duration-500 group`}>
                <div className="relative z-10 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex gap-6 items-center">
                            <div className="relative">
                                {/* Large Digit Display */}
                                <div className={`text-8xl font-black tracking-tighter ${conf.color} drop-shadow-sm`}>
                                    {top.digit}
                                </div>
                            </div>

                            <div className="border-l-2 border-border/50 pl-6 py-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="outline" className={`${conf.badge} border-transparent font-bold`}>
                                        {conf.label} Confidence
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                        {metrics?.neuralPrediction ? "Neural Net Score" : "Fuzzy Match Score"}
                                    </span>
                                </div>
                                <div className="text-4xl font-bold text-foreground tracking-tight">
                                    {metrics?.neuralPrediction ? (metrics.neuralPrediction.confidence * 100).toFixed(1) : (top.score * 100).toFixed(1)}%
                                </div>
                                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                    {metrics?.neuralPrediction ? <Zap className="w-3 h-3 text-amber-500" /> : <Cpu className="w-3 h-3" />}
                                    {metrics?.neuralPrediction ? "CNN Model Prediction" : "Fuzzy Inference Engine"}
                                </div>
                            </div>
                        </div>

                        {/* ACTION BUTTON & Architecture Summary */}
                        <div className="flex flex-col items-end gap-4">
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 bg-background/50 backdrop-blur-sm hover:bg-background border-primary/20 hover:border-primary/50 transition-all font-semibold"
                                onClick={startAnimation}
                            >
                                <Play className="w-4 h-4 text-primary" />
                                Visualize Process
                            </Button>

                            <div className="hidden sm:flex flex-col items-end gap-2 text-right">
                                {/* ... keep architecture badges ... */}
                                {metrics?.neuralPrediction && (
                                    <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full border border-emerald-100 dark:border-emerald-800">
                                        <Cpu className="w-3 h-3" /> TensorFlow.js Active
                                    </div>
                                )}
                                <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground bg-background/50 px-2 py-1 rounded-full border border-border/50">
                                    <GitBranch className="w-3 h-3" /> multi-scale template matching
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Decorative background gradient */}
                <div className={`absolute -right-20 -top-20 w-64 h-64 rounded-full opacity-10 bg-current ${conf.color} blur-3xl p-32`}></div>
            </div>

            {/* 2. System Architecture Visualizer */}
            <Card className="shadow-sm">
                <CardHeader className="py-3 px-4 border-b bg-muted/20">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <GitBranch className="w-3 h-3" />
                        Neural-Fuzzy Pipeline Architecture
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2">
                        {/* Nodes */}
                        <PipelineNode icon={<Scan className="w-4 h-4" />} label="Input" sub="Canvas" color="text-slate-500" active={isAnimating && currentStep === 1} />
                        <ArrowRight className={cn("w-4 h-4 text-muted-foreground/30 shrink-0", isAnimating && currentStep >= 1 && "text-primary animate-pulse")} />

                        <PipelineNode icon={<Target className="w-4 h-4" />} label="BBox" sub="Detection" color="text-sky-500" active={isAnimating && currentStep === 2} />
                        <ArrowRight className={cn("w-4 h-4 text-muted-foreground/30 shrink-0", isAnimating && currentStep >= 2 && "text-primary animate-pulse")} />

                        <PipelineNode icon={<Layers className="w-4 h-4" />} label="Norm" sub="Center" color="text-indigo-500" active={isAnimating && currentStep === 2} />
                        <ArrowRight className={cn("w-4 h-4 text-muted-foreground/30 shrink-0", isAnimating && currentStep >= 2 && "text-primary animate-pulse")} />

                        <PipelineNode icon={<Search className="w-4 h-4" />} label="Match" sub="Templates" color="text-purple-500" active={isAnimating && currentStep === 3} />
                        <ArrowRight className={cn("w-4 h-4 text-muted-foreground/30 shrink-0", isAnimating && currentStep >= 3 && "text-primary animate-pulse")} />

                        <PipelineNode icon={<Calculator className="w-4 h-4" />} label="Overlap" sub="Score" color="text-emerald-500" active={isAnimating && currentStep === 3} />
                        <ArrowRight className={cn("w-4 h-4 text-muted-foreground/30 shrink-0", isAnimating && currentStep >= 3 && "text-primary animate-pulse")} />

                        <PipelineNode icon={<Zap className="w-4 h-4" />} label="Result" sub="Output" color="text-amber-500" isLast active={isAnimating && currentStep === 4} />
                    </div>
                </CardContent>
            </Card>

            {/* ... keep metrics and step timeline ... */}
            {/* 3. Live Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <MetricCard
                    icon={<Activity className="w-4 h-4 text-indigo-500" />}
                    label="Overlap Score"
                    value={`${(top.score * 100).toFixed(2)}%`}
                    sub="Intersection / Union"
                />
                <MetricCard
                    icon={<Layers className="w-4 h-4 text-emerald-500" />}
                    label="Total Loops"
                    value={`${((metrics?.offsetsTried || 90) * (metrics?.totalPixels || 784) / 1000).toFixed(1)}k`}
                    sub="Total Iterations"
                />
                <MetricCard
                    icon={<Target className="w-4 h-4 text-amber-500" />}
                    label="Alignment"
                    value={`x:${metrics?.bestOffset.x ?? 0}, y:${metrics?.bestOffset.y ?? 0}`}
                    sub="Optimal Shift"
                />
                <MetricCard
                    icon={<Scan className="w-4 h-4 text-cyan-500" />}
                    label="Digit Size"
                    value={metrics?.boundingBox ? `${metrics.boundingBox.width}×${metrics.boundingBox.height}` : '0×0'}
                    sub="Bounding Box (px)"
                />
            </div>

            {/* 4. Step-by-Step Analysis Timeline */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 px-2">
                    <div className="h-4 w-1 bg-primary rounded-full" />
                    <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Fuzzy Inference Process</h3>
                </div>

                <Card className="overflow-hidden border shadow-sm">
                    <CardContent className="p-0">
                        {/* Step 1: Input Capture */}
                        <div className={cn("flex gap-4 p-4 border-b transition-colors duration-500", (isAnimating && currentStep === 1) ? "bg-primary/10" : "bg-muted/5")}>
                            <div className="flex flex-col items-center mt-1">
                                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border flex items-center justify-center text-xs font-bold text-muted-foreground">1</div>
                                <div className="w-px h-full bg-border my-1" />
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-sm">Fuzzification (Input Capture)</h4>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            The 28×28 grid captures your drawing. Each pixel is converted into a fuzzy membership value [0, 1].
                                        </p>
                                    </div>
                                    <MiniGrid grid={inputGrid} size={40} />
                                </div>
                            </div>
                        </div>

                        {/* Step 2: Preprocessing */}
                        <div className={cn("flex gap-4 p-4 border-b transition-colors duration-500", (isAnimating && currentStep === 2) ? "bg-primary/10" : "bg-muted/5")}>
                            <div className="flex flex-col items-center mt-1">
                                <div className="w-6 h-6 rounded-full bg-sky-100 dark:bg-sky-900/30 border-sky-200 dark:border-sky-800 flex items-center justify-center text-xs font-bold text-sky-600 dark:text-sky-400">2</div>
                                <div className="w-px h-full bg-border my-1" />
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-sm text-sky-600 dark:text-sky-400">Preprocessing</h4>
                                        <div className="text-xs text-muted-foreground mt-1 space-y-1">
                                            <p>• Bounding Box: <span className="font-mono">{metrics?.boundingBox ? `${metrics.boundingBox.width}×${metrics.boundingBox.height}` : 'N/A'}</span> detected</p>
                                            <p>• Centering: Shifted to mass center</p>
                                            <p>• Scaling: Bilinear interpolation to 20px</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MiniGrid grid={inputGrid} size={32} />
                                        <ArrowRight className="w-3 h-3 text-muted-foreground" />
                                        <MiniGrid grid={processingSteps?.centeredGrid || inputGrid} size={32} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 3: Pattern Matching */}
                        <div className={cn("flex gap-4 p-4 border-b transition-colors duration-500", (isAnimating && currentStep === 3) ? "bg-primary/10" : "bg-primary/5")}>
                            <div className="flex flex-col items-center mt-1">
                                <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400">3</div>
                                <div className="w-px h-full bg-border my-1" />
                            </div>
                            <div className="flex-1 space-y-3">
                                <div>
                                    <h4 className="font-bold text-sm text-indigo-600 dark:text-indigo-400">Pattern Matching (Shape Overlap)</h4>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        We calculate the <strong>Shape Overlap Score</strong>. This measures how much your drawing overlaps with the ideal template. A higher score means a better match.
                                    </p>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-card rounded-lg border shadow-sm w-fit">
                                    <div className="text-center">
                                        <MiniGrid grid={processingSteps?.centeredGrid || inputGrid} size={40} />
                                        <div className="text-[9px] mt-1 text-muted-foreground">Input</div>
                                    </div>
                                    <div className="text-lg font-black text-muted-foreground/30">∩</div>
                                    <div className="text-center">
                                        <MiniGrid grid={topTemplate} size={40} type="template" />
                                        <div className="text-[9px] mt-1 text-muted-foreground">Template {top.digit}</div>
                                    </div>
                                    <div className="text-lg font-black text-muted-foreground/30">=</div>
                                    <div className="text-center">
                                        <MiniGrid grid={overlapGrid} size={40} type="overlap" />
                                        <div className="text-[9px] mt-1 font-bold text-emerald-600">{Math.round(top.score * 100)}%</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 4: Defuzzification */}
                        <div className={cn("flex gap-4 p-4 transition-colors duration-500", (isAnimating && currentStep === 4) ? "bg-emerald-500/10" : "bg-muted/5")}>
                            <div className="flex flex-col items-center mt-1">
                                <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-xs font-bold text-emerald-600 dark:text-emerald-400">4</div>
                            </div>
                            <div className="flex-1 space-y-2">
                                <div>
                                    <h4 className="font-bold text-sm text-emerald-600 dark:text-emerald-400">Defuzzification & Result</h4>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        The highest similarity score is selected as the crisp output.
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-2">
                                    {predictions.slice(0, 5).map((pred, idx) => (
                                        <div key={pred.digit} className={`p-2 rounded border text-center ${idx === 0 ? 'bg-primary/10 border-primary/30' : 'bg-background border-border'}`}>
                                            <div className="text-xs font-bold mb-1">Digit {pred.digit}</div>
                                            <div className={`text-xs ${idx === 0 ? 'font-bold text-primary' : 'text-muted-foreground'}`}>
                                                {(pred.score * 100).toFixed(0)}%
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function PipelineNode({ icon, label, sub, color, isLast, active }: { icon: any, label: string, sub: string, color: string, isLast?: boolean, active?: boolean }) {
    return (
        <div className={cn("flex flex-col items-center gap-1 min-w-[50px] transition-all duration-300", active && "scale-110")}>
            <div className={cn(
                "w-8 h-8 rounded-full bg-card border shadow-sm flex items-center justify-center transition-all duration-300",
                color,
                active && "ring-4 ring-primary/20 bg-primary/10 shadow-lg"
            )}>
                {icon}
            </div>
            <div className="text-center">
                <div className={cn("text-[10px] font-bold", color, active && "text-primary scale-110")}>{label}</div>
                <div className="text-[9px] text-muted-foreground scale-90">{sub}</div>
            </div>
        </div>
    );
}

function MetricCard({ icon, label, value, sub }: { icon: any, label: string, value: string, sub: string }) {
    return (
        <Card className="bg-card border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-3">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    {icon} {label}
                </div>
                <div className="text-xl font-mono font-bold text-foreground truncate">
                    {value}
                </div>
                <div className="text-[10px] text-muted-foreground mt-1 truncate">
                    {sub}
                </div>
            </CardContent>
        </Card>
    );
}
