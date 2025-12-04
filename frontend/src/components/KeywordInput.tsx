import React, { useState } from 'react';
import { useAppStore, useTranslation } from '../store/useAppStore';
import { IBO_SUBJECTS_DATA } from '../data/iboData';
import { X, Plus, Search, Tag } from 'lucide-react';
import { clsx } from 'clsx';

export const KeywordInput: React.FC = () => {
  const { keywords, addKeyword, removeKeyword, selectedSubject } = useAppStore();
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState('');

  const handleAdd = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = inputValue.trim();
    if (trimmed) {
      addKeyword(trimmed);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  const togglePresetKeyword = (keyword: string) => {
    if (keywords.includes(keyword)) {
      removeKeyword(keyword);
    } else {
      addKeyword(keyword);
    }
  };

  if (!selectedSubject) return null;

  const presetKeywords = IBO_SUBJECTS_DATA[selectedSubject].keywords;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">{t.step2}</h2>
      
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
        {/* Preset Keywords Section */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Tag className="w-4 h-4 text-blue-500" />
            {t.step2Desc}
          </h3>
          <div className="flex flex-wrap gap-2">
            {presetKeywords.map((k) => {
              const isSelected = keywords.includes(k);
              return (
                <button
                  key={k}
                  onClick={() => togglePresetKeyword(k)}
                  className={clsx(
                    "px-3 py-1.5 rounded-lg text-sm transition-all duration-200 border",
                    isSelected
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50"
                  )}
                >
                  {k}
                </button>
              );
            })}
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Custom Input Section */}
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.step2Placeholder}
            className="w-full pl-10 pr-12 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
          />
          <Search className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
          <button
            onClick={() => handleAdd()}
            disabled={!inputValue.trim()}
            className="absolute right-2 top-2 bg-blue-600 text-white p-1.5 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Keywords Display */}
        <div className="flex flex-wrap gap-2 pt-2">
          {keywords.length === 0 && (
            <p className="text-sm text-gray-400 italic">{t.step2NoKeywords}</p>
          )}
          {keywords.map((keyword) => (
            <span 
              key={keyword} 
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-100"
            >
              {keyword}
              <button
                onClick={() => removeKeyword(keyword)}
                className="ml-2 p-0.5 hover:bg-blue-200 rounded-full transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
