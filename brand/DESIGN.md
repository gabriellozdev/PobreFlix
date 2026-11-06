# PobreFlix — sistema de design ("locadora de bairro")

Catálogo de streaming gratuito para brasileiros jovens, usado à noite e no celular. Tarefa principal: achar algo e dar play rápido.
Tom: irreverente ("pobre"), direto, em português do Brasil.

## Tokens (definidos em `src/styles/app.css`, Tailwind v4 `@theme`)
| Token | Hex | Uso |
|---|---|---|
| `noite` | #100d20 | fundo da página |
| `sala` | #1b1733 | superfícies (cards vazios, barras) |
| `poltrona` | #262046 | superfícies elevadas (menus, botões neutros) |
| `cortina` | #322a5c | hover de superfície |
| `linha` | #3a3360 | bordas |
| `anil` / `anil-claro` / `anil-escuro` | #6f74fc… | marca, ação principal, foco, estado ativo |
| `etiqueta` | #ffd23f | **só** a etiqueta de preço (`.price-tag`, "R$ 0,00"). Não use em outro lugar. |
| `papel` / `papel-2` / `nevoa` | #f4f2ff / #d9d5f0 / #a9a3c9 | texto principal / secundário / discreto |
| `perigo` / `ok` | #ff6b6b / #44c767 | erro / sucesso |

Fontes: `font-display` = Bricolage Grotesque (títulos h1–h3, títulos de cards grandes), `font-sans` = Instrument Sans (todo o resto, padrão do body).
Breakpoints (custom): `sm` 568px · `md` 800px · `lg` 960px · `xl` 1100px · `2xl` 1260px.
Utilitários próprios: `container-page`, `px-page`, `pt-header`, `h-header`, `no-scrollbar`. Easing: `ease-cine`.
Animações: `animate-fade-in`, `animate-player-in`, `animate-poster-in`, `animate-sk`, `animate-dot`, `animate-aurora-bg`.
Classes de componente já prontas (em `@layer components`, use-as em vez de recriar): `btn btn-primary|btn-outline|btn-ghost|btn-icon`, `chip`, `tag` (`tag accent`), `price-tag`, `link`, `sk sk-line`, `spinner`, `select` (wrapper de `<select>`), `field`, `page-title`, `section-title`, `meta`, `visually-hidden`.

## Regras
- Tudo em utilitários Tailwind no JSX (helper `cn` de `@/lib/utils` para condicionais). Nada de CSS novo, salvo efeito impossível em utilitário — aí em `app.css`, comentado.
- Raios: botões e chips pill (`rounded-full`); pôsteres `rounded-lg`; painéis/menus `rounded-2xl`. A hierarquia decide o raio, não um valor único.
- Sem caixa-alta com tracking em rótulos/botões (sentence case). Sem "→" em links. Sem rótulos-sobrancelha acima de títulos.
- Movimento só quando responde a ação (hover/abrir/trocar) ou o único momento de entrada do hero. `prefers-reduced-motion` já é tratado globalmente.
- Foco visível (já global com `:focus-visible`), alvos de toque ≥ 44px, contraste AA.
- Mobile primeiro; conferir 375 / 768 / 1280.
- Componentes VengeanceUI (MIT) em `src/components/ui/`: `BorderBeam`, `GlowBorderCard`, `AnimatedRays`, `SpotlightNavbar`. Uso contido: beam só no CTA principal; glow no player carregando; rays só no topo das páginas de listagem.
- Mantenha toda a lógica, textos, props, a11y (aria-*, roles) e comportamento existentes. A tarefa é visual.
- Referência pronta: `src/components/Header.tsx` (já migrado).
