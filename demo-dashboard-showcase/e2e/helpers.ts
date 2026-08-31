/**
 * HELPERS E2E — utilidades compartidas (aislamiento de tests, reset de estado).
 * Best practice web validada (playwright.dev/docs/best-practices#make-tests-as-isolated-as-possible):
 * cada test corre con su propio contexto/localStorage → aislamiento total.
 */
import { expect, type Page } from '@playwright/test';

/** Clave de persistencia de la demo (src/lib/constants.ts). */
export const STORAGE_KEY = 'demo-dashboard:v1';

/**
 * Limpia el localStorage ANTES de cargar la página para que cada test arranque
 * desde el seed (aislamiento). Se llama en beforeEach antes del primer goto.
 */
export async function resetStorage(page: Page): Promise<void> {
 await page.goto('/');
 await page.evaluate((key) => localStorage.removeItem(key), STORAGE_KEY);
}

/**
 * Verifica que NO haya overflow horizontal (scrollWidth <= clientWidth).
 * : mobile 375px sin horizontal scroll.
 */
export async function expectNoHorizontalOverflow(page: Page): Promise<void> {
 const overflow = await page.evaluate(() => {
 const doc = document.documentElement;
 return { scrollWidth: doc.scrollWidth, clientWidth: doc.clientWidth };
 });
 expect(overflow.scrollWidth, `overflow horizontal: ${JSON.stringify(overflow)}`).toBeLessThanOrEqual( overflow.clientWidth,
);
}

/**
 * Verifica que todos los targets touch (botones, inputs, selects, links) midan ≥44px
 * en el viewport actual: touch ≥44px.
 */
export async function expectTouchTargetsMin44(page: Page): Promise<void> {
 const small = await page.evaluate(() => {
 const bad: { tag: string; text: string; w: number; h: number }[] = [];
 const sel = 'button, a, input, select, [role="button"], [role="link"]';
 document.querySelectorAll(sel).forEach((el) => {
 const r = el.getBoundingClientRect();
 // Solo elementos visibles (no display:none / fuera de viewport).
 if (r.width === 0 || r.height === 0) return;
 if (r.width < 44 || r.height < 44) {
 bad.push({
 tag: el.tagName.toLowerCase(),
 text: (el.textContent ?? '').trim().slice(0, 40) || (el.getAttribute('aria-label') ?? ''),
 w: Math.round(r.width),
 h: Math.round(r.height),
 });
 }
 });
 return bad;
 });
 expect(small, `targets touch <44px: ${JSON.stringify(small)}`).toEqual([]);
}
