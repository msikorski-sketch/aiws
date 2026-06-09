import { useState } from 'react';
import { Sparkles, Send, ExternalLink } from 'lucide-react';
import { askFeed, type AskSource } from '../api';

// Render answer text, turning [n] markers into superscript citation links.
function renderAnswer(text: string, sources: AskSource[]) {
  return text.split(/(\[\d+\])/g).map((part, i) => {
    const m = part.match(/^\[(\d+)\]$/);
    if (m) {
      const n = Number(m[1]);
      const src = sources.find((s) => s.n === n);
      return (
        <a
          key={i}
          href={src?.link}
          target="_blank"
          rel="noreferrer"
          title={src?.title}
          className="mx-0.5 rounded bg-accent/20 px-1 text-[11px] font-semibold text-accent-2 align-super hover:bg-accent/40"
        >
          {n}
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

const SUGGESTIONS = [
  'Co nowego w modelach językowych w tym tygodniu?',
  'Jakie premiery narzędzi open-source dla AI?',
  'Co się dzieje wokół agentów AI?',
  'Najważniejsze paper’y o RAG i retrieval?',
];

export default function Ask() {
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [sources, setSources] = useState<AskSource[]>([]);
  const [enabled, setEnabled] = useState(true);
  const [asked, setAsked] = useState('');

  const ask = async (question: string) => {
    if (!question.trim() || loading) return;
    setLoading(true);
    setAnswer(null);
    setSources([]);
    setAsked(question);
    try {
      const r = await askFeed(question);
      setEnabled(r.enabled);
      setAnswer(r.answer ?? null);
      setSources(r.sources || []);
    } catch {
      setEnabled(true);
      setAnswer('Wystąpił błąd. Spróbuj ponownie.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-1 flex items-center gap-2">
        <Sparkles size={22} className="text-accent-2" />
        <h1 className="text-xl font-bold text-gray-100">Zapytaj feed</h1>
      </div>
      <p className="mb-5 text-sm text-gray-500">
        Zadaj pytanie po polsku — Claude odpowie na podstawie dzisiejszych artykułów z feedu, z odnośnikami do źródeł.
      </p>

      <form
        onSubmit={(e) => { e.preventDefault(); ask(q); }}
        className="mb-4 flex gap-2"
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="np. Co nowego u OpenAI i Anthropic?"
          className="flex-1 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-gray-200 outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent/80 disabled:opacity-50"
        >
          <Send size={15} /> Pytaj
        </button>
      </form>

      {!answer && !loading && (
        <div className="mb-4 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => { setQ(s); ask(s); }}
              className="rounded-full border border-border px-3 py-1.5 text-xs text-gray-400 transition hover:border-accent hover:text-gray-200"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-4 animate-pulse rounded bg-surface" style={{ width: `${70 + (i % 3) * 10}%` }} />
          ))}
        </div>
      )}

      {asked && !loading && (
        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="mb-3 text-sm font-semibold text-gray-300">„{asked}"</div>

          {!enabled ? (
            <div className="text-sm leading-relaxed text-gray-400">
              <div className="mb-2 flex items-center gap-2 font-semibold text-accent-2">
                <Sparkles size={15} /> Odpowiedzi AI wyłączone
              </div>
              Dodaj <code className="rounded bg-surface-2 px-1">ANTHROPIC_API_KEY</code> w{' '}
              <code className="rounded bg-surface-2 px-1">server/.env</code>, aby Claude generował odpowiedzi.
              Poniżej i tak najtrafniejsze artykuły z feedu:
            </div>
          ) : answer ? (
            <div className="text-[14px] leading-relaxed text-gray-200">{renderAnswer(answer, sources)}</div>
          ) : null}

          {sources.length > 0 && (
            <div className="mt-4 border-t border-border pt-3">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-600">Źródła</div>
              <ol className="space-y-1.5">
                {sources.map((s) => (
                  <li key={s.n} className="flex items-start gap-2 text-sm">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-accent/20 text-[11px] font-bold text-accent-2">{s.n}</span>
                    <a href={s.link} target="_blank" rel="noreferrer" className="flex-1 text-gray-300 hover:text-accent-2">
                      {s.title} <span className="text-gray-600">· {s.source}</span>
                    </a>
                    <ExternalLink size={13} className="mt-1 text-gray-600" />
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
