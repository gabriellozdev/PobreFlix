import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { getSeasonEpisodes, getTitleDetails, sb, type PlayTarget, type PlayerSource } from '../api';
import { resolveSources, withTarget } from '../api/sources';
import { useAsync } from '../hooks/useAsync';
import { usePlayer } from '../hooks/usePlayer';
import { epLabel, titleHref } from '../lib/routes';
import { recordProgress } from '../store/library';
import { EpisodeCard, EpisodeSkeleton } from './EpisodeCard';
import { AlertIcon, ArrowLeft, CloseIcon, Logo, ReloadIcon, SkipNext, SkipPrev } from './Icons';
import { EpisodePicker } from './EpisodePicker';
import { ErrorState } from './States';
import { BorderBeam } from './ui/border-beam';
import { GlowBorderCard } from './ui/glow-border-card';

const TIP_KEY = 'pf:playerTipHidden';
const tipHidden = () => {
  try {
    return localStorage.getItem(TIP_KEY) === '1';
  } catch {
    return false;
  }
};

const SLOW_MS = 20_000;

function SourceBadge({ s, active }: { s: PlayerSource; active: boolean }) {
  const dot = cn('size-2 flex-none rounded-full', active && 'ring-2 ring-noite');
  if (s.available === true) return <span className={cn(dot, 'bg-ok')} title="Título confirmado neste servidor" />;
  if (s.available === false) return <span className={cn(dot, 'bg-perigo')} title="Este servidor não lista o título" />;
  return <span className={cn(dot, 'bg-nevoa/60')} title="Disponibilidade não verificável" />;
}

/** botão redondo da barra do player (voltar / fechar) */
const barBtn =
  'inline-flex size-12 flex-none items-center justify-center rounded-full text-papel-2 transition-colors hover:bg-white/10 hover:text-papel';
/** faixas de aviso abaixo do player: largura total no celular, cartão na grade larga */
const strip = 'm-0 flex gap-2.5 px-page py-2.5 text-sm leading-snug text-papel-2 xl:mt-3 xl:rounded-2xl xl:px-4';
const overlay = 'absolute inset-0 z-1 flex flex-col items-center justify-center gap-3.5 p-4 text-center text-papel-2';

export function PlayerModal() {
  const { current, close } = usePlayer();
  if (!current) return null;
  return <Player key={`${current.type}${current.tmdbId}`} target={current} onClose={close} />;
}

function Player({ target, onClose }: { target: PlayTarget; onClose: () => void }) {
  const { open } = usePlayer();
  const isTv = target.type === 'tv';
  const season = target.season ?? 1;
  const episode = target.episode ?? 1;

  const details = useAsync(() => getTitleDetails(target.type, target.tmdbId), [target.type, target.tmdbId]);
  const srcs = useAsync(() => resolveSources(target), [target.type, target.tmdbId]);
  const eps = useAsync(
    () => (isTv ? getSeasonEpisodes(target.tmdbId, season) : Promise.resolve(undefined)),
    [isTv, target.tmdbId, season],
  );

  const sources = useMemo(() => (srcs.data ? withTarget(srcs.data, target) : []), [srcs.data, target]);
  const [srcIdx, setSrcIdx] = useState(0);
  const [frameState, setFrameState] = useState<'loading' | 'loaded' | 'slow'>('loading');
  const [reloadKey, setReloadKey] = useState(0);
  const [showTip, setShowTip] = useState(() => !tipHidden());
  const hideTip = () => {
    setShowTip(false);
    try {
      localStorage.setItem(TIP_KEY, '1');
    } catch {
      /* sem storage */
    }
  };
  const closeBtn = useRef<HTMLButtonElement>(null);
  const source = sources[srcIdx];
  const allMissing = sources.length > 0 && sources.every((s) => s.available === false);

  // trava a rolagem da página e foca o botão de fechar
  useEffect(() => {
    document.body.classList.add('no-scroll');
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.classList.remove('no-scroll');
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  // reinicia o estado do iframe quando muda a URL
  useEffect(() => {
    if (!source) return;
    setFrameState('loading');
    const t = setTimeout(() => setFrameState((s) => (s === 'loading' ? 'slow' : s)), SLOW_MS);
    return () => clearTimeout(t);
  }, [source?.url, reloadKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // salva "continuar assistindo"
  const title = details.data?.title;
  useEffect(() => {
    if (title) recordProgress(title, isTv ? { season, episode, ended: false } : { ended: false });
  }, [title, isTv, season, episode]);

  // progresso real informado pelo player do StreamBetter (postMessage)
  useEffect(() => {
    const onMsg = (ev: MessageEvent) => {
      if (!sb.isSbProgress(ev) || !title) return;
      const d = ev.data;
      if (Number(d.tmdbId) !== target.tmdbId) return;
      const percent = d.duration ? d.currentTime / d.duration : undefined;
      recordProgress(title, {
        season: d.season ?? undefined,
        episode: d.episode ?? undefined,
        percent,
        ended: d.state === 'ended',
      });
      // o player pode avançar sozinho para o próximo episódio
      if (isTv && d.season && d.episode && (d.season !== season || d.episode !== episode)) {
        open({ type: 'tv', tmdbId: target.tmdbId, season: d.season, episode: d.episode });
      }
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [title, target.tmdbId, isTv, season, episode, open]);

  const seasons = details.data?.seasons ?? [];
  const seasonInfo = seasons.find((s) => s.number === season);
  const epList = eps.data?.episodes ?? [];
  const known = eps.data?.complete;
  const curEp = epList.find((e) => e.number === episode);
  const lastInSeason = known ? Math.max(0, ...epList.map((e) => e.number)) : seasonInfo?.episodeCount;
  const seasonIdx = seasons.findIndex((s) => s.number === season);

  const goEp = (s: number, e: number) => open({ type: 'tv', tmdbId: target.tmdbId, season: s, episode: e });
  const next = () => {
    if (lastInSeason && episode >= lastInSeason) {
      const ns = seasons[seasonIdx + 1];
      if (ns) goEp(ns.number, 1);
      return;
    }
    goEp(season, episode + 1);
  };
  const hasNext = !lastInSeason || episode < lastInSeason || seasonIdx < seasons.length - 1;
  const prev = () => {
    if (episode > 1) goEp(season, episode - 1);
    else if (seasonIdx > 0) {
      const ps = seasons[seasonIdx - 1];
      goEp(ps.number, ps.episodeCount ?? 1);
    }
  };
  const hasPrev = episode > 1 || seasonIdx > 0;

  const trySource = (i: number) => {
    setSrcIdx(i);
    setReloadKey((k) => k + 1);
  };
  const nextSource = () => trySource((srcIdx + 1) % Math.max(1, sources.length));

  // o brilho na borda só gira enquanto algo carrega; o iframe fica montado o tempo todo
  const glowing = srcs.loading || (!srcs.error && !!source && frameState === 'loading');

  return (
    <div
      className="fixed inset-0 z-100 flex animate-player-in flex-col overflow-y-auto overscroll-contain bg-noite"
      role="dialog"
      aria-modal="true"
      aria-label={title ? `Assistindo ${title.title}` : 'Player'}
    >
      <div className="sticky top-0 z-2 flex h-header flex-none items-center gap-2 border-b border-white/5 bg-sala px-2">
        <button className={barBtn} onClick={onClose} aria-label="Voltar">
          <ArrowLeft />
        </button>
        <Logo size={32} className="mx-2 max-sm:[&>svg:last-child]:hidden" />
        <div className="min-w-0 flex-1 truncate font-semibold text-papel-2">
          {title?.title}
          {isTv && <span className="font-normal text-nevoa"> · {epLabel(season, episode)}</span>}
        </div>
        <button ref={closeBtn} className={barBtn} onClick={onClose} aria-label="Fechar player">
          <CloseIcon />
        </button>
      </div>

      <div className="mx-auto grid w-full max-w-[1680px] grid-cols-1 xl:grid-cols-[minmax(0,1fr)_380px] xl:gap-6 xl:px-6 xl:pt-6 xl:pb-10">
        <div className="min-w-0">
          <GlowBorderCard
            colorPreset="anil"
            width="100%"
            aspectRatio="16/9"
            borderRadius="var(--frame-r)"
            paused={!glowing}
            className={cn(
              'block bg-black backdrop-blur-none [--frame-r:0] xl:[--frame-r:1rem]',
              'max-h-[calc(100vh-var(--header-h)-60px)] xl:max-h-[calc(100vh-var(--header-h)-120px)]',
              '[&>div:first-child]:transition-opacity [&>div:first-child]:duration-500',
              !glowing && '[&>div:first-child]:opacity-0',
            )}
            contentClassName="absolute inset-0 p-0"
          >
            {srcs.loading ? (
              <div className={overlay}>
                <span className="spinner" aria-label="Carregando fontes" />
              </div>
            ) : srcs.error || !source ? (
              <div className={cn(overlay, 'bg-noite/85')}>
                <ErrorState error={srcs.error} onRetry={srcs.reload} compact />
              </div>
            ) : (
              <>
                <iframe
                  key={`${source.url}#${reloadKey}`}
                  src={source.url}
                  title={`Player ${source.label}`}
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen; clipboard-write"
                  allowFullScreen
                  referrerPolicy="origin"
                  onLoad={() => setFrameState('loaded')}
                  className={cn(
                    'absolute inset-0 size-full border-0 transition-opacity duration-500',
                    frameState === 'loading' && 'opacity-30',
                  )}
                />
                {frameState === 'loading' && (
                  <div className={cn(overlay, 'pointer-events-none')} aria-live="polite">
                    <span className="spinner" />
                    <p className="font-semibold">Carregando {source.label}…</p>
                  </div>
                )}
                {frameState === 'slow' && (
                  <div className={cn(overlay, 'bg-noite/90 backdrop-blur-sm')} role="alert">
                    <AlertIcon className="size-10 text-anil" />
                    <p>Este servidor está demorando para responder.</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      <button className="btn btn-primary" onClick={nextSource}>
                        Tentar outro servidor
                      </button>
                      <button className="btn btn-outline" onClick={() => setFrameState('loaded')}>
                        Continuar esperando
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </GlowBorderCard>

          {sources.length > 0 && (
            <div
              className="flex flex-wrap items-center gap-2 bg-sala px-page py-2.5 xl:mt-3 xl:rounded-2xl xl:px-3"
              role="group"
              aria-label="Servidores"
            >
              <span className="mr-1 text-sm font-semibold text-nevoa">Servidor:</span>
              {sources.map((s, i) => {
                const active = i === srcIdx;
                return (
                  <button
                    key={s.id}
                    className={cn(
                      'relative inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors',
                      active ? 'bg-anil text-noite' : 'bg-poltrona text-papel-2 hover:bg-cortina hover:text-papel',
                    )}
                    aria-pressed={active}
                    onClick={() => trySource(i)}
                    title={`${s.provider}${s.available === false ? ' — não lista este título' : ''}`}
                  >
                    {active && <BorderBeam size={40} duration={4} colorFrom="#ffffff" colorTo="#b27cff" />}
                    <SourceBadge s={s} active={active} />
                    {s.label}{' '}
                    <small className={cn('font-normal', active ? 'text-noite/70' : 'text-nevoa')}>{s.provider}</small>
                  </button>
                );
              })}
              <button
                className="ml-auto inline-flex size-11 items-center justify-center rounded-full bg-poltrona text-papel-2 transition-colors hover:bg-cortina hover:text-papel [&>svg]:size-5"
                onClick={() => setReloadKey((k) => k + 1)}
                aria-label="Recarregar player"
              >
                <ReloadIcon />
              </button>
            </div>
          )}
          {showTip && source && (
            <p className={cn(strip, 'items-start bg-anil/10')} role="note">
              <AlertIcon className="mt-0.5 size-[18px] flex-none text-anil" />
              <span className="flex-1">
                <b className="text-papel">Tela preta?</b> Se aparecer <i>“Confirme que é humano”</i>, clique na caixa dentro
                do player. Se continuar preto, desative o bloqueador de anúncios para este site ou{' '}
                <button className="link underline" onClick={nextSource}>
                  troque de servidor
                </button>
                .
              </span>
              <button
                className="-my-2 -mr-2 inline-flex size-10 flex-none items-center justify-center rounded-full text-nevoa transition-colors hover:bg-white/10 hover:text-papel [&>svg]:size-[18px]"
                aria-label="Esconder dica"
                onClick={hideTip}
              >
                <CloseIcon />
              </button>
            </p>
          )}
          {allMissing && (
            <p className={cn(strip, 'flex-wrap items-center bg-perigo/10')} role="status">
              <AlertIcon className="size-[18px] flex-none text-perigo" /> Nenhum servidor confirmou este título. Você
              ainda pode tentar, mas talvez apareça “não encontrado” dentro do player.
            </p>
          )}
          {source?.available === false && !allMissing && (
            <p className={cn(strip, 'flex-wrap items-center bg-perigo/10')} role="status">
              <AlertIcon className="size-[18px] flex-none text-perigo" /> {source.provider} não lista este título.{' '}
              <button className="link" onClick={nextSource}>
                Trocar de servidor
              </button>
            </p>
          )}

          <div className="flex flex-col gap-2 px-page pt-5 pb-2 xl:px-0">
            {details.loading ? (
              <>
                <div className="sk sk-line w-[140px]" />
                <div className="sk sk-line h-7 w-1/2" />
              </>
            ) : details.error ? (
              <ErrorState error={details.error} onRetry={details.reload} compact />
            ) : title ? (
              <>
                <Link to={titleHref(title.type, title.tmdbId)} className="link self-start" onClick={onClose}>
                  {title.title}
                </Link>
                <h1 className="font-display text-[22px] leading-tight font-bold tracking-[-0.01em] lg:text-[28px]">
                  {isTv ? `${epLabel(season, episode)}${curEp?.name ? ` – ${curEp.name}` : ''}` : title.title}
                </h1>
                <p className="meta">
                  {[title.year, title.certification && `Classificação ${title.certification}`, curEp?.runtime && `${curEp.runtime} min`]
                    .filter(Boolean)
                    .join(' • ')}
                </p>
                {(curEp?.overview || (!isTv && title.overview)) && (
                  <p className="max-w-[860px] text-papel-2">{curEp?.overview || title.overview}</p>
                )}
                {isTv && (
                  <div className="mt-2 flex flex-wrap gap-2.5">
                    <button className="btn btn-outline" onClick={prev} disabled={!hasPrev}>
                      <SkipPrev /> Anterior
                    </button>
                    <button className="btn btn-primary" onClick={next} disabled={!hasNext}>
                      Próximo <SkipNext />
                    </button>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>

        {isTv && (
          <aside
            className="min-w-0 px-page pt-6 pb-10 xl:sticky xl:top-[calc(var(--header-h)+24px)] xl:max-h-[calc(100vh-var(--header-h)-48px)] xl:self-start xl:overflow-y-auto xl:p-0 xl:[scrollbar-width:thin]"
            aria-label="Episódios"
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-bold">Episódios</h2>
              {seasons.length > 0 && (
                <label className="select">
                  <span className="visually-hidden">Temporada</span>
                  <select value={season} onChange={(e) => goEp(Number(e.target.value), 1)}>
                    {seasons.map((s) => (
                      <option key={s.number} value={s.number}>
                        {s.name && !/^Temporada \d+$/i.test(s.name) ? `T${s.number}: ${s.name}` : `Temporada ${s.number}`}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>
            {eps.loading ? (
              <div className="flex flex-col gap-3">
                {[0, 1, 2, 3].map((k) => (
                  <EpisodeSkeleton key={k} layout="row" />
                ))}
              </div>
            ) : known ? (
              <div className="flex flex-col gap-3">
                {epList.map((e) => (
                  <EpisodeCard
                    key={e.number}
                    layout="row"
                    image={e.still}
                    fallbackPoster={title?.poster}
                    top={epLabel(e.season, e.number)}
                    title={e.name || `Episódio ${e.number}`}
                    sub={e.runtime ? `${e.runtime} min` : undefined}
                    active={e.number === episode}
                    onPlay={() => goEp(e.season, e.number)}
                  />
                ))}
              </div>
            ) : (
              <EpisodePicker
                season={season}
                episode={episode}
                extras={epList}
                count={seasonInfo?.episodeCount}
                onPick={(n) => goEp(season, n)}
              />
            )}
          </aside>
        )}
      </div>
    </div>
  );
}

