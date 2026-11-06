// SuperFlixAPI — https://superflixapi.boats/doc
// Documentado:
//   Embed filme: /filme/{imdb (tt...) ou tmdb}
//   Embed série/anime/dorama: /serie/{tmdb}/{temporada}/{episodio}
//   Hashes: #noEpList, #color:hex, #noLink, #transparent
// O endpoint /lista não envia cabeçalhos CORS e fica atrás de verificação do
// Cloudflare, então não é chamado pelo navegador: aqui o SuperFlix entra
// apenas como fonte de reprodução (sem como confirmar disponibilidade antes).
import type { MediaType } from '../types';

export const SUPERFLIX_ORIGIN = 'https://superflixapi.boats';

export function embedUrl(type: MediaType, tmdbId: number, season = 1, episode = 1): string {
  const hash = '#color:6F74FC#noLink';
  return type === 'movie'
    ? `${SUPERFLIX_ORIGIN}/filme/${tmdbId}${hash}`
    : `${SUPERFLIX_ORIGIN}/serie/${tmdbId}/${season}/${episode}${hash}`;
}
