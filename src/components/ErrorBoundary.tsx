import { Component, type ErrorInfo, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { AlertIcon } from './Icons';

interface Props {
  children: ReactNode;
  /** muda quando a rota muda: limpa o erro ao navegar */
  resetKey?: string;
  compact?: boolean;
}
interface State {
  error: Error | null;
}

/** Evita que um erro de renderização deixe a aba inteira preta. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[PobreFlix] erro de renderização:', error, info.componentStack);
  }

  componentDidUpdate(prev: Props) {
    if (this.state.error && prev.resetKey !== this.props.resetKey) this.setState({ error: null });
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div
        className={cn(
          'flex min-h-[calc(100vh-var(--header-h))] flex-col items-center justify-center gap-3 px-page pt-[calc(var(--header-h)+24px)] pb-10 text-center',
          this.props.compact && 'fixed inset-0 z-100 min-h-0 bg-noite',
        )}
        role="alert"
      >
        <AlertIcon className="size-10 text-perigo" />
        <h2 className="text-[22px] font-bold">Algo deu errado nesta parte da página</h2>
        <p className="meta">Tente de novo. Se continuar, recarregue a página.</p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          <button className="btn btn-primary" onClick={() => this.setState({ error: null })}>
            Tentar de novo
          </button>
          <button className="btn btn-outline" onClick={() => location.reload()}>
            Recarregar
          </button>
        </div>
      </div>
    );
  }
}
