import { loadEnv } from './env.js';
loadEnv();

import express from 'express';
import cors from 'cors';
import Parser from 'rss-parser';
import { SOURCES } from './feeds.js';
import { SEED_POSTS } from './seed.js';
import { buildPost, stripHtml } from './normalize.js';
import { fetchExtraSources } from './extra-sources.js';
import { deriveType, clusterPosts } from './cluster.js';
import { aiEnabled, aiModel, summarizePost, buildDigest, answerQuestion, explainPaper } from './ai.js';
import { extractArticle } from './reader.js';
import { MODEL_RELEASES } from './models-catalog.js';
import { arxivIdFromUrl, lookupArxiv } from './arxiv.js';

const PORT = process.env.PORT || 4399;
const CACHE_TTL_MS = 10 * 60 * 1000;
const FETCH_TIMEOUT_MS = 8000;

const app = express();
app.use(cors());
app.use(express.json());

// Simple keyword retrieval over events for the RAG endpoint.
const STOPQ = new Set(['the','a','an','and','or','of','to','in','on','for','what','is','are','jak','co','czy','jest','są','o','w','na','do','i','z','że','to','the']);
function retrieve(events, question, k = 8) {
  const qTokens = question.toLowerCase().replace(/[^a-z0-9ąćęłńóśźż ]/gi, ' ').split(/\s+/).filter((w) => w.length > 2 && !STOPQ.has(w));
  if (!qTokens.length) return [];
  const scored = events.map((p) => {
    const hay = `${p.title} ${p.snippet} ${p.tags.join(' ')}`.toLowerCase();
    let s = 0;
    for (const t of qTokens) if (hay.includes(t)) s += hay.split(t).length - 1;
    const ageH = (Date.now() - new Date(p.isoDate).getTime()) / 3600000;
    return { p, s: s + Math.max(0, 1 - ageH / 336) };
  });
  return scored.filter((x) => x.s > 0).sort((a, b) => b.s - a.s).slice(0, k).map((x) => x.p);
}

const parser = new Parser({
  timeout: FETCH_TIMEOUT_MS,
  headers: { 'User-Agent': 'AI-Daily/1.0 (+https://localhost)' },
});

let cache = { at: 0, posts: [], events: [] };

/* ---------- feed building ---------- */

function normalizeRss(item, src) {
  const rawContent = item['content:encoded'] || item.content || item.contentSnippet || item.summary || '';
  return buildPost({
    title: item.title,
    link: item.link || item.guid || '',
    source: src.name,
    sourceCategory: src.category,
    sourceHomepage: src.homepage,
    rawContent,
    snippet: stripHtml(item.contentSnippet || item.summary || rawContent),
    image: imageFrom(item),
    isoDate: item.isoDate || item.pubDate || new Date().toISOString(),
  });
}

function imageFrom(item) {
  if (item.enclosure?.url && /\.(jpe?g|png|webp|gif)/i.test(item.enclosure.url)) return item.enclosure.url;
  if (item['media:content']?.$?.url) return item['media:content'].$.url;
  if (item['media:thumbnail']?.$?.url) return item['media:thumbnail'].$.url;
  const html = item['content:encoded'] || item.content || '';
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? m[1] : null;
}

async function fetchSource(src) {
  try {
    const feed = await parser.parseURL(src.url);
    return (feed.items || []).slice(0, 20).map((it) => normalizeRss(it, src));
  } catch (err) {
    console.warn(`[feed] skip ${src.name}: ${err.message}`);
    return [];
  }
}

async function buildFeed() {
  const [rssResults, extra] = await Promise.all([
    Promise.allSettled(SOURCES.map(fetchSource)),
    fetchExtraSources(),
  ]);
  let posts = rssResults.flatMap((r) => (r.status === 'fulfilled' ? r.value : [])).concat(extra);

  const seen = new Set();
  posts = posts.filter((p) => {
    if (!p.link || seen.has(p.link)) return false;
    seen.add(p.link);
    return true;
  });

  if (posts.length < 6) {
    console.warn(`[feed] only ${posts.length} live posts — using seed fallback`);
    posts = SEED_POSTS.map((p) =>
      buildPost({
        title: p.title,
        link: p.link,
        source: p.source,
        sourceCategory: 'News',
        sourceHomepage: p.sourceHomepage,
        snippet: p.contentSnippet,
        rawContent: p.contentSnippet,
        isoDate: p.isoDate,
      }),
    );
  }

  for (const p of posts) p.type = deriveType(p);
  posts.sort((a, b) => new Date(b.isoDate) - new Date(a.isoDate));

  const events = clusterPosts(posts);
  events.sort((a, b) => new Date(b.isoDate) - new Date(a.isoDate));
  return { posts, events };
}

async function getData() {
  if (Date.now() - cache.at < CACHE_TTL_MS && cache.events.length) return cache;
  const { posts, events } = await buildFeed();
  cache = { at: Date.now(), posts, events };
  return cache;
}

function sortBy(list, sort) {
  const s = [...list];
  if (sort === 'popular') s.sort((a, b) => b.score - a.score);
  else if (sort === 'discussed') s.sort((a, b) => b.comments - a.comments);
  else if (sort === 'upvoted') s.sort((a, b) => b.upvotes - a.upvotes);
  else s.sort((a, b) => new Date(b.isoDate) - new Date(a.isoDate));
  return s;
}

/* ---------- routes ---------- */

app.get('/api/feed', async (req, res) => {
  try {
    const { events } = await getData();
    const { tag, source, q, type, sort = 'recent' } = req.query;
    let list = events;

    if (tag) list = list.filter((p) => p.tags.includes(tag));
    if (type) list = list.filter((p) => p.type === type);
    if (source) list = list.filter((p) => p.source === source || p.clusterSources?.includes(source));
    if (q) {
      const needle = String(q).toLowerCase();
      list = list.filter(
        (p) => p.title.toLowerCase().includes(needle) || p.snippet.toLowerCase().includes(needle),
      );
    }

    const sorted = sortBy(list, sort);
    res.json({ count: sorted.length, posts: sorted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/tags', async (_req, res) => {
  const { events } = await getData();
  const counts = {};
  for (const p of events) for (const t of p.tags) counts[t] = (counts[t] || 0) + 1;
  res.json({
    tags: Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
  });
});

app.get('/api/types', async (_req, res) => {
  const { events } = await getData();
  const counts = {};
  for (const p of events) counts[p.type] = (counts[p.type] || 0) + 1;
  res.json({
    types: Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
  });
});

app.get('/api/sources', async (_req, res) => {
  const { posts } = await getData();
  const meta = {};
  for (const s of SOURCES) meta[s.name] = { homepage: s.homepage, category: s.category };
  const counts = {};
  for (const p of posts) {
    counts[p.source] = (counts[p.source] || 0) + 1;
    if (!meta[p.source]) meta[p.source] = { homepage: p.sourceHomepage, category: p.sourceCategory };
  }
  res.json({
    sources: Object.keys(meta)
      .map((name) => ({ name, ...meta[name], count: counts[name] || 0 }))
      .sort((a, b) => b.count - a.count),
  });
});

app.get('/api/summary', async (req, res) => {
  if (!aiEnabled) return res.json({ enabled: false });
  const { events } = await getData();
  const post = events.find((p) => p.id === req.query.id);
  if (!post) return res.status(404).json({ error: 'not found' });
  const summary = await summarizePost(post);
  res.json({ enabled: true, summary });
});

app.get('/api/digest', async (_req, res) => {
  if (!aiEnabled) return res.json({ enabled: false });
  const { events } = await getData();
  const top = sortBy(events, 'popular');
  const text = await buildDigest(top);
  res.json({ enabled: true, model: aiModel, text });
});

app.post('/api/ask', async (req, res) => {
  try {
    const question = String(req.body?.question || '').slice(0, 500);
    if (!question.trim()) return res.status(400).json({ error: 'Brak pytania' });
    const { events } = await getData();
    const hits = retrieve(events, question);
    const sources = hits.map((p, i) => ({ n: i + 1, title: p.title, source: p.source, link: p.link }));
    if (!aiEnabled) return res.json({ enabled: false, sources });
    const answer = await answerQuestion(question, hits.map((p) => ({ title: p.title, source: p.source, snippet: p.snippet })));
    res.json({ enabled: true, model: aiModel, answer, sources });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/models', (_req, res) => {
  const list = [...MODEL_RELEASES].sort((a, b) => (a.date < b.date ? 1 : -1));
  res.json({ releases: list });
});

app.get('/api/papers', async (_req, res) => {
  try {
    const { events } = await getData();
    const papers = events
      .map((p) => ({ post: p, id: arxivIdFromUrl(p.link) }))
      .filter((x) => x.id)
      .slice(0, 40)
      .map(({ post, id }) => ({ id, title: post.title, source: post.source, isoDate: post.isoDate, link: post.link, tags: post.tags }));
    res.json({ papers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/papers/:id', async (req, res) => {
  try {
    const data = await lookupArxiv(req.params.id);
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

app.post('/api/papers/:id/explain', async (req, res) => {
  if (!aiEnabled) return res.json({ enabled: false });
  try {
    const meta = await lookupArxiv(req.params.id);
    const text = await explainPaper({ title: meta.title, abstract: meta.abstract });
    res.json({ enabled: true, model: aiModel, text });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

app.get('/api/article', async (req, res) => {
  const url = String(req.query.url || '');
  if (!/^https?:\/\//i.test(url)) return res.status(400).json({ error: 'Bad URL' });
  try {
    const data = await extractArticle(url);
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

app.get('/api/trends', async (req, res) => {
  try {
    const days = Math.max(3, Math.min(30, Number(req.query.days) || 14));
    const { events } = await getData();
    const now = Date.now();
    const cutoff = now - days * 86400000;
    // tag -> array of daily counts (length=days, oldest -> newest)
    const buckets = {};
    for (const p of events) {
      const t = new Date(p.isoDate).getTime();
      if (t < cutoff) continue;
      const dayIdx = days - 1 - Math.floor((now - t) / 86400000);
      if (dayIdx < 0 || dayIdx >= days) continue;
      for (const tag of p.tags) {
        if (!buckets[tag]) buckets[tag] = new Array(days).fill(0);
        buckets[tag][dayIdx]++;
      }
    }
    // momentum: ratio of last half to first half
    const trends = Object.entries(buckets).map(([tag, series]) => {
      const mid = Math.floor(days / 2);
      const first = series.slice(0, mid).reduce((a, b) => a + b, 0) || 0.5;
      const last = series.slice(mid).reduce((a, b) => a + b, 0);
      const total = series.reduce((a, b) => a + b, 0);
      const growth = last / first;
      return { tag, total, growth, series };
    }).filter((t) => t.total >= 3).sort((a, b) => b.growth - a.growth);
    res.json({ days, trends });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/health', (_req, res) =>
  res.json({ ok: true, cached: cache.posts.length, events: cache.events.length, ai: aiEnabled, model: aiModel }),
);

app.listen(PORT, () => {
  console.log(`\n🤖 AI Daily API on http://localhost:${PORT}  (AI: ${aiEnabled ? aiModel : 'off'})`);
  getData().then((c) => console.log(`   Loaded ${c.posts.length} posts → ${c.events.length} events.\n`));
});
