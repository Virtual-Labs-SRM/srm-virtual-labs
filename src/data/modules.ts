import { Module } from '@/types/lab';

export const MODULES: Module[] = [
  {
    id: 'lab-1',
    number: 1,
    title: 'Search Strategy Algorithms',
    description: 'Implement search strategy algorithms (DFS & BFS) to reach a goal state in graph traversal problems.',
    icon: 'Search',
    color: 'primary',
    subModules: [
      {
        id: 'dfs',
        title: 'Depth First Search (DFS)',
        description: 'Explore graph traversal using stack-based depth-first approach',
        icon: 'GitBranch',
        implemented: true,
      },
      {
        id: 'bfs',
        title: 'Breadth First Search (BFS)',
        description: 'Explore graph traversal using queue-based breadth-first approach',
        icon: 'Layers',
        implemented: true,
      },
    ],
  },
  {
    id: 'lab-2',
    number: 2,
    title: 'Hill Climbing Algorithm',
    description: 'Use Hill Climbing algorithm for solving real-world optimization problems.',
    icon: 'Mountain',
    color: 'secondary',
    subModules: [
      {
        id: 'hill-climbing',
        title: 'Hill Climbing Optimization',
        description: 'Iterative improvement algorithm for finding local optima',
        icon: 'TrendingUp',
        implemented: true,
      },
    ],
  },
  {
    id: 'lab-3',
    number: 3,
    title: 'A* Search Algorithm',
    description: 'Implement informed A* search method for optimal pathfinding.',
    icon: 'Star',
    color: 'primary',
    subModules: [
      {
        id: 'astar',
        title: 'A* Search Method',
        description: 'Heuristic-based optimal pathfinding algorithm',
        icon: 'Navigation',
        implemented: true,
      },
    ],
  },
  {
    id: 'lab-4',
    number: 4,
    title: 'Fuzzy Set for Shape Matching',
    description: 'Design a fuzzy set for shape matching of handwritten characters.',
    icon: 'Shapes',
    color: 'secondary',
    subModules: [
      {
        id: 'fuzzy-shape-matching',
        title: 'Fuzzy Shape Matching',
        description: 'Apply fuzzy logic to match handwritten character shapes',
        icon: 'PenTool',
        implemented: true,
      },
    ],
  },
  {
    id: 'lab-5',
    number: 5,
    title: 'Voice and Text Chat Application',
    description: 'Implement voice and text chat applications using popular frameworks.',
    icon: 'MessageCircle',
    color: 'primary',
    subModules: [
      {
        id: 'chat-application',
        title: 'Chat Application',
        description: 'Build voice and text communication system',
        icon: 'MessagesSquare',
        implemented: true,
      },
    ],
  },
  {
    id: 'lab-6',
    number: 6,
    title: 'House Price Prediction',
    description: 'Implement an AI system to predict house prices in different areas.',
    icon: 'Home',
    color: 'secondary',
    subModules: [
      {
        id: 'price-prediction',
        title: 'House Price Predictor',
        description: 'ML-based real estate price prediction system',
        icon: 'TrendingUp',
        implemented: true,
      },
    ],
  },
  {
    id: 'lab-7',
    number: 7,
    title: 'Plagiarism Detector',
    description: 'Develop a plagiarism detector to identify text similarity and calculate plagiarism percentage.',
    icon: 'FileSearch',
    color: 'primary',
    subModules: [
      {
        id: 'plagiarism-detection',
        title: 'Plagiarism Detection System',
        description: 'Text similarity analysis and plagiarism percentage calculation',
        icon: 'ScanText',
        implemented: true,
      },
    ],
  },
  {
    id: 'lab-8',
    number: 8,
    title: 'CV-Based Personality Prediction',
    description: 'Implement a CV analysis-based personality prediction system using AI.',
    icon: 'UserSearch',
    color: 'secondary',
    subModules: [
      {
        id: 'personality-prediction',
        title: 'Personality Prediction',
        description: 'Analyze CVs to predict personality traits using AI',
        icon: 'Brain',
        implemented: true,
      },
    ],
  },
  {
    id: 'lab-9',
    number: 9,
    title: 'Heart Disease Prediction',
    description: 'Predict heart disease using AI-based application.',
    icon: 'Heart',
    color: 'primary',
    subModules: [
      {
        id: 'heart-disease',
        title: 'Heart Disease Predictor',
        description: 'AI-based medical diagnosis prediction system',
        icon: 'HeartPulse',
        implemented: true,
      },
    ],
  },
  {
    id: 'lab-10',
    number: 10,
    title: 'Domain Expert Matching',
    description: 'Develop an ontology-based method for domain expert matching.',
    icon: 'Network',
    color: 'secondary',
    subModules: [
      {
        id: 'expert-matching',
        title: 'Expert Matching System',
        description: 'Ontology-based domain expert discovery and matching',
        icon: 'Users',
        implemented: true,
      },
    ],
  },
  {
    id: 'lab-11',
    number: 11,
    title: 'Software Testing Ontology',
    description: 'Implement a software testing ontology for AI-based systems.',
    icon: 'Bug',
    color: 'primary',
    subModules: [
      {
        id: 'testing-ontology',
        title: 'Testing Ontology System',
        description: 'Ontology-driven software testing framework',
        icon: 'TestTube',
        implemented: true,
      },
    ],
  },
  {
    id: 'lab-12',
    number: 12,
    title: 'Fuzzy College Selection System',
    description: 'Develop a web-based, game-oriented college selection system using fuzzy rule trees.',
    icon: 'GraduationCap',
    color: 'secondary',
    subModules: [
      {
        id: 'college-selection',
        title: 'College Selection System',
        description: 'Fuzzy rule-based college recommendation game',
        icon: 'School',
        implemented: true,
      },
    ],
  },
];

export function getModuleById(moduleId: string): Module | undefined {
  return MODULES.find(m => m.id === moduleId);
}

export function getSubModuleById(moduleId: string, subModuleId: string): { module: Module; subModule: Module['subModules'][0] } | undefined {
  const module = getModuleById(moduleId);
  if (!module) return undefined;
  const subModule = module.subModules.find(sm => sm.id === subModuleId);
  if (!subModule) return undefined;
  return { module, subModule };
}
