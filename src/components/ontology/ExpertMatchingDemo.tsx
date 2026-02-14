'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import {
  Info, Play, RotateCcw, HelpCircle, X, BookOpen, Target,
  Eye, Award, ChevronLeft, ChevronRight, Search, CheckCircle2,
  ArrowRight, BarChart3, Layers, Network, TrendingUp, Timer,
  ArrowUp, ArrowDown, Trophy, Users
} from 'lucide-react';


import { TraversalExplanation } from './TraversalExplanation';
import { ExpertMatchingCanvas } from './ExpertMatchingCanvas';  // Adjust path if needed

/* ==================== TYPES ==================== */

type Node = {
  id: string;
  x: number;
  y: number;
};

type Edge = {
  from: string;
  to: string;
};

type Expert = {
  id: string;
  name: string;
  skills: string[];
  experience: number;
  publications: number;
  relevanceScore: number;
  matchingSkills: string[];
};

type OntologyExample = {
  name: string;
  root: string;
  data: Record<string, { children?: string[] }>;
  experts: { name: string; skills: string[]; experience: number; publications: number }[];
};

/* ==================== EXAMPLE ONTOLOGIES WITH EXPERTS ==================== */

const EXAMPLE_ONTOLOGIES: OntologyExample[] = [
  {
    name: "Classic AI",
    root: "Artificial Intelligence",
    data: {
      'Artificial Intelligence': { children: ['Machine Learning', 'Knowledge Representation'] },
      'Machine Learning': { children: ['Supervised Learning', 'Unsupervised Learning', 'Reinforcement Learning'] },
      'Supervised Learning': { children: ['Regression', 'Classification'] },
      'Unsupervised Learning': { children: ['Clustering', 'Dimensionality Reduction'] },
      'Reinforcement Learning': { children: ['Q-Learning', 'Policy Gradient'] },
      'Regression': {},
      'Classification': {},
      'Clustering': {},
      'Dimensionality Reduction': {},
      'Q-Learning': {},
      'Policy Gradient': {},
      'Knowledge Representation': {},
    },
    experts: [
      { name: 'Dr. Sarah Chen', skills: ['Machine Learning', 'Supervised Learning'], experience: 12, publications: 45 },
      { name: 'Prof. Michael Roberts', skills: ['Reinforcement Learning', 'Q-Learning'], experience: 15, publications: 68 },
      { name: 'Dr. Emily Zhang', skills: ['Unsupervised Learning', 'Clustering'], experience: 8, publications: 32 },
      { name: 'Dr. James Wilson', skills: ['Classification', 'Regression'], experience: 10, publications: 41 },
      { name: 'Prof. Lisa Anderson', skills: ['Knowledge Representation', 'Artificial Intelligence'], experience: 18, publications: 92 },
    ],
  },
  {
    name: "Web Development",
    root: "Web Technologies",
    data: {
      'Web Technologies': { children: ['Frontend', 'Backend', 'DevOps'] },
      'Frontend': { children: ['HTML & CSS', 'JavaScript', 'React', 'Vue.js'] },
      'Backend': { children: ['Node.js', 'Python Django', 'Java Spring'] },
      'DevOps': { children: ['Docker', 'Kubernetes', 'CI/CD Pipelines'] },
      'React': { children: ['Next.js', 'Redux'] },
      'HTML & CSS': {},
      'JavaScript': {},
      'Vue.js': {},
      'Node.js': {},
      'Python Django': {},
      'Java Spring': {},
      'Docker': {},
      'Kubernetes': {},
      'CI/CD Pipelines': {},
      'Next.js': {},
      'Redux': {},
    },
    experts: [
      { name: 'Alex Martinez', skills: ['React', 'Next.js', 'Frontend'], experience: 7, publications: 12 },
      { name: 'Jordan Lee', skills: ['Node.js', 'Backend'], experience: 9, publications: 18 },
      { name: 'Sam Taylor', skills: ['Docker', 'Kubernetes', 'DevOps'], experience: 11, publications: 25 },
      { name: 'Chris Brown', skills: ['Vue.js', 'Frontend'], experience: 6, publications: 10 },
      { name: 'Morgan Davis', skills: ['Python Django', 'Backend'], experience: 8, publications: 15 },
    ],
  },
  {
    name: "Data Science",
    root: "Data Science",
    data: {
      'Data Science': { children: ['Statistics', 'Machine Learning', 'Data Visualization', 'Big Data'] },
      'Machine Learning': { children: ['Deep Learning', 'Classical ML'] },
      'Deep Learning': { children: ['Computer Vision', 'NLP'] },
      'Big Data': { children: ['Hadoop', 'Apache Spark'] },
      'Data Visualization': { children: ['Tableau', 'Power BI'] },
      'Statistics': {},
      'Hadoop': {},
      'Apache Spark': {},
      'Computer Vision': {},
      'NLP': {},
      'Classical ML': {},
      'Tableau': {},
      'Power BI': {},
    },
    experts: [
      { name: 'Dr. Patricia Moore', skills: ['Data Science', 'Statistics'], experience: 14, publications: 52 },
      { name: 'Dr. Robert Garcia', skills: ['Deep Learning', 'Computer Vision'], experience: 9, publications: 34 },
      { name: 'Dr. Jennifer White', skills: ['NLP', 'Deep Learning'], experience: 11, publications: 41 },
      { name: 'Dr. Thomas Hall', skills: ['Big Data', 'Hadoop'], experience: 12, publications: 38 },
      { name: 'Emma Clark', skills: ['Data Visualization', 'Tableau'], experience: 6, publications: 16 },
    ],
  },
  {
    name: "Biology",
    root: "Biology",
    data: {
      'Biology': { children: ['Cell Biology', 'Genetics', 'Ecology', 'Evolution'] },
      'Genetics': { children: ['DNA', 'RNA', 'Mendelian Genetics'] },
      'Ecology': { children: ['Ecosystems', 'Biodiversity'] },
      'Evolution': { children: ['Natural Selection', 'Speciation'] },
      'Cell Biology': { children: ['Cell Structure', 'Cell Division'] },
      'DNA': {},
      'RNA': {},
      'Ecosystems': {},
      'Biodiversity': {},
      'Natural Selection': {},
      'Speciation': {},
      'Mendelian Genetics': {},
      'Cell Structure': {},
      'Cell Division': {},
    },
    experts: [
      { name: 'Prof. Maria Rodriguez', skills: ['Genetics', 'DNA'], experience: 16, publications: 74 },
      { name: 'Dr. John Adams', skills: ['Cell Biology', 'Cell Structure'], experience: 13, publications: 48 },
      { name: 'Dr. Linda Chen', skills: ['Ecology', 'Ecosystems'], experience: 11, publications: 39 },
      { name: 'Prof. William Turner', skills: ['Evolution', 'Natural Selection'], experience: 19, publications: 86 },
      { name: 'Dr. Rachel Green', skills: ['Biodiversity', 'Ecology'], experience: 8, publications: 24 },
    ],
  },
];

/* ==================== HELPER FUNCTIONS ==================== */

function layoutGraphNodes(nodeIds: string[], edges: Edge[], rootId: string): Node[] {
  if (nodeIds.length === 0) return [];

  const childrenMap = new Map<string, string[]>();
  edges.forEach(({ from, to }) => {
    if (!childrenMap.has(from)) childrenMap.set(from, []);
    childrenMap.get(from)!.push(to);
  });

  const levels = new Map<string, number>();
  const queue: { id: string; level: number }[] = [{ id: rootId, level: 0 }];
  levels.set(rootId, 0);

  while (queue.length > 0) {
    const { id, level } = queue.shift()!;
    const children = childrenMap.get(id) || [];
    children.forEach(child => {
      if (!levels.has(child)) {
        levels.set(child, level + 1);
        queue.push({ id: child, level: level + 1 });
      }
    });
  }

  const nodesByLevel: Record<number, string[]> = {};
  levels.forEach((level, id) => {
    if (!nodesByLevel[level]) nodesByLevel[level] = [];
    nodesByLevel[level].push(id);
  });

  const nodes: Node[] = [];
  const levelHeight = 90;
  const nodeWidth = 180;

  Object.entries(nodesByLevel).forEach(([levelStr, ids]) => {
    const level = Number(levelStr);
    const count = ids.length;
    const canvasWidth = 800; // logical layout width
    const startX = canvasWidth / 2 - ((count - 1) * nodeWidth) / 2;


    ids.forEach((id, idx) => {
      nodes.push({
        id,
        x: startX + idx * nodeWidth,
        y: 60 + level * levelHeight,
      });
    });
  });

  return nodes;
}

function generateGraph(ontologyData: Record<string, { children?: string[] }>, rootId: string): { nodes: Node[]; edges: Edge[] } {
  const edges: Edge[] = [];
  Object.entries(ontologyData).forEach(([parent, data]) => {
    data.children?.forEach(child => {
      edges.push({ from: parent, to: child });
    });
  });

  const nodeIds = Object.keys(ontologyData);
  const nodes = layoutGraphNodes(nodeIds, edges, rootId);

  return { nodes, edges };
}

/* ==================== SUB-COMPONENTS ==================== */

function StackVisualizer({ stack }: { stack: string[] }) {
  return (
    <Card className="border border-muted">
      <CardContent className="p-4">
        <h4 className="font-semibold mb-3 text-sm">DFS Stack (LIFO)</h4>
        <div className="flex flex-col-reverse gap-2">
          {stack.length === 0 && (
            <p className="text-sm text-muted-foreground italic">Stack is empty</p>
          )}
          {stack.map((item, idx) => (
            <div
              key={idx}
              className={`rounded-md px-3 py-2 text-sm font-medium ${idx === stack.length - 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}
            >
              {item}
              {idx === stack.length - 1 && <span className="ml-2 text-xs">(top)</span>}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function StepByStepWhy({
  startNode,
  visited,
  traversedEdges,
  edges,
}: {
  startNode: string;
  visited: string[];
  traversedEdges: Set<string>;
  edges: Edge[];
}) {
  if (!startNode || visited.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic">
        Start the traversal to see step-by-step explanation
      </p>
    );
  }

  return (
    <div className="space-y-4 text-sm">
      <p className="font-medium">Why these concepts were visited:</p>
      <ol className="list-decimal pl-5 space-y-2">
        {visited.map((node, idx) => {
          if (idx === 0) {
            return (
              <li key={node}>
                <strong>{node}</strong> — Starting point (you selected it)
              </li>
            );
          }

          const incoming = Array.from(traversedEdges).find(edge => edge.endsWith(`-${node}`));
          const from = incoming ? incoming.split('-')[0] : 'unknown';

          return (
            <li key={node}>
              <strong>{node}</strong> — reached from <em>{from}</em> (child concept)
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// Tutorial Overlay
const tutorialSteps = [
  {
    title: 'Welcome to Ontology-Based Expert Matching!',
    icon: BookOpen,
    content: (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Learn how ontologies help match domain queries with expert profiles using semantic relationships.
        </p>
        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
          <p className="text-xs font-medium text-blue-900 mb-1">What you'll learn:</p>
          <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
            <li>How ontology structures represent domain knowledge</li>
            <li>Semantic query expansion using relationships</li>
            <li>Expert matching based on relevance scoring</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    title: 'Understanding the Ontology Graph',
    icon: Target,
    content: (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground mb-2">The canvas shows concepts and experts:</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-2 rounded bg-muted/50">
            <div className="w-6 h-6 rounded-full bg-blue-500" />
            <span className="text-sm">Blue = Query concepts</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded bg-muted/50">
            <div className="w-6 h-6 rounded-full bg-yellow-500" />
            <span className="text-sm">Yellow = Currently exploring</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded bg-muted/50">
            <div className="w-6 h-6 rounded-full bg-green-600" />
            <span className="text-sm">Green = Visited concepts</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded bg-muted/50">
            <div className="w-12 h-6 rounded bg-purple-500" />
            <span className="text-sm">Purple = Expert profiles</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Click Nodes to Explore',
    icon: Play,
    content: (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Click any concept node to see:
        </p>
        <ul className="text-sm space-y-1 list-disc list-inside">
          <li>Detailed definition and examples</li>
          <li>Parent and child relationships</li>
          <li>Related concepts</li>
          <li>Matching experts</li>
        </ul>
        <div className="p-2 rounded bg-amber-50 border border-amber-200">
          <p className="text-xs text-amber-800">
            💡 Try clicking "Deep Learning" to see its details!
          </p>
        </div>
      </div>
    ),
  },
  {
    title: 'Watch the Matching Process',
    icon: Eye,
    content: (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">When you start matching:</p>
        <ol className="text-sm space-y-2 list-decimal list-inside">
          <li>Query terms are parsed and matched to concepts</li>
          <li>DFS traverses the ontology to find related concepts</li>
          <li>Experts with matching skills light up</li>
          <li>Final rankings appear in the right panel</li>
        </ol>
      </div>
    ),
  },
  {
    title: 'Explore the Features',
    icon: Award,
    content: (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground mb-2">Check out:</p>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded bg-blue-50 border border-blue-200">
            <p className="text-xs font-medium">Concept Details</p>
            <p className="text-xs text-muted-foreground">Click nodes</p>
          </div>
          <div className="p-2 rounded bg-green-50 border border-green-200">
            <p className="text-xs font-medium">Query Explanation</p>
            <p className="text-xs text-muted-foreground">Left panel</p>
          </div>
          <div className="p-2 rounded bg-purple-50 border border-purple-200">
            <p className="text-xs font-medium">Metrics Dashboard</p>
            <p className="text-xs text-muted-foreground">Bottom panel</p>
          </div>
          <div className="p-2 rounded bg-orange-50 border border-orange-200">
            <p className="text-xs font-medium">Expert Rankings</p>
            <p className="text-xs text-muted-foreground">Right panel</p>
          </div>
        </div>
      </div>
    ),
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
            <Button
              variant="outline"
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
            >
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

/* ==================== MAIN COMPONENT ==================== */

export function ExpertMatchingDemo() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [rootNode, setRootNode] = useState<string>('');
  const [startNode, setStartNode] = useState<string>('');
  const [stack, setStack] = useState<string[]>([]);
  const [visited, setVisited] = useState<string[]>([]);
  const [current, setCurrent] = useState<string | null>(null);
  const [traversedEdges, setTraversedEdges] = useState<Set<string>>(new Set());
  const [speed, setSpeed] = useState(800);
  const [running, setRunning] = useState(false);
  const [showExplanation, setShowExplanation] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [topK, setTopK] = useState(5);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildStep, setBuildStep] = useState(0);
  const [showDFSOverlay, setShowDFSOverlay] = useState(true);
  const [buildMode, setBuildMode] = useState(false);
  const [builtRoot, setBuiltRoot] = useState<string | null>(null);
  const [builtChildren, setBuiltChildren] = useState<string[]>([]);
  const [currentExample, setCurrentExample] = useState<OntologyExample | null>(null);
  // ===== Ontology Construction Explanation State =====
  const [explanationVisible, setExplanationVisible] = useState(false);
  const [explanationText, setExplanationText] = useState('');
  const [activePseudoLine, setActivePseudoLine] = useState<number | null>(null);


  const canvasRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    loadExample(EXAMPLE_ONTOLOGIES[0]);
  }, []);

  const levelHeight = 100;

  /* ==================== DFS LOGIC ==================== */

  useEffect(() => {
    if (!running || stack.length === 0) {
      if (stack.length === 0 && running) setRunning(false);
      return;
    }

    const timer = setTimeout(() => {
      const node = stack[stack.length - 1];
      setStack(prev => prev.slice(0, -1));
      setCurrent(node);

      if (!visited.includes(node)) {
        setVisited(prev => [...prev, node]);

        const children = edges
          .filter(e => e.from === node)
          .map(e => e.to)
          .filter(c => !stack.includes(c) && !visited.includes(c));

        children.forEach(child => {
          const edgeKey = `${node}-${child}`;
          setTraversedEdges(prev => new Set([...prev, edgeKey]));
        });

        setStack(prev => [...prev, ...children]);

        // Update expert matching
        updateExpertMatching([...visited, node]);
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [stack, running, speed, visited, edges]);

  /* ==================== CONTROL FUNCTIONS ==================== */

  const loadExample = (example: OntologyExample) => {
    setCurrentExample(example);   // ✅ store active ontology

    const { nodes: newNodes, edges: newEdges } = generateGraph(example.data, example.root);
    setNodes(newNodes);
    setEdges(newEdges);
    setRootNode(example.root);
    setStartNode(example.root);

    const newExperts: Expert[] = example.experts.map((exp, i) => ({
      id: `expert_${i}`,
      name: exp.name,
      skills: exp.skills,
      experience: exp.experience,
      publications: exp.publications,
      relevanceScore: 0,
      matchingSkills: [],
    }));

    setExperts(newExperts);
    resetTraversal();
  };


  const loadClassicAI = () => loadExample(EXAMPLE_ONTOLOGIES[0]);
  const loadRandomDomain = () => {
    const randomIdx = Math.floor(Math.random() * (EXAMPLE_ONTOLOGIES.length - 1)) + 1;
    loadExample(EXAMPLE_ONTOLOGIES[randomIdx]);
  };

  const updateExpertMatching = (visitedConcepts: string[]) => {
    setExperts(prev => prev.map(expert => {
      const matchingSkills = expert.skills.filter(skill =>
        visitedConcepts.some(concept =>
          concept.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(concept.toLowerCase())
        )
      );

      const skillScore = matchingSkills.length / Math.max(visitedConcepts.length, 1);
      const expScore = Math.min(expert.experience / 15, 1);
      const pubScore = Math.min(expert.publications / 50, 1);
      const relevanceScore = 0.6 * skillScore + 0.25 * expScore + 0.15 * pubScore;

      return {
        ...expert,
        matchingSkills,
        relevanceScore,
      };
    }));
  };

  const startTraversal = () => {
    if (!startNode) return;
    setVisited([]);
    setCurrent(null);
    setTraversedEdges(new Set());
    setStack([startNode]);
    setRunning(true);

  };

  const resetTraversal = () => {
    setRunning(false);
    setStack([]);
    setVisited([]);
    setCurrent(null);
    setTraversedEdges(new Set());
    setExperts(prev => prev.map(e => ({ ...e, relevanceScore: 0, matchingSkills: [] })));
  };

  const buildOntology = async () => {
    if (isBuilding) return;

    setIsBuilding(true);
    setBuildStep(1);

    // Step 1 – Load ontology structure
    await new Promise(res => setTimeout(res, 700));
    setBuildStep(2);

    // Step 2 – Establish relationships
    await new Promise(res => setTimeout(res, 700));
    setBuildStep(3);

    // Step 3 – Link experts
    await new Promise(res => setTimeout(res, 700));
    setBuildStep(4);

    // Step 4 – Initialize metrics
    await new Promise(res => setTimeout(res, 700));

    setIsBuilding(false);
    setBuildStep(0);
  };


  /* ==================== DERIVED DATA ==================== */

  const rankedExperts = [...experts]
    .filter(e => e.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore);



  const totalNodes = nodes.length;
  const visitedCount = visited.length;
  const coverage = totalNodes > 0 ? (visitedCount / totalNodes) * 100 : 0;
  const maxY = nodes.length > 0
    ? Math.max(...nodes.map(n => n.y))
    : 400;

  const PSEUDOCODE = [
    "1. createRootConcept()",
    "2. for each child concept:",
    "3.    createNode(child)",
    "4.    createRelationship(parent, child)",
    "5. linkExpertsToSkills()",
    "6. initializeRankingMetrics()"
  ];

  const triggerConstructionFeedback = (text: string, lineIndex?: number) => {
    setExplanationText(text);
    if (lineIndex !== undefined) setActivePseudoLine(lineIndex);
    setExplanationVisible(true);
  };
  /* ==================== RENDER ==================== */

  return (
    <div className="space-y-4">
      {/* ===== Global Top Toolbar ===== */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">
          Interactive Expert Matching Demo
        </h2>

        <div className="flex items-center gap-3">

          <Button
            className="gap-2 gradient-primary shadow-lg text-white hover:opacity-90 transition-all hover:scale-105"
            onClick={() => {
              resetTraversal();
              setNodes([]);
              setEdges([]);
              setBuildMode(true);
              setBuildStep(1);
            }}
          >
            <Play className="h-4 w-4" />
            Build Ontology
          </Button>



          {/* Show Tutorial */}
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setShowTutorial(true)}
          >
            <HelpCircle className="h-4 w-4" />
            Show Tutorial
          </Button>

          {/* Zoom In */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setScale(s => Math.min(s + 0.1, 2))}
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* Zoom Out */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setScale(s => Math.max(s - 0.1, 0.5))}
          >
            <Search className="h-4 w-4 rotate-180" />
          </Button>

          {/* Reset View */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setOffset({ x: 0, y: 0 });
              setScale(1);
            }}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>

        </div>
      </div>


      {showTutorial && <TutorialOverlay onClose={() => setShowTutorial(false)} />}

      <div className="grid grid-cols-12 gap-4">
        {/* LEFT COLUMN - Controls */}
        <div className="col-span-3 space-y-4">
          <Card className="border shadow-sm">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Info className="h-4 w-4" />
                Control Panel
              </div>

              {/* Load Examples */}
              <div>
                <Label className="text-xs text-muted-foreground">Load Example</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={loadClassicAI}
                    disabled={running}
                  >
                    Classic AI
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-700"
                    onClick={loadRandomDomain}
                    disabled={running}
                  >
                    Random
                  </Button>
                </div>
              </div>



              {/* Start Node Selector */}
              <div>
                <Label className="text-xs text-muted-foreground">Start From Concept</Label>
                <Select value={startNode} onValueChange={setStartNode} disabled={running}>
                  <SelectTrigger className="text-sm mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {nodes.map(n => (
                      <SelectItem key={n.id} value={n.id}>{n.id}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Top-K */}
              <div>
                <Label className="text-xs text-muted-foreground">Top-K Experts</Label>
                <Select value={topK.toString()} onValueChange={v => setTopK(parseInt(v))} disabled={running}>
                  <SelectTrigger className="text-sm mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">Top 3</SelectItem>
                    <SelectItem value="5">Top 5</SelectItem>
                    <SelectItem value="10">Top 10</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Speed */}
              <div>
                <div className="flex justify-between items-center">
                  <Label className="text-xs text-muted-foreground">Speed</Label>
                  <span className="text-xs font-medium">{speed}ms</span>
                </div>
                <Slider
                  value={[speed]}
                  onValueChange={([v]) => setSpeed(v)}
                  min={300}
                  max={1500}
                  step={100}
                  className="mt-1"
                />
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={startTraversal} disabled={running} className="col-span-2">
                  <Play className="h-4 w-4 mr-2" />
                  Start
                </Button>
                <Button onClick={resetTraversal} variant="outline" className="col-span-2">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* CENTER COLUMN - Canvas */}
        {/* CENTER COLUMN - Canvas */}
        <div className="lg:col-span-6">
          <Card className="h-full">
            <CardHeader className="py-3 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">
                  Ontology Graph
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  Click nodes for details
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="relative w-full h-[500px] sm:h-[600px] border-t bg-gradient-to-b from-slate-50 to-white overflow-hidden">

                {/* ================= BUILD MODE CONTROLS ================= */}
                {buildMode && currentExample && (
                  <div className="p-4 border-b bg-slate-50 space-y-4">
                    <h3 className="font-semibold text-sm">
                      Build Mode — Step {buildStep} of 2
                    </h3>

                    {/* STEP 1 — Create Root */}
                    {buildStep === 1 && (
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">
                          Create the root concept of the ontology.
                        </p>

                        <Button
                          size="sm"
                          onClick={() => {
                            const rootNodeObj: Node = {
                              id: currentExample.root,
                              x: 450,
                              y: 80,
                            };

                            setNodes([rootNodeObj]);
                            setEdges([]);
                            setBuiltRoot(currentExample.root);
                            setBuiltChildren([]);
                            setBuildStep(2);

                            setActivePseudoLine(0);
                            setExplanationText(
                              `Created root concept "${currentExample.root}".`
                            );
                            setExplanationVisible(true);
                          }}
                        >
                          {currentExample.root}
                        </Button>
                      </div>
                    )}

                    {/* STEP 2 — Add Children */}
                    {buildStep === 2 && builtRoot && (
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">
                          Add child concepts to "{builtRoot}"
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {currentExample.data[builtRoot]?.children?.map((child, i) => (
                            <Button
                              key={child}
                              size="sm"
                              variant={
                                builtChildren.includes(child)
                                  ? 'default'
                                  : 'outline'
                              }
                              onClick={() => {
                                if (builtChildren.includes(child)) return;

                                const newNode: Node = {
                                  id: child,
                                  x: 300 + i * 200,
                                  y: 250,
                                };

                                setNodes(prev => [...prev, newNode]);
                                setEdges(prev => [
                                  ...prev,
                                  { from: builtRoot, to: child },
                                ]);

                                setBuiltChildren(prev => [...prev, child]);

                                setActivePseudoLine(3);
                                setExplanationText(
                                  `Created relationship: ${builtRoot} → ${child}`
                                );
                                setExplanationVisible(true);
                              }}
                            >
                              {child}
                            </Button>
                          ))}
                        </div>

                        {builtChildren.length > 0 && (
                          <Button
                            size="sm"
                            onClick={() => setBuildMode(false)}
                          >
                            Finish
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* ================= SVG GRAPH ================= */}
                <svg
                  ref={canvasRef}
                  width="100%"
                  height="100%"
                  viewBox="0 0 1000 650"
                  onMouseDown={(e) => {
                    if (e.target === e.currentTarget) {
                      setIsPanning(true);
                      panStart.current = {
                        x: e.clientX - offset.x,
                        y: e.clientY - offset.y,
                      };
                    }
                  }}
                  onMouseMove={(e) => {
                    if (!isPanning) return;
                    setOffset({
                      x: e.clientX - panStart.current.x,
                      y: e.clientY - panStart.current.y,
                    });
                  }}
                  onMouseUp={() => setIsPanning(false)}
                  onMouseLeave={() => setIsPanning(false)}
                  style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
                >
                  <g transform={`translate(${offset.x}, ${offset.y}) scale(${scale})`}>

                    <ExpertMatchingCanvas
                      ontologyNodes={[
                        ...nodes.map(n => ({
                          id: n.id,
                          label: n.id,
                          x: n.x,
                          y: n.y,
                          type: 'concept' as const,
                        })),
                        ...experts.map((expert, index) => ({
                          id: expert.id,
                          label: expert.name,
                          x: 150 + index * 220,
                          y: maxY + 120,
                          type: 'expert' as const,
                        }))
                      ]}
                      ontologyEdges={[
                        ...edges.map(e => ({
                          from: e.from,
                          to: e.to,
                          type: 'parent-child' as const,
                        })),
                        ...experts.flatMap(expert =>
                          expert.skills.map(skill => ({
                            from: skill,
                            to: expert.id,
                            type: 'hasExpert' as const,
                          }))
                        )
                      ]}
                      getNodeState={(id: string) => {
                        if (id === current) return 'current';
                        if (visited.includes(id)) return 'visited';
                        if (startNode === id) return 'query';
                        return 'unvisited';
                      }}
                      getEdgeState={(fromId: string, toId: string) => {
                        const key = `${fromId}-${toId}`;
                        return traversedEdges.has(key)
                          ? 'traversed'
                          : 'unvisited';
                      }}
                      onNodeClick={(nodeId) =>
                        setSelectedNodeId(prev =>
                          prev === nodeId ? null : nodeId
                        )
                      }
                    />

                  </g>
                </svg>

                {/* ================= BOTTOM POPUP ================= */}
                {explanationVisible && (
                  <div className="absolute bottom-0 left-0 right-0 bg-white border-t shadow-xl p-4 z-20">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

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
                        <p className="text-sm text-muted-foreground leading-relaxed">
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




        {/* RIGHT COLUMN - Info */}
        <div className="col-span-3 space-y-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Current Node</p>
                <p className="font-semibold text-lg">{current || 'Not started'}</p>
              </div>

              <StackVisualizer stack={stack} />

              <div>
                <p className="text-sm text-muted-foreground mb-2">Visited Order</p>
                <ScrollArea className="h-24">
                  <ol className="list-decimal list-inside text-sm space-y-1">
                    {visited.map((v, i) => (
                      <li key={v} className={i === visited.length - 1 ? 'font-medium' : ''}>
                        {v}
                      </li>
                    ))}
                  </ol>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm">
                DFS Algorithm — Step by Step
              </CardTitle>
            </CardHeader>

            <CardContent className="p-4 grid grid-cols-1 gap-4">

              {/* Pseudocode */}
              <div className="font-mono text-xs space-y-2">
                {[
                  "1. push(startNode)",
                  "2. while stack not empty:",
                  "3.   pop node",
                  "4.   if not visited:",
                  "5.      mark visited",
                  "6.      push children"
                ].map((line, i) => {
                  const active =
                    (running && stack.length > 0 && i === 2) ||
                    (visited.length > 0 && i === 5);

                  return (
                    <div
                      key={i}
                      className={`px-2 py-1 rounded ${active
                          ? "bg-yellow-200 text-black"
                          : "text-muted-foreground"
                        }`}
                    >
                      {line}
                    </div>
                  );
                })}
              </div>

              {/* Explanation */}
              <div className="text-sm text-muted-foreground">
                {current ? (
                  <div>
                    <p className="font-medium text-black mb-2">
                      Currently Processing:
                    </p>
                    <p>
                      We popped <strong>{current}</strong> from the stack.
                    </p>
                    <p className="mt-2">
                      Its children are added to the stack (LIFO order).
                    </p>
                  </div>
                ) : (
                  <p>Start traversal to see step-by-step explanation.</p>
                )}
              </div>

            </CardContent>
          </Card>


        </div>
      </div>

      {/* FULL-WIDTH EXPLANATION ROW */}
      {showExplanation && (
        <div className="col-span-12 mt-10">

          <Card className="mt-2">
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm flex items-center gap-2 mb-2">
                <Info className="h-4 w-4" />
                Why were these visited?
              </h3>

              <ScrollArea className="h-[220px] bg-slate-50 rounded p-4 border text-sm">
                <TraversalExplanation
                  startNode={startNode}
                  visited={visited}
                  traversedEdges={traversedEdges}
                  experts={experts}
                />
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Metrics Dashboard */}
      <Card>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Metrics Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="py-3 px-4">
          <div className="grid grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-blue-50">
              <div className="flex items-center gap-2 mb-1">
                <Layers className="h-4 w-4 text-blue-600" />
                <span className="text-xs text-muted-foreground">Total Nodes</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{totalNodes}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <div className="flex items-center gap-2 mb-1">
                <Network className="h-4 w-4 text-green-600" />
                <span className="text-xs text-muted-foreground">Edges</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{edges.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-50">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <span className="text-xs text-muted-foreground">Visited</span>
              </div>
              <p className="text-2xl font-bold text-purple-600">{visitedCount}</p>
            </div>
            <div className="p-3 rounded-lg bg-orange-50">
              <div className="flex items-center gap-2 mb-1">
                <Target className="h-4 w-4 text-orange-600" />
                <span className="text-xs text-muted-foreground">Coverage</span>
              </div>
              <p className="text-2xl font-bold text-orange-600">{coverage.toFixed(0)}%</p>
            </div>
          </div>

          <div className="mt-3">
            <Progress value={coverage} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <Timer className="h-3 w-3" />
              Complexity: O(V + E) where V = {totalNodes}, E = {edges.length}
            </p>
          </div>
        </CardContent>
      </Card>


    </div>

  );
}