// AnimatedRays — VengeanceUI (MIT, github.com/Ashutoshx7/VengeanceUI).
// Mesma construção (listras + arco-íris com blend difference). O tema escuro é
// fixo, então sai o MutationObserver de .dark; o arco-íris usa as cores da marca.
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedRaysProps {
  className?: string;
  children?: ReactNode;
}

const stripes =
  'repeating-linear-gradient(100deg, var(--color-noite) 0%, var(--color-noite) 7%, transparent 10%, transparent 12%, var(--color-noite) 16%)';
const rainbow = 'repeating-linear-gradient(100deg, #6f74fc 10%, #b27cff 15%, #6f74fc 20%, #5eead4 25%, #6f74fc 30%)';

export function AnimatedRays({ className = '', children }: AnimatedRaysProps) {
  return (
    <section aria-hidden={children ? undefined : true} className={cn('relative h-full w-full overflow-hidden', className)}>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `${stripes}, ${rainbow}`,
          backgroundSize: '300%, 200%',
          backgroundPosition: '50% 50%, 50% 50%',
          filter: 'blur(10px) opacity(50%) saturate(200%)',
          maskImage: 'radial-gradient(ellipse at 100% 0%, black 40%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 100% 0%, black 40%, transparent 70%)',
        }}
      >
        <div
          className="absolute inset-0 animate-aurora-bg"
          style={{
            backgroundImage: `${stripes}, ${rainbow}`,
            backgroundSize: '200%, 100%',
            backgroundAttachment: 'fixed',
            mixBlendMode: 'difference',
          }}
        />
      </div>
      {children && <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">{children}</div>}
    </section>
  );
}
