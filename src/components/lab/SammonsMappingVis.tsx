
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw, ChevronRight, Calculator, Shuffle, CheckCircle2, BookOpen, Code2, Sparkles, Brain, Activity } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

// --- Types & Constants ---

type Point = {
    id: number | string;
    label: string;
    category: 'general' | 'code' | 'creative';
    x: number;
    y: number;
    targetX: number; // For animation
    targetY: number;
    color: string;
    isNew?: boolean; // Highlight new points
};

interface Message {
    id: string;
    text: string;
    sender: 'local' | 'remote';
}

interface SammonsMappingVisProps {
    liveMessages?: Message[];
}

type Step = {
    id: string;
    label: string;
    codeLine: number;
    desc: string;
};

const STEPS: Step[] = [
    { id: 'init', label: '1. Initialize', codeLine: 1, desc: "We start by scattering all messages randomly in 2D space. At this point, their positions have no meaning." },
    { id: 'dist', label: '2. Distances', codeLine: 4, desc: "The algorithm calculates the 'semantic distance' between every pair of messages based on their meaning (using 384-dimensional embeddings)." },
    { id: 'stress', label: '3. Stress', codeLine: 8, desc: "We measure 'Stress' (Error) by comparing the 2D distances on screen with the true semantic distances. High stress means the map is wrong." },
    { id: 'opt', label: '4. Optimize', codeLine: 12, desc: "Using Gradient Descent, we gently nudge each point to reduce Stress, pulling similar messages closer together and pushing dissimilar ones apart." },
    { id: 'conv', label: '5. Converged', codeLine: 18, desc: "The map is stable! Messages with similar meanings (like 'Hello' and 'Hi') are now physically grouped together." },
];

const CODE_SNIPPET = `def sammon_mapping(embeddings):
    # 1. Initialize random 2D points
    points = np.random.rand(N, 2)
    
    # 2. Compute high-D distances (Semantic)
    target_dist = pdist(embeddings)
    
    for i in range(MAX_ITER):
        # 3. Calculate Stress (Error)
        current_dist = pdist(points)
        stress = sum((target_dist - current_dist)**2)
        
        # 4. Update positions (Gradient Descent)
        gradients = compute_gradients(stress)
        points -= learning_rate * gradients
        
    # 5. Return optimized map
    return points`;

// Initial "Random" State
const INITIAL_POINTS: Point[] = [
    { id: 1, label: 'Hello!', category: 'general', x: 10, y: 15, targetX: 20, targetY: 20, color: '#3b82f6' },
    { id: 2, label: 'Hi there', category: 'general', x: 80, y: 75, targetX: 25, targetY: 25, color: '#3b82f6' },
    { id: 3, label: 'How are you?', category: 'general', x: 20, y: 70, targetX: 15, targetY: 30, color: '#3b82f6' },
    { id: 4, label: 'Good morning', category: 'general', x: 90, y: 15, targetX: 22, targetY: 18, color: '#3b82f6' },

    { id: 5, label: 'def add(a,b):', category: 'code', x: 40, y: 50, targetX: 75, targetY: 70, color: '#a855f7' },
    { id: 6, label: 'import numpy', category: 'code', x: 60, y: 25, targetX: 80, targetY: 75, color: '#a855f7' },
    { id: 7, label: 'console.log', category: 'code', x: 10, y: 60, targetX: 70, targetY: 65, color: '#a855f7' },
    { id: 8, label: 'return x + y', category: 'code', x: 30, y: 35, targetX: 78, targetY: 72, color: '#a855f7' },

    { id: 9, label: 'Haiku time', category: 'creative', x: 50, y: 80, targetX: 50, targetY: 20, color: '#f59e0b' },
    { id: 10, label: 'Poetic flow', category: 'creative', x: 70, y: 65, targetX: 55, targetY: 25, color: '#f59e0b' },
    { id: 11, label: 'Artistic mind', category: 'creative', x: 20, y: 25, targetX: 45, targetY: 15, color: '#f59e0b' },
    { id: 12, label: 'Create beauty', category: 'creative', x: 85, y: 35, targetX: 52, targetY: 28, color: '#f59e0b' },
];

// Simple Syntax Highlighter for Python (Aesthetic)
const highlightSyntax = (line: string) => {
    // Regex for basic Python tokens
    const parts = line.split(/(\bdef\b|\breturn\b|\bfor\b|\bin\b|\bwhile\b|\bif\b|\belse\b|\bimport\b|\bfrom\b|\bclass\b|#.*$|'.*?'|".*?"|\b\d+\b|\b[A-Z][a-zA-Z0-9_]*\b|\(|\))/g);

    return parts.map((part, i) => {
        if (!part) return null;
        if (part.startsWith('#')) return <span key={i} className="text-slate-400 italic">{part}</span>;
        if (part.startsWith("'") || part.startsWith('"')) return <span key={i} className="text-emerald-600">{part}</span>;
        if (/^\d+$/.test(part)) return <span key={i} className="text-amber-600">{part}</span>;
        if (['def', 'return', 'for', 'in', 'while', 'if', 'else', 'import', 'from', 'class'].includes(part))
            return <span key={i} className="text-indigo-600 font-bold">{part}</span>;
        if (/^[A-Z]/.test(part)) return <span key={i} className="text-violet-600">{part}</span>; // Classes/Constants
        if (part === '(' || part === ')') return <span key={i} className="text-slate-400">{part}</span>;
        return <span key={i} className="text-slate-700">{part}</span>;
    });
};

export function SammonsMappingVis({ liveMessages = [] }: SammonsMappingVisProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [points, setPoints] = useState<Point[]>(INITIAL_POINTS);
    const [isPlaying, setIsPlaying] = useState(false);
    const [stress, setStress] = useState(0.85); // Dummy stress value
    const [iteration, setIteration] = useState(0);

    const requestRef = useRef<number>();

    // Reset
    const handleReset = () => {
        setIsPlaying(false);
        setCurrentStep(0);
        setIteration(0);
        setStress(0.85);
        // Scramble positions
        setPoints(INITIAL_POINTS.map(p => ({
            ...p,
            x: Math.random() * 80 + 10,
            y: Math.random() * 70 + 10, // Restrict Y to 10-80% to avoid bottom banner
        })));
    };

    // Step Logic
    useEffect(() => {
        if (currentStep === 0) {
            // Init: Random positions (already set by reset, or initial)
        } else if (currentStep === 3) {
            // Optimize Loop starts
            setIsPlaying(true);
        } else if (currentStep === 4) {
            // Converged
            setIsPlaying(false);
            // Snap to final targets
            setPoints(prev => prev.map(p => ({ ...p, x: p.targetX, y: p.targetY })));
            setStress(0.04); // Low stress
        }
    }, [currentStep]);

    // --- Live Message Handling ---
    useEffect(() => {
        if (liveMessages.length === 0) return;

        // Find messages that aren't in our points list yet
        const existingIds = new Set(points.map(p => p.id));
        const newMsgs = liveMessages.filter(m => !existingIds.has(m.id));

        if (newMsgs.length > 0) {
            const newPoints: Point[] = newMsgs.map(msg => {
                // Determine category and approximate target based on keywords
                const text = msg.text.toLowerCase();
                let category: Point['category'] = 'general';
                let targetX = 20, targetY = 20; // Default (General cluster)
                let color = '#3b82f6';

                if (text.includes('code') || text.includes('function') || text.includes('python') || text.includes('return') || text.includes('def ')) {
                    category = 'code';
                    targetX = 75 + (Math.random() * 10 - 5);
                    targetY = 70 + (Math.random() * 10 - 5);
                    color = '#a855f7';
                } else if (text.includes('haiku') || text.includes('poem') || text.includes('art') || text.includes('story') || text.includes('creative')) {
                    category = 'creative';
                    targetX = 50 + (Math.random() * 10 - 5);
                    targetY = 25 + (Math.random() * 10 - 5);
                    color = '#f59e0b';
                } else {
                    // General/Intro
                    targetX = 15 + (Math.random() * 10 - 5);
                    targetY = 20 + (Math.random() * 10 - 5);
                }

                return {
                    id: msg.id,
                    label: (() => {
                        // Strip markdown (*, _, `, ~) and truncate
                        const cleanText = msg.text.replace(/[\*_`~]/g, '');
                        return cleanText.length > 20 ? cleanText.substring(0, 18) + '...' : cleanText;
                    })(),
                    category,
                    x: targetX + (Math.random() * 40 - 20), // Start somewhat far away
                    y: Math.max(10, Math.min(80, targetY + (Math.random() * 40 - 20))), // Clamp Y to 10-80%
                    targetX,
                    targetY,
                    color,
                    isNew: true
                };
            });

            setPoints(prev => [...prev, ...newPoints]);
            if (currentStep === 4) {
                setTimeout(() => {
                    setPoints(prev => prev.map(p =>
                        newPoints.find(np => np.id === p.id)
                            ? { ...p, x: p.targetX, y: p.targetY }
                            : p
                    ));
                }, 100);
            }
        }
    }, [liveMessages, points, currentStep]);

    // Animation Loop for "Optimization" phase
    const animate = () => {
        if (currentStep === 3) {
            setPoints(prevPoints => {
                const newPoints = prevPoints.map(p => {
                    // Move 5% towards target per frame
                    const dx = (p.targetX - p.x) * 0.05;
                    const dy = (p.targetY - p.y) * 0.05;
                    return { ...p, x: p.x + dx, y: p.y + dy };
                });

                // Check if close enough to stop
                const totalError = newPoints.reduce((acc, p) => acc + Math.abs(p.targetX - p.x), 0);
                if (totalError < 1) {
                    setCurrentStep(4); // Auto-advance to converged
                }
                return newPoints;
            });

            setStress(prev => Math.max(0.04, prev * 0.98));
            setIteration(prev => prev + 1);
        }
        requestRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        if (isPlaying) {
            requestRef.current = requestAnimationFrame(animate);
        }
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [isPlaying, currentStep]);

    // Next Step Handler
    const nextStep = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleReset();
        }
    };

    const activeStepInfo = STEPS[currentStep];

    return (
        <Card className="w-full border shadow-2xl overflow-hidden bg-white/60 backdrop-blur-xl border-white/40 ring-1 ring-white/60">
            <CardHeader className="bg-gradient-to-r from-indigo-50/50 via-white/50 to-purple-50/50 border-b border-indigo-50/50 pb-4">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-indigo-500" />
                            Interactive Sammon's Mapping
                        </CardTitle>
                        <CardDescription className="text-indigo-900/60 font-medium">
                            Watch the algorithm organize chaos into meaning.
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 gap-1 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50">
                            <RotateCcw className="h-4 w-4" /> Reset
                        </Button>
                        <Button
                            size="sm"
                            onClick={nextStep}
                            className={cn(
                                "h-8 gap-1 transition-all shadow-md hover:shadow-lg border-0",
                                currentStep === 4
                                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                                    : "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white"
                            )}
                        >
                            {currentStep === 4 ? (
                                <>Replay <RotateCcw className="h-4 w-4" /></>
                            ) : (
                                <>Next Step <ChevronRight className="h-4 w-4" /></>
                            )}
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-0">
                {/* TOP TOOLBAR: Stats & Info (Moved out of visualization to prevent overlap) */}
                <div className="bg-white/40 backdrop-blur-sm border-b border-indigo-50/50 px-4 py-3 flex justify-between items-center text-xs font-mono relative z-20">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="text-slate-500 font-medium uppercase tracking-wider text-[10px]">Global Stress</span>
                            <div className={cn("px-2 py-0.5 rounded-full font-bold transition-all shadow-sm border", stress < 0.1 ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100")}>
                                {stress.toFixed(4)}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-slate-500 font-medium uppercase tracking-wider text-[10px]">Iteration</span>
                            <div className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 font-bold shadow-sm">
                                {iteration}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row h-[500px] md:h-[400px]">

                    {/* LEFT: VISUALIZATION AREA */}
                    <div className="flex-1 relative overflow-hidden border-b md:border-b-0 md:border-r border-indigo-50/50 group">

                        {/* ANIMATED BACKGROUND */}
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 via-white/50 to-purple-50/30" />
                        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-200/20 via-transparent to-transparent animate-pulse opacity-50 pointer-events-none" />

                        {/* Grid Pattern (Subtle) */}
                        <div className="absolute inset-0 opacity-[0.03]"
                            style={{
                                backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)',
                                backgroundSize: '24px 24px'
                            }}
                        />

                        {/* The Points */}
                        <div className="relative w-full h-full">
                            {points.map((pt) => {
                                return (
                                    <div
                                        key={pt.id}
                                        className="absolute z-20 flex flex-col items-center justify-center pointer-events-none transition-all duration-300 ease-out"
                                        style={{
                                            left: `${pt.x}%`,
                                            top: `${pt.y}%`,
                                            transform: 'translate(-50%, -50%)',
                                        }}
                                    >
                                        {/* Container for Dot + Blink */}
                                        <div className="relative flex items-center justify-center w-4 h-4">
                                            {/* Glow Effect */}
                                            <div
                                                className="absolute inset-0 rounded-full opacity-40 blur-sm"
                                                style={{ backgroundColor: pt.color }}
                                            />

                                            {/* The Blinking Ring */}
                                            <div
                                                className={cn(
                                                    "absolute w-full h-full rounded-full opacity-75",
                                                    pt.isNew ? "animate-ping bg-current" : "hidden"
                                                )}
                                                style={{ color: pt.color }}
                                            />
                                            {/* The Solid Dot */}
                                            <div
                                                className="relative w-2.5 h-2.5 rounded-full border border-white shadow-sm ring-1 ring-black/5"
                                                style={{ backgroundColor: pt.color }}
                                            />
                                        </div>

                                        {/* The Label */}
                                        <div className="mt-2 bg-white/70 backdrop-blur-md border border-white/50 text-slate-800 text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-[0_2px_8px_-2px_rgba(0,0,0,0.1)] whitespace-nowrap z-50 transform transition-transform hover:scale-105">
                                            {pt.label}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Connection Lines */}
                            {(currentStep === 1 || currentStep === 2) && (
                                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30 z-0">
                                    {points.map((p1, i) =>
                                        points.slice(i + 1).map(p2 => (
                                            <line
                                                key={`${p1.id}-${p2.id}`}
                                                x1={`${p1.x}%`} y1={`${p1.y}%`}
                                                x2={`${p2.x}%`} y2={`${p2.y}%`}
                                                stroke="#818cf8"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                            />
                                        ))
                                    )}
                                </svg>
                            )}
                        </div>

                        {/* Step Explanation Overlay */}
                        <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none">
                            <div className="glass-panel bg-white/80 backdrop-blur-md border border-white/40 px-5 py-3 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-sm font-medium text-slate-700 flex items-center gap-3 animate-in slide-in-from-bottom-4 fade-in duration-500 max-w-[90%] md:max-w-[70%] text-center md:text-left ring-1 ring-black/5">
                                <Badge className="h-6 px-2.5 text-[10px] bg-gradient-to-r from-indigo-500 to-violet-500 text-white border-0 shadow-sm whitespace-nowrap shrink-0">
                                    Step {currentStep + 1}
                                </Badge>
                                <span className="text-xs md:text-sm leading-relaxed">{activeStepInfo.desc}</span>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: TABS (CODE OR THEORY) */}
                    <div className="w-full md:w-1/3 bg-slate-50/50 border-l border-indigo-50/50 flex flex-col overflow-hidden">
                        <Tabs defaultValue="code" className="flex-1 flex flex-col h-full">
                            <div className="px-3 py-2 border-b border-indigo-50/50 bg-white/50 backdrop-blur-sm">
                                <TabsList className="grid w-full grid-cols-2 h-8 bg-slate-100/50 p-1">
                                    <TabsTrigger value="code" className="text-[10px] font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600 transition-all">
                                        <Code2 className="h-3 w-3 mr-1.5" /> Code
                                    </TabsTrigger>
                                    <TabsTrigger value="theory" className="text-[10px] font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600 transition-all">
                                        <BookOpen className="h-3 w-3 mr-1.5" /> Theory
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            {/* TAB 1: CODE WALKTHROUGH (Aesthetic) */}
                            <TabsContent value="code" className="flex-1 flex flex-col min-h-0 m-0 data-[state=inactive]:hidden bg-[#fafafa]">
                                {/* Mac-style Header */}
                                <div className="bg-white/80 backdrop-blur-sm px-4 py-3 border-b border-slate-100 flex items-center gap-2 sticky top-0 z-10 transition-colors">
                                    <div className="flex gap-1.5 mr-2 group/dots">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-400 group-hover/dots:bg-red-500 transition-colors shadow-sm" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400 group-hover/dots:bg-amber-500 transition-colors shadow-sm" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 group-hover/dots:bg-emerald-500 transition-colors shadow-sm" />
                                    </div>
                                    <span className="text-[10px] font-mono text-slate-400 font-medium select-none ml-auto mr-auto opacity-70">sammon_mapping.py</span>
                                </div>

                                <div className="flex-1 overflow-auto p-4 space-y-1 font-mono text-[11px] bg-[#fafafa]">
                                    {CODE_SNIPPET.split('\n').map((line, idx) => {
                                        const isActive = activeStepInfo.codeLine === idx + 1 ||
                                            (activeStepInfo.codeLine === 12 && idx >= 11 && idx <= 14);

                                        return (
                                            <div
                                                key={idx}
                                                className={cn(
                                                    "relative pl-8 pr-2 py-1 rounded-md transition-all duration-300 group flex items-center",
                                                    isActive
                                                        ? "bg-indigo-50/80 shadow-sm ring-1 ring-indigo-500/10 translate-x-1"
                                                        : "hover:bg-slate-100/50"
                                                )}
                                            >
                                                {/* Active Indicator Line */}
                                                {isActive && (
                                                    <div className="absolute left-1 top-1.5 bottom-1.5 w-[3px] bg-indigo-500 rounded-full" />
                                                )}

                                                {/* Line Number */}
                                                <span className={cn(
                                                    "w-6 text-right mr-3 text-[9px] select-none font-medium transition-colors shrink-0",
                                                    isActive ? "text-indigo-400" : "text-slate-300 group-hover:text-slate-400"
                                                )}>
                                                    {idx + 1}
                                                </span>

                                                {/* Code Content */}
                                                <span className={cn(
                                                    "break-all transition-colors font-medium tracking-tight",
                                                    isActive ? "text-slate-700" : "text-slate-500"
                                                )} style={{ fontFamily: '"Fira Code", monospace' }}>
                                                    {highlightSyntax(line)}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="h-1 bg-slate-100 w-full mt-auto">
                                    <div
                                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700 ease-in-out"
                                        style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                                    />
                                </div>
                            </TabsContent>

                            {/* TAB 2: THEORY DEEP DIVE (Refined) */}
                            <TabsContent value="theory" className="flex-1 overflow-auto p-5 m-0 bg-white/50 data-[state=inactive]:hidden space-y-5">
                                <div className="p-4 bg-gradient-to-br from-indigo-50 to-white rounded-xl border border-indigo-100 shadow-sm">
                                    <h4 className="font-bold text-indigo-900 mb-2 flex items-center gap-2 text-sm">
                                        <Brain className="h-4 w-4 text-indigo-500" /> The Core Concept
                                    </h4>
                                    <p className="text-xs leading-relaxed text-slate-600">
                                        Sammon's Mapping is unique because it specifically tries to preserve <strong>local structure</strong>. It cares more about keeping close neighbors close than about global geometry.
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">The Math Magic</h5>

                                    <div className="bg-slate-900 text-slate-50 p-4 rounded-xl shadow-lg relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-2 opacity-10">
                                            <Calculator className="h-12 w-12" />
                                        </div>
                                        <div className="font-mono text-[10px] text-center mb-3 text-emerald-300 bg-white/5 p-2 rounded-lg border border-white/10">
                                            E = (1 / Σ d*) × Σ [ (d* - d)² / <span className="text-pink-400 font-bold border-b border-pink-400/50">d*</span> ]
                                        </div>
                                        <ul className="text-[10px] space-y-2 text-slate-300">
                                            <li className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                                <span><strong>d*</strong> = True meaning distance</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                                <span><strong>d</strong> = Map distance</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                                                <span className="text-pink-200">Dividing by <strong>d*</strong> is the secret!</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="font-bold text-[10px] text-slate-400 mb-1">Far Points (Large d*)</div>
                                        <div className="text-xl font-bold text-slate-300 mb-1">Small</div>
                                        <p className="text-[9px] text-slate-500 leading-tight">
                                            Penalty is divided by a big number. Errors here don't matter much.
                                        </p>
                                    </div>
                                    <div className="p-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="font-bold text-[10px] text-indigo-400 mb-1">Close Points (Small d*)</div>
                                        <div className="text-xl font-bold text-indigo-600 mb-1">HUGE</div>
                                        <p className="text-[9px] text-indigo-900/70 leading-tight">
                                            Penalty is divided by a tiny number. <strong>Errors are strictly punished!</strong>
                                        </p>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>

                </div>
            </CardContent>
        </Card>
    );
}
