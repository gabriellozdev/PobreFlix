import { cn } from '@/lib/utils';
import { Img } from './Img';
import { PlayIcon } from './Icons';

type Layout = 'stack' | 'row';

interface Props {
  image?: string;
  fallbackPoster?: string;
  top?: string;
  title: string;
  sub?: string;
  desc?: string;
  duration?: string;
  progress?: number;
  active?: boolean;
  /** 'stack': miniatura em cima (padrão). 'row': miniatura de 150px à esquerda (lista lateral do player). */
  layout?: Layout;
  onPlay: () => void;
}

const card = (layout: Layout) => cn('flex w-full min-w-0 text-left', layout === 'row' ? 'flex-row gap-3' : 'flex-col');
const thumb = (layout: Layout) =>
  cn('relative aspect-video overflow-hidden rounded-lg bg-sala', layout === 'row' && 'w-[150px] flex-none');
const info = (layout: Layout) => (layout === 'row' ? 'min-w-0' : 'pt-2.5');

/** Cartão 16:9 de episódio (lista de episódios, novos episódios, continuar assistindo). */
export function EpisodeCard({
  image,
  fallbackPoster,
  top,
  title,
  sub,
  desc,
  duration,
  progress,
  active,
  layout = 'stack',
  onPlay,
}: Props) {
  return (
    <button className={cn('group/ep', card(layout))} onClick={onPlay} aria-current={active || undefined}>
      <div
        className={cn(
          thumb(layout),
          active &&
            'after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:ring-3 after:ring-anil after:ring-inset',
        )}
      >
        {image ? (
          <Img
            path={image}
            alt=""
            kind="backdrop"
            size="w300"
            sizes="(min-width: 960px) 300px, 45vw"
            className="absolute inset-0"
          />
        ) : fallbackPoster ? (
          <div className="absolute inset-0 flex justify-center bg-noite before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_50%_50%,rgba(111,116,252,0.25),transparent_70%)]">
            <Img path={fallbackPoster} alt="" size="w342" className="relative aspect-2/3 h-full w-auto" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-linear-135 from-poltrona to-noite" />
        )}
        <span
          className="absolute inset-0 flex items-center justify-center bg-noite/45 opacity-0 transition-opacity duration-200 group-hover/ep:opacity-100 group-focus-visible/ep:opacity-100"
          aria-hidden="true"
        >
          <PlayIcon
            className={cn(
              'text-papel drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]',
              layout === 'row' ? 'size-9' : 'size-13',
            )}
          />
        </span>
        {duration && (
          <span className="absolute right-1.5 bottom-1.5 rounded-sm bg-noite/85 px-1.5 py-px text-xs font-bold tabular-nums">
            {duration}
          </span>
        )}
        {progress != null && progress > 0 && (
          <span className="absolute inset-x-0 bottom-0 h-1 bg-white/25">
            <span className="block h-full bg-anil" style={{ width: `${Math.min(100, progress * 100)}%` }} />
          </span>
        )}
      </div>
      <div className={info(layout)}>
        {top && <p className="truncate text-[13px] font-semibold text-nevoa">{top}</p>}
        <h4
          className={cn(
            'mt-0.5 line-clamp-2 leading-snug font-semibold text-papel transition-colors group-hover/ep:text-anil-claro',
            layout === 'row' ? 'text-sm' : 'text-[15px]',
          )}
        >
          {title}
        </h4>
        {sub && <p className="mt-1 text-[13px] text-nevoa">{sub}</p>}
        {desc && <p className="mt-1.5 line-clamp-2 text-[13px] text-papel-2">{desc}</p>}
      </div>
    </button>
  );
}

export function EpisodeSkeleton({ layout = 'stack' }: { layout?: Layout }) {
  return (
    <div className={card(layout)} aria-hidden="true">
      <div className={cn(thumb(layout), 'sk')} />
      <div className={cn(info(layout), layout === 'row' && 'flex-1')}>
        <div className="sk sk-line w-[55%]" />
        <div className="sk sk-line" />
      </div>
    </div>
  );
}
