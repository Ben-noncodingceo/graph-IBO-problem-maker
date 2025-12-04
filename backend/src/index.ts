import { AIFactory } from './ai/factory';
import { AIModelType } from './ai/types';
import { SearchService } from './services/search';
import { QuestionGenerator } from './services/question';

interface Env {
  GEMINI_API_KEY: string;
  OPENAI_API_KEY: string;
  DEEPSEEK_API_KEY: string;
  DOUBAO_API_KEY: string;
  TONGYI_API_KEY: string;
  SERPAPI_KEY: string;
  DB: D1Database;
  IMAGES: R2Bucket;
  AI: any;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    // CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, x-api-key, x-model-type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // --- Route 1: Search Papers ---
      if (url.pathname === '/api/search_paper' && request.method === 'POST') {
        const { subject, keywords } = await request.json() as any;
        
        // Initialize Search Service (Use Env Key if available)
        const searchService = new SearchService(env.SERPAPI_KEY);
        const papers = await searchService.searchPapers(subject, keywords || []);
        
        return new Response(JSON.stringify({ papers }), { 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        });
      }

      // --- Route 2: Generate Questions ---
      if (url.pathname === '/api/generate_questions' && request.method === 'POST') {
        const body = await request.json() as any;
        const { paper, subject, mode, language } = body;
        
        // Extract Model Config from Headers or Body
        // Headers are safer/standard, but body is easy too. Let's look at headers.
        const modelType = (request.headers.get('x-model-type') || 'gemini') as AIModelType;
        let apiKey = request.headers.get('x-api-key') || '';

        // Fallback to Env vars if no key provided by user (Optional, for demo purposes)
        if (!apiKey) {
          switch (modelType) {
            case 'gemini': apiKey = env.GEMINI_API_KEY; break;
            case 'gemini_image': apiKey = env.GEMINI_API_KEY; break;
            case 'openai': apiKey = env.OPENAI_API_KEY; break;
            case 'deepseek': apiKey = env.DEEPSEEK_API_KEY; break;
            case 'deepseek_v3_2': apiKey = env.DEEPSEEK_API_KEY; break;
            case 'doubao': apiKey = env.DOUBAO_API_KEY; break;
            case 'tongyi': apiKey = env.TONGYI_API_KEY; break;
          }
        }

        if (!apiKey) {
          return new Response(JSON.stringify({ error: `Missing API Key for ${modelType}` }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }

        // Create AI Client
        const aiClient = AIFactory.createClient(modelType, apiKey);
        
        // Generate Questions
        const generator = new QuestionGenerator(aiClient);
        const result = await generator.generateFromPaper(
          paper,
          subject,
          (mode === 'image' ? 'image' : 'text'),
          (language === 'en' ? 'en' : 'zh')
        );
        
        // TODO: Save to DB (Skipped for now to focus on connectivity)

        return new Response(JSON.stringify({ questions: result.questions, meta: result.meta }), { 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        });
      }

      // --- Route 3: Proxy Image ---
      if (url.pathname === '/api/proxy_image' && request.method === 'GET') {
        const target = url.searchParams.get('url') || '';
        if (!target || !/^https?:\/\//i.test(target)) {
          return new Response(JSON.stringify({ error: 'Invalid image url' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
        const upstream = await fetch(target, { method: 'GET' });
        if (!upstream.ok) {
          return new Response(JSON.stringify({ error: `Upstream ${upstream.status}` }), { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
        const ct = upstream.headers.get('Content-Type') || '';
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
        if (!allowed.some(a => ct.toLowerCase().includes(a))) {
          return new Response(JSON.stringify({ error: 'Unsupported media type' }), { status: 415, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
        const arrayBuf = await upstream.arrayBuffer();
        return new Response(arrayBuf, { status: 200, headers: { ...corsHeaders, 'Content-Type': ct, 'Cache-Control': 'public, max-age=3600' } });
      }

      return new Response("BioOlyAI Backend API Running", { headers: corsHeaders });
    } catch (err: any) {
      console.error(err);
      return new Response(JSON.stringify({ error: err.message }), { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }
  }
};
