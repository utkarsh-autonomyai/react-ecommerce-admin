import '@/config/env';
import '@/api/client';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './app.tsx';
import { ErrorBoundary } from './components/shared/error-boundary.tsx';
import { initAuth } from './features/auth/lib/auth-init.ts';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Missing #root element');

initAuth().finally(() => {
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
});
