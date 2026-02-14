import { useState, useMemo, useCallback } from 'react';
import { ExperimentLayout } from '@/components/layout/ExperimentLayout';
import { SectionCard, TheoryBlock, ComparisonCard, TermCard, FlowStep, HighlightItem } from '@/components/lab/SectionCard';
import { CodeBlock } from '@/components/lab/CodeBlock';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useHillClimbing, HillClimbingMode } from '@/hooks/useHillClimbing';
import { EnhancedHillClimbingCanvas } from '@/components/optimization/EnhancedHillClimbingCanvas';
import { HillClimbingControls } from '@/components/optimization/HillClimbingControls';
import { EquationInput } from '@/components/optimization/EquationInput';
import {
  Lightbulb, ArrowRight, TrendingUp, TrendingDown,
  Play, Pause, RotateCcw, StepForward, StepBack, Settings
} from 'lucide-react';

const HILL_CLIMBING_CODE = `import random

# Predefined accuracy map (k → accuracy%)
accuracy_map = {
    1: 70, 2: 78, 3: 85, 4: 90, 5: 93,
    6: 92, 7: 92, 8: 92, 9: 96, 10: 95
}

def hill_climbing(accuracy_map, start_k=None):
    """Hill climbing for hyperparameter tuning"""
    path = []  # Track the optimization path
    
    # Step 1: Choose starting point
    if start_k is None:
        current_k = random.choice(list(accuracy_map.keys()))
    else:
        current_k = start_k
    
    # Main hill climbing loop
    while True:
        path.append(current_k)
        current_accuracy = accuracy_map[current_k]
        
        # Step 2: Evaluate neighbors
        neighbors = []
        if current_k - 1 in accuracy_map:
            neighbors.append(current_k - 1)
        if current_k + 1 in accuracy_map:
            neighbors.append(current_k + 1)
        
        # Step 3: Find best neighbor
        best_neighbor = max(neighbors, key=lambda k: accuracy_map[k])
        best_accuracy = accuracy_map[best_neighbor]
        
        # Step 4: Move to better neighbor or stop
        if best_accuracy > current_accuracy:
            current_k = best_neighbor  # Move uphill
        else:
            # Local maximum reached!
            return current_k, current_accuracy, path

if __name__ == "__main__":
    best_k, best_acc, path = hill_climbing(accuracy_map, start_k=3)
    print(f"Path taken: {path}")
    print(f"Best k: {best_k}, Accuracy: {best_acc}%")`;



const ALGORITHM_PSEUDOCODE = `function HILL_CLIMBING(accuracy_map):
    current_k ← RANDOM_START()
    
    while TRUE:
        current_accuracy ← accuracy_map[current_k]
        neighbors ← GET_NEIGHBORS(current_k)
        best_neighbor ← FIND_BEST(neighbors)
        
        if accuracy_map[best_neighbor] > current_accuracy:
            current_k ← best_neighbor
        else:
            return current_k  // Local maximum reached`;

export function HillClimbingLab() {
  const [activeSection, setActiveSection] = useState('aim');

  // Demo state
  const [startX, setStartX] = useState(-2);
  const [stepSize, setStepSize] = useState(0.3);
  const [speed, setSpeed] = useState(1);
  const [hillMode, setHillMode] = useState<HillClimbingMode>('maximize');
  const [customEquation, setCustomEquation] = useState('-x^4/10 + x^3/2 + 2*x^2 - 3*x + 2');
  const domainMin = -4;
  const domainMax = 4;

  // Cost function from equation
  const costFunction = useMemo(() => {
    try {
      const fn = new Function('x', `
        const sin = Math.sin;
        const cos = Math.cos;
        const tan = Math.tan;
        const abs = Math.abs;
        const sqrt = Math.sqrt;
        const log = Math.log;
        const exp = Math.exp;
        const PI = Math.PI;
        return ${customEquation.replace(/\^/g, '**')};
      `);
      fn(0);
      return fn as (x: number) => number;
    } catch {
      return (x: number) => -Math.pow(x, 4) / 10 + Math.pow(x, 3) / 2 + 2 * Math.pow(x, 2) - 3 * x + 2;
    }
  }, [customEquation]);

  const { state, runHillClimbing, reset, pause, resume, stepOnce, stepBackward } = useHillClimbing(speed, costFunction, hillMode);

  const handleStart = useCallback(() => {
    runHillClimbing(startX, stepSize);
  }, [runHillClimbing, startX, stepSize]);

  const handleStep = useCallback(() => stepOnce(startX, stepSize), [stepOnce, startX, stepSize]);

  const handleEquationChange = useCallback((equation: string) => {
    setCustomEquation(equation);
    reset();
  }, [reset]);

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <ExperimentLayout
      experimentNumber={2}
      title="Hill Climbing Algorithm"
      subtitle="Real World Application: Hyperparameter Tuning"
      icon="Mountain"
      duration="~45 minutes"
      difficulty="Intermediate"
      tags={['Optimization', 'ML', 'Local Search']}
      activeSection={activeSection}
      onSectionChange={handleSectionChange}
    >
      {/* AIM SECTION */}
      <SectionCard id="aim" title="Aim" icon="Target">
        <p className="text-lg leading-relaxed mb-6">
          To implement a <strong className="text-primary">real-world application of the Hill Climbing Algorithm</strong> for{' '}
          <strong className="text-primary">hyperparameter tuning</strong> in machine learning models.
        </p>
        <div className="grid sm:grid-cols-3 gap-4">
          <HighlightItem icon="🔍" text="Understand local search optimization" />
          <HighlightItem icon="⚡" text="Apply hill climbing to tune k in KNN" />
          <HighlightItem icon="📈" text="Visualize the optimization path" />
        </div>
      </SectionCard>

      {/* THEORY SECTION */}
      <SectionCard id="theory" title="Theory" icon="BookOpen">
        <TheoryBlock title="What is Hill Climbing?">
          <p className="mb-4">
            Hill Climbing is a <strong>local search algorithm</strong> that continuously moves
            towards the direction of increasing value (uphill) to find the peak of the mountain
            (optimal solution). Think of it like a hiker trying to reach the summit in fog –
            they can only see their immediate surroundings and always step towards higher ground.
          </p>

          {/* Visual Explanation */}
          <div className="flex flex-col items-center gap-4 p-6 bg-muted/30 rounded-xl">
            <svg viewBox="0 0 400 200" className="w-full max-w-lg">
              <defs>
                <linearGradient id="hillGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" className="[stop-color:hsl(var(--secondary))]" />
                  <stop offset="100%" className="[stop-color:hsl(var(--secondary-dark))]" />
                </linearGradient>
              </defs>
              <rect width="400" height="200" className="fill-muted/50" />
              <path
                d="M0,180 Q50,170 80,140 Q110,110 140,100 Q170,90 200,60 Q230,90 250,95 Q280,100 320,80 Q360,100 400,120 L400,200 L0,200 Z"
                fill="url(#hillGradient)"
              />
              <circle cx="140" cy="100" r="6" className="fill-warning" />
              <text x="140" y="85" textAnchor="middle" className="fill-warning text-xs font-medium">Local Max</text>
              <circle cx="200" cy="60" r="8" className="fill-accent" />
              <text x="200" y="45" textAnchor="middle" className="fill-accent text-xs font-medium">Global Max</text>
              <circle cx="320" cy="80" r="6" className="fill-warning" />
              <text x="320" y="65" textAnchor="middle" className="fill-warning text-xs font-medium">Local Max</text>
              <circle cx="80" cy="135" r="8" className="fill-primary animate-pulse" />
              <text x="80" y="155" textAnchor="middle" className="fill-primary text-xs">Start</text>
            </svg>
          </div>
        </TheoryBlock>

        <TheoryBlock title="Local Maximum vs Global Maximum">
          <div className="grid md:grid-cols-2 gap-4">
            <ComparisonCard
              variant="local"
              icon="🏔️"
              title="Local Maximum"
              description="A point where no neighboring solution is better, but a better solution may exist elsewhere. Hill climbing can get 'stuck' here!"
              example="k=5 with 93% accuracy when k=9 gives 96%"
            />
            <ComparisonCard
              variant="global"
              icon="🏆"
              title="Global Maximum"
              description="The absolute best solution in the entire search space. This is what we ideally want to find!"
              example="k=9 with 96% accuracy (best possible)"
            />
          </div>
        </TheoryBlock>

        <TheoryBlock title="Why Use Hill Climbing for Hyperparameter Tuning?">
          <div className="flex flex-wrap items-start gap-4 justify-center">
            <FlowStep number={1} title="The Problem" description="ML models have hyperparameters (like 'k' in KNN) that affect performance" />
            <ArrowRight className="text-primary mt-8 hidden md:block" />
            <FlowStep number={2} title="The Challenge" description="Testing all combinations is expensive (Grid Search can be slow)" />
            <ArrowRight className="text-primary mt-8 hidden md:block" />
            <FlowStep number={3} title="The Solution" description="Hill climbing efficiently explores by only checking neighbors" />
          </div>
        </TheoryBlock>

        <TheoryBlock title="Key Terminology">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <TermCard term="State" definition="Current configuration (e.g., k=5)" />
            <TermCard term="Neighbors" definition="Adjacent states (k-1, k+1)" />
            <TermCard term="Objective Function" definition="What we maximize (accuracy)" />
            <TermCard term="Plateau" definition="Region with equal values" />
          </div>
        </TheoryBlock>
      </SectionCard>

      {/* ALGORITHM SECTION - Static Display Only */}
      <SectionCard id="algorithm" title="Algorithm" icon="Cog">
        <p className="text-muted-foreground mb-6">
          The Hill Climbing algorithm for hyperparameter tuning follows these steps:
        </p>

        <div className="space-y-4 mb-8">
          <div className="flex gap-4 p-4 rounded-xl bg-muted/30 border-2 border-transparent">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">1</div>
              <div className="w-0.5 flex-1 bg-border mt-2" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Initialize</h4>
              <p className="text-muted-foreground mb-3">Define the accuracy map for each k value (k=1 to k=10)</p>
              <div className="p-3 bg-card rounded-md font-mono text-sm overflow-x-auto">
                accuracy_map = {'{'}1:70, 2:78, 3:85, 4:90, 5:93, 6:92, 7:92, 8:92, 9:96, 10:95{'}'}
              </div>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-muted/30 border-2 border-transparent">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">2</div>
              <div className="w-0.5 flex-1 bg-border mt-2" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Choose Starting Point</h4>
              <p className="text-muted-foreground mb-3">Randomly select an initial value of k</p>
              <div className="p-3 bg-card rounded-md font-mono text-sm overflow-x-auto">
                current_k = random.choice([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
              </div>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-muted/30 border-2 border-transparent">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">3</div>
              <div className="w-0.5 flex-1 bg-border mt-2" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Evaluate Neighbors</h4>
              <p className="text-muted-foreground mb-3">Look at k-1 and k+1 (if they exist) and compare their accuracies</p>
              <div className="p-3 bg-card rounded-md font-mono text-sm overflow-x-auto">
                left_neighbor = accuracy_map.get(current_k - 1){'\n'}right_neighbor = accuracy_map.get(current_k + 1)
              </div>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-muted/30 border-2 border-transparent">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">4</div>
              <div className="w-0.5 flex-1 bg-border mt-2" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Move or Stop</h4>
              <p className="text-muted-foreground mb-3">If a neighbor has higher accuracy, move to it. Otherwise, stop (local max reached)</p>
              <div className="p-3 bg-card rounded-md font-mono text-sm overflow-x-auto">
                if best_accuracy {'>'} current_accuracy: current_k = best_neighbor
              </div>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-muted/30 border-2 border-transparent">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">5</div>
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Return Result</h4>
              <p className="text-muted-foreground">Return the best k found and visualize the optimization path</p>
            </div>
          </div>
        </div>

        <div className="bg-secondary rounded-xl p-6 overflow-x-auto">
          <h4 className="text-sm font-semibold text-secondary-foreground/70 mb-3">📝 Pseudocode</h4>
          <pre className="font-mono text-sm text-secondary-foreground leading-relaxed">{ALGORITHM_PSEUDOCODE}</pre>
        </div>
      </SectionCard>

      {/* PROGRAM SECTION */}
      <SectionCard id="program" title="Program" icon="Code">
        <p className="text-muted-foreground mb-6">
          Here's the complete Python implementation. Study the code and understand how each part
          corresponds to the algorithm steps.
        </p>

        <div className="space-y-6">
          <CodeBlock code={HILL_CLIMBING_CODE} language="python" title="hill_climbing.py" />
        </div>
      </SectionCard>

      {/* DEMO SECTION - Restructured Layout */}
      <SectionCard id="demo" title="Demo" icon="Play">
        <p className="text-muted-foreground mb-6">
          Experience the Hill Climbing algorithm in action! Select a starting point and watch
          how the algorithm navigates to find the optimal value.
        </p>

        <div className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Visualization (2/3 width) */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="overflow-hidden border-2 relative h-[500px] flex flex-col">
                <div className="flex-1 min-h-0 bg-muted/5 relative">
                  <EnhancedHillClimbingCanvas
                    state={state}
                    startX={startX}
                    costFunction={costFunction}
                    domainMin={domainMin}
                    domainMax={domainMax}
                    mode={hillMode}
                  />

                  {/* Floating Playback Controls Overlay - Matching A* Style */}
                  <div className="absolute bottom-6 right-6 flex items-center gap-2 bg-background/90 backdrop-blur-md p-2 rounded-xl border border-border shadow-2xl z-20 transition-all hover:scale-105 group-hover:border-primary/50">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={stepBackward}
                      disabled={state.isRunning || state.history.length <= 1}
                      className="h-9 w-9 p-0 hover:bg-primary/10"
                      title="Step Backward"
                    >
                      <StepBack className="h-4 w-4" />
                    </Button>

                    {!state.isRunning ? (
                      <Button
                        size="sm"
                        onClick={() => {
                          if (state.history.length > 0 && !state.isComplete) resume();
                          else handleStart();
                        }}
                        disabled={state.isComplete}
                        className="gap-2 h-9 px-4 gradient-primary shadow-lg"
                      >
                        <Play className="h-4 w-4" />
                        <span>{state.history.length > 0 && !state.isComplete ? 'Resume' : 'Start'}</span>
                      </Button>
                    ) : (
                      <Button
                        onClick={pause}
                        size="sm"
                        variant="secondary"
                        className="gap-2 h-9 px-4 border shadow-md"
                      >
                        <Pause className="h-4 w-4" />
                        <span>Pause</span>
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleStep}
                      disabled={state.isRunning || state.isComplete}
                      className="h-9 w-9 p-0 hover:bg-primary/10"
                      title="Step Forward"
                    >
                      <StepForward className="h-4 w-4" />
                    </Button>

                    <div className="w-px h-6 bg-border mx-1" />

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={reset}
                      className="h-9 w-9 p-0 hover:bg-destructive/10 hover:text-destructive"
                      title="Reset"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Status Badge Overlay */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none z-20">
                    <Badge variant="secondary" className="backdrop-blur-md bg-background/50 border border-neutral-300 shadow-sm w-fit text-black text-xs">
                      Steps: {state.stepsCount}
                    </Badge>
                    {state.localOptimumReached && (
                      <div className="px-3 py-1.5 rounded-md bg-primary/90 text-primary-foreground text-sm font-bold shadow-lg animate-in fade-in zoom-in duration-300">
                        {hillMode === 'maximize' ? '🏔️ Local Maximum Found' : '🕳️ Local Minimum Found'}
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Algorithmic Explanation Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-warning" />
                    How it works
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    The Hill Climbing algorithm performs a local search. At each step, it:
                  </p>
                  <ol className="list-decimal list-inside mt-3 space-y-1 text-muted-foreground ml-2">
                    <li>Evaluates potential moves (left or right) from the current position.</li>
                    <li>Selects the direction that leads to a higher value (uphill).</li>
                    <li>Repeats until no neighbors offer a better value (Local Selection).</li>
                  </ol>
                  <p className="text-xs text-muted-foreground mt-4 italic">
                    Note: It may get stuck at a "Local Maximum" (a smaller peak) instead of finding the "Global Maximum" (highest peak).
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Controls & Status (1/3 width) */}
            <div className="space-y-6">

              {/* 1. Equation Input */}
              <EquationInput
                onEquationChange={handleEquationChange}
                disabled={state.isRunning}
              />

              {/* 1.5 Mode Toggle */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    {hillMode === 'maximize' ? <TrendingUp className="h-4 w-4 text-green-500" /> : <TrendingDown className="h-4 w-4 text-blue-500" />}
                    Optimization Goal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={hillMode === 'maximize' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => { setHillMode('maximize'); reset(); }}
                      disabled={state.isRunning}
                      className={`gap-1.5 text-xs ${hillMode === 'maximize' ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`}
                    >
                      <TrendingUp className="h-3.5 w-3.5" />
                      Maximize
                    </Button>
                    <Button
                      variant={hillMode === 'minimize' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => { setHillMode('minimize'); reset(); }}
                      disabled={state.isRunning}
                      className={`gap-1.5 text-xs ${hillMode === 'minimize' ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`}
                    >
                      <TrendingDown className="h-3.5 w-3.5" />
                      Minimize
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {hillMode === 'maximize'
                      ? 'Climbing uphill to find the highest point (local maximum).'
                      : 'Descending downhill to find the lowest point (local minimum).'}
                  </p>
                </CardContent>
              </Card>

              {/* 2. Configuration Parameters */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Settings className="h-4 w-4 text-primary" />
                    Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <HillClimbingControls
                    state={state}
                    startX={startX}
                    stepSize={stepSize}
                    speed={speed}
                    onStartXChange={setStartX}
                    onStepSizeChange={setStepSize}
                    onSpeedChange={setSpeed}
                  />
                </CardContent>
              </Card>

              {/* 3. Detailed Status */}
              <Card className="bg-muted/30 border-muted">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">Current State</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-border/50 pb-2">
                      <span className="text-sm">Current Position (x)</span>
                      <span className="font-mono font-medium text-primary">
                        {state.history.length > 0 ? state.currentX.toFixed(3) : startX.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-b border-border/50 pb-2">
                      <span className="text-sm">Objective Value f(x)</span>
                      <span className="font-mono font-bold text-foreground">
                        {state.history.length > 0 ? state.currentY.toFixed(3) : costFunction(startX).toFixed(3)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-sm">Status</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${state.isComplete ? 'bg-green-500/10 text-green-600' :
                        state.isRunning ? 'bg-blue-500/10 text-blue-600' :
                          'bg-muted text-muted-foreground'
                        }`}>
                        {state.localOptimumReached
                          ? (hillMode === 'maximize' ? 'MAXIMUM (LOCAL)' : 'MINIMUM (LOCAL)')
                          : state.phase === 'expanding' ? 'EXPANDING...'
                            : state.phase === 'moving' ? 'MOVING...'
                              : 'IDLE'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </SectionCard>

      {/* PRACTICE SECTION - Accuracy Map Removed */}
      <SectionCard id="practice" title="Practice" icon="Pencil">
        <p className="text-muted-foreground mb-6">
          Test your understanding of the Hill Climbing algorithm with these interactive challenges!
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-secondary text-secondary-foreground">Challenge 1</Badge>
                <Badge variant="outline">Easy</Badge>
              </div>
              <h4 className="font-semibold mb-2">Find All Local Maxima</h4>
              <p className="text-sm text-muted-foreground">
                Using the default function, try different starting positions to discover all local maxima.
                Record each maximum found and its x-coordinate.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-secondary text-secondary-foreground">Challenge 2</Badge>
                <Badge variant="outline">Easy</Badge>
              </div>
              <h4 className="font-semibold mb-2">Custom Function Exploration</h4>
              <p className="text-sm text-muted-foreground">
                Enter the equation <code className="bg-muted px-1 rounded">sin(x) * x</code> and find its local maxima
                in the range [-10, 10]. How many local maxima exist?
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-warning/20 hover:border-warning/40 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-warning text-warning-foreground">Challenge 3</Badge>
                <Badge variant="outline">Medium</Badge>
              </div>
              <h4 className="font-semibold mb-2">Starting Point Impact</h4>
              <p className="text-sm text-muted-foreground">
                Run the hill climbing algorithm from 5 different starting positions on the default function.
                Does it always reach the same local maximum? What does this tell you about the algorithm?
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-destructive/20 hover:border-destructive/40 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-destructive text-destructive-foreground">Challenge 4</Badge>
                <Badge variant="outline">Advanced</Badge>
              </div>
              <h4 className="font-semibold mb-2">Step Size Impact</h4>
              <p className="text-sm text-muted-foreground">
                Experiment with different step sizes (0.1, 0.5, 1.0). How does it affect convergence
                speed and accuracy? Document your findings.
              </p>
            </CardContent>
          </Card>
        </div>
      </SectionCard>
    </ExperimentLayout>
  );
}
