/**
 * E2E LANDING — producción real servida (NUNCA mock).
 * Verifica la landing EN / y ES /es/: hero de venta, badge MODO DEMO, CTA Calendly,
 * pain point con métricas con source, y sin overflow horizontal en mobile 375.
 */
import { test, expect } from '@playwright/test';
import { BASE_URL, CALENDLY } from './helpers';

test.describe('Landing EN /', () => {
  test('hero de venta visible con headline del config real', async ({ page }) => {
    await page.goto(BASE_URL + '/');
    // Hero headline del nicho RE (config Zod real)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Never lose a lead to a slow reply');
    // Pain point con métricas reales del config
    await expect(page.getByText('42 hours', { exact: false }).first()).toBeVisible();
    await expect(page.getByText('100x', { exact: false }).first()).toBeVisible();
    await expect(page.getByText('21x', { exact: false }).first()).toBeVisible();
  });

  test('badge MODO DEMO siempre visible', async ({ page }) => {
    await page.goto(BASE_URL + '/');
    await expect(page.getByTestId('mode-badge')).toContainText('MODO DEMO');
    // footer también lo repite
    await expect(page.locator('footer')).toContainText('MODO DEMO');
  });

  test('CTA final apunta a Calendly (nunca mailto)', async ({ page }) => {
    await page.goto(BASE_URL + '/');
    const cta = page.getByTestId('cta-calendly').last();
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute('href', CALENDLY);
    expect(await cta.getAttribute('href')).not.toMatch(/^mailto:/);
    await expect(cta).toHaveAttribute('target', '_blank');
  });

  test('dashboard seed visible con leads y KPIs', async ({ page }) => {
    await page.goto(BASE_URL + '/');
    await expect(page.getByTestId('demo-ready')).toBeVisible();
    // Dashboard con leads del seed (5)
    await expect(page.getByTestId('dashboard')).toContainText('María González');
    await expect(page.getByTestId('dashboard')).toContainText('James Whitfield');
    await expect(page.getByTestId('kpi-bar')).toBeVisible();
  });
});

test.describe('Landing ES /es/', () => {
  test('carga en español con hero es-CL', async ({ page }) => {
    await page.goto(BASE_URL + '/es/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Nunca pierdas un lead por una respuesta lenta.');
    await expect(page.getByTestId('mode-badge')).toContainText('MODO DEMO');
    await expect(page.getByTestId('lead-form')).toBeVisible();
  });

  test('toggle EN/ES enlaza al idioma alterno', async ({ page }) => {
    await page.goto(BASE_URL + '/es/');
    await expect(page.getByRole('link', { name: /EN/ })).toHaveAttribute('href', '/');
    await page.goto(BASE_URL + '/');
    await expect(page.getByRole('link', { name: /ES/ })).toHaveAttribute('href', '/es/');
  });
});

test.describe('CTA Calendly / no-overflow mobile 375', () => {
  test('mobile 375: sin overflow horizontal y touch >=44px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(BASE_URL + '/');
    await expect(page.getByTestId('demo-ready')).toBeVisible();
    // overflow horizontal del documento
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
    // el CTA calendly (último de la landing) mide >= 44px de alto
    const cta = page.getByTestId('cta-calendly').last();
    const box = await cta.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(44);
    expect(box!.width).toBeGreaterThanOrEqual(44);
  });
});
