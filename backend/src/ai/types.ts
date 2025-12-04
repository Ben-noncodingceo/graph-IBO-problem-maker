export interface AIChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIClient {
  chat(messages: AIChatMessage[]): Promise<string>;
}

export type AIModelType = 'gemini' | 'gemini_image' | 'openai' | 'deepseek' | 'doubao' | 'tongyi';
