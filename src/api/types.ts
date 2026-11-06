// Estrutura única usada pelo frontend, independente do provedor de origem.

export type MediaType = 'movie' | 'tv';

export interface Title {
  /** id do TMDB (todas as APIs usadas trabalham com ele) */
  tmdbId: number;
  type: MediaType;
  title: string;
  overview?: string;
  year?: number;
  /** caminho do TMDB, ex.: "/abc.jpg" (renderizado com tamanhos diferentes) */
  poster?: string;
  backdrop?: string;
  rating?: number;
  voteCount?: number;
  genres?: string[];
  isAnime?: boolean;
  isDorama?: boolean;
  /** só presente quando vier do TMDB */
  runtime?: number;
  seasonsCount?: number;
  certification?: string;
}

export interface Season {
  number: number;
  name?: string;
  episodeCount?: number;
  poster?: string;
  airYear?: number;
}

export interface Episode {
  season: number;
  number: number;
  name?: string;
  overview?: string;
  still?: string;
  runtime?: number;
  airDate?: string;
}

export interface RecentEpisode {
  key: string;
  seriesId: number;
  seriesTitle: string;
  season: number;
  episode: number;
  name: string;
  image?: string;
  poster?: string;
}

export interface Release {
  key: string;
  kind: 'movie' | 'episode';
  tmdbId: number;
  title: string;
  poster?: string;
  airDate: string;
  hasSource: boolean;
  season?: number;
  episode?: number;
  episodeTitle?: string;
}

export interface Page<T> {
  items: T[];
  page: number;
  totalPages: number;
  totalItems?: number;
}

export interface Genre {
  id: number;
  name: string;
}

/** Uma fonte de reprodução incorporada (iframe). */
export interface PlayerSource {
  id: string;
  label: string;
  provider: string;
  url: string;
  /** true = confirmada no catálogo do provedor; false = ausente; null = não dá pra verificar */
  available: boolean | null;
}

export interface PlayTarget {
  type: MediaType;
  tmdbId: number;
  season?: number;
  episode?: number;
}
