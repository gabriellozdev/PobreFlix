// TMDB (opcional) — https://developer.themoviedb.org/reference
// Só é usado quando há uma chave (v3 "api_key" ou token de leitura v4)
// configurada em Ajustes ou em VITE_TMDB_KEY. Enriquece com imagens de fundo,
// notas, gêneros, lista de episódios, recomendações e listas de populares.
import { getJson, qs } from '../http';
import { tmdbPath } from '../images';
import type { Episode, Genre, MediaType, Page, Season, Title } from '../types';

const API = 'https://api.themoviedb.org/3';
const KEY_STORE = 'pf:tmdbKey';
const LANG = 'pt-BR';

export function getTmdbKey(): string {
  try {
    const k = localStorage.getItem(KEY_STORE);
    if (k) return k;
  } catch {
    /* sem storage */
  }
  return (import.meta.env.VITE_TMDB_KEY as string | undefined) || '';
}

export function setTmdbKey(key: string) {
  try {
    if (key) localStorage.setItem(KEY_STORE, key.trim());
    else localStorage.removeItem(KEY_STORE);
  } catch {
    /* sem storage */
  }
}

export const tmdbEnabled = () => !!getTmdbKey();

function call<T>(path: string, params: Record<string, string | number | undefined> = {}, ttl = 60 * 60_000) {
  const key = getTmdbKey();
  if (!key) return Promise.reject(new Error('TMDB desativado'));
  const bearer = key.startsWith('eyJ');
  const url = `${API}${path}${qs({ language: LANG, ...params, ...(bearer ? {} : { api_key: key }) })}`;
  return getJson<T>(url, { ttl, headers: bearer ? { Authorization: `Bearer ${key}` } : undefined });
}

/** Testa a chave (usado na tela de Ajustes). */
export async function verifyKey(key: string): Promise<boolean> {
  const bearer = key.startsWith('eyJ');
  const res = await fetch(`${API}/configuration${bearer ? '' : `?api_key=${encodeURIComponent(key)}`}`, {
    headers: bearer ? { Authorization: `Bearer ${key}` } : {},
  });
  return res.ok;
}

interface TItem {
  id: number;
  media_type?: string;
  title?: string;
  name?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
  vote_count?: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
}
interface TList {
  page: number;
  total_pages: number;
  total_results: number;
  results: TItem[];
}

const year = (d?: string) => (d ? Number(d.slice(0, 4)) || undefined : undefined);

function normItem(x: TItem, fallback: MediaType): Title | null {
  const type: MediaType = x.media_type === 'tv' ? 'tv' : x.media_type === 'movie' ? 'movie' : fallback;
  if (x.media_type && x.media_type !== 'tv' && x.media_type !== 'movie') return null;
  return {
    tmdbId: x.id,
    type,
    title: x.title || x.name || '',
    overview: x.overview || undefined,
    year: year(x.release_date || x.first_air_date),
    poster: tmdbPath(x.poster_path),
    backdrop: tmdbPath(x.backdrop_path),
    rating: x.vote_count ? x.vote_average : undefined,
    voteCount: x.vote_count,
  };
}

function normList(r: TList, fallback: MediaType): Page<Title> {
  return {
    items: r.results.map((x) => normItem(x, fallback)).filter((x): x is Title => !!x),
    page: r.page,
    totalPages: Math.min(r.total_pages, 500),
    totalItems: r.total_results,
  };
}

export const trending = (page = 1) => call<TList>('/trending/all/day', { page }).then((r) => normList(r, 'movie'));
export const popular = (type: MediaType, page = 1) =>
  call<TList>(`/${type}/popular`, { page }).then((r) => normList(r, type));
export const discoverByGenre = (type: MediaType, genre: number, page = 1) =>
  call<TList>(`/discover/${type}`, { with_genres: genre, sort_by: 'popularity.desc', page }).then((r) =>
    normList(r, type),
  );

export const genres = (type: MediaType) =>
  call<{ genres: Genre[] }>(`/genre/${type}/list`, {}, 24 * 3600_000).then((r) => r.genres);

interface TDetails extends TItem {
  genres?: Genre[];
  runtime?: number;
  episode_run_time?: number[];
  number_of_seasons?: number;
  seasons?: { season_number: number; name: string; episode_count: number; poster_path?: string; air_date?: string }[];
  release_dates?: { results: { iso_3166_1: string; release_dates: { certification: string }[] }[] };
  content_ratings?: { results: { iso_3166_1: string; rating: string }[] };
  recommendations?: TList;
}

export interface TmdbDetails {
  title: Title;
  seasons: Season[];
  recommendations: Title[];
}

export async function details(type: MediaType, id: number): Promise<TmdbDetails> {
  const append = type === 'movie' ? 'release_dates,recommendations' : 'content_ratings,recommendations';
  const d = await call<TDetails>(`/${type}/${id}`, { append_to_response: append });
  const base = normItem(d, type)!;
  let cert: string | undefined;
  if (type === 'movie') {
    const br = d.release_dates?.results.find((r) => r.iso_3166_1 === 'BR');
    cert = br?.release_dates.find((x) => x.certification)?.certification;
  } else {
    cert = d.content_ratings?.results.find((r) => r.iso_3166_1 === 'BR')?.rating;
  }
  return {
    title: {
      ...base,
      genres: d.genres?.map((g) => g.name),
      runtime: d.runtime || d.episode_run_time?.[0],
      seasonsCount: d.number_of_seasons,
      certification: cert || undefined,
    },
    seasons: (d.seasons || []).map((s) => ({
      number: s.season_number,
      name: s.name,
      episodeCount: s.episode_count,
      poster: tmdbPath(s.poster_path),
      airYear: year(s.air_date),
    })),
    recommendations: d.recommendations ? normList(d.recommendations, type).items : [],
  };
}

export async function seasonEpisodes(id: number, season: number): Promise<Episode[]> {
  const r = await call<{
    episodes: {
      season_number: number;
      episode_number: number;
      name: string;
      overview: string;
      still_path?: string;
      runtime?: number;
      air_date?: string;
    }[];
  }>(`/tv/${id}/season/${season}`);
  return r.episodes.map((e) => ({
    season: e.season_number,
    number: e.episode_number,
    name: e.name,
    overview: e.overview || undefined,
    still: tmdbPath(e.still_path),
    runtime: e.runtime,
    airDate: e.air_date,
  }));
}
