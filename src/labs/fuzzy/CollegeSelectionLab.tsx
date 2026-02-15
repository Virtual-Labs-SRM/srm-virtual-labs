import { useState, useMemo, useEffect } from 'react';
import { ExperimentLayout } from '@/components/layout/ExperimentLayout';
import { SectionCard, TheoryBlock, TermCard, HighlightItem } from '@/components/lab/SectionCard';
import { CodeBlock } from '@/components/lab/CodeBlock';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Trophy, Star, Target, School, CheckCircle2, Zap, ArrowRight, Play, RotateCcw, HelpCircle, Info, Calculator, ChevronRight, ChevronLeft } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend
} from 'recharts';

const COLLEGE_SELECTION_CODE = `"""
Fuzzy Rule-Based College Selection System

A game-oriented system that uses fuzzy logic to recommend
colleges based on student preferences and qualifications.
"""

import numpy as np
from typing import List, Dict, Tuple

class FuzzyVariable:
    """Represents a fuzzy input/output variable."""
    def __init__(self, name: str, universe: Tuple[float, float]):
        self.name = name
        self.universe = universe
        self.terms: Dict[str, callable] = {}
    
    def fuzzify(self, value: float) -> Dict[str, float]:
        return {term: mf(value) for term, mf in self.terms.items()}
`;

const ALGORITHM_PSEUDOCODE = `FUZZY-COLLEGE-SELECTION(profile, colleges):
    1. Define Fuzzy Sets:
       - Academic: {Low, Medium, High}
       - Budget: {Low, Medium, High}
       
    2. Fuzzification:
       μ_academic = membership(profile.gpa)
       μ_budget = membership(profile.budget)
       
    3. Rule Evaluation (Inference):
       IF Academic=High AND Budget=High THEN Category=Elite
       IF Academic=Med  AND Budget=Med  THEN Category=Good
       ...
       
    4. Matching & Ranking:
       Match score = Aggregate(Concept Scores)
       Top Recommendation = Max(Match Score)`;

// Simplified fuzzy membership functions
function triangularMF(x: number, a: number, b: number, c: number): number {
  if (x <= a || x >= c) return 0;
  if (a === b && x <= b) return 1; // Left shoulder fix
  if (b === c && x >= b) return 1; // Right shoulder fix

  if (x <= b) return (x - a) / (b - a);
  return (c - x) / (c - b);
}

// Generate data for membership function visualization
const generateMembershipData = (points: number) => {
  const data = [];
  for (let i = 0; i <= 100; i += (100 / points)) {
    data.push({
      x: i,
      low: triangularMF(i, 0, 0, 50),
      medium: triangularMF(i, 30, 60, 90),
      high: triangularMF(i, 70, 100, 100),
    });
  }
  return data;
};

const MEMBERSHIP_DATA = generateMembershipData(100);

const COLLEGES = [
  { name: 'Elite University', category: 'elite', rank: 1, cost: 95, quality: 98, fun: 40 },
  { name: 'Premier Institute of Technology', category: 'elite', rank: 2, cost: 90, quality: 95, fun: 50 },
  { name: 'State University', category: 'good', rank: 5, cost: 60, quality: 80, fun: 85 },
  { name: 'City Engineering College', category: 'good', rank: 8, cost: 55, quality: 75, fun: 70 },
  { name: 'Regional Technical Institute', category: 'average', rank: 15, cost: 40, quality: 65, fun: 60 },
  { name: 'District College', category: 'average', rank: 20, cost: 35, quality: 60, fun: 55 },
  { name: 'Community College', category: 'budget', rank: 30, cost: 20, quality: 50, fun: 45 },
  { name: 'Open University', category: 'budget', rank: 35, cost: 15, quality: 45, fun: 30 },
];

// Collapsible code snippet component
function CodeSnippetBlock({ code, label = 'Show Code' }: { code: string; label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen(!open)}
        className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline"
      >
        {open ? '▲ Hide Code' : `▶ ${label}`}
      </button>
      {open && (
        <pre className="mt-2 p-3 rounded-lg bg-secondary text-secondary-foreground text-xs font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
          {code}
        </pre>
      )}
    </div>
  );
}

function CollegeSelectionDemo() {
  const [studentProfile, setStudentProfile] = useState({
    academic: 75,
    budget: 60,
    location: 70,
  });

  const [isWalkthrough, setIsWalkthrough] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const [gameScore, setGameScore] = useState(0);
  const [level, setLevel] = useState(1);

  // Computed Fuzzy Values (for explanation)
  const fuzzyValues = useMemo(() => ({
    academic: {
      low: triangularMF(studentProfile.academic, 0, 0, 50),
      med: triangularMF(studentProfile.academic, 30, 60, 90),
      high: triangularMF(studentProfile.academic, 70, 100, 100)
    },
    budget: {
      low: triangularMF(studentProfile.budget, 0, 0, 40),
      med: triangularMF(studentProfile.budget, 20, 50, 80),
      high: triangularMF(studentProfile.budget, 60, 100, 100)
    }
  }), [studentProfile]);

  const recommendations = useMemo(() => {
    // Apply fuzzy rules
    const categoryScores: Record<string, number> = {
      elite: Math.min(fuzzyValues.academic.high, fuzzyValues.budget.high),
      good: Math.max(
        Math.min(fuzzyValues.academic.high, fuzzyValues.budget.med) * 0.9,
        Math.min(fuzzyValues.academic.med, fuzzyValues.budget.high) * 0.8
      ),
      average: Math.min(fuzzyValues.academic.med, fuzzyValues.budget.med),
      budget: Math.max(fuzzyValues.academic.low, fuzzyValues.budget.low) * 0.7,
    };

    // Score colleges
    return COLLEGES.map(college => ({
      ...college,
      matchScore: categoryScores[college.category] || 0,
    }))
      .filter(c => c.matchScore > 0.01)
      .sort((a, b) => b.matchScore - a.matchScore);
  }, [fuzzyValues]);

  const handleProfileChange = (key: keyof typeof studentProfile, value: number) => {
    setStudentProfile(prev => ({ ...prev, [key]: value }));
    setGameScore(prev => prev + 5);
    if (gameScore > 0 && gameScore % 50 === 0) setLevel(prev => prev + 1);
  };

  const setPreset = (preset: 'scholar' | 'budget' | 'balanced') => {
    switch (preset) {
      case 'scholar': setStudentProfile({ academic: 95, budget: 85, location: 60 }); break;
      case 'budget': setStudentProfile({ academic: 60, budget: 20, location: 40 }); break;
      case 'balanced': setStudentProfile({ academic: 70, budget: 60, location: 70 }); break;
    }
  };

  const topMatch = recommendations[0];

  const steps = [
    { id: 'input', title: '1. Crisp Inputs', desc: 'Starting with real-world numbers.' },
    { id: 'fuzzification', title: '2. Fuzzification', desc: 'Converting numbers to fuzzy degrees.' },
    { id: 'inference', title: '3. Inference', desc: 'Applying logic rules to fuzzy inputs.' },
    { id: 'output', title: '4. Defuzzification', desc: 'Computing the final result.' },
  ];

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const radarData = topMatch ? [
    { subject: 'Academic', A: studentProfile.academic, B: topMatch.quality, fullMark: 100 },
    { subject: 'Cost', A: (100 - studentProfile.budget), B: (100 - topMatch.cost), fullMark: 100 },
    { subject: 'Location', A: studentProfile.location, B: topMatch.fun, fullMark: 100 },
  ] : [];

  // --------------------------------------------------------------------------
  // WIZARD MODE: Split Screen Components
  // --------------------------------------------------------------------------

  // Left Column: The Interactive Visual
  const renderVisual = () => {
    switch (currentStep) {
      case 0: // Inputs
        return (
          <Card className="h-full border-2 border-primary/20">
            <CardHeader><CardTitle>Adjust Parameters</CardTitle></CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between font-medium">
                  <span>Academic Score</span> <span>{studentProfile.academic}%</span>
                </div>
                <Slider value={[studentProfile.academic]} onValueChange={([v]) => handleProfileChange('academic', v)} min={0} max={100} step={1} />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between font-medium">
                  <span>Budget Limit</span> <span>{studentProfile.budget}%</span>
                </div>
                <Slider value={[studentProfile.budget]} onValueChange={([v]) => handleProfileChange('budget', v)} min={0} max={100} step={1} />
              </div>
              <div className="p-4 bg-muted rounded-lg text-sm text-center">
                👆 Change these sliders to see how the system reacts in later steps!
              </div>
            </CardContent>
          </Card>
        );
      case 1: // Fuzzification
        return (
          <Card className="h-full">
            <CardHeader><CardTitle>Membership Functions</CardTitle></CardHeader>
            <CardContent className="h-[300px] overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MEMBERSHIP_DATA}>
                  <XAxis dataKey="x" type="number" domain={[0, 100]} hide />
                  <YAxis hide domain={[0, 1.2]} />
                  <Tooltip labelFormatter={(v) => `Score: ${Math.round(v)}`} />
                  <Area type="monotone" dataKey="high" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} name="High" />
                  <Area type="monotone" dataKey="medium" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} name="Medium" />
                  <Area type="monotone" dataKey="low" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} name="Low" />
                  <ReferenceLine x={studentProfile.academic} stroke="black" strokeDasharray="3 3" label={{ position: 'top', value: 'Score' }} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        );
      case 2: // Inference
        return (
          <Card className="h-full overflow-y-auto">
            <CardHeader><CardTitle>Rule Base</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                // Elite Rules
                { rule: 'IF Academic=HIGH & Budget=HIGH → ELITE', strength: Math.min(fuzzyValues.academic.high, fuzzyValues.budget.high) },

                // Good Rules
                { rule: 'IF Academic=HIGH & Budget=MED → GOOD', strength: Math.min(fuzzyValues.academic.high, fuzzyValues.budget.med) },
                { rule: 'IF Academic=MED & Budget=HIGH → GOOD', strength: Math.min(fuzzyValues.academic.med, fuzzyValues.budget.high) },
                { rule: 'IF Academic=MED & Budget=MED → GOOD', strength: Math.min(fuzzyValues.academic.med, fuzzyValues.budget.med) },

                // Average Rules
                { rule: 'IF Academic=MED & Budget=LOW → AVERAGE', strength: Math.min(fuzzyValues.academic.med, fuzzyValues.budget.low) },
                { rule: 'IF Academic=LOW & Budget=MED → AVERAGE', strength: Math.min(fuzzyValues.academic.low, fuzzyValues.budget.med) },
                { rule: 'IF Academic=HIGH & Budget=LOW → AVERAGE', strength: Math.min(fuzzyValues.academic.high, fuzzyValues.budget.low) },
                { rule: 'IF Academic=LOW & Budget=HIGH → AVERAGE', strength: Math.min(fuzzyValues.academic.low, fuzzyValues.budget.high) },

                // Budget Rules
                { rule: 'IF Academic=LOW & Budget=LOW → BUDGET', strength: Math.min(fuzzyValues.academic.low, fuzzyValues.budget.low) },
              ].sort((a, b) => b.strength - a.strength).map((r, i) => (
                <div key={i} className={`p-3 rounded border transition-all ${r.strength > 0 ? 'bg-primary/10 border-primary shadow-sm' : 'opacity-40 grayscale'}`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono text-xs font-bold">RULE #{i + 1}</span>
                    <Badge variant={r.strength > 0 ? 'default' : 'outline'}>{r.strength.toFixed(2)} Strength</Badge>
                  </div>
                  <p className="text-sm font-medium">{r.rule}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      case 3: // Output
        return (
          <Card className="h-full bg-primary/5">
            <CardContent className="flex flex-col items-center justify-center h-full p-6">
              {topMatch ? (
                <>
                  <h3 className="text-3xl font-bold text-primary mb-2">{topMatch.name}</h3>
                  <Badge className="mb-6 text-lg px-4 py-1">{topMatch.category.toUpperCase()}</Badge>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" />
                        <Radar dataKey="B" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </>
              ) : <p>No strong match found.</p>}
            </CardContent>
          </Card>
        );
    }
  };

  // Mini-Controls for Walkthrough
  const MiniControls = () => (
    <div className="pt-4 mt-4 border-t space-y-3 bg-muted/20 p-3 rounded-lg">
      <p className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1">
        <Target className="w-3 h-3" /> Live Control
      </p>
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span>Academic</span> <span className="font-mono">{studentProfile.academic}</span>
        </div>
        <Slider value={[studentProfile.academic]} onValueChange={([v]) => handleProfileChange('academic', v)} min={0} max={100} className="h-4" />
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span>Budget</span> <span className="font-mono">{studentProfile.budget}</span>
        </div>
        <Slider value={[studentProfile.budget]} onValueChange={([v]) => handleProfileChange('budget', v)} min={0} max={100} className="h-4" />
      </div>
    </div>
  );

  // Right Column: The Explanation Engine
  const renderExplanation = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-bold flex items-center gap-2 mb-2 text-blue-700 dark:text-blue-300">
                <Target className="w-5 h-5" /> The "Crisp" Input
              </h4>
              <p className="text-sm">Computers usually deal with exact numbers. Here, your Academic Score is exactly <strong>{studentProfile.academic}</strong>.</p>
            </div>
            <p className="text-muted-foreground">But in human language, is {studentProfile.academic} "High"? "Medium"? Or maybe a bit of both?</p>
            <p>Fuzzy logic allows us to represent this ambiguity. Click <strong>Next</strong> to see how.</p>
            <CodeSnippetBlock
              label="Show Agent Percept Code"
              code={`# Agent Percept Capture\ndef perceive(self, inputs):\n    """Capture crisp inputs from environment."""\n    self.profile = {\n        'academic': ${studentProfile.academic},  # current value\n        'budget': ${studentProfile.budget},       # current value\n    }\n    return self.profile`}
            />
            <MiniControls />
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <h4 className="font-bold flex items-center gap-2 mb-2 text-emerald-700 dark:text-emerald-300">
                <Calculator className="w-5 h-5" /> The Calculation
              </h4>
              <div className="space-y-2 font-mono text-sm">
                <div className="flex justify-between text-green-600">
                  <span>High(x) =</span> <span>{fuzzyValues.academic.high.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-amber-600">
                  <span>Medium(x) =</span> <span>{fuzzyValues.academic.med.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Low(x) =</span> <span>{fuzzyValues.academic.low.toFixed(2)}</span>
                </div>
              </div>
            </div>
            <p className="text-sm">
              Notice how a single score can belong to multiple categories at once! At <strong>{studentProfile.academic}</strong>,
              the value belongs to the <strong>{Object.entries(fuzzyValues.academic).filter(([_, v]) => v > 0).map(([k]) => k.charAt(0).toUpperCase() + k.slice(1)).join(' and ')}</strong> set{Object.values(fuzzyValues.academic).filter(v => v > 0).length > 1 ? 's' : ''}.
            </p>
            <CodeSnippetBlock
              label="Show Fuzzification Code"
              code={`# Triangular Membership Function\ndef triangular_mf(x, a, b, c):\n    if x <= a or x >= c: return 0.0\n    elif x <= b: return (x - a) / (b - a)\n    else: return (c - x) / (c - b)\n\n# Fuzzify Academic Score = ${studentProfile.academic}\nmu_Low    = triangular_mf(${studentProfile.academic}, 0, 0, 50)    = ${fuzzyValues.academic.low.toFixed(4)}\nmu_Medium = triangular_mf(${studentProfile.academic}, 30, 60, 90)  = ${fuzzyValues.academic.med.toFixed(4)}\nmu_High   = triangular_mf(${studentProfile.academic}, 70, 100, 100)= ${fuzzyValues.academic.high.toFixed(4)}\n\n# Fuzzify Budget = ${studentProfile.budget}\nmu_Low    = triangular_mf(${studentProfile.budget}, 0, 0, 40)    = ${fuzzyValues.budget.low.toFixed(4)}\nmu_Medium = triangular_mf(${studentProfile.budget}, 20, 50, 80)  = ${fuzzyValues.budget.med.toFixed(4)}\nmu_High   = triangular_mf(${studentProfile.budget}, 60, 100, 100)= ${fuzzyValues.budget.high.toFixed(4)}`}
            />
            <MiniControls />
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
              <h4 className="font-bold flex items-center gap-2 mb-2 text-purple-700 dark:text-purple-300">
                <Zap className="w-5 h-5" /> Fuzzy Inference
              </h4>
              <p className="text-sm mb-2">We use the <strong>Min-Max</strong> method:</p>
              <ul className="list-disc pl-4 text-xs space-y-1">
                <li><strong>AND</strong> operator = take the <strong>Minimum</strong></li>
                <li><strong>OR</strong> operator = take the <strong>Maximum</strong></li>
              </ul>
            </div>
            <div className="p-3 border rounded bg-background text-sm">
              <p className="font-semibold mb-1">Example "Elite" Rule:</p>
              <code className="text-xs break-all">
                min(Academic.High, Budget.High) <br />
                = min({fuzzyValues.academic.high.toFixed(2)}, {fuzzyValues.budget.high.toFixed(2)}) <br />
                = <strong>{Math.min(fuzzyValues.academic.high, fuzzyValues.budget.high).toFixed(2)}</strong>
              </code>
            </div>
            <CodeSnippetBlock
              label="Show Inference Code"
              code={`# Mamdani Inference: MIN for AND, MAX aggregation\nrules = [\n  ("R1", "Academic=HIGH AND Budget=HIGH",  "elite"),\n  ("R2", "Academic=HIGH AND Budget=MED",   "good"),\n  ("R3", "Academic=MED  AND Budget=HIGH",  "good"),\n  ("R4", "Academic=MED  AND Budget=MED",   "average"),\n  ("R5", "Academic=LOW  OR  Budget=LOW",   "budget"),\n]\n\n# Rule Evaluation (live values):\n# R1: min(${fuzzyValues.academic.high.toFixed(2)}, ${fuzzyValues.budget.high.toFixed(2)}) = ${Math.min(fuzzyValues.academic.high, fuzzyValues.budget.high).toFixed(4)}  → elite\n# R2: min(${fuzzyValues.academic.high.toFixed(2)}, ${fuzzyValues.budget.med.toFixed(2)}) = ${Math.min(fuzzyValues.academic.high, fuzzyValues.budget.med).toFixed(4)}  → good\n# R3: min(${fuzzyValues.academic.med.toFixed(2)}, ${fuzzyValues.budget.high.toFixed(2)}) = ${Math.min(fuzzyValues.academic.med, fuzzyValues.budget.high).toFixed(4)}  → good\n# R4: min(${fuzzyValues.academic.med.toFixed(2)}, ${fuzzyValues.budget.med.toFixed(2)}) = ${Math.min(fuzzyValues.academic.med, fuzzyValues.budget.med).toFixed(4)}  → average\n# R5: max(${fuzzyValues.academic.low.toFixed(2)}, ${fuzzyValues.budget.low.toFixed(2)}) = ${Math.max(fuzzyValues.academic.low, fuzzyValues.budget.low).toFixed(4)}  → budget`}
            />
            <MiniControls />
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h4 className="font-bold">Recommendation Found!</h4>
            <p className="text-sm">
              The system aggregated all rule outputs (Defuzzification) and compared the resulting "shape" to our database of colleges.
            </p>
            <Separator />
            <div className="flex items-center gap-4">
              <School className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm font-medium">Top Choice</p>
                <p className="text-xl font-bold">{topMatch?.name}</p>
              </div>
            </div>
            <CodeSnippetBlock
              label="Show Recommendation Code"
              code={`# Agent Action: Recommend College\ndef act(self, category_scores):\n    recommendations = []\n    for college in college_database:\n        score = category_scores.get(\n            college['category'], 0)\n        if score > 0.01:\n            recommendations.append({\n                **college,\n                'match_score': score\n            })\n    recommendations.sort(\n        key=lambda x: x['match_score'],\n        reverse=True)\n    return recommendations[0]  # Top pick`}
            />
            <Button className="w-full mt-4" onClick={() => { setIsWalkthrough(false); setCurrentStep(0); }}>
              <RotateCcw className="w-4 h-4 mr-2" /> Start New Simulation
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex justify-between items-center bg-card p-3 rounded-lg border shadow-sm">
        <div className="flex items-center gap-2">
          {!isWalkthrough ? (
            <Button onClick={() => setIsWalkthrough(true)} className="gap-2 gradient-primary shadow-lg text-white hover:opacity-90 transition-all hover:scale-105">
              <Play className="w-4 h-4" /> Start Deep Dive Walkthrough
            </Button>
          ) : (
            <Badge variant="outline" className="px-3 py-1 flex gap-2 items-center">
              <Info className="w-4 h-4" /> Guided Mode
            </Badge>
          )}
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          <Button variant="ghost" size="sm" onClick={() => { setStudentProfile({ academic: 95, budget: 40, location: 50 }); }}>Scholar</Button>
          <Button variant="ghost" size="sm" onClick={() => { setStudentProfile({ academic: 60, budget: 90, location: 50 }); }}>Wealthy</Button>
          <Button variant="ghost" size="sm" onClick={() => { setStudentProfile({ academic: 85, budget: 85, location: 50 }); }}>All-Rounder</Button>
          <Button variant="ghost" size="sm" onClick={() => { setStudentProfile({ academic: 50, budget: 50, location: 50 }); }}>Average Joe</Button>
          <Button variant="ghost" size="sm" onClick={() => { setStudentProfile({ academic: 35, budget: 35, location: 50 }); }}>Minimalist</Button>
        </div>
      </div>

      {isWalkthrough ? (
        // WIZARD LAYOUT
        <div className="grid lg:grid-cols-12 gap-6 min-h-[500px]">
          {/* Custom Animation Styles */}
          <style>{`
            @keyframes soothe-in {
              0% { opacity: 0; transform: translateY(10px) scale(0.98); filter: blur(4px); }
              100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
            }
            .animate-soothe {
              animation: soothe-in 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
            }
          `}</style>

          {/* Left Col: Visual (8 cols) */}
          <div className="lg:col-span-8">
            <div key={currentStep} className="animate-soothe h-full">
              {renderVisual()}
            </div>
          </div>

          {/* Right Col: Explanation (4 cols) */}
          <div className="lg:col-span-4 flex flex-col justify-between h-full bg-card border rounded-xl p-6 shadow-sm transition-all duration-500">
            <div key={currentStep} className="animate-soothe">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-md">
                  {currentStep + 1}
                </div>
                <h3 className="font-bold text-lg">{steps[currentStep].title}</h3>
              </div>
              {renderExplanation()}
            </div>

            <div className="flex justify-between mt-8 pt-4 border-t">
              <Button variant="outline" onClick={prevStep} disabled={currentStep === 0} className="transition-all hover:bg-primary/5">
                <ChevronLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button onClick={nextStep} disabled={currentStep === steps.length - 1} className="transition-all hover:shadow-md hover:scale-105 active:scale-95">
                Next <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        // STANDARD FREE PLAY LAYOUT
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Reuse the Logic from the previous refactor for Free Play */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="h-5 w-5 text-primary" />
                Adjust Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-3">
                <div className="flex justify-between text-sm items-center">
                  <span className="font-medium">Academic Score</span>
                  <Badge variant="secondary" className="font-mono">{studentProfile.academic}%</Badge>
                </div>
                <Slider value={[studentProfile.academic]} onValueChange={([v]) => handleProfileChange('academic', v)} min={0} max={100} />
                <div className="h-16 w-full mt-2 opacity-50 hover:opacity-100 transition-opacity">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={MEMBERSHIP_DATA}>
                      <XAxis type="number" domain={[0, 100]} hide />
                      <Area type="monotone" dataKey="high" stroke="none" fill="#22c55e" fillOpacity={0.2} />

                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm items-center">
                  <span className="font-medium">Budget Limit</span>
                  <Badge variant="secondary" className="font-mono">{studentProfile.budget}%</Badge>
                </div>
                <Slider value={[studentProfile.budget]} onValueChange={([v]) => handleProfileChange('budget', v)} min={0} max={100} />
              </div>
            </CardContent>
          </Card>

          {/* Output */}
          <Card className="bg-primary/5 border-primary/20 shadow-md">
            <CardHeader><CardTitle>Top Recommendation</CardTitle></CardHeader>
            <CardContent className="text-center">
              <h3 className="text-2xl font-bold mb-2">{topMatch?.name}</h3>
              <Badge>{topMatch?.category}</Badge>
              <div className="h-48 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <Radar dataKey="B" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export function CollegeSelectionLab() {
  const [activeSection, setActiveSection] = useState('aim');

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <ExperimentLayout
      experimentNumber={12}
      title="Fuzzy College Selection System"
      subtitle="Gamified recommendation system using fuzzy logic"
      icon="GraduationCap"
      duration="~30 minutes"
      difficulty="Beginner"
      tags={['Fuzzy Logic', 'Decision Support', 'Gamification']}
      activeSection={activeSection}
      onSectionChange={handleSectionChange}
    >
      {/* AIM SECTION */}
      <SectionCard id="aim" title="Aim" icon="Target">
        <p className="text-lg leading-relaxed mb-6">
          To develop an interactive <strong className="text-primary">Decision Support System</strong> that uses
          fuzzy rule-based logic to recommend colleges. This lab demonstrates how to handle subjective criteria
          like "good budget" or "high grades" in a computational system.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <HighlightItem icon="🎓" text="Model Subjective Preferences" />
          <HighlightItem icon="🔢" text="Implement Fuzzy Variables" />
          <HighlightItem icon="🎮" text="Gamified User Interaction" />
          <HighlightItem icon="📊" text="Rule-Based Ranking" />
        </div>
      </SectionCard>

      {/* THEORY SECTION */}
      <SectionCard id="theory" title="Theory" icon="BookOpen">
        <TheoryBlock title="Fuzzy Decision Making">
          <p className="mb-4">
            Traditional binary logic requires boolean inputs (e.g., Budget &gt; $50k). Fuzzy logic allows for
            degrees of truth. A budget of $49k isn't just "active" or "inactive"—it might be
            <span className="font-mono text-xs bg-muted px-1 rounded mx-1">0.9 Medium</span> and
            <span className="font-mono text-xs bg-muted px-1 rounded mx-1">0.1 Low</span>.
          </p>
        </TheoryBlock>

        <TheoryBlock title="System Architecture">
          <div className="p-4 bg-muted/20 rounded-xl mb-4 text-center">
            <div className="flex flex-wrap justify-center items-center gap-4 text-sm font-medium">
              <div className="bg-background px-3 py-2 rounded shadow-sm border">Inputs (Sliders)</div>
              <ArrowRight className="text-muted-foreground w-4 h-4" />
              <div className="bg-background px-3 py-2 rounded shadow-sm border border-primary/30 text-primary">Fuzzification (Graphs)</div>
              <ArrowRight className="text-muted-foreground w-4 h-4" />
              <div className="bg-background px-3 py-2 rounded shadow-sm border">Inference (Rules)</div>
              <ArrowRight className="text-muted-foreground w-4 h-4" />
              <div className="bg-background px-3 py-2 rounded shadow-sm border">Defuzzification (Matching)</div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">The data flows from left to right, transforming from crisp numbers to fuzzy sets and back.</p>
          </div>
        </TheoryBlock>

        <TheoryBlock title="Key Terms">
          <div className="grid sm:grid-cols-2 gap-4">
            <TermCard term="Antecedent" definition="The conditions in a rule (IF part)." />
            <TermCard term="Consequent" definition="The conclusion of a rule (THEN part)." />
            <TermCard term="Firing Strength" definition="The degree to which a rule applies (0.0 to 1.0)." />
            <TermCard term="Defuzzification" definition="Converting the fuzzy result back into a single score." />
          </div>
        </TheoryBlock>
      </SectionCard>

      {/* ALGORITHM SECTION */}
      <SectionCard id="algorithm" title="Algorithm" icon="Cog">
        <p className="text-muted-foreground mb-6">
          The decision process pipeline follows these steps:
        </p>

        <div className="space-y-4 mb-8">
          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">1</div>
              <div className="w-0.5 flex-1 bg-border mt-2" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Define Variables</h4>
              <p className="text-muted-foreground">Identify input variables (GRE Score, GPA) and output variable (College Rank/Admittance Chance)</p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">2</div>
              <div className="w-0.5 flex-1 bg-border mt-2" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Create Fuzzy Sets</h4>
              <p className="text-muted-foreground">Define membership functions for each variable (e.g., Low, Medium, High) to map crisp values to fuzzy degrees.</p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">3</div>
              <div className="w-0.5 flex-1 bg-border mt-2" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Define Rule Base</h4>
              <p className="text-muted-foreground">Establish If-Then rules connecting inputs to outputs (e.g., "IF GPA is High AND GRE is High THEN Chance is Very High").</p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">4</div>
              <div className="w-0.5 flex-1 bg-border mt-2" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Fuzzification</h4>
              <p className="text-muted-foreground">Convert crisp input values (e.g., GPA 3.8) into fuzzy membership degrees for each linguistic term.</p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">5</div>
              <div className="w-0.5 flex-1 bg-border mt-2" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Inference (Rule Evaluation)</h4>
              <p className="text-muted-foreground">Apply the fuzzy operators (AND/OR) to combine rule antecedents and determine the rule strength.</p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">6</div>
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Defuzzification</h4>
              <p className="text-muted-foreground">Aggregate the rule outputs and convert basic fuzzy result back into a single crisp value (e.g., using Centroid method).</p>
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
          Python structure for the recommendation engine:
        </p>
        <CodeBlock code={COLLEGE_SELECTION_CODE} language="python" title="college_selector.py" />
      </SectionCard>

      {/* DEMO SECTION */}
      <SectionCard id="demo" title="Demo" icon="Play">
        <p className="text-muted-foreground mb-6">
          Adjust the student profile sliders below. Watch how the <strong>Fuzzy Rules</strong> activate
          in real-time to change the recommended college. Try to find the "Elite University"!
        </p>
        <CollegeSelectionDemo />
      </SectionCard>

      {/* PRACTICE SECTION */}
      <SectionCard id="practice" title="Practice" icon="Pencil">
        <p className="text-muted-foreground mb-6">
          Explore the mechanics of the system:
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-secondary text-secondary-foreground">Scenario 1</Badge>
                <Badge variant="outline">Analysis</Badge>
              </div>
              <h4 className="font-semibold mb-2">The "Average" Trap</h4>
              <p className="text-sm text-muted-foreground">
                Set all sliders to 50%. Which rule fires the strongest? Why does "Regional Institute"
                rank higher than "State University" in this specific case?
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-secondary text-secondary-foreground">Scenario 2</Badge>
                <Badge variant="outline">Design</Badge>
              </div>
              <h4 className="font-semibold mb-2">New Criteria</h4>
              <p className="text-sm text-muted-foreground">
                Design a membership function for "Distance from Home".
                What would "Near", "Medium", and "Far" look like in kilometers?
              </p>
            </CardContent>
          </Card>
        </div>
      </SectionCard>
    </ExperimentLayout>
  );
}
