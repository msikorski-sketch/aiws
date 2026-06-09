import { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Clock, TrendingUp, MessageSquare, Flame, Hash, Keyboard } from 'lucide-react';
import { fetchFeed, fetchTypes } from '../api';
import type { Post, SortMode, TypeInfo } from '../types';
import { FeedGrid, FeedSkeleton } from '../components/FeedGrid';
import { useStore } from '../store';
import { useReader } from '../reader-context';

const SORTS: { key: SortMode; label: string; icon: typeof Clock }[] = [
  { key: 'recent', label: 'Najnowsze', icon: Clock },
  { key: 'popular', label: 'Popularne', icon: TrendingUp },
  { key: 'discussed', label: 'Dyskutowane', icon: MessageSquare },
  { key: 'upvoted', label: 'Najwyżej oceniane', icon: Flame },
];

export default function Feed() {
  const [params, setParams] = useSearchParams();
  const { tag } = useParams();
  const q = params.get('q') ?? '';
  const source = params.get('source') ?? '';
  const type = params.get('type') ?? '';
  const sort = (params.get('sort') as SortMode) ?? 'recent';

  const [posts, setPosts] = useState<Post[]>([]);
  const [types, setTypes] = useState<TypeInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sel, setSel] = useState(-1);
  const { following, toggleFollow, toggleUpvote, toggleBookmark, recordRead } = useStore();
  const { openReader } = useReader();
  const postsRef = useRef<Post[]>([]);
  postsRef.current = posts;

  useEffect(() => {
    fetchTypes().then(setTypes).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setSel(-1);
    fetchFeed({ sort, q: q || undefined, tag, source: source || undefined, type: type || undefined })
      .then(setPosts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [sort, q, tag, source, type]);

  // keyboard shortcuts: j/k navigate, o open, b bookmark, u upvote
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) return;
      const list = postsRef.current;
      if (!list.length) return;
      const cur = list[sel];
      switch (e.key) {
        case 'j':
          setSel((s) => Math.min(list.length - 1, s + 1));
          break;
        case 'k':
          setSel((s) => Math.max(0, s - 1));
          break;
        case 'o':
          if (cur) { recordRead(cur.id, cur); window.open(cur.link, '_blank', 'noopener,noreferrer'); }
          break;
        case 'r':
          if (cur) openReader(cur);
          break;
        case 'b':
          if (cur) toggleBookmark(cur);
          break;
        case 'u':
          if (cur) toggleUpvote(cur.id, cur);
          break;
        default:
          return;
      }
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sel, recordRead, toggleBookmark, toggleUpvote, openReader]);

  // scroll the selected card into view
  useEffect(() => {
    if (sel < 0) return;
    const cards = document.querySelectorAll('[data-card]');
    cards[sel]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [sel]);

  const setSort = (s: SortMode) => {
    const next = new URLSearchParams(params);
    next.set('sort', s);
    setParams(next);
  };
  const setType = (t: string) => {
    const next = new URLSearchParams(params);
    if (t) next.set('type', t);
    else next.delete('type');
    setParams(next);
  };

  const heading = tag ? `#${tag}` : source ? source : q ? `Wyniki: „${q}”` : 'Mój feed AI';

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h1 className="flex items-center gap-2 text-xl font-bold text-gray-100">
          {tag && <Hash size={20} className="text-accent-2" />}
          {heading}
        </h1>
        {tag && (
          <button
            onClick={() => toggleFollow(tag)}
            className={`rounded-xl px-3 py-1.5 text-sm font-medium transition ${
              following.includes(tag) ? 'bg-accent text-white' : 'border border-border text-gray-300 hover:border-accent'
            }`}
          >
            {following.includes(tag) ? '✓ Śledzisz' : '+ Śledź temat'}
          </button>
        )}
        <span className="ml-auto hidden items-center gap-1 text-[11px] text-gray-600 lg:flex">
          <Keyboard size={13} /> j/k · r czytaj · o otwórz · b zakładka · u głos
        </span>
      </div>

      {/* type filter chips */}
      {types.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          <Chip active={!type} onClick={() => setType('')} label="Wszystko" />
          {types.map((t) => (
            <Chip key={t.name} active={type === t.name} onClick={() => setType(t.name)} label={`${t.name} ${t.count}`} />
          ))}
        </div>
      )}

      {/* sort tabs */}
      <div className="mb-5 flex gap-1 overflow-x-auto border-b border-border">
        {SORTS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setSort(key)}
            className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition ${
              sort === key ? 'border-accent text-white' : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {loading ? (
        <FeedSkeleton />
      ) : error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-6 text-center text-red-300">
          {error}. Upewnij się, że serwer API działa (npm run dev).
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-10 text-center text-gray-400">
          Brak wyników. Spróbuj innego zapytania, typu lub tematu.
        </div>
      ) : (
        <FeedGrid posts={posts} selectedId={sel >= 0 ? posts[sel]?.id : undefined} />
      )}
    </div>
  );
}

function Chip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-medium transition ${
        active ? 'bg-accent text-white' : 'border border-border text-gray-400 hover:border-accent hover:text-gray-200'
      }`}
    >
      {label}
    </button>
  );
}
