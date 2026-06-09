import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Hash } from 'lucide-react';
import { fetchTags } from '../api';
import type { TagInfo } from '../types';
import { useStore } from '../store';

export default function Tags() {
  const [tags, setTags] = useState<TagInfo[]>([]);
  const { following, toggleFollow } = useStore();

  useEffect(() => {
    fetchTags().then(setTags).catch(() => {});
  }, []);

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-2 flex items-center gap-2 text-xl font-bold text-gray-100">
        <Hash size={20} className="text-accent-2" /> Tematy AI
      </h1>
      <p className="mb-6 text-sm text-gray-500">
        Śledź tematy, które Cię interesują, aby spersonalizować swój feed.
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tags.map((t) => {
          const isFollowing = following.includes(t.name);
          return (
            <div
              key={t.name}
              className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent-2">
                <Hash size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <Link to={`/tag/${encodeURIComponent(t.name)}`} className="block truncate font-semibold text-gray-100 hover:text-accent-2">
                  {t.name}
                </Link>
                <span className="text-xs text-gray-500">{t.count} artykułów</span>
              </div>
              <button
                onClick={() => toggleFollow(t.name)}
                className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                  isFollowing
                    ? 'bg-accent text-white'
                    : 'border border-border text-gray-300 hover:border-accent'
                }`}
              >
                {isFollowing ? '✓ Śledzisz' : '+ Śledź'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
