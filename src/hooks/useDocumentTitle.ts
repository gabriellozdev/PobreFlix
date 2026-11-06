import { useEffect } from 'react';

export function useDocumentTitle(t: string) {
  useEffect(() => {
    document.title = t ? `${t} — PobreFlix` : 'PobreFlix — Filmes e séries online';
  }, [t]);
}
