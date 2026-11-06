// StreamBetter — https://streambetter.lat/docs
// Rotas públicas com CORS liberado usadas aqui:
//   GET /api/titles            (type, page, limit, after_id)
//   GET /api/titles?tmdb_id=   (existe? + temporadas cadastradas)
//   GET /api/titles/ids        (todos os tmdb_id por categoria)
//   GET /api/filmes | /api/series | /api/animes | /api/doramas
//   GET /api/recents | /recents/movies | /recents/series | /recents/episodes
//   GET /api/calendario        (kind, page, limit)
//   GET /api/season-episodes   (tmdb_id, season)
// Embeds: /filme/{tmdb_id}  e  /serie/{tmdb_id}/{temporada}/{episodio}

import { getJson, qs } from '../http';
import { tmdbPath } from '../images';
import type { MediaType, Page, RecentEpisode, Release, Season, Title } from '../types';

export const SB_ORIGIN = 'https://streambetter.lat';
const API = `${SB_ORIGIN}/api`;

interface SbTitle {
  id: number | string;
  tmdb_id: number | string;
  title: string;
  type: 'movie' | 'tv';
  poster_path?: string | null;
  overview?: string | null;
  release_year?: number | null;
  content_kind?: string | null;
}
interface SbPagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  nextAfterId?: number;
}
interface SbTitlesResponse {
  success: boolean;
  titles: SbTitle[];
  pagination: SbPagination;
}
interface SbIdsResponse {
  success: boolean;
  updated_at: string;
  counts: Record<'movie' | 'tv' | 'anime' | 'dorama', number>;
  ids: Record<'movie' | 'tv' | 'anime' | 'dorama', number[]>;
}
interface SbLookupResponse {
  success: boolean;
  exists: boolean;
  title?: { id: number; tmdb_id: number; title: string; type: MediaType };
  seasons?: { id: number; season_number: number }[];
}
interface SbRecentEpisodes {
  success: boolean;
  episodes: {
    id: string;
    episode_number: number;
    title: string;
    season_number: number;
    series_title: string;
    series_cover?: string;
    episode_cover?: string;
    series_tmdb_id: number;
  }[];
  pagination: SbPagination;
}
interface SbCalendar {
  success: boolean;
  releases: {
    kind: 'movie' | 'episode';
    tmdb_id: number;
    title_id: number | null;
    release_title: string;
    poster_path?: string;
    air_date: string;
    has_source: boolean;
    season_number?: number;
    episode_number?: number;
    episode_title?: string;
  }[];
  pagination: SbPagination;
}

export interface CatalogIds {
  movie: Set<number>;
  tv: Set<number>;
  anime: Set<number>;
  dorama: Set<number>;
}

function normTitle(t: SbTitle, ids?: CatalogIds): Title {
  const tmdbId = Number(t.tmdb_id);
  return {
    tmdbId,
    type: t.type === 'tv' ? 'tv' : 'movie',
    title: t.title,
    overview: t.overview || undefined,
    year: t.release_year || undefined,
    poster: tmdbPath(t.poster_path),
    isAnime: ids?.anime.has(tmdbId),
    isDorama: ids?.dorama.has(tmdbId),
  };
}

function normPage(r: SbTitlesResponse, ids?: CatalogIds): Page<Title> {
  return {
    items: (r.titles || []).map((t) => normTitle(t, ids)),
    page: r.pagination?.currentPage ?? 1,
    totalPages: r.pagination?.totalPages ?? 1,
    totalItems: r.pagination?.totalItems,
  };
}

let idsPromise: Promise<CatalogIds> | null = null;
/** Lista completa de ids (uma chamada por sessão, ~360 KB). */
export function catalogIds(): Promise<CatalogIds> {
  if (!idsPromise) {
    idsPromise = getJson<SbIdsResponse>(`${API}/titles/ids`, { ttl: 6 * 3600_000, persist: false })
      .then((r) => ({
        movie: new Set(r.ids.movie),
        tv: new Set(r.ids.tv),
        anime: new Set(r.ids.anime),
        dorama: new Set(r.ids.dorama),
      }))
      .catch((e) => {
        idsPromise = null;
        throw e;
      });
  }
  return idsPromise;
}

async function safeIds(): Promise<CatalogIds | undefined> {
  try {
    return await catalogIds();
  } catch {
    return undefined;
  }
}

export type SbCategory = 'filmes' | 'series' | 'animes' | 'doramas';

export async function listCategory(cat: SbCategory, page = 1, limit = 24): Promise<Page<Title>> {
  const [r, ids] = await Promise.all([getJson<SbTitlesResponse>(`${API}/${cat}${qs({ page, limit })}`), safeIds()]);
  return normPage(r, ids);
}

export type RecentKind = 'all' | 'movies' | 'series';
export async function listRecents(kind: RecentKind = 'all', page = 1, limit = 24): Promise<Page<Title>> {
  const path = kind === 'all' ? 'recents' : `recents/${kind}`;
  const [r, ids] = await Promise.all([getJson<SbTitlesResponse>(`${API}/${path}${qs({ page, limit })}`), safeIds()]);
  return normPage(r, ids);
}

export async function listRecentEpisodes(page = 1, limit = 24): Promise<Page<RecentEpisode>> {
  const r = await getJson<SbRecentEpisodes>(`${API}/recents/episodes${qs({ page, limit })}`);
  return {
    items: (r.episodes || []).map((e) => ({
      key: e.id,
      seriesId: Number(e.series_tmdb_id),
      seriesTitle: e.series_title,
      season: e.season_number,
      episode: e.episode_number,
      name: e.title,
      image: tmdbPath(e.episode_cover) ?? undefined,
      poster: tmdbPath(e.series_cover),
    })),
    page: r.pagination?.currentPage ?? page,
    totalPages: r.pagination?.totalPages ?? 1,
    totalItems: r.pagination?.totalItems,
  };
}

export async function listCalendar(kind?: 'movie' | 'episode', page = 1, limit = 100): Promise<Page<Release>> {
  const r = await getJson<SbCalendar>(`${API}/calendario${qs({ kind, page, limit })}`, { ttl: 30 * 60_000 });
  return {
    items: (r.releases || []).map((x) => ({
      key: `${x.kind}-${x.tmdb_id}-${x.season_number ?? ''}-${x.episode_number ?? ''}`,
      kind: x.kind,
      tmdbId: x.tmdb_id,
      title: x.release_title,
      poster: tmdbPath(x.poster_path),
      airDate: x.air_date,
      hasSource: !!x.has_source,
      season: x.season_number,
      episode: x.episode_number,
      episodeTitle: x.episode_title,
    })),
    page: r.pagination?.currentPage ?? page,
    totalPages: r.pagination?.totalPages ?? 1,
    totalItems: r.pagination?.totalItems,
  };
}

export interface SbLookup {
  exists: boolean;
  title?: string;
  type?: MediaType;
  seasons: Season[];
}

export async function lookup(tmdbId: number): Promise<SbLookup> {
  const r = await getJson<SbLookupResponse>(`${API}/titles${qs({ tmdb_id: tmdbId })}`, { ttl: 30 * 60_000 });
  return {
    exists: !!r.exists,
    title: r.title?.title,
    type: r.title?.type,
    seasons: (r.seasons || [])
      .map((s) => ({ number: s.season_number }))
      .sort((a, b) => a.number - b.number),
  };
}

/** Episódios extras (especiais/bônus) que o TMDB não lista. */
export async function seasonExtras(tmdbId: number, season: number): Promise<{ number: number; title: string }[]> {
  const r = await getJson<{ success: boolean; episodes: { number: number; title: string }[] }>(
    `${API}/season-episodes${qs({ tmdb_id: tmdbId, season })}`,
    { ttl: 10 * 60_000 },
  );
  return r.episodes || [];
}

export function embedUrl(type: MediaType, tmdbId: number, season = 1, episode = 1): string {
  return type === 'movie'
    ? `${SB_ORIGIN}/filme/${tmdbId}`
    : `${SB_ORIGIN}/serie/${tmdbId}/${season}/${episode}`;
}

/** Mensagem de progresso enviada pelo player do StreamBetter via postMessage. */
export interface SbProgress {
  type: 'streambetter:progress';
  currentTime: number;
  duration: number;
  state: 'playing' | 'paused' | 'ended';
  tmdbId: number;
  season: number | null;
  episode: number | null;
}

export function isSbProgress(ev: MessageEvent): ev is MessageEvent<SbProgress> {
  return ev.origin === SB_ORIGIN && ev.data?.type === 'streambetter:progress';
}
