import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { FunnelNodeData, NodeType } from '../../../types';
import { NODE_CONFIG } from '../../../constants';
import { AlertCircle } from 'lucide-react';

const CustomNode: React.FC<NodeProps<FunnelNodeData>> = ({ data, selected }) => {
  const config = NODE_CONFIG[data.type];
  
  // Rules for handles
  const isTarget = data.type !== NodeType.SALES;
  const isSource = data.type !== NodeType.THANK_YOU;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${data.label} node`}
      className={`
        relative min-w-[140px] rounded-lg border-2 bg-white transition-transform duration-200
        ${config.color}
        ${selected ? 'ring-2 ring-blue-400' : ''}
        ${data.isInvalid ? 'ring-2 ring-red-500' : ''}
        shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
        active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
      `}
    >
      {/* Input Handle */}
      {isTarget && (
        <Handle
          type="target"
          position={Position.Top}
          className="!w-3 !h-3 !bg-white !border-2 !border-gray-900 !rounded-sm hover:!bg-blue-400 transition-colors"
        />
      )}

      {/* Body */}
      <div className="p-3 flex flex-col items-center text-center">
        <div className="mb-2 p-1.5 rounded-md border-2 border-gray-900 bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]">
            {config.icon}
        </div>
        
        <p className="text-sm font-bold text-gray-900 leading-tight font-['Architects_Daughter'] mb-2">
          {data.label}
        </p>

        {/* Action Button */}
        <button 
            className="px-3 py-1 bg-white/50 border border-gray-900/20 rounded-full hover:bg-white hover:border-gray-900 transition-colors cursor-pointer"
            onClick={(e) => {
                e.stopPropagation();
                alert(`Opening editor for: ${data.label}`);
            }}
        >
            <span className="text-[10px] font-bold text-gray-700 font-sans uppercase tracking-wide">
                Edit Page
            </span>
        </button>
        
        {data.isInvalid && (
           <div className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 border-2 border-gray-900 z-10">
             <AlertCircle className="w-4 h-4" />
           </div>
        )}
      </div>

      {/* Output Handle */}
      {isSource && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!w-3 !h-3 !bg-white !border-2 !border-gray-900 !rounded-sm hover:!bg-blue-400 transition-colors"
        />
      )}
    </div>
  );
};

export default memo(CustomNode);