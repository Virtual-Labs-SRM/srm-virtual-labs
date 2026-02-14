import { useState, useMemo, useCallback } from 'react';
import { Graph, GraphNode, GraphEdge } from '@/types/graph';

const createDefaultGraph = (): { nodes: GraphNode[]; edges: GraphEdge[] } => {
  const nodes: GraphNode[] = [
    { id: 'A', x: 300, y: 80, label: 'A' },
    { id: 'B', x: 150, y: 180, label: 'B' },
    { id: 'C', x: 450, y: 180, label: 'C' },
    { id: 'D', x: 80, y: 300, label: 'D' },
    { id: 'E', x: 220, y: 300, label: 'E' },
    { id: 'F', x: 380, y: 300, label: 'F' },
    { id: 'G', x: 520, y: 300, label: 'G' },
    { id: 'H', x: 150, y: 420, label: 'H' },
    { id: 'I', x: 450, y: 420, label: 'I' },
  ];

  const edges: GraphEdge[] = [
    { from: 'A', to: 'B' },
    { from: 'A', to: 'C' },
    { from: 'B', to: 'D' },
    { from: 'B', to: 'E' },
    { from: 'C', to: 'F' },
    { from: 'C', to: 'G' },
    { from: 'D', to: 'H' },
    { from: 'E', to: 'H' },
    { from: 'F', to: 'I' },
    { from: 'G', to: 'I' },
  ];

  return { nodes, edges };
};

const NODE_LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function useGraph() {
  const defaultGraph = createDefaultGraph();
  const [nodes, setNodes] = useState<GraphNode[]>(defaultGraph.nodes);
  const [edges, setEdges] = useState<GraphEdge[]>(defaultGraph.edges);

  const graph: Graph = useMemo(() => {
    const adjacencyList = new Map<string, string[]>();
    
    nodes.forEach(node => {
      adjacencyList.set(node.id, []);
    });

    edges.forEach(edge => {
      const fromNeighbors = adjacencyList.get(edge.from) || [];
      const toNeighbors = adjacencyList.get(edge.to) || [];
      
      if (!fromNeighbors.includes(edge.to)) {
        fromNeighbors.push(edge.to);
      }
      if (!toNeighbors.includes(edge.from)) {
        toNeighbors.push(edge.from);
      }
      
      adjacencyList.set(edge.from, fromNeighbors);
      adjacencyList.set(edge.to, toNeighbors);
    });

    return { nodes, edges, adjacencyList };
  }, [nodes, edges]);

  const getNextLabel = useCallback(() => {
    const usedLabels = new Set(nodes.map(n => n.label));
    for (const char of NODE_LABELS) {
      if (!usedLabels.has(char)) return char;
    }
    return `N${nodes.length + 1}`;
  }, [nodes]);

  const addNode = useCallback((x: number, y: number) => {
    const label = getNextLabel();
    const newNode: GraphNode = {
      id: label,
      x,
      y,
      label,
    };
    setNodes(prev => [...prev, newNode]);
    return newNode;
  }, [getNextLabel]);

  const removeNode = useCallback((nodeId: string) => {
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    setEdges(prev => prev.filter(e => e.from !== nodeId && e.to !== nodeId));
  }, []);

  const updateNodePosition = useCallback((nodeId: string, x: number, y: number) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId ? { ...node, x, y } : node
    ));
  }, []);

  const addEdge = useCallback((from: string, to: string) => {
    if (from === to) return false;
    
    const edgeExists = edges.some(
      e => (e.from === from && e.to === to) || (e.from === to && e.to === from)
    );
    
    if (edgeExists) return false;
    
    setEdges(prev => [...prev, { from, to }]);
    return true;
  }, [edges]);

  const removeEdge = useCallback((from: string, to: string) => {
    setEdges(prev => prev.filter(
      e => !((e.from === from && e.to === to) || (e.from === to && e.to === from))
    ));
  }, []);

  const clearGraph = useCallback(() => {
    setNodes([]);
    setEdges([]);
  }, []);

  const resetToDefault = useCallback(() => {
    const defaultGraph = createDefaultGraph();
    setNodes(defaultGraph.nodes);
    setEdges(defaultGraph.edges);
  }, []);

  const generateRandomGraph = useCallback((nodeCount: number, canvasWidth = 600, canvasHeight = 500) => {
    const padding = 50;
    const nodeRadius = 28;
    const minDistance = nodeRadius * 3;

    const newNodes: GraphNode[] = [];
    
    const isValidPosition = (x: number, y: number) => {
      for (const node of newNodes) {
        const dx = node.x - x;
        const dy = node.y - y;
        if (Math.sqrt(dx * dx + dy * dy) < minDistance) {
          return false;
        }
      }
      return true;
    };

    for (let i = 0; i < nodeCount && i < NODE_LABELS.length; i++) {
      let x: number, y: number;
      let attempts = 0;
      const maxAttempts = 100;

      do {
        x = padding + Math.random() * (canvasWidth - 2 * padding);
        y = padding + Math.random() * (canvasHeight - 2 * padding);
        attempts++;
      } while (!isValidPosition(x, y) && attempts < maxAttempts);

      const label = NODE_LABELS[i];
      newNodes.push({
        id: label,
        x,
        y,
        label,
      });
    }

    // Generate edges - ensure connectivity with a spanning tree first
    const newEdges: GraphEdge[] = [];
    const connected = new Set<string>([newNodes[0]?.id].filter(Boolean));

    // Create a spanning tree to ensure connectivity
    for (let i = 1; i < newNodes.length; i++) {
      const connectedArray = Array.from(connected);
      const randomConnected = connectedArray[Math.floor(Math.random() * connectedArray.length)];
      newEdges.push({ from: randomConnected, to: newNodes[i].id });
      connected.add(newNodes[i].id);
    }

    // Add some random extra edges
    const extraEdges = Math.floor(Math.random() * (nodeCount / 2)) + 1;
    for (let i = 0; i < extraEdges; i++) {
      const from = newNodes[Math.floor(Math.random() * newNodes.length)];
      const to = newNodes[Math.floor(Math.random() * newNodes.length)];
      
      if (from && to && from.id !== to.id) {
        const edgeExists = newEdges.some(
          e => (e.from === from.id && e.to === to.id) || (e.from === to.id && e.to === from.id)
        );
        if (!edgeExists) {
          newEdges.push({ from: from.id, to: to.id });
        }
      }
    }

    setNodes(newNodes);
    setEdges(newEdges);
  }, []);

  return { 
    graph, 
    addNode, 
    removeNode, 
    updateNodePosition, 
    addEdge, 
    removeEdge, 
    clearGraph,
    resetToDefault,
    generateRandomGraph,
  };
}
