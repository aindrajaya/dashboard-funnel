import React, { useCallback, useEffect, useRef, useState } from 'react';
import { 
  Node, 
  Edge, 
  useNodesState, 
  useEdgesState, 
  Connection, 
  addEdge,
  OnConnect,
  getOutgoers
} from 'reactflow';
import { NodeType, ValidationIssue, SavedFunnel, FunnelNodeData } from '../../../types';
import { NODE_CONFIG, LOCAL_STORAGE_KEY, MOCK_INITIAL_DATA } from '../../../constants';

interface HistorySnapshot {
  nodes: Node[];
  edges: Edge[];
  nodeCounters: Record<NodeType, number>;
}

export const useFunnelLogic = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [nodeCounters, setNodeCounters] = useState<Record<NodeType, number>>({
    [NodeType.SALES]: 0,
    [NodeType.ORDER]: 0,
    [NodeType.UPSELL]: 0,
    [NodeType.DOWNSELL]: 0,
    [NodeType.THANK_YOU]: 0,
  });
  
  // History State
  const [history, setHistory] = useState<HistorySnapshot[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isUndoRedoOperation = useRef(false);
  
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // --- Persistence & Initialization ---
  useEffect(() => {
    // Only run this once on mount
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed: SavedFunnel = JSON.parse(saved);
        setNodes(parsed.nodes);
        setEdges(parsed.edges);
        setNodeCounters(parsed.nodeCounters);
        setLastSaved(new Date(parsed.updatedAt));
        
        // Initialize history with loaded state
        setHistory([{
          nodes: parsed.nodes,
          edges: parsed.edges,
          nodeCounters: parsed.nodeCounters
        }]);
        setHistoryIndex(0);
      } catch (e) {
        console.error("Failed to load funnel", e);
      }
    } else {
        // Initialize history with empty state
        setHistory([{
            nodes: [],
            edges: [],
            nodeCounters: {
                [NodeType.SALES]: 0,
                [NodeType.ORDER]: 0,
                [NodeType.UPSELL]: 0,
                [NodeType.DOWNSELL]: 0,
                [NodeType.THANK_YOU]: 0,
            }
        }]);
        setHistoryIndex(0);
    }
    
    setIsInitialized(true);
  }, []); 

  // --- History Tracking (Debounced) ---
  useEffect(() => {
    if (!isInitialized) return;
    
    // If this change was triggered by undo/redo, ignore it for history recording
    if (isUndoRedoOperation.current) {
      isUndoRedoOperation.current = false;
      return;
    }

    const timeoutId = setTimeout(() => {
      setHistory(prev => {
        // If we are in the middle of history and make a change, discard the future
        const currentHistory = prev.slice(0, historyIndex + 1);
        
        const lastSnapshot = currentHistory[currentHistory.length - 1];
        
        // Simple equality check to avoid duplicate snapshots (optional but good for performance)
        const newSnapshot = { nodes, edges, nodeCounters };
        
        if (lastSnapshot && JSON.stringify(lastSnapshot) === JSON.stringify(newSnapshot)) {
            return prev;
        }

        const newHistory = [...currentHistory, newSnapshot];
        // Limit history size to 50 steps
        if (newHistory.length > 50) {
            newHistory.shift();
        }
        return newHistory;
      });
    }, 500); // 500ms debounce to catch "drag end" roughly

    return () => clearTimeout(timeoutId);
  }, [nodes, edges, nodeCounters, isInitialized, historyIndex]);

  // Sync index when history length changes
  const prevHistoryLength = useRef(history.length);
  useEffect(() => {
      if (history.length > prevHistoryLength.current) {
          setHistoryIndex(history.length - 1);
      }
      prevHistoryLength.current = history.length;
  }, [history.length]);


  // --- Undo / Redo Actions ---
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      isUndoRedoOperation.current = true;
      const prevIndex = historyIndex - 1;
      const snapshot = history[prevIndex];
      
      setNodes(snapshot.nodes);
      setEdges(snapshot.edges);
      setNodeCounters(snapshot.nodeCounters);
      setHistoryIndex(prevIndex);
    }
  }, [history, historyIndex, setNodes, setEdges]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      isUndoRedoOperation.current = true;
      const nextIndex = historyIndex + 1;
      const snapshot = history[nextIndex];
      
      setNodes(snapshot.nodes);
      setEdges(snapshot.edges);
      setNodeCounters(snapshot.nodeCounters);
      setHistoryIndex(nextIndex);
    }
  }, [history, historyIndex, setNodes, setEdges]);


  const onLoadTemplate = useCallback(() => {
    if (nodes.length > 0 && !window.confirm("This will replace your current canvas. Are you sure?")) {
      return;
    }
    // We cast the mock data to compatible types
    setNodes(MOCK_INITIAL_DATA.nodes as Node[]);
    setEdges(MOCK_INITIAL_DATA.edges as Edge[]);
    setNodeCounters(MOCK_INITIAL_DATA.nodeCounters);
  }, [nodes.length, setNodes, setEdges]);

  const saveToStorage = useCallback((currentNodes: Node[], currentEdges: Edge[], currentCounters: Record<NodeType, number>) => {
    const payload: SavedFunnel = {
      nodes: currentNodes,
      edges: currentEdges,
      nodeCounters: currentCounters,
      version: 1,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
    setLastSaved(new Date());
  }, []);

  // Save on changes (debounced slightly in practice, direct here for simplicity)
  useEffect(() => {
    // Don't save empty state during initialization to avoid wiping storage logic
    if (isInitialized) {
      saveToStorage(nodes, edges, nodeCounters);
    }
  }, [nodes, edges, nodeCounters, saveToStorage, isInitialized]);

  // --- Actions ---

  const onConnect: OnConnect = useCallback(
    (params) => {
      // Business Rule: Sales Page max 1 outgoing
      const sourceNode = nodes.find(n => n.id === params.source);
      if (sourceNode?.data.type === NodeType.SALES) {
        const outgoers = getOutgoers(sourceNode, nodes, edges);
        if (outgoers.length >= 1) {
          alert("Sales Page can only have one outgoing connection.");
          return;
        }
      }
      
      setEdges((eds) => addEdge({ ...params, animated: true, type: 'smoothstep' }, eds));
    },
    [nodes, edges, setEdges]
  );

  const addNode = useCallback((type: NodeType, position: { x: number, y: number }) => {
    setNodeCounters(prev => {
      const nextCount = prev[type] + 1;
      const newNodeId = `${type}-${Date.now()}`;
      
      let label = NODE_CONFIG[type].label;
      // Auto-increment logic for Upsell/Downsell
      if (type === NodeType.UPSELL || type === NodeType.DOWNSELL) {
        label = `${NODE_CONFIG[type].label} ${nextCount}`;
      } else if (type === NodeType.SALES && prev[NodeType.SALES] > 0) {
        // Optional: Differentiate multiple sales pages
        label = `${NODE_CONFIG[type].label} ${nextCount}`; 
      }

      const newNode: Node<FunnelNodeData> = {
        id: newNodeId,
        type: 'custom',
        position,
        data: { label, type },
      };

      setNodes((nds) => nds.concat(newNode));
      return { ...prev, [type]: nextCount };
    });
  }, [setNodes]);

  const deleteSelected = useCallback(() => {
    setNodes((nds) => nds.filter((node) => !node.selected));
    setEdges((eds) => eds.filter((edge) => !edge.selected));
  }, [setNodes, setEdges]);

  const saveFunnel = useCallback(() => {
    saveToStorage(nodes, edges, nodeCounters);
    return true;
  }, [nodes, edges, nodeCounters, saveToStorage]);

  const onExport = useCallback(() => {
    const data = JSON.stringify({ nodes, edges, nodeCounters, version: 1 }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `funnel-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  }, [nodes, edges, nodeCounters]);

  const onImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed: SavedFunnel = JSON.parse(content);
        if (parsed.nodes && parsed.edges) {
          setNodes(parsed.nodes);
          setEdges(parsed.edges);
          setNodeCounters(parsed.nodeCounters || { [NodeType.SALES]: 0, [NodeType.ORDER]: 0, [NodeType.UPSELL]: 0, [NodeType.DOWNSELL]: 0, [NodeType.THANK_YOU]: 0 });
          
          // Reset history on import
          const newSnapshot = {
              nodes: parsed.nodes,
              edges: parsed.edges,
              nodeCounters: parsed.nodeCounters || { [NodeType.SALES]: 0, [NodeType.ORDER]: 0, [NodeType.UPSELL]: 0, [NodeType.DOWNSELL]: 0, [NodeType.THANK_YOU]: 0 }
          };
          setHistory([newSnapshot]);
          setHistoryIndex(0);
        }
      } catch (err) {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }, [setNodes, setEdges]);

  const onClear = useCallback(() => {
    if (window.confirm('Are you sure you want to clear the canvas?')) {
      const emptyNodes: Node[] = [];
      const emptyEdges: Edge[] = [];
      const emptyCounters = { [NodeType.SALES]: 0, [NodeType.ORDER]: 0, [NodeType.UPSELL]: 0, [NodeType.DOWNSELL]: 0, [NodeType.THANK_YOU]: 0 };

      // Update State
      setNodes(emptyNodes);
      setEdges(emptyEdges);
      setNodeCounters(emptyCounters);
      
      // Explicitly save empty state to storage to prevent race conditions or "reloading" old state
      saveToStorage(emptyNodes, emptyEdges, emptyCounters);
    }
  }, [setNodes, setEdges, saveToStorage]);

  // --- Validation ---
  useEffect(() => {
    const issues: ValidationIssue[] = [];
    const nodeIdsWithIssues = new Set<string>();
    
    nodes.forEach(node => {
      const incomingEdges = edges.filter(e => e.target === node.id);
      const outgoingEdges = edges.filter(e => e.source === node.id);
      const type = node.data.type;

      // Rule 1: Orphan nodes (except Sales page)
      if (type !== NodeType.SALES && incomingEdges.length === 0) {
        issues.push({
          nodeId: node.id,
          message: `${node.data.label} is unreachable (no incoming connections).`,
          severity: 'warning'
        });
        nodeIdsWithIssues.add(node.id);
      }

      // Rule 2: Dead-end nodes (except Thank You)
      if (type !== NodeType.THANK_YOU && outgoingEdges.length === 0) {
        issues.push({
          nodeId: node.id,
          message: `${node.data.label} is a dead end (no outgoing connections).`,
          severity: 'warning'
        });
        nodeIdsWithIssues.add(node.id);
      }
    });

    setValidationIssues(issues);

    // Sync visual invalid state
    setNodes(currentNodes => {
      let hasChanges = false;
      const newNodes = currentNodes.map(n => {
        const isInvalid = nodeIdsWithIssues.has(n.id);
        if (!!n.data.isInvalid !== isInvalid) {
          hasChanges = true;
          return { ...n, data: { ...n.data, isInvalid } };
        }
        return n;
      });
      return hasChanges ? newNodes : currentNodes;
    });

  }, [nodes, edges, setNodes]);

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    deleteSelected,
    saveFunnel,
    lastSaved,
    onExport,
    onImport,
    onClear,
    onLoadTemplate,
    validationIssues,
    undo,
    redo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1
  };
};