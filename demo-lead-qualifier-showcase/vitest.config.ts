import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'tests/**/*.test.{ts,tsx}'],
    // cap de recursos (OOM fix 2026-08-26): evita spawn de todos los cores en CI/local
    maxWorkers: 4,
    minWorkers: 1,
  },
  resolve: {
    alias: {
      // fileURLToPath decodifica percent-encoding: el repo vive en un path con espacios,
      // y URL.pathname devuelve "DEMOS%20-showcase-chris%20dev" que Vite no resuelve.
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
