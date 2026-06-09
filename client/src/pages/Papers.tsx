import { useEffect, useState } from 'react';
import { FileText, Code2, FileDown, Copy, Sparkles, Check, X } from 'lucide-react';
import { fetchPapers, fetchPaper, explainPaper, type PaperItem, type PaperMeta } from '../api';
import { timeAgo } from '../utils';

export default function Papers() {
  const [list, setList] = useState<PaperItem[]>([]);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    fetchPapers().then(setList).catch(() => {});
  }, []);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-1 flex items-center gap-2">
        <FileText size={22} className="text-accent-2" />
        <h1 className="text-xl font-bold text-gray-100">Paper'y arXiv</h1>
      </div>
      <p className="mb-5 text-sm text-gray-500">
        Świeże publikacje arXiv z feedu — rozwiń, aby zobaczyć abstrakt, kod (Papers-with-Code), PDF, BibTeX
        i „Wyjaśnij paper" (AI).
      </p>

      {list.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-10 text-center text-gray-400">
          Brak paper-ów w bieżącym feedzie.
        </div>
      ) : (
        <ul className="space-y-3">
          {list.map((p) => (
            <li key={p.id} className="rounded-2xl border border-border bg-surface">
              <button
                onClick={() => setOpen((o) => (o === p.id ? null : p.id))}
                className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-surface-2"
              >
                <FileText size={16} className="mt-1 shrink-0 text-accent-2" />
                <div className="flex-1">
                  <div className="font-medium text-gray-100 line-clamp-2">{p.title}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-gray-500">
                    <span>arXiv:{p.id}</span>
                    <span>·</span>
                    <span>{timeAgo(p.isoDate)}</span>
                    {p.tags.slice(0, 3).map((t) => (
                      <span key={t} className="rounded-full bg-surface-2 px-1.5 text-accent-2">#{t}</span>
                    ))}
                  </div>
                </div>
              </button>
              {open === p.id && <PaperDetail id={p.id} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function PaperDetail({ id }: { id: string }) {
  const [meta, setMeta] = useState<PaperMeta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [explainState, setExplainState] = useState<'idle' | 'loading' | 'off' | 'error'>('idle');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchPaper(id).then(setMeta).catch((e) => setError(e.message));
  }, [id]);

  const explain = async () => {
    if (!meta || explainState === 'loading') return;
    setExplainState('loading');
    try {
      const r = await explainPaper(id);
      if (!r.enabled) setExplainState('off');
      else if (r.text) { setExplanation(r.text); setExplainState('idle'); }
      else setExplainState('error');
    } catch {
      setExplainState('error');
    }
  };

  const copyBibtex = () => {
    if (!meta) return;
    navigator.clipboard.writeText(meta.bibtex);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  if (error) return <div className="border-t border-border px-4 py-3 text-sm text-red-300">{error}</div>;
  if (!meta) return (
    <div className="space-y-2 border-t border-border px-4 py-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-3 animate-pulse rounded bg-surface-2" style={{ width: `${65 + (i % 3) * 10}%` }} />
      ))}
    </div>
  );

  return (
    <div className="border-t border-border px-4 py-4">
      {meta.authors.length > 0 && (
        <p className="mb-2 text-xs text-gray-500">{meta.authors.slice(0, 6).join(', ')}{meta.authors.length > 6 ? ' i in.' : ''}</p>
      )}
      <p className="mb-4 whitespace-pre-line text-[13px] leading-relaxed text-gray-300">{meta.abstract}</p>

      <div className="mb-4 flex flex-wrap gap-2">
        <a
          href={meta.pdfUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs text-gray-300 hover:border-accent hover:text-accent-2"
        >
          <FileDown size={13} /> PDF
        </a>
        {meta.codeUrl && (
          <a
            href={meta.codeUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs text-gray-300 hover:border-accent hover:text-accent-2"
          >
            <Code2 size={13} /> Kod
          </a>
        )}
        <button
          onClick={copyBibtex}
          className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs text-gray-300 hover:border-accent hover:text-accent-2"
        >
          {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          {copied ? 'Skopiowane' : 'BibTeX'}
        </button>
        <button
          onClick={explain}
          disabled={explainState === 'loading'}
          className="ml-auto flex items-center gap-1 rounded-lg bg-accent/15 px-2.5 py-1.5 text-xs font-medium text-accent-2 hover:bg-accent/25 disabled:opacity-60"
        >
          {explainState === 'loading' ? (
            <>… Wyjaśniam</>
          ) : explainState === 'off' ? (
            <><X size={13} /> Brak klucza AI</>
          ) : (
            <><Sparkles size={13} /> Wyjaśnij paper</>
          )}
        </button>
      </div>

      {explanation && (
        <div className="rounded-xl border border-accent/30 bg-accent/5 p-3 text-[13px] leading-relaxed text-gray-200">
          <div className="mb-1 flex items-center gap-1 font-semibold text-accent-2">
            <Sparkles size={12} /> Wyjaśnienie (AI)
          </div>
          {explanation}
        </div>
      )}
    </div>
  );
}
