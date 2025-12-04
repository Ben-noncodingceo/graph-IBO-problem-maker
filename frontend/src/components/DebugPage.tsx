import React from 'react';
import { useAppStore, useTranslation } from '../store/useAppStore';
import { Trash2, AlertCircle, Info, Server } from 'lucide-react';

export const DebugPage: React.FC = () => {
  const { logs, clearLogs } = useAppStore();
  const { t } = useTranslation();

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BugIcon className="w-6 h-6 text-gray-700" />
          {t.debugTitle}
        </h2>
        <button
          onClick={clearLogs}
          className="flex items-center gap-2 text-red-600 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
        >
          <Trash2 className="w-4 h-4" />
          {t.clearLogs}
        </button>
      </div>

      <div className="bg-gray-900 rounded-xl overflow-hidden shadow-lg border border-gray-800 font-mono text-sm">
        {logs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {t.noLogs}
          </div>
        ) : (
          <div className="divide-y divide-gray-800 max-h-[600px] overflow-y-auto">
            {logs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-gray-800 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  {log.type === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
                  {log.type === 'info' && <Info className="w-4 h-4 text-blue-400" />}
                  {log.type === 'api' && <Server className="w-4 h-4 text-green-400" />}
                  <span className="text-gray-500 text-xs">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span className={`font-bold ${
                    log.type === 'error' ? 'text-red-400' : 
                    log.type === 'api' ? 'text-green-400' : 'text-blue-300'
                  }`}>
                    [{log.type.toUpperCase()}]
                  </span>
                </div>
                <div className="text-gray-300 break-words whitespace-pre-wrap pl-6">
                  {log.message}
                </div>
                {log.details && (
                  <div className="mt-2 pl-6">
                    <details>
                      <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-300">View Details</summary>
                      <pre className="mt-2 p-2 bg-black rounded text-xs text-green-500 overflow-x-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const BugIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="8" height="14" x="8" y="6" rx="4"/><path d="m19 7-3 2"/><path d="m5 7 3 2"/><path d="m19 19-3-2"/><path d="m5 19 3-2"/><path d="M20 13h-4"/><path d="M4 13h4"/><path d="m10 4 1 2"/><path d="m14 4-1 2"/></svg>
);
