import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TRANSLATIONS, Language } from '../i18n/translations';
import { IBO_SUBJECTS, IboSubject } from '../data/iboData';

export type AIModel = 'gemini' | 'openai' | 'deepseek' | 'doubao' | 'tongyi';

export { IBO_SUBJECTS, type IboSubject };

interface AppState {
  // Configuration
  language: Language;
  selectedModel: AIModel;
  apiKeys: Record<AIModel, string>;
  
  // Search Context
  selectedSubject: IboSubject | null;
  keywords: string[];
  
  // Actions
  setLanguage: (lang: Language) => void;
  setModel: (model: AIModel) => void;
  setApiKey: (model: AIModel, key: string) => void;
  setSubject: (subject: IboSubject | null) => void;
  addKeyword: (keyword: string) => void;
  removeKeyword: (keyword: string) => void;
  clearKeywords: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      language: 'zh', // Default to Chinese as requested
      selectedModel: 'gemini',
      apiKeys: {
        gemini: '',
        openai: '',
        deepseek: '',
        doubao: '',
        tongyi: '',
      },
      selectedSubject: null,
      keywords: [],

      setLanguage: (lang) => set({ language: lang }),
      setModel: (model) => set({ selectedModel: model }),
      
      setApiKey: (model, key) => set((state) => ({
        apiKeys: { ...state.apiKeys, [model]: key }
      })),

      setSubject: (subject) => set({ selectedSubject: subject }),
      
      addKeyword: (keyword) => set((state) => {
        if (state.keywords.includes(keyword)) return state;
        return { keywords: [...state.keywords, keyword] };
      }),
      
      removeKeyword: (keyword) => set((state) => ({
        keywords: state.keywords.filter((k) => k !== keyword)
      })),
      
      clearKeywords: () => set({ keywords: [] }),
    }),
    {
      name: 'bio-oly-storage',
      partialize: (state) => ({ 
        language: state.language,
        selectedModel: state.selectedModel,
        apiKeys: state.apiKeys 
      }),
    }
  )
);

// Hook for translations
export const useTranslation = () => {
  const language = useAppStore((state) => state.language);
  return {
    t: TRANSLATIONS[language],
    language,
    setLanguage: useAppStore((state) => state.setLanguage)
  };
};
