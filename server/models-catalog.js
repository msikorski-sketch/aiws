// Curated catalog of major AI model releases. Hand-maintained; kept short
// and high-signal. Each release: provider, family, version, date (ISO), notes,
// link to the official announcement.
export const MODEL_RELEASES = [
  // --- Anthropic ---
  { provider: 'Anthropic', family: 'Claude', version: 'Opus 4.7', date: '2025-12-04', kind: 'Frontier', context: '1M', notes: 'Najnowszy model frontier do złożonych zadań i agentów.', link: 'https://www.anthropic.com/news' },
  { provider: 'Anthropic', family: 'Claude', version: 'Sonnet 4.5', date: '2025-09-29', kind: 'Balanced', context: '1M', notes: 'Bilans jakości i kosztu; mocne wyniki w kodowaniu.', link: 'https://www.anthropic.com/news/claude-sonnet-4-5' },
  { provider: 'Anthropic', family: 'Claude', version: 'Haiku 4.5', date: '2025-10-15', kind: 'Fast', context: '200k', notes: 'Najszybszy i najtańszy w rodzinie 4.x.', link: 'https://www.anthropic.com/news/claude-haiku-4-5' },

  // --- OpenAI ---
  { provider: 'OpenAI', family: 'GPT', version: 'GPT-5', date: '2025-08-07', kind: 'Frontier', context: '400k', notes: 'Nowa generacja modeli rozumowania OpenAI.', link: 'https://openai.com/index/introducing-gpt-5/' },
  { provider: 'OpenAI', family: 'GPT', version: 'GPT-4.1', date: '2025-04-14', kind: 'Balanced', context: '1M', notes: 'Iteracja 4o z dłuższym kontekstem i lepszym kodowaniem.', link: 'https://openai.com/index/gpt-4-1/' },
  { provider: 'OpenAI', family: 'o', version: 'o3', date: '2025-04-16', kind: 'Reasoning', context: '200k', notes: 'Model rozumowania z głębszą inferencją.', link: 'https://openai.com/index/introducing-o3-and-o4-mini/' },

  // --- Google DeepMind ---
  { provider: 'Google DeepMind', family: 'Gemini', version: '3 Pro', date: '2025-11-18', kind: 'Frontier', context: '1M', notes: 'Najnowszy frontier od Google; multimodalny.', link: 'https://blog.google/technology/google-deepmind/gemini-3/' },
  { provider: 'Google DeepMind', family: 'Gemini', version: '2.5 Pro', date: '2025-03-25', kind: 'Frontier', context: '1M', notes: 'Thinking model z silnym rozumowaniem.', link: 'https://blog.google/technology/google-deepmind/gemini-model-thinking-updates-march-2025/' },

  // --- Meta ---
  { provider: 'Meta', family: 'Llama', version: '4 Behemoth/Maverick/Scout', date: '2025-04-05', kind: 'Open weights', context: '10M', notes: 'Multimodalne open-weights, MoE; Scout do edge.', link: 'https://ai.meta.com/blog/llama-4-multimodal-intelligence/' },

  // --- Mistral ---
  { provider: 'Mistral', family: 'Mistral', version: 'Large 3', date: '2025-09-10', kind: 'Frontier', context: '200k', notes: 'Flagowy model Mistral.', link: 'https://mistral.ai/news/' },

  // --- xAI ---
  { provider: 'xAI', family: 'Grok', version: '4', date: '2025-07-10', kind: 'Frontier', context: '256k', notes: 'Frontier model xAI.', link: 'https://x.ai/news' },

  // --- Open weights ---
  { provider: 'DeepSeek', family: 'DeepSeek', version: 'V3.2', date: '2025-09-29', kind: 'Open weights', context: '128k', notes: 'Wydajny open-weights MoE z mocnym kodowaniem.', link: 'https://api-docs.deepseek.com/news' },
  { provider: 'Alibaba', family: 'Qwen', version: '3 Max', date: '2025-09-05', kind: 'Frontier', context: '256k', notes: 'Najnowszy Qwen, open-weights też w mniejszych wariantach.', link: 'https://qwen.ai/' },
];
