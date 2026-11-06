import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { Title } from '../api/types';
import { usePlayer } from '../hooks/usePlayer';
import { titleHref } from '../lib/routes';
import { toggleList, useInList } from '../store/library';
import { BookmarkIcon, ChevronLeft, ChevronRight, PlayIcon, StarIcon } from './Icons';
import { Img } from './Img';
import { kindLabel } from './TitleCard';
import { BorderBeam } from './ui/border-beam';

const INTERVAL = 9000;

/* altura do palco: no celular (<568px) o slide ativo entra no fluxo e define a altura */
const stage = 'relative h-[82vh] max-h-[760px] min-h-[560px] overflow-hidden bg-noite max-sm:h-auto max-sm:max-h-none max-sm:min-h-0';
/* conteúdo: no celular deixa espaço para o pôster centralizado acima do texto */
const content = 'container-page relative flex h-full items-end pb-24 max-sm:pt-[calc(var(--header-h)_+_232px)] max-sm:pb-18';
const copy = 'flex w-full max-w-[560px] flex-col gap-3.5 max-sm:items-center max-sm:text-center';

function Slide({ t, active }: { t: Title; active: boolean; first?: boolean }) {
  // poucas imagens (≤7): carregam já, para a troca de slide não piscar
  const first = true;
  const { open } = usePlayer();
  const inList = useInList(t.type, t.tmdbId);
  return (
    <div
      className={cn(
        'absolute inset-0 transition-[opacity,visibility] duration-800 ease-out',
        active ? 'visible opacity-100 max-sm:relative' : 'invisible opacity-0',
      )}
      aria-hidden={!active}
    >
      <div className="absolute inset-0">
        {t.backdrop ? (
          <Img path={t.backdrop} alt="" kind="backdrop" sizes="100vw" eager={first} className="absolute inset-0" />
        ) : (
          <>
            <div className="absolute -inset-10 opacity-55">
              <Img path={t.poster} alt="" size="w342" eager={first} className="scale-110 blur-[40px] saturate-130" />
            </div>
            <div
              className={cn(
                'absolute top-[calc(var(--header-h)_+_40px)] right-[max(var(--page-pad),calc((100vw_-_var(--content-w))_/_2))] hidden aspect-2/3 w-[clamp(200px,24vw,330px)] overflow-hidden rounded-lg shadow-[0_30px_60px_rgba(8,6,20,0.7)] ring-1 ring-white/10 [transform:rotate(2deg)] md:block',
                'max-sm:top-[calc(var(--header-h)_+_20px)] max-sm:right-auto max-sm:left-1/2 max-sm:-ml-16 max-sm:block max-sm:w-32 max-sm:[transform:none]',
                active && 'animate-poster-in max-sm:animate-fade-in',
              )}
            >
              <Img path={t.poster} alt="" size="w500" eager={first} />
            </div>
          </>
        )}
      </div>
      {/* sombras que dissolvem a imagem no fundo noite (#100d20) */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(16,13,32,0.94)_0%,rgba(16,13,32,0.66)_40%,rgba(16,13,32,0)_75%),linear-gradient(0deg,#100d20_0%,rgba(16,13,32,0)_45%),linear-gradient(180deg,rgba(16,13,32,0.6)_0%,rgba(16,13,32,0)_25%)] max-sm:bg-[linear-gradient(0deg,#100d20_30%,rgba(16,13,32,0.2)_75%,rgba(16,13,32,0.5)_100%)]" />
      <div className={content}>
        <div className={cn(copy, active && 'animate-fade-in [animation-delay:100ms]')}>
          <h2 className="font-display text-4xl leading-[1.02] font-extrabold tracking-[-0.035em] text-papel [text-shadow:0_2px_24px_rgba(16,13,32,0.5)] lg:text-6xl">
            {t.title}
          </h2>
          <p className="flex flex-wrap items-center gap-2.5 text-sm text-papel-2 max-sm:justify-center">
            <span className="price-tag">R$ 0,00</span>
            {t.rating ? (
              <span className="inline-flex items-center gap-1 font-bold text-papel tabular-nums">
                <StarIcon className="size-[18px] text-anil-claro" /> {t.rating.toFixed(1)}
              </span>
            ) : null}
            <span className="tag">{kindLabel(t)}</span>
            {t.year && <span className="tabular-nums">{t.year}</span>}
          </p>
          {t.overview && <p className="line-clamp-3 text-base text-pretty text-papel-2">{t.overview}</p>}
          <div className="mt-1.5 flex flex-wrap gap-2.5 max-sm:justify-center">
            <button
              className="btn btn-primary relative max-sm:flex-[1_1_100%]"
              tabIndex={active ? 0 : -1}
              onClick={() => open({ type: t.type, tmdbId: t.tmdbId, season: 1, episode: 1 })}
            >
              {active && <BorderBeam size={50} duration={5} colorFrom="#ffffff" colorTo="#6f74fc" />}
              <PlayIcon /> {t.type === 'tv' ? 'Começar a assistir T1 E1' : 'Assistir agora'}
            </button>
            <button
              className="btn btn-outline btn-icon"
              tabIndex={active ? 0 : -1}
              aria-label={inList ? 'Remover da minha lista' : 'Adicionar à minha lista'}
              aria-pressed={inList}
              onClick={() => toggleList(t)}
            >
              <BookmarkIcon filled={inList} />
            </button>
            <Link to={titleHref(t.type, t.tmdbId)} className="btn btn-ghost" tabIndex={active ? 0 : -1}>
              Mais detalhes
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const arrow =
  'absolute top-1/2 z-3 -mt-12 hidden h-24 w-12 items-center justify-center text-papel opacity-60 transition-[opacity,background-color] duration-200 hover:bg-noite/50 hover:opacity-100 lg:flex [&_svg]:size-10';

export function Hero({ items, loading }: { items: Title[]; loading: boolean }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = items.length;
  const go = useCallback((d: number) => setI((x) => (x + d + n) % n), [n]);

  useEffect(() => {
    if (n < 2 || paused) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setTimeout(() => go(1), INTERVAL);
    return () => clearTimeout(id);
  }, [i, n, paused, go]);

  if (loading) {
    return (
      <section
        className={cn(stage, 'flex items-end bg-linear-to-b from-sala to-noite max-sm:h-[520px]')}
        aria-busy="true"
        aria-label="Carregando destaques"
      >
        <div className={cn(content, 'max-sm:pt-0')}>
          <div className={copy}>
            <div className="sk sk-line" style={{ width: '60%', height: 40 }} />
            <div className="sk sk-line" style={{ width: '30%' }} />
            <div className="sk sk-line w-full" />
            <div className="sk sk-line w-full" />
            <div className="sk sk-line rounded-full" style={{ width: 240, height: 40, marginTop: 20 }} />
          </div>
        </div>
      </section>
    );
  }
  if (!n) return null;

  return (
    <section
      className={stage}
      aria-roledescription="carrossel"
      aria-label="Destaques"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {items.map((t, k) => (
        <Slide key={`${t.type}${t.tmdbId}`} t={t} active={k === i} first={k === 0} />
      ))}
      {n > 1 && (
        <>
          <button className={cn(arrow, 'left-0 rounded-r-2xl')} aria-label="Destaque anterior" onClick={() => go(-1)}>
            <ChevronLeft />
          </button>
          <button className={cn(arrow, 'right-0 rounded-l-2xl')} aria-label="Próximo destaque" onClick={() => go(1)}>
            <ChevronRight />
          </button>
          <div
            className="container-page absolute inset-x-0 bottom-7 z-3 flex gap-2 max-sm:bottom-4 max-sm:justify-center"
            role="tablist"
            aria-label="Escolher destaque"
          >
            {items.map((t, k) => (
              <button
                key={k}
                role="tab"
                aria-selected={k === i}
                aria-label={t.title}
                className="group/dot flex h-11 items-center"
                onClick={() => setI(k)}
              >
                {/* a área de toque é o botão (44px); o traço visível é a faixa interna */}
                <span
                  className={cn(
                    'relative block h-2 overflow-hidden rounded-full bg-white/25 transition-[width,background-color] duration-300 ease-cine group-hover/dot:bg-white/45',
                    k === i ? 'w-16' : 'w-5',
                  )}
                >
                  <span
                    className={cn(
                      'absolute inset-y-0 left-0 w-0 bg-anil',
                      k === i && 'animate-dot motion-reduce:w-full motion-reduce:animate-none',
                      k === i && paused && '[animation-play-state:paused]',
                    )}
                    style={{ animationDuration: `${INTERVAL}ms` }}
                  />
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
