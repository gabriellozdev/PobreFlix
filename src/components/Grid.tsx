import type { Title } from '../api/types';
import type { Paged } from '../hooks/usePaged';
import { useSentinel } from '../hooks/usePaged';
import { ErrorState } from './States';
import { CardSkeleton, TitleCard } from './TitleCard';
import { repeat } from './Row';

/** Grade de pôsteres com rolagem infinita, skeletons e estados de erro. */
export function TitleGrid({ data, empty }: { data: Paged<Title>; empty: React.ReactNode }) {
  const sentinel = useSentinel(data.loadMore, !data.done && !data.loading && !data.error);
  const first = data.loading && !data.items.length;
  if (!first && !data.items.length && !data.error) return <>{empty}</>;
  return (
    <>
      <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-8 md:grid-cols-4 lg:grid-cols-5 lg:gap-x-5 lg:gap-y-9 2xl:grid-cols-6">
        {data.items.map((t) => (
          <TitleCard key={`${t.type}${t.tmdbId}`} t={t} />
        ))}
        {data.loading && repeat(first ? 18 : 6, (i) => <CardSkeleton key={`s${i}`} />)}
      </div>
      {data.error && <ErrorState error={data.error} onRetry={data.retry} compact={data.items.length > 0} />}
      {!data.done && !data.error && (
        <div ref={sentinel} className="flex min-h-10 justify-center py-8">
          {!data.loading && (
            <button className="btn btn-outline" onClick={data.loadMore}>
              Carregar mais
            </button>
          )}
        </div>
      )}
    </>
  );
}
