import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Search, Github } from 'lucide-react';

export default function Topbar() {
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');
  const navigate = useNavigate();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(q.trim() ? `/?q=${encodeURIComponent(q.trim())}` : '/');
  };

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-bg/90 px-4 py-3 backdrop-blur">
      <Link to="/" className="flex items-center gap-2">
        <span className="text-2xl">🤖</span>
        <span className="hidden text-lg font-extrabold tracking-tight sm:block">
          AI<span className="text-accent-2">Daily</span>
        </span>
      </Link>

      <form onSubmit={submit} className="relative mx-auto w-full max-w-xl">
        <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Szukaj w wiadomościach o AI…"
          className="w-full rounded-xl border border-border bg-surface py-2 pl-9 pr-3 text-sm text-gray-200 outline-none transition focus:border-accent"
        />
      </form>

      <a
        href="https://daily.dev"
        target="_blank"
        rel="noreferrer"
        className="hidden items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-2 text-sm text-gray-300 transition hover:border-accent sm:flex"
      >
        <Github size={16} /> Inspiracja
      </a>
    </header>
  );
}
