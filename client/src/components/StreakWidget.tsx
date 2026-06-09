import { Flame } from 'lucide-react';
import { useStore } from '../store';

export default function StreakWidget() {
  const { streak, readToday, dailyGoal } = useStore();
  const pct = Math.min(100, Math.round((readToday / dailyGoal) * 100));

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="mb-3 flex items-center gap-2">
        <Flame size={18} className="text-orange-400" />
        <span className="text-sm font-semibold text-gray-200">Twoja seria czytania</span>
      </div>

      <div className="mb-3 flex items-end gap-4">
        <div>
          <div className="text-3xl font-bold text-orange-400">{streak.current}</div>
          <div className="text-xs text-gray-500">dni z rzędu</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-gray-200">{streak.longest}</div>
          <div className="text-xs text-gray-500">rekord</div>
        </div>
      </div>

      <div className="mb-1 flex justify-between text-xs text-gray-400">
        <span>Dzienny cel</span>
        <span>
          {readToday}/{dailyGoal}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full bg-gradient-to-r from-orange-500 to-accent transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-[11px] leading-snug text-gray-500">
        {readToday >= dailyGoal
          ? '🎉 Cel osiągnięty! Seria utrzymana.'
          : 'Przeczytaj artykuł („Otwórz oryginał”), aby zaliczyć dzień.'}
      </p>
    </div>
  );
}
