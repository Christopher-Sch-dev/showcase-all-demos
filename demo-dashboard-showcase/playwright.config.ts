/**
 * PLAYWRIGHT CONFIG — E2E de producción real + adversarial (demo-dashboard).
 * - testDir './e2e', fullyParallel true, workers 2 (cap recursos multi-proyecto, skill test-resource-caps).
 * - Chromium SYSTEM real (/usr/lib/chromium/chromium, NO /usr/bin/chromium) + args sandbox-safe.
 * - Projects: desktop (1440x900) + mobile (375x812, hasTouch, isMobile).
 * - NUNCA mock: corre contra el build estático servido (dist/ en http://localhost:8080).
 * - Best practices web validadas (playwright.dev/docs/best-practices + /emulation):
 * web-first assertions, locators por rol/texto, test isolation (contexto por test),
 * emulación mobile con hasTouch/isMobile, viewport por proyecto.
 */
import { defineConfig, devices } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:8080';

export default defineConfig({
 testDir: './e2e',
 fullyParallel: true,
 // workers 2: cap de recursos (multi-proyecto desktop+mobile corren en paralelo).
 workers: 2,
 timeout: 60_000,
 expect: { timeout: 10_000 },
 retries: 0,
 reporter: [['list'], ['html', { open: 'never' }]],
 use: {
 baseURL: BASE_URL,
 // Chromium SYSTEM real (no el bundle de Playwright). --no-sandbox + --disable-dev-shm-usage
 // para entornos root/CI con /dev/shm limitado.
 launchOptions: {
 executablePath: '/usr/lib/chromium/chromium',
 args: ['--no-sandbox', '--disable-dev-shm-usage'],
 },
 trace: 'retain-on-failure',
 screenshot: 'only-on-failure',
 },
 projects: [
 {
 name: 'desktop',
 use: {
 ...devices['Desktop Chrome'],
 viewport: { width: 1440, height: 900 },
 isMobile: false,
 hasTouch: false,
 },
 },
 {
 name: 'mobile',
 use: {
 ...devices['Desktop Chrome'],
 viewport: { width: 375, height: 812 },
 isMobile: true,
 hasTouch: true,
 deviceScaleFactor: 2,
 },
 },
 ],
});
