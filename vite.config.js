import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev server proxies /api to the FastAPI backend so the browser can use
// relative URLs (works on local dev AND on the sandbox preview host).
// For production deploys, build-time VITE_API_URL overrides this.
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    // The app may be previewed through sandbox/CI proxy hosts (*.e2b.app etc.)
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
