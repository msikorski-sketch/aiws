import { useState } from 'react';
import { ArrowBigUp, Bookmark, MessageSquare, Clock, ExternalLink, Sparkles, Layers, Zap, BookOpen } from 'lucide-react';
import type { Post, Summary } from '../types';
import { useStore } from '../store';
import { useReader } from '../reader-context';
import { fetchSummary } from '../api';
import { timeAgo, sourceColor, initials, formatNum } from '../utils';

const TYPE_STYLE: Record<string, string> = {
  Paper: 'bg-blue-500/15 text-blue-300',
  Release: 'bg-green-500/15 text-green-300',
  Tool: 'bg-amber-500/15 text-amber-300',
  Tutorial: 'bg-pink-500/15 text-pink-300',
  Opinion: 'bg-purple-500/15 text-purple-300',
  News: 'bg-gray-500/15 text-gray-300',
};

export default function PostCard({ post, selected = false }: { post: Post; selected?: boolean }) {
  const { upvoted, toggleUpvote, bookmarks, toggleBookmark, recordRead } = useStore();
  const { openReader } = useReader();
  const isUp = !!upvoted[post.id];
  const isSaved = !!bookmarks[post.id];
  const color = sourceColor(post.source);
  const displayUp = post.upvotes + (isUp ? 1 : 0);

  const [summary, setSummary] = useState<Summary | null>(null);
  const [sumState, setSumState] = useState<'idle' | 'loading' | 'off' | 'error'>('idle');

  const open = () => {
    recordRead(post.id, post);
    window.open(post.link, '_blank', 'noopener,noreferrer');
  };

  const read = () => openReader(post);

  const loadSummary = async () => {
    if (summary || sumState === 'loading') return;
    setSumState('loading');
    try {
      const r = await fetchSummary(post.id);
      if (!r.enabled) setSumState('off');
      else if (r.summary) { setSummary(r.summary); setSumState('idle'); }
      else setSumState('error');
    } catch {
      setSumState('error');
    }
  };

  return (
    <article
      data-card
      className={`animate-fadein group flex flex-col rounded-2xl border bg-surface p-4 transition hover:border-accent/60 hover:shadow-lg hover:shadow-accent/5 ${
        selected ? 'border-accent ring-2 ring-accent/40' : 'border-border'
      }`}
    >
      {/* source row */}
      <div className="mb-3 flex items-center gap-2">
        <span
          className="flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-bold text-white"
          style={{ backgroundColor: color }}
        >
          {initials(post.source)}
        </span>
        <span className="truncate text-sm text-gray-300">{post.source}</span>
        {post.realSignal && (
          <span title="Prawdziwy sygnał (głosy/gwiazdki ze źródła)">
            <Zap size={13} className="text-emerald-400" />
          </span>
        )}
        <span className="ml-auto text-xs text-gray-500">{timeAgo(post.isoDate)}</span>
      </div>

      {/* badges */}
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        {post.type && (
          <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${TYPE_STYLE[post.type] || TYPE_STYLE.News}`}>
            {post.type}
          </span>
        )}
        {post.sourceCount && post.sourceCount > 1 && (
          <span
            className="flex items-center gap-1 rounded-md bg-accent/15 px-1.5 py-0.5 text-[10px] font-semibold text-accent-2"
            title={`Opisywane przez: ${post.clusterSources?.join(', ')}`}
          >
            <Layers size={11} /> {post.sourceCount} źródła
          </span>
        )}
      </div>

      {/* title */}
      <h3
        onClick={read}
        className="mb-2 cursor-pointer text-[15px] font-semibold leading-snug text-gray-100 line-clamp-3 group-hover:text-accent-2"
      >
        {post.title}
      </h3>

      {post.image && (
        <img
          src={post.image}
          alt=""
          loading="lazy"
          onClick={open}
          onError={(e) => (e.currentTarget.style.display = 'none')}
          className="mb-3 h-40 w-full cursor-pointer rounded-xl object-cover"
        />
      )}

      <p className="mb-2 text-[13px] leading-relaxed text-gray-400 line-clamp-3">{post.snippet}</p>

      {/* AI TL;DR */}
      {summary ? (
        <div className="mb-3 rounded-xl border border-accent/30 bg-accent/5 p-2.5 text-[12.5px] leading-relaxed text-gray-300">
          <div className="mb-1 flex items-center gap-1 font-semibold text-accent-2">
            <Sparkles size={12} /> TL;DR
          </div>
          {summary.tldr}
          {summary.why_it_matters && (
            <div className="mt-1 text-gray-400">
              <span className="text-gray-500">Czemu ważne: </span>
              {summary.why_it_matters}
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={loadSummary}
          className="mb-3 flex w-fit items-center gap-1 rounded-lg border border-border px-2 py-1 text-[11px] font-medium text-gray-400 transition hover:border-accent hover:text-accent-2"
        >
          <Sparkles size={12} />
          {sumState === 'loading'
            ? 'Streszczam…'
            : sumState === 'off'
              ? 'TL;DR — dodaj klucz API'
              : sumState === 'error'
                ? 'Spróbuj ponownie'
                : 'TL;DR (AI)'}
        </button>
      )}

      <div className="mb-3 flex flex-wrap gap-1.5">
        {post.tags.map((t) => (
          <span key={t} className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-accent-2">
            #{t}
          </span>
        ))}
      </div>

      {/* footer actions */}
      <div className="mt-auto flex items-center gap-1 border-t border-border pt-3 text-gray-400">
        <button
          onClick={() => toggleUpvote(post.id, post)}
          className={`flex items-center gap-1 rounded-lg px-2 py-1 text-sm transition hover:bg-surface-2 ${isUp ? 'text-accent-2' : ''}`}
          title={post.realSignal ? 'Głosy ze źródła' : 'Głosuj w górę'}
        >
          <ArrowBigUp size={18} className={isUp ? 'fill-accent-2' : ''} />
          {formatNum(displayUp)}
        </button>
        <span className="flex items-center gap-1 px-2 py-1 text-sm" title="Komentarze">
          <MessageSquare size={16} />
          {formatNum(post.comments)}
        </span>
        <span className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500" title="Czas czytania">
          <Clock size={14} />
          {post.readMins} min
        </span>
        <button
          onClick={read}
          className="ml-auto rounded-lg p-1.5 transition hover:bg-surface-2"
          title="Czytaj w aplikacji (r)"
        >
          <BookOpen size={16} />
        </button>
        <button
          onClick={() => toggleBookmark(post)}
          className={`rounded-lg p-1.5 transition hover:bg-surface-2 ${isSaved ? 'text-accent-2' : ''}`}
          title={isSaved ? 'Usuń z zakładek' : 'Zapisz'}
        >
          <Bookmark size={17} className={isSaved ? 'fill-accent-2' : ''} />
        </button>
        <button onClick={open} className="rounded-lg p-1.5 transition hover:bg-surface-2" title="Otwórz oryginał">
          <ExternalLink size={16} />
        </button>
      </div>
    </article>
  );
}
