// Server-side article extraction (Readability + jsdom).
// Returns clean HTML body + meta. Cached in-memory per URL (1h).
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';

const CACHE_TTL = 60 * 60 * 1000;
const cache = new Map(); // url -> { at, data }

export async function extractArticle(url) {
  const hit = cache.get(url);
  if (hit && Date.now() - hit.at < CACHE_TTL) return hit.data;

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 10000);
  let html;
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      redirect: 'follow',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    html = await res.text();
  } finally {
    clearTimeout(t);
  }

  const dom = new JSDOM(html, { url });
  const reader = new Readability(dom.window.document);
  const parsed = reader.parse();
  if (!parsed) throw new Error('Nie udało się wyodrębnić treści');

  const data = {
    title: parsed.title,
    byline: parsed.byline || null,
    siteName: parsed.siteName || null,
    excerpt: parsed.excerpt || null,
    content: parsed.content, // sanitized HTML body
    length: parsed.length,
    readMins: Math.max(1, Math.round((parsed.length || 0) / 1200)),
    lang: parsed.lang || null,
  };
  cache.set(url, { at: Date.now(), data });
  return data;
}
