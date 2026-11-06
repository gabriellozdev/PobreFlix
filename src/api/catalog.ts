// Retrato local do catálogo do StreamBetter (gerado por scripts/sync-catalog.mjs
// a partir de /api/titles). Usado para busca e para completar detalhes de um
// título aberto por link direto. Carregado sob demanda, uma vez por sessão.
import type { MediaType, Title } from './types';

type Row = [number, 'm' | 't', string, number, string, number];
interface Snapshot {
  updated_at: string;
  shards: number;
  items: Row[];
}

interface Indexed {
  title: Title;
  norm: string;
}

let snap: Promise<{ list: Indexed[]; byKey: Map<string, Indexed>; shards: number; updated: string }> | null = null;

export function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function toTitle(r: Row): Title {
  return {
    tmdbId: r[0],
    type: r[1] === 't' ? 'tv' : 'movie',
    title: r[2],
    year: r[3] || undefined,
    poster: r[4] ? `/${r[4]}.jpg` : undefined,
    isAnime: (r[5] & 1) === 1,
    isDorama: (r[5] & 2) === 2,
  };
}

export const key = (type: MediaType, id: number) => `${type === 'tv' ? 't' : 'm'}${id}`;

function load() {
  if (!snap) {
    snap = fetch('/data/catalog.json')
      .then((r) => {
        if (!r.ok) throw new Error('Índice do catálogo indisponível');
        return r.json() as Promise<Snapshot>;
      })
      .then((s) => {
        const list = s.items.map((r) => ({ title: toTitle(r), norm: normalize(r[2]) }));
        const byKey = new Map(list.map((x) => [key(x.title.type, x.title.tmdbId), x]));
        return { list, byKey, shards: s.shards, updated: s.updated_at };
      })
      .catch((e) => {
        snap = null;
        throw e;
      });
  }
  return snap;
}

export interface SearchFilters {
  type?: MediaType | 'all';
  category?: 'anime' | 'dorama';
}

export async function search(query: string, filters: SearchFilters = {}, limit = 60): Promise<Title[]> {
  const q = normalize(query);
  if (!q) return [];
  const { list } = await load();
  const words = q.split(' ');
  const scored: { t: Title; s: number }[] = [];
  for (const x of list) {
    const t = x.title;
    if (filters.type && filters.type !== 'all' && t.type !== filters.type) continue;
    if (filters.category === 'anime' && !t.isAnime) continue;
    if (filters.category === 'dorama' && !t.isDorama) continue;
    if (!words.every((w) => x.norm.includes(w))) continue;
    let s = 0;
    if (x.norm === q) s += 100;
    else if (x.norm.startsWith(q)) s += 60;
    else if (new RegExp(`(^| )${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(x.norm)) s += 35;
    s -= x.norm.length / 10;
    if (t.poster) s += 5;
    if (t.year) s += Math.max(0, (t.year - 1980) / 20);
    scored.push({ t, s });
  }
  scored.sort((a, b) => b.s - a.s);
  return scored.slice(0, limit).map((x) => x.t);
}

export async function get(type: MediaType, id: number): Promise<Title | undefined> {
  const { byKey } = await load();
  return byKey.get(key(type, id))?.title;
}

const overviewShards = new Map<number, Promise<Record<string, string>>>();
export async function overview(type: MediaType, id: number): Promise<string | undefined> {
  const { shards } = await load();
  const n = id % shards;
  if (!overviewShards.has(n)) {
    overviewShards.set(
      n,
      fetch(`/data/overview/${n}.json`)
        .then((r) => (r.ok ? r.json() : {}))
        .catch(() => ({})),
    );
  }
  return (await overviewShards.get(n)!)[key(type, id)];
}

/**
 * Títulos parecidos sem TMDB: mesma categoria (anime/dorama/filme/série),
 * ano próximo e palavras do título em comum.
 */
export async function similar(t: Title, limit = 18): Promise<Title[]> {
  const { list } = await load();
  const words = normalize(t.title)
    .split(' ')
    .filter((w) => w.length > 3);
  const out: { t: Title; s: number }[] = [];
  for (const x of list) {
    const o = x.title;
    if (o.tmdbId === t.tmdbId && o.type === t.type) continue;
    if (!o.poster) continue;
    const sameCat = t.isAnime ? o.isAnime : t.isDorama ? o.isDorama : o.type === t.type && !o.isAnime && !o.isDorama;
    if (!sameCat) continue;
    let s = 0;
    for (const w of words) if (x.norm.includes(w)) s += 20;
    if (t.year && o.year) s += Math.max(0, 10 - Math.abs(t.year - o.year));
    else continue;
    if (s > 4) out.push({ t: o, s: s + (o.tmdbId % 7) / 10 });
  }
  out.sort((a, b) => b.s - a.s);
  return out.slice(0, limit).map((x) => x.t);
}

/** Lista alfabética para as páginas de navegação. */
export type BrowseCategory = 'filmes' | 'series' | 'animes' | 'doramas';
const CATEGORY_FILTER: Record<BrowseCategory, (t: Title) => boolean> = {
  filmes: (t) => t.type === 'movie',
  series: (t) => t.type === 'tv',
  animes: (t) => !!t.isAnime,
  doramas: (t) => !!t.isDorama,
};
const sortedCache = new Map<BrowseCategory, Title[]>();

export async function alphabetical(cat: BrowseCategory, offset: number, limit: number) {
  const { list } = await load();
  let all = sortedCache.get(cat);
  if (!all) {
    all = list
      .filter((x) => CATEGORY_FILTER[cat](x.title) && x.title.poster && /[a-z0-9]/.test(x.norm[0] || ''))
      .sort((a, b) => a.norm.localeCompare(b.norm))
      .map((x) => x.title);
    sortedCache.set(cat, all);
  }
  return { items: all.slice(offset, offset + limit), total: all.length };
}
