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
    apiKeyPlaceholder: 'Enter API Key (Optional if Secrets configured)',
    saveClose: 'Save & Close',
    apiKeyNote: 'Optional: If you leave this blank, the system will use the default API keys configured in the backend Secrets.',
    
    footer: 'Powered by Cloudflare Workers & Multi-Modal AI',
    
    // New Translations
    debugTitle: 'Debug Console',
    clearLogs: 'Clear Logs',
    noLogs: 'No logs recorded yet. Perform some actions to see logs here.',
    historyTitle: 'Generated History',
    noHistory: 'No questions generated yet. Start exploring papers!',
    textMode: 'Text Only',
    imageMode: 'With Figure',
    analysisMode: 'Data Analysis',
    originalPaperLabel: 'Original Paper',
    contextTitle: 'Question Material / Context',
    figureCaption: 'Figure from paper (if available)',
    figureSourceLabel: 'Figure source',
    imageAlt: 'Scientific Figure',
    showAnswer: 'Show Answer & Analysis',
    hideAnswer: 'Hide Answer & Analysis',
    answerCorrect: 'Congratulations! Correct answer.',
    answerWrong: 'Incorrect. Try again or view analysis.',
    analysisTitle: 'Analysis & Scientific Reasoning',
    correctAnswerLabel: 'Correct Answer:',
    imageFallbackMessage: 'Figure extraction failed; switched to text-only question.',
    difficulty: { Easy: 'Easy', Medium: 'Medium', Hard: 'Hard' },
    
    loadingMessages: [
      "AI is thinking...", 
      "AI is hallucinating...", 
      "AI is plotting world domination...", 
      "AI is disappointed in humanity...", 
      "AI hit a dead end...", 
      "AI thinks humans might be okay...", 
      "AI is out of ideas...", 
      "AI learned emoji 🤖"
    ],
    
    models: {
      gemini: { name: 'Google Gemini (gemini-3-pro-preview)', desc: 'Best overall performance & speed' },
      gpt4: { name: 'OpenAI GPT-4', desc: 'High reasoning capability' },
      deepseek: { name: 'DeepSeek', desc: 'Cost-effective & strong logic' },
      deepseek_v3_2: { name: 'DeepSeek V3.2 Speciale', desc: 'Reasoning chat only, up to 128K output' },
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
    apiKeyPlaceholder: '输入 API Key (若后台已配置可留空)',
    saveClose: '保存并关闭',
    apiKeyNote: '可选：如果您留空，系统将自动使用后端 Secret 中配置的默认 API Key。',
    
    footer: '基于 Cloudflare Workers & 多模态 AI 构建',
    
    // New Translations
    debugTitle: '调试控制台',
    clearLogs: '清空日志',
    noLogs: '暂无日志记录。进行一些操作后将在此显示。',
    historyTitle: '生成历史',
    noHistory: '暂无生成记录。快去探索文献吧！',
    textMode: '纯文字题',
    imageMode: '图表题',
    analysisMode: '数据分析题',
    originalPaperLabel: '原始论文',
    contextTitle: '题目材料 / Context',
    figureCaption: '来自文献的图表（若可用）',
    figureSourceLabel: '图片来源',
    imageAlt: '科学图像',
    showAnswer: '展开答案与解析',
    hideAnswer: '收起答案与解析',
    answerCorrect: '恭喜，答对了！',
    answerWrong: '回答错误，请再试或查看解析。',
    analysisTitle: '解析与科学推理',
    correctAnswerLabel: '正确答案：',
    imageFallbackMessage: '图像提取失败，已切换为文字题。',
    difficulty: { Easy: '简单', Medium: '中等', Hard: '困难' },
    
    loadingMessages: [
      "AI 正在思考", 
      "AI 正在编造", 
      "AI 准备对抗人类", 
      "AI 对人类失望", 
      "AI 的思路陷入死胡同", 
      "AI 觉得也许人类还可以", 
      "AI 想不出答案了", 
      "AI 学会了emoji 🤖"
    ],
    
    models: {
      gemini: { name: 'Google Gemini (gemini-3-pro-preview)', desc: '综合性能与速度最佳' },
      gpt4: { name: 'OpenAI GPT-4', desc: '强大的推理能力' },
      deepseek: { name: 'DeepSeek', desc: '高性价比与强逻辑' },
      deepseek_v3_2: { name: 'DeepSeek V3.2 Speciale', desc: '仅对话思考模式，输出最长 128K' },
      doubao: { name: '豆包 (Doubao)', desc: '中文语境优化' },
      tongyi: { name: '通义千问', desc: '阿里云 Qwen 模型' },
    }
  }
} as const;
