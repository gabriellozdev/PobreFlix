// Pomfy — https://api.pomfy.stream/
// Documentado:
//   Embed filme: /filme/{tmdb_id}
//   Embed série: /serie/{tmdb_id}/{temp}/{ep}
//   Listagem:    /lista?tipo=filmes|series  (JSON com todos os tmdb_id; CORS liberado)
//   Hashes:      #eplist (menu de temporadas/episódios, só série) e #cor:HEX
import { getJson, qs } from '../http';
import type { MediaType } from '../types';

export const POMFY_ORIGIN = 'https://api.pomfy.stream';
const ACCENT = '6F74FC';

const lists: Partial<Record<MediaType, Promise<Set<number>>>> = {};

/** Conjunto de tmdb_id disponíveis no Pomfy (uma chamada por tipo e sessão). */
export function availableIds(type: MediaType): Promise<Set<number>> {
  if (!lists[type]) {
    const tipo = type === 'movie' ? 'filmes' : 'series';
    lists[type] = getJson<string[]>(`${POMFY_ORIGIN}/lista${qs({ tipo })}`, { ttl: 6 * 3600_000, persist: false })
      .then((ids) => new Set(ids.map(Number)))
      .catch((e) => {
        delete lists[type];
        throw e;
      });
  }
  return lists[type]!;
}

export function embedUrl(type: MediaType, tmdbId: number, season = 1, episode = 1): string {
  return type === 'movie'
    ? `${POMFY_ORIGIN}/filme/${tmdbId}#cor:${ACCENT}`
    : `${POMFY_ORIGIN}/serie/${tmdbId}/${season}/${episode}#eplist#cor:${ACCENT}`;
}
