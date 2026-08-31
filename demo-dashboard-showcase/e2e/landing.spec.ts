/**
 * LANDING E2E — producción real (build estático servido, NUNCA mock).
 * Verifica el hero de venta (config dental), badge MODO DEMO, CTA Calendly (NUNCA mailto),
 * pain-points con métricas + source, landing ES, y sin overflow horizontal en mobile 375.
 * Best practices web: locators por rol/texto, web-first assertions (playwright.dev/docs/best-practices).
 */
import { test, expect } from '@playwright/test';
import { expectNoHorizontalOverflow } from './helpers';

test.describe('Landing (producción real)', () => {
 test('hero de venta visible en EN + badge MODO DEMO + CTA Calendly', async ({ page }) => {
 await page.goto('/');

 // Hero de venta (config dental): headline exacto del contrato.
 await expect(page.getByRole('heading', { level: 1 })).toContainText( 'Your schedule is leaking revenue',
);

 // Badge MODO DEMO siempre visible .
 await expect(page.getByRole('status', { name: 'MODO DEMO' })).toBeVisible();

 // CTA principal → Calendly , NUNCA mailto.
 const cta = page.getByRole('link', { name: /See your numbers in a live demo/i });
 await expect(cta).toBeVisible();
 await expect(cta).toHaveAttribute('href', 'https://calendly.com/csch1305');
 await expect(cta).toHaveAttribute('target', '_blank');

 // Pain-point con métricas + source (honestidad).
 await expect(page.getByText('7.4%', { exact: true }).first()).toBeVisible();
 await expect(page.getByText('$105K+', { exact: true }).first()).toBeVisible();
 // Cada métrica tiene un link "Source" (honestidad).
 await expect(page.getByRole('link', { name: 'Source' }).first()).toBeVisible();
 });

 test('landing ES carga en español', async ({ page }) => {
 await page.goto('/es/');

 await expect(page.getByRole('heading', { level: 1 })).toContainText( 'Tu agenda está perdiendo ingresos',
);
 await expect(page.getByRole('status', { name: 'MODO DEMO' })).toBeVisible();
 // CTA ES → Calendly (NUNCA mailto).
 const cta = page.getByRole('link', { name: /Mira tus números en una demo en vivo/i });
 await expect(cta).toHaveAttribute('href', 'https://calendly.com/csch1305');
 });

 test('sin overflow horizontal en mobile 375', async ({ page }) => {
 await page.goto('/');
 await expectNoHorizontalOverflow(page);
 });
});
