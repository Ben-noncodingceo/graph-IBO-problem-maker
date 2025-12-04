import React, { useState } from 'react';
import { useAppStore, useTranslation } from '../store/useAppStore';
import { QuestionCard } from './QuestionCard';
import { Calendar, ChevronDown, ChevronRight } from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const { history } = useAppStore();
  const { t } = useTranslation();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const stopwords = new Set(['the','and','for','with','from','into','this','that','have','has','are','was','were','will','shall','of','in','on','at','to','by','or','an','a','as']);
  const tokens: Record<string, number> = {};
  history.forEach(h => {
    const texts = [h.paperTitle, h.subject, ...(h.keywords || []), ...h.questions.flatMap((q: any) => [q.scenario, q.context, q.explanation])];
    texts.forEach(txt => {
      if (!txt) return;
      String(txt).toLowerCase().split(/[^a-z0-9]+/).forEach(w => {
        if (w && w.length >= 3 && !stopwords.has(w)) tokens[w] = (tokens[w] || 0) + 1;
      });
    });
  });
  const popular = Object.entries(tokens).sort((a,b) => b[1]-a[1]).slice(0,10).map(([w]) => w);

  const matches = (h: any): boolean => {
    if (!query) return true;
    const q = query.toLowerCase();
    const fields = [h.paperTitle, h.subject, ...(h.keywords || []), ...h.questions.flatMap((x: any) => [x.id, x.scenario, x.context, x.explanation, x.paperUrl])];
    return fields.some((f: any) => f && String(f).toLowerCase().includes(q));
  };
  const filtered = history.filter(matches);

  return (
    <div className="space-y-6 animate-in fade-in">
      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <HistoryIcon className="w-6 h-6 text-blue-600" />
        {t.historyTitle}
      </h2>

      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-3">
        <label className="text-sm font-medium text-gray-700">{t.historySearch}</label>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.historySearchPlaceholder}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm"
        />
        {popular.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-gray-500">{t.popularKeywords}:</span>
            {popular.map((w) => (
              <button key={w} onClick={() => setQuery(w)} className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100">
                {w}
              </button>
            ))}
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <HistoryIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">{t.noHistory}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((entry) => (
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
