import React, { memo, useState, useRef, useCallback } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { FunnelNodeData, NodeType } from '../../../types';
import { NODE_CONFIG } from '../../../constants';
import { AlertCircle } from 'lucide-react';
import { showToast } from '../../../src/lib/toast';
import NodeContextMenu from './NodeContextMenu';

const CustomNode: React.FC<NodeProps<FunnelNodeData>> = ({ data, selected, id }) => {
  const config = NODE_CONFIG[data.type];
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const touchStartPos = useRef({ x: 0, y: 0 });

  // Rules for handles
  const isTarget = data.type !== NodeType.SALES;
  const isSource = data.type !== NodeType.THANK_YOU;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };

    // Start long-press timer (500ms)
    longPressTimer.current = setTimeout(() => {
      // Trigger haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }

      setMenuPosition({ x: touch.clientX, y: touch.clientY });
      setShowContextMenu(true);
    }, 500);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    // Cancel long-press if finger moves too much
    const touch = e.touches[0];
    const moveDistance = Math.sqrt(
      Math.pow(touch.clientX - touchStartPos.current.x, 2) +
        Math.pow(touch.clientY - touchStartPos.current.y, 2)
    );

    if (moveDistance > 10 && longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    // Clear timer if touch ends before long-press completes
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleDelete = useCallback(() => {
    // This will be handled by ReactFlow's onNodesDelete
    // We need to get the deleteElements function from ReactFlow
    showToast.success(`Delete ${data.label}`);
    // Dispatch custom event that FunnelCanvas can listen to
    window.dispatchEvent(new CustomEvent('deleteNode', { detail: { nodeId: id } }));
  }, [data.label, id]);

  const handleRename = useCallback(() => {
    showToast.info(`Rename functionality for: ${data.label}`);
    // TODO: Implement rename modal
  }, [data.label]);

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-label={`${data.label} node`}
        className={`relative min-w-[140px] rounded-lg border-2 bg-white transition-transform duration-200 ${config.color} ${selected ? 'ring-2 ring-blue-400' : ''} ${data.isInvalid ? 'ring-2 ring-red-500' : ''} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Input Handle */}
        {isTarget && (
          <Handle
            type="target"
            position={Position.Top}
            className="!h-3 !w-3 !rounded-sm !border-2 !border-gray-900 !bg-white transition-colors hover:!bg-blue-400"
          />
        )}

        {/* Body */}
        <div className="flex flex-col items-center p-3 text-center">
          <div className="mb-2 rounded-md border-2 border-gray-900 bg-white p-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]">
            {config.icon}
          </div>

          <p className="mb-2 font-['Architects_Daughter'] text-sm font-bold leading-tight text-gray-900">
            {data.label}
          </p>

          {/* Action Button */}
          <button
            className="cursor-pointer rounded-full border border-gray-900/20 bg-white/50 px-3 py-1 transition-colors hover:border-gray-900 hover:bg-white"
            onClick={(e) => {
              e.stopPropagation();
              showToast.info(`Opening editor for: ${data.label}`);
            }}
          >
            <span className="font-sans text-[10px] font-bold uppercase tracking-wide text-gray-700">
              Edit Page
            </span>
          </button>

          {data.isInvalid && (
            <div className="absolute -right-2 -top-2 z-10 rounded-full border-2 border-gray-900 bg-red-100 p-1 text-red-600">
              <AlertCircle className="h-4 w-4" />
            </div>
          )}
        </div>

        {/* Output Handle */}
        {isSource && (
          <Handle
            type="source"
            position={Position.Bottom}
            className="!h-3 !w-3 !rounded-sm !border-2 !border-gray-900 !bg-white transition-colors hover:!bg-blue-400"
          />
        )}
      </div>

      {/* Context Menu */}
      {showContextMenu && (
        <NodeContextMenu
          x={menuPosition.x}
          y={menuPosition.y}
          nodeId={id}
          nodeLabel={data.label}
          onDelete={handleDelete}
          onRename={handleRename}
          onClose={() => setShowContextMenu(false)}
        />
      )}
    </>
  );
};

export default memo(CustomNode);
