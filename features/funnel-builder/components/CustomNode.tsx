import React, { memo, useState, useRef, useCallback, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { FunnelNodeData, NodeType } from '../../../types';
import { NODE_CONFIG } from '../../../constants';
import { AlertCircle, Trash2, Edit3 } from 'lucide-react';
import { showToast } from '../../../src/lib/toast';

const CustomNode: React.FC<NodeProps<FunnelNodeData>> = ({ data, selected, id }) => {
  const config = NODE_CONFIG[data.type];
  const [showActions, setShowActions] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const touchStartPos = useRef({ x: 0, y: 0 });
  const nodeRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  // Rules for handles
  const isTarget = data.type !== NodeType.SALES;
  const isSource = data.type !== NodeType.THANK_YOU;

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      touchStartPos.current = { x: touch.clientX, y: touch.clientY };

      console.log('Touch start on node:', data.label);

      // Start long-press timer (500ms)
      longPressTimer.current = setTimeout(() => {
        console.log('Long press activated for:', data.label);
        // Trigger haptic feedback if available
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }

        setShowActions(true);
      }, 500);
    },
    [data.label]
  );

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    // Cancel long-press if finger moves too much
    const touch = e.touches[0];
    const moveDistance = Math.sqrt(
      Math.pow(touch.clientX - touchStartPos.current.x, 2) +
        Math.pow(touch.clientY - touchStartPos.current.y, 2)
    );

    if (moveDistance > 10 && longPressTimer.current) {
      console.log('Touch moved too much, cancelling long press:', moveDistance);
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    // Clear timer if touch ends before long-press completes
    if (longPressTimer.current) {
      console.log('Touch ended before long press completed');
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleDelete = useCallback(() => {
    showToast.success(`Delete ${data.label}`);
    // Dispatch custom event that FunnelCanvas can listen to
    window.dispatchEvent(new CustomEvent('deleteNode', { detail: { nodeId: id } }));
    setShowActions(false);
  }, [data.label, id]);

  const handleRename = useCallback(() => {
    showToast.info(`Rename functionality for: ${data.label}`);
    setShowActions(false);
    // TODO: Implement rename modal
  }, [data.label]);

  // Auto-hide actions after 5 seconds
  useEffect(() => {
    console.log('showActions changed to:', showActions);
    if (showActions) {
      const timer = setTimeout(() => {
        console.log('Auto-hiding actions after 5 seconds');
        setShowActions(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showActions]);

  // Close actions when clicking/tapping outside
  useEffect(() => {
    if (showActions) {
      const handleClickOutside = (e: MouseEvent | TouchEvent) => {
        const target = e.target as Node;
        // Don't close if clicking on the node or action buttons
        if (nodeRef.current?.contains(target) || actionsRef.current?.contains(target)) {
          return;
        }
        setShowActions(false);
      };

      // Use a small delay to avoid immediate close from the same touch
      const timer = setTimeout(() => {
        document.addEventListener('touchstart', handleClickOutside);
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);

      return () => {
        clearTimeout(timer);
        document.removeEventListener('touchstart', handleClickOutside);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showActions]);

  return (
    <>
      <div
        ref={nodeRef}
        role="button"
        tabIndex={0}
        aria-label={`${data.label} node`}
        className={`relative min-w-[140px] rounded-lg border-2 bg-white transition-transform duration-200 ${config.color} ${selected ? 'ring-2 ring-blue-400' : ''} ${data.isInvalid ? 'ring-2 ring-red-500' : ''} ${showActions ? 'scale-105 ring-4 ring-blue-500' : ''} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}
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

        {/* Action Buttons - Show on long press */}
        {showActions && (
          <div
            ref={actionsRef}
            className="animate-in fade-in zoom-in absolute -bottom-14 left-1/2 z-50 flex -translate-x-1/2 gap-2 duration-200"
            onTouchStart={(e) => e.stopPropagation()}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRename();
              }}
              onTouchStart={(e) => e.stopPropagation()}
              className="flex items-center gap-2 rounded-lg border-2 border-gray-900 bg-blue-500 px-4 py-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-blue-600 active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
              aria-label="Rename node"
            >
              <Edit3 className="h-5 w-5 text-white" />
              <span className="font-sans text-sm font-bold text-white">Rename</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              onTouchStart={(e) => e.stopPropagation()}
              className="flex items-center gap-2 rounded-lg border-2 border-gray-900 bg-red-500 px-4 py-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-red-600 active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
              aria-label="Delete node"
            >
              <Trash2 className="h-5 w-5 text-white" />
              <span className="font-sans text-sm font-bold text-white">Delete</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default memo(CustomNode);
