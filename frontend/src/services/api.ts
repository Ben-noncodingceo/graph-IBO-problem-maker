import axios from 'axios';
import { AIModel } from '../store/useAppStore';

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
  scenario: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  analysis: string; // Add alias for explanation/analysis display
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
    apiKey: string
  ): Promise<Question[]> => {
    const res = await axios.post(
      `${API_BASE}/generate_questions`, 
      { paper, subject },
      {
        headers: {
          'x-model-type': model,
          'x-api-key': apiKey
        }
      }
    );
    // Ensure we handle potentially different response structures or alias fields if needed
    // The backend returns { questions: Question[] }
    return res.data.questions;
  }
};
