export type Language = 'en' | 'zh';

export const TRANSLATIONS = {
  en: {
    appTitle: 'BioOlyAI',
    appSubtitle: 'IBO Trainer',
    heroTitle: 'Master the IBO with ',
    heroTitleHighlight: 'AI-Generated',
    heroTitleSuffix: ' Problems',
    heroDesc: 'Select a subject, define your keywords, and let our multi-modal AI agents find the latest research papers to generate high-quality competition questions.',
    
    step1: '1. Select IBO Subject',
    step2: '2. Refine with Keywords',
    step2Desc: 'Select preset keywords or type to add your own.',
    step2NoKeywords: 'No keywords added yet. Select from below or type to add.',
    step2Placeholder: "e.g. 'Photosynthesis', 'CRISPR'...",
    
    searchButton: 'Search Papers & Generate',
    searching: 'Searching Literature...',
    
    settingsTitle: 'AI Configuration',
    selectModel: 'Select Active Model',
    apiKeys: 'API Keys Configuration',
    apiKeyPlaceholder: 'Enter API Key...',
    saveClose: 'Save & Close',
    apiKeyNote: 'Your API keys are stored locally in your browser and sent directly to the Cloudflare Worker. They are never saved on our servers.',
    
    footer: 'Powered by Cloudflare Workers & Multi-Modal AI',
    
    models: {
      gemini: { name: 'Google Gemini', desc: 'Best overall performance & speed' },
      gpt4: { name: 'OpenAI GPT-4', desc: 'High reasoning capability' },
      deepseek: { name: 'DeepSeek', desc: 'Cost-effective & strong logic' },
      doubao: { name: 'Doubao (豆包)', desc: 'Optimized for Chinese context' },
      tongyi: { name: 'Tongyi Qianwen', desc: 'Alibaba Cloud Qwen Model' },
    }
  },
  zh: {
    appTitle: 'BioOlyAI',
    appSubtitle: '生物竞赛训练',
    heroTitle: '利用 ',
    heroTitleHighlight: 'AI 智能生成',
    heroTitleSuffix: ' 攻克 IBO 难题',
    heroDesc: '选择学科，定义关键词，让我们的多模态 AI 智能体搜索最新学术文献，生成高质量竞赛题目。',
    
    step1: '1. 选择 IBO 学科',
    step2: '2. 关键词细化',
    step2Desc: '从下方选择预设关键词，或直接输入添加自定义关键词。',
    step2NoKeywords: '暂无关键词。请从下方选择或手动输入添加。',
    step2Placeholder: "例如：'光合作用', 'CRISPR'...",
    
    searchButton: '搜索文献并生成题目',
    searching: '正在搜索文献...',
    
    settingsTitle: 'AI 配置',
    selectModel: '选择 AI 模型',
    apiKeys: 'API Key 配置',
    apiKeyPlaceholder: '输入 API Key...',
    saveClose: '保存并关闭',
    apiKeyNote: '您的 API Key 仅存储在本地浏览器中，并直接发送至 Cloudflare Worker，绝不会保存到我们的服务器上。',
    
    footer: '基于 Cloudflare Workers & 多模态 AI 构建',
    
    models: {
      gemini: { name: 'Google Gemini', desc: '综合性能与速度最佳' },
      gpt4: { name: 'OpenAI GPT-4', desc: '强大的推理能力' },
      deepseek: { name: 'DeepSeek', desc: '高性价比与强逻辑' },
      doubao: { name: '豆包 (Doubao)', desc: '中文语境优化' },
      tongyi: { name: '通义千问', desc: '阿里云 Qwen 模型' },
    }
  }
} as const;
