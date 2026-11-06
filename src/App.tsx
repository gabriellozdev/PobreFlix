import { useEffect } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { PlayerModal } from './components/PlayerModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { EmptyState } from './components/States';
import { Browse } from './pages/Browse';
import { Genres } from './pages/Genres';
import { Home } from './pages/Home';
import { MyList } from './pages/MyList';
import { News } from './pages/News';
import { Releases } from './pages/Releases';
import { Search } from './pages/Search';
import { TitlePage } from './pages/TitlePage';

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function NotFound() {
  return (
    <main className="relative isolate min-h-[calc(100vh-var(--header-h))] pt-header">
      <div className="container-page pb-16">
        <EmptyState
          title="Página não encontrada"
          text="O endereço pode estar errado ou a página mudou de lugar."
          action={
            <Link to="/" className="btn btn-primary">
              Ir para o início
            </Link>
          }
        />
      </div>
    </main>
  );
}

export function App() {
  const { pathname } = useLocation();
  return (
    <>
      <a
        href="#conteudo"
        className="fixed -top-16 left-2 z-200 inline-flex h-11 items-center rounded-full bg-anil px-5 font-semibold text-noite transition-[top] duration-200 focus:top-2"
      >
        Pular para o conteúdo
      </a>
      <ScrollTop />
      <Header />
      <div id="conteudo">
        <ErrorBoundary resetKey={pathname}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/filmes" element={<Browse cat="filmes" />} />
            <Route path="/series" element={<Browse cat="series" />} />
            <Route path="/animes" element={<Browse cat="animes" />} />
            <Route path="/doramas" element={<Browse cat="doramas" />} />
            <Route path="/novidades" element={<News />} />
            <Route path="/lancamentos" element={<Releases />} />
            <Route path="/busca" element={<Search />} />
            <Route path="/minha-lista" element={<MyList />} />
            <Route path="/generos" element={<Genres />} />
            <Route path="/titulo" element={<TitlePage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </div>
      <Footer />
      <ErrorBoundary resetKey={pathname} compact>
        <PlayerModal />
      </ErrorBoundary>
    </>
  );
}
