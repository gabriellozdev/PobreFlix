import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { sb, type Release } from '../api';
import { Img } from '../components/Img';
import { PlayIcon } from '../components/Icons';
import { EmptyState, ErrorState } from '../components/States';
import { useAsync } from '../hooks/useAsync';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { usePlayer } from '../hooks/usePlayer';
import { epLabel, titleHref } from '../lib/routes';
import { AnimatedRays } from '../components/ui/animated-rays';
import { cn } from '@/lib/utils';

const TABS = [
  { id: '', label: 'Tudo' },
  { id: 'movie', label: 'Filmes' },
  { id: 'episode', label: 'Episódios' },
] as const;

const tabList = 'no-scrollbar mb-6 flex gap-1 overflow-x-auto shadow-[inset_0_-2px_0_var(--color-linha)]';
const tabBtn = (active: boolean) =>
  cn(
    'h-11 shrink-0 border-b-2 border-transparent px-4 text-[15px] font-semibold whitespace-nowrap text-nevoa transition-colors hover:text-papel',
    active && 'border-anil text-papel',
  );

async function loadAll(kind?: 'movie' | 'episode'): Promise<Release[]> {
  const first = await sb.listCalendar(kind, 1, 100);
  const rest = await Promise.all(
    Array.from({ length: Math.min(first.totalPages, 4) - 1 }, (_, i) => sb.listCalendar(kind, i + 2, 100)),
  );
  return [...first.items, ...rest.flatMap((r) => r.items)];
}

const dayFmt = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });

export function Releases() {
  useDocumentTitle('Calendário de lançamentos');
  const [params, setParams] = useSearchParams();
  const kind = (params.get('tipo') as 'movie' | 'episode' | null) || undefined;
  const s = useAsync(() => loadAll(kind), [kind]);
  const { open } = usePlayer();
  const today = new Date().toISOString().slice(0, 10);

  const groups = new Map<string, Release[]>();
  for (const r of [...(s.data ?? [])].sort((a, b) => a.airDate.localeCompare(b.airDate))) {
    if (!groups.has(r.airDate)) groups.set(r.airDate, []);
    groups.get(r.airDate)!.push(r);
  }

  return (
    <main className="relative isolate min-h-[calc(100vh-var(--header-h))] pt-header">
      <AnimatedRays className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px]" />
      <div className="container-page flex flex-wrap items-end justify-between gap-x-6 gap-y-4 pt-8 pb-6 lg:pt-12 lg:pb-8">
        <div>
          <h1 className="page-title">Calendário de lançamentos</h1>
          <p className="meta mt-1.5 max-w-[640px] text-pretty">Estreias de filmes e próximos episódios das séries do catálogo, de 7 dias atrás em diante.</p>
        </div>
      </div>
      <div className="container-page pb-16">
        <div className={tabList} role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={(kind ?? '') === t.id}
              className={tabBtn((kind ?? '') === t.id)}
              onClick={() => setParams(t.id ? { tipo: t.id } : {}, { replace: true })}
            >
              {t.label}
            </button>
          ))}
        </div>
        {s.loading ? (
          <div className="flex flex-col gap-9">
            {[0, 1].map((g) => (
              <section key={g} className="flex flex-col gap-1">
                <div className="sk sk-line mb-3 h-[22px] w-[200px] max-w-full" />
                {[0, 1, 2].map((k) => (
                  <div key={k} className="flex items-center gap-4 border-b border-white/5 py-2.5">
                    <div className="sk aspect-[2/3] w-14 flex-none rounded-lg" />
                    <div className="min-w-0 flex-1">
                      <div className="sk sk-line" />
                      <div className="sk sk-line w-3/5" />
                    </div>
                  </div>
                ))}
              </section>
            ))}
          </div>
        ) : s.error ? (
          <ErrorState error={s.error} onRetry={s.reload} />
        ) : !groups.size ? (
          <EmptyState art="calendar" title="Nada programado" text="Não há lançamentos previstos nesta janela." />
        ) : (
          <div className="flex flex-col gap-9">
            {[...groups.entries()].map(([date, list]) => (
              <section key={date} className="flex flex-col gap-1">
                <h2
                  className={cn(
                    'mb-1 flex items-center gap-2.5 border-b-2 border-linha pb-2.5 text-lg font-bold lg:text-xl',
                    date === today && 'border-anil',
                  )}
                >
                  <span className="inline-block first-letter:uppercase">{dayFmt.format(new Date(date + 'T12:00:00'))}</span>
                  {date === today && <span className="tag accent">Hoje</span>}
                </h2>
                {list.map((r) => {
                  const type = r.kind === 'movie' ? 'movie' : 'tv';
                  return (
                    <div key={r.key} className="flex items-center gap-4 border-b border-white/5 py-2.5">
                      <Link to={titleHref(type, r.tmdbId)} className="aspect-[2/3] w-14 flex-none overflow-hidden rounded-lg bg-sala transition-opacity hover:opacity-85">
                        <Img path={r.poster} alt={r.title} size="w185" className="size-full object-cover" />
                      </Link>
                      <div className="min-w-0 flex-1">
                        <Link to={titleHref(type, r.tmdbId)} className="block truncate font-semibold transition-colors hover:text-anil-claro">
                          {r.title}
                        </Link>
                        <p className="meta">
                          {r.kind === 'episode'
                            ? `${epLabel(r.season, r.episode)}${r.episodeTitle ? ` – ${r.episodeTitle}` : ''}`
                            : 'Filme'}
                        </p>
                      </div>
                      {r.hasSource ? (
                        <button
                          className="btn btn-primary flex-none max-sm:w-11 max-sm:px-0"
                          onClick={() => open({ type, tmdbId: r.tmdbId, season: r.season, episode: r.episode })}
                        >
                          <PlayIcon /> <span className="max-sm:sr-only">Assistir</span>
                        </button>
                      ) : (
                        <span className="tag flex-none">Em breve</span>
                      )}
                    </div>
                  );
                })}
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
