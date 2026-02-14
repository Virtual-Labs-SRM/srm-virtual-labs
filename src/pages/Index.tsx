import { useState, useCallback } from 'react';
import { useGraph } from '@/hooks/useGraph';
import { useDFS } from '@/hooks/useDFS';
import { GraphCanvas, EditMode } from '@/components/dfs/GraphCanvas';
import { ControlPanel } from '@/components/dfs/ControlPanel';
import { TraversalInfo } from '@/components/dfs/TraversalInfo';
import { Legend } from '@/components/dfs/Legend';
import { GraphControls } from '@/components/dfs/GraphControls';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GitBranch, Settings, Play } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Index = () => {
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
  
  const { dfsState, runDFS, reset, pause, resume, stepOnce } = useDFS(graph, speed);

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
      toast({
        title: "Edge start selected",
        description: `Click another node to connect to ${nodeId}`,
      });
    } else if (edgeStartNode === nodeId) {
      setEdgeStartNode(null);
      toast({
        title: "Cancelled",
        description: "Edge creation cancelled",
      });
    } else {
      const success = addEdge(edgeStartNode, nodeId);
      if (success) {
        toast({
          title: "Edge added",
          description: `Connected ${edgeStartNode} to ${nodeId}`,
        });
      } else {
        toast({
          title: "Edge exists",
          description: "This edge already exists",
          variant: "destructive",
        });
      }
      setEdgeStartNode(null);
    }
  }, [edgeStartNode, addEdge]);

  const handleNodeDelete = useCallback((nodeId: string) => {
    removeNode(nodeId);
    if (selectedNode === nodeId) {
      setSelectedNode(graph.nodes.find(n => n.id !== nodeId)?.id || null);
    }
    toast({
      title: "Node deleted",
      description: `Node ${nodeId} and its edges removed`,
    });
  }, [removeNode, selectedNode, graph.nodes]);

  const handleEditModeChange = (mode: EditMode) => {
    setEditMode(mode);
    setEdgeStartNode(null);
  };

  const handleGenerateRandom = () => {
    reset();
    generateRandomGraph(nodeCount);
    setSelectedNode(null);
    setEdgeStartNode(null);
    toast({
      title: "Graph generated",
      description: `Created random graph with ${nodeCount} nodes`,
    });
  };

  const handleClearGraph = () => {
    reset();
    clearGraph();
    setSelectedNode(null);
    setEdgeStartNode(null);
    toast({
      title: "Graph cleared",
      description: "All nodes and edges removed",
    });
  };

  const handleResetDefault = () => {
    reset();
    resetToDefault();
    setSelectedNode('A');
    setEdgeStartNode(null);
    toast({
      title: "Reset complete",
      description: "Restored default graph",
    });
  };

  const handleReset = () => {
    reset();
    setEdgeStartNode(null);
  };

  // Update selected node if it no longer exists
  if (selectedNode && !graph.nodes.find(n => n.id === selectedNode)) {
    setSelectedNode(graph.nodes[0]?.id || null);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <GitBranch className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                DFS Visualizer
              </h1>
              <p className="text-sm text-muted-foreground">
                Interactive Depth-First Search Algorithm Visualization
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          {/* Graph Visualization */}
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <CardContent className="p-4 min-h-[500px] flex items-center justify-center relative">
                {isAnimating && (
                  <div className="absolute top-2 right-2 px-3 py-1 bg-primary/10 rounded-full text-xs text-primary font-medium">
                    Animation in progress
                  </div>
                )}
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
              </CardContent>
            </Card>
            <Legend />
            
            {/* Edit Mode Instructions */}
            {editMode !== 'none' && !isAnimating && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-3">
                  <p className="text-sm text-primary">
                    {editMode === 'addNode' && '🖱️ Click on the canvas to add a new node'}
                    {editMode === 'addEdge' && (edgeStartNode 
                      ? `🔗 Click another node to connect to ${edgeStartNode} (or click ${edgeStartNode} to cancel)`
                      : '🔗 Click a node to start creating an edge'
                    )}
                    {editMode === 'delete' && '🗑️ Click on a node to delete it and its edges'}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Tabs defaultValue="algorithm" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="algorithm" className="gap-2">
                  <Play className="h-4 w-4" />
                  Algorithm
                </TabsTrigger>
                <TabsTrigger value="graph" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Graph
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="algorithm" className="space-y-4 mt-4">
                <Card>
                  <CardContent className="p-4">
                    <h2 className="text-lg font-semibold text-foreground mb-4">
                      Controls
                    </h2>
                    <ControlPanel
                      graph={graph}
                      dfsState={dfsState}
                      selectedNode={selectedNode}
                      speed={speed}
                      onSelectNode={setSelectedNode}
                      onStart={handleStart}
                      onPause={pause}
                      onResume={resume}
                      onReset={handleReset}
                      onStep={handleStep}
                      onSpeedChange={setSpeed}
                    />
                  </CardContent>
                </Card>

                <TraversalInfo dfsState={dfsState} />
              </TabsContent>
              
              <TabsContent value="graph" className="mt-4">
                <Card>
                  <CardContent className="p-4">
                    <h2 className="text-lg font-semibold text-foreground mb-4">
                      Graph Editor
                    </h2>
                    <GraphControls
                      editMode={editMode}
                      nodeCount={nodeCount}
                      disabled={isAnimating}
                      onEditModeChange={handleEditModeChange}
                      onNodeCountChange={setNodeCount}
                      onGenerateRandom={handleGenerateRandom}
                      onClearGraph={handleClearGraph}
                      onResetDefault={handleResetDefault}
                    />
                  </CardContent>
                </Card>
                
                {/* Graph Stats */}
                <Card className="mt-4 bg-card/50">
                  <CardContent className="p-4">
                    <h3 className="text-sm font-medium text-foreground mb-3">
                      Graph Statistics
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Nodes:</span>
                        <span className="font-mono font-medium">{graph.nodes.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Edges:</span>
                        <span className="font-mono font-medium">{graph.edges.length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <Card className="bg-card/50">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">
                What is DFS?
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Depth-First Search (DFS) is a graph traversal algorithm that explores as far as possible along each branch before backtracking. It uses a stack (or recursion) to remember which nodes to visit next.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card/50">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">
                How to Use
              </h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• <strong>Drag nodes</strong> to reposition them on the canvas</li>
                <li>• Use <strong>Graph tab</strong> to create custom graphs or generate random ones</li>
                <li>• Select a start node and click <strong>Start</strong> or <strong>Step</strong></li>
                <li>• Watch the algorithm explore the graph visually</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;
