import React from 'react';
import { NodeType } from '../../../types';
import { NODE_CONFIG } from '../../../constants';

export const Sidebar: React.FC = () => {
  const onDragStart = (event: React.DragEvent, nodeType: NodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="absolute top-20 left-4 z-40">
      <div className="bg-white rounded-lg border-2 border-gray-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-2 flex flex-col items-center gap-2">
        <div className="text-[10px] font-bold text-gray-400 font-['Architects_Daughter'] uppercase tracking-wider mb-1">
          Add
        </div>
        
        {Object.entries(NODE_CONFIG).map(([type, config]) => (
          <div
            key={type}
            className={`
              group relative flex flex-col items-center justify-center w-10 h-10 rounded-md
              cursor-grab hover:bg-gray-100 transition-all duration-200
            `}
            draggable
            onDragStart={(event) => onDragStart(event, type as NodeType)}
          >
            <div className={`p-1.5 rounded-md border border-gray-900 bg-white group-hover:shadow-sm ${config.color.split(' ')[0]}`}>
              {config.icon}
            </div>
            <span className="sr-only">{config.label}</span>
            
            {/* Rich Tooltip - Appears to the RIGHT now */}
            <div className="absolute left-full top-0 ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white border-2 border-gray-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-gray-900 text-xs px-3 py-2 rounded pointer-events-none w-max z-50 flex flex-col items-start">
               <span className="font-['Architects_Daughter'] font-bold text-sm mb-0.5">{config.label}</span>
               <span className="font-['Inter'] text-[10px] text-gray-500 uppercase tracking-wider font-semibold">{config.description}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};