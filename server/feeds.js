// Curated list of high-quality, AI-focused RSS sources.
// Each entry: { name, url, homepage, category }
export const SOURCES = [
  { name: 'OpenAI', url: 'https://openai.com/news/rss.xml', homepage: 'https://openai.com/news', category: 'Labs' },
  { name: 'Google DeepMind', url: 'https://deepmind.google/blog/rss.xml', homepage: 'https://deepmind.google/discover/blog/', category: 'Labs' },
  { name: 'Google AI', url: 'https://blog.google/technology/ai/rss/', homepage: 'https://blog.google/technology/ai/', category: 'Labs' },
  { name: 'Hugging Face', url: 'https://huggingface.co/blog/feed.xml', homepage: 'https://huggingface.co/blog', category: 'Open Source' },
  { name: 'The Decoder', url: 'https://the-decoder.com/feed/', homepage: 'https://the-decoder.com/', category: 'News' },
  { name: 'TechCrunch AI', url: 'https://techcrunch.com/category/artificial-intelligence/feed/', homepage: 'https://techcrunch.com/category/artificial-intelligence/', category: 'News' },
  { name: 'The Verge AI', url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml', homepage: 'https://www.theverge.com/ai-artificial-intelligence', category: 'News' },
  { name: 'VentureBeat AI', url: 'https://venturebeat.com/category/ai/feed/', homepage: 'https://venturebeat.com/category/ai/', category: 'News' },
  { name: 'Ars Technica AI', url: 'https://arstechnica.com/ai/feed/', homepage: 'https://arstechnica.com/ai/', category: 'News' },
  { name: 'MIT Tech Review AI', url: 'https://www.technologyreview.com/topic/artificial-intelligence/feed', homepage: 'https://www.technologyreview.com/topic/artificial-intelligence/', category: 'Research' },
  { name: 'MarkTechPost', url: 'https://www.marktechpost.com/feed/', homepage: 'https://www.marktechpost.com/', category: 'Research' },
  { name: 'Synced', url: 'https://syncedreview.com/feed/', homepage: 'https://syncedreview.com/', category: 'Research' },
  { name: 'arXiv cs.AI', url: 'http://export.arxiv.org/rss/cs.AI', homepage: 'https://arxiv.org/list/cs.AI/recent', category: 'Papers' },
  { name: 'arXiv cs.LG', url: 'http://export.arxiv.org/rss/cs.LG', homepage: 'https://arxiv.org/list/cs.LG/recent', category: 'Papers' },
];

// Keyword -> topic tag mapping used to auto-tag posts.
export const TOPIC_RULES = [
  { tag: 'LLM', kw: ['llm', 'large language model', 'gpt', 'claude', 'gemini', 'llama', 'mistral', 'language model', 'chatbot', 'token'] },
  { tag: 'Generative AI', kw: ['generative', 'diffusion', 'image generation', 'text-to-image', 'midjourney', 'stable diffusion', 'dall-e', 'sora', 'video generation'] },
  { tag: 'Agents', kw: ['agent', 'agentic', 'autonomous', 'tool use', 'workflow', 'copilot'] },
  { tag: 'Computer Vision', kw: ['vision', 'image recognition', 'object detection', 'segmentation', 'multimodal', 'ocr'] },
  { tag: 'NLP', kw: ['nlp', 'natural language', 'translation', 'sentiment', 'speech', 'transcription', 'voice'] },
  { tag: 'Robotics', kw: ['robot', 'robotics', 'humanoid', 'embodied', 'autonomous vehicle', 'self-driving', 'drone'] },
  { tag: 'Research', kw: ['benchmark', 'arxiv', 'paper', 'sota', 'state-of-the-art', 'dataset', 'fine-tun', 'training', 'architecture'] },
  { tag: 'Hardware', kw: ['gpu', 'chip', 'nvidia', 'tpu', 'silicon', 'datacenter', 'data center', 'h100', 'b200', 'inference hardware'] },
  { tag: 'Open Source', kw: ['open source', 'open-source', 'open weights', 'hugging face', 'apache', 'mit license'] },
  { tag: 'Funding', kw: ['funding', 'raises', 'valuation', 'series a', 'series b', 'investment', 'ipo', 'acquire', 'acquisition', 'billion'] },
  { tag: 'Ethics & Safety', kw: ['safety', 'alignment', 'bias', 'ethic', 'regulation', 'policy', 'deepfake', 'misinformation', 'eu ai act', 'guardrail'] },
  { tag: 'Business', kw: ['enterprise', 'startup', 'launch', 'product', 'pricing', 'api', 'partnership', 'customer'] },
];
