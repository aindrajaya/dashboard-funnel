import React from 'react';
import { ValidationIssue } from '../../../types';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface ValidationPanelProps {
  issues: ValidationIssue[];
}

export const ValidationPanel: React.FC<ValidationPanelProps> = ({ issues }) => {
  return (
    <div className="absolute bottom-4 left-4 z-50 max-w-sm w-full font-['Architects_Daughter']">
      <div className="bg-white rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-gray-900 overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 border-b-2 border-gray-900 flex items-center justify-between">
          <span className="text-sm font-bold text-gray-900">Funnel Health</span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border border-gray-900 ${issues.length === 0 ? 'bg-[#b2f2bb] text-gray-900' : 'bg-[#ffc9c9] text-gray-900'}`}>
            {issues.length} Issues
          </span>
        </div>
        
        <div className="max-h-48 overflow-y-auto p-2">
          {issues.length === 0 ? (
            <div className="flex items-center p-2 text-gray-900 text-sm">
              <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
              All good! Funnel is valid.
            </div>
          ) : (
            <ul className="space-y-1">
              {issues.map((issue, idx) => (
                <li key={idx} className="flex items-start p-2 rounded hover:bg-gray-50 transition-colors">
                  <AlertTriangle className="w-4 h-4 text-orange-500 mr-2 mt-0.5 shrink-0" />
                  <span className="text-sm text-gray-800">{issue.message}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};