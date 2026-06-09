import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Radio, ExternalLink } from 'lucide-react';
import { fetchSources } from '../api';
import type { SourceInfo } from '../types';
import { sourceColor, initials } from '../utils';

export default function Sources() {
  const [sources, setSources] = useState<SourceInfo[]>([]);

  useEffect(() => {
    fetchSources().then(setSources).catch(() => {});
  }, []);

  const byCategory = sources.reduce<Record<string, SourceInfo[]>>((acc, s) => {
    (acc[s.category] ??= []).push(s);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-2 flex items-center gap-2 text-xl font-bold text-gray-100">
        <Radio size={20} className="text-accent-2" /> Źródła AI
      </h1>
      <p className="mb-6 text-sm text-gray-500">
        {sources.length} starannie dobranych źródeł poświęconych wyłącznie sztucznej inteligencji.
      </p>

      {Object.entries(byCategory).map(([cat, list]) => (
        <section key={cat} className="mb-7">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-600">{cat}</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((s) => (
              <div key={s.name} className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
                  style={{ backgroundColor: sourceColor(s.name) }}
                >
                  {initials(s.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/?source=${encodeURIComponent(s.name)}`}
                    className="block truncate font-semibold text-gray-100 hover:text-accent-2"
                  >
                    {s.name}
                  </Link>
                  <span className="text-xs text-gray-500">{s.count} w feedzie</span>
                </div>
                <a
                  href={s.homepage}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 rounded-lg p-2 text-gray-400 transition hover:bg-surface-2 hover:text-gray-200"
                  title="Otwórz stronę źródła"
                >
                  <ExternalLink size={16} />
                </a>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
