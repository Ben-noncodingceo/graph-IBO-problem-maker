import { AIClient } from '../ai/types';
import { Paper } from './search';

export interface Question {
  id: string; // T-YYYYMMDD-XXXX
  type: 'Multiple Choice';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  scenario: string;
  options: string[];
  correctAnswer: string; // A, B, C, D
  explanation: string; // Detailed analysis
}

export class QuestionGenerator {
  constructor(private aiClient: AIClient) {}

  async generateFromPaper(paper: Paper, subject: string): Promise<Question[]> {
    const prompt = `
      Role: You are an expert Biology Olympiad (IBO) question setter.
      Task: Create 3 high-quality IBO-level multiple-choice questions based on the provided research paper summary.
      
      Paper Title: ${paper.title}
      Paper Snippet: ${paper.snippet}
      Subject: ${subject}
      
      Requirements:
      1. Generate 3 questions with increasing difficulty: Easy, Medium, Hard.
      2. Each question must have a clear scenario/stem, 4 options (A, B, C, D), one correct answer, and a detailed explanation.
      3. The explanation must reference the scientific logic.
      4. Output STRICTLY in valid JSON format array. Do not include markdown formatting (like \`\`\`json).
      
      Output Schema:
      [
        {
          "difficulty": "Easy",
          "scenario": "...",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": "A",
          "explanation": "..."
        },
        ...
      ]
    `;

    try {
      const rawResponse = await this.aiClient.chat([
        { role: 'user', content: prompt }
      ]);

      // Clean up response if it contains markdown code blocks
      let jsonStr = rawResponse.trim();
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.replace(/^```json/, '').replace(/```$/, '');
      } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```/, '').replace(/```$/, '');
      }

      const questions = JSON.parse(jsonStr) as any[];
      
      // Generate ID: T-YYYYMMDD-XXXX
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomBase = Math.floor(1000 + Math.random() * 9000);

      return questions.map((q, idx) => ({
        ...q,
        id: `T-${dateStr}-${randomBase + idx}`,
        type: 'Multiple Choice'
      }));

    } catch (error) {
      console.error("Failed to generate questions:", error);
      throw new Error("AI Generation Failed: " + (error as Error).message);
    }
  }
}
