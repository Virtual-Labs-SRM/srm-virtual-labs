import { useState, useCallback } from 'react';
import { ExperimentLayout } from '@/components/layout/ExperimentLayout';
import { SectionCard, TheoryBlock, TermCard, HighlightItem } from '@/components/lab/SectionCard';
import { CodeBlock } from '@/components/lab/CodeBlock';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGraph } from '@/hooks/useGraph';
import { useBFS } from '@/hooks/useBFS';
import { BFSGraphCanvas } from '@/components/bfs/BFSGraphCanvas';
import { BFSTraversalInfo } from '@/components/bfs/BFSTraversalInfo';
import { Legend } from '@/components/dfs/Legend';
import { GraphControls } from '@/components/dfs/GraphControls';
import { Play, Settings, Pause, StepForward, StepBack, RotateCcw, Table } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { EditMode } from '@/components/dfs/GraphCanvas';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

const BFS_CODE = `from collections import deque

def bfs(graph, start):
    """
    Breadth-First Search implementation using a queue.
    
    Args:
        graph: Dictionary representing adjacency list
        start: Starting node for traversal
    
    Returns:
        List of nodes in BFS traversal order
    """
    visited = set([start])
    queue = deque([start])
    traversal_order = []
    
    while queue:
        # Dequeue from front
        node = queue.popleft()
        traversal_order.append(node)
        
        # Add unvisited neighbors to queue
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
    
    return traversal_order


def bfs_with_levels(graph, start):
    """
    BFS that tracks the level/distance of each node.
    """
    visited = set([start])
    queue = deque([(start, 0)])  # (node, level)
    levels = {start: 0}
    
    while queue:
        node, level = queue.popleft()
        
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                levels[neighbor] = level + 1
                queue.append((neighbor, level + 1))
    
    return levels


# Example usage
if __name__ == "__main__":
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
    
    print("BFS Traversal:", bfs(graph, 'A'))
    # Output: BFS Traversal: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']`;

const ALGORITHM_PSEUDOCODE = `BFS(Graph G, Node start):
    1. Create empty set 'visited'
    2. Create queue Q and enqueue 'start'
    3. Mark start as visited
    4. While Q is not empty:
        a. node ← Q.dequeue()
        b. Process node
        c. For each neighbor of node:
           - If neighbor not in visited:
             Mark as visited
             Enqueue neighbor
    5. Return traversal order`;

export function BFSLab() {
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

  const { bfsState, runBFS, reset, pause, resume, stepOnce, stepBackward } = useBFS(graph, speed);

  const isAnimating = bfsState.isRunning || bfsState.queue.length > 0;

  const handleStart = () => {
    if (selectedNode && graph.nodes.find(n => n.id === selectedNode)) {
      runBFS(selectedNode);
    } else {
      toast({ title: "Invalid start node", variant: "destructive" });
    }
  };

  const handleStep = () => {
    if (selectedNode) {
      stepOnce(bfsState.queue.length === 0 ? selectedNode : undefined);
    }
  };

  const handleNodeClick = (nodeId: string) => {
    if (!bfsState.isRunning) setSelectedNode(nodeId);
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
    if (selectedNode === nodeId) {
      setSelectedNode(graph.nodes.find(n => n.id !== nodeId)?.id || null);
    }
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

  if (selectedNode && !graph.nodes.find(n => n.id === selectedNode)) {
    setSelectedNode(graph.nodes[0]?.id || null);
  }

  return (
    <ExperimentLayout
      experimentNumber={1}
      title="Breadth First Search (BFS)"
      subtitle="Graph Traversal using Queue-Based Level-Order Exploration"
      icon="Layers"
      duration="~30 minutes"
      difficulty="Beginner"
      tags={['Graph', 'Traversal', 'Queue', 'Shortest Path']}
      activeSection={activeSection}
      onSectionChange={handleSectionChange}
    >
      {/* AIM SECTION */}
      <SectionCard id="aim" title="Aim" icon="Target">
        <p className="text-lg leading-relaxed mb-6">
          To understand and implement <strong className="text-primary">Breadth-First Search (BFS)</strong> algorithm
          for graph traversal using a queue-based level-order approach.
        </p>
        <div className="grid sm:grid-cols-3 gap-4">
          <HighlightItem icon="📚" text="Learn queue-based traversal" />
          <HighlightItem icon="🎯" text="Find shortest paths" />
          <HighlightItem icon="🔄" text="Compare with DFS" />
        </div>
      </SectionCard>

      {/* THEORY SECTION */}
      <SectionCard id="theory" title="Theory" icon="BookOpen">
        <TheoryBlock title="What is Breadth-First Search?">
          <p className="mb-4">
            <strong>Breadth-First Search (BFS)</strong> is a graph traversal algorithm that explores
            all neighbors at the current depth before moving to nodes at the next depth level.
            It visits nodes level by level, starting from the source.
          </p>
        </TheoryBlock>

        <TheoryBlock title="BFS vs DFS">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-primary/5">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">BFS (Queue)</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Uses FIFO queue</li>
                  <li>• Explores level by level</li>
                  <li>• Finds shortest path</li>
                  <li>• Higher memory usage</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-secondary/10">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">DFS (Stack)</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Uses LIFO stack</li>
                  <li>• Explores depth first</li>
                  <li>• May not find shortest</li>
                  <li>• Lower memory usage</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TheoryBlock>

        <TheoryBlock title="Time & Space Complexity">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-primary/5">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Time Complexity</h4>
                <p className="text-2xl font-mono font-bold text-primary">O(V + E)</p>
              </CardContent>
            </Card>
            <Card className="bg-secondary/10">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Space Complexity</h4>
                <p className="text-2xl font-mono font-bold text-secondary-foreground">O(V)</p>
              </CardContent>
            </Card>
          </div>
        </TheoryBlock>

        <TheoryBlock title="Key Terminology">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <TermCard term="Queue" definition="FIFO data structure for tracking nodes" />
            <TermCard term="Level" definition="Distance from source node" />
            <TermCard term="Frontier" definition="Nodes at current exploration depth" />
            <TermCard term="Shortest Path" definition="Path with minimum edges" />
          </div>
        </TheoryBlock>
      </SectionCard>

      {/* ALGORITHM SECTION - Static Display Only */}
      <SectionCard id="algorithm" title="Algorithm" icon="Cog">
        <p className="text-muted-foreground mb-6">
          The BFS algorithm explores nodes level by level using a queue:
        </p>

        <div className="space-y-4 mb-8">
          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">1</div>
              <div className="w-0.5 flex-1 bg-border mt-2" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Initialize</h4>
              <p className="text-muted-foreground">Start by adding the source node to the Queue and marking it as visited.</p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">2</div>
              <div className="w-0.5 flex-1 bg-border mt-2" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Dequeue & Process</h4>
              <p className="text-muted-foreground">Remove the node from the front of the queue and process it (e.g., print or check if goal).</p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">3</div>
              <div className="w-0.5 flex-1 bg-border mt-2" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Explore Neighbors</h4>
              <p className="text-muted-foreground">Identify all unvisited neighbors of the current node.</p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">4</div>
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Update Queue</h4>
              <p className="text-muted-foreground">Mark each unvisited neighbor as visited and Enqueue them to be explored in future steps.</p>
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
          Here's the complete Python implementation with level tracking:
        </p>

        <CodeBlock code={BFS_CODE} language="python" title="bfs.py" />
      </SectionCard>

      {/* DEMO SECTION - Restructured Layout */}
      <SectionCard id="demo" title="Demo" icon="Play">
        <p className="text-muted-foreground mb-6 text-lg">
          Visualize BFS traversal on an interactive graph. Configure your graph, select a starting point,
          and watch the algorithm explore level by level.
        </p>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column: Canvas, Playback, Legend */}
          <div className="lg:col-span-2 space-y-6">

            {/* Graph Area with Overlay Controls */}
            <Card className="overflow-hidden relative group border-2">
              <CardContent className="p-4 min-h-[500px] flex items-center justify-center relative bg-muted/5">
                <BFSGraphCanvas
                  graph={graph}
                  bfsState={bfsState}
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
                    disabled={bfsState.isRunning || bfsState.traversalOrder.length === 0}
                    className="h-9 w-9 p-0 hover:bg-primary/10"
                    title="Step Backward"
                  >
                    <StepBack className="h-4 w-4" />
                  </Button>

                  {!bfsState.isRunning ? (
                    <Button
                      size="sm"
                      onClick={bfsState.queue.length > 0 ? resume : handleStart}
                      disabled={!selectedNode}
                      className="gap-2 h-9 px-4 gradient-primary shadow-lg"
                    >
                      <Play className="h-4 w-4" />
                      <span>{bfsState.queue.length > 0 ? 'Resume' : 'Start'}</span>
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
                    disabled={bfsState.isRunning || (bfsState.queue.length === 0 && !selectedNode)}
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
                <BFSTraversalInfo bfsState={bfsState} />
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
          Test your understanding of BFS with these exercises:
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-secondary text-secondary-foreground">Exercise 1</Badge>
                <Badge variant="outline">Intermediate</Badge>
              </div>
              <h4 className="font-semibold mb-2">Shortest Path</h4>
              <p className="text-sm text-muted-foreground">
                Use BFS to find the shortest path between two nodes in an unweighted graph.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-secondary text-secondary-foreground">Exercise 2</Badge>
                <Badge variant="outline">Beginner</Badge>
              </div>
              <h4 className="font-semibold mb-2">Level Order Traversal</h4>
              <p className="text-sm text-muted-foreground">
                Implement BFS to return nodes grouped by their level/distance from start.
              </p>
            </CardContent>
          </Card>
        </div>
      </SectionCard>
    </ExperimentLayout>
  );
}
