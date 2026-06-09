import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Post } from './types';

/* ---------- localStorage helpers ---------- */
function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function save<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota errors */
  }
}

const todayKey = () => new Date().toISOString().slice(0, 10);

interface Streak {
  current: number;
  longest: number;
  lastDay: string | null;
  days: string[]; // ISO yyyy-mm-dd that counted as a reading day
}

interface Weights {
  tags: Record<string, number>;
  sources: Record<string, number>;
  types: Record<string, number>;
}
const initialWeights: Weights = { tags: {}, sources: {}, types: {} };

interface StoreValue {
  upvoted: Record<string, boolean>;
  toggleUpvote: (id: string, post?: Post) => void;
  bookmarks: Record<string, Post>;
  toggleBookmark: (post: Post) => void;
  following: string[];
  toggleFollow: (tag: string) => void;
  streak: Streak;
  readToday: number;
  dailyGoal: number;
  recordRead: (id: string, post?: Post) => void;
  weights: Weights;
  scorePost: (post: Post) => number;
  resetWeights: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);
const DAILY_GOAL = 3;

export function StoreProvider({ children }: { children: ReactNode }) {
  const [upvoted, setUpvoted] = useState<Record<string, boolean>>(() => load('ad_upvoted', {}));
  const [bookmarks, setBookmarks] = useState<Record<string, Post>>(() => load('ad_bookmarks', {}));
  const [following, setFollowing] = useState<string[]>(() => load('ad_following', []));
  const [streak, setStreak] = useState<Streak>(() =>
    load('ad_streak', { current: 0, longest: 0, lastDay: null, days: [] }),
  );
  const [readToday, setReadToday] = useState<number>(() => {
    const r = load<{ day: string; count: number }>('ad_readtoday', { day: todayKey(), count: 0 });
    return r.day === todayKey() ? r.count : 0;
  });
  const [weights, setWeights] = useState<Weights>(() => load('ad_weights', initialWeights));
  useEffect(() => save('ad_weights', weights), [weights]);

  // Increment per-tag/source/type weights when the user interacts with a post.
  const learn = useCallback((post: Post | undefined, amount: number) => {
    if (!post) return;
    setWeights((w) => {
      const next: Weights = {
        tags: { ...w.tags },
        sources: { ...w.sources },
        types: { ...w.types },
      };
      for (const t of post.tags || []) next.tags[t] = (next.tags[t] || 0) + amount;
      if (post.source) next.sources[post.source] = (next.sources[post.source] || 0) + amount * 0.7;
      if (post.type) next.types[post.type] = (next.types[post.type] || 0) + amount * 0.5;
      return next;
    });
  }, []);

  useEffect(() => save('ad_upvoted', upvoted), [upvoted]);
  useEffect(() => save('ad_bookmarks', bookmarks), [bookmarks]);
  useEffect(() => save('ad_following', following), [following]);
  useEffect(() => save('ad_streak', streak), [streak]);

  const toggleUpvote = useCallback((id: string, post?: Post) => {
    setUpvoted((u) => {
      const willBe = !u[id];
      if (willBe) learn(post, 2);
      else learn(post, -2);
      return { ...u, [id]: willBe };
    });
  }, [learn]);

  const toggleBookmark = useCallback((post: Post) => {
    setBookmarks((b) => {
      const next = { ...b };
      if (next[post.id]) { delete next[post.id]; learn(post, -3); }
      else { next[post.id] = post; learn(post, 3); }
      return next;
    });
  }, [learn]);

  const toggleFollow = useCallback((tag: string) => {
    setFollowing((f) => {
      const has = f.includes(tag);
      setWeights((w) => ({ ...w, tags: { ...w.tags, [tag]: (w.tags[tag] || 0) + (has ? -4 : 4) } }));
      return has ? f.filter((t) => t !== tag) : [...f, tag];
    });
  }, []);

  // Called when the user actually opens an article to read it.
  const recordRead = useCallback((_id: string, post?: Post) => {
    learn(post, 1);
    const today = todayKey();
    setReadToday((c) => {
      const next = c + 1;
      save('ad_readtoday', { day: today, count: next });
      return next;
    });
    setStreak((s) => {
      if (s.lastDay === today) return s; // already counted today
      // Was the previous reading day yesterday? If so, continue the streak.
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      const current = s.lastDay === yesterday ? s.current + 1 : 1;
      return {
        current,
        longest: Math.max(s.longest, current),
        lastDay: today,
        days: s.days.includes(today) ? s.days : [...s.days, today].slice(-90),
      };
    });
  }, []);

  const scorePost = useCallback((post: Post): number => {
    let affinity = 0;
    for (const t of post.tags || []) affinity += Math.max(0, weights.tags[t] || 0);
    if (post.source) affinity += Math.max(0, weights.sources[post.source] || 0) * 0.7;
    if (post.type) affinity += Math.max(0, weights.types[post.type] || 0) * 0.5;
    return post.score * (1 + affinity * 0.15);
  }, [weights]);

  const resetWeights = useCallback(() => setWeights(initialWeights), []);

  const value = useMemo<StoreValue>(
    () => ({
      upvoted, toggleUpvote, bookmarks, toggleBookmark, following, toggleFollow,
      streak, readToday, dailyGoal: DAILY_GOAL, recordRead,
      weights, scorePost, resetWeights,
    }),
    [upvoted, bookmarks, following, streak, readToday, weights, toggleUpvote, toggleBookmark, toggleFollow, recordRead, scorePost, resetWeights],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
