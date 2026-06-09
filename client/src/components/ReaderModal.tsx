import { useEffect, useState } from 'react';
import { X, ExternalLink, Clock, Bookmark } from 'lucide-react';
import type { Post } from '../types';
import { fetchArticle, type Article } from '../api';
import { useStore } from '../store';

interface Props {
  post: Post | null;
  onClose: () => void;
}

export default function ReaderModal({ post, onClose }: Props) {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { bookmarks, toggleBookmark, recordRead } = useStore();

  useEffect(() => {
    if (!post) return;
    setArticle(null);
    setError(null);
    setLoading(true);
    fetchArticle(post.link)
      .then((a) => {
        setArticle(a);
        recordRead(post.id, post); // streak counts when content actually loads
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [post, recordRead]);

  useEffect(() => {
    if (!post) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [post, onClose]);

  if (!post) return null;
  const saved = !!bookmarks[post.id];

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative my-6 max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-border bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* sticky header */}
        <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-border bg-surface/95 px-4 py-3 backdrop-blur">
          <span className="text-sm text-gray-400">{post.source}</span>
          {article?.readMins && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Clock size={12} /> {article.readMins} min
            </span>
          )}
          <button
            onClick={() => toggleBookmark(post)}
            className={`ml-auto rounded-lg p-2 hover:bg-surface-2 ${saved ? 'text-accent-2' : 'text-gray-400'}`}
            title={saved ? 'Usuń z zakładek' : 'Zapisz'}
          >
            <Bookmark size={17} className={saved ? 'fill-accent-2' : ''} />
          </button>
          <a
            href={post.link}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg p-2 text-gray-400 hover:bg-surface-2"
            title="Otwórz oryginał"
          >
            <ExternalLink size={17} />
          </a>
          <button onClick={onClose} className="rounded-lg p-2 text-gray-400 hover:bg-surface-2" title="Zamknij (Esc)">
            <X size={18} />
          </button>
        </div>

        {/* body */}
        <div className="px-6 py-6 sm:px-10 sm:py-8">
          <h1 className="mb-2 text-2xl font-bold leading-tight text-gray-100">{article?.title || post.title}</h1>
          {(article?.byline || post.source) && (
            <p className="mb-6 text-sm text-gray-500">
              {article?.byline || post.source}
              {article?.siteName && article.siteName !== post.source ? ` · ${article.siteName}` : ''}
            </p>
          )}

          {loading && (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-4 animate-pulse rounded bg-surface-2" style={{ width: `${65 + (i % 4) * 9}%` }} />
              ))}
            </div>
          )}

          {error && !loading && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-300">
              Nie udało się wyodrębnić treści: {error}.{' '}
              <a href={post.link} target="_blank" rel="noreferrer" className="underline">
                Otwórz oryginał
              </a>
              .
            </div>
          )}

          {article && (
            <article
              className="prose-reader"
              // Server uses Mozilla Readability which sanitizes the content.
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
