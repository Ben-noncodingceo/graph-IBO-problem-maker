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

  async generateFromPaper(paper: Paper, subject: string, mode: 'text' | 'image' = 'text', language: 'zh' | 'en' = 'zh'): Promise<Question[]> {
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
      Output Language: ${language === 'zh' ? 'Chinese (Simplified)' : 'English'}
      
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
      // Attempt to extract existing figures from the paper page when image mode is selected
      let extractedFigureUrl: string | undefined;
      let figureSource: string | undefined;
      if (isImageMode && paper.link) {
        try {
          const html = await this.fetchPageHtml(paper.link);
          let src = this.extractOgImage(html)
            || this.extractTwitterImage(html)
            || this.extractFigureImage(html)
            || this.extractFirstImageSrc(html);
          if (src) {
            const resolved = this.resolveUrl(paper.link, src);
            extractedFigureUrl = resolved;
            figureSource = paper.link;
          }
        } catch (e) {}
      }

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

      return questions.map((q, idx) => ({
        ...q,
        id: `T-${dateStr}-${randomBase + idx}`,
        type: 'Multiple Choice',
        figureUrl: isImageMode ? extractedFigureUrl : undefined,
        figureSource: isImageMode ? figureSource : undefined
      }));

    } catch (error) {
      console.error("Failed to generate questions:", error);
      throw new Error("AI Generation Failed: " + (error as Error).message);
    }
  }

  private async fetchPageHtml(url: string): Promise<string> {
    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) throw new Error(`Failed to fetch page: ${res.status}`);
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('text/html')) return '';
    return await res.text();
  }

  private extractFirstImageSrc(html: string): string | undefined {
    // Basic extraction of first <img ... src="..."> occurrence
    const imgTagMatch = html.match(/<img[^>]*src=["']([^"'>]+)["'][^>]*>/i);
    if (!imgTagMatch) return undefined;
    const src = imgTagMatch[1];
    // Skip data URIs and sprites
    if (src.startsWith('data:')) return undefined;
    return src;
  }

  private resolveUrl(base: string, src: string): string {
    try {
      return new URL(src, base).href;
    } catch {
      return src;
    }
  }

  private extractOgImage(html: string): string | undefined {
    const m = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"'>]+)["'][^>]*>/i);
    return m ? m[1] : undefined;
  }

  private extractTwitterImage(html: string): string | undefined {
    const m = html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"'>]+)["'][^>]*>/i);
    return m ? m[1] : undefined;
  }

  private extractFigureImage(html: string): string | undefined {
    const m = html.match(/<figure[\s\S]*?<img[^>]*src=["']([^"'>]+)["'][^>]*>[\s\S]*?<\/figure>/i);
    return m ? m[1] : undefined;
  }
}
