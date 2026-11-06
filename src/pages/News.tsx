import { useSearchParams } from 'react-router-dom';
import { sb, type RecentEpisode, type Title } from '../api';
import { EpisodeCard, EpisodeSkeleton } from '../components/EpisodeCard';
import { TitleGrid } from '../components/Grid';
import { repeat } from '../components/Row';
import { EmptyState, ErrorState } from '../components/States';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { usePaged, useSentinel } from '../hooks/usePaged';
import { usePlayer } from '../hooks/usePlayer';
import { epLabel } from '../lib/routes';
import { AnimatedRays } from '../components/ui/animated-rays';
import { cn } from '@/lib/utils';

const TABS = [
  { id: 'tudo', label: 'Tudo' },
  { id: 'filmes', label: 'Filmes' },
  { id: 'series', label: 'Séries' },
  { id: 'episodios', label: 'Episódios' },
] as const;
type Tab = (typeof TABS)[number]['id'];

const tabList = 'no-scrollbar mb-6 flex gap-1 overflow-x-auto shadow-[inset_0_-2px_0_var(--color-linha)]';
const tabBtn = (active: boolean) =>
  cn(
    'h-11 shrink-0 border-b-2 border-transparent px-4 text-[15px] font-semibold whitespace-nowrap text-nevoa transition-colors hover:text-papel',
    active && 'border-anil text-papel',
  );

function TitlesTab({ tab }: { tab: Exclude<Tab, 'episodios'> }) {
  const kind = tab === 'filmes' ? 'movies' : tab === 'series' ? 'series' : 'all';
  const data = usePaged<Title>(
    async (page) => {
      const r = await sb.listRecents(kind, page, 36);
      return { items: r.items, hasMore: page < r.totalPages };
    },
    [kind],
    (t) => `${t.type}${t.tmdbId}`,
  );
  return <TitleGrid data={data} empty={<EmptyState title="Sem novidades agora" text="Volte daqui a pouco." />} />;
}

function EpisodesTab() {
  const { open } = usePlayer();
  const data = usePaged<RecentEpisode>(
    async (page) => {
      const r = await sb.listRecentEpisodes(page, 30);
      return { items: r.items, hasMore: page < r.totalPages };
    },
    ['eps'],
    (e) => e.key,
  );
  const sentinel = useSentinel(data.loadMore, !data.done && !data.loading && !data.error);
  if (!data.loading && !data.items.length && !data.error)
    return <EmptyState title="Nenhum episódio novo" text="Volte daqui a pouco." />;
  return (
    <>
      <div className="grid grid-cols-1 gap-x-4 gap-y-7 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-5 lg:gap-y-8 2xl:grid-cols-4">
        {data.items.map((e) => (
          <EpisodeCard
            key={e.key}
            image={e.image}
            fallbackPoster={e.poster}
            top={e.seriesTitle}
            title={`${epLabel(e.season, e.episode)}${e.name && !/^Episódio \d+$/.test(e.name) ? ` – ${e.name}` : ''}`}
            onPlay={() => open({ type: 'tv', tmdbId: e.seriesId, season: e.season, episode: e.episode })}
          />
        ))}
        {data.loading && repeat(8, (i) => <EpisodeSkeleton key={`s${i}`} />)}
      </div>
      {data.error && <ErrorState error={data.error} onRetry={data.retry} compact />}
      {!data.done && <div ref={sentinel} className="flex min-h-10 justify-center py-8" />}
    </>
  );
}

export function News() {
  useDocumentTitle('Novidades');
  const [params, setParams] = useSearchParams();
  const tab = (TABS.find((t) => t.id === params.get('aba'))?.id ?? 'tudo') as Tab;
  return (
    <main className="relative isolate min-h-[calc(100vh-var(--header-h))] pt-header">
      <AnimatedRays className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px]" />
      <div className="container-page flex flex-wrap items-end justify-between gap-x-6 gap-y-4 pt-8 pb-6 lg:pt-12 lg:pb-8">
        <div>
          <h1 className="page-title">Novidades</h1>
          <p className="meta mt-1.5 max-w-[640px] text-pretty">O que acabou de entrar no catálogo, do mais novo para o mais antigo.</p>
        </div>
      </div>
      <div className="container-page pb-16">
        <div className={tabList} role="tablist" aria-label="Tipo">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              className={tabBtn(tab === t.id)}
              onClick={() => setParams(t.id === 'tudo' ? {} : { aba: t.id }, { replace: true })}
            >
              {t.label}
            </button>
          ))}
        </div>
        {tab === 'episodios' ? <EpisodesTab /> : <TitlesTab tab={tab} />}
      </div>
    </main>
  );
}
