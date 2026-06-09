import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Trend {
  tag: string;
  total: number;
  growth: number;
  series: number[];
}

// Minimal SVG sparkline.
function Sparkline({ data, color = '#a78bfa' }: { data: number[]; color?: string }) {
  if (!data.length) return null;
  const w = 120, h = 32, p = 2;
  const max = Math.max(1, ...data);
  const step = (w - 2 * p) / Math.max(1, data.length - 1);
  const pts = data.map((v, i) => `${p + i * step},${h - p - (v / max) * (h - 2 * p)}`).join(' ');
  const last = pts.split(' ').pop()!;
  const [lx, ly] = last.split(',').map(Number);
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={lx} cy={ly} r="2.5" fill={color} />
    </svg>
  );
}

export default function Trends() {
  const [days, setDays] = useState(14);
  const [trends, setTrends] = useState<Trend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/trends?days=${days}`)
      .then((r) => r.json())
      .then((j) => setTrends(j.trends || []))
      .finally(() => setLoading(false));
  }, [days]);

  const rising = trends.filter((t) => t.growth >= 1.1).slice(0, 10);
  const falling = [...trends].filter((t) => t.growth < 0.9).sort((a, b) => a.growth - b.growth).slice(0, 6);
  const stable = trends.filter((t) => t.growth >= 0.9 && t.growth < 1.1).slice(0, 6);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-1 flex items-center gap-2">
        <TrendingUp size={22} className="text-accent-2" />
        <h1 className="text-xl font-bold text-gray-100">Trendy tematów</h1>
        <div className="ml-auto flex gap-1">
          {[7, 14, 30].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium ${days === d ? 'bg-accent text-white' : 'border border-border text-gray-400 hover:text-gray-200'}`}
            >
              {d} dni
            </button>
          ))}
        </div>
      </div>
      <p className="mb-5 text-sm text-gray-500">Które tematy AI rosną, a które słabną — z prawdziwych danych feedu.</p>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-12 animate-pulse rounded-xl bg-surface" />)}
        </div>
      ) : trends.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-10 text-center text-gray-400">
          Za mało danych do wyznaczenia trendów.
        </div>
      ) : (
        <>
          <Section title="Rośnie" icon={<TrendingUp size={15} className="text-emerald-400" />} items={rising} color="#10b981" />
          <Section title="Stabilne" icon={<Minus size={15} className="text-gray-400" />} items={stable} color="#a78bfa" />
          <Section title="Słabnie" icon={<TrendingDown size={15} className="text-rose-400" />} items={falling} color="#f43f5e" />
        </>
      )}
    </div>
  );
}

function Section({ title, icon, items, color }: { title: string; icon: React.ReactNode; items: Trend[]; color: string }) {
  if (!items.length) return null;
  return (
    <section className="mb-6">
      <h2 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-600">
        {icon} {title}
      </h2>
      <ul className="space-y-2">
        {items.map((t) => (
          <li key={t.tag} className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-2.5">
            <Link to={`/tag/${encodeURIComponent(t.tag)}`} className="font-medium text-gray-100 hover:text-accent-2">
              #{t.tag}
            </Link>
            <span className="text-xs text-gray-500">{t.total} postów</span>
            <span className="ml-auto text-xs font-semibold" style={{ color }}>
              {t.growth >= 1 ? '+' : ''}{Math.round((t.growth - 1) * 100)}%
            </span>
            <Sparkline data={t.series} color={color} />
          </li>
        ))}
      </ul>
    </section>
  );
}
