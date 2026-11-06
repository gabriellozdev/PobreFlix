import { cn } from '@/lib/utils';
import { onlyPlayable, sb, tmdb, type Title } from '../api';
import { EpisodeCard, EpisodeSkeleton } from '../components/EpisodeCard';
import { Hero } from '../components/Hero';
import { Row, repeat } from '../components/Row';
import { CardSkeleton, TitleCard } from '../components/TitleCard';
import { useAsync } from '../hooks/useAsync';
import { usePlayer } from '../hooks/usePlayer';
import { epLabel } from '../lib/routes';
import { removeProgress, useProgress } from '../store/library';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const posters = repeat(8, (i) => <CardSkeleton key={i} />);
const episodes = repeat(5, (i) => <EpisodeSkeleton key={i} />);

function TitleRow({
  title,
  subtitle,
  more,
  load,
  deps = [],
}: {
  title: string;
  subtitle?: string;
  more?: string;
  load: () => Promise<Title[]>;
  deps?: unknown[];
}) {
  const s = useAsync(load, deps);
  return (
    <Row
      title={title}
      subtitle={subtitle}
      more={more}
      loading={s.loading}
      error={s.error}
      onRetry={s.reload}
      skeleton={posters}
      empty={!s.data?.length}
    >
      {s.data?.map((t) => <TitleCard key={`${t.type}${t.tmdbId}`} t={t} />)}
    </Row>
  );
}

function ContinueRow() {
  const items = useProgress();
  const { open } = usePlayer();
  const list = items.filter((p) => !p.ended).slice(0, 20);
  if (!list.length) return null;
  return (
    <Row title="Continuar assistindo" skeleton={null} variant="episode">
      {list.map((p) => (
        <div key={`${p.type}${p.tmdbId}`} className="group/continue relative">
          <EpisodeCard
            fallbackPoster={p.poster}
            top={p.type === 'tv' ? epLabel(p.season ?? 1, p.episode ?? 1) : 'Filme'}
            title={p.title}
            progress={p.percent}
            onPlay={() => open({ type: p.type, tmdbId: p.tmdbId, season: p.season, episode: p.episode })}
          />
          <button
            className="absolute top-1.5 right-1.5 rounded-full bg-noite/80 px-2.5 py-1 text-xs font-semibold text-papel opacity-0 backdrop-blur-sm transition-[opacity,background-color] duration-200 group-hover/continue:opacity-100 hover:bg-poltrona focus-visible:opacity-100 [@media(hover:none)]:opacity-100"
            onClick={() => removeProgress(p.type, p.tmdbId)}
          >
            Remover
          </button>
        </div>
      ))}
    </Row>
  );
}

function NewEpisodesRow() {
  const s = useAsync(() => sb.listRecentEpisodes(1, 20), []);
  const { open } = usePlayer();
  return (
    <Row
      title="Novos episódios"
      subtitle="Episódios que acabaram de chegar ao catálogo"
      more="/novidades?aba=episodios"
      loading={s.loading}
      error={s.error}
      onRetry={s.reload}
      skeleton={episodes}
      variant="episode"
      empty={!s.data?.items.length}
    >
      {s.data?.items.map((e) => (
        <EpisodeCard
          key={e.key}
          image={e.image}
          fallbackPoster={e.poster}
          top={e.seriesTitle}
          title={`${epLabel(e.season, e.episode)}${e.name && !/^Episódio \d+$/.test(e.name) ? ` – ${e.name}` : ''}`}
          onPlay={() => open({ type: 'tv', tmdbId: e.seriesId, season: e.season, episode: e.episode })}
        />
      ))}
    </Row>
  );
}

function UpcomingRow() {
  const s = useAsync(() => sb.listCalendar(undefined, 1, 30), []);
  const fmt = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' });
  return (
    <Row
      title="Lançamentos da semana"
      subtitle="Estreias e próximos episódios"
      more="/lancamentos"
      loading={s.loading}
      error={s.error}
      onRetry={s.reload}
      skeleton={posters}
      empty={!s.data?.items.length}
    >
      {s.data?.items.map((r) => (
        <TitleCard
          key={r.key}
          t={{ tmdbId: r.tmdbId, type: r.kind === 'movie' ? 'movie' : 'tv', title: r.title, poster: r.poster }}
          badge={r.hasSource ? 'Disponível' : 'Em breve'}
          sub={`${fmt.format(new Date(r.airDate + 'T12:00:00'))}${r.kind === 'episode' ? ` • ${epLabel(r.season, r.episode)}` : ' • Filme'}`}
        />
      ))}
    </Row>
  );
}

export function Home() {
  useDocumentTitle('');
  const rich = tmdb.tmdbEnabled();
  const hero = useAsync(async () => {
    if (rich) {
      try {
        const tr = await onlyPlayable((await tmdb.trending()).items);
        const withArt = tr.filter((t) => t.backdrop && t.overview);
        if (withArt.length >= 3) return withArt.slice(0, 7);
      } catch {
        /* cai para o StreamBetter */
      }
    }
    const r = await sb.listRecents('all', 1, 30);
    return r.items.filter((t) => t.poster && t.overview && t.overview.length > 60).slice(0, 7);
  }, [rich]);

  return (
    <main>
      <h1 className="visually-hidden">PobreFlix — filmes, séries, animes e doramas grátis e sem cadastro</h1>
      <Hero items={hero.data ?? []} loading={hero.loading} />
      {/* sem destaques (erro), o restante da página continua funcionando */}
      <div
        className={cn(
          'relative z-2 flex flex-col gap-10 lg:gap-14',
          hero.data?.length || hero.loading ? '-mt-6' : 'pt-[calc(var(--header-h)_+_32px)]',
        )}
      >
        <ContinueRow />
        {rich && (
          <TitleRow
            title="Em alta hoje"
            subtitle="O que mais está sendo visto agora"
            load={async () => onlyPlayable((await tmdb.trending()).items)}
          />
        )}
        <TitleRow
          title="Novidades no catálogo"
          subtitle="Filmes e séries adicionados recentemente"
          more="/novidades"
          load={async () => (await sb.listRecents('all', 1, 24)).items}
        />
        <NewEpisodesRow />
        {rich && (
          <TitleRow
            title="Filmes populares"
            load={async () => onlyPlayable((await tmdb.popular('movie')).items)}
          />
        )}
        <TitleRow
          title="Filmes recém-chegados"
          more="/filmes"
          load={async () => (await sb.listRecents('movies', 1, 24)).items}
        />
        {rich && (
          <TitleRow title="Séries populares" load={async () => onlyPlayable((await tmdb.popular('tv')).items)} />
        )}
        <TitleRow
          title="Séries recém-chegadas"
          more="/series"
          load={async () => (await sb.listRecents('series', 1, 24)).items}
        />
        <UpcomingRow />
        <TitleRow title="Animes" more="/animes" load={async () => (await sb.listCategory('animes', 1, 24)).items} />
        <TitleRow title="Doramas" more="/doramas" load={async () => (await sb.listCategory('doramas', 1, 24)).items} />
      </div>
    </main>
  );
}
