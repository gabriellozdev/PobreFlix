import { useSearchParams } from 'react-router-dom';
import { onlyPlayable, tmdb, type MediaType, type Title } from '../api';
import { TitleGrid } from '../components/Grid';
import { EmptyState } from '../components/States';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { usePaged } from '../hooks/usePaged';
import { AnimatedRays } from '../components/ui/animated-rays';

export function Genres() {
  const [params, setParams] = useSearchParams();
  const id = Number(params.get('id'));
  const name = params.get('nome') ?? 'Gênero';
  const type: MediaType = params.get('tipo') === 'serie' ? 'tv' : 'movie';
  useDocumentTitle(name);
  const enabled = tmdb.tmdbEnabled() && id > 0;

  const data = usePaged<Title>(
    async (page) => {
      if (!enabled) return { items: [], hasMore: false };
      const r = await tmdb.discoverByGenre(type, id, page);
      return { items: await onlyPlayable(r.items), hasMore: page < r.totalPages };
    },
    [id, type, enabled],
    (t) => `${t.type}${t.tmdbId}`,
  );

  return (
    <main className="relative isolate min-h-[calc(100vh-var(--header-h))] pt-header">
      <AnimatedRays className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px]" />
      <div className="container-page flex flex-wrap items-end justify-between gap-x-6 gap-y-4 pt-8 pb-6 lg:pt-12 lg:pb-8">
        <div>
          <h1 className="page-title">{name}</h1>
          <p className="meta mt-1.5 max-w-[640px] text-pretty">Mais populares primeiro, só o que dá para assistir aqui.</p>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Tipo">
          {(['filme', 'serie'] as const).map((t) => (
            <button
              key={t}
              className="chip"
              aria-pressed={(type === 'tv' ? 'serie' : 'filme') === t}
              onClick={() => {
                const p = new URLSearchParams(params);
                p.set('tipo', t);
                setParams(p, { replace: true });
              }}
            >
              {t === 'filme' ? 'Filmes' : 'Séries'}
            </button>
          ))}
        </div>
      </div>
      <div className="container-page pb-16">
        {enabled ? (
          <TitleGrid data={data} empty={<EmptyState title="Nada neste gênero" text="Tente o outro tipo (filmes/séries)." />} />
        ) : (
          <EmptyState
            title="Gêneros precisam do TMDB"
            text="As três APIs não informam o gênero de cada título. Adicione uma chave gratuita do TMDB em Ajustes (ícone de engrenagem) para navegar por gênero."
          />
        )}
      </div>
    </main>
  );
}
