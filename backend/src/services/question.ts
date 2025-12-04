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

  async generateFromPaper(paper: Paper, subject: string, mode: 'text' | 'image' | 'analysis' = 'text', language: 'zh' | 'en' = 'zh'): Promise<{ questions: Question[]; meta: { modeUsed: 'text' | 'image' | 'analysis'; imageFailReason?: string } }> {
    const isImageModeRequested = mode === 'image';
    
    let extractedFigureUrl: string | undefined;
    let figureSource: string | undefined;
    let extractionReason: string | undefined;

    const prompt = `
      Role: You are an expert Biology Olympiad (IBO) question setter.
      Task: Create 3 high-quality IBO-level multiple-choice questions based on the provided research paper summary.
      
      Paper Title: ${paper.title}
      Paper Snippet: ${paper.snippet}
      Subject: ${subject}
      Generation Mode: ${isImageModeRequested && extractedFigureUrl ? 'image' : (mode === 'analysis' ? 'analysis' : 'text')}
      Output Language: ${language === 'zh' ? 'Chinese (Simplified)' : 'English'}
      
      Specific Instructions:
      ${extractedFigureUrl ? `
        MODE: EXISTING FIGURE FROM PAPER
        1. Use the existing figure from the selected paper; do not invent or simulate new figures.
        2. Provide a "context" field: A concise description (50-150 words) of what the displayed figure represents, aligned with axes labels or legend info.
        3. Ensure all questions require analyzing this described figure.
      ` : (mode === 'analysis' ? `
        MODE: DATA ANALYSIS
        1. Provide a "context" field that includes a small numeric dataset (e.g., 4-8 rows) relevant to the paper topic. Use a simple table-like plain text format.
        2. Ask calculation/analysis questions (e.g., fold change, rate, mean/SD, enrichment) based solely on the provided numbers.
        3. The explanation must show step-by-step calculations and reasoning.
      ` : `
        MODE: TEXT ONLY
        1. Provide a "context" field: A detailed summary (50-300 words) of the paper's key findings, methodology, or theoretical background.
        2. This text MUST provide enough information for a student to deduce the correct answers without prior specific knowledge of this exact paper.
      `)}
      
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
      const sanitizedLink = paper.link ? this.sanitizeLink(paper.link) : '';
      if (isImageModeRequested && sanitizedLink) {
        try {
          const html = await this.fetchPageHtml(sanitizedLink);
          if (!html) {
            extractionReason = 'non-html content';
          } else {
            let src = this.extractOgImage(html)
              || this.extractTwitterImage(html)
              || this.extractFigureImage(html)
              || this.extractFirstImageSrc(html);
            if (src) {
              const resolved = this.resolveUrl(sanitizedLink, src);
              extractedFigureUrl = resolved;
              figureSource = sanitizedLink;
            } else {
              extractionReason = 'no image tag found';
            }
          }
        } catch (e: any) {
          extractionReason = 'fetch error: ' + (e?.message || 'unknown');
        }
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

      let questions: any[] = [];
      try {
        questions = JSON.parse(jsonStr) as any[];
      } catch {
        const start = jsonStr.indexOf('[');
        const end = jsonStr.lastIndexOf(']');
        if (start >= 0 && end > start) {
          const slice = jsonStr.slice(start, end + 1);
          questions = JSON.parse(slice) as any[];
        } else {
          throw new Error('AI returned non-JSON content');
        }
      }
      
      // Generate ID & Inject Image URL if needed
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomBase = Math.floor(1000 + Math.random() * 9000);

      const finalQuestions = questions.map((q, idx) => ({
        ...q,
        id: `T-${dateStr}-${randomBase + idx}`,
        type: 'Multiple Choice',
        figureUrl: extractedFigureUrl,
        figureSource: figureSource,
        paperUrl: sanitizedLink || paper.link
      }));

      const meta = {
        modeUsed: extractedFigureUrl ? 'image' as const : (mode === 'analysis' ? 'analysis' as const : 'text' as const),
        imageFailReason: extractedFigureUrl ? undefined : this.classifyImageFailReason(extractionReason)
      };

      return { questions: finalQuestions, meta };

    } catch (error) {
      console.error("Failed to generate questions:", error);
      throw new Error("AI Generation Failed: " + (error as Error).message);
    }
  }

  private sanitizeLink(url: string): string {
    try {
      let u = url.trim().replace(/^`+|`+$/g, '');
      if (u.startsWith('https://doi.org/')) {
        // Remove trailing slash that can break DOI resolution
        u = u.replace(/\/$/, '');
      }
      return u;
    } catch {
      return url;
    }
  }

  private classifyImageFailReason(reason?: string): string | undefined {
    if (!reason) return undefined;
    const r = reason.toLowerCase();
    if (r.includes('non-html')) return 'pdf-only';
    if (r.includes('404')) return '404';
    if (r.includes('403')) return '403';
    if (r.includes('timeout')) return 'timeout';
    if (r.includes('enotfound') || r.includes('dns')) return 'dns error';
    if (r.includes('no image tag')) return 'no-image';
    if (r.includes('failed to fetch')) return 'network';
    return 'unknown';
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
