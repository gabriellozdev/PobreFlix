import { memo } from 'react';
import { Link } from 'react-router-dom';
import type { Title } from '../api/types';
import { usePlayer } from '../hooks/usePlayer';
import { titleHref } from '../lib/routes';
import { toggleList, useInList } from '../store/library';
import { BookmarkIcon, PlayIcon, StarIcon } from './Icons';
import { Img } from './Img';

export function kindLabel(t: Pick<Title, 'type' | 'isAnime' | 'isDorama'>) {
  if (t.isAnime) return t.type === 'tv' ? 'Anime' : 'Filme de anime';
  if (t.isDorama) return 'Dorama';
  return t.type === 'tv' ? 'Série' : 'Filme';
}

interface Props {
  t: Title;
  /** texto extra sob o título (ex.: data) */
  sub?: string;
  badge?: string;
}

const poster = 'relative aspect-2/3 overflow-hidden rounded-lg bg-sala ring-1 ring-white/5 transition-shadow duration-200';
const hoverAction =
  'inline-flex size-10 items-center justify-center rounded-full transition-[background-color,color,transform] duration-150 hover:scale-105 [&_svg]:size-6';

export const TitleCard = memo(function TitleCard({ t, sub, badge }: Props) {
  const { open } = usePlayer();
  const inList = useInList(t.type, t.tmdbId);
  const href = titleHref(t.type, t.tmdbId);
  const meta = sub ?? [kindLabel(t), t.year].filter(Boolean).join(' • ');

  return (
    <div className="group/card relative min-w-0">
      <Link to={href} className="group/link block rounded-lg" aria-label={`${t.title} (${meta})`}>
        <div
          className={`${poster} group-hover/card:ring-anil/50 group-focus-visible/link:ring-2 group-focus-visible/link:ring-anil`}
        >
          <Img path={t.poster} alt={t.title} sizes="(min-width: 960px) 210px, 40vw" />
          {badge && (
            <span className="absolute top-2 left-2 rounded-full bg-anil px-2 py-0.5 text-xs leading-tight font-semibold text-noite">
              {badge}
            </span>
          )}
        </div>
        <div className="pt-2.5">
          <h4 className="line-clamp-2 text-[15px] leading-snug font-semibold text-papel transition-colors group-focus-visible/link:text-anil-claro">
            {t.title}
          </h4>
          <p className="mt-1 text-[13px] text-nevoa">{meta}</p>
        </div>
      </Link>
      {/* camada de hover (desktop), como na referência */}
      <div
        className="pointer-events-none absolute -inset-1.5 z-3 hidden flex-col overflow-hidden rounded-xl bg-poltrona/95 opacity-0 shadow-[0_20px_50px_rgba(8,6,20,0.7)] ring-1 ring-anil/40 backdrop-blur-md transition-opacity duration-200 group-hover/card:pointer-events-auto group-hover/card:opacity-100 [@media(hover:hover)_and_(min-width:50rem)]:flex"
        aria-hidden="true"
      >
        <Link to={href} className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden px-3.5 pt-3.5" tabIndex={-1}>
          <h4 className="text-[15px] leading-snug font-semibold text-papel">{t.title}</h4>
          {t.rating ? (
            <p className="flex items-center gap-1 text-[13px] font-semibold text-papel tabular-nums">
              <StarIcon className="size-[15px] text-anil-claro" /> {t.rating.toFixed(1)}
            </p>
          ) : null}
          <p className="text-[13px] text-nevoa">{meta}</p>
          {t.overview && <p className="line-clamp-7 text-[13px] leading-[1.45] text-papel-2">{t.overview}</p>}
        </Link>
        <div className="flex gap-1.5 px-2.5 pt-2 pb-2.5">
          <button
            tabIndex={-1}
            title="Assistir"
            className={`${hoverAction} bg-anil text-noite hover:bg-anil-claro`}
            onClick={() => open({ type: t.type, tmdbId: t.tmdbId, season: 1, episode: 1 })}
          >
            <PlayIcon />
          </button>
          <button
            tabIndex={-1}
            title={inList ? 'Remover da lista' : 'Adicionar à lista'}
            className={`${hoverAction} text-anil hover:bg-white/10 hover:text-anil-claro`}
            onClick={() => toggleList(t)}
          >
            <BookmarkIcon filled={inList} />
          </button>
        </div>
      </div>
    </div>
  );
});

export function CardSkeleton() {
  return (
    <div className="relative min-w-0" aria-hidden="true">
      <div className="sk aspect-2/3 rounded-lg" />
      <div className="pt-2.5">
        <div className="sk sk-line" />
        <div className="sk sk-line w-[55%]" />
      </div>
    </div>
  );
}
