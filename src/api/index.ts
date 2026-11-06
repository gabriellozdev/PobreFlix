// Fachada usada pelos componentes: combina os provedores e devolve sempre a
// estrutura normalizada de ./types. Componentes não chamam fetch direto.
import * as catalog from './catalog';
import * as sb from './providers/streambetter';
import * as tmdb from './providers/tmdb';
import type { Episode, MediaType, Season, Title } from './types';

export { catalog, sb, tmdb };
export * from './types';

export class NotFoundError extends Error {}

export interface TitleDetails {
  title: Title;
  seasons: Season[];
  /** de onde vieram as temporadas */
  seasonsFrom: 'tmdb' | 'streambetter' | 'none';
  inCatalog: boolean;
}

const settle = <T,>(p: Promise<T>) => p.then((v) => v).catch(() => undefined);

export async function getTitleDetails(type: MediaType, id: number): Promise<TitleDetails> {
  const [look, snap, ov, rich] = await Promise.all([
    settle(sb.lookup(id)),
    settle(catalog.get(type, id)),
    settle(catalog.overview(type, id)),
    tmdb.tmdbEnabled() ? settle(tmdb.details(type, id)) : Promise.resolve(undefined),
  ]);
  const lookMatches = !!look?.exists && look.type === type;
  if (!rich && !snap && !lookMatches) throw new NotFoundError('Título não encontrado no catálogo.');

  const base: Title = rich?.title ?? snap ?? { tmdbId: id, type, title: look?.title || '' };
  const title: Title = {
    ...snap,
    ...base,
    overview: base.overview || ov || snap?.overview,
    poster: base.poster || snap?.poster,
    isAnime: snap?.isAnime,
    isDorama: snap?.isDorama,
  };

  let seasons: Season[] = [];
  let seasonsFrom: TitleDetails['seasonsFrom'] = 'none';
  if (type === 'tv') {
    const sbSeasons = lookMatches ? look!.seasons : [];
    if (rich?.seasons.length) {
      const sbSet = new Set(sbSeasons.map((s) => s.number));
      // temporada 0 (especiais) só quando o provedor tem fonte para ela
      seasons = rich.seasons.filter((s) => s.number > 0 || sbSet.has(0));
      seasonsFrom = 'tmdb';
    } else if (sbSeasons.length) {
      seasons = sbSeasons;
      seasonsFrom = 'streambetter';
    }
  }
  return { title, seasons, seasonsFrom, inCatalog: !!snap || lookMatches };
}

export interface SeasonEpisodes {
  episodes: Episode[];
  /** true quando a lista completa veio do TMDB */
  complete: boolean;
}

export async function getSeasonEpisodes(id: number, season: number): Promise<SeasonEpisodes> {
  const extras = (await settle(sb.seasonExtras(id, season))) ?? [];
  const extraEps: Episode[] = extras.map((e) => ({ season, number: e.number, name: e.title }));
  if (tmdb.tmdbEnabled()) {
    const list = await settle(tmdb.seasonEpisodes(id, season));
    if (list) {
      const byNum = new Map(list.map((e) => [e.number, e]));
      for (const e of extraEps) if (!byNum.has(e.number)) byNum.set(e.number, e);
      return { episodes: [...byNum.values()].sort((a, b) => a.number - b.number), complete: true };
    }
  }
  return { episodes: extraEps, complete: false };
}

export async function getRecommendations(t: Title): Promise<Title[]> {
  if (tmdb.tmdbEnabled()) {
    const [rich, ids] = await Promise.all([settle(tmdb.details(t.type, t.tmdbId)), settle(sb.catalogIds())]);
    if (rich?.recommendations.length) {
      // mostra só o que dá pra assistir aqui
      const ok = ids ? rich.recommendations.filter((r) => (r.type === 'tv' ? ids.tv : ids.movie).has(r.tmdbId)) : [];
      if (ok.length >= 4) return ok;
    }
  }
  return catalog.similar(t);
}

/** Filtra listas do TMDB para o que existe no catálogo reproduzível. */
export async function onlyPlayable(items: Title[]): Promise<Title[]> {
  const ids = await settle(sb.catalogIds());
  if (!ids) return items;
  return items.filter((r) => (r.type === 'tv' ? ids.tv : ids.movie).has(r.tmdbId));
}
