// SpotlightNavbar — VengeanceUI (MIT, github.com/Ashutoshx7/VengeanceUI).
// Mesma mecânica (luz que segue o mouse + "ambience" no item ativo, com molas do
// framer-motion). Adaptações: os itens são rotas do React Router e o item ativo
// vem da URL; tema escuro fixo; cores da marca em .spotlight-nav (styles/app.css).
import { animate } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

export interface NavItem {
  label: string;
  to: string;
}

export interface SpotlightNavbarProps {
  items: NavItem[];
  className?: string;
  'aria-label'?: string;
}

const isActivePath = (pathname: string, to: string) =>
  to === '/' ? pathname === '/' : pathname === to || pathname.startsWith(`${to}/`);

export function SpotlightNavbar({ items, className, 'aria-label': ariaLabel }: SpotlightNavbarProps) {
  const navRef = useRef<HTMLElement>(null);
  const { pathname } = useLocation();
  const activeIndex = items.findIndex((i) => isActivePath(pathname, i.to));
  const [hoverX, setHoverX] = useState<number | null>(null);

  const spotlightX = useRef(0);
  const ambienceX = useRef(0);

  const itemCenter = (nav: HTMLElement, index: number) => {
    const el = nav.querySelector<HTMLElement>(`[data-index="${index}"]`);
    if (!el) return null;
    const navRect = nav.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return r.left - navRect.left + r.width / 2;
  };

  // luz que segue o mouse; ao sair, volta com mola para o item ativo
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    // mola de volta em andamento: parada quando o mouse volta ou o efeito é refeito
    let spring: ReturnType<typeof animate> | undefined;
    const onMove = (e: MouseEvent) => {
      spring?.stop();
      const x = e.clientX - nav.getBoundingClientRect().left;
      setHoverX(x);
      spotlightX.current = x;
      nav.style.setProperty('--spotlight-x', `${x}px`);
    };
    const onLeave = () => {
      setHoverX(null);
      const target = activeIndex >= 0 ? itemCenter(nav, activeIndex) : null;
      if (target == null) return;
      spring = animate(spotlightX.current, target, {
        type: 'spring',
        stiffness: 200,
        damping: 20,
        onUpdate: (v) => {
          spotlightX.current = v;
          nav.style.setProperty('--spotlight-x', `${v}px`);
        },
      });
    };
    nav.addEventListener('mousemove', onMove);
    nav.addEventListener('mouseleave', onLeave);
    return () => {
      spring?.stop();
      nav.removeEventListener('mousemove', onMove);
      nav.removeEventListener('mouseleave', onLeave);
    };
  }, [activeIndex]);

  // "ambience": brilho na base do item ativo, deslizando com mola ao trocar de rota
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const place = (instant: boolean) => {
      const target = activeIndex >= 0 ? itemCenter(nav, activeIndex) : null;
      nav.style.setProperty('--ambience-o', target == null ? '0' : '1');
      if (target == null) return;
      if (instant) {
        ambienceX.current = target;
        nav.style.setProperty('--ambience-x', `${target}px`);
        return;
      }
      const controls = animate(ambienceX.current, target, {
        type: 'spring',
        stiffness: 200,
        damping: 20,
        onUpdate: (v) => {
          ambienceX.current = v;
          nav.style.setProperty('--ambience-x', `${v}px`);
        },
      });
      return controls;
    };
    // primeira posição sem animação (evita o brilho "voar" da esquerda no load)
    const controls = place(ambienceX.current === 0);
    const onResize = () => place(true);
    window.addEventListener('resize', onResize);
    return () => {
      controls?.stop();
      window.removeEventListener('resize', onResize);
    };
  }, [activeIndex]);

  return (
    <nav
      ref={navRef}
      aria-label={ariaLabel}
      className={cn(
        'spotlight-nav relative h-11 overflow-hidden rounded-full border border-white/15 bg-black/35 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.5)] backdrop-blur-md',
        className,
      )}
    >
      <ul className="relative z-10 flex h-full items-center gap-0 px-1.5">
        {items.map((item, idx) => (
          <li key={item.to} className="relative flex h-full items-center justify-center">
            <NavLink
              to={item.to}
              end={item.to === '/'}
              data-index={idx}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200',
                'focus-visible:ring-2 focus-visible:ring-anil-claro focus-visible:outline-none',
                idx === activeIndex ? 'text-papel' : 'text-nevoa hover:text-papel',
              )}
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>

      {/* 1. luz que segue o mouse */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 z-[1] h-full w-full transition-opacity duration-300"
        style={{
          opacity: hoverX !== null ? 1 : 0,
          background:
            'radial-gradient(120px circle at var(--spotlight-x) 100%, var(--spotlight-color, rgba(0,0,0,0.1)) 0%, transparent 50%)',
        }}
      />
      {/* 2. brilho fixo no item ativo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 z-[2] h-[2px] w-full transition-opacity duration-300"
        style={{
          opacity: 'var(--ambience-o, 0)' as unknown as number,
          background:
            'radial-gradient(60px circle at var(--ambience-x) 0%, var(--ambience-color, rgba(0,0,0,1)) 0%, transparent 100%)',
        }}
      />
    </nav>
  );
}
