import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { PlayTarget } from '../api/types';
import { decodePlay, encodePlay } from '../lib/routes';

/** Abre/fecha o modal de reprodução via ?assistir=, para o "voltar" do navegador fechar o modal. */
export function usePlayer() {
  const nav = useNavigate();
  const loc = useLocation();
  const params = new URLSearchParams(loc.search);
  const current = decodePlay(params.get('assistir'));

  const open = useCallback(
    (t: PlayTarget) => {
      const p = new URLSearchParams(loc.search);
      const wasOpen = p.has('assistir');
      p.set('assistir', encodePlay(t));
      // trocar de episódio dentro do player não empilha histórico
      nav(
        { pathname: loc.pathname, search: `?${p}` },
        { replace: wasOpen, state: { pfPlayer: wasOpen ? (loc.state as { pfPlayer?: boolean })?.pfPlayer : true } },
      );
    },
    [loc.pathname, loc.search, loc.state, nav],
  );

  const close = useCallback(() => {
    if ((loc.state as { pfPlayer?: boolean } | null)?.pfPlayer) {
      nav(-1);
      return;
    }
    const p = new URLSearchParams(loc.search);
    p.delete('assistir');
    const s = p.toString();
    nav({ pathname: loc.pathname, search: s ? `?${s}` : '' }, { replace: true });
  }, [loc.pathname, loc.search, loc.state, nav]);

  return { current, open, close };
}
