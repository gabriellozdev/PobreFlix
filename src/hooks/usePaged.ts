import { useCallback, useEffect, useRef, useState } from 'react';

export interface Paged<T> {
  items: T[];
  loading: boolean;
  error?: Error;
  done: boolean;
  total?: number;
  loadMore: () => void;
  retry: () => void;
}

interface State<T> {
  key: string;
  page: number;
  items: T[];
  done: boolean;
  total?: number;
}

/** Paginação incremental: fetchPage(n) devolve itens e se há mais páginas. Recomeça quando `deps` mudam. */
export function usePaged<T>(
  fetchPage: (page: number) => Promise<{ items: T[]; hasMore: boolean; total?: number }>,
  deps: unknown[],
  keyOf: (t: T) => string,
): Paged<T> {
  const key = JSON.stringify(deps);
  const [st, setSt] = useState<State<T>>({ key, page: 1, items: [], done: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>();
  const [tick, setTick] = useState(0);
  const fresh = st.key === key ? st : { key, page: 1, items: [] as T[], done: false, total: undefined };
  const page = fresh.page;
  const latest = useRef(fetchPage);
  latest.current = fetchPage;

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(undefined);
    latest
      .current(page)
      .then((r) => {
        if (!alive) return;
        setSt((prev) => {
          const base = prev.key === key ? prev.items : [];
          const seen = new Set(base.map(keyOf));
          return {
            key,
            page,
            items: [...base, ...r.items.filter((x) => !seen.has(keyOf(x)))],
            done: !r.hasMore,
            total: r.total ?? (prev.key === key ? prev.total : undefined),
          };
        });
      })
      .catch((e: Error) => alive && setError(e))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, page, tick]);

  const loadMore = useCallback(() => {
    if (loading || fresh.done || error) return;
    setSt((prev) => (prev.key === key ? { ...prev, page: prev.page + 1 } : prev));
  }, [loading, fresh.done, error, key]);
  const retry = useCallback(() => setTick((t) => t + 1), []);

  return {
    items: fresh.items,
    loading,
    error,
    done: fresh.done,
    total: fresh.total,
    loadMore,
    retry,
  };
}

/** Dispara `onHit` quando o sentinela entra na tela (rolagem infinita). */
export function useSentinel(onHit: () => void, enabled: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    const io = new IntersectionObserver((es) => es.some((e) => e.isIntersecting) && onHit(), {
      rootMargin: '600px 0px',
    });
    io.observe(el);
    return () => io.disconnect();
  }, [onHit, enabled]);
  return ref;
}
