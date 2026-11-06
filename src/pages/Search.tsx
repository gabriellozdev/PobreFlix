import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { catalog } from '../api';
import { CloseIcon, SearchIcon } from '../components/Icons';
import { repeat } from '../components/Row';
import { EmptyState, ErrorState } from '../components/States';
import { CardSkeleton, TitleCard } from '../components/TitleCard';
import { useAsync } from '../hooks/useAsync';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { AnimatedRays } from '../components/ui/animated-rays';
import { cn } from '@/lib/utils';

const FILTERS = [
  { id: 'tudo', label: 'Tudo' },
  { id: 'filmes', label: 'Filmes' },
  { id: 'series', label: 'Séries' },
  { id: 'animes', label: 'Animes' },
  { id: 'doramas', label: 'Doramas' },
] as const;

const tabList = 'no-scrollbar mb-6 flex gap-1 overflow-x-auto shadow-[inset_0_-2px_0_var(--color-linha)]';
const tabBtn = (active: boolean) =>
  cn(
    'h-11 shrink-0 border-b-2 border-transparent px-4 text-[15px] font-semibold whitespace-nowrap text-nevoa transition-colors hover:text-papel',
    active && 'border-anil text-papel',
  );
const TITLE_GRID =
  'grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-8 md:grid-cols-4 lg:grid-cols-5 lg:gap-x-5 lg:gap-y-9 2xl:grid-cols-6';

export function Search() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const filter = params.get('tipo') ?? 'tudo';
  const [text, setText] = useState(q);
  const input = useRef<HTMLInputElement>(null);
  useDocumentTitle(q ? `Busca: ${q}` : 'Buscar');

  useEffect(() => input.current?.focus(), []);

  // debounce: atualiza a URL 250 ms depois de parar de digitar
  useEffect(() => {
    if (text === q) return;
    const id = setTimeout(() => {
      const p = new URLSearchParams(params);
      if (text.trim()) p.set('q', text);
      else p.delete('q');
      setParams(p, { replace: true });
    }, 250);
    return () => clearTimeout(id);
  }, [text]); // eslint-disable-line react-hooks/exhaustive-deps

  const res = useAsync(
    () =>
      catalog.search(q, {
        type: filter === 'filmes' ? 'movie' : filter === 'series' ? 'tv' : 'all',
        category: filter === 'animes' ? 'anime' : filter === 'doramas' ? 'dorama' : undefined,
      }),
    [q, filter],
  );

  const setFilter = (f: string) => {
    const p = new URLSearchParams(params);
    if (f === 'tudo') p.delete('tipo');
    else p.set('tipo', f);
    setParams(p, { replace: true });
  };

  return (
    <main className="relative isolate min-h-[calc(100vh-var(--header-h))] pt-header">
      <AnimatedRays className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px]" />
      <div className="container-page pt-8 pb-6 lg:pt-14 lg:pb-8">
        <form role="search" onSubmit={(e) => e.preventDefault()} className="relative max-w-[860px]">
          <label htmlFor="q" className="visually-hidden">
            Buscar filmes e séries
          </label>
          <input
            id="q"
            ref={input}
            type="search"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Buscar..."
            className="h-14 w-full rounded-none border-0 border-b-2 border-anil bg-transparent pr-14 font-display text-3xl font-bold tracking-[-0.02em] text-papel outline-none transition-[border-color,box-shadow] placeholder:text-nevoa/70 focus-visible:border-anil-claro focus-visible:shadow-[0_2px_0_var(--color-anil-claro)] lg:h-16 lg:text-4xl [&::-webkit-search-cancel-button]:appearance-none"
            autoComplete="off"
            enterKeyHint="search"
          />
          {text ? (
            <button
              type="button"
              className="absolute top-1/2 right-0 flex size-11 -translate-y-1/2 items-center justify-center rounded-full text-nevoa transition-colors hover:bg-white/10 hover:text-papel"
              aria-label="Limpar busca"
              onClick={() => setText('')}
            >
              <CloseIcon />
            </button>
          ) : (
            <SearchIcon className="pointer-events-none absolute top-1/2 right-2 size-7 -translate-y-1/2 text-nevoa" />
          )}
        </form>
      </div>
      <div className="container-page pb-16">
        <div className={tabList} role="group" aria-label="Filtrar resultados">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              className={tabBtn(filter === f.id)}
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
        {!q.trim() ? (
          <EmptyState
            title="O que você quer assistir?"
            text="Busque por título de filme, série, anime ou dorama. São mais de 46 mil títulos no catálogo."
          />
        ) : res.loading ? (
          <div className={TITLE_GRID}>{repeat(12, (i) => <CardSkeleton key={i} />)}</div>
        ) : res.error ? (
          <ErrorState error={res.error} onRetry={res.reload} />
        ) : !res.data?.length ? (
          <EmptyState
            title={`Nada encontrado para “${q}”`}
            text="Confira a grafia, tente outro nome (original ou em português) ou remova o filtro."
          />
        ) : (
          <>
            <h2 className="mb-4 font-sans text-base font-semibold text-nevoa">
              {res.data.length === 60 ? 'Principais resultados' : `${res.data.length} resultado${res.data.length > 1 ? 's' : ''}`}
            </h2>
            <div className={cn(TITLE_GRID, 'animate-fade-in')}>
              {res.data.map((t) => (
                <TitleCard key={`${t.type}${t.tmdbId}`} t={t} />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
