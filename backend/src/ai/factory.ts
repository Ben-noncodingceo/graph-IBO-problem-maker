import { AIClient, AIChatMessage, AIModelType } from './types';

interface AIConfig {
  apiKey: string;
  baseURL?: string; // For OpenAI-compatible endpoints like DeepSeek
  modelName?: string; // Specific model name mapping
}

// --- Base OpenAI Compatible Client ---
class OpenAICompatibleClient implements AIClient {
  constructor(private config: AIConfig, private defaultModel: string) {}

  async chat(messages: AIChatMessage[]): Promise<string> {
    const url = `${this.config.baseURL || 'https://api.openai.com/v1'}/chat/completions`;
    
    // Log the request for debugging (security: mask api key)
    console.log(`[AI] Calling ${url} with model ${this.config.modelName || this.defaultModel}`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.modelName || this.defaultModel,
        messages: messages,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[AI] Error ${response.status}: ${errorText}`);
      throw new Error(`AI API Error (${response.status}): ${errorText}`);
    }

    const data = await response.json() as any;
    return data.choices[0]?.message?.content || '';
  }
}

// --- Gemini Client ---
class GeminiClient implements AIClient {
  constructor(private apiKey: string) {}

  async chat(messages: AIChatMessage[]): Promise<string> {
    // Use user specified model: gemini-3-pro-preview
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent?key=${this.apiKey}`;
    
    console.log(`[AI] Calling Gemini API (gemini-3-pro-preview)`);

    // Convert standard messages to Gemini format
    const contents = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user', 
      parts: [{ text: msg.content }]
    }));

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[AI] Gemini Error ${response.status}: ${errorText}`);
      throw new Error(`Gemini API Error (${response.status}): ${errorText}`);
    }

    const data = await response.json() as any;
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }
}

// --- Factory ---
export class AIFactory {
  static createClient(modelType: AIModelType, apiKey: string): AIClient {
    if (!apiKey) {
      throw new Error(`API Key for ${modelType} is missing.`);
    }

    switch (modelType) {
      case 'openai':
        return new OpenAICompatibleClient({ 
          apiKey, 
          modelName: 'gpt-4o' 
        }, 'gpt-4o');
      
      case 'deepseek':
        return new OpenAICompatibleClient({
          apiKey,
          baseURL: 'https://api.deepseek.com',
          modelName: 'deepseek-chat'
        }, 'deepseek-chat');

      case 'gemini':
        return new GeminiClient(apiKey);
        
      case 'doubao':
         // Assuming Doubao via ARK compatible API if key is provided
         // https://ark.cn-beijing.volces.com/api/v3
         return new OpenAICompatibleClient({
           apiKey,
           baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
           modelName: 'ep-20240604060406-doubao-pro-32k' // Example endpoint ID, user needs to config
         }, 'doubao-pro-32k');

      case 'tongyi':
        return new OpenAICompatibleClient({
          apiKey,
          baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
          modelName: 'qwen-turbo'
        }, 'qwen-turbo');

      default:
        throw new Error(`Unsupported model type: ${modelType}`);
    }
  }
}
