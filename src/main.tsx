import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import './styles/app.css';

// Normaliza endereços com barra final gerados pelas pastas estáticas (/filmes/ -> /filmes)
if (location.pathname.length > 1 && location.pathname.endsWith('/')) {
  history.replaceState(history.state, '', location.pathname.replace(/\/+$/, '') + location.search + location.hash);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
