// Shared helpers for turning raw items (RSS or API) into normalized posts.
import { TOPIC_RULES } from './feeds.js';

export const stripHtml = (s = '') =>
  s.replace(/<[^>]*>/g, ' ').replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, ' ').trim();

export function readingTime(text = '') {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function deriveTags(text) {
  const lc = text.toLowerCase();
  const tags = [];
  for (const rule of TOPIC_RULES) if (rule.kw.some((k) => lc.includes(k))) tags.push(rule.tag);
  return tags.length ? tags.slice(0, 4) : ['AI'];
}

export function hashUnit(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

export function findImage(item) {
  if (item.enclosure?.url && /\.(jpe?g|png|webp|gif)/i.test(item.enclosure.url)) return item.enclosure.url;
  if (item['media:content']?.$?.url) return item['media:content'].$.url;
  if (item['media:thumbnail']?.$?.url) return item['media:thumbnail'].$.url;
  const html = item['content:encoded'] || item.content || '';
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? m[1] : null;
}

// Build a normalized post. Pass real `upvotes`/`comments` when a source provides
// them (HN, GitHub, HF); otherwise a deterministic synthetic signal is used.
export function buildPost(opts) {
  const {
    title, link, source, sourceCategory, sourceHomepage,
    rawContent = '', snippet, image = null, isoDate = new Date().toISOString(),
    upvotes, comments,
  } = opts;

  const id = link || `${source}-${title}`;
  const text = stripHtml(rawContent);
  const snip = (snippet ?? stripHtml(rawContent)).slice(0, 220);
  const ageHours = (Date.now() - new Date(isoDate).getTime()) / 3600000;
  const recency = Math.max(0, 1 - ageHours / 168);

  let up = upvotes;
  let com = comments;
  const real = up !== undefined;
  if (up === undefined) {
    const rnd = hashUnit(id);
    up = Math.round(8 + rnd * 480 + recency * 320);
    com = Math.round(rnd * 60 + recency * 25);
  }

  return {
    id,
    title: (title || 'Untitled').trim(),
    link,
    source,
    sourceCategory,
    sourceHomepage,
    snippet: snip,
    image,
    tags: deriveTags(`${title} ${text} ${sourceCategory}`),
    isoDate,
    readMins: readingTime(text || snip),
    upvotes: up,
    comments: com ?? 0,
    realSignal: real,
    score: up + (com ?? 0) * 3 + recency * 600,
  };
}
