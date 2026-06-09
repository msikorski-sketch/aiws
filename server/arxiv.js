// Lightweight arXiv lookup: fetch metadata for an arXiv ID via the Atom API,
// then probe Papers-with-Code for an associated code repo (best-effort).
const CACHE_TTL = 24 * 60 * 60 * 1000;
const cache = new Map(); // id -> { at, data }

// Extract arXiv id from various URL forms (abs/, pdf/, v1, etc.)
export function arxivIdFromUrl(url) {
  if (!url) return null;
  const m = url.match(/arxiv\.org\/(?:abs|pdf|html)\/([\w.\-]+?)(?:v\d+)?(?:\.pdf)?(?:[/?#]|$)/i);
  return m ? m[1] : null;
}

async function fetchAtom(id) {
  const url = `http://export.arxiv.org/api/query?id_list=${encodeURIComponent(id)}`;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { 'User-Agent': 'AI-Daily/1.0' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}

function tag(xml, name) {
  const m = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`, 'i'));
  return m ? m[1].trim() : null;
}
function allTags(xml, name) {
  const out = [];
  const re = new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`, 'gi');
  let m;
  while ((m = re.exec(xml))) out.push(m[1].trim());
  return out;
}

async function findCodeRepo(id) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 6000);
    const res = await fetch(`https://paperswithcode.com/api/v1/papers/?arxiv_id=${id}`, {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'AI-Daily/1.0', Accept: 'application/json' },
    }).finally(() => clearTimeout(t));
    if (!res.ok) return null;
    const data = await res.json();
    const paper = data?.results?.[0];
    if (!paper?.id) return null;
    const ctrl2 = new AbortController();
    const t2 = setTimeout(() => ctrl2.abort(), 6000);
    const r2 = await fetch(`https://paperswithcode.com/api/v1/papers/${paper.id}/repositories/`, {
      signal: ctrl2.signal,
      headers: { 'User-Agent': 'AI-Daily/1.0', Accept: 'application/json' },
    }).finally(() => clearTimeout(t2));
    if (!r2.ok) return null;
    const repos = (await r2.json())?.results || [];
    return repos[0]?.url || null;
  } catch {
    return null;
  }
}

export async function lookupArxiv(id) {
  const hit = cache.get(id);
  if (hit && Date.now() - hit.at < CACHE_TTL) return hit.data;

  const xml = await fetchAtom(id);
  const entry = xml.split('<entry>').slice(1).join('<entry>'); // skip feed metadata
  const title = (tag(entry, 'title') || '').replace(/\s+/g, ' ').trim();
  const abstract = (tag(entry, 'summary') || '').replace(/\s+/g, ' ').trim();
  const authors = allTags(entry, 'author').map((a) => tag(a, 'name')).filter(Boolean);
  const published = tag(entry, 'published');
  const updated = tag(entry, 'updated');

  const pdfUrl = `https://arxiv.org/pdf/${id}.pdf`;
  const absUrl = `https://arxiv.org/abs/${id}`;
  const codeUrl = await findCodeRepo(id);

  const year = (published || '').slice(0, 4);
  const firstAuthor = (authors[0] || '').split(' ').pop() || 'unknown';
  const bibtex = `@article{arxiv${id.replace(/\./g, '')},\n  title  = {${title}},\n  author = {${authors.join(' and ')}},\n  journal = {arXiv preprint arXiv:${id}},\n  year   = {${year}}\n}`;

  const data = { id, title, abstract, authors, published, updated, absUrl, pdfUrl, codeUrl, bibtex, _firstAuthor: firstAuthor };
  cache.set(id, { at: Date.now(), data });
  return data;
}
