import { useState, useCallback } from 'react';
import { ExperimentLayout } from '@/components/layout/ExperimentLayout';
import { SectionCard, TheoryBlock, TermCard, HighlightItem } from '@/components/lab/SectionCard';
import { CodeBlock } from '@/components/lab/CodeBlock';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGraph } from '@/hooks/useGraph';
import { useDFS } from '@/hooks/useDFS';
import { GraphCanvas, EditMode } from '@/components/dfs/GraphCanvas';
import { TraversalInfo } from '@/components/dfs/TraversalInfo';
import { Legend } from '@/components/dfs/Legend';
import { GraphControls } from '@/components/dfs/GraphControls';
import { Play, Settings, AlertCircle, Pause, StepForward, StepBack, RotateCcw, Table } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

const DFS_CODE = `def dfs(graph, start):
    """
    Depth-First Search implementation using a stack.
    
    Args:
        graph: Dictionary representing adjacency list
        start: Starting node for traversal
    
    Returns:
        List of nodes in DFS traversal order
    """
    visited = set()
    stack = [start]
    traversal_order = []
    
    while stack:
        # Pop the top element from stack
        node = stack.pop()
        
        # Skip if already visited
        if node in visited:
            continue
            
        # Mark as visited and add to result
        visited.add(node)
        traversal_order.append(node)
        
        # Add unvisited neighbors to stack
        # Reverse to maintain left-to-right order
        for neighbor in reversed(graph[node]):
            if neighbor not in visited:
                stack.append(neighbor)
    
    return traversal_order


# Recursive implementation
def dfs_recursive(graph, node, visited=None):
    """
    Recursive DFS implementation.
    """
    if visited is None:
        visited = set()
    
    visited.add(node)
    result = [node]
    
    for neighbor in graph[node]:
        if neighbor not in visited:
            result.extend(dfs_recursive(graph, neighbor, visited))
    
    return result


# Example usage
if __name__ == "__main__":
    # Sample graph as adjacency list
    graph = {
        'A': ['B', 'C'],
        'B': ['D', 'E'],
        'C': ['F', 'G'],
        'D': ['H'],
        'E': ['H'],
        'F': ['I'],
        'G': ['I'],
        'H': [],
        'I': []
    }
    
    print("DFS Traversal:", dfs(graph, 'A'))
    # Output: DFS Traversal: ['A', 'B', 'D', 'H', 'E', 'C', 'F', 'I', 'G']`;

const ALGORITHM_PSEUDOCODE = `DFS(Graph G, Node start):
    1. Create empty set 'visited'
    2. Create stack S and push 'start'
    3. While S is not empty:
        a. node ← S.pop()
        b. If node not in visited:
            i.   Add node to visited
            ii.  Process node
            iii. For each neighbor of node:
                 - If neighbor not in visited:
                   Push neighbor to S
    4. Return visited nodes`;

const RECURSIVE_PSEUDOCODE = `DFS_Recursive(Graph G, Node node, Set visited):
    1. Add node to visited
    2. Process node
    3. For each neighbor of node:
        If neighbor not in visited:
            DFS_Recursive(G, neighbor, visited)`;

export function DFSLab() {
  const [activeSection, setActiveSection] = useState('aim');
  const [selectedNode, setSelectedNode] = useState<string | null>('A');
  const [speed, setSpeed] = useState(1);
  const [editMode, setEditMode] = useState<EditMode>('none');
  const [edgeStartNode, setEdgeStartNode] = useState<string | null>(null);
  const [nodeCount, setNodeCount] = useState(8);

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

  const { dfsState, runDFS, reset, pause, resume, stepOnce, stepBackward } = useDFS(graph, speed);

  const isAnimating = dfsState.isRunning || dfsState.stack.length > 0;

  const handleStart = () => {
    if (selectedNode) {
      if (!graph.nodes.find(n => n.id === selectedNode)) {
        toast({
          title: "Invalid start node",
          description: "Please select a valid node to start DFS",
          variant: "destructive",
        });
        return;
      }
      runDFS(selectedNode);
    }
  };

  const handleStep = () => {
    if (selectedNode) {
      if (!graph.nodes.find(n => n.id === selectedNode) && dfsState.stack.length === 0) {
        toast({
          title: "Invalid start node",
          description: "Please select a valid node to start DFS",
          variant: "destructive",
        });
        return;
      }
      stepOnce(dfsState.stack.length === 0 ? selectedNode : undefined);
    }
  };

  const handleNodeClick = (nodeId: string) => {
    if (!dfsState.isRunning) {
      setSelectedNode(nodeId);
    }
  };

  const handleCanvasClick = useCallback((x: number, y: number) => {
    if (editMode === 'addNode') {
      const newNode = addNode(x, y);
      toast({
        title: "Node added",
        description: `Node ${newNode.label} created`,
      });
    }
  }, [editMode, addNode]);

  const handleNodeDrag = useCallback((nodeId: string, x: number, y: number) => {
    updateNodePosition(nodeId, x, y);
  }, [updateNodePosition]);

  const handleEdgeNodeSelect = useCallback((nodeId: string) => {
    if (edgeStartNode === null) {
      setEdgeStartNode(nodeId);
    } else if (edgeStartNode === nodeId) {
      setEdgeStartNode(null);
    } else {
      const success = addEdge(edgeStartNode, nodeId);
      if (success) {
        toast({ title: "Edge added", description: `Connected ${edgeStartNode} to ${nodeId}` });
      }
      setEdgeStartNode(null);
    }
  }, [edgeStartNode, addEdge]);

  const handleNodeDelete = useCallback((nodeId: string) => {
    removeNode(nodeId);
    if (selectedNode === nodeId) {
      setSelectedNode(graph.nodes.find(n => n.id !== nodeId)?.id || null);
    }
    toast({ title: "Node deleted", description: `Node ${nodeId} removed` });
  }, [removeNode, selectedNode, graph.nodes]);

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

  // Update selected node if it no longer exists
  if (selectedNode && !graph.nodes.find(n => n.id === selectedNode)) {
    setSelectedNode(graph.nodes[0]?.id || null);
  }

  return (
    <ExperimentLayout
      experimentNumber={1}
      title="Depth First Search (DFS)"
      subtitle="Graph Traversal using Stack-Based Exploration"
      icon="GitBranch"
      duration="~30 minutes"
      difficulty="Beginner"
      tags={['Graph', 'Traversal', 'Stack']}
      activeSection={activeSection}
      onSectionChange={handleSectionChange}
    >
      {/* AIM SECTION */}
      <SectionCard id="aim" title="Aim" icon="Target">
        <p className="text-lg leading-relaxed mb-6">
          To understand and implement <strong className="text-primary">Depth-First Search (DFS)</strong> algorithm
          for graph traversal using both iterative and recursive approaches.
        </p>
        <div className="grid sm:grid-cols-3 gap-4">
          <HighlightItem icon="📚" text="Learn stack-based traversal" />
          <HighlightItem icon="🔄" text="Compare iterative vs recursive" />
          <HighlightItem icon="🎯" text="Apply to real problems" />
        </div>
      </SectionCard>

      {/* THEORY SECTION */}
      <SectionCard id="theory" title="Theory" icon="BookOpen">
        <TheoryBlock title="What is Depth-First Search?">
          <p className="mb-4">
            <strong>Depth-First Search (DFS)</strong> is a graph traversal algorithm that explores
            as far as possible along each branch before backtracking. It starts at a source node
            and explores each branch completely before moving to the next branch.
          </p>
          <p>
            The name "depth-first" comes from the fact that the algorithm goes <em>deep</em> into
            the graph structure before exploring siblings of a node.
          </p>
        </TheoryBlock>

        <TheoryBlock title="How DFS Works">
          <p className="mb-4">DFS uses a <strong>stack</strong> (Last-In-First-Out) data structure:</p>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>Start by pushing the initial node onto the stack</li>
            <li>Pop a node from the stack and mark it as visited</li>
            <li>Push all unvisited neighbors of this node onto the stack</li>
            <li>Repeat steps 2-3 until the stack is empty</li>
          </ol>
          <p className="mt-4">
            Alternatively, DFS can be implemented using <strong>recursion</strong>, where the
            call stack naturally provides the LIFO behavior.
          </p>
        </TheoryBlock>

        <TheoryBlock title="Time & Space Complexity">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-primary/5">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Time Complexity</h4>
                <p className="text-2xl font-mono font-bold text-primary">O(V + E)</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Where V = vertices, E = edges. Each vertex and edge is visited once.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-secondary/10">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Space Complexity</h4>
                <p className="text-2xl font-mono font-bold text-secondary-foreground">O(V)</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Stack/recursion depth can be at most V in worst case (linear graph).
                </p>
              </CardContent>
            </Card>
          </div>
        </TheoryBlock>

        <TheoryBlock title="Key Terminology">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <TermCard term="Stack" definition="LIFO data structure for tracking nodes" />
            <TermCard term="Visited Set" definition="Nodes already explored" />
            <TermCard term="Backtracking" definition="Return when dead end reached" />
            <TermCard term="Neighbors" definition="Adjacent nodes in the graph" />
          </div>
        </TheoryBlock>

        <TheoryBlock title="Applications">
          <div className="grid md:grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span>Cycle detection in graphs</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span>Topological sorting</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span>Finding connected components</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span>Solving mazes and puzzles</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span>Path finding between nodes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span>Web crawling</span>
            </div>
          </div>
        </TheoryBlock>
      </SectionCard>

      {/* ALGORITHM SECTION - Static Display Only */}
      <SectionCard id="algorithm" title="Algorithm" icon="Cog">
        <p className="text-muted-foreground mb-6">
          The DFS algorithm explores as deep as possible along each branch before backtracking:
        </p>

        <div className="space-y-4 mb-8">
          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">1</div>
              <div className="w-0.5 flex-1 bg-border mt-2" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Initialize</h4>
              <p className="text-muted-foreground">Start by pushing the root node onto the Stack and marking it as visited.</p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">2</div>
              <div className="w-0.5 flex-1 bg-border mt-2" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Pop & Process</h4>
              <p className="text-muted-foreground">Pop the top node from the stack to visit it.</p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">3</div>
              <div className="w-0.5 flex-1 bg-border mt-2" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Explore Depth</h4>
              <p className="text-muted-foreground">Find unvisited neighbors. Choose one to visit next (push to stack).</p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">4</div>
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Backtrack</h4>
              <p className="text-muted-foreground">If a node has no unvisited neighbors, backtrack (pop from stack) to explore other paths.</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-secondary rounded-xl p-6 overflow-x-auto">
            <h4 className="text-sm font-semibold text-secondary-foreground/70 mb-3">📝 Iterative DFS (Stack)</h4>
            <pre className="font-mono text-sm text-secondary-foreground leading-relaxed">{ALGORITHM_PSEUDOCODE}</pre>
          </div>

          <div className="bg-secondary rounded-xl p-6 overflow-x-auto">
            <h4 className="text-sm font-semibold text-secondary-foreground/70 mb-3">📝 Recursive DFS</h4>
            <pre className="font-mono text-sm text-secondary-foreground leading-relaxed">{RECURSIVE_PSEUDOCODE}</pre>
          </div>
        </div>
      </SectionCard>

      {/* PROGRAM SECTION */}
      <SectionCard id="program" title="Program" icon="Code">
        <p className="text-muted-foreground mb-6">
          Here's the complete Python implementation with both iterative and recursive versions:
        </p>

        <div className="space-y-6">
          <CodeBlock code={DFS_CODE} language="python" title="dfs.py" />

          <div className="p-4 bg-card rounded-lg border font-mono text-sm">
            <p className="text-muted-foreground">$ python dfs.py</p>
            <p className="text-primary mt-2">DFS Traversal: ['A', 'B', 'D', 'H', 'E', 'C', 'F', 'I', 'G']</p>
          </div>
        </div>
      </SectionCard>

      {/* DEMO SECTION - Restructured Layout */}
      <SectionCard id="demo" title="Demo" icon="Play">
        <p className="text-muted-foreground mb-6 text-lg">
          Visualize DFS traversal on an interactive graph. Configure your graph, select a starting point,
          and watch the algorithm explore deep into branches.
        </p>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column: Canvas, Playback, Legend */}
          <div className="lg:col-span-2 space-y-6">
            {/* Graph Area with Overlay Controls */}
            <Card className="overflow-hidden relative group border-2">
              <CardContent className="p-4 min-h-[500px] flex items-center justify-center relative bg-muted/5">
                <GraphCanvas
                  graph={graph}
                  dfsState={dfsState}
                  selectedNode={selectedNode}
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
                    disabled={dfsState.isRunning || dfsState.traversalOrder.length === 0}
                    className="h-9 w-9 p-0 hover:bg-primary/10"
                    title="Step Backward"
                  >
                    <StepBack className="h-4 w-4" />
                  </Button>

                  {!dfsState.isRunning ? (
                    <Button
                      size="sm"
                      onClick={dfsState.stack.length > 0 ? resume : handleStart}
                      disabled={!selectedNode}
                      className="gap-2 h-9 px-4 gradient-primary shadow-lg"
                    >
                      <Play className="h-4 w-4" />
                      <span>{dfsState.stack.length > 0 ? 'Resume' : 'Start'}</span>
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
                    disabled={dfsState.isRunning || (dfsState.stack.length === 0 && !selectedNode)}
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

            {/* Configuration Panel */}
            <Card className="border-border">
              <CardContent className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Start Node</label>
                    <Select value={selectedNode || ''} onValueChange={setSelectedNode} disabled={isAnimating}>
                      <SelectTrigger className="h-11 bg-muted/30">
                        <SelectValue placeholder="Select Starting Node" />
                      </SelectTrigger>
                      <SelectContent>
                        {graph.nodes.map((node) => (
                          <SelectItem key={node.id} value={node.id}>
                            Node {node.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3 pb-1">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Simulation Speed</label>
                      <span className="text-xs font-mono font-bold bg-primary/10 text-primary px-2 py-0.5 rounded">{speed.toFixed(1)}x</span>
                    </div>
                    <Slider
                      value={[speed]}
                      onValueChange={([val]) => setSpeed(val)}
                      min={0.5}
                      max={3}
                      step={0.5}
                      className="py-2"
                      disabled={isAnimating}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Legend */}
            <Legend />
          </div>

          {/* Right Column: Info & Tabs */}
          <div className="space-y-6">
            <Tabs defaultValue="history" className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-11 bg-muted/50 p-1">
                <TabsTrigger value="history" className="gap-2 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <Table className="h-4 w-4" />
                  Steps
                </TabsTrigger>
                <TabsTrigger value="graph" className="gap-2 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <Settings className="h-4 w-4" />
                  Graph
                </TabsTrigger>
              </TabsList>

              <TabsContent value="history" className="mt-4 animate-in fade-in slide-in-from-right-1">
                <TraversalInfo dfsState={dfsState} />
              </TabsContent>

              <TabsContent value="graph" className="mt-4 animate-in fade-in slide-in-from-right-1">
                <Card>
                  <CardContent className="p-4">
                    <GraphControls
                      editMode={editMode}
                      nodeCount={nodeCount}
                      disabled={isAnimating}
                      onEditModeChange={setEditMode}
                      onNodeCountChange={setNodeCount}
                      onGenerateRandom={() => { reset(); generateRandomGraph(nodeCount); setSelectedNode(null); }}
                      onClearGraph={() => { reset(); clearGraph(); setSelectedNode(null); }}
                      onResetDefault={() => { reset(); resetToDefault(); setSelectedNode('A'); }}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {editMode !== 'none' && !isAnimating && (
              <Card className="bg-primary/5 border-primary/20 border-dashed animate-in zoom-in-95">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Settings className="h-4 w-4 text-primary animate-spin-slow" />
                  </div>
                  <p className="text-sm font-medium text-primary">
                    {editMode === 'addNode' && 'Click on canvas to add a new node'}
                    {editMode === 'addEdge' && (edgeStartNode
                      ? `Connect ${edgeStartNode} to another node`
                      : 'Select a node to start a connection'
                    )}
                    {editMode === 'delete' && 'Select a node to remove it'}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </SectionCard>

      {/* PRACTICE SECTION */}
      <SectionCard id="practice" title="Practice" icon="Pencil">
        <p className="text-muted-foreground mb-6">
          Test your understanding of DFS with these exercises:
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-secondary text-secondary-foreground">Exercise 1</Badge>
                <Badge variant="outline">Beginner</Badge>
              </div>
              <h4 className="font-semibold mb-2">Trace DFS Manually</h4>
              <p className="text-sm text-muted-foreground">
                Create a graph in the demo and predict the traversal order before running the algorithm.
                Compare your prediction with the actual result.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-secondary text-secondary-foreground">Exercise 2</Badge>
                <Badge variant="outline">Intermediate</Badge>
              </div>
              <h4 className="font-semibold mb-2">Cycle Detection</h4>
              <p className="text-sm text-muted-foreground">
                Modify the DFS algorithm to detect if a graph contains a cycle.
                Test with both cyclic and acyclic graphs.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-warning/20 hover:border-warning/40 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-warning text-warning-foreground">Exercise 3</Badge>
                <Badge variant="outline">Intermediate</Badge>
              </div>
              <h4 className="font-semibold mb-2">Connected Components</h4>
              <p className="text-sm text-muted-foreground">
                Use DFS to find all connected components in an undirected graph.
                Count how many separate components exist.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-destructive/20 hover:border-destructive/40 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-destructive text-destructive-foreground">Exercise 4</Badge>
                <Badge variant="outline">Advanced</Badge>
              </div>
              <h4 className="font-semibold mb-2">Topological Sort</h4>
              <p className="text-sm text-muted-foreground">
                Implement topological sorting using DFS. Order tasks based on
                their dependencies using the algorithm.
              </p>
            </CardContent>
          </Card>
        </div>
      </SectionCard>
    </ExperimentLayout>
  );
}
