// Imagens do CDN público do TMDB (não precisa de chave). Os provedores
// devolvem caminhos ou URLs completas; normalizamos para o caminho "/x.jpg".

const CDN = 'https://image.tmdb.org/t/p';

export function tmdbPath(p?: string | null): string | undefined {
  if (!p) return undefined;
  const m = String(p).match(/\/([A-Za-z0-9_-]+\.(?:jpg|jpeg|png|webp))$/i);
  return m ? `/${m[1]}` : undefined;
}

export type PosterSize = 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780';
export type BackdropSize = 'w300' | 'w780' | 'w1280' | 'original';

export function img(path: string | undefined, size: PosterSize | BackdropSize): string | undefined {
  return path ? `${CDN}/${size}${path}` : undefined;
}

export function posterSrcSet(path?: string): string | undefined {
  if (!path) return undefined;
  return `${CDN}/w185${path} 185w, ${CDN}/w342${path} 342w, ${CDN}/w500${path} 500w`;
}

export function backdropSrcSet(path?: string): string | undefined {
  if (!path) return undefined;
  return `${CDN}/w780${path} 780w, ${CDN}/w1280${path} 1280w`;
}
