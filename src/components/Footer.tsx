import { Link } from 'react-router-dom';
import { Logo } from './Icons';

const col = 'flex flex-col items-start gap-0.5';
const head = 'mb-1.5 text-[15px] font-semibold text-papel';
const link = 'py-1.5 text-sm transition-colors hover:text-papel';

export function Footer() {
  return (
    <footer className="mt-16 border-t border-white/5 bg-linear-to-b from-noite to-sala pt-12 pb-6 text-nevoa">
      <div className="container-page grid grid-cols-2 gap-8 md:grid-cols-[repeat(3,1fr)_1.4fr]">
        <div className={col}>
          <h4 className={head}>Navegação</h4>
          <Link to="/novidades" className={link}>Novidades</Link>
          <Link to="/filmes" className={link}>Filmes</Link>
          <Link to="/series" className={link}>Séries</Link>
          <Link to="/animes" className={link}>Animes</Link>
          <Link to="/doramas" className={link}>Doramas</Link>
          <Link to="/lancamentos" className={link}>Calendário de lançamentos</Link>
        </div>
        <div className={col}>
          <h4 className={head}>Para você</h4>
          <Link to="/minha-lista" className={link}>Minha lista</Link>
          <Link to="/busca" className={link}>Buscar</Link>
        </div>
        <div className={col}>
          <h4 className={head}>Fontes</h4>
          <a href="https://streambetter.lat/docs" target="_blank" rel="noopener noreferrer" className={link}>StreamBetter</a>
          <a href="https://api.pomfy.stream/" target="_blank" rel="noopener noreferrer" className={link}>Pomfy</a>
          <a href="https://superflixapi.boats/doc" target="_blank" rel="noopener noreferrer" className={link}>SuperFlix</a>
          <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer" className={link}>Imagens: TMDB</a>
        </div>
        <div className="col-span-full flex flex-col gap-3 md:col-span-1">
          <Logo size={30} />
          <p className="max-w-[360px] text-sm text-pretty">
            Sem conta, sem assinatura. O PobreFlix não hospeda vídeos: ele organiza o catálogo e reproduz os players
            públicos dos provedores acima.
          </p>
        </div>
      </div>
      <div className="container-page mt-10">
        <div className="border-t border-white/10 pt-5 text-[13px]">
          <span>© {new Date().getFullYear()} PobreFlix</span>
        </div>
      </div>
    </footer>
  );
}
