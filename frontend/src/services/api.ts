import axios from 'axios';
import { AIModel } from '../store/useAppStore';

const API_BASE = 'http://localhost:8787/api';

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
    return res.data.questions;
  }
};
