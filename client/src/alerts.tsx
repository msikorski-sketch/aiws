import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Post } from './types';
import { fetchFeed } from './api';

export interface Alert {
  id: string;
  query: string;
  createdAt: number;
  lastSeen?: string; // ISO of newest matching post we already showed
  hits?: number;
}

interface Value {
  alerts: Alert[];
  add: (query: string) => void;
  remove: (id: string) => void;
  permission: NotificationPermission | 'unsupported';
  requestPermission: () => Promise<void>;
}

const Ctx = createContext<Value | null>(null);
const KEY = 'ad_alerts';
const POLL_MS = 5 * 60 * 1000; // 5 minutes

function load(): Alert[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}
function save(a: Alert[]) {
  try { localStorage.setItem(KEY, JSON.stringify(a)); } catch {}
}

export function AlertsProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>(() => load());
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(
    typeof Notification === 'undefined' ? 'unsupported' : Notification.permission,
  );

  useEffect(() => save(alerts), [alerts]);

  const add = useCallback((query: string) => {
    const q = query.trim();
    if (!q) return;
    setAlerts((a) => [
      ...a,
      { id: crypto.randomUUID?.() ?? String(Date.now()), query: q, createdAt: Date.now(), hits: 0 },
    ]);
  }, []);

  const remove = useCallback((id: string) => {
    setAlerts((a) => a.filter((x) => x.id !== id));
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') return;
    const p = await Notification.requestPermission();
    setPermission(p);
  }, []);

  // Background polling: check each alert against the feed, notify on new hits.
  useEffect(() => {
    let stopped = false;
    const check = async () => {
      const list = load();
      if (!list.length) return;
      for (const a of list) {
        try {
          const posts = await fetchFeed({ q: a.query, sort: 'recent' });
          if (!posts.length) continue;
          const newest = posts[0];
          const lastSeen = a.lastSeen ? new Date(a.lastSeen).getTime() : 0;
          const fresh: Post[] = posts.filter((p) => new Date(p.isoDate).getTime() > lastSeen);
          if (fresh.length && a.lastSeen && permission === 'granted') {
            const title = `AI Daily · „${a.query}"`;
            const body = fresh.length === 1
              ? fresh[0].title
              : `${fresh.length} nowych wyników, np.: ${fresh[0].title}`;
            new Notification(title, { body, tag: a.id, icon: '/icon-192.png' });
          }
          a.lastSeen = newest.isoDate;
          a.hits = posts.length;
        } catch {
          /* network blip — skip */
        }
      }
      if (!stopped) setAlerts([...list]);
    };
    check();
    const t = setInterval(check, POLL_MS);
    return () => { stopped = true; clearInterval(t); };
  }, [permission]);

  const value = useMemo<Value>(() => ({ alerts, add, remove, permission, requestPermission }), [alerts, add, remove, permission, requestPermission]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAlerts() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAlerts must be used within AlertsProvider');
  return ctx;
}
