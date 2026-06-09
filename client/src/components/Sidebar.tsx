import { NavLink } from 'react-router-dom';
import { Home, Bookmark, Hash, Radio, Flame, TrendingUp, MessageSquare, Newspaper, Sparkles, Bell, Cpu, FileText } from 'lucide-react';
import { useAlerts } from '../alerts';
import { useStore } from '../store';

const navItem =
  'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition';
const active = 'bg-surface-2 text-white';
const idle = 'text-gray-400 hover:bg-surface-2 hover:text-gray-200';

export default function Sidebar() {
  const { following, bookmarks } = useStore();
  const { alerts } = useAlerts();
  const bmCount = Object.keys(bookmarks).length;

  return (
    <aside className="hidden w-60 shrink-0 flex-col gap-6 overflow-y-auto border-r border-border bg-bg px-3 py-4 md:flex">
      <nav className="flex flex-col gap-1">
        <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-600">
          Odkrywaj
        </p>
        <NavLink to="/" end className={({ isActive }) => `${navItem} ${isActive ? active : idle}`}>
          <Home size={18} /> Mój feed
        </NavLink>
        <NavLink to="/for-you" className={({ isActive }) => `${navItem} ${isActive ? active : idle}`}>
          <Sparkles size={18} /> Dla Ciebie
        </NavLink>
        <NavLink to="/trends" className={({ isActive }) => `${navItem} ${isActive ? active : idle}`}>
          <TrendingUp size={18} /> Trendy
        </NavLink>
        <NavLink
          to="/?sort=popular"
          className={({ isActive }) => `${navItem} ${idle}`}
        >
          <TrendingUp size={18} /> Popularne
        </NavLink>
        <NavLink to="/?sort=discussed" className={() => `${navItem} ${idle}`}>
          <MessageSquare size={18} /> Dyskutowane
        </NavLink>
        <NavLink to="/?sort=upvoted" className={() => `${navItem} ${idle}`}>
          <Flame size={18} /> Najwyżej oceniane
        </NavLink>
        <NavLink to="/digest" className={({ isActive }) => `${navItem} ${isActive ? active : idle}`}>
          <Newspaper size={18} /> Dzienny digest
        </NavLink>
        <NavLink to="/ask" className={({ isActive }) => `${navItem} ${isActive ? active : idle}`}>
          <Sparkles size={18} /> Zapytaj feed
        </NavLink>
        <NavLink to="/alerts" className={({ isActive }) => `${navItem} ${isActive ? active : idle}`}>
          <Bell size={18} /> Alerty
          {alerts.length > 0 && (
            <span className="ml-auto rounded-full bg-accent px-1.5 text-[11px] text-white">{alerts.length}</span>
          )}
        </NavLink>
        <NavLink to="/models" className={({ isActive }) => `${navItem} ${isActive ? active : idle}`}>
          <Cpu size={18} /> Premiery modeli
        </NavLink>
        <NavLink to="/papers" className={({ isActive }) => `${navItem} ${isActive ? active : idle}`}>
          <FileText size={18} /> Paper'y
        </NavLink>
      </nav>

      <nav className="flex flex-col gap-1">
        <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-600">
          Sieć
        </p>
        <NavLink to="/bookmarks" className={({ isActive }) => `${navItem} ${isActive ? active : idle}`}>
          <Bookmark size={18} /> Zakładki
          {bmCount > 0 && (
            <span className="ml-auto rounded-full bg-accent px-1.5 text-[11px] text-white">
              {bmCount}
            </span>
          )}
        </NavLink>
        <NavLink to="/tags" className={({ isActive }) => `${navItem} ${isActive ? active : idle}`}>
          <Hash size={18} /> Tematy
        </NavLink>
        <NavLink to="/sources" className={({ isActive }) => `${navItem} ${isActive ? active : idle}`}>
          <Radio size={18} /> Źródła
        </NavLink>
      </nav>

      {following.length > 0 && (
        <nav className="flex flex-col gap-1">
          <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-600">
            Śledzone tematy
          </p>
          {following.map((t) => (
            <NavLink
              key={t}
              to={`/tag/${encodeURIComponent(t)}`}
              className={({ isActive }) => `${navItem} ${isActive ? active : idle}`}
            >
              <Hash size={16} /> {t}
            </NavLink>
          ))}
        </nav>
      )}

      <div className="mt-auto px-3 pt-4 text-[11px] leading-relaxed text-gray-600">
        AI Daily · wiadomości o sztucznej inteligencji.
        <br /> Inspirowane daily.dev.
      </div>
    </aside>
  );
}
