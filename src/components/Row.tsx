import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from './Icons';
import { ErrorState } from './States';

interface Props {
  title: string;
  subtitle?: string;
  more?: string;
  loading?: boolean;
  error?: Error;
  onRetry?: () => void;
  skeleton: ReactNode;
  variant?: 'poster' | 'episode';
  children?: ReactNode;
  empty?: boolean;
}

/* colunas visíveis por breakpoint (frações deixam o próximo item à mostra) */
const COLS = {
  poster: '[--cols:2.3] sm:[--cols:3.3] md:[--cols:4] lg:[--cols:5] 2xl:[--cols:6]',
  episode: '[--cols:1.4] sm:[--cols:2.3] lg:[--cols:3] 2xl:[--cols:4]',
};

const arrow =
  'group/arrow absolute top-0 bottom-15 z-4 hidden w-(--page-pad) min-w-10 items-center justify-center from-noite/95 to-transparent text-papel opacity-80 transition-opacity duration-200 hover:opacity-100 [@media(hover:hover)_and_(min-width:50rem)]:flex';
const arrowIcon = 'size-10 transition-[transform,color] duration-200 group-hover/arrow:scale-115 group-hover/arrow:text-anil-claro';

/** Carrossel horizontal com setas (desktop), arrasto/rolagem por toque (mobile). */
export function Row({ title, subtitle, more, loading, error, onRetry, skeleton, variant = 'poster', children, empty }: Props) {
  const track = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const update = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    update();
    const el = track.current;
    if (!el) return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [update, loading, children]);

  const page = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: 'smooth' });
  };

  if (!loading && !error && empty) return null;

  return (
    <section>
      <div className="container-page mb-4 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h2 className="section-title">{title}</h2>
          {subtitle && <p className="meta mt-0.5">{subtitle}</p>}
        </div>
        {more && (
          <Link
            to={more}
            className="-mb-2.5 inline-flex h-11 flex-none items-center rounded-full px-1 text-sm font-semibold text-nevoa transition-colors hover:text-anil-claro"
          >
            Ver tudo
          </Link>
        )}
      </div>
      {error ? (
        <div className="container-page">
          <ErrorState error={error} onRetry={onRetry} compact />
        </div>
      ) : (
        <div className="relative mx-auto max-w-[calc(var(--content-w)_+_var(--page-pad)_*_2)]">
          <button
            className={cn(arrow, 'left-0 bg-linear-to-r')}
            aria-label="Anterior"
            onClick={() => page(-1)}
            hidden={edges.start}
          >
            <ChevronLeft className={arrowIcon} />
          </button>
          <div
            className={cn(
              'no-scrollbar grid snap-x snap-mandatory auto-cols-[calc((100%_-_var(--gap)_*_(var(--cols)_-_1))_/_var(--cols))] grid-flow-col gap-(--gap) overflow-x-auto overscroll-x-contain scroll-px-(--page-pad) px-page pt-1 pb-2 *:snap-start',
              '[--gap:12px] sm:[--gap:16px] lg:[--gap:20px]',
              COLS[variant],
            )}
            ref={track}
            onScroll={update}
          >
            {loading ? skeleton : children}
          </div>
          <button
            className={cn(arrow, 'right-0 bg-linear-to-l')}
            aria-label="Próximo"
            onClick={() => page(1)}
            hidden={edges.end}
          >
            <ChevronRight className={arrowIcon} />
          </button>
        </div>
      )}
    </section>
  );
}

export const repeat = (n: number, el: (i: number) => ReactNode) => Array.from({ length: n }, (_, i) => el(i));
