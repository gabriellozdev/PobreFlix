// Gera um retrato do catálogo público do StreamBetter para a busca e para a
// página de detalhes (o StreamBetter não oferece busca com CORS liberado).
// Uso: npm run sync   (leva ~5 min: o limite público é 120 req/min por IP)
//
// Saída em public/data/:
//   catalog.json           -> { updated_at, items: [[tmdb, "m"|"t", título, ano, pôster, flags]] }
//                              flags: 1 = anime, 2 = dorama
//   overview/<n>.json      -> { "m550": "sinopse...", "t1396": "..." } (n = tmdb % SHARDS)
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = 'https://streambetter.lat';
const SHARDS = 64;
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'data');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJson(url, tries = 5) {
  for (let i = 0; i < tries; i++) {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (res.status === 429) {
      const wait = Number(res.headers.get('retry-after') || 30) * 1000;
      console.warn(`429, aguardando ${wait / 1000}s`);
      await sleep(wait);
      continue;
    }
    if (!res.ok) {
      console.warn(`HTTP ${res.status} em ${url}`);
      await sleep(3000);
      continue;
    }
    return res.json();
  }
  throw new Error(`Falhou: ${url}`);
}

function posterKey(p) {
  if (!p) return '';
  const m = String(p).match(/\/([A-Za-z0-9_-]+)\.(jpg|png|webp)$/);
  return m ? m[1] : '';
}

const ids = await getJson(`${BASE}/api/titles/ids`);
const anime = new Set(ids.ids.anime);
const dorama = new Set(ids.ids.dorama);

const items = [];
const shards = Array.from({ length: SHARDS }, () => ({}));
const seen = new Set();
let after = null;
let page = 0;
for (;;) {
  const url = `${BASE}/api/titles?limit=100${after ? `&after_id=${after}` : ''}`;
  const data = await getJson(url);
  page++;
  for (const t of data.titles || []) {
    const tmdb = Number(t.tmdb_id);
    const kind = t.type === 'tv' ? 't' : 'm';
    if (!tmdb || seen.has(kind + tmdb)) continue;
    seen.add(kind + tmdb);
    const flags = (anime.has(tmdb) ? 1 : 0) | (dorama.has(tmdb) ? 2 : 0);
    items.push([tmdb, kind, t.title || '', t.release_year || 0, posterKey(t.poster_path), flags]);
    if (t.overview) shards[tmdb % SHARDS][kind + tmdb] = t.overview;
  }
  if (page % 20 === 0) console.log(`página ${page}, ${items.length} títulos`);
  after = data.pagination?.nextAfterId;
  if (!after || !(data.titles || []).length) break;
  await sleep(520);
}

await mkdir(join(OUT, 'overview'), { recursive: true });
await writeFile(
  join(OUT, 'catalog.json'),
  JSON.stringify({ updated_at: ids.updated_at, shards: SHARDS, items })
);
for (let i = 0; i < SHARDS; i++) {
  await writeFile(join(OUT, 'overview', `${i}.json`), JSON.stringify(shards[i]));
}
console.log(`ok: ${items.length} títulos em ${page} páginas`);
