import { Link } from 'react-router-dom';
import { EmptyState } from '../components/States';
import { TitleCard } from '../components/TitleCard';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useMyList } from '../store/library';
import { AnimatedRays } from '../components/ui/animated-rays';

const TITLE_GRID =
  'grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-8 md:grid-cols-4 lg:grid-cols-5 lg:gap-x-5 lg:gap-y-9 2xl:grid-cols-6';

export function MyList() {
  useDocumentTitle('Minha lista');
  const list = useMyList();
  return (
    <main className="relative isolate min-h-[calc(100vh-var(--header-h))] pt-header">
      <AnimatedRays className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px]" />
      <div className="container-page flex flex-wrap items-end justify-between gap-x-6 gap-y-4 pt-8 pb-6 lg:pt-12 lg:pb-8">
        <div>
          <h1 className="page-title">Minha lista</h1>
          <p className="meta mt-1.5 max-w-[640px] text-pretty">Guardada só neste navegador — sem conta.</p>
        </div>
      </div>
      <div className="container-page pb-16">
        {list.length ? (
          <div className={TITLE_GRID}>
            {list.map((t) => (
              <TitleCard key={`${t.type}${t.tmdbId}`} t={t} />
            ))}
          </div>
        ) : (
          <EmptyState
            art="list"
            title="Sua lista está vazia"
            text="Toque no marcador de qualquer título para guardá-lo aqui e assistir depois."
            action={
              <Link to="/novidades" className="btn btn-primary">
                Ver novidades
              </Link>
            }
          />
        )}
      </div>
    </main>
  );
}
