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
  ControlButton,
} from 'reactflow';
// CSS imported in index.html to support browser-native modules

import { Sidebar } from './components/Sidebar';
import CustomNode from './components/CustomNode';
import { ValidationPanel } from './components/ValidationPanel';
import { useFunnelLogic } from './hooks/useFunnelLogic';
import { NodeType } from '../../types';
import { Button } from '../../components/ui/Button';
import {
  Download,
  Upload,
  Trash2,
  LayoutTemplate,
  Save,
  Check,
  Undo,
  Redo,
  Menu,
  X,
} from 'lucide-react';
import { SNAP_GRID } from '../../constants';

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

const FunnelCanvasContent: React.FC = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { project, zoomIn, zoomOut, fitView } = useReactFlow();
  const [justSaved, setJustSaved] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showToolbar, setShowToolbar] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [showMinimap, setShowMinimap] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isHealthExpanded, setIsHealthExpanded] = useState(false);

  // Detect mobile/tablet screen size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setShowSidebar(false);
        setShowToolbar(false);
        setShowControls(false);
        setShowMinimap(false);
        setIsHealthExpanded(false);
      } else {
        setShowSidebar(true);
        setShowToolbar(true);
        setShowControls(true);
        setShowMinimap(true);
        setIsHealthExpanded(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    deleteSelected,
    deleteNodeById,
    saveFunnel,
    onExport,
    onImport,
    onClear,
    onLoadTemplate,
    validationIssues,
    undo,
    redo,
    canUndo,
    canRedo,
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
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement)
        return;

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
        switch (k) {
          case 'A':
            return NodeType.SALES; // 'A' for Add Sales Page
          case 'S':
            return NodeType.SALES; // 'S' alias for Sales Page
          case 'O':
            return NodeType.ORDER;
          case 'U':
            return NodeType.UPSELL;
          case 'D':
            return NodeType.DOWNSELL;
          case 'T':
            return NodeType.THANK_YOU;
          default:
            return null;
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

  // Mobile: Add node at center when tapping sidebar
  const handleMobileAddNode = useCallback(
    (nodeType: NodeType) => {
      if (reactFlowWrapper.current) {
        const { width, height } = reactFlowWrapper.current.getBoundingClientRect();
        // Add node at center of visible viewport
        const position = project({ x: width / 2, y: height / 2 });
        addNode(nodeType, position);
      }
    },
    [addNode, project]
  );

  // Listen for delete node events from CustomNode context menu
  useEffect(() => {
    const handleDeleteNode = (event: Event) => {
      const customEvent = event as CustomEvent<{ nodeId: string }>;
      const nodeId = customEvent.detail?.nodeId;
      if (typeof nodeId === 'string') {
        deleteNodeById(nodeId);
      }
    };

    window.addEventListener('deleteNode', handleDeleteNode);
    return () => window.removeEventListener('deleteNode', handleDeleteNode);
  }, [deleteNodeById]);

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
    <div className="relative h-full w-full bg-[#f8f9fa]">
      {/* Mobile: Top Bar with Title and Toggle Buttons */}
      {isMobile && (
        <div className="absolute left-4 right-4 top-4 z-50 flex items-center justify-between">
          {/* Title */}
          <div className="flex items-center rounded-md border-2 border-gray-900 bg-white px-3 py-2 font-['Architects_Daughter'] text-sm font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            Cartpanda
            {justSaved && <Check className="ml-2 h-4 w-4 text-green-600" />}
          </div>

          {/* Toggle Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowToolbar(!showToolbar)}
              className="rounded-lg border-2 border-gray-900 bg-white p-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-colors hover:bg-gray-100"
              title="Toggle Toolbar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="rounded-lg border-2 border-gray-900 bg-white p-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-colors hover:bg-gray-100"
              title="Toggle Sidebar"
            >
              <LayoutTemplate className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* 1. Top Center: Main Actions Toolbar */}
      {showToolbar && (
        <div
          className={`absolute top-4 z-50 ${isMobile ? 'left-4 right-4' : 'left-1/2 -translate-x-1/2 transform'}`}
        >
          <div
            className={`flex items-center gap-1 rounded-lg border-2 border-gray-900 bg-white p-1.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${isMobile ? 'flex-wrap justify-center' : ''}`}
          >
            {isMobile && (
              <button
                onClick={() => setShowToolbar(false)}
                className="absolute -right-2 -top-2 rounded-full border-2 border-gray-900 bg-red-600 p-1 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <Button
              variant="ghost"
              size="sm"
              icon={<Save className="h-4 w-4" />}
              onClick={handleSave}
              title="Save Project"
            >
              {!isMobile && 'Save'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={<Upload className="h-4 w-4" />}
              onClick={() => fileInputRef.current?.click()}
              title="Open JSON"
            >
              {!isMobile && 'Open'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={<Download className="h-4 w-4" />}
              onClick={onExport}
              title="Export JSON"
            >
              {!isMobile && 'Export'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={<LayoutTemplate className="h-4 w-4" />}
              onClick={() => void onLoadTemplate()}
              title="Load Template"
            >
              {!isMobile && 'Template'}
            </Button>
            <div className="mx-1 h-6 w-px bg-gray-200"></div>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
              icon={<Trash2 className="h-4 w-4" />}
              onClick={() => void onClear()}
              title="Clear Canvas"
            >
              {!isMobile && 'Clear'}
            </Button>
          </div>
        </div>
      )}

      {/* 2. Top Left: Title - Hidden on mobile */}
      {!isMobile && (
        <div className="absolute left-4 top-4 z-50 flex flex-col items-start gap-3">
          <div className="flex items-center rounded-md border-2 border-gray-900 bg-white px-3 py-2 font-['Architects_Daughter'] text-sm font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            Cartpanda Funnel
            {justSaved && <Check className="ml-2 h-4 w-4 text-green-600" />}
          </div>
        </div>
      )}

      <input type="file" ref={fileInputRef} onChange={onImport} accept=".json" className="hidden" />

      {/* 3. Floating Toolbar (Left Side) - Palette */}
      <Sidebar isVisible={showSidebar} onAddNode={handleMobileAddNode} isMobile={isMobile} />

      {/* Mobile: Small Controls Toggle Button - Bottom Right, hides when controls shown */}
      {isMobile && !showControls && (
        <button
          onClick={() => setShowControls(true)}
          className="absolute right-4 z-50 rounded-full border-2 border-gray-900 bg-white p-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:bg-gray-100"
          style={{ bottom: isHealthExpanded ? 'calc(1rem + 140px)' : 'calc(1rem + 70px)' }}
          title="Show Controls"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
            />
          </svg>
        </button>
      )}

      {/* Mobile: Floating buttons for Zoom, Minimap, Undo, Redo - Right Side Vertical */}
      {isMobile && showControls && (
        <div
          className="absolute right-4 z-50 flex flex-col gap-2 transition-all duration-300"
          style={{ bottom: isHealthExpanded ? 'calc(1rem + 140px)' : 'calc(1rem + 70px)' }}
        >
          {/* Zoom In */}
          <button
            onClick={() => zoomIn()}
            className="rounded-lg border-2 border-gray-900 bg-white p-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-colors hover:bg-gray-100"
            title="Zoom In"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
          {/* Zoom Out */}
          <button
            onClick={() => zoomOut()}
            className="rounded-lg border-2 border-gray-900 bg-white p-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-colors hover:bg-gray-100"
            title="Zoom Out"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          {/* Fit View */}
          <button
            onClick={() => fitView()}
            className="rounded-lg border-2 border-gray-900 bg-white p-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-colors hover:bg-gray-100"
            title="Fit View"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
          </button>
          {/* Minimap Toggle */}
          <button
            onClick={() => setShowMinimap(!showMinimap)}
            className={`rounded-lg border-2 border-gray-900 bg-white p-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-colors hover:bg-gray-100 ${showMinimap ? 'bg-blue-100' : ''}`}
            title="Toggle Minimap"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
          </button>
          {/* Undo */}
          <button
            onClick={undo}
            disabled={!canUndo}
            className="rounded-lg border-2 border-gray-900 bg-white p-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            title="Undo"
          >
            <Undo className="h-5 w-5" />
          </button>
          {/* Redo */}
          <button
            onClick={redo}
            disabled={!canRedo}
            className="rounded-lg border-2 border-gray-900 bg-white p-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            title="Redo"
          >
            <Redo className="h-5 w-5" />
          </button>
          {/* Close Button */}
          <button
            onClick={() => setShowControls(false)}
            className="rounded-lg border-2 border-gray-900 bg-red-600 p-2 text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-colors hover:bg-red-700"
            title="Hide Controls"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Main Workspace */}
      <div className="absolute inset-0" ref={reactFlowWrapper}>
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
          panOnDrag={true}
          zoomOnPinch={true}
          panOnScroll={false}
          className="bg-[#f8f9fa]"
          defaultEdgeOptions={{
            type: 'smoothstep',
            style: { strokeWidth: 2, stroke: '#1a1a1a', strokeDasharray: '5,5' },
            animated: false,
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 20,
              height: 20,
              color: '#1a1a1a',
            },
          }}
          connectionLineStyle={{ stroke: '#1a1a1a', strokeWidth: 2, strokeDasharray: '5,5' }}
        >
          <Background color="#ccc" gap={20} variant={BackgroundVariant.Dots} size={2} />

          {!isMobile && (
            <Controls position="top-right" showInteractive={false} className="!m-4">
              <ControlButton onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)">
                <Undo className="h-4 w-4" />
              </ControlButton>
              <ControlButton onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Y)">
                <Redo className="h-4 w-4" />
              </ControlButton>
            </Controls>
          )}

          {showMinimap && (
            <MiniMap
              className={
                isMobile
                  ? `!left-1/2 !m-0 !h-[150px] !w-[200px] !-translate-x-1/2 transition-all duration-300 ${isHealthExpanded ? '!bottom-[240px]' : '!bottom-[120px]'}`
                  : '!m-4'
              }
              position="bottom-right"
              zoomable
              pannable
              nodeStrokeColor="#1a1a1a"
              nodeColor={(n) => {
                const type = (n.data as { type: NodeType }).type;
                // Simple pastel map
                switch (type) {
                  case NodeType.SALES:
                    return '#a5d8ff';
                  case NodeType.ORDER:
                    return '#bac8ff';
                  case NodeType.UPSELL:
                    return '#b2f2bb';
                  case NodeType.DOWNSELL:
                    return '#ffc9c9';
                  case NodeType.THANK_YOU:
                    return '#e9ecef';
                  default:
                    return '#fff';
                }
              }}
              nodeBorderRadius={4}
              maskColor="rgba(240, 240, 240, 0.6)"
            />
          )}
        </ReactFlow>
      </div>

      <ValidationPanel issues={validationIssues} onExpandChange={setIsHealthExpanded} />
    </div>
  );
};

export const FunnelCanvas: React.FC = () => (
  <ReactFlowProvider>
    <FunnelCanvasContent />
  </ReactFlowProvider>
);
