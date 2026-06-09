import { createContext, useCallback, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Post } from './types';
import ReaderModal from './components/ReaderModal';

interface Ctx {
  openReader: (post: Post) => void;
  close: () => void;
}
const ReaderCtx = createContext<Ctx | null>(null);

export function ReaderProvider({ children }: { children: ReactNode }) {
  const [post, setPost] = useState<Post | null>(null);
  const openReader = useCallback((p: Post) => setPost(p), []);
  const close = useCallback(() => setPost(null), []);
  return (
    <ReaderCtx.Provider value={{ openReader, close }}>
      {children}
      <ReaderModal post={post} onClose={close} />
    </ReaderCtx.Provider>
  );
}

export function useReader() {
  const ctx = useContext(ReaderCtx);
  if (!ctx) throw new Error('useReader must be used within ReaderProvider');
  return ctx;
}
