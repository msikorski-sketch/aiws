// Non-RSS AI sources fetched via public APIs. Each returns normalized posts
// and carries REAL engagement signal (HN points, GitHub stars, HF likes).
import { buildPost } from './normalize.js';

const TIMEOUT = 8000;

async function getJSON(url, headers = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'AI-Daily/1.0', Accept: 'application/json', ...headers },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

// Word-boundary match for short/ambiguous terms; substring for multi-word phrases.
const AI_WORDS = ['ai', 'llm', 'llms', 'gpt', 'claude', 'gemini', 'llama', 'mistral', 'neural',
  'transformer', 'transformers', 'diffusion', 'openai', 'anthropic', 'agents', 'rag', 'agi'];
const AI_PHRASES = ['machine learning', 'deep learning', 'language model', 'hugging face',
  'fine-tun', 'generative ai', 'a.i.', 'chatbot', 'gpt-', 'inference'];
const AI_RE = new RegExp(`\\b(${AI_WORDS.join('|')})\\b`, 'i');
const looksAI = (s = '') => {
  const lc = s.toLowerCase();
  return AI_RE.test(lc) || AI_PHRASES.some((t) => lc.includes(t));
};

// --- Hacker News (Algolia) — recent AI stories with real points/comments ---
async function fetchHN() {
  try {
    const since = Math.floor((Date.now() - 21 * 86400000) / 1000);
    const data = await getJSON(
      `https://hn.algolia.com/api/v1/search_by_date?tags=story&numericFilters=points%3E40,created_at_i%3E${since}&hitsPerPage=100`,
    );
    return (data.hits || [])
      .filter((h) => h.title && (looksAI(h.title) || looksAI(h.story_text || '')))
      .slice(0, 18)
      .map((h) =>
        buildPost({
          title: h.title,
          link: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
          source: 'Hacker News',
          sourceCategory: 'Community',
          sourceHomepage: 'https://news.ycombinator.com/',
          snippet: h.story_text ? h.story_text.slice(0, 200) : `Dyskusja na Hacker News (${h.num_comments || 0} komentarzy).`,
          isoDate: h.created_at,
          upvotes: h.points || 0,
          comments: h.num_comments || 0,
        }),
      );
  } catch (err) {
    console.warn(`[feed] skip Hacker News: ${err.message}`);
    return [];
  }
}

// --- GitHub: trending AI repositories (real stars) ---
async function fetchGitHub() {
  const topics = ['large-language-models', 'generative-ai'];
  const byUrl = new Map();
  for (const topic of topics) {
    try {
      const data = await getJSON(
        `https://api.github.com/search/repositories?q=${encodeURIComponent('topic:' + topic)}&sort=stars&order=desc&per_page=12`,
        { Accept: 'application/vnd.github+json' },
      );
      for (const r of data.items || []) {
        if (byUrl.has(r.html_url)) continue;
        byUrl.set(
          r.html_url,
          buildPost({
            title: `${r.full_name} — ${r.description || 'AI repository'}`.slice(0, 140),
            link: r.html_url,
            source: 'GitHub',
            sourceCategory: 'Open Source',
            sourceHomepage: 'https://github.com/topics/large-language-models',
            snippet: (r.description || '').slice(0, 200),
            isoDate: r.pushed_at,
            upvotes: r.stargazers_count || 0,
            comments: r.open_issues_count || 0,
          }),
        );
      }
    } catch (err) {
      console.warn(`[feed] skip GitHub (${topic}): ${err.message}`);
    }
  }
  return [...byUrl.values()].sort((a, b) => b.upvotes - a.upvotes).slice(0, 12);
}

// --- Hugging Face: trending models + datasets (real likes) ---
async function fetchHuggingFace() {
  const out = [];
  try {
    const models = await getJSON('https://huggingface.co/api/models?sort=likes7d&limit=12&full=false');
    for (const m of models || []) {
      out.push(
        buildPost({
          title: `${m.id}${m.pipeline_tag ? ' · ' + m.pipeline_tag : ''}`,
          link: `https://huggingface.co/${m.id}`,
          source: 'Hugging Face',
          sourceCategory: 'Models',
          sourceHomepage: 'https://huggingface.co/models',
          snippet: `Trending model na Hugging Face${m.pipeline_tag ? ' (' + m.pipeline_tag + ')' : ''}. ${m.downloads ? Math.round(m.downloads / 1000) + 'k pobrań.' : ''}`,
          isoDate: m.lastModified || m.createdAt || new Date().toISOString(),
          upvotes: m.likes || 0,
          comments: 0,
        }),
      );
    }
  } catch (err) {
    console.warn(`[feed] skip HF models: ${err.message}`);
  }
  return out.slice(0, 12);
}

export async function fetchExtraSources() {
  const results = await Promise.allSettled([fetchHN(), fetchGitHub(), fetchHuggingFace()]);
  return results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
}
