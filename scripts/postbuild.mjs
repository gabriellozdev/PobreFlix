// Cria uma cópia do index.html em cada rota para que o site funcione como
// arquivos estáticos (cada página no seu próprio caminho) e um 404.html.
import { copyFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const routes = ['filmes', 'series', 'animes', 'doramas', 'novidades', 'lancamentos', 'busca', 'minha-lista', 'generos', 'titulo'];

for (const r of routes) {
  await mkdir(join(dist, r), { recursive: true });
  await copyFile(join(dist, 'index.html'), join(dist, r, 'index.html'));
}
await copyFile(join(dist, 'index.html'), join(dist, '404.html'));
console.log(`postbuild: ${routes.length} rotas + 404.html`);
