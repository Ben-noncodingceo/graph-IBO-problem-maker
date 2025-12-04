import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TRANSLATIONS, Language } from '../i18n/translations';
import { IBO_SUBJECTS, IboSubject } from '../data/iboData';

export type AIModel = 'gemini' | 'openai' | 'deepseek' | 'deepseek_v3_2' | 'doubao' | 'tongyi';

export { IBO_SUBJECTS, type IboSubject };

export interface LogEntry {
  id: string;
  timestamp: number;
  type: 'info' | 'error' | 'api';
  message: string;
  details?: any;
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  subject: string;
  paperTitle: string;
  questions: any[];
  mode?: 'text' | 'image' | 'analysis';
  language?: Language;
  keywords?: string[];
}

interface AppState {
  // Configuration
  language: Language;
  selectedModel: AIModel;
  apiKeys: Record<AIModel, string>;
  
  // Search Context
  selectedSubject: IboSubject | null;
  keywords: string[];
  
  // Data
  logs: LogEntry[];
  history: HistoryEntry[];
  
  // Actions
  setLanguage: (lang: Language) => void;
  setModel: (model: AIModel) => void;
  setApiKey: (model: AIModel, key: string) => void;
  setSubject: (subject: IboSubject | null) => void;
  addKeyword: (keyword: string) => void;
  removeKeyword: (keyword: string) => void;
  clearKeywords: () => void;
  
  addLog: (entry: Omit<LogEntry, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
  addToHistory: (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      language: 'zh', // Default to Chinese
      selectedModel: 'gemini',
      apiKeys: {
        gemini: '',
        openai: '',
        deepseek: '',
        deepseek_v3_2: '',
        doubao: '',
        tongyi: '',
      },
      selectedSubject: null,
      keywords: [],
      logs: [],
      history: [],

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

      addLog: (entry) => set((state) => ({
        logs: [
          { ...entry, id: Math.random().toString(36).substr(2, 9), timestamp: Date.now() },
          ...state.logs
        ].slice(0, 100) // Keep last 100 logs
      })),

      clearLogs: () => set({ logs: [] }),

      addToHistory: (entry) => set((state) => ({
        history: [
          { ...entry, id: Math.random().toString(36).substr(2, 9), timestamp: Date.now() },
          ...state.history
        ]
      })),
    }),
    {
      name: 'bio-oly-storage',
      partialize: (state) => ({ 
        language: state.language,
        selectedModel: state.selectedModel,
        apiKeys: state.apiKeys,
        history: state.history 
      }), // Don't persist logs
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
