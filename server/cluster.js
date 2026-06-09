// Content-type classification + event clustering (dedup across sources).

const TYPE_RULES = [
  { type: 'Paper', kw: ['arxiv', 'we propose', 'we present', 'we introduce a', 'benchmark', 'sota', 'state-of-the-art', 'empirical', 'ablation', 'dataset for'] },
  { type: 'Release', kw: ['introducing', 'announc', 'launch', 'now available', 'generally available', 'we are releasing', 'released', 'unveil', 'rolls out', 'rolling out', ' ga ', 'version'] },
  { type: 'Tool', kw: ['open source', 'open-source', 'open weights', 'library', 'framework', 'toolkit', 'sdk', 'github', 'npm', 'pip install', 'repo'] },
  { type: 'Tutorial', kw: ['how to', 'how i', 'guide', 'tutorial', 'step by step', 'step-by-step', 'build a', 'building a', 'getting started', 'walkthrough'] },
  { type: 'Opinion', kw: ['opinion', 'the case for', 'why ai', 'i think', 'thoughts on', 'is dead', 'hot take', 'we need to talk'] },
];

const CATEGORY_TYPE = { Papers: 'Paper', 'Open Source': 'Tool' };

export function deriveType(post) {
  if (CATEGORY_TYPE[post.sourceCategory]) return CATEGORY_TYPE[post.sourceCategory];
  const lc = `${post.title} ${post.snippet || ''}`.toLowerCase();
  for (const rule of TYPE_RULES) {
    if (rule.kw.some((k) => lc.includes(k))) return rule.type;
  }
  return 'News';
}

const STOP = new Set([
  'the', 'a', 'an', 'and', 'or', 'of', 'to', 'in', 'on', 'for', 'with', 'is', 'are', 'be',
  'new', 'how', 'why', 'what', 'this', 'that', 'from', 'by', 'at', 'as', 'it', 'its', 'ai',
  'using', 'use', 'can', 'will', 'into', 'over', 'now', 'has', 'have',
]);

function tokens(title) {
  return new Set(
    title
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP.has(w)),
  );
}

function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  return inter / (a.size + b.size - inter);
}

// Group posts that describe the same event (similar titles across sources).
// Returns "event" objects: the strongest post, plus the list of contributing sources.
export function clusterPosts(posts, threshold = 0.5) {
  const withTok = posts.map((p) => ({ p, tok: tokens(p.title) }));
  const used = new Array(posts.length).fill(false);
  const events = [];

  for (let i = 0; i < withTok.length; i++) {
    if (used[i]) continue;
    const group = [withTok[i]];
    used[i] = true;
    for (let j = i + 1; j < withTok.length; j++) {
      if (used[j]) continue;
      if (jaccard(withTok[i].tok, withTok[j].tok) >= threshold) {
        group.push(withTok[j]);
        used[j] = true;
      }
    }
    // Representative = highest-scoring post in the group.
    group.sort((a, b) => b.p.score - a.p.score);
    const lead = group[0].p;
    const sources = [...new Set(group.map((g) => g.p.source))];
    events.push({
      ...lead,
      clusterSize: group.length,
      sourceCount: sources.length,
      clusterSources: sources,
      related: group.slice(1).map((g) => ({ title: g.p.title, source: g.p.source, link: g.p.link })),
      // Real cross-source signal boosts the score.
      score: lead.score + (sources.length - 1) * 250,
    });
  }
  return events;
}
