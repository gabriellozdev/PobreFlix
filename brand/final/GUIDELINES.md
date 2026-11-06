# PobreFlix — guia de uso do logo (compacto)

## 1. O logo
- **Ideia:** *Meia-entrada.* O botão de play cortado ao meio, com as metades deslocadas: cinema pela metade do preço (de graça, na verdade). O mesmo corte aparece no "x" do wordmark.
- **Versões:** horizontal (principal) · empilhada · só símbolo · só wordmark.
- **Arquivos** (`brand/final/`):
  | Uso | Arquivo |
  |---|---|
  | Mestres (SVG, só contornos, sem texto vivo) | `meia-horizontal.svg`, `meia-stacked.svg`, `meia-symbol.svg`, `meia-wordmark.svg` |
  | Símbolo claro sobre fundo escuro | `meia-symbol-reversed.svg` (vão 2 px maior, compensa a irradiação) |
  | Símbolo até 32 px | `meia-symbol-small.svg` (vão e deslocamento maiores) |
  | Uma cor (preto, branco, anil) + PNG 1200 | `export/lockups/`, `export/symbol/` |
  | Favicon, ícones de app/PWA, manifest, snippet `<head>` | `export/web/` |
  | Apresentação com aplicações | `presentation.html`, `slides/*.png` |

## 2. Área de respiro
Mantenha livre em volta do logo **1 × a altura de uma metade do símbolo** (a distância do topo do triângulo de cima até o corte).
A medida cresce e diminui com o logo; nunca use uma distância fixa.

## 3. Tamanho mínimo
| Versão | Tela | Impressão |
|---|---|---|
| Horizontal | 120 px de largura | 30 mm |
| Empilhada | 64 px de largura | 18 mm |
| Símbolo | 16 px — **use `meia-symbol-small.svg` até 32 px** | 5 mm |

## 4. Cor
| Nome | HEX | RGB | CMYK (aprox.) | Pantone (aprox., conferir no leque) |
|---|---|---|---|---|
| Anil (marca) | #6F74FC | 111 116 252 | 56 54 0 1 | 2726 C |
| Noite (fundo) | #100D20 | 16 13 32 | 50 59 0 87 | Black 6 C |
| Papel (texto) | #F4F2FF | 244 242 255 | 4 5 0 0 | — |
| Etiqueta (só a etiqueta "R$ 0,00") | #FFD23F | 255 210 63 | 0 18 75 0 | 122 C |

**O logo é de uma cor só.** O símbolo e o wordmark usam a mesma cor. A única exceção é o fundo escuro, onde o símbolo fica em anil e o wordmark em papel (`meia-horizontal-on-dark.svg`).

**Combinações aprovadas:**
- anil sobre noite (padrão do site);
- anil ou preto sobre branco;
- branco sobre anil;
- branco sobre noite.

**Contraste do anil:** cerca de 4,8:1 sobre noite e 3,9:1 sobre branco. Os dois passam do mínimo de 3:1 para elementos gráficos.

O amarelo **não** entra no logo. Ele é o acento do sistema, usado só na etiqueta de preço.

## 5. Tipografia
- **Títulos e wordmark:** Bricolage Grotesque. O wordmark usa ExtraBold (wght 800, opsz 96), espaçamento −1,2 % e o "x" cortado.
- **Interface:** Instrument Sans 400–700. Fallback: `system-ui, -apple-system, 'Segoe UI', sans-serif`.
- **Licença:** as duas fontes usam a SIL Open Font License 1.1, que permite uso em logo e no site. Fontes: Google Fonts e `github.com/ateliertriay/bricolage`.

## 6. Não faça
- Não estique, não gire e não espelhe. Espelhado, o play aponta para trás.
- Não feche o vão entre as metades. Não desalinhe as metades de outro jeito, nem mude o corte de lugar.
- Não troque a cor fora da paleta. Não aplique degradê, sombra, contorno ou brilho.
- Não reorganize nem redimensione as partes de um lockup.
- Não digite "PobreFlix" com a fonte para imitar o wordmark. Use o arquivo, porque o "x" cortado só existe no desenho.
- Não use o símbolo grande (`meia-symbol.svg`) abaixo de 32 px: o vão some.
- Não coloque o logo sobre foto movimentada sem um fundo calmo por trás.

## 7. Observações
- **Marca registrada:** não foi feita pesquisa. Antes de registrar ou investir em mídia, vale uma busca profissional nas bases do INPI e uma busca reversa de imagem.
- **Ajuste óptico:**
  - o símbolo fica levemente à direita do centro do canvas, compensando a massa do triângulo;
  - os cantos são arredondados, mas as pontas do play ficam afiadas;
  - as hipotenusas estão a exatamente 30°.
- **Testes feitos:** escada de tamanhos, 16 e 32 px, uma cor, invertido, auditoria de SVG (nota 99–100 no símbolo).
