// Registro das fontes de reprodução. Para adicionar/remover um provedor,
// basta editar a lista PROVIDERS: cada um informa como montar a URL do embed
// e (opcionalmente) como verificar se tem o título.
import * as pomfy from './providers/pomfy';
import * as sb from './providers/streambetter';
import * as superflix from './providers/superflix';
import type { MediaType, PlayTarget, PlayerSource } from './types';

interface ProviderDef {
  id: string;
  label: string;
  provider: string;
  embed: (type: MediaType, id: number, s?: number, e?: number) => string;
  /** true/false se der pra confirmar, null se o provedor não expõe isso */
  has?: (type: MediaType, id: number) => Promise<boolean | null>;
}

const PROVIDERS: ProviderDef[] = [
  {
    id: 'streambetter',
    label: 'Servidor 1',
    provider: 'StreamBetter',
    embed: sb.embedUrl,
    has: async (type, id) => {
      const ids = await sb.catalogIds();
      return (type === 'movie' ? ids.movie : ids.tv).has(id);
    },
  },
  {
    id: 'pomfy',
    label: 'Servidor 2',
    provider: 'Pomfy',
    embed: pomfy.embedUrl,
    has: async (type, id) => (await pomfy.availableIds(type)).has(id),
  },
  {
    id: 'superflix',
    label: 'Servidor 3',
    provider: 'SuperFlix',
    embed: superflix.embedUrl,
  },
];

async function check(p: ProviderDef, type: MediaType, id: number): Promise<boolean | null> {
  if (!p.has) return null;
  try {
    return await p.has(type, id);
  } catch {
    return null; // lista do provedor indisponível agora: não dá pra afirmar
  }
}

/** Fontes para o alvo, com as confirmadas primeiro e as ausentes por último. */
export async function resolveSources(t: PlayTarget): Promise<PlayerSource[]> {
  const avail = await Promise.all(PROVIDERS.map((p) => check(p, t.type, t.tmdbId)));
  const rank = (a: boolean | null) => (a === true ? 0 : a === null ? 1 : 2);
  return PROVIDERS.map((p, i) => ({
    id: p.id,
    label: p.label,
    provider: p.provider,
    url: p.embed(t.type, t.tmdbId, t.season ?? 1, t.episode ?? 1),
    available: avail[i],
  })).sort((a, b) => rank(a.available) - rank(b.available));
}

/** Rebuild só as URLs (ao trocar de episódio), mantendo a disponibilidade. */
export function withTarget(sources: PlayerSource[], t: PlayTarget): PlayerSource[] {
  return sources.map((s) => {
    const p = PROVIDERS.find((x) => x.id === s.id)!;
    return { ...s, url: p.embed(t.type, t.tmdbId, t.season ?? 1, t.episode ?? 1) };
  });
}

export const PROVIDER_ORIGINS = [sb.SB_ORIGIN, pomfy.POMFY_ORIGIN, superflix.SUPERFLIX_ORIGIN];
