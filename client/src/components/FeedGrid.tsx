import type { Post } from '../types';
import PostCard from './PostCard';

export function FeedGrid({ posts, selectedId }: { posts: Post[]; selectedId?: string }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {posts.map((p) => (
        <PostCard key={p.id} post={p} selected={p.id === selectedId} />
      ))}
    </div>
  );
}

export function FeedSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="h-64 animate-pulse rounded-2xl border border-border bg-surface" />
      ))}
    </div>
  );
}
