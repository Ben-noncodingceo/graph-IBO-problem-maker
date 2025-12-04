import React, { useState } from 'react';
import { Paper } from '../services/api';
import { Calendar, User, ArrowRight, FileText, Image as ImageIcon, Calculator } from 'lucide-react';
import { useTranslation } from '../store/useAppStore';

interface PaperListProps {
  papers: Paper[];
  onSelect: (paper: Paper, mode: 'text' | 'image' | 'analysis') => void;
  isGenerating: boolean;
}

export const PaperList: React.FC<PaperListProps> = ({ papers, onSelect, isGenerating }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-900">Found {papers.length} Research Papers</h3>
      <div className="grid gap-4">
        {papers.map((paper, idx) => (
          <PaperItem 
            key={idx} 
            paper={paper} 
            onSelect={onSelect} 
            isGenerating={isGenerating} 
          />
        ))}
      </div>
    </div>
  );
};

const PaperItem: React.FC<{ 
  paper: Paper; 
  onSelect: (paper: Paper, mode: 'text' | 'image' | 'analysis') => void;
  isGenerating: boolean;
}> = ({ paper, onSelect, isGenerating }) => {
  const [mode, setMode] = useState<'text' | 'image' | 'analysis'>('text');
  const { t } = useTranslation();

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="space-y-2 flex-1">
          <h4 className="font-semibold text-lg text-blue-800 leading-tight">
            <a href={paper.link} target="_blank" rel="noopener noreferrer" className="hover:underline">
              {paper.title}
            </a>
          </h4>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {paper.year}</span>
            <span className="flex items-center gap-1"><User className="w-4 h-4" /> {paper.authors}</span>
          </div>
          <p className="text-gray-600 text-sm line-clamp-2">{paper.snippet}</p>
        </div>
        
        <div className="flex flex-col items-end gap-3 shrink-0 w-full sm:w-auto">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setMode('text')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                mode === 'text' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FileText className="w-3 h-3" />
              {t.textMode}
            </button>
            <button
              onClick={() => setMode('image')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                mode === 'image' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <ImageIcon className="w-3 h-3" />
              {t.imageMode}
            </button>
            <button
              onClick={() => setMode('analysis')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                mode === 'analysis' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Calculator className="w-3 h-3" />
              {t.analysisMode}
            </button>
          </div>

          <button
            onClick={() => onSelect(paper, mode)}
            disabled={isGenerating}
            className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            Generate Questions
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
