import type { Post, TagInfo, SourceInfo, TypeInfo, SortMode, Summary } from './types';

export interface FeedParams {
  sort?: SortMode;
  tag?: string;
  source?: string;
  q?: string;
  type?: string;
}

export async function fetchFeed(params: FeedParams = {}): Promise<Post[]> {
  const qs = new URLSearchParams();
  if (params.sort) qs.set('sort', params.sort);
  if (params.tag) qs.set('tag', params.tag);
  if (params.source) qs.set('source', params.source);
  if (params.q) qs.set('q', params.q);
  if (params.type) qs.set('type', params.type);
  const res = await fetch(`/api/feed?${qs.toString()}`);
  if (!res.ok) throw new Error('Nie udało się pobrać feedu');
  return (await res.json()).posts as Post[];
}

export async function fetchTags(): Promise<TagInfo[]> {
  const res = await fetch('/api/tags');
  if (!res.ok) throw new Error('Nie udało się pobrać tagów');
  return (await res.json()).tags as TagInfo[];
}

export async function fetchTypes(): Promise<TypeInfo[]> {
  const res = await fetch('/api/types');
  if (!res.ok) throw new Error('Nie udało się pobrać typów');
  return (await res.json()).types as TypeInfo[];
}

export async function fetchSources(): Promise<SourceInfo[]> {
  const res = await fetch('/api/sources');
  if (!res.ok) throw new Error('Nie udało się pobrać źródeł');
  return (await res.json()).sources as SourceInfo[];
}

export async function fetchSummary(id: string): Promise<{ enabled: boolean; summary?: Summary }> {
  const res = await fetch(`/api/summary?id=${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error('Nie udało się pobrać streszczenia');
  return res.json();
}

export async function fetchDigest(): Promise<{ enabled: boolean; text?: string; model?: string }> {
  const res = await fetch('/api/digest');
  if (!res.ok) throw new Error('Nie udało się pobrać digestu');
  return res.json();
}

export interface AskSource {
  n: number;
  title: string;
  source: string;
  link: string;
}
export interface Article {
  title: string;
  byline: string | null;
  siteName: string | null;
  excerpt: string | null;
  content: string;
  length: number;
  readMins: number;
  lang: string | null;
}
export async function fetchArticle(url: string): Promise<Article> {
  const res = await fetch(`/api/article?url=${encodeURIComponent(url)}`);
  if (!res.ok) throw new Error('Nie udało się wczytać artykułu');
  return res.json();
}

export interface ModelRelease {
  provider: string; family: string; version: string; date: string;
  kind: string; context: string; notes: string; link: string;
}
export async function fetchModels(): Promise<ModelRelease[]> {
  const res = await fetch('/api/models');
  if (!res.ok) throw new Error('Nie udało się pobrać modeli');
  return (await res.json()).releases;
}

export interface PaperItem { id: string; title: string; source: string; isoDate: string; link: string; tags: string[]; }
export async function fetchPapers(): Promise<PaperItem[]> {
  const res = await fetch('/api/papers');
  if (!res.ok) throw new Error('Nie udało się pobrać paper-ów');
  return (await res.json()).papers;
}

export interface PaperMeta {
  id: string; title: string; abstract: string; authors: string[];
  published: string | null; updated: string | null;
  absUrl: string; pdfUrl: string; codeUrl: string | null; bibtex: string;
}
export async function fetchPaper(id: string): Promise<PaperMeta> {
  const res = await fetch(`/api/papers/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error('Nie udało się pobrać metadanych');
  return res.json();
}
export async function explainPaper(id: string): Promise<{ enabled: boolean; text?: string }> {
  const res = await fetch(`/api/papers/${encodeURIComponent(id)}/explain`, { method: 'POST' });
  if (!res.ok) throw new Error('Nie udało się wyjaśnić');
  return res.json();
}

export async function askFeed(question: string): Promise<{ enabled: boolean; answer?: string; sources: AskSource[]; model?: string }> {
  const res = await fetch('/api/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });
  if (!res.ok) throw new Error('Zapytanie nie powiodło się');
  return res.json();
}
