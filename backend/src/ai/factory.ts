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
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.apiKey}`;
    
    // Convert standard messages to Gemini format
    const contents = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user', // Gemini uses 'model' instead of 'assistant', system prompts handled differently usually but for simple chat 'user' is often fine or valid for system in v1beta
      parts: [{ text: msg.content }]
    }));

    // Hack: Gemini Pro often works best if system prompt is merged into the first user message or set appropriately
    // For simplicity in this v1 implementation, we treat all as content.
    // If the first message is system, we might need to prepend it to the first user message or use system_instruction (newer API)
    
    // Simple adjustment:
    // If msg.role is system, prepend to next user msg? 
    // Let's just pass them for now, Gemini is robust. Or better, use system_instruction if available.
    // Actually, v1beta/models/gemini-1.5-flash supports system_instruction. Let's stick to simple prompting for now.
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents }),
    });

    if (!response.ok) {
      const errorText = await response.text();
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
          modelName: 'gpt-4o' // Default to GPT-4o
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
         // Doubao usually requires specific SDK or complex signing, mocking as OpenAI compatible if using via Ark wrapper
         // For now, let's treat it as placeholder or assuming OpenAI compatible endpoint if available
         throw new Error("Doubao implementation requires specific SDK/Signing, skipping for this demo.");

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
