import axios from 'axios';
import { AIModel } from '../store/useAppStore';
import { Language } from '../i18n/translations';

// Determine API Base URL based on environment
const API_BASE = import.meta.env.DEV 
  ? 'http://localhost:8787/api' 
  : 'https://graph-ibo-problem-maker.peungsun.workers.dev/api';

export interface Paper {
  title: string;
  link: string;
  snippet: string;
  year?: string;
  authors?: string;
}

export interface Question {
  id: string;
  type: string;
  difficulty: string;
  context?: string; // New: Context text or figure description
  figureUrl?: string; // New: Image URL
  figureSource?: string; // New: Source page URL when image is extracted
  scenario: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export const api = {
  searchPapers: async (subject: string, keywords: string[]): Promise<Paper[]> => {
    const res = await axios.post(`${API_BASE}/search_paper`, { subject, keywords });
    return res.data.papers;
  },

  generateQuestions: async (
    paper: Paper, 
    subject: string, 
    model: AIModel, 
    apiKey: string,
    mode: 'text' | 'image',
    language: Language
  ): Promise<{ questions: Question[]; meta?: any }> => {
    const res = await axios.post(
      `${API_BASE}/generate_questions`, 
      { paper, subject, mode, language },
      {
        headers: {
          'x-model-type': model,
          'x-api-key': apiKey
        }
      }
    );
    return res.data;
  }
};

export const buildImageProxyUrl = (url: string) => `${API_BASE}/proxy_image?url=${encodeURIComponent(url)}`;
