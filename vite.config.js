import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Where the FastAPI backend runs during development.
// Override with VITE_PROXY_TARGET=http://127.0.0.1:9000 npm run dev
// or with env var in .env: VITE_PROXY_TARGET
const BACKEND = process.env.VITE_PROXY_TARGET || 'http://127.0.0.1:8000';

// Dev server proxies /api/* to the backend so the browser can use relative
// URLs (works on local dev AND on the sandbox preview host).
// For production deploys, build-time VITE_API_URL overrides this.
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    // The app may be previewed through sandbox/CI proxy hosts (*.e2b.app etc.)
    allowedHosts: true,
    headers: {
      // Allow embedding in preview iframe
      'X-Frame-Options': 'ALLOWALL',
    },
    proxy: {
      '/api': {
        target: BACKEND,
        changeOrigin: true,
        secure: false,
        // The backend must expose its routes under the /api prefix
        // (FastAPI: app.include_router(router, prefix="/api")).
        // If your backend has NO /api prefix, uncomment the next line:
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    allowedHosts: true,
  },
});
