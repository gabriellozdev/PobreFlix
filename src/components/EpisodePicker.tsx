import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  season: number;
  episode: number;
  /** episódios conhecidos (ex.: especiais do StreamBetter) */
  extras: { number: number; name?: string }[];
  /** total de episódios, quando alguma fonte informa */
  count?: number;
  onPick: (n: number) => void;
}

/**
 * Sem TMDB não há a lista de episódios com nomes: o usuário escolhe pelo
 * número (os players também mostram a própria lista interna).
 */
export function EpisodePicker({ season, episode, extras, count, onPick }: Props) {
  const [val, setVal] = useState(String(episode));
  useEffect(() => setVal(String(episode)), [episode]);
  const nums = count
    ? Array.from({ length: count }, (_, i) => i + 1)
    : Array.from({ length: 12 }, (_, i) => Math.max(1, episode - 5) + i);

  return (
    <div className="flex flex-col gap-4">
      <p className="meta">
        Escolha o episódio da temporada {season} pelo número. A lista completa, com nomes, também aparece dentro dos
        players.
      </p>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(52px,1fr))] gap-2" role="list">
        {nums.map((n) => (
          <button
            key={n}
            role="listitem"
            className={cn(
              'h-12 rounded-full bg-poltrona font-display text-base font-bold tabular-nums text-papel-2 transition-colors hover:bg-cortina hover:text-papel',
              n === episode && 'bg-anil text-noite hover:bg-anil-claro hover:text-noite',
            )}
            aria-current={n === episode || undefined}
            aria-label={`Episódio ${n}`}
            onClick={() => onPick(n)}
          >
            {n}
          </button>
        ))}
      </div>
      {!count && (
        <form
          className="flex items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const n = parseInt(val, 10);
            if (n > 0) onPick(n);
          }}
        >
          <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-nevoa">
            <span>Ir para o episódio</span>
            <input
              type="number"
              min={1}
              inputMode="numeric"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              className="h-11 w-[120px] rounded-lg border-2 border-linha bg-noite px-3 text-base font-normal text-papel tabular-nums outline-0 transition-colors focus:border-anil"
            />
          </label>
          <button className="btn btn-outline">Ir</button>
        </form>
      )}
      {extras.length > 0 && (
        <div className="flex flex-col">
          <p className="pt-2 pb-1 text-[13px] font-semibold text-nevoa">Especiais desta temporada</p>
          {extras.map((x) => (
            <button
              key={x.number}
              className="border-b border-linha py-2.5 text-left font-semibold text-papel-2 transition-colors hover:text-anil-claro"
              onClick={() => onPick(x.number)}
            >
              E{x.number} · {x.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
