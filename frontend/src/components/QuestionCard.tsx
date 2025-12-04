import React, { useState } from 'react';
import { Question } from '../services/api';
import { ChevronUp, CheckCircle, HelpCircle } from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  index: number;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ question, index }) => {
  const [showAnswer, setShowAnswer] = useState(false);

  const difficultyColor = {
    'Easy': 'bg-green-100 text-green-800',
    'Medium': 'bg-yellow-100 text-yellow-800',
    'Hard': 'bg-red-100 text-red-800'
  }[question.difficulty] || 'bg-gray-100 text-gray-800';

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${difficultyColor}`}>
            {question.difficulty}
          </span>
          <span className="text-sm text-gray-500 font-mono">ID: {question.id.split('-').pop()}</span>
        </div>

        <div className="prose max-w-none text-gray-900 mb-6">
          <p className="font-medium text-lg">{index + 1}. {question.scenario}</p>
        </div>

        <div className="space-y-3">
          {question.options.map((opt, i) => {
            const label = String.fromCharCode(65 + i); // A, B, C, D
            const isCorrect = label === question.correctAnswer;
            
            return (
              <div 
                key={i}
                className={`flex items-start p-3 rounded-lg border transition-all ${
                  showAnswer && isCorrect 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-gray-50 border-transparent'
                }`}
              >
                <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold mr-3 shrink-0 ${
                  showAnswer && isCorrect ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}>
                  {label}
                </span>
                <span className={showAnswer && isCorrect ? 'text-green-900 font-medium' : 'text-gray-700'}>
                  {opt}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
        <button
          onClick={() => setShowAnswer(!showAnswer)}
          className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          {showAnswer ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Hide Answer & Analysis
            </>
          ) : (
            <>
              <HelpCircle className="w-4 h-4" />
              Show Answer & Analysis
            </>
          )}
        </button>

        {showAnswer && (
          <div className="mt-4 pt-4 border-t border-gray-200 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2 mb-2 text-green-700 font-bold">
              <CheckCircle className="w-5 h-5" />
              Correct Answer: {question.correctAnswer}
            </div>
            <div className="text-gray-700 bg-white p-4 rounded-lg border border-gray-200 text-sm leading-relaxed">
              <h4 className="font-semibold mb-1 text-gray-900">Analysis:</h4>
              {question.explanation}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
