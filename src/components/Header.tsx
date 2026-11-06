import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { tmdb } from '../api';
import { useAsync } from '../hooks/useAsync';
import { BookmarkIcon, ChevronDown, CloseIcon, Logo, MenuIcon, SearchIcon, SettingsIcon } from './Icons';
import { SettingsDialog } from './SettingsDialog';
import { SpotlightNavbar } from './ui/spotlight-navbar';

const BROWSE = [
  { to: '/novidades', label: 'Novidades' },
  { to: '/filmes', label: 'Filmes' },
  { to: '/series', label: 'Séries' },
  { to: '/animes', label: 'Animes' },
  { to: '/doramas', label: 'Doramas' },
  { to: '/lancamentos', label: 'Calendário de lançamentos' },
];

const MAIN_NAV = [
  { to: '/', label: 'Início' },
  { to: '/filmes', label: 'Filmes' },
  { to: '/series', label: 'Séries' },
  { to: '/animes', label: 'Animes' },
  { to: '/doramas', label: 'Doramas' },
  { to: '/lancamentos', label: 'Lançamentos' },
];

const iconBtn =
  'inline-flex size-11 items-center justify-center rounded-full text-papel-2 transition-colors hover:bg-white/10 hover:text-papel';
const menuLink = 'block rounded-lg px-4 py-2.5 text-[15px] font-semibold text-papel-2 transition-colors hover:bg-white/5 hover:text-papel';
const menuHead = 'px-4 pt-2 pb-1 text-[13px] font-semibold text-nevoa';

function useGenres() {
  return useAsync(async () => {
    if (!tmdb.tmdbEnabled()) return [];
    return tmdb.genres('movie');
  }, []);
}

export function Header() {
  const [menu, setMenu] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [settings, setSettings] = useState(false);
  const loc = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);
  const genres = useGenres();

  useEffect(() => {
    setMenu(false);
    setDrawer(false);
  }, [loc.pathname, loc.search]);

  useEffect(() => {
    if (!menu) return;
    const onDoc = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenu(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenu(false);
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [menu]);

  useEffect(() => {
    document.body.classList.toggle('no-scroll', drawer);
  }, [drawer]);

  const genreList = genres.data ?? [];
  const genreHref = (g: { id: number; name: string }) => `/generos?id=${g.id}&nome=${encodeURIComponent(g.name)}`;

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 h-header border-b border-white/5 bg-noite/80 backdrop-blur-xl">
        <div className="flex h-full items-center gap-2 px-2 sm:px-4">
          <button className={cn(iconBtn, 'lg:hidden')} aria-label="Abrir menu" onClick={() => setDrawer(true)}>
            <MenuIcon />
          </button>
          <Link to="/" className="flex h-full items-center rounded-lg px-2" aria-label="PobreFlix, página inicial">
            <Logo />
          </Link>

          <div className="ml-4 hidden items-center gap-2 lg:flex">
            <SpotlightNavbar items={MAIN_NAV} aria-label="Principal" />
            <div className="relative" ref={menuRef}>
              <button
                className={cn(
                  'inline-flex h-11 items-center gap-1 rounded-full px-4 text-sm font-semibold text-nevoa transition-colors hover:text-papel',
                  menu && 'bg-white/10 text-papel',
                )}
                aria-expanded={menu}
                aria-haspopup="true"
                onClick={() => setMenu((m) => !m)}
              >
                Mais <ChevronDown className={cn('size-5 transition-transform', menu && 'rotate-180')} />
              </button>
              {menu && (
                <div
                  className="absolute top-[calc(100%+10px)] left-0 flex min-w-[560px] animate-fade-in rounded-2xl border border-white/10 bg-poltrona/95 p-2 shadow-[0_24px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl"
                  role="menu"
                >
                  <ul className="w-56 border-r border-white/10 pr-2">
                    {BROWSE.map((b) => (
                      <li key={b.to}>
                        <Link role="menuitem" to={b.to} className={menuLink}>
                          {b.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <div className="flex-1 pl-2">
                    <p className={menuHead}>Gêneros</p>
                    {genreList.length ? (
                      <ul className="grid grid-cols-2">
                        {genreList.map((g) => (
                          <li key={g.id}>
                            <Link role="menuitem" to={genreHref(g)} className={menuLink}>
                              {g.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="px-4 py-2 text-sm text-nevoa">
                        <p>A lista completa de gêneros usa o TMDB.</p>
                        <button className="mt-2 font-semibold text-anil hover:underline" onClick={() => setSettings(true)}>
                          Ativar o TMDB em Ajustes
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="ml-auto flex items-center gap-1">
            <NavLink to="/busca" className={({ isActive }) => cn(iconBtn, isActive && 'bg-white/10 text-papel')} aria-label="Buscar">
              <SearchIcon />
            </NavLink>
            <NavLink
              to="/minha-lista"
              className={({ isActive }) => cn(iconBtn, isActive && 'bg-white/10 text-papel')}
              aria-label="Minha lista"
            >
              <BookmarkIcon />
            </NavLink>
            <button className={iconBtn} aria-label="Ajustes" onClick={() => setSettings(true)}>
              <SettingsIcon />
            </button>
          </div>
        </div>
      </header>

      <div
        className={cn(
          'fixed inset-0 z-60 bg-black/60 transition-opacity duration-300',
          drawer ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={() => setDrawer(false)}
        aria-hidden="true"
      />
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-61 w-[min(320px,86vw)] overflow-y-auto bg-sala transition-[transform,visibility] duration-300 ease-cine',
          drawer ? 'visible translate-x-0' : 'invisible -translate-x-full',
        )}
        aria-label="Menu"
        aria-hidden={!drawer}
      >
        <div className="flex h-header items-center justify-between pr-2 pl-5">
          <Logo />
          <button className={iconBtn} aria-label="Fechar menu" onClick={() => setDrawer(false)} tabIndex={drawer ? 0 : -1}>
            <CloseIcon />
          </button>
        </div>
        <nav className="flex flex-col gap-0.5 px-3 pb-6">
          {[{ to: '/', label: 'Início' }, ...BROWSE, { to: '/minha-lista', label: 'Minha lista' }].map((b) => (
            <NavLink
              key={b.to}
              to={b.to}
              end={b.to === '/'}
              tabIndex={drawer ? 0 : -1}
              className={({ isActive }) =>
                cn(
                  'rounded-xl px-4 py-3 font-semibold text-papel-2 transition-colors hover:bg-white/5 hover:text-papel',
                  isActive && 'bg-anil/15 text-papel',
                )
              }
            >
              {b.label}
            </NavLink>
          ))}
          {genreList.length > 0 && (
            <>
              <p className={cn(menuHead, 'mt-4')}>Gêneros</p>
              <div className="flex flex-wrap gap-2 px-4 pt-1">
                {genreList.map((g) => (
                  <Link key={g.id} to={genreHref(g)} tabIndex={drawer ? 0 : -1} className="chip">
                    {g.name}
                  </Link>
                ))}
              </div>
            </>
          )}
        </nav>
      </aside>
      {settings && <SettingsDialog onClose={() => setSettings(false)} />}
    </>
  );
}
