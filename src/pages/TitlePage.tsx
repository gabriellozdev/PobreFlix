import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { NotFoundError, getRecommendations, getSeasonEpisodes, getTitleDetails, type Title } from '../api';
import { EpisodeCard, EpisodeSkeleton } from '../components/EpisodeCard';
import { BookmarkIcon, PlayIcon, StarIcon } from '../components/Icons';
import { Img } from '../components/Img';
import { EpisodePicker } from '../components/EpisodePicker';
import { Row, repeat } from '../components/Row';
import { EmptyState, ErrorState } from '../components/States';
import { CardSkeleton, TitleCard, kindLabel } from '../components/TitleCard';
import { useAsync } from '../hooks/useAsync';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { usePlayer } from '../hooks/usePlayer';
import { epLabel, slugType } from '../lib/routes';
import { getProgress, toggleList, useInList, useProgress } from '../store/library';
import { BorderBeam } from '../components/ui/border-beam';

const page = 'relative isolate min-h-[calc(100vh-var(--header-h))]';
const hero =
  'relative min-h-[420px] overflow-hidden pt-[calc(var(--header-h)+32px)] pb-10 lg:pt-[calc(var(--header-h)+140px)] lg:pb-14';
const heroInner =
  'container-page relative grid grid-cols-1 items-end gap-6 md:grid-cols-[240px_1fr] md:gap-10 2xl:grid-cols-[280px_1fr]';
const poster =
  'aspect-2/3 w-40 justify-self-center overflow-hidden rounded-xl bg-sala shadow-[0_20px_50px_rgba(0,0,0,0.7)] ring-1 ring-white/10 md:w-full md:justify-self-stretch';
const epGrid = 'grid grid-cols-1 gap-x-4 gap-y-7 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-5 lg:gap-y-8 2xl:grid-cols-4';

function Recommendations({ t }: { t: Title }) {
  const s = useAsync(() => getRecommendations(t), [t.type, t.tmdbId]);
  return (
    <Row
      title="Mais como este"
      loading={s.loading}
      error={s.error}
      onRetry={s.reload}
      skeleton={repeat(8, (i) => <CardSkeleton key={i} />)}
      empty={!s.data?.length}
    >
      {s.data?.map((r) => <TitleCard key={`${r.type}${r.tmdbId}`} t={r} />)}
    </Row>
  );
}

function Episodes({ t, seasons }: { t: Title; seasons: { number: number; name?: string; episodeCount?: number }[] }) {
  const { open } = usePlayer();
  useProgress(); // re-render quando o progresso mudar
  const last = getProgress('tv', t.tmdbId);
  const [season, setSeason] = useState(() => last?.season ?? seasons[0]?.number ?? 1);
  const [desc, setDesc] = useState(false);
  useEffect(() => {
    if (seasons.length && !seasons.some((s) => s.number === season)) setSeason(seasons[0].number);
  }, [seasons, season]);
  const eps = useAsync(() => getSeasonEpisodes(t.tmdbId, season), [t.tmdbId, season]);
  const list = eps.data?.episodes ?? [];
  const sorted = desc ? [...list].reverse() : list;
  const play = (s: number, e: number) => open({ type: 'tv', tmdbId: t.tmdbId, season: s, episode: e });
  const cur = seasons.find((s) => s.number === season);

  return (
    <section className="container-page pt-6" aria-labelledby="eps-h">
      <div className="mb-5 flex flex-wrap items-center gap-4">
        <h2 id="eps-h" className="section-title">
          Episódios
        </h2>
        {seasons.length > 1 && (
          <label className="select">
            <span className="visually-hidden">Temporada</span>
            <select value={season} onChange={(e) => setSeason(Number(e.target.value))}>
              {seasons.map((s) => (
                <option key={s.number} value={s.number}>
                  {s.name && !/^Temporada \d+$/i.test(s.name) ? `T${s.number}: ${s.name}` : `Temporada ${s.number}`}
                </option>
              ))}
            </select>
          </label>
        )}
        {seasons.length === 1 && <span className="meta">Temporada {season}</span>}
        {eps.data?.complete && list.length > 1 && (
          <button className="btn btn-ghost ml-auto" onClick={() => setDesc((d) => !d)}>
            {desc ? 'Mais recente' : 'Mais antigo'}
          </button>
        )}
      </div>
      {eps.loading ? (
        <div className={epGrid}>{repeat(4, (i) => <EpisodeSkeleton key={i} />)}</div>
      ) : eps.data?.complete ? (
        list.length ? (
          <div className={cn(epGrid, 'animate-fade-in')}>
            {sorted.map((e) => (
              <EpisodeCard
                key={e.number}
                image={e.still}
                fallbackPoster={t.poster}
                top={epLabel(e.season, e.number)}
                title={e.name || `Episódio ${e.number}`}
                sub={[e.runtime && `${e.runtime} min`, e.airDate && new Date(e.airDate + 'T12:00:00').toLocaleDateString('pt-BR')]
                  .filter(Boolean)
                  .join(' • ')}
                desc={e.overview}
                progress={last?.season === e.season && last?.episode === e.number ? last.percent : undefined}
                active={last?.season === e.season && last?.episode === e.number}
                onPlay={() => play(e.season, e.number)}
              />
            ))}
          </div>
        ) : (
          <EmptyState title="Sem episódios listados" text="Esta temporada ainda não tem episódios cadastrados." />
        )
      ) : (
        <div className="max-w-[720px]">
          <EpisodePicker
            season={season}
            episode={last?.season === season ? last.episode ?? 1 : 1}
            extras={list}
            count={cur?.episodeCount}
            onPick={(n) => play(season, n)}
          />
        </div>
      )}
    </section>
  );
}

export function TitlePage() {
  const [params] = useSearchParams();
  const type = slugType(params.get('tipo'));
  const id = Number(params.get('id'));
  const valid = !!type && id > 0;
  const d = useAsync(
    () => (valid ? getTitleDetails(type!, id) : Promise.reject(new NotFoundError('Link inválido.'))),
    [type, id],
  );
  const { open } = usePlayer();
  const inList = useInList(type ?? 'movie', id);
  useProgress();
  const t = d.data?.title;
  useDocumentTitle(t?.title ?? '');
  const [more, setMore] = useState(false);

  useEffect(() => window.scrollTo(0, 0), [type, id]);

  if (d.loading) {
    return (
      <main className={page}>
        <section className={hero}>
          <div className={heroInner}>
            <div className={cn(poster, 'sk')} />
            <div className="flex min-w-0 flex-col gap-4">
              <div className="sk sk-line h-10 w-1/2" />
              <div className="sk sk-line w-[30%]" />
              <div className="sk sk-line" />
              <div className="sk sk-line" />
              <div className="sk sk-line mt-4 h-11 w-[260px] rounded-full" />
            </div>
          </div>
        </section>
      </main>
    );
  }
  if (d.error || !t) {
    const nf = d.error instanceof NotFoundError;
    return (
      <main className={cn(page, 'pt-header')}>
        <div className="container-page">
          {nf ? (
            <EmptyState
              title="Título não encontrado"
              text="Ele pode ter saído do catálogo ou o link está incompleto."
              action={
                <Link to="/busca" className="btn btn-primary">
                  Buscar outro título
                </Link>
              }
            />
          ) : (
            <ErrorState error={d.error} onRetry={d.reload} />
          )}
        </div>
      </main>
    );
  }

  const isTv = t.type === 'tv';
  const prog = getProgress(t.type, t.tmdbId);
  const resume = isTv && prog?.season ? { s: prog.season, e: prog.episode ?? 1 } : null;
  const firstSeason = d.data!.seasons[0]?.number ?? 1;
  const playLabel = isTv
    ? resume
      ? `Continuar ${epLabel(resume.s, resume.e)}`
      : `Começar a assistir ${epLabel(firstSeason, 1)}`
    : prog && !prog.ended
      ? 'Continuar assistindo'
      : 'Assistir agora';

  const facts: [string, string][] = [];
  facts.push(['Tipo', kindLabel(t)]);
  if (t.year) facts.push(['Lançamento', String(t.year)]);
  if (t.certification) facts.push(['Classificação', t.certification]);
  if (t.runtime) facts.push([isTv ? 'Duração do episódio' : 'Duração', `${t.runtime} min`]);
  if (isTv && d.data!.seasons.length) facts.push(['Temporadas', String(d.data!.seasons.length)]);
  if (t.genres?.length) facts.push(['Gêneros', t.genres.join(', ')]);

  return (
    <main className={page}>
      <section className={hero}>
        <div className={cn('absolute inset-0', t.backdrop ? 'opacity-75' : 'opacity-55')} aria-hidden="true">
          {t.backdrop ? (
            <Img
              path={t.backdrop}
              alt=""
              kind="backdrop"
              sizes="100vw"
              eager
              className="absolute inset-0 size-full object-cover"
            />
          ) : (
            <Img
              path={t.poster}
              alt=""
              size="w342"
              eager
              className="absolute -inset-10 size-[calc(100%+80px)] max-w-none scale-110 object-cover blur-[40px] saturate-130"
            />
          )}
        </div>
        {/* o fundo se dissolve na noite: de baixo para cima e pela esquerda, onde fica o texto */}
        <div
          className="absolute inset-0 bg-linear-to-t from-noite from-8% via-noite/75 via-45% to-noite/35"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-linear-to-r from-noite/60 to-transparent to-70%" aria-hidden="true" />
        <div className={cn(heroInner, 'animate-fade-in')}>
          <div className={poster}>
            <Img path={t.poster} alt={`Pôster de ${t.title}`} size="w500" eager className="size-full object-cover" />
          </div>
          <div className="flex min-w-0 flex-col gap-4">
            <h1 className="font-display text-[32px] leading-[1.05] font-extrabold tracking-[-0.025em] lg:text-[52px]">
              {t.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2.5">
              {t.rating ? (
                <span className="inline-flex items-center gap-1 font-bold text-papel tabular-nums">
                  <StarIcon className="size-[18px] text-anil" /> {t.rating.toFixed(1)}
                  {t.voteCount ? (
                    <small className="font-normal text-nevoa"> ({t.voteCount.toLocaleString('pt-BR')})</small>
                  ) : null}
                </span>
              ) : null}
              <span className="tag">{kindLabel(t)}</span>
              {t.certification && <span className="tag">{t.certification}</span>}
              {t.year && <span className="meta">{t.year}</span>}
              {t.genres?.slice(0, 3).map((g) => (
                <span key={g} className="meta before:mr-1.5 before:content-['•']">
                  {g}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-2.5">
              <button
                className="btn btn-primary relative isolate"
                onClick={() =>
                  open(
                    isTv
                      ? { type: 'tv', tmdbId: t.tmdbId, season: resume?.s ?? firstSeason, episode: resume?.e ?? 1 }
                      : { type: 'movie', tmdbId: t.tmdbId },
                  )
                }
              >
                <BorderBeam size={50} duration={5} colorFrom="#ffffff" colorTo="#b27cff" />
                <PlayIcon /> {playLabel}
              </button>
              <button
                className="btn btn-outline btn-icon"
                aria-label={inList ? 'Remover da minha lista' : 'Adicionar à minha lista'}
                aria-pressed={inList}
                onClick={() => toggleList(t)}
              >
                <BookmarkIcon filled={inList} />
              </button>
            </div>
            {t.overview ? (
              <div className="max-w-[760px] text-papel-2">
                <p className={cn(!more && 'line-clamp-4')}>{t.overview}</p>
                {t.overview.length > 240 && (
                  <button
                    className="-mx-1 mt-1 rounded-md px-1 py-1.5 text-sm font-semibold text-nevoa transition-colors hover:text-anil-claro"
                    aria-expanded={more}
                    onClick={() => setMore((m) => !m)}
                  >
                    {more ? 'Menos detalhes' : 'Mais detalhes'}
                  </button>
                )}
              </div>
            ) : (
              <p className="meta">Sinopse não informada pelas fontes.</p>
            )}
            <dl className="mt-1 grid max-w-[760px] grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-x-6 gap-y-3">
              {facts.map(([k, v]) => (
                <div key={k} className="min-w-0">
                  <dt className="text-[13px] text-nevoa">{k}</dt>
                  <dd className="mt-0.5 text-[15px] font-medium text-papel">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {isTv &&
        (d.data!.seasons.length ? (
          <Episodes t={t} seasons={d.data!.seasons} />
        ) : (
          <section className="container-page pt-6">
            <h2 className="section-title">Episódios</h2>
            <EmptyState
              title="Temporadas não informadas"
              text="As fontes ainda não listam as temporadas desta série. Você pode tentar começar pelo primeiro episódio."
              action={
                <button className="btn btn-primary" onClick={() => open({ type: 'tv', tmdbId: t.tmdbId, season: 1, episode: 1 })}>
                  <PlayIcon /> Assistir T1 E1
                </button>
              }
            />
          </section>
        ))}

      <div className="mt-14">
        <Recommendations t={t} />
      </div>
    </main>
  );
}
