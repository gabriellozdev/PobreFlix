// GlowBorderCard — VengeanceUI (MIT, github.com/Ashutoshx7/VengeanceUI).
// Mesmo componente; preset "anil" com as cores da marca e fundo escuro fixo
// (o site não tem tema claro). A classe .glow-conic está em styles/app.css.
import React from 'react';
import { cn } from '@/lib/utils';

export interface GlowBorderCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  width?: string;
  height?: string;
  aspectRatio?: string;
  borderRadius?: string;
  animationDuration?: number;
  gradientColors?: string[];
  borderWidth?: string;
  blurAmount?: string;
  inset?: string;
  colorPreset?: 'nature' | 'ocean' | 'sunset' | 'aurora' | 'anil' | 'custom';
  paused?: boolean;
  /** classes do container interno (o original fixa p-4 e centraliza) */
  contentClassName?: string;
}

const colorPresets: Record<string, string[]> = {
  nature: ['#669900', '#88bb22', '#99cc33', '#aaddaa', '#ccee66', '#006699', '#228888', '#3399cc', '#55aacc', '#669900'],
  ocean: ['#006699', '#1177aa', '#2288bb', '#3399cc', '#44aadd', '#55bbee', '#66ccff', '#44bbee', '#2299cc', '#006699'],
  sunset: ['#ff6600', '#ff7711', '#ff8822', '#ff9900', '#ffaa22', '#ffbb44', '#ffcc00', '#ff9933', '#ff7722', '#ff6600'],
  aurora: ['#00ff87', '#22ffaa', '#44ffcc', '#60efff', '#88ddff', '#bb99ff', '#dd77ee', '#ff68f0', '#ff55cc', '#00ff87'],
  anil: ['#6f74fc', '#8a8efd', '#b27cff', '#ff68f0', '#6f74fc', '#60efff', '#8a8efd', '#ffd23f', '#b27cff', '#6f74fc'],
  custom: ['#669900', '#99cc33', '#ccee66', '#006699', '#3399cc', '#990066', '#cc3399', '#ff6600', '#ff9900', '#ffcc00'],
};

export const GlowBorderCard = React.forwardRef<HTMLDivElement, GlowBorderCardProps>(
  (
    {
      children,
      className,
      contentClassName,
      width = '320px',
      height,
      aspectRatio = '1',
      borderRadius = '0.75rem',
      animationDuration = 4,
      gradientColors,
      borderWidth = '1.25em',
      blurAmount = '0.75em',
      inset = '-1em',
      colorPreset = 'custom',
      paused = false,
      style,
      ...props
    },
    ref,
  ) => {
    const colors = gradientColors || colorPresets[colorPreset] || colorPresets.custom;
    const colorVars: Record<string, string> = {};
    for (let i = 0; i < 10; i++) colorVars[`--glow-color-${i + 1}`] = colors[i % colors.length];

    return (
      <div
        ref={ref}
        className={cn('relative isolate grid place-content-center overflow-hidden bg-noite/60 backdrop-blur-md', className)}
        style={
          {
            width,
            height: height || 'auto',
            aspectRatio: height ? 'unset' : aspectRatio,
            borderRadius,
            '--glow-animation-duration': `${animationDuration}s`,
            ...colorVars,
            ...style,
          } as React.CSSProperties
        }
        {...props}
      >
        <div
          aria-hidden="true"
          className={cn('glow-conic absolute -z-10 rounded-[inherit] border-solid', paused && '[animation-play-state:paused]')}
          style={{ inset, borderWidth, filter: `blur(${blurAmount})` }}
        />
        <div className={cn('relative z-10 flex h-full w-full items-center justify-center bg-transparent p-4', contentClassName)}>
          {children}
        </div>
      </div>
    );
  },
);
GlowBorderCard.displayName = 'GlowBorderCard';
