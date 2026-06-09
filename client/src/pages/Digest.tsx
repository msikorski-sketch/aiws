import { useEffect, useState } from 'react';
import { Newspaper, Sparkles, RefreshCw } from 'lucide-react';
import { fetchDigest } from '../api';

// Tiny markdown renderer for bold, bullets, and headings.
function renderMd(text: string) {
  const bold = (s: string) =>
    s.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
      part.startsWith('**') && part.endsWith('**') ? (
        <strong key={i} className="text-gray-100">{part.slice(2, -2)}</strong>
      ) : (
        <span key={i}>{part}</span>
      ),
    );
  return text.split(/\r?\n/).filter((l) => l.trim()).map((line, i) => {
    const t = line.trim();
    if (/^#{1,6}\s/.test(t)) return <h2 key={i} className="mt-4 mb-1 text-lg font-bold text-gray-100">{bold(t.replace(/^#{1,6}\s/, ''))}</h2>;
    if (/^[-*]\s/.test(t)) return <li key={i} className="ml-5 list-disc text-gray-300 leading-relaxed">{bold(t.replace(/^[-*]\s/, ''))}</li>;
    return <p key={i} className="mb-2 text-gray-300 leading-relaxed">{bold(t)}</p>;
  });
}

export default function Digest() {
  const [text, setText] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(true);
  const [model, setModel] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetchDigest()
      .then((r) => { setEnabled(r.enabled); setText(r.text ?? null); setModel(r.model); })
      .catch(() => setEnabled(false))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-1 flex items-center gap-2">
        <Newspaper size={22} className="text-accent-2" />
        <h1 className="text-xl font-bold text-gray-100">Dzienny digest AI</h1>
        {model && <span className="ml-2 rounded-md bg-surface-2 px-2 py-0.5 text-[11px] text-gray-500">{model}</span>}
        <button onClick={load} className="ml-auto rounded-lg p-2 text-gray-400 hover:bg-surface-2" title="Odśwież">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
      <p className="mb-5 text-sm text-gray-500">Najważniejsze dzisiaj w AI — podsumowane przez Claude.</p>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-5 animate-pulse rounded bg-surface" style={{ width: `${60 + (i % 3) * 12}%` }} />
          ))}
        </div>
      ) : !enabled ? (
        <div className="rounded-2xl border border-border bg-surface p-6 text-gray-300">
          <div className="mb-2 flex items-center gap-2 font-semibold text-accent-2">
            <Sparkles size={16} /> Funkcja AI wyłączona
          </div>
          <p className="text-sm leading-relaxed text-gray-400">
            Aby włączyć dzienny digest i streszczenia TL;DR, dodaj klucz API Anthropic.
            Skopiuj <code className="rounded bg-surface-2 px-1">.env.example</code> do{' '}
            <code className="rounded bg-surface-2 px-1">server/.env</code>, wpisz{' '}
            <code className="rounded bg-surface-2 px-1">ANTHROPIC_API_KEY</code> i zrestartuj aplikację.
          </p>
        </div>
      ) : text ? (
        <div className="rounded-2xl border border-border bg-surface p-6">{renderMd(text)}</div>
      ) : (
        <div className="rounded-2xl border border-border bg-surface p-6 text-gray-400">Brak danych do digestu.</div>
      )}
    </div>
  );
}
