import { useEffect, useState } from 'react';
import { Cpu, ExternalLink } from 'lucide-react';
import { fetchModels, type ModelRelease } from '../api';
import { sourceColor, initials } from '../utils';

const KIND_STYLE: Record<string, string> = {
  Frontier: 'bg-purple-500/15 text-purple-300',
  Balanced: 'bg-blue-500/15 text-blue-300',
  Reasoning: 'bg-pink-500/15 text-pink-300',
  Fast: 'bg-emerald-500/15 text-emerald-300',
  'Open weights': 'bg-amber-500/15 text-amber-300',
};

function ymd(iso: string) {
  return new Date(iso).toLocaleDateString('pl-PL', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function Models() {
  const [list, setList] = useState<ModelRelease[]>([]);
  const [provider, setProvider] = useState<string>('');

  useEffect(() => {
    fetchModels().then(setList).catch(() => {});
  }, []);

  const providers = [...new Set(list.map((m) => m.provider))];
  const filtered = provider ? list.filter((m) => m.provider === provider) : list;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-1 flex items-center gap-2">
        <Cpu size={22} className="text-accent-2" />
        <h1 className="text-xl font-bold text-gray-100">Premiery modeli AI</h1>
      </div>
      <p className="mb-5 text-sm text-gray-500">
        Kanon najważniejszych wydań modeli — kontekst, klasa, data, link do oficjalnego ogłoszenia.
      </p>

      {providers.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-1.5">
          <button
            onClick={() => setProvider('')}
            className={`rounded-full px-3 py-1 text-xs font-medium ${!provider ? 'bg-accent text-white' : 'border border-border text-gray-400 hover:border-accent hover:text-gray-200'}`}
          >
            Wszyscy
          </button>
          {providers.map((p) => (
            <button
              key={p}
              onClick={() => setProvider(p)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${provider === p ? 'bg-accent text-white' : 'border border-border text-gray-400 hover:border-accent hover:text-gray-200'}`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      <ul className="relative space-y-3 border-l-2 border-border pl-5">
        {filtered.map((m) => (
          <li
            key={`${m.provider}-${m.version}-${m.date}`}
            className="relative rounded-2xl border border-border bg-surface p-4 transition hover:border-accent/60"
          >
            <span
              className="absolute -left-[27px] top-5 flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-white"
              style={{ backgroundColor: sourceColor(m.provider) }}
            >
              {initials(m.provider)}
            </span>
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className="font-semibold text-gray-100">
                {m.provider} {m.family} {m.version}
              </span>
              <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase ${KIND_STYLE[m.kind] || 'bg-gray-500/15 text-gray-300'}`}>
                {m.kind}
              </span>
              <span className="rounded-md bg-surface-2 px-1.5 py-0.5 text-[10px] text-gray-400">
                context {m.context}
              </span>
              <a
                href={m.link}
                target="_blank"
                rel="noreferrer"
                className="ml-auto rounded-lg p-1 text-gray-500 hover:bg-surface-2 hover:text-gray-200"
                title="Ogłoszenie"
              >
                <ExternalLink size={14} />
              </a>
            </div>
            <p className="mb-1 text-[13px] text-gray-400">{m.notes}</p>
            <div className="text-[11px] text-gray-600">{ymd(m.date)}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
