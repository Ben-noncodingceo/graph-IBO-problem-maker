import React, { useState } from 'react';
import { Question } from '../services/api';
import { ChevronUp, CheckCircle, HelpCircle, FileText, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import { useTranslation } from '../store/useAppStore';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { buildImageProxyUrl } from '../services/api';
import { ZoomIn, ZoomOut } from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  index: number;
  requestedMode?: 'text' | 'image';
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ question, index, requestedMode = 'text' }) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const { t } = useTranslation();
  const [imgLoading, setImgLoading] = useState<boolean>(false);
  const [imgError, setImgError] = useState<boolean>(false);
  const [imgSrc, setImgSrc] = useState<string | undefined>(question.figureUrl);
  const [zoom, setZoom] = useState<boolean>(false);

  const difficultyColor = {
    'Easy': 'bg-green-100 text-green-800',
    'Medium': 'bg-yellow-100 text-yellow-800',
    'Hard': 'bg-red-100 text-red-800'
  }[question.difficulty] || 'bg-gray-100 text-gray-800';

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Context / Material Section */}
      {(question.context || question.figureUrl || (requestedMode === 'image')) && (
        <div className="bg-slate-50 border-b border-gray-200 p-6">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            {question.figureUrl ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
            {t.contextTitle}
          </h4>
          
          {imgSrc && (
            <div className="mb-4">
              <img 
                src={imgSrc} 
                alt={t.imageAlt} 
                className={"rounded-lg border border-gray-200 object-contain bg-white mx-auto " + (zoom ? 'max-h-[600px] w-full' : 'max-h-64')}
                onLoad={() => { setImgLoading(false); setImgError(false); }}
                onError={() => {
                  if (!imgError && question.figureUrl) {
                    setImgError(true);
                    setImgLoading(true);
                    setImgSrc(buildImageProxyUrl(question.figureUrl));
                  } else {
                    setImgSrc(undefined);
                    setImgLoading(false);
                  }
                }}
              />
              <div className="flex items-center justify-center gap-2 mt-2">
                <button onClick={() => setZoom(true)} className="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-50 flex items-center gap-1">
                  <ZoomIn className="w-3 h-3" /> 放大
                </button>
                <button onClick={() => setZoom(false)} className="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-50 flex items-center gap-1">
                  <ZoomOut className="w-3 h-3" /> 缩小
                </button>
              </div>
              {imgLoading && (
                <p className="text-center text-xs text-gray-500 mt-2">Loading image...</p>
              )}
              <p className="text-center text-xs text-gray-500 mt-2 italic">
                {t.figureCaption}
                {question.figureSource ? (
                  <>
                    {' · '}
                    {t.figureSourceLabel}: <a href={question.figureSource} target="_blank" rel="noreferrer" className="underline">{question.figureSource}</a>
                  </>
                ) : null}
              </p>
            </div>
          )}

          {!question.figureUrl && requestedMode === 'image' && (
            <div className="mb-4 flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs">{t.imageFallbackMessage}</span>
            </div>
          )}
          
          {question.context && (
            <div className="text-sm text-slate-700 leading-relaxed font-serif bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                {question.context}
              </ReactMarkdown>
            </div>
          )}
        </div>
      )}

      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${difficultyColor}`}>
            {t.difficulty[question.difficulty as keyof typeof t.difficulty] || question.difficulty}
          </span>
          <span className="text-sm text-gray-500 font-mono">ID: {question.id.split('-').pop()}</span>
        </div>

        <div className="prose max-w-none text-gray-900 mb-6">
          <p className="font-medium text-lg">
            <span className="text-gray-400 mr-2">{index + 1}.</span>
            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
              {question.scenario}
            </ReactMarkdown>
          </p>
        </div>

        <div className="space-y-3">
          {question.options.map((opt, i) => {
            const label = String.fromCharCode(65 + i); // A, B, C, D
            const isCorrect = label === question.correctAnswer;
            
            return (
              <div 
                key={i}
                className={`flex items-start p-3 rounded-lg border transition-all cursor-default ${
                  showAnswer && isCorrect 
                    ? 'bg-green-50 border-green-200 ring-1 ring-green-200' 
                    : 'bg-white border-gray-200 hover:border-blue-300'
                }`}
              >
                <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold mr-3 shrink-0 ${
                  showAnswer && isCorrect ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {label}
                </span>
                <span className={showAnswer && isCorrect ? 'text-green-900 font-medium' : 'text-gray-700'}>
                  <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {opt}
                  </ReactMarkdown>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
        <button
          onClick={() => setShowAnswer(!showAnswer)}
          className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors w-full sm:w-auto justify-center sm:justify-start"
        >
          {showAnswer ? (
            <>
              <ChevronUp className="w-4 h-4" />
              {t.hideAnswer}
            </>
          ) : (
            <>
              <HelpCircle className="w-4 h-4" />
              {t.showAnswer}
            </>
          )}
        </button>

        {showAnswer && (
          <div className="mt-4 pt-4 border-t border-gray-200 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2 mb-2 text-green-700 font-bold">
              <CheckCircle className="w-5 h-5" />
              {t.correctAnswerLabel} {question.correctAnswer}
            </div>
            <div className="text-gray-700 bg-white p-4 rounded-lg border border-gray-200 text-sm leading-relaxed shadow-sm">
              <h4 className="font-semibold mb-2 text-gray-900 flex items-center gap-2">
                {t.analysisTitle}
              </h4>
              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                {question.explanation}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
