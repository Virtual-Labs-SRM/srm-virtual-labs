import { useState, useMemo, useCallback } from 'react';
import { ExperimentLayout } from '@/components/layout/ExperimentLayout';
import { SectionCard, TheoryBlock, ComparisonCard, TermCard, HighlightItem } from '@/components/lab/SectionCard';
import { CodeBlock } from '@/components/lab/CodeBlock';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useSimulatedAnnealing } from '@/hooks/useSimulatedAnnealing';
import { SimulatedAnnealingCanvas } from '@/components/optimization/SimulatedAnnealingCanvas';
import { SimulatedAnnealingControls } from '@/components/optimization/SimulatedAnnealingControls';
import { CheckCircle2 } from 'lucide-react';

const SA_CODE = `import math
import random

def simulated_annealing(cost_func, start, temp=100, cooling_rate=0.95, max_iter=1000):
    """
    Simulated Annealing for finding global optimum.
    
    Args:
        cost_func: Function to maximize
        start: Starting position
        temp: Initial temperature
        cooling_rate: Rate of cooling (0 < r < 1)
        max_iter: Maximum iterations
    
    Returns:
        Best position found and its value
    """
    current = start
    current_value = cost_func(current)
    best = current
    best_value = current_value
    
    for i in range(max_iter):
        # Generate random neighbor
        neighbor = current + random.uniform(-1, 1)
        neighbor_value = cost_func(neighbor)
        
        # Calculate change in energy
        delta = neighbor_value - current_value
        
        # Accept better solutions, or worse with probability
        if delta > 0:
            current = neighbor
            current_value = neighbor_value
        else:
            # Probability decreases with temperature
            prob = math.exp(delta / temp)
            if random.random() < prob:
                current = neighbor
                current_value = neighbor_value
        
        # Update best
        if current_value > best_value:
            best = current
            best_value = current_value
        
        # Cool down
        temp *= cooling_rate
        
        if temp < 0.01:
            break
    
    return best, best_value


# Example
def cost_function(x):
    return -x**4/10 + x**3/2 + 2*x**2 - 3*x + 2

if __name__ == "__main__":
    best_pos, best_val = simulated_annealing(cost_function, -2)
    print(f"Best found: x={best_pos:.3f}, f(x)={best_val:.3f}")`;

const ALGORITHM_PSEUDOCODE = `function SIMULATED_ANNEALING(problem, schedule):
    current ← initial state
    FOR t = 1 to ∞:
        T ← schedule(t)  // Get temperature
        IF T = 0: RETURN current
        
        neighbor ← random neighbor of current
        ΔE ← value(neighbor) - value(current)
        
        IF ΔE > 0:
            current ← neighbor  // Accept improvement
        ELSE:
            Accept with probability e^(ΔE/T)`;

export function SimulatedAnnealingLab() {
  const [activeSection, setActiveSection] = useState('aim');
  const [startX, setStartX] = useState(-2);
  const [initialTemp, setInitialTemp] = useState(100);
  const [coolingRate, setCoolingRate] = useState(0.95);
  const [speed, setSpeed] = useState(1);

  const { state, runSimulatedAnnealing, reset, pause, resume } = useSimulatedAnnealing(speed);

  const handleStart = useCallback(() => runSimulatedAnnealing(startX, initialTemp, coolingRate), [runSimulatedAnnealing, startX, initialTemp, coolingRate]);

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <ExperimentLayout
      experimentNumber={3}
      title="Simulated Annealing"
      subtitle="Probabilistic optimization inspired by metallurgical annealing"
      icon="Flame"
      duration="~45 minutes"
      difficulty="Intermediate"
      tags={['Optimization', 'Probabilistic', 'Global Search']}
      activeSection={activeSection}
      onSectionChange={handleSectionChange}
    >
      {/* AIM SECTION */}
      <SectionCard id="aim" title="Aim" icon="Target">
        <p className="text-lg leading-relaxed mb-6">
          To implement and understand <strong className="text-primary">Simulated Annealing</strong>, a probabilistic
          optimization algorithm that can escape local optima to find global solutions.
        </p>
        <div className="grid sm:grid-cols-4 gap-4">
          <HighlightItem icon="🔥" text="Understand annealing metaphor" />
          <HighlightItem icon="🎲" text="Learn probabilistic acceptance" />
          <HighlightItem icon="❄️" text="Implement cooling schedules" />
          <HighlightItem icon="🏆" text="Find global optima" />
        </div>
      </SectionCard>

      {/* THEORY SECTION */}
      <SectionCard id="theory" title="Theory" icon="BookOpen">
        <TheoryBlock title="The Annealing Metaphor">
          <p className="mb-4">
            In metallurgy, <strong>annealing</strong> is a process where metals are heated
            and slowly cooled to reduce defects. At high temperatures, atoms move freely.
            As temperature decreases, they settle into a low-energy crystalline structure.
          </p>
          <p className="text-muted-foreground">
            Simulated Annealing applies this principle to optimization: start with high
            "temperature" (accepting many moves), then gradually "cool" (becoming more selective).
          </p>
        </TheoryBlock>

        <TheoryBlock title="Acceptance Probability">
          <div className="p-4 bg-card rounded-lg border text-center mb-4">
            <p className="text-2xl font-mono mb-2">
              P(accept) = e<sup>(ΔE / T)</sup>
            </p>
            <p className="text-sm text-muted-foreground">
              Where ΔE is the change in cost and T is current temperature
            </p>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• <strong>High T</strong>: Almost all moves accepted (exploration)</li>
            <li>• <strong>Low T</strong>: Only improving moves accepted (exploitation)</li>
            <li>• <strong>ΔE positive</strong>: Always accepted (better solution)</li>
          </ul>
        </TheoryBlock>

        <TheoryBlock title="Comparison with Hill Climbing">
          <div className="grid md:grid-cols-2 gap-4">
            <ComparisonCard
              variant="global"
              icon="🔥"
              title="Simulated Annealing"
              description="Can escape local optima through probabilistic acceptance of worse solutions"
              example="More likely to find global optimum but slower convergence"
            />
            <ComparisonCard
              variant="local"
              icon="⛰️"
              title="Hill Climbing"
              description="Simple greedy approach that always moves toward improvement"
              example="Fast but gets stuck at local optima"
            />
          </div>
        </TheoryBlock>

        <TheoryBlock title="Key Terminology">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <TermCard term="Temperature" definition="Controls exploration vs exploitation" />
            <TermCard term="Cooling Rate" definition="How fast temperature decreases" />
            <TermCard term="Metropolis" definition="The acceptance criterion" />
            <TermCard term="Schedule" definition="Temperature function over time" />
          </div>
        </TheoryBlock>
      </SectionCard>

      {/* ALGORITHM SECTION - Static Display */}
      <SectionCard id="algorithm" title="Algorithm" icon="Cog">
        <p className="text-muted-foreground mb-6">
          The Simulated Annealing algorithm follows these steps:
        </p>

        <div className="space-y-4 mb-8">
          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">1</div>
              <div className="w-0.5 flex-1 bg-border mt-2" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Initialize</h4>
              <p className="text-muted-foreground">Set initial solution, temperature T, and cooling rate α</p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">2</div>
              <div className="w-0.5 flex-1 bg-border mt-2" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Generate Neighbor</h4>
              <p className="text-muted-foreground">Pick a random neighboring solution</p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">3</div>
              <div className="w-0.5 flex-1 bg-border mt-2" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Accept or Reject</h4>
              <p className="text-muted-foreground">Accept if better, or with probability e^(ΔE/T) if worse</p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">4</div>
              <div className="w-0.5 flex-1 bg-border mt-2" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Cool Down</h4>
              <p className="text-muted-foreground">Reduce temperature: T = T × α</p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">5</div>
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Repeat or Stop</h4>
              <p className="text-muted-foreground">Continue until temperature is near zero or max iterations reached</p>
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
          Complete Python implementation of Simulated Annealing for function optimization.
        </p>
        <CodeBlock code={SA_CODE} language="python" title="simulated_annealing.py" />
      </SectionCard>

      {/* DEMO SECTION - Graph at top, controls below */}
      <SectionCard id="demo" title="Demo" icon="Play">
        <p className="text-muted-foreground mb-6">
          Watch how Simulated Annealing explores the solution space, sometimes accepting
          worse solutions to escape local optima.
        </p>

        {/* Graph at top - full width */}
        <Card className="overflow-hidden mb-6">
          <CardContent className="p-4 min-h-[400px]">
            <SimulatedAnnealingCanvas state={state} startX={startX} />
          </CardContent>
        </Card>

        {/* Controls and info below - horizontal layout */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-4">
              <SimulatedAnnealingControls
                state={state}
                startX={startX}
                initialTemp={initialTemp}
                coolingRate={coolingRate}
                speed={speed}
                onStartXChange={setStartX}
                onInitialTempChange={setInitialTemp}
                onCoolingRateChange={setCoolingRate}
                onSpeedChange={setSpeed}
                onStart={handleStart}
                onPause={pause}
                onResume={resume}
                onReset={reset}
              />
            </CardContent>
          </Card>

          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <h4 className="font-medium mb-3">Understanding the Visualization</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span><strong>Temperature bar</strong>: Shows current temperature (red=hot, blue=cold)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span><strong>Solid lines</strong>: Accepted moves (uphill or lucky downhill)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span><strong>Dashed lines</strong>: Rejected moves</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span><strong>Best marker</strong>: Tracks the best solution found so far</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </SectionCard>

      {/* PRACTICE SECTION */}
      <SectionCard id="practice" title="Practice" icon="Pencil">
        <p className="text-muted-foreground mb-6">
          Test your understanding with these exercises.
        </p>
        <div className="space-y-4">
          <Card className="border-primary/20">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-2">Exercise 1: Cooling Rate Comparison</h4>
              <p className="text-sm text-muted-foreground">
                Compare results with cooling rates of 0.85, 0.95, and 0.99. Which finds the global optimum most reliably?
              </p>
              <Badge variant="outline" className="mt-2">Intermediate</Badge>
            </CardContent>
          </Card>
          <Card className="border-primary/20">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-2">Exercise 2: Run Multiple Times</h4>
              <p className="text-sm text-muted-foreground">
                Run the algorithm 5 times from the same starting point. Note the variation in results due to randomness.
              </p>
              <Badge variant="outline" className="mt-2">Beginner</Badge>
            </CardContent>
          </Card>
          <Card className="border-primary/20">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-2">Exercise 3: Temperature Analysis</h4>
              <p className="text-sm text-muted-foreground">
                At what temperature does the algorithm start rejecting most downhill moves? How does this affect exploration?
              </p>
              <Badge variant="outline" className="mt-2">Advanced</Badge>
            </CardContent>
          </Card>
        </div>
      </SectionCard>
    </ExperimentLayout>
  );
}
