import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import {
  ChevronRight,
  ChevronLeft,
  Play,
  RotateCcw,
  BookOpen,
  Target,
  Settings,
  GitBranch,
  Cpu,
  TrendingDown,
  Trophy,
  CheckCircle2,
  Info,
  Code,
  Lightbulb,
  School,
  Star,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============= Types =============
interface InputVariable {
  id: string;
  name: string;
  value: number;
  description: string;
  range: string;
  example: string;
}

interface FuzzySet {
  name: string;
  type: 'Low' | 'Medium' | 'High';
  membership: number;
  color: string;
}

interface FuzzyRule {
  id: string;
  condition: string;
  output: string;
  strength: number;
  active: boolean;
}

// ============= Constants =============
const STEPS = [
  { id: 1, title: 'Problem Definition', icon: Target, shortTitle: 'Problem' },
  { id: 2, title: 'Input Module', icon: Settings, shortTitle: 'Inputs' },
  { id: 3, title: 'Fuzzification', icon: TrendingDown, shortTitle: 'Fuzzify' },
  { id: 4, title: 'Rule Tree Construction', icon: GitBranch, shortTitle: 'Rules' },
  { id: 5, title: 'Inference Engine', icon: Cpu, shortTitle: 'Inference' },
  { id: 6, title: 'Defuzzification', icon: Target, shortTitle: 'Defuzzify' },
  { id: 7, title: 'Final Output', icon: Trophy, shortTitle: 'Output' },
];

const INITIAL_INPUTS: InputVariable[] = [
  { id: 'academic', name: 'Academic Score', value: 75, description: 'Student\'s academic performance percentage', range: '0-100%', example: '85% for high achievers' },
  { id: 'budget', name: 'Budget Capacity', value: 60, description: 'Financial capacity for college fees', range: '0-100 (normalized)', example: '70 for upper-middle budget' },
  { id: 'location', name: 'Location Preference', value: 70, description: 'Preference for college location accessibility', range: '0-100', example: '90 for nearby preference' },
  { id: 'infrastructure', name: 'Infrastructure Quality', value: 65, description: 'Importance of campus facilities', range: '0-100', example: '80 for facility-focused' },
  { id: 'placement', name: 'Placement Record', value: 80, description: 'Importance of campus placement history', range: '0-100', example: '95 for career-focused' },
];

const COLLEGES = [
  { name: 'Elite University', category: 'elite', rank: 1, cost: 95, quality: 98 },
  { name: 'Premier Institute of Technology', category: 'elite', rank: 2, cost: 90, quality: 95 },
  { name: 'State University', category: 'good', rank: 5, cost: 60, quality: 80 },
  { name: 'City Engineering College', category: 'good', rank: 8, cost: 55, quality: 75 },
  { name: 'Regional Technical Institute', category: 'average', rank: 15, cost: 40, quality: 65 },
  { name: 'District College', category: 'average', rank: 20, cost: 35, quality: 60 },
  { name: 'Community College', category: 'budget', rank: 30, cost: 20, quality: 50 },
];

// ============= Context-Aware Code Snippets (Knowledge-Based Agent) =============
type SnippetSet = { name: string; membership: number };

const CODE_SNIPPETS = {
  // Step 2: Agent Percepts
  step2: {
    general: `class CollegeSelectionAgent:
    """Knowledge-Based Intelligent Agent for College Selection."""
    
    def perceive(self, inputs):
        """Capture percepts from environment."""
        self.profile = {
            'academic': inputs['academic'],
            'budget': inputs['budget'],
            'location': inputs['location'],
            'infrastructure': inputs['infrastructure'],
            'placement': inputs['placement']
        }
        return self.profile`,
    perInput: (id: string, name: string, value: number) =>
      `# Agent Percept: ${name}
def perceive_${id}(self, value):
    self.profile['${id}'] = ${value}
    # Crisp input (range: 0-100)
    # Next stage: fuzzify this percept`,
  },

  // Step 3: Fuzzification
  step3: {
    general: `# Fuzzification: Crisp → Fuzzy Degrees
def triangular_mf(x, a, b, c):
    """Triangular membership function.
    a=left foot, b=peak, c=right foot
    Returns degree in [0, 1]
    """
    if x <= a or x >= c: return 0.0
    elif x <= b: return (x - a) / (b - a)
    else: return (c - x) / (c - b)

def fuzzify(self, value):
    return {
        'Low':    triangular_mf(value, 0, 0, 50),
        'Medium': triangular_mf(value, 25, 50, 75),
        'High':   triangular_mf(value, 50, 100, 100)
    }`,
    perVariable: (name: string, value: number, sets: SnippetSet[]) => {
      const dominant = sets.reduce((m, s) => s.membership > m.membership ? s : m);
      return `# Fuzzification: ${name} = ${value}
mu_Low    = triangular_mf(${value}, 0, 0, 50)   = ${sets[0].membership.toFixed(4)}
mu_Medium = triangular_mf(${value}, 25, 50, 75)  = ${sets[1].membership.toFixed(4)}
mu_High   = triangular_mf(${value}, 50, 100, 100)= ${sets[2].membership.toFixed(4)}

# Dominant: ${dominant.name} (${dominant.membership.toFixed(4)})`;
    },
  },

  // Step 4: Knowledge Base (Fuzzy Rules)
  step4: {
    general: `# Knowledge Base: Rule-Based Representation
class KnowledgeBase:
    def __init__(self):
        self.rules = [
            Rule("R1", "academic=HIGH AND budget=HIGH",     "elite"),
            Rule("R2", "academic=HIGH AND budget=MEDIUM",   "good"),
            Rule("R3", "academic=MEDIUM AND budget=HIGH",   "good"),
            Rule("R4", "academic=MEDIUM AND budget=MEDIUM", "average"),
            Rule("R5", "academic=LOW OR budget=LOW",        "budget"),
        ]
    
    def evaluate_rule(self, rule, fuzzified):
        if rule.operator == 'AND':
            return min(fuzzified[rule.var1], fuzzified[rule.var2])
        else:
            return max(fuzzified[rule.var1], fuzzified[rule.var2])`,
    perRule: (ruleId: string, condition: string, output: string, op: string,
      v1Label: string, v1: number, v2Label: string, v2: number, strength: number) =>
      `# Knowledge Base – Rule ${ruleId}
# ${condition} → "${output}"
${op === 'AND'
        ? `strength = min(${v1Label}, ${v2Label})
strength = min(${v1.toFixed(4)}, ${v2.toFixed(4)})
strength = ${strength.toFixed(4)}`
        : `strength = max(${v1Label}, ${v2Label})
strength = max(${v1.toFixed(4)}, ${v2.toFixed(4)})
strength = ${strength.toFixed(4)}`}
# ${strength > 0.1 ? 'ACTIVE ✓' : 'INACTIVE ✗'}`,
  },

  // Step 5: Mamdani Inference Engine
  step5: {
    general: `# Mamdani Inference Engine
def infer(self):
    """MIN for AND, MAX for OR, MAX aggregation."""
    category_scores = {}
    
    for rule in self.knowledge_base.rules:
        strength = self.evaluate_rule(rule)
        cat = rule.output_category
        category_scores[cat] = max(
            category_scores.get(cat, 0),
            strength
        )
    return category_scores`,
    perRuleEval: (ruleId: string, cat: string, strength: number, prev: number) =>
      `# Mamdani Inference – ${ruleId}
# Category: "${cat}"
category_scores['${cat}'] = max(
    previous = ${prev.toFixed(4)},
    strength = ${strength.toFixed(4)}
)
# Result: ${Math.max(prev, strength).toFixed(4)}`,
  },

  // Step 6: Centroid Defuzzification
  step6: {
    general: `# Centroid Defuzzification
def defuzzify(self, aggregated):
    """Center of Gravity method."""
    numerator = denominator = 0.0
    for x in range(0, 101):
        mu = aggregated.membership(x)
        numerator   += x * mu
        denominator += mu
    if denominator > 0:
        return numerator / denominator
    return 50.0`,
    withValues: (num: number, den: number, result: number) =>
      `# Centroid: x* = Σ(x·μ(x)) / Σμ(x)
numerator   = ${num.toFixed(2)}
denominator = ${den.toFixed(2)}
centroid    = ${num.toFixed(2)} / ${den.toFixed(2)}
centroid    = ${result.toFixed(2)}`,
  },

  // Step 7: Agent Action
  step7: `# Agent Action: Recommendation
def act(self):
    recommendations = []
    for college in self.college_database:
        match = self.category_scores.get(
            college['category'], 0)
        if match > 0.1:
            recommendations.append({
                **college, 'match_score': match
            })
    recommendations.sort(
        key=lambda x: x['match_score'],
        reverse=True)
    return recommendations`,
};

// ============= Helper Functions =============
function triangularMF(x: number, a: number, b: number, c: number): number {
  if (x <= a || x >= c) return 0;
  if (x <= b) return (x - a) / (b - a);
  return (c - x) / (c - b);
}

function getFuzzySets(value: number): FuzzySet[] {
  return [
    { name: 'Low', type: 'Low', membership: triangularMF(value, 0, 0, 50), color: 'hsl(var(--chart-1))' },
    { name: 'Medium', type: 'Medium', membership: triangularMF(value, 25, 50, 75), color: 'hsl(var(--chart-2))' },
    { name: 'High', type: 'High', membership: triangularMF(value, 50, 100, 100), color: 'hsl(var(--chart-3))' },
  ];
}

// ============= Sub-Components =============
function ProgressIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Progress</span>
        <span className="font-medium">{currentStep} / {totalSteps}</span>
      </div>
      <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
    </div>
  );
}

function StepNavigation({
  steps,
  currentStep,
  completedSteps,
  onStepClick
}: {
  steps: typeof STEPS;
  currentStep: number;
  completedSteps: Set<number>;
  onStepClick: (step: number) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {steps.map((step) => {
        const isCompleted = completedSteps.has(step.id);
        const isCurrent = currentStep === step.id;
        const StepIcon = step.icon;

        return (
          <button
            key={step.id}
            onClick={() => onStepClick(step.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
              isCurrent && "bg-primary text-primary-foreground shadow-md",
              isCompleted && !isCurrent && "bg-primary/20 text-primary",
              !isCurrent && !isCompleted && "bg-muted/50 text-muted-foreground hover:bg-muted"
            )}
          >
            {isCompleted && !isCurrent ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <StepIcon className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">{step.shortTitle}</span>
            <span className="sm:hidden">{step.id}</span>
          </button>
        );
      })}
    </div>
  );
}

function ExplanationPanel({
  title,
  children,
  code,
  pseudocode,
  onClose
}: {
  title: string;
  children: React.ReactNode;
  code?: string;
  pseudocode?: string;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<string>('concept');
  const [expanded, setExpanded] = useState(false);

  const tabs = ['concept', ...(pseudocode ? ['pseudocode'] : []), ...(code ? ['code'] : [])];

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" />
            {title}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {tabs.length > 1 && (
          <div className="flex gap-1 p-0.5 rounded-lg bg-muted/50">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize",
                  activeTab === tab
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab === 'concept' && <Lightbulb className="h-3 w-3 inline mr-1" />}
                {tab === 'pseudocode' && <BookOpen className="h-3 w-3 inline mr-1" />}
                {tab === 'code' && <Code className="h-3 w-3 inline mr-1" />}
                {tab}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'concept' && (
          <div className="text-sm text-muted-foreground">{children}</div>
        )}

        {activeTab === 'pseudocode' && pseudocode && (
          <pre className="p-3 rounded-lg bg-muted/70 text-xs font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
            {pseudocode}
          </pre>
        )}

        {activeTab === 'code' && code && (
          <div>
            <pre className={cn(
              "p-3 rounded-lg bg-secondary text-secondary-foreground text-xs font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed",
              !expanded && "max-h-56 overflow-hidden"
            )}>
              {code}
            </pre>
            {code.split('\n').length > 12 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(!expanded)}
                className="mt-1 w-full text-xs h-7"
              >
                {expanded ? '▲ Show Less' : '▼ Expand Full Implementation'}
              </Button>
            )}
          </div>
        )}

        {/* For backward compat: show code toggle if no tabs */}
        {tabs.length === 1 && code && (
          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab(activeTab === 'code' ? 'concept' : 'code')}
              className="mb-2"
            >
              <Code className="h-4 w-4 mr-2" />
              {activeTab === 'code' ? 'Hide Code' : 'Show Code'}
            </Button>
            {activeTab === 'code' && (
              <pre className="p-3 rounded-lg bg-secondary text-secondary-foreground text-xs font-mono overflow-x-auto">
                {code}
              </pre>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MembershipChart({ value, sets }: { value: number; sets: FuzzySet[] }) {
  const width = 100;

  return (
    <div className="relative h-32 bg-muted/30 rounded-lg p-4">
      <svg viewBox="0 0 100 40" className="w-full h-full">
        {/* Grid lines */}
        <line x1="0" y1="40" x2="100" y2="40" stroke="currentColor" strokeOpacity="0.2" />
        <line x1="0" y1="20" x2="100" y2="20" stroke="currentColor" strokeOpacity="0.1" strokeDasharray="2" />
        <line x1="0" y1="0" x2="100" y2="0" stroke="currentColor" strokeOpacity="0.1" strokeDasharray="2" />

        {/* Low membership function */}
        <path d="M0,0 L0,40 L25,40 L50,0" fill="hsl(var(--chart-1))" fillOpacity="0.2" stroke="hsl(var(--chart-1))" strokeWidth="1" />

        {/* Medium membership function */}
        <path d="M25,40 L50,0 L75,40" fill="hsl(var(--chart-2))" fillOpacity="0.2" stroke="hsl(var(--chart-2))" strokeWidth="1" />

        {/* High membership function */}
        <path d="M50,40 L75,0 L100,0 L100,40" fill="hsl(var(--chart-3))" fillOpacity="0.2" stroke="hsl(var(--chart-3))" strokeWidth="1" />

        {/* Current value indicator */}
        <line x1={value} y1="0" x2={value} y2="40" stroke="hsl(var(--primary))" strokeWidth="2" strokeDasharray="3" />
        <circle cx={value} cy={40 - sets[0].membership * 40} r="2" fill="hsl(var(--chart-1))" />
        <circle cx={value} cy={40 - sets[1].membership * 40} r="2" fill="hsl(var(--chart-2))" />
        <circle cx={value} cy={40 - sets[2].membership * 40} r="2" fill="hsl(var(--chart-3))" />
      </svg>

      <div className="absolute bottom-1 left-0 right-0 flex justify-between text-xs text-muted-foreground px-2">
        <span>0</span>
        <span>50</span>
        <span>100</span>
      </div>
    </div>
  );
}

// ============= Step Content Components =============
function Step1ProblemDefinition({ onExplore }: { onExplore: () => void }) {
  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          The Challenge
        </h3>
        <p className="text-muted-foreground mb-4">
          How do we select the <strong className="text-foreground">most suitable college</strong> for a student
          when preferences are <em>vague</em> and <em>subjective</em>?
        </p>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
            <span>"I want a <strong>good</strong> college" — What is "good"?</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
            <span>"My budget is <strong>moderate</strong>" — How much exactly?</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
            <span>"Location should be <strong>convenient</strong>" — Distance in km?</span>
          </li>
        </ul>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            Why Fuzzy Logic?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Traditional systems require exact values. Fuzzy logic handles <strong>linguistic variables</strong>
            like "high", "medium", "low" — mimicking human reasoning!
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-xs font-semibold text-destructive mb-1">❌ Traditional</p>
              <p className="text-xs text-muted-foreground">IF score ≥ 85 THEN elite</p>
              <p className="text-xs text-muted-foreground">(What about 84.9?)</p>
            </div>
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-xs font-semibold text-primary mb-1">✓ Fuzzy</p>
              <p className="text-xs text-muted-foreground">IF score is HIGH THEN elite</p>
              <p className="text-xs text-muted-foreground">(Gradual membership)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={onExplore} className="w-full">
        <Play className="h-4 w-4 mr-2" />
        Start Building the System
      </Button>
    </div>
  );
}

function Step2InputModule({
  inputs,
  selectedInput,
  onInputChange,
  onSelectInput
}: {
  inputs: InputVariable[];
  selectedInput: string | null;
  onInputChange: (id: string, value: number) => void;
  onSelectInput: (id: string | null) => void;
}) {
  const selected = inputs.find(i => i.id === selectedInput);

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Student Preference Inputs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {inputs.map((input) => (
              <div
                key={input.id}
                className={cn(
                  "p-4 rounded-lg border-2 cursor-pointer transition-all",
                  selectedInput === input.id
                    ? "border-primary bg-primary/5"
                    : "border-transparent bg-muted/30 hover:border-muted-foreground/30"
                )}
                onClick={() => onSelectInput(selectedInput === input.id ? null : input.id)}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-sm">{input.name}</span>
                  <Badge variant="outline">{input.value}%</Badge>
                </div>
                <Slider
                  value={[input.value]}
                  onValueChange={([v]) => onInputChange(input.id, v)}
                  min={0}
                  max={100}
                  step={5}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {selected ? (
          <ExplanationPanel
            title={`Agent Percept: ${selected.name}`}
            code={CODE_SNIPPETS.step2.perInput(selected.id, selected.name, selected.value)}
            pseudocode={CODE_SNIPPETS.step2.general}
            onClose={() => onSelectInput(null)}
          >
            <div className="space-y-3">
              <p>{selected.description}</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded bg-muted/50">
                  <span className="text-muted-foreground">Range:</span>
                  <p className="font-medium">{selected.range}</p>
                </div>
                <div className="p-2 rounded bg-muted/50">
                  <span className="text-muted-foreground">Example:</span>
                  <p className="font-medium">{selected.example}</p>
                </div>
              </div>
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-xs font-semibold text-primary mb-1">Current Agent State</p>
                <p className="text-xs font-mono">profile[&apos;{selected.id}&apos;] = {selected.value}</p>
              </div>
            </div>
          </ExplanationPanel>
        ) : (
          <Card className="border-dashed">
            <CardContent className="p-6 text-center">
              <BookOpen className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Click on any input to see its explanation and code
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function Step3Fuzzification({
  inputs,
  selectedInput,
  onSelectInput
}: {
  inputs: InputVariable[];
  selectedInput: string | null;
  onSelectInput: (id: string | null) => void;
}) {
  const selected = inputs.find(i => i.id === selectedInput);
  const selectedSets = selected ? getFuzzySets(selected.value) : null;

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Membership Functions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {inputs.slice(0, 3).map((input) => {
              const sets = getFuzzySets(input.value);
              return (
                <div
                  key={input.id}
                  className={cn(
                    "p-4 rounded-lg border-2 cursor-pointer transition-all",
                    selectedInput === input.id
                      ? "border-primary"
                      : "border-transparent bg-muted/30 hover:border-muted-foreground/30"
                  )}
                  onClick={() => onSelectInput(selectedInput === input.id ? null : input.id)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-sm">{input.name}: {input.value}</span>
                  </div>
                  <MembershipChart value={input.value} sets={sets} />
                  <div className="flex gap-2 mt-2">
                    {sets.map((set) => (
                      <Badge
                        key={set.name}
                        variant={set.membership > 0.5 ? "default" : "outline"}
                        className="text-xs"
                      >
                        {set.name}: {(set.membership * 100).toFixed(0)}%
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <ExplanationPanel
          title={selected ? `Fuzzification: ${selected.name}` : "Fuzzification Engine"}
          code={selectedSets && selected
            ? CODE_SNIPPETS.step3.perVariable(selected.name, selected.value, selectedSets)
            : CODE_SNIPPETS.step3.general}
          pseudocode={CODE_SNIPPETS.step3.general}
          onClose={() => onSelectInput(null)}
        >
          <div className="space-y-3">
            <p>
              <strong>Fuzzification</strong> converts crisp numerical values into
              fuzzy membership degrees between 0 and 1.
            </p>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs font-semibold mb-1">Triangular Membership Function</p>
              <p className="text-xs">
                0 = &quot;definitely not in this set&quot;<br />
                1 = &quot;definitely in this set&quot;<br />
                0.5 = &quot;partially in this set&quot;
              </p>
            </div>
            {selectedSets && (
              <div className="space-y-1">
                <p className="text-xs font-semibold">Current memberships for {selected?.name}:</p>
                {selectedSets.map(set => (
                  <div key={set.name} className="flex justify-between text-xs">
                    <span>μ_{set.name}({selected?.value})</span>
                    <span className="font-mono">{set.membership.toFixed(3)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ExplanationPanel>
      </div>
    </div>
  );
}

function Step4RuleTree({
  inputs,
  rules,
  selectedRule,
  onSelectRule,
  fuzzifiedInputs
}: {
  inputs: InputVariable[];
  rules: FuzzyRule[];
  selectedRule: string | null;
  onSelectRule: (id: string | null) => void;
  fuzzifiedInputs: Record<string, FuzzySet[]>;
}) {
  const selected = rules.find(r => r.id === selectedRule);

  // Helper to get per-rule code snippet with actual values
  const getRuleSnippet = (rule: FuzzyRule) => {
    const academicSets = fuzzifiedInputs['academic'] || [];
    const budgetSets = fuzzifiedInputs['budget'] || [];
    const getM = (sets: FuzzySet[], type: string) => sets.find(s => s.type === type)?.membership || 0;
    const ruleMap: Record<string, { op: string; v1Label: string; v1: number; v2Label: string; v2: number }> = {
      'R1': { op: 'AND', v1Label: 'mu_academic_HIGH', v1: getM(academicSets, 'High'), v2Label: 'mu_budget_HIGH', v2: getM(budgetSets, 'High') },
      'R2': { op: 'AND', v1Label: 'mu_academic_HIGH', v1: getM(academicSets, 'High'), v2Label: 'mu_budget_MEDIUM', v2: getM(budgetSets, 'Medium') },
      'R3': { op: 'AND', v1Label: 'mu_academic_MEDIUM', v1: getM(academicSets, 'Medium'), v2Label: 'mu_budget_HIGH', v2: getM(budgetSets, 'High') },
      'R4': { op: 'AND', v1Label: 'mu_academic_MEDIUM', v1: getM(academicSets, 'Medium'), v2Label: 'mu_budget_MEDIUM', v2: getM(budgetSets, 'Medium') },
      'R5': { op: 'OR', v1Label: 'mu_academic_LOW', v1: getM(academicSets, 'Low'), v2Label: 'mu_budget_LOW', v2: getM(budgetSets, 'Low') },
    };
    const m = ruleMap[rule.id];
    if (!m) return CODE_SNIPPETS.step4.general;
    return CODE_SNIPPETS.step4.perRule(rule.id, rule.condition, rule.output, m.op, m.v1Label, m.v1, m.v2Label, m.v2, rule.strength);
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              Knowledge Base: Fuzzy Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className={cn(
                  "p-4 rounded-lg border-2 cursor-pointer transition-all font-mono text-sm",
                  selectedRule === rule.id && "border-primary",
                  rule.active && selectedRule !== rule.id && "border-primary/30 bg-primary/5",
                  !rule.active && selectedRule !== rule.id && "border-transparent bg-muted/30 opacity-60"
                )}
                onClick={() => onSelectRule(selectedRule === rule.id ? null : rule.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={cn(rule.active && "text-primary")}>{rule.condition}</span>
                  {rule.active && <CheckCircle2 className="h-4 w-4 text-primary" />}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">→ {rule.output}</span>
                  <Badge variant={rule.active ? "default" : "outline"}>
                    Strength: {(rule.strength * 100).toFixed(0)}%
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="p-4 rounded-lg bg-muted/30">
          <p className="text-sm text-muted-foreground">
            <strong>Knowledge Base:</strong> Rules represent domain knowledge as IF-THEN structures.
            Active rules fire based on fuzzified percepts using MIN (AND) and MAX (OR) operators.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <ExplanationPanel
          title={selected ? `Knowledge Base: Rule ${selected.id}` : "Knowledge Base"}
          code={selected ? getRuleSnippet(selected) : CODE_SNIPPETS.step4.general}
          pseudocode={CODE_SNIPPETS.step4.general}
          onClose={() => onSelectRule(null)}
        >
          {selected ? (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs font-semibold mb-1">Rule Condition</p>
                <p className="text-xs font-mono">{selected.condition}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs font-semibold mb-1">Output Category</p>
                <p className="text-xs font-mono">{selected.output}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs font-semibold mb-1">Firing Strength</p>
                <p className="text-xs">{(selected.strength * 100).toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {selected.condition.includes('OR') ? 'MAX' : 'MIN'} operator applied
                </p>
              </div>
            </div>
          ) : (
            <p>Click on a rule to see its Knowledge Base evaluation and firing strength calculation.</p>
          )}
        </ExplanationPanel>
      </div>
    </div>
  );
}

function Step5Inference({
  rules,
  categoryScores
}: {
  rules: FuzzyRule[];
  categoryScores: Record<string, number>;
}) {
  const [animatingRule, setAnimatingRule] = useState<string | null>(null);
  const [currentRuleSnippet, setCurrentRuleSnippet] = useState<string | null>(null);
  const activeRules = rules.filter(r => r.active);

  const animateRules = useCallback(() => {
    let i = 0;
    const runningScores: Record<string, number> = { elite: 0, good: 0, average: 0, budget: 0 };
    const animate = () => {
      if (i < activeRules.length) {
        const rule = activeRules[i];
        setAnimatingRule(rule.id);
        const prev = runningScores[rule.output];
        setCurrentRuleSnippet(
          CODE_SNIPPETS.step5.perRuleEval(rule.id, rule.output, rule.strength, prev)
        );
        runningScores[rule.output] = Math.max(prev, rule.strength);
        i++;
        setTimeout(animate, 800);
      } else {
        setAnimatingRule(null);
        setCurrentRuleSnippet(null);
      }
    };
    animate();
  }, [activeRules]);

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              Mamdani Inference Engine
            </CardTitle>
            <Button size="sm" variant="outline" onClick={animateRules}>
              <Play className="h-4 w-4 mr-2" />
              Animate
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeRules.map((rule) => (
              <div
                key={rule.id}
                className={cn(
                  "p-4 rounded-lg border transition-all",
                  animatingRule === rule.id
                    ? "border-primary bg-primary/20 shadow-lg scale-[1.02]"
                    : "border-border bg-muted/30"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm">{rule.condition}</span>
                  <Badge variant={animatingRule === rule.id ? "default" : "outline"}>
                    {(rule.strength * 100).toFixed(0)}%
                  </Badge>
                </div>
                <Progress value={rule.strength * 100} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Aggregated Category Scores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(categoryScores).map(([category, score]) => (
                <div key={category} className="p-3 rounded-lg bg-muted/30">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium capitalize text-sm">{category}</span>
                    <span className="font-mono text-sm">{(score * 100).toFixed(0)}%</span>
                  </div>
                  <Progress value={score * 100} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <ExplanationPanel
          title="Mamdani Inference Engine"
          code={currentRuleSnippet || CODE_SNIPPETS.step5.general}
          pseudocode={CODE_SNIPPETS.step5.general}
          onClose={() => { }}
        >
          <div className="space-y-3">
            <p>
              The <strong>Mamdani Inference Engine</strong> evaluates all Knowledge Base
              rules and aggregates outputs using MAX operator.
            </p>
            <div className="space-y-2">
              <div className="p-2 rounded bg-muted/50">
                <p className="text-xs font-semibold">AND Operation (MIN)</p>
                <p className="text-xs text-muted-foreground">Takes minimum of membership values</p>
              </div>
              <div className="p-2 rounded bg-muted/50">
                <p className="text-xs font-semibold">OR Operation (MAX)</p>
                <p className="text-xs text-muted-foreground">Takes maximum of membership values</p>
              </div>
              <div className="p-2 rounded bg-muted/50">
                <p className="text-xs font-semibold">Aggregation (MAX)</p>
                <p className="text-xs text-muted-foreground">Combines rule outputs per category</p>
              </div>
            </div>
            {animatingRule && (
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-xs font-semibold text-primary">Currently evaluating: {animatingRule}</p>
              </div>
            )}
          </div>
        </ExplanationPanel>
      </div>
    </div>
  );
}

function Step6Defuzzification({
  categoryScores,
  defuzzifiedValue
}: {
  categoryScores: Record<string, number>;
  defuzzifiedValue: number;
}) {
  // Generate aggregated output visualization points
  const outputPoints = useMemo(() => {
    const points: { x: number; y: number }[] = [];
    for (let x = 0; x <= 100; x += 2) {
      let maxY = 0;
      Object.entries(categoryScores).forEach(([category, strength]) => {
        let categoryValue = 0;
        switch (category) {
          case 'elite': categoryValue = triangularMF(x, 75, 100, 100) * strength; break;
          case 'good': categoryValue = triangularMF(x, 50, 75, 100) * strength; break;
          case 'average': categoryValue = triangularMF(x, 25, 50, 75) * strength; break;
          case 'budget': categoryValue = triangularMF(x, 0, 25, 50) * strength; break;
        }
        maxY = Math.max(maxY, categoryValue);
      });
      points.push({ x, y: maxY });
    }
    return points;
  }, [categoryScores]);

  // Calculate centroid partial sums for code snippet
  const centroidDetails = useMemo(() => {
    let numerator = 0;
    let denominator = 0;
    for (let x = 0; x <= 100; x += 10) {
      let maxY = 0;
      Object.entries(categoryScores).forEach(([category, strength]) => {
        let cv = 0;
        switch (category) {
          case 'elite': cv = triangularMF(x, 75, 100, 100) * strength; break;
          case 'good': cv = triangularMF(x, 50, 75, 100) * strength; break;
          case 'average': cv = triangularMF(x, 25, 50, 75) * strength; break;
          case 'budget': cv = triangularMF(x, 0, 25, 50) * strength; break;
        }
        maxY = Math.max(maxY, cv);
      });
      numerator += x * maxY;
      denominator += maxY;
    }
    return { numerator, denominator };
  }, [categoryScores]);

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Aggregated Output & Centroid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 bg-muted/30 rounded-lg p-4 relative">
              <svg viewBox="0 0 100 50" className="w-full h-full">
                <path
                  d={`M 0,50 ${outputPoints.map(p => `L ${p.x},${50 - p.y * 40}`).join(' ')} L 100,50 Z`}
                  fill="hsl(var(--primary))"
                  fillOpacity="0.3"
                  stroke="hsl(var(--primary))"
                  strokeWidth="1"
                />
                <line
                  x1={defuzzifiedValue} y1="0"
                  x2={defuzzifiedValue} y2="50"
                  stroke="hsl(var(--destructive))"
                  strokeWidth="2" strokeDasharray="3"
                />
                <circle cx={defuzzifiedValue} cy="25" r="4" fill="hsl(var(--destructive))" />
              </svg>
              <div className="absolute bottom-1 left-4 text-xs text-muted-foreground">Budget</div>
              <div className="absolute bottom-1 left-1/4 text-xs text-muted-foreground">Average</div>
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">Good</div>
              <div className="absolute bottom-1 right-4 text-xs text-muted-foreground">Elite</div>
            </div>

            <div className="mt-4 p-4 rounded-lg bg-primary/10 border border-primary/20 text-center">
              <p className="text-sm text-muted-foreground">Defuzzified Score (Centroid)</p>
              <p className="text-3xl font-bold text-primary">{defuzzifiedValue.toFixed(1)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <ExplanationPanel
          title="Centroid Defuzzification"
          code={CODE_SNIPPETS.step6.withValues(centroidDetails.numerator, centroidDetails.denominator, defuzzifiedValue)}
          pseudocode={CODE_SNIPPETS.step6.general}
          onClose={() => { }}
        >
          <div className="space-y-3">
            <p>
              <strong>Defuzzification</strong> converts the fuzzy output back to
              a crisp numerical value for the agent&apos;s decision.
            </p>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs font-semibold mb-1">Centroid (Center of Gravity)</p>
              <p className="text-xs font-mono mt-2">
                x* = Σ(x · μ(x)) / Σμ(x)
              </p>
            </div>
            <div className="space-y-1 text-xs font-mono p-2 rounded bg-muted/30">
              <div className="flex justify-between">
                <span>Σ(x·μ(x)):</span>
                <span>{centroidDetails.numerator.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Σμ(x):</span>
                <span>{centroidDetails.denominator.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t pt-1 font-bold">
                <span>Centroid:</span>
                <span>{defuzzifiedValue.toFixed(2)}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              The red dashed line shows the centroid position — the agent&apos;s
              final suitability score.
            </p>
          </div>
        </ExplanationPanel>
      </div>
    </div>
  );
}

function Step7Output({
  defuzzifiedValue,
  recommendations,
  onReplay
}: {
  defuzzifiedValue: number;
  recommendations: Array<{ name: string; category: string; rank: number; matchScore: number }>;
  onReplay: () => void;
}) {
  const topMatch = recommendations[0];

  const getCategory = (score: number) => {
    if (score >= 75) return { name: 'Elite', color: 'text-primary' };
    if (score >= 50) return { name: 'Good', color: 'text-chart-3' };
    if (score >= 25) return { name: 'Average', color: 'text-chart-2' };
    return { name: 'Budget', color: 'text-chart-1' };
  };

  const category = getCategory(defuzzifiedValue);

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-primary/20 to-secondary/20 border-primary/30">
        <CardContent className="p-6 text-center">
          <Trophy className="h-12 w-12 mx-auto text-primary mb-4" />
          <h3 className="text-2xl font-bold mb-2">System Complete!</h3>
          <p className="text-muted-foreground mb-4">
            You've built a fuzzy rule tree–based college selection system
          </p>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div className="p-4 rounded-lg bg-background/50">
              <p className="text-sm text-muted-foreground">Suitability Score</p>
              <p className="text-3xl font-bold text-primary">{defuzzifiedValue.toFixed(1)}</p>
            </div>
            <div className="p-4 rounded-lg bg-background/50">
              <p className="text-sm text-muted-foreground">Recommended Category</p>
              <p className={cn("text-3xl font-bold", category.color)}>{category.name}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {topMatch && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <School className="h-5 w-5 text-primary" />
              Best Match
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold">{topMatch.name}</h3>
              <div className="flex justify-center gap-2 mt-2">
                <Badge variant="default">Rank #{topMatch.rank}</Badge>
                <Badge variant="secondary">{topMatch.category}</Badge>
              </div>
              <div className="mt-4 flex items-center justify-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-5 w-5",
                      i < Math.round(topMatch.matchScore * 5)
                        ? "fill-primary text-primary"
                        : "text-muted-foreground"
                    )}
                  />
                ))}
              </div>
              <p className="text-2xl font-bold text-primary mt-2">
                {(topMatch.matchScore * 100).toFixed(0)}% Match
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {recommendations.slice(0, 5).map((college, idx) => (
            <div
              key={college.name}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg",
                idx === 0 ? "bg-primary/10" : "bg-muted/30"
              )}
            >
              <div>
                <p className="font-medium text-sm">{college.name}</p>
                <p className="text-xs text-muted-foreground">
                  Rank #{college.rank} • {college.category}
                </p>
              </div>
              <Badge variant={idx === 0 ? "default" : "outline"}>
                {(college.matchScore * 100).toFixed(0)}%
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid sm:grid-cols-2 gap-4">
        <Button variant="outline" onClick={onReplay} className="w-full">
          <RotateCcw className="h-4 w-4 mr-2" />
          Replay Learning Mode
        </Button>
        <Button variant="default" className="w-full">
          <Code className="h-4 w-4 mr-2" />
          View Full Code
        </Button>
      </div>
    </div>
  );
}

// ============= Main Component =============
export function CollegeSelectionBuilderDemo() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [inputs, setInputs] = useState<InputVariable[]>(INITIAL_INPUTS);
  const [selectedInput, setSelectedInput] = useState<string | null>(null);
  const [selectedRule, setSelectedRule] = useState<string | null>(null);

  // Calculate fuzzy values
  const fuzzifiedInputs = useMemo(() => {
    return inputs.reduce((acc, input) => {
      acc[input.id] = getFuzzySets(input.value);
      return acc;
    }, {} as Record<string, FuzzySet[]>);
  }, [inputs]);

  // Calculate rules and their firing strengths
  const rules = useMemo<FuzzyRule[]>(() => {
    const academicSets = fuzzifiedInputs['academic'] || [];
    const budgetSets = fuzzifiedInputs['budget'] || [];

    const getM = (sets: FuzzySet[], type: string) =>
      sets.find(s => s.type === type)?.membership || 0;

    return [
      {
        id: 'R1',
        condition: 'IF academic=HIGH AND budget=HIGH',
        output: 'elite',
        strength: Math.min(getM(academicSets, 'High'), getM(budgetSets, 'High')),
        active: Math.min(getM(academicSets, 'High'), getM(budgetSets, 'High')) > 0.1,
      },
      {
        id: 'R2',
        condition: 'IF academic=HIGH AND budget=MEDIUM',
        output: 'good',
        strength: Math.min(getM(academicSets, 'High'), getM(budgetSets, 'Medium')),
        active: Math.min(getM(academicSets, 'High'), getM(budgetSets, 'Medium')) > 0.1,
      },
      {
        id: 'R3',
        condition: 'IF academic=MEDIUM AND budget=HIGH',
        output: 'good',
        strength: Math.min(getM(academicSets, 'Medium'), getM(budgetSets, 'High')),
        active: Math.min(getM(academicSets, 'Medium'), getM(budgetSets, 'High')) > 0.1,
      },
      {
        id: 'R4',
        condition: 'IF academic=MEDIUM AND budget=MEDIUM',
        output: 'average',
        strength: Math.min(getM(academicSets, 'Medium'), getM(budgetSets, 'Medium')),
        active: Math.min(getM(academicSets, 'Medium'), getM(budgetSets, 'Medium')) > 0.1,
      },
      {
        id: 'R5',
        condition: 'IF academic=LOW OR budget=LOW',
        output: 'budget',
        strength: Math.max(getM(academicSets, 'Low'), getM(budgetSets, 'Low')),
        active: Math.max(getM(academicSets, 'Low'), getM(budgetSets, 'Low')) > 0.1,
      },
    ];
  }, [fuzzifiedInputs]);

  // Calculate category scores
  const categoryScores = useMemo(() => {
    const scores: Record<string, number> = {
      elite: 0,
      good: 0,
      average: 0,
      budget: 0,
    };

    rules.forEach(rule => {
      if (rule.active) {
        scores[rule.output] = Math.max(scores[rule.output], rule.strength);
      }
    });

    return scores;
  }, [rules]);

  // Calculate defuzzified value
  const defuzzifiedValue = useMemo(() => {
    let numerator = 0;
    let denominator = 0;

    for (let x = 0; x <= 100; x += 1) {
      let maxY = 0;
      Object.entries(categoryScores).forEach(([category, strength]) => {
        let categoryValue = 0;
        switch (category) {
          case 'elite': categoryValue = triangularMF(x, 75, 100, 100) * strength; break;
          case 'good': categoryValue = triangularMF(x, 50, 75, 100) * strength; break;
          case 'average': categoryValue = triangularMF(x, 25, 50, 75) * strength; break;
          case 'budget': categoryValue = triangularMF(x, 0, 25, 50) * strength; break;
        }
        maxY = Math.max(maxY, categoryValue);
      });
      numerator += x * maxY;
      denominator += maxY;
    }

    return denominator > 0 ? numerator / denominator : 50;
  }, [categoryScores]);

  // Calculate recommendations
  const recommendations = useMemo(() => {
    return COLLEGES.map(college => ({
      ...college,
      matchScore: categoryScores[college.category] || 0,
    }))
      .filter(c => c.matchScore > 0.1)
      .sort((a, b) => b.matchScore - a.matchScore);
  }, [categoryScores]);

  const handleInputChange = useCallback((id: string, value: number) => {
    setInputs(prev => prev.map(input =>
      input.id === id ? { ...input, value } : input
    ));
  }, []);

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= STEPS.length) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      setCurrentStep(step);
    }
  }, [currentStep]);

  const handleNext = useCallback(() => goToStep(currentStep + 1), [currentStep, goToStep]);
  const handlePrev = useCallback(() => goToStep(currentStep - 1), [currentStep, goToStep]);

  const handleReplay = useCallback(() => {
    setCurrentStep(1);
    setCompletedSteps(new Set());
    setInputs(INITIAL_INPUTS);
  }, []);

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <ProgressIndicator currentStep={currentStep} totalSteps={STEPS.length} />
          <StepNavigation
            steps={STEPS}
            currentStep={currentStep}
            completedSteps={completedSteps}
            onStepClick={goToStep}
          />
        </CardContent>
      </Card>

      {/* Step Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
          {currentStep}
        </div>
        <div>
          <h3 className="text-xl font-bold">{STEPS[currentStep - 1].title}</h3>
          <p className="text-sm text-muted-foreground">
            Step {currentStep} of {STEPS.length}
          </p>
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-[400px]">
        {currentStep === 1 && (
          <Step1ProblemDefinition onExplore={handleNext} />
        )}
        {currentStep === 2 && (
          <Step2InputModule
            inputs={inputs}
            selectedInput={selectedInput}
            onInputChange={handleInputChange}
            onSelectInput={setSelectedInput}
          />
        )}
        {currentStep === 3 && (
          <Step3Fuzzification
            inputs={inputs}
            selectedInput={selectedInput}
            onSelectInput={setSelectedInput}
          />
        )}
        {currentStep === 4 && (
          <Step4RuleTree
            inputs={inputs}
            rules={rules}
            selectedRule={selectedRule}
            onSelectRule={setSelectedRule}
            fuzzifiedInputs={fuzzifiedInputs}
          />
        )}
        {currentStep === 5 && (
          <Step5Inference
            rules={rules}
            categoryScores={categoryScores}
          />
        )}
        {currentStep === 6 && (
          <Step6Defuzzification
            categoryScores={categoryScores}
            defuzzifiedValue={defuzzifiedValue}
          />
        )}
        {currentStep === 7 && (
          <Step7Output
            defuzzifiedValue={defuzzifiedValue}
            recommendations={recommendations}
            onReplay={handleReplay}
          />
        )}
      </div>

      {/* Navigation Buttons */}
      {currentStep !== 7 && (
        <div className="flex justify-between gap-4">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <Button onClick={handleNext}>
            {currentStep === 1 ? 'Start Building' : 'Next Step'}
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}
