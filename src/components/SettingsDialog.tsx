import { useEffect, useRef, useState } from 'react';
import { tmdb } from '../api';
import { CloseIcon } from './Icons';

/** Ajustes locais: chave opcional do TMDB para enriquecer detalhes. */
export function SettingsDialog({ onClose }: { onClose: () => void }) {
  const [key, setKey] = useState(tmdb.getTmdbKey());
  const [status, setStatus] = useState<'idle' | 'checking' | 'ok' | 'bad'>('idle');
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    d?.showModal();
    return () => d?.close();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const k = key.trim();
    if (!k) {
      tmdb.setTmdbKey('');
      location.reload();
      return;
    }
    setStatus('checking');
    try {
      const ok = await tmdb.verifyKey(k);
      if (!ok) {
        setStatus('bad');
        return;
      }
      tmdb.setTmdbKey(k);
      setStatus('ok');
      setTimeout(() => location.reload(), 500);
    } catch {
      setStatus('bad');
    }
  }

  return (
    <dialog
      ref={ref}
      className="m-auto w-[min(520px,calc(100vw-32px))] animate-fade-in rounded-2xl border border-white/10 bg-poltrona p-0 text-papel shadow-[0_24px_60px_rgba(0,0,0,0.6)] backdrop:bg-black/70"
      onClose={onClose}
      onCancel={onClose}
    >
      <form onSubmit={save} className="flex flex-col gap-4 px-6 pt-5 pb-6">
        <div className="-mr-3 flex items-center justify-between">
          <h2 className="text-[22px] font-bold">Ajustes</h2>
          <button type="button" className="inline-flex size-11 items-center justify-center rounded-full text-papel-2 transition-colors hover:bg-white/10 hover:text-papel" aria-label="Fechar" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
        <p className="meta">
          O PobreFlix funciona sem conta. Opcionalmente, cole aqui uma chave gratuita do TMDB para ver imagens de
          fundo, notas, gêneros, nomes e miniaturas dos episódios e listas de populares. A chave fica salva só neste
          navegador.
        </p>
        <label className="field">
          <span>Chave da API do TMDB (v3) ou token de leitura (v4)</span>
          <input
            value={key}
            onChange={(e) => {
              setKey(e.target.value);
              setStatus('idle');
            }}
            placeholder="ex.: 1a2b3c…"
            autoComplete="off"
            spellCheck={false}
          />
        </label>
        {status === 'bad' && <p className="text-sm text-perigo" role="alert">Essa chave não foi aceita pelo TMDB. Confira e tente de novo.</p>}
        {status === 'ok' && <p className="text-sm text-ok" role="status">Chave aceita! Recarregando…</p>}
        <div className="flex flex-wrap justify-end gap-2">
          {tmdb.tmdbEnabled() && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                tmdb.setTmdbKey('');
                location.reload();
              }}
            >
              Remover chave
            </button>
          )}
          <button type="submit" className="btn btn-primary" disabled={status === 'checking'}>
            {status === 'checking' ? 'Verificando…' : 'Salvar'}
          </button>
        </div>
      </form>
    </dialog>
  );
}
