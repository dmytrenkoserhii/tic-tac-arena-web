import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import './index.css';
import App from './App.tsx';
import { AuthProvider } from './features/auth/auth-provider.tsx';
import { Sentry } from './lib/sentry.ts';
import './lib/supabase';
import { theme } from './theme';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider defaultColorScheme="dark" theme={theme}>
      <Sentry.ErrorBoundary
        fallback={<p>Something went wrong. Refresh the page and try again.</p>}
      >
        <AuthProvider>
          <App />
        </AuthProvider>
      </Sentry.ErrorBoundary>
    </MantineProvider>
  </StrictMode>,
);
