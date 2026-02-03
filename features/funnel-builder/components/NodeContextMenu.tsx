import React, { useEffect, useRef } from 'react';
import { Trash2, Edit3, X } from 'lucide-react';

interface NodeContextMenuProps {
  x: number;
  y: number;
  nodeId: string;
  nodeLabel: string;
  onDelete: () => void;
  onRename: () => void;
  onClose: () => void;
}

const NodeContextMenu: React.FC<NodeContextMenuProps> = ({
  x,
  y,
  nodeLabel,
  onDelete,
  onRename,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [onClose]);

  // Adjust position if menu goes off-screen
  const adjustedY = y + 200 > window.innerHeight ? y - 200 : y;
  const adjustedX = x + 200 > window.innerWidth ? x - 200 : x;

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[200px] rounded-lg border-2 border-gray-900 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
      style={{
        top: `${adjustedY}px`,
        left: `${adjustedX}px`,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-gray-900 bg-yellow-100 p-3">
        <p className="font-['Architects_Daughter'] text-sm font-bold text-gray-900">{nodeLabel}</p>
        <button
          onClick={onClose}
          className="rounded-full p-1 transition-colors hover:bg-yellow-200"
          aria-label="Close menu"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Menu Items */}
      <div className="p-2">
        <button
          onClick={() => {
            onRename();
            onClose();
          }}
          className="flex w-full items-center gap-3 rounded-md border-2 border-transparent p-3 text-left transition-all hover:border-gray-900 hover:bg-blue-50 active:scale-95"
        >
          <Edit3 className="h-5 w-5 text-blue-600" />
          <span className="font-sans text-sm font-medium text-gray-900">Rename</span>
        </button>

        <button
          onClick={() => {
            onDelete();
            onClose();
          }}
          className="flex w-full items-center gap-3 rounded-md border-2 border-transparent p-3 text-left transition-all hover:border-gray-900 hover:bg-red-50 active:scale-95"
        >
          <Trash2 className="h-5 w-5 text-red-600" />
          <span className="font-sans text-sm font-medium text-gray-900">Delete</span>
        </button>
      </div>
    </div>
  );
};

export default NodeContextMenu;
