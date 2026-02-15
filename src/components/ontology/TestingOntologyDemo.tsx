'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import {
  Info, HelpCircle, Cpu, X, FileCheck, Gauge, ZoomIn, ZoomOut, RotateCcw
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Play, BookOpen, Target,
  Eye, Award, ChevronLeft, ChevronRight, Search, CheckCircle2,
  ArrowRight, BarChart3, Layers, Network, TrendingUp, Timer,
  ArrowUp, ArrowDown, TestTube, Zap, AlertCircle,
  Shield, Activity
} from 'lucide-react';


/* ==================== TYPES ==================== */

type Node = {
  id: string;
  x: number;
  y: number;
  type: 'ai-system' | 'test-type' | 'metric';
  label: string;
};

type Edge = {
  from: string;
  to: string;
  type: 'hasTest' | 'hasMetric';
};

type TestingOntology = {
  name: string;
  aiSystems: { id: string; label: string; description: string }[];
  testTypes: { id: string; label: string; description: string }[];
  metrics: { id: string; label: string; value?: string; description: string }[];
  relationships: { from: string; to: string; type: 'hasTest' | 'hasMetric' }[];
};

/* ==================== EXAMPLE ONTOLOGIES ==================== */

const TESTING_ONTOLOGIES: TestingOntology[] = [
  {
    name: "Heart Disease Prediction AI",
    aiSystems: [
      { id: 'HeartDiseasePredictionAI', label: 'Heart Disease AI', description: 'ML model for predicting heart disease risk' }
    ],
    testTypes: [
      { id: 'UnitTesting', label: 'Unit Testing', description: 'Tests individual components' },
      { id: 'IntegrationTesting', label: 'Integration Testing', description: 'Tests component interactions' },
      { id: 'DataValidation', label: 'Data Validation', description: 'Validates input data quality' },
    ],
    metrics: [
      { id: 'Accuracy', label: 'Accuracy', value: '92%', description: 'Overall prediction accuracy' },
      { id: 'Precision', label: 'Precision', value: '89%', description: 'Positive prediction accuracy' },
      { id: 'Recall', label: 'Recall', value: '94%', description: 'True positive rate' },
      { id: 'F1Score', label: 'F1-Score', value: '91%', description: 'Harmonic mean of precision and recall' },
    ],
    relationships: [
      { from: 'HeartDiseasePredictionAI', to: 'UnitTesting', type: 'hasTest' },
      { from: 'HeartDiseasePredictionAI', to: 'IntegrationTesting', type: 'hasTest' },
      { from: 'HeartDiseasePredictionAI', to: 'DataValidation', type: 'hasTest' },
      { from: 'UnitTesting', to: 'Accuracy', type: 'hasMetric' },
      { from: 'IntegrationTesting', to: 'Precision', type: 'hasMetric' },
      { from: 'IntegrationTesting', to: 'Recall', type: 'hasMetric' },
      { from: 'DataValidation', to: 'F1Score', type: 'hasMetric' },
    ],
  },
  {
    name: "Image Classification AI",
    aiSystems: [
      { id: 'ImageClassifierAI', label: 'Image Classifier', description: 'CNN-based image classification model' }
    ],
    testTypes: [
      { id: 'ModelTesting', label: 'Model Testing', description: 'Tests model architecture' },
      { id: 'PerformanceTesting', label: 'Performance Testing', description: 'Tests speed and efficiency' },
      { id: 'RobustnessTesting', label: 'Robustness Testing', description: 'Tests against adversarial inputs' },
    ],
    metrics: [
      { id: 'TopKAccuracy', label: 'Top-5 Accuracy', value: '96%', description: 'Top-5 classification accuracy' },
      { id: 'InferenceTime', label: 'Inference Time', value: '12ms', description: 'Average prediction time' },
      { id: 'RobustnessScore', label: 'Robustness Score', value: '87%', description: 'Resilience to perturbations' },
    ],
    relationships: [
      { from: 'ImageClassifierAI', to: 'ModelTesting', type: 'hasTest' },
      { from: 'ImageClassifierAI', to: 'PerformanceTesting', type: 'hasTest' },
      { from: 'ImageClassifierAI', to: 'RobustnessTesting', type: 'hasTest' },
      { from: 'ModelTesting', to: 'TopKAccuracy', type: 'hasMetric' },
      { from: 'PerformanceTesting', to: 'InferenceTime', type: 'hasMetric' },
      { from: 'RobustnessTesting', to: 'RobustnessScore', type: 'hasMetric' },
    ],
  },
  {
    name: "Chatbot NLP System",
    aiSystems: [
      { id: 'ChatbotNLP', label: 'Chatbot NLP', description: 'Natural language understanding chatbot' }
    ],
    testTypes: [
      { id: 'FunctionalTesting', label: 'Functional Testing', description: 'Tests chatbot functionality' },
      { id: 'UsabilityTesting', label: 'Usability Testing', description: 'Tests user experience' },
      { id: 'SecurityTesting', label: 'Security Testing', description: 'Tests for vulnerabilities' },
    ],
    metrics: [
      { id: 'IntentAccuracy', label: 'Intent Accuracy', value: '88%', description: 'Intent classification accuracy' },
      { id: 'ResponseTime', label: 'Response Time', value: '340ms', description: 'Average response latency' },
      { id: 'UserSatisfaction', label: 'User Satisfaction', value: '4.2/5', description: 'User rating score' },
    ],
    relationships: [
      { from: 'ChatbotNLP', to: 'FunctionalTesting', type: 'hasTest' },
      { from: 'ChatbotNLP', to: 'UsabilityTesting', type: 'hasTest' },
      { from: 'ChatbotNLP', to: 'SecurityTesting', type: 'hasTest' },
      { from: 'FunctionalTesting', to: 'IntentAccuracy', type: 'hasMetric' },
      { from: 'UsabilityTesting', to: 'ResponseTime', type: 'hasMetric' },
      { from: 'UsabilityTesting', to: 'UserSatisfaction', type: 'hasMetric' },
    ],
  },
];

const ontologyExplanations: Record<string, string> = {
  "Heart Disease Prediction AI": `
    This graph shows a **medical prediction AI** that uses multiple testing strategies.
    
    • The **red node** at the top is the AI system itself.
    • It connects with solid arrows (**hasTest**) to three blue test-type nodes:
      - Unit Testing
      - Integration Testing
      - Data Validation
    • Each test type then connects with dashed arrows (**hasMetric**) to one purple metric:
      - Accuracy ← Unit Testing
      - Precision & Recall ← Integration Testing
      - F1-Score ← Data Validation
    
    This structure shows a realistic testing pipeline for a high-stakes medical AI model.
  `,

  "Image Classification AI": `
    This example represents a **computer vision** model (like image classifiers used in apps or self-driving cars).
    
    • One central **red AI system** node.
    • Connected to three specialized test types (blue):
      - Model Testing
      - Performance Testing
      - Robustness Testing
    • Each test links to a different kind of metric (purple):
      - Top-5 Accuracy ← Model Testing
      - Inference Time ← Performance Testing
      - Robustness Score ← Robustness Testing
    
    Typical for deep learning models where speed, accuracy and adversarial robustness matter a lot.
  `,

  "Chatbot NLP System": `
    This graph belongs to a **conversational AI** (chatbot or virtual assistant).
    
    • Central **red node** = the chatbot system.
    • Connected to three user-focused test types (blue):
      - Functional Testing
      - Usability Testing
      - Security Testing
    • Each test type has one or more metrics (purple):
      - Intent Accuracy ← Functional Testing
      - Response Time & User Satisfaction ← Usability Testing
    
    This pattern is common for NLP/chat systems where correctness, speed and safety are critical.
  `
};
/* ==================== HELPER FUNCTIONS ==================== */

function layoutNodes(ontology: TestingOntology): Node[] {
  const nodes: Node[] = [];

  ontology.aiSystems.forEach((sys) => {
    nodes.push({
      id: sys.id,
      x: 450,
      y: 80,
      type: 'ai-system',
      label: sys.label,
    });
  });

  const testCount = ontology.testTypes.length;
  ontology.testTypes.forEach((test, i) => {
    nodes.push({
      id: test.id,
      x: 300 + (i * 200),
      y: 250,
      type: 'test-type',
      label: test.label,
    });
  });

  const metricCount = ontology.metrics.length;
  ontology.metrics.forEach((metric, i) => {
    nodes.push({
      id: metric.id,
      x: 250 + (i * 150),
      y: 420,
      type: 'metric',
      label: metric.label,
    });
  });

  return nodes;
}

function generateEdges(ontology: TestingOntology): Edge[] {
  return ontology.relationships.map(rel => ({
    from: rel.from,
    to: rel.to,
    type: rel.type,
  }));
}

/* ==================== SUB-COMPONENTS ==================== */

function RDFTripleDisplay({ nodes, edges, ontology }: { nodes: Node[]; edges: Edge[]; ontology: TestingOntology }) {
  const triples: string[] = [];

  triples.push('AISystem rdf:type rdfs:Class');
  triples.push('TestType rdf:type rdfs:Class');
  triples.push('Metric rdf:type rdfs:Class');

  ontology.aiSystems.forEach(sys => triples.push(`${sys.id} rdf:type AISystem`));
  ontology.testTypes.forEach(test => triples.push(`${test.id} rdf:type TestType`));
  ontology.metrics.forEach(metric => {
    triples.push(`${metric.id} rdf:type Metric`);
    if (metric.value) triples.push(`${metric.id} ex:value "${metric.value}"`);
  });

  edges.forEach(edge => {
    triples.push(`${edge.from} ex:${edge.type} ${edge.to}`);
  });

  return (
    <Card>
      <CardHeader className="py-3 px-4 bg-slate-50">
        <CardTitle className="text-sm flex items-center gap-2">
          <FileCheck className="h-4 w-4" />
          RDF Triples (Knowledge Representation)
        </CardTitle>
      </CardHeader>
      <CardContent className="py-3 px-4">
        <ScrollArea className="h-[300px] font-mono text-xs">
          {triples.map((triple, i) => (
            <div key={i} className="py-1 border-b border-dashed hover:bg-slate-50">
              <span className="text-blue-600">{triple.split(' ')[0]}</span>{' '}
              <span className="text-green-600">{triple.split(' ')[1]}</span>{' '}
              <span className="text-purple-600">{triple.split(' ').slice(2).join(' ')}</span>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function TestCoveragePanel({ edges, testTypes, metrics }: { edges: Edge[]; testTypes: any[]; metrics: any[] }) {
  const testCount = testTypes.length;
  const metricCount = metrics.length;
  const hasTestCount = edges.filter(e => e.type === 'hasTest').length;
  const hasMetricCount = edges.filter(e => e.type === 'hasMetric').length;

  const testCoverage = testCount > 0 ? (hasTestCount / testCount) * 100 : 0;
  const metricCoverage = metricCount > 0 ? (hasMetricCount / metricCount) * 100 : 0;

  return (
    <Card>
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-sm flex items-center gap-2">
          <Gauge className="h-4 w-4" />
          Test Coverage Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="py-3 px-4 space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Test Types Coverage</span>
            <Badge>{hasTestCount}/{testCount}</Badge>
          </div>
          <Progress value={testCoverage} className="h-2" />
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Metrics Coverage</span>
            <Badge>{hasMetricCount}/{metricCount}</Badge>
          </div>
          <Progress value={metricCoverage} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <div className="p-2 rounded bg-blue-50 border border-blue-200">
            <div className="text-xs text-blue-600 mb-1">Test Types</div>
            <div className="text-xl font-bold text-blue-900">{testCount}</div>
          </div>
          <div className="p-2 rounded bg-purple-50 border border-purple-200">
            <div className="text-xs text-purple-600 mb-1">Metrics</div>
            <div className="text-xl font-bold text-purple-900">{metricCount}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ==================== TUTORIAL ==================== */

const tutorialSteps = [
  {
    title: 'Welcome to Software Testing Ontology!',
    icon: BookOpen,
    content: 'Learn how ontologies represent AI system testing knowledge using semantic web concepts.',
  },
  {
    title: 'Understanding the Structure',
    icon: Target,
    content: 'Red = AI Systems, Blue = Test Types, Purple = Metrics. Relationships show testing hierarchy.',
  },
  {
    title: 'Load an Example',
    icon: Cpu,
    content: 'Try "Heart Disease AI" or other examples to see different testing configurations.',
  },
  {
    title: 'Explore the Graph',
    icon: Eye,
    content: 'Click nodes to see details. Watch how tests connect systems to metrics.',
  },
  {
    title: 'View RDF Triples',
    icon: Award,
    content: 'See the knowledge representation in RDF format - the foundation of semantic web.',
  },
];

function TutorialOverlay({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const current = tutorialSteps[step];
  const StepIcon = current.icon;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <StepIcon className="h-6 w-6 text-primary" />
              <div>
                <CardTitle className="text-lg">{current.title}</CardTitle>
                <Badge variant="outline" className="mt-1">
                  Step {step + 1} of {tutorialSteps.length}
                </Badge>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-1 mb-4">
            {tutorialSteps.map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded ${i <= step ? 'bg-primary' : 'bg-muted'}`} />
            ))}
          </div>
          <p className="text-sm mb-4">{current.content}</p>
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={onClose}>Skip</Button>
              {step === tutorialSteps.length - 1 ? (
                <Button onClick={onClose}>Get Started</Button>
              ) : (
                <Button onClick={() => setStep(step + 1)}>
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ==================== TYPE GUARD ==================== */

type OntologyItem =
  | { id: string; label: string; description: string }
  | { id: string; label: string; value?: string; description: string };

function isMetricItem(item: OntologyItem | null): item is { id: string; label: string; value: string; description: string } {
  return item !== null && 'value' in item && typeof item.value === 'string';
}

/* ==================== MAIN COMPONENT ==================== */



const DEFAULT_SCALE = 1;
const MIN_SCALE = 0.4;
const MAX_SCALE = 3;
const SCALE_STEP = 0.25;

export function TestingOntologyDemo() {
  const [currentOntology, setCurrentOntology] = useState<TestingOntology>(TESTING_ONTOLOGIES[0]);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [highlightedPath, setHighlightedPath] = useState<string[]>([]);
  // Tutorial Build Mode
  const [buildMode, setBuildMode] = useState(false);
  const [buildStep, setBuildStep] = useState(1);
  // Pan state
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const [builtAISystem, setBuiltAISystem] = useState<string | null>(null);
  const [builtTests, setBuiltTests] = useState<string[]>([]);
  const [builtMetrics, setBuiltMetrics] = useState<string[]>([]);

  const [explanationVisible, setExplanationVisible] = useState(false);
  const [activePseudoLine, setActivePseudoLine] = useState<number | null>(null);
  const [explanationText, setExplanationText] = useState<string>('');

  // Zoom & Pan state
  const [scale, setScale] = useState(DEFAULT_SCALE);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    loadOntology(currentOntology);
  }, []);

  const loadOntology = (ontology: TestingOntology) => {
    const newNodes = layoutNodes(ontology);
    const newEdges = generateEdges(ontology);
    setNodes(newNodes);
    setEdges(newEdges);
    setCurrentOntology(ontology);
    setSelectedNodeId(null);
    setHighlightedPath([]);
    setScale(DEFAULT_SCALE);
    setTranslateX(0);
    setTranslateY(0);
  };
  const startBuildMode = () => {
    setBuildMode(true);
    setBuildStep(1);
    setBuiltAISystem(null);
    setBuiltTests([]);
    setBuiltMetrics([]);
    setNodes([]);
    setEdges([]);
    setSelectedNodeId(null);
  };

  const exitBuildMode = () => {
    setBuildMode(false);
    loadOntology(currentOntology);
  };

  const zoomIn = () => setScale(prev => Math.min(prev + SCALE_STEP, MAX_SCALE));
  const zoomOut = () => setScale(prev => Math.max(prev - SCALE_STEP, MIN_SCALE));
  const resetView = () => {
    setScale(DEFAULT_SCALE);
    setTranslateX(0);
    setTranslateY(0);
  };

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    setDragging(true);
    setDragStart({
      x: e.clientX - panX,
      y: e.clientY - panY,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!dragging) return;

    setPanX(e.clientX - dragStart.x);
    setPanY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => {
    setDragging(false);
  };


  const handleNodeClick = (nodeId: string) => {
    setSelectedNodeId(nodeId === selectedNodeId ? null : nodeId);
    const connected: string[] = [nodeId];
    edges.forEach(edge => {
      if (edge.from === nodeId) connected.push(edge.to);
      if (edge.to === nodeId) connected.push(edge.from);
    });
    setHighlightedPath(connected);
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  const selectedDetails: OntologyItem | null = selectedNode ? (
    currentOntology.aiSystems.find(s => s.id === selectedNode.id) ||
    currentOntology.testTypes.find(t => t.id === selectedNode.id) ||
    currentOntology.metrics.find(m => m.id === selectedNode.id)
  ) : null;

  const getNodeColor = (node: Node) => {
    if (node.type === 'ai-system') return '#ef4444';
    if (node.type === 'test-type') return '#3b82f6';
    return '#a855f7';
  };

  const PSEUDOCODE = [
    "1. create AI System instance",
    "2. select test type",
    "3. connect AI --hasTest--> TestType",
    "4. select evaluation metric",
    "5. connect TestType --hasMetric--> Metric",
    "6. update RDF triple store",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Software Testing Ontology for AI Systems</h2>
        <div className="flex flex-wrap items-center gap-2">

          {!buildMode && (
            <Button
              size="sm"
              onClick={startBuildMode}
              className="gradient-primary shadow-lg text-white hover:opacity-90 transition-all hover:scale-105 border-none"
            >
              <Play className="h-4 w-4 mr-2" />
              Build Ontology
            </Button>
          )}

          {buildMode && (
            <Button
              variant="outline"
              size="sm"
              onClick={exitBuildMode}
            >
              Exit Build Mode
            </Button>
          )}

          <Button variant="outline" size="sm" onClick={() => setShowTutorial(!showTutorial)}>
            <HelpCircle className="h-4 w-4 mr-2" />
            {showTutorial ? 'Hide' : 'Show'} Tutorial
          </Button>

          <Button variant="outline" size="icon" onClick={zoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>

          <Button variant="outline" size="icon" onClick={zoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>

          <Button variant="outline" size="icon" onClick={resetView}>
            <RotateCcw className="h-4 w-4" />
          </Button>

        </div>

      </div>

      {showTutorial && <TutorialOverlay onClose={() => setShowTutorial(false)} />}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left - Controls */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <Cpu className="h-4 w-4" />
                AI System Selection
              </CardTitle>
            </CardHeader>
            <CardContent className="py-3 px-4 space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Load Example</Label>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {TESTING_ONTOLOGIES.map((ont, i) => (
                    <Button
                      key={i}
                      variant={currentOntology.name === ont.name ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => loadOntology(ont)}
                      className="justify-start text-xs"
                    >
                      {ont.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t">
                <p className="text-xs text-muted-foreground mb-2">Legend</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-red-500" />
                    <span className="text-xs">AI System</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-blue-500" />
                    <span className="text-xs">Test Type</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-purple-500" />
                    <span className="text-xs">Metric</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <TestCoveragePanel
            edges={edges}
            testTypes={currentOntology.testTypes}
            metrics={currentOntology.metrics}
          />
        </div>

        {/* Center - Graph */}
        <div className="lg:col-span-6">
          <Card className="h-full">
            <CardHeader className="py-3 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">
                  Testing Ontology Graph
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  Click nodes for details
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="relative w-full h-[500px] sm:h-[600px] border-t bg-gradient-to-b from-slate-50 to-white overflow-hidden">

                {/* ================= BUILD MODE CONTROLS ================= */}
                {buildMode && (
                  <div className="p-4 border-b bg-slate-50 space-y-4">
                    <h3 className="font-semibold text-sm">
                      Build Mode — Step {buildStep} of 3
                    </h3>

                    {/* STEP 1 */}
                    {buildStep === 1 && (
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">
                          Select an AI System instance to create the root node.
                        </p>

                        {currentOntology.aiSystems.map(sys => (
                          <Button
                            key={sys.id}
                            size="sm"
                            onClick={() => {
                              const newNode: Node = {
                                id: sys.id,
                                label: sys.label,
                                x: 450,
                                y: 80,
                                type: 'ai-system'
                              };

                              setNodes([newNode]);
                              setBuiltAISystem(sys.id);
                              setBuildStep(2);

                              setActivePseudoLine(0);
                              setExplanationText(
                                `Created AI System: ${sys.label}. This becomes the root node of the ontology.`
                              );
                              setExplanationVisible(true);
                            }}
                          >
                            {sys.label}
                          </Button>
                        ))}
                      </div>
                    )}

                    {/* STEP 2 */}
                    {buildStep === 2 && (
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">
                          Select Test Types (creates hasTest relationships).
                        </p>

                        {currentOntology.testTypes.map((test, i) => (
                          <Button
                            key={test.id}
                            size="sm"
                            variant={builtTests.includes(test.id) ? 'default' : 'outline'}
                            onClick={() => {
                              if (!builtAISystem) return;
                              if (builtTests.includes(test.id)) return;

                              const newNode: Node = {
                                id: test.id,
                                label: test.label,
                                x: 300 + i * 200,
                                y: 250,
                                type: 'test-type'
                              };

                              setNodes(prev => [...prev, newNode]);
                              setEdges(prev => [
                                ...prev,
                                { from: builtAISystem, to: test.id, type: 'hasTest' }
                              ]);

                              setBuiltTests(prev => [...prev, test.id]);

                              setActivePseudoLine(2);
                              setExplanationText(
                                `Created relationship: ${builtAISystem} --hasTest--> ${test.label}`
                              );
                              setExplanationVisible(true);
                            }}
                          >
                            {test.label}
                          </Button>
                        ))}

                        {builtTests.length > 0 && (
                          <Button size="sm" onClick={() => setBuildStep(3)}>
                            Next → Add Metrics
                          </Button>
                        )}
                      </div>
                    )}

                    {/* STEP 3 */}
                    {buildStep === 3 && (
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">
                          Select Metrics (creates hasMetric relationships).
                        </p>

                        {currentOntology.metrics.map((metric, i) => (
                          <Button
                            key={metric.id}
                            size="sm"
                            variant={builtMetrics.includes(metric.id) ? 'default' : 'outline'}
                            onClick={() => {
                              if (builtTests.length === 0) return;
                              if (builtMetrics.includes(metric.id)) return;

                              const attachTo = builtTests[0];

                              const newNode: Node = {
                                id: metric.id,
                                label: metric.label,
                                x: 250 + i * 150,
                                y: 420,
                                type: 'metric'
                              };

                              setNodes(prev => [...prev, newNode]);
                              setEdges(prev => [
                                ...prev,
                                { from: attachTo, to: metric.id, type: 'hasMetric' }
                              ]);

                              setBuiltMetrics(prev => [...prev, metric.id]);

                              setActivePseudoLine(4);
                              setExplanationText(
                                `Created relationship: ${attachTo} --hasMetric--> ${metric.label}`
                              );
                              setExplanationVisible(true);
                            }}
                          >
                            {metric.label}
                          </Button>
                        ))}

                        {builtMetrics.length > 0 && (
                          <Button size="sm" onClick={exitBuildMode}>
                            Finish
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* ================= SVG GRAPH ================= */}
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 900 600"
                  onMouseDown={(e) => {
                    // Only start drag if clicking empty canvas
                    if (e.target === e.currentTarget) {
                      handleMouseDown(e);
                    }
                  }}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  style={{ cursor: dragging ? 'grabbing' : 'grab' }}
                >
                  <g transform={`translate(${panX}, ${panY})`}>

                    {/* EDGES */}
                    {edges.map((edge, i) => {
                      const from = nodes.find(n => n.id === edge.from);
                      const to = nodes.find(n => n.id === edge.to);
                      if (!from || !to) return null;

                      return (
                        <line
                          key={i}
                          x1={from.x}
                          y1={from.y}
                          x2={to.x}
                          y2={to.y}
                          stroke="#cbd5e1"
                          strokeWidth={2}
                          strokeDasharray={edge.type === 'hasMetric' ? '5,5' : 'none'}
                        />
                      );
                    })}

                    {/* NODES */}
                    {nodes.map(node => (
                      <g
                        key={node.id}
                        onMouseDown={(e) => e.stopPropagation()}  // 🔥 prevents drag
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNodeClick(node.id);
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        <rect
                          x={node.x - 50}
                          y={node.y - 25}
                          width={100}
                          height={50}
                          rx={8}
                          fill={
                            node.type === 'ai-system'
                              ? '#fca5a5'  // softer red
                              : node.type === 'test-type'
                                ? '#93c5fd'  // softer blue
                                : '#d8b4fe'  // softer purple
                          }
                        />
                        <foreignObject
                          x={node.x - 50}
                          y={node.y - 25}
                          width={100}
                          height={50}
                          style={{ pointerEvents: 'none' }}
                        >
                          <div
                            style={{
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              textAlign: 'center',
                              fontSize: '11px',
                              fontWeight: '600',
                              color: '#1f2937',
                              padding: '2px',
                              lineHeight: '1.2'
                            }}
                          >
                            {node.label}
                          </div>
                        </foreignObject>
                      </g>
                    ))}

                  </g>
                </svg>


                {/* ================= BOTTOM POPUP ================= */}
                {explanationVisible && (
                  <div className="absolute bottom-0 left-0 right-0 bg-white border-t shadow-xl p-4 z-20">
                    <div className="grid grid-cols-2 gap-6">

                      <div className="font-mono text-xs space-y-1">
                        <h4 className="font-semibold text-sm mb-2">
                          Ontology Construction Logic
                        </h4>
                        {PSEUDOCODE.map((line, index) => (
                          <div
                            key={index}
                            className={`px-2 py-1 rounded ${activePseudoLine === index
                              ? 'bg-yellow-200 text-black'
                              : 'text-muted-foreground'
                              }`}
                          >
                            {line}
                          </div>
                        ))}
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm mb-2">
                          What Just Happened?
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {explanationText}
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-3"
                          onClick={() => setExplanationVisible(false)}
                        >
                          Close
                        </Button>
                      </div>

                    </div>
                  </div>
                )}

              </div>
            </CardContent>
          </Card>
        </div>


        {/* Right - Details */}
        <div className="lg:col-span-3 space-y-6">
          {selectedDetails ? (
            <Card className="border-primary/30">
              <CardHeader className="py-3 px-4 bg-primary/5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Details
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedNodeId(null)} className="h-6 w-6 p-0">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="py-3 px-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-bold text-lg">{selectedDetails.label}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{selectedDetails.description}</p>
                  </div>

                  {isMetricItem(selectedDetails) && (
                    <div className="p-2 rounded bg-purple-50 border border-purple-200">
                      <p className="text-xs text-purple-600">Metric Value</p>
                      <p className="text-2xl font-bold text-purple-900">{selectedDetails.value}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Connections</p>
                    {edges
                      .filter(e => e.from === selectedNodeId || e.to === selectedNodeId)
                      .map((edge, i) => (
                        <div key={i} className="text-xs p-2 rounded bg-muted/50">
                          {edge.from === selectedNodeId ? (
                            <>
                              <span className="font-mono text-green-600">{edge.type}</span>
                              {' → '}
                              <span className="font-semibold">{nodes.find(n => n.id === edge.to)?.label}</span>
                            </>
                          ) : (
                            <>
                              <span className="font-semibold">{nodes.find(n => n.id === edge.from)?.label}</span>
                              {' → '}
                              <span className="font-mono text-green-600">{edge.type}</span>
                            </>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-4 text-center text-muted-foreground">
                <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Click a node to see details</p>
              </CardContent>
            </Card>
          )}

          <RDFTripleDisplay nodes={nodes} edges={edges} ontology={currentOntology} />
        </div>
      </div>

      {/* Full-width Explanation Section - Below everything */}
      {/* Full-width Explanation Section – Below everything */}
      <div className="w-full mt-10">
        <Card className="border-muted shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold">
              Understanding the Current Graph: {currentOntology.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1.5">
              Quick beginner's guide — what this example is actually showing you
            </p>
          </CardHeader>

          <CardContent className="space-y-8 text-sm">
            {/* Universal Legend */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex flex-col items-start gap-2">
                <div className="flex items-center gap-2 font-medium">
                  <span className="inline-block w-4 h-4 rounded-full bg-red-500 flex-shrink-0"></span>
                  <span>Red nodes = AI Systems</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  The main AI model or application being tested.
                </p>
              </div>

              <div className="flex flex-col items-start gap-2">
                <div className="flex items-center gap-2 font-medium">
                  <span className="inline-block w-4 h-4 rounded-full bg-blue-500 flex-shrink-0"></span>
                  <span>Blue nodes = Test Types</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Different methods used to test the AI system.
                </p>
              </div>

              <div className="flex flex-col items-start gap-2">
                <div className="flex items-center gap-2 font-medium">
                  <span className="inline-block w-4 h-4 rounded-full bg-purple-500 flex-shrink-0"></span>
                  <span>Purple nodes = Evaluation Metrics</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Scores and numbers showing how well the AI performs.
                </p>
              </div>
            </div>

            {/* Dynamic Specific Explanation */}
            <div className="pt-6 border-t">
              <h4 className="font-semibold text-base mb-4">
                What this particular graph is showing
              </h4>

              {currentOntology.name === "Chatbot NLP System" ? (
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    This graph represents a <strong>conversational AI</strong> (chatbot or virtual assistant) — the kind used in customer support, virtual helpers, or messaging apps.
                  </p>

                  <ul className="space-y-3 pl-5 list-disc">
                    <li>
                      <strong>Central red node</strong> → the chatbot system itself.
                    </li>
                    <li>
                      <strong>Three blue test types</strong> connected to it with solid arrows (<span className="font-mono text-green-600">hasTest</span>):
                      <ul className="list-disc pl-6 mt-1 space-y-1 text-sm">
                        <li>Functional Testing → checks if the chatbot actually works correctly</li>
                        <li>Usability Testing → evaluates how easy and pleasant it is to use</li>
                        <li>Security Testing → looks for vulnerabilities and safety issues</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Purple metrics</strong> connected with dashed arrows (<span className="font-mono text-green-600">hasMetric</span>):
                      <ul className="list-disc pl-6 mt-1 space-y-1 text-sm">
                        <li>Intent Accuracy → measures how well it understands what the user wants</li>
                        <li>Response Time → how fast it replies</li>
                        <li>User Satisfaction → overall user happiness rating</li>
                      </ul>
                    </li>
                  </ul>

                  <p className="pt-2 italic">
                    This structure is very typical for chatbots/NLP systems where <strong>correctness</strong>, <strong>speed</strong>, and <strong>safety</strong> are equally important.
                  </p>
                </div>
              ) : currentOntology.name === "Heart Disease Prediction AI" ? (
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  {/* Add similar structured explanation for Heart Disease */}
                  <p>
                    This graph shows a <strong>high-stakes medical AI</strong> designed to predict heart disease risk.
                  </p>
                  <ul className="space-y-3 pl-5 list-disc">
                    <li>
                      <strong>Central red node</strong> → the heart disease prediction model.
                    </li>
                    <li>
                      <strong>Three blue test types</strong>:
                      <ul className="list-disc pl-6 mt-1 space-y-1 text-sm">
                        <li>Unit Testing → checks individual parts</li>
                        <li>Integration Testing → checks how parts work together</li>
                        <li>Data Validation → ensures input data is clean and correct</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Purple metrics</strong>:
                      <ul className="list-disc pl-6 mt-1 space-y-1 text-sm">
                        <li>Accuracy → overall correctness (92%)</li>
                        <li>Precision & Recall → how reliable positive predictions are</li>
                        <li>F1-Score → balanced measure of precision and recall</li>
                      </ul>
                    </li>
                  </ul>
                  <p className="pt-2 italic">
                    Medical AIs often use multiple layers of testing because mistakes can have serious consequences.
                  </p>
                </div>
              ) : currentOntology.name === "Image Classification AI" ? (
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  {/* Add explanation for Image Classification */}
                  <p>
                    This graph represents a <strong>computer vision AI</strong> (used for recognizing objects in images).
                  </p>
                  <ul className="space-y-3 pl-5 list-disc">
                    <li>
                      <strong>Central red node</strong> → the image classification model.
                    </li>
                    <li>
                      <strong>Three blue test types</strong>:
                      <ul className="list-disc pl-6 mt-1 space-y-1 text-sm">
                        <li>Model Testing → checks architecture and correctness</li>
                        <li>Performance Testing → measures speed and efficiency</li>
                        <li>Robustness Testing → tests behavior under attack or noise</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Purple metrics</strong>:
                      <ul className="list-disc pl-6 mt-1 space-y-1 text-sm">
                        <li>Top-5 Accuracy → how often correct answer is in top 5 guesses</li>
                        <li>Inference Time → how fast it makes predictions</li>
                        <li>Robustness Score → how well it resists adversarial examples</li>
                      </ul>
                    </li>
                  </ul>
                  <p className="pt-2 italic">
                    Common for deep learning image models where speed and resistance to tricks/attacks are critical.
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground italic">
                  Select an example from the left panel to see a tailored explanation.
                </p>
              )}
            </div>

            {/* Universal Interaction Guide */}
            <div className="pt-6 border-t">
              <h4 className="font-semibold text-base mb-4">
                Quick Interaction Guide
              </h4>
              <ul className="space-y-2.5 text-muted-foreground list-disc list-inside pl-5">
                <li>Click any node → see its description and value (if it's a metric)</li>
                <li>Connected nodes automatically highlight → shows the full testing flow</li>
                <li>Use zoom buttons (top-right) → zoom in/out to see details or overview</li>
                <li>Drag anywhere on the graph → move it freely (you can drag it off-screen!)</li>
                <li>Reset button → instantly returns the graph to center and default zoom</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}