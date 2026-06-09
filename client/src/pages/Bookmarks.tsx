import { Bookmark } from 'lucide-react';
import { useStore } from '../store';
import { FeedGrid } from '../components/FeedGrid';

export default function Bookmarks() {
  const { bookmarks } = useStore();
  const list = Object.values(bookmarks).sort(
    (a, b) => new Date(b.isoDate).getTime() - new Date(a.isoDate).getTime(),
  );

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="mb-5 flex items-center gap-2 text-xl font-bold text-gray-100">
        <Bookmark size={20} className="text-accent-2" /> Twoje zakładki
        <span className="text-sm font-normal text-gray-500">({list.length})</span>
      </h1>

      {list.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-10 text-center text-gray-400">
          Nie masz jeszcze zapisanych artykułów. Kliknij ikonę zakładki na karcie, aby zapisać.
        </div>
      ) : (
        <FeedGrid posts={list} />
      )}
    </div>
  );
}
