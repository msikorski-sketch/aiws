// Offline fallback data. Used when no RSS source could be reached
// (e.g. no internet), so the app always renders a populated feed.
const now = Date.now();
const h = (n) => new Date(now - n * 3600 * 1000).toISOString();

export const SEED_POSTS = [
  {
    title: 'OpenAI releases new reasoning model with extended context window',
    source: 'OpenAI',
    sourceHomepage: 'https://openai.com/news',
    link: 'https://openai.com/news',
    contentSnippet:
      'The new model improves multi-step reasoning and tool use while supporting a substantially longer context window, aimed at agentic workflows and long-document understanding.',
    isoDate: h(2),
  },
  {
    title: 'Google DeepMind unveils a multimodal agent for scientific discovery',
    source: 'Google DeepMind',
    sourceHomepage: 'https://deepmind.google/discover/blog/',
    link: 'https://deepmind.google/discover/blog/',
    contentSnippet:
      'A new agentic system combines vision, language and planning to autonomously run experiments and propose hypotheses across materials science and biology.',
    isoDate: h(5),
  },
  {
    title: 'Hugging Face ships an open-source toolkit for fine-tuning small LLMs on consumer GPUs',
    source: 'Hugging Face',
    sourceHomepage: 'https://huggingface.co/blog',
    link: 'https://huggingface.co/blog',
    contentSnippet:
      'The open-source library lowers the barrier for fine-tuning language models locally, with quantization and LoRA support that runs on a single consumer GPU.',
    isoDate: h(7),
  },
  {
    title: 'NVIDIA announces next-gen inference chip targeting lower-cost LLM serving',
    source: 'The Decoder',
    sourceHomepage: 'https://the-decoder.com/',
    link: 'https://the-decoder.com/',
    contentSnippet:
      'The new hardware promises higher throughput per watt for transformer inference, with a focus on reducing the cost of serving large language models at scale.',
    isoDate: h(9),
  },
  {
    title: 'EU AI Act enforcement begins: what developers need to know',
    source: 'MIT Tech Review AI',
    sourceHomepage: 'https://www.technologyreview.com/topic/artificial-intelligence/',
    link: 'https://www.technologyreview.com/topic/artificial-intelligence/',
    contentSnippet:
      'New obligations around transparency, risk classification and dataset documentation take effect, with implications for model providers and downstream deployers.',
    isoDate: h(12),
  },
  {
    title: 'Text-to-video diffusion models reach near-real-time generation',
    source: 'VentureBeat AI',
    sourceHomepage: 'https://venturebeat.com/category/ai/',
    link: 'https://venturebeat.com/category/ai/',
    contentSnippet:
      'Researchers demonstrate a generative video pipeline producing short clips in seconds, narrowing the gap between image and video generation latency.',
    isoDate: h(15),
  },
  {
    title: 'A practical benchmark for evaluating autonomous coding agents',
    source: 'arXiv cs.AI',
    sourceHomepage: 'https://arxiv.org/list/cs.AI/recent',
    link: 'https://arxiv.org/list/cs.AI/recent',
    contentSnippet:
      'The paper introduces a reproducible benchmark and dataset for measuring how well agentic systems resolve real software engineering tasks end-to-end.',
    isoDate: h(18),
  },
  {
    title: 'AI startup raises $200M Series B to build domain-specific medical models',
    source: 'TechCrunch AI',
    sourceHomepage: 'https://techcrunch.com/category/artificial-intelligence/',
    link: 'https://techcrunch.com/category/artificial-intelligence/',
    contentSnippet:
      'The funding will go toward training specialized clinical language models and expanding partnerships with hospital systems.',
    isoDate: h(20),
  },
  {
    title: 'Humanoid robots learn dexterous manipulation from video demonstrations',
    source: 'Synced',
    sourceHomepage: 'https://syncedreview.com/',
    link: 'https://syncedreview.com/',
    contentSnippet:
      'A new approach lets robots acquire fine motor skills by watching human videos, reducing the need for costly teleoperated data collection.',
    isoDate: h(24),
  },
  {
    title: 'Open-weights model matches frontier performance on reasoning benchmarks',
    source: 'MarkTechPost',
    sourceHomepage: 'https://www.marktechpost.com/',
    link: 'https://www.marktechpost.com/',
    contentSnippet:
      'The community-released model posts competitive scores on math and code reasoning while keeping weights and training recipe fully open.',
    isoDate: h(28),
  },
  {
    title: 'How retrieval-augmented generation is evolving beyond simple vector search',
    source: 'Ars Technica AI',
    sourceHomepage: 'https://arstechnica.com/ai/',
    link: 'https://arstechnica.com/ai/',
    contentSnippet:
      'Hybrid retrieval, re-ranking and graph-based context assembly are pushing RAG systems toward more reliable, grounded answers.',
    isoDate: h(32),
  },
  {
    title: 'On-device speech recognition hits new accuracy records',
    source: 'The Verge AI',
    sourceHomepage: 'https://www.theverge.com/ai-artificial-intelligence',
    link: 'https://www.theverge.com/ai-artificial-intelligence',
    contentSnippet:
      'A compact speech model runs entirely offline on phones, delivering low-latency transcription with strong multilingual support.',
    isoDate: h(36),
  },
];
