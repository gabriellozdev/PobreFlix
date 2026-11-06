import { useSearchParams } from 'react-router-dom';
import { catalog, sb, type Title } from '../api';
import type { BrowseCategory } from '../api/catalog';
import { TitleGrid } from '../components/Grid';
import { EmptyState } from '../components/States';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { usePaged } from '../hooks/usePaged';
import { AnimatedRays } from '../components/ui/animated-rays';

const INFO: Record<BrowseCategory, { title: string; sub: string }> = {
  filmes: { title: 'Filmes', sub: 'Todos os filmes do catálogo, incluindo animes e doramas em formato de filme.' },
  series: { title: 'Séries', sub: 'Séries, animes e doramas com temporadas e episódios.' },
  animes: { title: 'Animes', sub: 'Séries e filmes de anime.' },
  doramas: { title: 'Doramas', sub: 'Produções asiáticas em formato de série ou filme.' },
};

const PER = 36;
const keyOf = (t: Title) => `${t.type}${t.tmdbId}`;

export function Browse({ cat }: { cat: BrowseCategory }) {
  const [params, setParams] = useSearchParams();
  const sort = params.get('ordem') === 'az' ? 'az' : 'recentes';
  const info = INFO[cat];
  useDocumentTitle(info.title);

  const data = usePaged<Title>(
    async (page) => {
      if (sort === 'az') {
        const r = await catalog.alphabetical(cat, (page - 1) * PER, PER);
        return { items: r.items, hasMore: page * PER < r.total, total: r.total };
      }
      const r = await sb.listCategory(cat, page, PER);
      return { items: r.items, hasMore: page < r.totalPages, total: r.totalItems };
    },
    [cat, sort],
    keyOf,
  );

  const setSort = (s: string) => {
    const p = new URLSearchParams(params);
    if (s === 'recentes') p.delete('ordem');
    else p.set('ordem', s);
    setParams(p, { replace: true });
  };

  return (
    <main className="relative isolate min-h-[calc(100vh-var(--header-h))] pt-header">
      <AnimatedRays className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px]" />
      <div className="container-page flex flex-wrap items-end justify-between gap-x-6 gap-y-4 pt-8 pb-6 lg:pt-12 lg:pb-8">
        <div>
          <h1 className="page-title">{info.title}</h1>
          <p className="meta mt-1.5 max-w-[640px] text-pretty">
            {info.sub}
            {data.total ? ` ${data.total.toLocaleString('pt-BR')} títulos.` : ''}
          </p>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Ordenar">
          <button className="chip" aria-pressed={sort === 'recentes'} onClick={() => setSort('recentes')}>
            Mais recentes
          </button>
          <button className="chip" aria-pressed={sort === 'az'} onClick={() => setSort('az')}>
            A–Z
          </button>
        </div>
      </div>
      <div className="container-page pb-16">
        <TitleGrid data={data} empty={<EmptyState title="Nada por aqui ainda" text="O catálogo desta categoria está vazio no momento." />} />
      </div>
    </main>
  );
}
