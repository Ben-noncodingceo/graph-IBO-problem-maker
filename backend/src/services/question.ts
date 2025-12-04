import { AIClient } from '../ai/types';
import { Paper } from './search';

export interface Question {
  id: string; // T-YYYYMMDD-XXXX
  type: 'Multiple Choice';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  context: string; // The text passage or figure description provided to student
  figureUrl?: string; // Optional image URL for chart/figure mode
  scenario: string; // The specific question stem
  options: string[];
  correctAnswer: string; // A, B, C, D
  explanation: string; // Detailed analysis
}

export class QuestionGenerator {
  constructor(private aiClient: AIClient) {}

  async generateFromPaper(paper: Paper, subject: string, mode: 'text' | 'image' = 'text'): Promise<Question[]> {
    const isImageMode = mode === 'image';
    
    const modeInstruction = isImageMode 
      ? `
        MODE: IMAGE/CHART
        1. Simulate a key scientific figure (Figure 1) relevant to this paper (e.g., a bar graph of gene expression, a survival curve, or a signaling pathway diagram).
        2. Provide a "context" field: A concise description (50-150 words) of what Figure 1 represents, including axes labels or key legend info necessary to interpret it.
        3. The questions MUST require analyzing this described figure logic.
        `
      : `
        MODE: TEXT ONLY
        1. Provide a "context" field: A detailed summary (50-300 words) of the paper's key findings, methodology, or theoretical background.
        2. This text MUST provide enough information for a student to deduce the correct answers without prior specific knowledge of this exact paper.
        `;

    const prompt = `
      Role: You are an expert Biology Olympiad (IBO) question setter.
      Task: Create 3 high-quality IBO-level multiple-choice questions based on the provided research paper summary.
      
      Paper Title: ${paper.title}
      Paper Snippet: ${paper.snippet}
      Subject: ${subject}
      Generation Mode: ${mode}
      
      Specific Instructions:
      ${modeInstruction}
      
      General Requirements:
      1. Generate 3 questions with increasing difficulty: Easy, Medium, Hard.
      2. Each question must have a clear scenario/stem, 4 options (A, B, C, D), one correct answer, and a detailed explanation.
      3. The explanation must reference the scientific logic.
      4. Output STRICTLY in valid JSON format array. Do not include markdown formatting (like \`\`\`json).
      
      Output Schema:
      [
        {
          "difficulty": "Easy",
          "context": "The 50-300 word summary OR the 50-150 word figure description...",
          "scenario": "Question stem...",
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

      // Clean up response
      let jsonStr = rawResponse.trim();
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.replace(/^```json/, '').replace(/```$/, '');
      } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```/, '').replace(/```$/, '');
      }

      const questions = JSON.parse(jsonStr) as any[];
      
      // Generate ID & Inject Image URL if needed
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomBase = Math.floor(1000 + Math.random() * 9000);

      // Mock Image URLs for demonstration since we can't really screenshot via LLM text
      const mockChartUrls = [
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80", // Data chart
        "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=800&q=80", // DNA structure
        "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80", // Molecule
        "https://plus.unsplash.com/premium_photo-1676325102583-0839e57d7a1f?auto=format&fit=crop&w=800&q=80" // Micro
      ];

      return questions.map((q, idx) => ({
        ...q,
        id: `T-${dateStr}-${randomBase + idx}`,
        type: 'Multiple Choice',
        // If image mode, inject a random scientific image to simulate the "extracted figure"
        figureUrl: isImageMode ? mockChartUrls[idx % mockChartUrls.length] : undefined
      }));

    } catch (error) {
      console.error("Failed to generate questions:", error);
      throw new Error("AI Generation Failed: " + (error as Error).message);
    }
  }
}
