import React, { useState, useEffect } from 'react';
import { ValidationIssue } from '../../../types';
import { AlertTriangle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface ValidationPanelProps {
  issues: ValidationIssue[];
  onExpandChange?: (isExpanded: boolean) => void;
}

export const ValidationPanel: React.FC<ValidationPanelProps> = ({ issues, onExpandChange }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsExpanded(false);
      } else {
        setIsExpanded(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleToggle = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    if (onExpandChange) {
      onExpandChange(newExpanded);
    }
  };

  return (
    <div className="absolute bottom-4 left-4 right-4 z-50 w-auto font-['Architects_Daughter'] md:right-auto md:w-full md:max-w-sm">
      {/* Funnel Health Panel */}
      <div className="overflow-hidden rounded-lg border-2 border-gray-900 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center justify-between border-b-2 border-gray-900 bg-gray-50 px-4 py-2">
          <span className="text-sm font-bold text-gray-900">Funnel Health</span>
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full border border-gray-900 px-2 py-0.5 text-xs font-bold ${issues.length === 0 ? 'bg-[#b2f2bb] text-gray-900' : 'bg-[#ffc9c9] text-gray-900'}`}
            >
              {issues.length} Issues
            </span>
            {isMobile && (
              <button
                onClick={handleToggle}
                className="rounded p-1 transition-colors hover:bg-gray-200"
                aria-label={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
        </div>

        {isExpanded && (
          <div className="max-h-32 overflow-y-auto p-2 md:max-h-48">
            {issues.length === 0 ? (
              <div className="flex items-center p-2 text-sm text-gray-900">
                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                All good! Funnel is valid.
              </div>
            ) : (
              <ul className="space-y-1">
                {issues.map((issue, idx) => (
                  <li
                    key={idx}
                    className="flex items-start rounded p-2 transition-colors hover:bg-gray-50"
                  >
                    <AlertTriangle className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                    <span className="text-sm text-gray-800">{issue.message}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
