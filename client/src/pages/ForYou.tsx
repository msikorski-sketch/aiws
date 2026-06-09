import { useEffect, useMemo, useState } from 'react';
import { Sparkles, RotateCcw, Hash } from 'lucide-react';
import { fetchFeed } from '../api';
import type { Post } from '../types';
import { FeedGrid, FeedSkeleton } from '../components/FeedGrid';
import { useStore } from '../store';

export default function ForYou() {
  const { scorePost, weights, resetWeights } = useStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchFeed({ sort: 'popular' }).then(setPosts).finally(() => setLoading(false));
  }, []);

  const ranked = useMemo(
    () => [...posts].sort((a, b) => scorePost(b) - scorePost(a)),
    [posts, scorePost],
  );

  const topTags = Object.entries(weights.tags)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  const totalSignal = topTags.reduce((a, [, v]) => a + v, 0);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-1 flex items-center gap-2">
        <Sparkles size={22} className="text-accent-2" />
        <h1 className="text-xl font-bold text-gray-100">Dla Ciebie</h1>
        {totalSignal > 0 && (
          <button
            onClick={() => { if (confirm('Wyzerować nauczone preferencje?')) resetWeights(); }}
            className="ml-auto flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-gray-500 hover:bg-surface-2 hover:text-gray-300"
            title="Zresetuj wagi"
          >
            <RotateCcw size={13} /> Resetuj
          </button>
        )}
      </div>
      <p className="mb-4 text-sm text-gray-500">
        Ranking ustawiony pod Ciebie — uczy się z Twoich głosów, zakładek, czytań i śledzonych tematów.
      </p>

      {totalSignal === 0 ? (
        <div className="mb-5 rounded-2xl border border-border bg-surface p-5 text-sm text-gray-400">
          <div className="mb-1 flex items-center gap-2 font-semibold text-accent-2">
            <Sparkles size={15} /> Aplikacja jeszcze Cię nie zna
          </div>
          Głosuj na artykuły, dodawaj zakładki, otwieraj treści i śledź tematy — feed dostosuje się sam.
        </div>
      ) : (
        <div className="mb-5 rounded-2xl border border-border bg-surface p-4">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <Hash size={12} /> Twoje główne tematy
          </div>
          <div className="flex flex-wrap gap-1.5">
            {topTags.map(([t, v]) => (
              <span key={t} className="rounded-full bg-accent/15 px-2.5 py-1 text-xs text-accent-2">
                #{t} <span className="text-gray-500">· {Math.round((v / totalSignal) * 100)}%</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {loading ? <FeedSkeleton /> : <FeedGrid posts={ranked} />}
    </div>
  );
}
