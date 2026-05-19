import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { sentryVitePlugin } from '@sentry/vite-plugin';

const sentryPlugin =
  process.env.SENTRY_AUTH_TOKEN &&
  process.env.SENTRY_ORG &&
  process.env.SENTRY_FRONTEND_PROJECT
    ? sentryVitePlugin({
        authToken: process.env.SENTRY_AUTH_TOKEN,
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_FRONTEND_PROJECT,
        release: {
          name: process.env.VITE_SENTRY_RELEASE,
        },
        sourcemaps: {
          filesToDeleteAfterUpload: ['dist/**/*.map'],
        },
      })
    : null;

// https://vite.dev/config/
export default defineConfig({
  build: {
    sourcemap: 'hidden',
  },
  plugins: [react(), sentryPlugin].filter(Boolean),
  server: {
    port: 5173,
    strictPort: true,
  },
});
