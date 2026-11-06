import type { MediaType, PlayTarget } from '../api/types';

export const typeSlug = (t: MediaType) => (t === 'tv' ? 'serie' : 'filme');
export const slugType = (s: string | null): MediaType | null => (s === 'serie' ? 'tv' : s === 'filme' ? 'movie' : null);

export const titleHref = (type: MediaType, id: number) => `/titulo?tipo=${typeSlug(type)}&id=${id}`;

/** Valor do parâmetro ?assistir= que abre o player sobre qualquer página. */
export function encodePlay(t: PlayTarget): string {
  return t.type === 'movie' ? `filme-${t.tmdbId}` : `serie-${t.tmdbId}-${t.season ?? 1}-${t.episode ?? 1}`;
}

export function decodePlay(v: string | null): PlayTarget | null {
  if (!v) return null;
  const m = v.match(/^(filme|serie)-(\d+)(?:-(\d+)-(\d+))?$/);
  if (!m) return null;
  const type = slugType(m[1])!;
  const tmdbId = Number(m[2]);
  if (type === 'movie') return { type, tmdbId };
  return { type, tmdbId, season: Number(m[3] ?? 1), episode: Math.max(1, Number(m[4] ?? 1)) };
}

export const pad = (n: number) => String(n);
export const epLabel = (s?: number, e?: number) => (s != null && e != null ? `T${s} E${e}` : '');
