import type { SVGProps } from 'react';
import { cn } from '@/lib/utils';
import { MARK, MARK_SMALL, WORDMARK, WORDMARK_VIEWBOX } from './brand';

type P = SVGProps<SVGSVGElement>;
const base = (p: P) => ({
  viewBox: '0 0 24 24',
  width: 24,
  height: 24,
  fill: 'currentColor',
  'aria-hidden': true as const,
  focusable: false as const,
  ...p,
});

export const PlayIcon = (p: P) => (
  <svg {...base(p)}><path d="M8 5.5v13a.5.5 0 0 0 .77.42l10.2-6.5a.5.5 0 0 0 0-.84L8.77 5.08A.5.5 0 0 0 8 5.5z" /></svg>
);
export const SearchIcon = (p: P) => (
  <svg {...base(p)}><path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" /></svg>
);
export const BookmarkIcon = ({ filled, ...p }: P & { filled?: boolean }) => (
  <svg {...base(p)}>
    {filled ? (
      <path d="M17 3H7a2 2 0 0 0-2 2v16l7-3 7 3V5a2 2 0 0 0-2-2z" />
    ) : (
      <path d="M17 3H7a2 2 0 0 0-2 2v16l7-3 7 3V5a2 2 0 0 0-2-2zm0 15-5-2.18L7 18V5h10v13z" />
    )}
  </svg>
);
export const CloseIcon = (p: P) => (
  <svg {...base(p)}><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
);
export const ChevronLeft = (p: P) => (
  <svg {...base(p)}><path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" /></svg>
);
export const ChevronRight = (p: P) => (
  <svg {...base(p)}><path d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" /></svg>
);
export const ChevronDown = (p: P) => (
  <svg {...base(p)}><path d="M16.59 8.59 12 13.17 7.41 8.59 6 10l6 6 6-6z" /></svg>
);
export const MenuIcon = (p: P) => (
  <svg {...base(p)}><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" /></svg>
);
export const StarIcon = (p: P) => (
  <svg {...base(p)}><path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
);
export const ArrowLeft = (p: P) => (
  <svg {...base(p)}><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" /></svg>
);
export const SkipNext = (p: P) => (
  <svg {...base(p)}><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
);
export const SkipPrev = (p: P) => (
  <svg {...base(p)}><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" /></svg>
);
export const AlertIcon = (p: P) => (
  <svg {...base(p)}><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" /></svg>
);
export const ReloadIcon = (p: P) => (
  <svg {...base(p)}><path d="M17.65 6.35A7.96 7.96 0 0 0 12 4a8 8 0 1 0 7.73 10h-2.08A6 6 0 1 1 12 6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" /></svg>
);
export const SettingsIcon = (p: P) => (
  <svg {...base(p)}><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.48.48 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.48.48 0 0 0-.59.22L2.74 8.87a.47.47 0 0 0 .12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.47.47 0 0 0-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2z" /></svg>
);
export const ListIcon = (p: P) => (
  <svg {...base(p)}><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" /></svg>
);
export const TvIcon = (p: P) => (
  <svg {...base(p)}><path d="M21 3H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5v2h8v-2h5a2 2 0 0 0 1.99-2L23 5a2 2 0 0 0-2-2zm0 14H3V5h18v12z" /></svg>
);
export const CalendarIcon = (p: P) => (
  <svg {...base(p)}><path d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" /></svg>
);

/** Símbolo "Meia-entrada" (brand/final). Até 48 px usa o corte pequeno, de vão maior. */
export function BrandMark({ className, size = 36 }: { className?: string; size?: number }) {
  return (
    <svg viewBox="0 0 256 256" width={size} height={size} aria-hidden="true" className={cn('flex-none', className)}>
      <path d={size <= 48 ? MARK_SMALL : MARK} fill="var(--color-anil)" />
    </svg>
  );
}

/**
 * Logo horizontal: símbolo + wordmark em contornos (o "x" cortado só existe no desenho,
 * por isso não é texto digitado). Proporções do lockup mestre `meia-horizontal.svg`.
 */
export function Logo({ compact, className, size = 36 }: { compact?: boolean; className?: string; size?: number }) {
  // altura do wordmark = 113/256 do símbolo, como no lockup mestre
  const wordH = (size * 113) / 256;
  return (
    <span className={cn('inline-flex items-center', className)} role="img" aria-label="PobreFlix">
      <BrandMark size={size} />
      {!compact && (
        <svg viewBox={WORDMARK_VIEWBOX} height={wordH} width={(wordH * 875) / 155.5} aria-hidden="true" className="flex-none text-papel">
          <path d={WORDMARK} fill="currentColor" />
        </svg>
      )}
    </span>
  );
}
