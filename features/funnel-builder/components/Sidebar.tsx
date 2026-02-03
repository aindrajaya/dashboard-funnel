import React from 'react';
import { NodeType } from '../../../types';
import { NODE_CONFIG } from '../../../constants';

interface SidebarProps {
  isVisible: boolean;
  onAddNode?: (nodeType: NodeType) => void;
  isMobile?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isVisible, onAddNode, isMobile = false }) => {
  const onDragStart = (event: React.DragEvent, nodeType: NodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleClick = (nodeType: NodeType) => {
    if (isMobile && onAddNode) {
      onAddNode(nodeType);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="absolute left-4 top-20 z-40">
      <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-gray-900 bg-white p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="mb-1 font-['Architects_Daughter'] text-[10px] font-bold uppercase tracking-wider text-gray-400">
          {isMobile ? 'Tap to Add' : 'Add'}
        </div>

        {Object.entries(NODE_CONFIG).map(([type, config]) => (
          <div
            key={type}
            className={`group relative flex h-10 w-10 ${isMobile ? 'cursor-pointer' : 'cursor-grab'} flex-col items-center justify-center rounded-md transition-all duration-200 hover:bg-gray-100 active:scale-95`}
            draggable={!isMobile}
            onDragStart={(event) => !isMobile && onDragStart(event, type as NodeType)}
            onClick={() => handleClick(type as NodeType)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleClick(type as NodeType);
              }
            }}
          >
            <div
              className={`rounded-md border border-gray-900 bg-white p-1.5 group-hover:shadow-sm ${config.color.split(' ')[0]}`}
            >
              {config.icon}
            </div>
            <span className="sr-only">{config.label}</span>

            {/* Rich Tooltip - Appears to the RIGHT now */}
            <div className="pointer-events-none absolute left-full top-0 z-50 ml-3 flex w-max flex-col items-start rounded border-2 border-gray-900 bg-white px-3 py-2 text-xs text-gray-900 opacity-0 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-opacity duration-200 group-hover:opacity-100">
              <span className="mb-0.5 font-['Architects_Daughter'] text-sm font-bold">
                {config.label}
              </span>
              <span className="font-['Inter'] text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                {config.description}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
