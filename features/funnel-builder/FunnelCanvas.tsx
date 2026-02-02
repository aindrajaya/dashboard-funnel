import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  ReactFlowProvider,
  NodeTypes,
  useReactFlow,
  BackgroundVariant,
  MarkerType,
  ControlButton
} from 'reactflow';
// CSS imported in index.html to support browser-native modules

import { Sidebar } from './components/Sidebar';
import CustomNode from './components/CustomNode';
import { ValidationPanel } from './components/ValidationPanel';
import { useFunnelLogic } from './hooks/useFunnelLogic';
import { NodeType } from '../../types';
import { Button } from '../../components/ui/Button';
import { Download, Upload, Trash2, LayoutTemplate, Save, Check, Undo, Redo } from 'lucide-react';
import { SNAP_GRID } from '../../constants';

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

const FunnelCanvasContent: React.FC = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { project } = useReactFlow();
  const [justSaved, setJustSaved] = useState(false);
  
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    deleteSelected,
    saveFunnel,
    onExport,
    onImport,
    onClear,
    onLoadTemplate,
    validationIssues,
    undo,
    redo,
    canUndo,
    canRedo
  } = useFunnelLogic();

  // Handle Save Feedback
  const handleSave = useCallback(() => {
    saveFunnel();
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  }, [saveFunnel]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if input is focused
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      
      const key = event.key.toUpperCase();

      // Undo: Ctrl+Z
      if ((event.ctrlKey || event.metaKey) && key === 'Z' && !event.shiftKey) {
        event.preventDefault();
        undo();
        return;
      }

      // Redo: Ctrl+Y or Ctrl+Shift+Z
      if ((event.ctrlKey || event.metaKey) && (key === 'Y' || (key === 'Z' && event.shiftKey))) {
        event.preventDefault();
        redo();
        return;
      }
      
      // Node Shortcuts
      const getNodeType = (k: string): NodeType | null => {
        switch(k) {
          case 'A': return NodeType.SALES; // 'A' for Add Sales Page
          case 'S': return NodeType.SALES; // 'S' alias for Sales Page
          case 'O': return NodeType.ORDER;
          case 'U': return NodeType.UPSELL;
          case 'D': return NodeType.DOWNSELL;
          case 'T': return NodeType.THANK_YOU;
          default: return null;
        }
      };

      const typeToAdd = getNodeType(key);
      if (typeToAdd && !event.ctrlKey && !event.metaKey && !event.altKey) {
        if (reactFlowWrapper.current) {
          const { width, height } = reactFlowWrapper.current.getBoundingClientRect();
          // Project center of screen to flow coordinates
          const position = project({ x: width / 2, y: height / 2 });
          addNode(typeToAdd, position);
        }
      }

      // Delete Shortcut
      if (event.key === 'Backspace' || event.key === 'Delete') {
        deleteSelected();
      }

      // Save Shortcut (Ctrl+S / Cmd+S)
      if ((event.ctrlKey || event.metaKey) && key === 'S') {
        event.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [addNode, deleteSelected, handleSave, project, undo, redo]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      if (!reactFlowWrapper.current) return;
      const type = event.dataTransfer.getData('application/reactflow') as NodeType;
      if (!type) return;
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      addNode(type, position);
    },
    [addNode, project]
  );

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-[#f8f9fa]">
      
      {/* 1. Top Center: Main Actions Toolbar */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white rounded-lg border-2 border-gray-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-1.5 flex items-center gap-1">
             <Button variant="ghost" size="sm" icon={<Save className="w-4 h-4"/>} onClick={handleSave} title="Save Project">Save</Button>
             <Button variant="ghost" size="sm" icon={<Upload className="w-4 h-4"/>} onClick={() => fileInputRef.current?.click()} title="Open JSON">Open</Button>
             <Button variant="ghost" size="sm" icon={<Download className="w-4 h-4"/>} onClick={onExport} title="Export JSON">Export</Button>
             <Button variant="ghost" size="sm" icon={<LayoutTemplate className="w-4 h-4"/>} onClick={onLoadTemplate} title="Load Template">Template</Button>
             <div className="w-px h-6 bg-gray-200 mx-1"></div>
             <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" icon={<Trash2 className="w-4 h-4"/>} onClick={onClear} title="Clear Canvas">Clear</Button>
        </div>
      </div>

      {/* 2. Top Left: Just Title now */}
      <div className="absolute top-4 left-4 z-50 flex flex-col items-start gap-3">
        <div className="px-3 py-2 bg-white rounded-md border-2 border-gray-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-['Architects_Daughter'] font-bold text-sm flex items-center">
            Cartpanda Funnel
            {justSaved && <Check className="w-4 h-4 ml-2 text-green-600" />}
        </div>
      </div>

      <input type="file" ref={fileInputRef} onChange={onImport} accept=".json" className="hidden" />

      {/* 3. Floating Toolbar (Left Side) - Palette */}
      <Sidebar />

      {/* Main Workspace */}
      <div className="flex-1 relative w-full h-full" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDragOver={onDragOver}
          onDrop={onDrop}
          nodeTypes={nodeTypes}
          snapToGrid={true}
          snapGrid={SNAP_GRID}
          deleteKeyCode={['Backspace', 'Delete']} 
          fitView
          className="bg-[#f8f9fa]"
          defaultEdgeOptions={{ 
            type: 'smoothstep', 
            style: { strokeWidth: 2, stroke: '#1a1a1a', strokeDasharray: '5,5' },
            animated: false,
            markerEnd: { 
              type: MarkerType.ArrowClosed, 
              width: 20, 
              height: 20, 
              color: '#1a1a1a' 
            }
          }}
          connectionLineStyle={{ stroke: '#1a1a1a', strokeWidth: 2, strokeDasharray: '5,5' }}
        >
          <Background color="#ccc" gap={20} variant={BackgroundVariant.Dots} size={2} />
          
          <Controls 
            position="top-right" 
            showInteractive={false} 
            className="!m-4"
          >
             <ControlButton onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)">
                <Undo className="w-4 h-4" />
             </ControlButton>
             <ControlButton onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Y)">
                <Redo className="w-4 h-4" />
             </ControlButton>
          </Controls>
          
          <MiniMap 
            className="!m-4" 
            position="bottom-right"
            zoomable
            pannable
            nodeStrokeColor="#1a1a1a"
            nodeColor={(n) => {
                const type = n.data.type as NodeType;
                // Simple pastel map
                switch(type) {
                    case NodeType.SALES: return '#a5d8ff';
                    case NodeType.ORDER: return '#bac8ff';
                    case NodeType.UPSELL: return '#b2f2bb';
                    case NodeType.DOWNSELL: return '#ffc9c9';
                    case NodeType.THANK_YOU: return '#e9ecef';
                    default: return '#fff';
                }
            }}
            nodeBorderRadius={4}
            maskColor="rgba(240, 240, 240, 0.6)"
          />
        </ReactFlow>

        <ValidationPanel issues={validationIssues} />
      </div>
    </div>
  );
};

export const FunnelCanvas: React.FC = () => (
  <ReactFlowProvider>
    <FunnelCanvasContent />
  </ReactFlowProvider>
);