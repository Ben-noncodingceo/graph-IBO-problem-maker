import React from 'react';
import { useTranslation, useAppStore, IBO_SUBJECTS, IboSubject } from '../store/useAppStore';
import { IBO_SUBJECTS_DATA } from '../data/iboData';
import { Check } from 'lucide-react';
import { clsx } from 'clsx';

export const SubjectSelector: React.FC = () => {
  const { selectedSubject, setSubject } = useAppStore();
  const { t, language } = useTranslation();

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">{t.step1}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {IBO_SUBJECTS.map((subject: IboSubject) => {
          const isSelected = selectedSubject === subject;
          // Get display name based on language
          const displayName = language === 'zh' 
            ? IBO_SUBJECTS_DATA[subject].zh 
            : subject;

          return (
            <button
              key={subject}
              onClick={() => setSubject(subject)}
              className={clsx(
                "relative flex items-center p-4 rounded-xl border text-left transition-all duration-200",
                isSelected 
                  ? "border-blue-500 bg-blue-50 shadow-sm ring-1 ring-blue-500" 
                  : "border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50"
              )}
            >
              <div className="flex-1">
                <span className={clsx(
                  "font-medium block",
                  isSelected ? "text-blue-900" : "text-gray-700"
                )}>
                  {displayName}
                </span>
                {language === 'zh' && (
                  <span className="text-xs text-gray-400 block mt-0.5">{subject}</span>
                )}
              </div>
              {isSelected && (
                <Check className="w-5 h-5 text-blue-600 ml-2" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
