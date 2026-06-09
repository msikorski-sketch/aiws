import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import StreakWidget from './StreakWidget';
import { fetchTags } from '../api';
import type { TagInfo } from '../types';
import { useStore } from '../store';

export default function RightRail() {
  const [tags, setTags] = useState<TagInfo[]>([]);
  const { following, toggleFollow } = useStore();

  useEffect(() => {
    fetchTags().then(setTags).catch(() => {});
  }, []);

  return (
    <aside className="hidden w-72 shrink-0 flex-col gap-4 overflow-y-auto border-l border-border bg-bg px-4 py-4 lg:flex">
      <StreakWidget />

      <div className="rounded-2xl border border-border bg-surface p-4">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles size={18} className="text-accent-2" />
          <span className="text-sm font-semibold text-gray-200">Popularne tematy</span>
        </div>
        <div className="flex flex-col gap-1">
          {tags.slice(0, 10).map((t) => {
            const isFollowing = following.includes(t.name);
            return (
              <div key={t.name} className="flex items-center gap-2">
                <Link
                  to={`/tag/${encodeURIComponent(t.name)}`}
                  className="flex-1 truncate rounded-lg px-2 py-1.5 text-sm text-gray-300 transition hover:bg-surface-2"
                >
                  #{t.name}
                  <span className="ml-1 text-xs text-gray-600">{t.count}</span>
                </Link>
                <button
                  onClick={() => toggleFollow(t.name)}
                  className={`rounded-lg px-2 py-1 text-xs font-medium transition ${
                    isFollowing
                      ? 'bg-accent text-white'
                      : 'border border-border text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {isFollowing ? 'Śledzisz' : '+ Śledź'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
