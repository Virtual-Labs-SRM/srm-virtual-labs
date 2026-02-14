import { useState, useCallback } from 'react';
import { ExperimentLayout } from '@/components/layout/ExperimentLayout';
import { SectionCard, TheoryBlock, TermCard, HighlightItem } from '@/components/lab/SectionCard';
import { CodeBlock } from '@/components/lab/CodeBlock';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGraph } from '@/hooks/useGraph';
import { useEnhancedAStar } from '@/hooks/useEnhancedAStar';
import { EnhancedAStarCanvas } from '@/components/astar/EnhancedAStarCanvas';
import { AStarHistoryPanel } from '@/components/astar/AStarHistoryPanel';
import { AStarHeuristicsTable } from '@/components/astar/AStarHeuristicsTable';
import { GraphControls } from '@/components/dfs/GraphControls';
import { Play, Settings, StepForward, StepBack, RotateCcw, Table, Pause } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { EditMode } from '@/components/dfs/GraphCanvas';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

const ASTAR_CODE = `import heapq

def astar(graph, start, goal, h):
    """
    A* Search Algorithm implementation.
    
    Args:
        graph: Dict of {node: [(neighbor, cost), ...]}
        start: Starting node
        goal: Goal node
        h: Heuristic function h(node) -> estimated cost to goal
    
    Returns:
        Path from start to goal, or None if not found
    """
    # Priority queue: (f_score, node)
    open_set = [(h(start), start)]
    came_from = {}
    
    # g_score: cost from start to current node
    g_score = {start: 0}
    
    # f_score: g_score + heuristic
    f_score = {start: h(start)}
    
    open_set_hash = {start}  # For O(1) membership check
    closed_set = set()
    
    while open_set:
        # Get node with lowest f_score
        current_f, current = heapq.heappop(open_set)
        open_set_hash.remove(current)
        
        # Add to closed set
        closed_set.add(current)
        
        print(f"Step: Expanding {current}")
        print(f"  g({current}) = {g_score[current]:.1f}")
        print(f"  h({current}) = {h(current):.1f}")
        print(f"  f({current}) = {current_f:.1f}")
        
        # Goal reached - reconstruct path
        if current == goal:
            path = []
            while current in came_from:
                path.append(current)
                current = came_from[current]
            path.append(start)
            return path[::-1]
        
        # Explore neighbors
        for neighbor, cost in graph[current]:
            if neighbor in closed_set:
                continue
                
            tentative_g = g_score[current] + cost
            
            if neighbor not in g_score or tentative_g < g_score[neighbor]:
                # Better path found
                came_from[neighbor] = current
                g_score[neighbor] = tentative_g
                f_score[neighbor] = tentative_g + h(neighbor)
                
                if neighbor not in open_set_hash:
                    heapq.heappush(open_set, (f_score[neighbor], neighbor))
                    open_set_hash.add(neighbor)
        
        print(f"  Open Set: {sorted(open_set_hash)}")
        print(f"  Closed Set: {sorted(closed_set)}")
    
    return None  # No path found


if __name__ == "__main__":
    # Simple graph example
    graph = {
        'A': [('B', 1), ('C', 4)],
        'B': [('D', 2), ('E', 5)],
        'C': [('E', 1)],
        'D': [('F', 3)],
        'E': [('F', 1)],
        'F': []
    }
    
    # Heuristic values (pre-computed for example)
    h_values = {'A': 6, 'B': 4, 'C': 3, 'D': 2, 'E': 1, 'F': 0}
    
    path = astar(graph, 'A', 'F', lambda n: h_values[n])
    print("\\nOptimal Path:", path)`;

const ALGORITHM_PSEUDOCODE = `A*(Graph G, Node start, Node goal, Heuristic h):
    1. Initialize:
       open_set ← {start}
       closed_set ← {}
       g[start] ← 0
       f[start] ← h(start)
       parent[start] ← null
       
    2. WHILE open_set is not empty:
       a. current ← node in open_set with MINIMUM f value
       b. IF current = goal:
          Reconstruct path using parent pointers
          RETURN path
       c. Remove current from open_set
       d. Add current to closed_set
       e. FOR each neighbor of current:
          - IF neighbor in closed_set: SKIP
          - tentative_g ← g[current] + edge_cost(current, neighbor)
          - IF neighbor not in open_set OR tentative_g < g[neighbor]:
            • parent[neighbor] ← current
            • g[neighbor] ← tentative_g
            • f[neighbor] ← g[neighbor] + h(neighbor)
            • Add neighbor to open_set if not present
            
    3. RETURN failure (no path exists)`;

export function AStarLab() {
  const [activeSection, setActiveSection] = useState('aim');
  const [startNode, setStartNode] = useState<string | null>('A');
  const [goalNode, setGoalNode] = useState<string | null>('I');
  const [speed, setSpeed] = useState(1);
  const [editMode, setEditMode] = useState<EditMode>('none');
  const [edgeStartNode, setEdgeStartNode] = useState<string | null>(null);
  const [nodeCount, setNodeCount] = useState(8);
  const [sidebarTab, setSidebarTab] = useState('history');

  const {
    graph,
    addNode,
    updateNodePosition,
    addEdge,
    removeNode,
    clearGraph,
    resetToDefault,
    generateRandomGraph,
  } = useGraph();

  const {
    astarState,
    runAStar,
    reset,
    pause,
    resume,
    stepForward,
    stepBackward,
    getHeuristicsTable
  } = useEnhancedAStar(graph, speed);

  const heuristicsTable = getHeuristicsTable(goalNode);
  const isAnimating = astarState.isRunning;

  const handleStart = () => {
    if (startNode && goalNode && startNode !== goalNode) {
      if (!graph.nodes.find(n => n.id === startNode) || !graph.nodes.find(n => n.id === goalNode)) {
        toast({ title: "Invalid nodes", variant: "destructive" });
        return;
      }
      runAStar(startNode, goalNode);
    } else {
      toast({ title: "Select different start and goal nodes", variant: "destructive" });
    }
  };

  const handleStepForward = () => {
    if (startNode && goalNode) {
      stepForward(startNode, goalNode);
    }
  };

  const handleNodeClick = (nodeId: string) => {
    if (!astarState.isRunning) setStartNode(nodeId);
  };

  const handleCanvasClick = useCallback((x: number, y: number) => {
    if (editMode === 'addNode') {
      addNode(x, y);
    }
  }, [editMode, addNode]);

  const handleNodeDrag = useCallback((nodeId: string, x: number, y: number) => {
    updateNodePosition(nodeId, x, y);
  }, [updateNodePosition]);

  const handleEdgeNodeSelect = useCallback((nodeId: string) => {
    if (edgeStartNode === null) {
      setEdgeStartNode(nodeId);
    } else if (edgeStartNode !== nodeId) {
      addEdge(edgeStartNode, nodeId);
      setEdgeStartNode(null);
    } else {
      setEdgeStartNode(null);
    }
  }, [edgeStartNode, addEdge]);

  const handleNodeDelete = useCallback((nodeId: string) => {
    removeNode(nodeId);
    if (startNode === nodeId) setStartNode(graph.nodes.find(n => n.id !== nodeId)?.id || null);
    if (goalNode === nodeId) setGoalNode(null);
  }, [removeNode, startNode, goalNode, graph.nodes]);

  const handleReset = () => {
    reset();
    setEdgeStartNode(null);
  };

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
      title="A* Search Algorithm"
      subtitle="Find Optimal Paths using Heuristic-Guided Search"
      icon="Star"
      duration="~45 minutes"
      difficulty="Intermediate"
      tags={['Graph', 'Pathfinding', 'Heuristic', 'Optimal']}
      activeSection={activeSection}
      onSectionChange={handleSectionChange}
    >
      {/* AIM SECTION */}
      <SectionCard id="aim" title="Aim" icon="Target">
        <p className="text-lg leading-relaxed mb-6">
          To understand and implement <strong className="text-primary">A* Search Algorithm</strong> for
          finding optimal paths in weighted graphs using heuristic guidance.
        </p>
        <div className="grid sm:grid-cols-3 gap-4">
          <HighlightItem icon="🎯" text="Find optimal paths" />
          <HighlightItem icon="🧮" text="Understand f = g + h" />
          <HighlightItem icon="📊" text="Track Open/Closed sets" />
        </div>
      </SectionCard>

      {/* THEORY SECTION */}
      <SectionCard id="theory" title="Theory" icon="BookOpen">
        <TheoryBlock title="What is A* Search?">
          <p className="mb-4">
            <strong>A* (A-star)</strong> is an informed search algorithm that finds the
            shortest path between a start node and a goal node. It combines the benefits
            of Dijkstra's algorithm (guaranteed optimal) with greedy best-first search
            (fast with heuristics).
          </p>
        </TheoryBlock>

        <TheoryBlock title="The f = g + h Formula">
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="bg-primary/5">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-mono font-bold text-primary mb-2">g(n)</p>
                <p className="text-sm text-muted-foreground">Actual cost from start to n</p>
                <p className="text-xs text-muted-foreground mt-2">Sum of edge weights traversed</p>
              </CardContent>
            </Card>
            <Card className="bg-secondary/10">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-mono font-bold text-secondary-foreground mb-2">h(n)</p>
                <p className="text-sm text-muted-foreground">Heuristic estimate to goal</p>
                <p className="text-xs text-muted-foreground mt-2">Must be admissible (never overestimate)</p>
              </CardContent>
            </Card>
            <Card className="bg-primary/10">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-mono font-bold text-primary mb-2">f(n)</p>
                <p className="text-sm text-muted-foreground">Total estimated cost</p>
                <p className="text-xs text-muted-foreground mt-2">Used to prioritize node expansion</p>
              </CardContent>
            </Card>
          </div>
        </TheoryBlock>

        <TheoryBlock title="Open and Closed Sets">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-primary/5">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2 text-primary">Open Set (Frontier)</h4>
                <p className="text-sm text-muted-foreground">
                  Nodes discovered but not yet expanded. The node with lowest f(n)
                  is selected next for expansion.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-secondary/10">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Closed Set (Explored)</h4>
                <p className="text-sm text-muted-foreground">
                  Nodes already expanded. These nodes won't be revisited, ensuring
                  efficiency and preventing cycles.
                </p>
              </CardContent>
            </Card>
          </div>
        </TheoryBlock>

        <TheoryBlock title="Admissible Heuristics">
          <p className="mb-4">
            A heuristic is <strong>admissible</strong> if it never overestimates the true cost
            to the goal. Common examples:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li><strong>Manhattan Distance:</strong> |x₁ - x₂| + |y₁ - y₂| (for grid-based movement)</li>
            <li><strong>Euclidean Distance:</strong> √((x₁-x₂)² + (y₁-y₂)²) (for any-angle movement)</li>
            <li><strong>Chebyshev Distance:</strong> max(|x₁-x₂|, |y₁-y₂|) (for 8-directional movement)</li>
          </ul>
        </TheoryBlock>

        <TheoryBlock title="Key Terminology">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <TermCard term="g(n)" definition="Actual cost from start to n" />
            <TermCard term="h(n)" definition="Heuristic estimate to goal" />
            <TermCard term="f(n)" definition="Total estimated cost g+h" />
            <TermCard term="Admissible" definition="Never overestimates cost" />
          </div>
        </TheoryBlock>
      </SectionCard>

      {/* ALGORITHM SECTION - Static Display Only */}
      <SectionCard id="algorithm" title="Algorithm" icon="Cog">
        <p className="text-muted-foreground mb-6">
          The A* algorithm uses a priority queue to always expand the most promising node:
        </p>

        <div className="space-y-4 mb-8">
          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">1</div>
              <div className="w-0.5 flex-1 bg-border mt-2" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Initialize</h4>
              <p className="text-muted-foreground">Add the start node to the Open Set. Set initial values: g(start) = 0, f(start) = h(start).</p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">2</div>
              <div className="w-0.5 flex-1 bg-border mt-2" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Selection</h4>
              <p className="text-muted-foreground">Select the node with the lowest f-score from the Open Set. If it is the goal, reconstruct the path.</p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">3</div>
              <div className="w-0.5 flex-1 bg-border mt-2" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Expansion</h4>
              <p className="text-muted-foreground">For each neighbor, calculate the tentative g-score (current/g + distance).</p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">4</div>
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Update</h4>
              <p className="text-muted-foreground">If the new path is better, update the parent pointer, g-score, and f-score. Add to Open Set if not present.</p>
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
          Here's the complete Python implementation with step-by-step logging:
        </p>

        <CodeBlock code={ASTAR_CODE} language="python" title="astar.py" />
      </SectionCard>

      {/* DEMO SECTION - Restructured Layout */}
      <SectionCard id="demo" title="Demo" icon="Play">
        <p className="text-muted-foreground mb-6">
          Visualize A* search step by step. Select start and goal nodes, then watch
          the algorithm find the optimal path.
        </p>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column: Canvas, Playback, Legend, Heuristics */}
          <div className="lg:col-span-2 space-y-6">
            {/* Graph Area with Overlay Controls */}
            <Card className="overflow-hidden relative group border-2">
              <CardContent className="p-4 min-h-[500px] flex items-center justify-center relative bg-muted/5">
                {isAnimating && (
                  <div className="absolute top-4 left-4 px-3 py-1 bg-primary/10 backdrop-blur-md rounded-full text-xs text-primary font-bold z-10 border border-primary/20 animate-pulse">
                    Finding optimal path... Step {astarState.currentStep}
                  </div>
                )}
                <EnhancedAStarCanvas
                  graph={graph}
                  astarState={astarState}
                  startNode={startNode}
                  goalNode={goalNode}
                  onNodeClick={handleNodeClick}
                  editMode={editMode}
                  edgeStartNode={edgeStartNode}
                  onCanvasClick={handleCanvasClick}
                  onNodeDrag={handleNodeDrag}
                  onEdgeNodeSelect={handleEdgeNodeSelect}
                  onNodeDelete={handleNodeDelete}
                  disabled={isAnimating}
                />

                {/* Floating Playback Controls Overlay */}
                <div className="absolute bottom-6 right-6 flex items-center gap-2 bg-background/90 backdrop-blur-md p-2 rounded-xl border border-border shadow-2xl z-20 transition-all hover:scale-105 group-hover:border-primary/50">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={stepBackward}
                    disabled={isAnimating || astarState.currentStep <= 0}
                    className="h-9 w-9 p-0 hover:bg-primary/10"
                    title="Step Backward"
                  >
                    <StepBack className="h-4 w-4" />
                  </Button>

                  {!astarState.isRunning ? (
                    <Button
                      size="sm"
                      onClick={astarState.openSet.length > 0 ? resume : handleStart}
                      disabled={(!startNode || !goalNode || startNode === goalNode) && astarState.openSet.length === 0}
                      className="gap-2 h-9 px-4 gradient-primary shadow-lg"
                    >
                      <Play className="h-4 w-4" />
                      <span>{astarState.openSet.length > 0 ? 'Resume' : 'Start'}</span>
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
                    onClick={handleStepForward}
                    disabled={isAnimating || astarState.isComplete}
                    className="h-9 w-9 p-0 hover:bg-primary/10"
                    title="Step Forward"
                  >
                    <StepForward className="h-4 w-4" />
                  </Button>

                  <div className="w-px h-6 bg-border mx-1" />

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleReset}
                    className="h-9 w-9 p-0 hover:bg-destructive/10 hover:text-destructive"
                    title="Reset"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Configuration Panel (Start/Goal/Speed) */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Start Node</label>
                      <Select value={startNode || ''} onValueChange={setStartNode} disabled={isAnimating}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Start" />
                        </SelectTrigger>
                        <SelectContent>
                          {graph.nodes.map((node) => (
                            <SelectItem key={node.id} value={node.id} disabled={node.id === goalNode}>
                              Node {node.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Goal Node</label>
                      <Select value={goalNode || ''} onValueChange={setGoalNode} disabled={isAnimating}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Goal" />
                        </SelectTrigger>
                        <SelectContent>
                          {graph.nodes.map((node) => (
                            <SelectItem key={node.id} value={node.id} disabled={node.id === startNode}>
                              Node {node.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border/50">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-medium text-muted-foreground">Simulation Speed</label>
                      <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">{speed.toFixed(1)}x</span>
                    </div>
                    <Slider
                      value={[speed]}
                      onValueChange={([value]) => setSpeed(value)}
                      min={0.5}
                      max={3}
                      step={0.5}
                      className="py-1"
                      disabled={isAnimating}
                    />
                  </div>

                </div>
              </CardContent>
            </Card>

            {/* A* Legend */}
            <div className="flex flex-wrap items-center gap-4 p-3 bg-card/50 rounded-lg border border-border">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-primary" />
                <span className="text-xs text-muted-foreground">Start</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-destructive" />
                <span className="text-xs text-muted-foreground">Goal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-primary/30 border-2 border-primary" />
                <span className="text-xs text-muted-foreground">Open Set</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-secondary" />
                <span className="text-xs text-muted-foreground">Closed Set</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-1 bg-primary" />
                <span className="text-xs text-muted-foreground">Optimal Path</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">12</div>
                <span className="text-xs text-muted-foreground">Edge Weight</span>
              </div>
            </div>


          </div>

          {/* Right Column: Heuristics & Tabs */}
          <div className="space-y-6">
            {/* Heuristics Table (Moved to Top) */}
            <AStarHeuristicsTable
              heuristics={heuristicsTable}
              goalNode={goalNode}
              currentNode={astarState.currentNode}
            />

            <Tabs value={sidebarTab} onValueChange={setSidebarTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="history" className="gap-1 text-xs">
                  <Table className="h-3 w-3" />
                  Steps
                </TabsTrigger>
                <TabsTrigger value="graph" className="gap-1 text-xs">
                  <Settings className="h-3 w-3" />
                  Graph
                </TabsTrigger>
              </TabsList>

              <TabsContent value="history" className="mt-4">
                <AStarHistoryPanel astarState={astarState} />
              </TabsContent>

              <TabsContent value="graph" className="mt-4">
                <Card>
                  <CardContent className="p-4">
                    <GraphControls
                      editMode={editMode}
                      nodeCount={nodeCount}
                      disabled={isAnimating}
                      onEditModeChange={setEditMode}
                      onNodeCountChange={setNodeCount}
                      onGenerateRandom={() => { reset(); generateRandomGraph(nodeCount); setStartNode(null); setGoalNode(null); }}
                      onClearGraph={() => { reset(); clearGraph(); setStartNode(null); setGoalNode(null); }}
                      onResetDefault={() => { reset(); resetToDefault(); setStartNode('A'); setGoalNode('I'); }}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </SectionCard>

      {/* PRACTICE SECTION */}
      <SectionCard id="practice" title="Practice" icon="Pencil">
        <p className="text-muted-foreground mb-6">
          Test your understanding of A* with these exercises:
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-secondary text-secondary-foreground">Exercise 1</Badge>
                <Badge variant="outline">Beginner</Badge>
              </div>
              <h4 className="font-semibold mb-2">Trace the Algorithm</h4>
              <p className="text-sm text-muted-foreground">
                Use the step-by-step feature to trace A* from node A to I. Record the
                Open and Closed sets at each step. Calculate f(n) for each expanded node.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-secondary text-secondary-foreground">Exercise 2</Badge>
                <Badge variant="outline">Intermediate</Badge>
              </div>
              <h4 className="font-semibold mb-2">Compare Paths</h4>
              <p className="text-sm text-muted-foreground">
                Generate a random graph and find paths between different start/goal pairs.
                Compare the number of nodes expanded and the path lengths.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-warning/20 hover:border-warning/40 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-warning text-warning-foreground">Exercise 3</Badge>
                <Badge variant="outline">Advanced</Badge>
              </div>
              <h4 className="font-semibold mb-2">Heuristic Impact</h4>
              <p className="text-sm text-muted-foreground">
                Observe how the Euclidean heuristic guides the search. If h(n)=0 for all nodes,
                how would A* behave? (Hint: it becomes Dijkstra's algorithm)
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-destructive/20 hover:border-destructive/40 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-destructive text-destructive-foreground">Exercise 4</Badge>
                <Badge variant="outline">Exam Practice</Badge>
              </div>
              <h4 className="font-semibold mb-2">Manual Calculation</h4>
              <p className="text-sm text-muted-foreground">
                Without running the algorithm, calculate the first 3 steps manually for a
                custom graph. Then verify your answer using the demo.
              </p>
            </CardContent>
          </Card>
        </div>
      </SectionCard>
    </ExperimentLayout>
  );
}
