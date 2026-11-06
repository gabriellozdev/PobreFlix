import { useState } from 'react';
import { cn } from '@/lib/utils';
import { img, posterSrcSet, backdropSrcSet, type PosterSize, type BackdropSize } from '../api/images';

interface Props {
  path?: string;
  alt: string;
  kind?: 'poster' | 'backdrop';
  size?: PosterSize | BackdropSize;
  sizes?: string;
  className?: string;
  eager?: boolean;
}

/** Imagem do TMDB com srcset, lazy-load, fade-in e um fundo enquanto carrega. */
export function Img({ path, alt, kind = 'poster', size, sizes, className, eager }: Props) {
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading');
  const src = img(path, size ?? (kind === 'poster' ? 'w342' : 'w1280'));
  if (!src || state === 'error') {
    return (
      <div
        className={cn(
          'flex h-full w-full items-end overflow-hidden bg-linear-160 from-poltrona via-sala to-noite p-2.5 text-[13px] leading-snug font-semibold text-nevoa',
          className,
        )}
        role="img"
        aria-label={alt}
      >
        <span>{alt}</span>
      </div>
    );
  }
  return (
    <img
      className={cn(
        'h-full w-full object-cover transition-opacity duration-350 ease-out',
        state === 'ok' ? 'opacity-100' : 'opacity-0',
        className,
      )}
      src={src}
      srcSet={kind === 'poster' ? posterSrcSet(path) : backdropSrcSet(path)}
      sizes={sizes}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onLoad={() => setState('ok')}
      onError={() => setState('error')}
    />
  );
}
