import { useState } from 'react';
import { Bell, Plus, Trash2, BellOff, BellRing } from 'lucide-react';
import { useAlerts } from '../alerts';

export default function Alerts() {
  const { alerts, add, remove, permission, requestPermission } = useAlerts();
  const [q, setQ] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    add(q);
    setQ('');
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-1 flex items-center gap-2">
        <Bell size={22} className="text-accent-2" />
        <h1 className="text-xl font-bold text-gray-100">Alerty (zapisane wyszukiwania)</h1>
      </div>
      <p className="mb-5 text-sm text-gray-500">
        Aplikacja co kilka minut sprawdza feed i powiadamia, gdy pojawi się coś nowego pasującego do Twojego zapytania.
      </p>

      {/* permission banner */}
      <div
        className={`mb-4 flex items-center gap-3 rounded-2xl border p-4 ${
          permission === 'granted'
            ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-200'
            : 'border-amber-500/30 bg-amber-500/5 text-amber-200'
        }`}
      >
        {permission === 'granted' ? <BellRing size={18} /> : <BellOff size={18} />}
        <div className="flex-1 text-sm">
          {permission === 'granted'
            ? 'Powiadomienia są włączone — będziesz informowany o nowych trafieniach.'
            : permission === 'unsupported'
              ? 'Twoja przeglądarka nie wspiera powiadomień.'
              : 'Aby otrzymywać powiadomienia o nowych trafieniach, włącz je w przeglądarce.'}
        </div>
        {permission !== 'granted' && permission !== 'unsupported' && (
          <button
            onClick={requestPermission}
            className="rounded-xl bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent/80"
          >
            Włącz powiadomienia
          </button>
        )}
      </div>

      <form onSubmit={submit} className="mb-6 flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder='np. „GPT-5", „Llama 4", „nazwa konkurenta"'
          className="flex-1 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-gray-200 outline-none focus:border-accent"
        />
        <button
          type="submit"
          className="flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent/80"
        >
          <Plus size={15} /> Dodaj
        </button>
      </form>

      {alerts.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-10 text-center text-gray-400">
          Nie masz jeszcze alertów. Dodaj zapytanie powyżej.
        </div>
      ) : (
        <ul className="space-y-2">
          {alerts.map((a) => (
            <li
              key={a.id}
              className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3"
            >
              <Bell size={16} className="text-accent-2" />
              <span className="font-medium text-gray-200">„{a.query}"</span>
              <span className="ml-auto text-xs text-gray-500">{a.hits ?? 0} trafień</span>
              <button
                onClick={() => remove(a.id)}
                className="rounded-lg p-2 text-gray-500 hover:bg-surface-2 hover:text-red-400"
                title="Usuń alert"
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-6 text-xs text-gray-600">
        Alerty działają w aktywnej karcie przeglądarki. Otwórz tę kartę albo zainstaluj AI Daily jako PWA, aby działały w tle.
      </p>
    </div>
  );
}
