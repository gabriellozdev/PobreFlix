import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { AlertIcon, ReloadIcon } from './Icons';

const stateBox = 'mx-auto flex max-w-[520px] animate-fade-in flex-col items-center gap-2.5 px-4 py-14 text-center';
const artCard = 'absolute bottom-0 h-[68px] w-[46px] rounded-md border-2 border-linha bg-linear-160 from-cortina to-sala';

export function EmptyState({
  title,
  text,
  action,
  art = 'search',
}: {
  title: string;
  text?: string;
  action?: ReactNode;
  art?: 'search' | 'list' | 'calendar';
}) {
  return (
    <div className={stateBox}>
      {/* três "fitas" empilhadas na prateleira da locadora */}
      <div className="relative mb-2 h-[90px] w-[120px]" aria-hidden="true">
        <span className={cn(artCard, 'left-1.5 -rotate-10')} />
        <span
          className={cn(
            artCard,
            'bottom-2.5 left-[37px] z-1 border-anil from-anil to-anil-escuro shadow-[0_10px_24px_rgba(111,116,252,0.35)]',
            art === 'calendar' && 'h-[58px]',
          )}
        />
        <span className={cn(artCard, 'left-[68px] rotate-10')} />
      </div>
      <h3 className="text-[22px] font-bold">{title}</h3>
      {text && <p className="text-nevoa">{text}</p>}
      {action && <div className="mt-2.5">{action}</div>}
    </div>
  );
}

export function ErrorState({ error, onRetry, compact }: { error?: Error; onRetry?: () => void; compact?: boolean }) {
  return (
    <div className={cn(stateBox, compact && 'py-6')} role="alert">
      <AlertIcon className="size-10 text-perigo" />
      <h3 className="text-[22px] font-bold">Não deu para carregar agora</h3>
      <p className="text-nevoa">{error?.message || 'Algo deu errado ao falar com o serviço.'}</p>
      {onRetry && (
        <button className="btn btn-outline" onClick={onRetry}>
          <ReloadIcon /> Tentar de novo
        </button>
      )}
    </div>
  );
}
