import React, { useState } from 'react';
import { useAppStore, useTranslation } from '../store/useAppStore';
import { QuestionCard } from './QuestionCard';
import { Calendar, ChevronDown, ChevronRight } from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const { history } = useAppStore();
  const { t } = useTranslation();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <HistoryIcon className="w-6 h-6 text-blue-600" />
        {t.historyTitle}
      </h2>

      {history.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <HistoryIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">{t.noHistory}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((entry) => (
            <div key={entry.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <button
                onClick={() => toggleExpand(entry.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 text-sm text-gray-500 mb-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(entry.timestamp).toLocaleDateString()}
                    </span>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                      {entry.subject}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 truncate pr-4">
                    {entry.paperTitle}
                  </h3>
                </div>
                <div className="ml-4 text-gray-400">
                  {expandedId === entry.id ? (
                    <ChevronDown className="w-5 h-5" />
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                </div>
              </button>

              {expandedId === entry.id && (
                <div className="border-t border-gray-100 p-4 bg-gray-50 space-y-6">
                  {entry.questions.map((q: any, idx: number) => (
                    <QuestionCard key={idx} question={q} index={idx} requestedMode={entry.mode || 'text'} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const HistoryIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 12"/><path d="M3 3v9h9"/><path d="M12 7v5l4 2"/></svg>
);
