import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  workers: 2, // cap de recursos (multi-proyecto activo): evita saturar CPU/RAM con varios Chromium
  timeout: 60_000,
  use: {
    // Chromium del bundle de Playwright.
    launchOptions: {
      args: ['--no-sandbox', '--disable-dev-shm-usage'],
    },
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { viewport: { width: 375, height: 812 } } }, // adversarial mobile
  ],
});
