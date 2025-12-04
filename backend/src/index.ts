import { AIFactory } from './ai/factory';
import { AIModelType } from './ai/types';
import { SearchService } from './services/search';
import { QuestionGenerator } from './services/question';

async function fetchPageHtml(url: string): Promise<string> {
  const res = await fetch(url, { method: 'GET' });
  if (!res.ok) return '';
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('text/html')) return '';
  return await res.text();
}

function extractOgImage(html: string): string | undefined {
  const m = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"'>]+)["'][^>]*>/i);
  return m ? m[1] : undefined;
}

function extractTwitterImage(html: string): string | undefined {
  const m = html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"'>]+)["'][^>]*>/i);
  return m ? m[1] : undefined;
}

function extractFigureImage(html: string): string | undefined {
  const m = html.match(/<figure[\s\S]*?<img[^>]*src=["']([^"'>]+)["'][^>]*>[\s\S]*?<\/figure>/i);
  return m ? m[1] : undefined;
}

function extractFirstImageSrc(html: string): string | undefined {
  const imgTagMatch = html.match(/<img[^>]*src=["']([^"'>]+)["'][^>]*>/i);
  if (!imgTagMatch) return undefined;
  const src = imgTagMatch[1];
  if (src.startsWith('data:')) return undefined;
  return src;
}

function resolveUrl(base: string, src: string): string {
  try {
    return new URL(src, base).href;
  } catch {
    return src;
  }
}

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
          (mode === 'image' ? 'image' : (mode === 'analysis' ? 'analysis' : 'text')),
          (language === 'en' ? 'en' : 'zh')
        );
        let finalQuestions = result.questions;
        let finalMeta = result.meta;
        if (mode === 'image' && result.meta.modeUsed === 'text') {
          const searchService = new SearchService(env.SERPAPI_KEY);
          const alts = await searchService.searchPapers(subject, [paper.title]);
          const preferred = ['arxiv.org','ncbi.nlm.nih.gov','biorxiv.org','nature.com','sciencedirect.com','springer.com'];
          const score = (u: string) => {
            try { const host = new URL(u).host; }
            catch { return 999; }
            const h = new URL(u).host;
            for (let i=0;i<preferred.length;i++) { if (h.includes(preferred[i])) return i; }
            return 999;
          };
          const sorted = [...alts].sort((a,b) => score(a.link) - score(b.link));
          let foundUrl: string | undefined;
          let foundSource: string | undefined;
          let attempts = 0;
          for (const cand of sorted.slice(0, 10)) {
            attempts++;
            try {
              const html = await fetchPageHtml(cand.link);
              if (!html) continue;
              const src = extractOgImage(html) || extractTwitterImage(html) || extractFigureImage(html) || extractFirstImageSrc(html);
              if (src) {
                foundUrl = resolveUrl(cand.link, src);
                foundSource = cand.link;
                break;
              }
            } catch {}
          }
          if (foundUrl) {
            finalQuestions = finalQuestions.map(q => ({ ...q, figureUrl: foundUrl, figureSource: foundSource }));
            finalMeta = { modeUsed: 'image', imageFailReason: undefined };
          } else {
            finalMeta = { modeUsed: 'text', imageFailReason: (finalMeta.imageFailReason ? `${finalMeta.imageFailReason}; fallback exhausted` : 'fallback exhausted') };
          }
        }
        
        // TODO: Save to DB (Skipped for now to focus on connectivity)

        return new Response(JSON.stringify({ questions: finalQuestions, meta: finalMeta }), { 
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

      // --- Route 4: PK Start ---
      if (url.pathname === '/api/pk/start' && request.method === 'POST') {
        const body = await request.json() as any;
        const { questions = [], mode = 'random', keyword = '' } = body || {};
        const list = Array.isArray(questions) ? questions : [];
        const filtered = mode === 'random' ? list : list.filter((q: any) => {
          const t = `${q.id} ${q.scenario || ''} ${q.context || ''} ${q.explanation || ''}`.toLowerCase();
          return String(keyword || '').toLowerCase() ? t.includes(String(keyword).toLowerCase()) : true;
        });
        const groups: Record<string, any[]> = { 'Easy': [], 'Medium': [], 'Hard': [] };
        filtered.forEach((q: any) => { if (groups[q.difficulty]) groups[q.difficulty].push(q); });
        const pickFrom = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
        let left: any = null, right: any = null;
        for (const key of ['Easy','Medium','Hard']) {
          if (groups[key].length >= 2) { left = pickFrom(groups[key]); do { right = pickFrom(groups[key]); } while (right.id === left.id); break; }
        }
        if (!left || !right) {
          // fallback: random two
          if (filtered.length >= 2) {
            left = pickFrom(filtered);
            do { right = pickFrom(filtered); } while (right.id === left.id);
          }
        }
        if (!left || !right) {
          return new Response(JSON.stringify({ error: 'No sufficient questions to start PK' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
        return new Response(JSON.stringify({ left, right }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // Ensure PK table exists
      async function ensurePkTable() {
        try {
          await env.DB.exec(`CREATE TABLE IF NOT EXISTS pk_ratings (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            rating_type TEXT,
            qid_winner TEXT,
            qid_loser TEXT,
            qid_hard TEXT,
            qid_easy TEXT,
            created_at INTEGER
          );`);
        } catch {}
      }

      // --- Route 5: PK Rate ---
      if (url.pathname === '/api/pk/rate' && request.method === 'POST') {
        const body = await request.json() as any;
        const { userId = 'anonymous', qidLeft, qidRight, ratingType, value } = body || {};
        if (!qidLeft || !qidRight || !ratingType || !value) {
          return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
        await ensurePkTable();
        const id = Math.random().toString(36).slice(2);
        const ts = Date.now();
        let qid_winner = null, qid_loser = null, qid_hard = null, qid_easy = null;
        if (ratingType === 'goodbad') {
          if (value === 'good') { qid_winner = qidLeft; qid_loser = qidRight; } else { qid_winner = qidRight; qid_loser = qidLeft; }
        } else if (ratingType === 'hardeasy') {
          if (value === 'hard') { qid_hard = qidLeft; qid_easy = qidRight; } else { qid_hard = qidRight; qid_easy = qidLeft; }
        }
        await env.DB.prepare(`INSERT INTO pk_ratings (id,user_id,rating_type,qid_winner,qid_loser,qid_hard,qid_easy,created_at) VALUES (?,?,?,?,?,?,?,?)`)
          .bind(id, userId, ratingType, qid_winner, qid_loser, qid_hard, qid_easy, ts).run();
        return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // --- Route 6: PK History ---
      if (url.pathname === '/api/pk/history' && request.method === 'GET') {
        const type = url.searchParams.get('type') || 'good';
        await ensurePkTable();
        let query = '';
        if (type === 'good') {
          query = `SELECT qid_winner AS qid, COUNT(*) AS count, MAX(created_at) AS last FROM pk_ratings WHERE rating_type='goodbad' AND qid_winner IS NOT NULL GROUP BY qid ORDER BY count DESC, last DESC LIMIT 100`;
        } else if (type === 'hard') {
          query = `SELECT qid_hard AS qid, COUNT(*) AS count, MAX(created_at) AS last FROM pk_ratings WHERE rating_type='hardeasy' AND qid_hard IS NOT NULL GROUP BY qid ORDER BY count DESC, last DESC LIMIT 100`;
        } else {
          return new Response(JSON.stringify({ error: 'Invalid type' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
        const rs = await env.DB.prepare(query).all();
        const items = (rs?.results || []).map((r: any) => ({ qid: r.qid, count: r.count, last: r.last }));
        return new Response(JSON.stringify({ items }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
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
