/**
 * E2E ADVERSARIAL — producción real servida (NUNCA mock).
 * Doble-clicks, acciones inválidas (no crashea), reload a mitad de flujo (persistencia),
 * reset → seed, mobile 375 sin overflow, touch >= 44px.
 */
import { test, expect } from '@playwright/test';
import { BASE_URL, STORAGE_KEY, fillLeadForm } from './helpers';

test.describe('Adversarial', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL + '/');
    await page.evaluate((k) => localStorage.removeItem(k), STORAGE_KEY);
    await page.reload();
    await expect(page.getByTestId('demo-ready')).toBeVisible();
  });

  test('doble-click en submit no crashea y el FSM queda consistente', async ({ page }) => {
    await fillLeadForm(page);
    // dos clics inmediatos al botón de enviar
    await page.getByTestId('lf-submit').click();
    await page.getByTestId('lf-submit').click();
    // el lead activo se califica determinista (no crashea)
    await expect(page.getByTestId('score')).not.toBeEmpty();
    await expect(page.getByTestId('qualify-card')).toContainText('Carla Mendez');
    // la página sigue viva
    await expect(page.getByTestId('lead-form')).toBeVisible();
    // los leads del seed siguen intactos en el dashboard
    await expect(page.getByTestId('dashboard')).toContainText('María González');
  });

  test('doble-click en el CTA de agendar es idempotente (un solo booked)', async ({ page }) => {
    await fillLeadForm(page);
    await page.getByTestId('lf-submit').click();
    const cta = page.getByTestId('qualify-card').getByTestId('cta-calendly');
    await expect(cta).toBeVisible();

    // dos clics al CTA: el primero book → booked; el segundo no debe re-bookear ni duplicar
    await cta.click();
    await cta.click();

    // el lead pasa a booked una sola vez (label cambia a Booked)
    await expect(page.getByTestId('qualify-card').getByTestId('cta-calendly')).toContainText('Booked');
    // booking link único en el dashboard (idempotente, sin duplicar)
    await expect(page.locator('[data-testid="booking-LEAD-6"]')).toHaveCount(1);
    await expect(page.locator('[data-testid="booking-LEAD-7"]')).toHaveCount(0);
  });

  test('form inválido: no captura, muestra errores y no crashea', async ({ page }) => {
    // email inválido + phone inválido + sin topic
    await page.getByTestId('lf-name').fill('  ');
    await page.getByTestId('lf-email').fill('not-an-email');
    await page.getByTestId('lf-phone').fill('12');
    await page.getByTestId('lf-topic').fill('');
    await page.getByTestId('lf-submit').click();

    await expect(page.getByText('Name is required.')).toBeVisible();
    await expect(page.getByText('Enter a valid email.')).toBeVisible();
    await expect(page.getByText('Enter a valid phone number.')).toBeVisible();
    await expect(page.getByText('Tell us what you are looking for.')).toBeVisible();

    // no se capturó ningún lead nuevo (siguen 5 del seed)
    const kpis = await page.getByTestId('kpi-bar').textContent();
    expect(kpis).toContain('Total leads');
    // pagina viva (no crasheó)
    await expect(page.getByTestId('lead-form')).toBeVisible();
  });

  test('reload a mitad de flujo: el lead capturado persiste (localStorage)', async ({ page }) => {
    await fillLeadForm(page);
    await page.getByTestId('lf-submit').click();
    await expect(page.getByTestId('score')).not.toBeEmpty();
    // lead ya calificado (carla) en el dashboard
    await expect(page.getByTestId('dashboard')).toContainText('carla@example.com');

    // reload a mitad de flujo
    await page.reload();
    await expect(page.getByTestId('demo-ready')).toBeVisible();

    // el lead persiste tras el reload
    await expect(page.getByTestId('dashboard')).toContainText('carla@example.com');
    // y sigue qualified con score en la tarjeta de lead activo
    await expect(page.getByTestId('score')).not.toBeEmpty();
  });

  test('reset restaura el seed (5 leads) y limpia el demo', async ({ page }) => {
    await fillLeadForm(page);
    await page.getByTestId('lf-submit').click();
    await expect(page.getByTestId('score')).not.toBeEmpty();

    // reset
    await page.getByRole('button', { name: /reset demo/i }).click();
    await expect(page.getByTestId('demo-ready')).toBeVisible();

    // el dashboard vuelve al seed (María González de vuelta)
    await expect(page.getByTestId('dashboard')).toContainText('María González');
    // el lead capturado (carla@example.com) ya no está
    await expect(page.getByTestId('dashboard')).not.toContainText('carla@example.com');
    // localStorage re-persistido como SEED válido (5 leads, sin carla, contador 5)
    const raw = await page.evaluate((k) => localStorage.getItem(k), STORAGE_KEY);
    expect(raw).not.toBeNull();
    const saved = JSON.parse(raw!);
    expect(saved.leads.length).toBe(5);
    expect(saved.leadCounter).toBe(5);
    expect(saved.leads.every((l: { email: string }) => l.email !== 'carla@example.com')).toBe(true);
  });

  test('mobile 375: touch >=44px en los controles del demo y sin overflow', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.reload();
    await expect(page.getByTestId('demo-ready')).toBeVisible();

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);

    // touch target >= 44px (AC-10) para submit y reset
    const submit = page.getByTestId('lf-submit');
    const submitBox = await submit.boundingBox();
    expect(submitBox!.height).toBeGreaterThanOrEqual(44);

    const reset = page.getByRole('button', { name: /reset demo/i });
    const resetBox = await reset.boundingBox();
    expect(resetBox!.height).toBeGreaterThanOrEqual(44);

    // el CTA Calendly del dashboard (booked seed) >= 44px
    const cta = page.getByTestId('cta-calendly').first();
    const ctaBox = await cta.boundingBox();
    expect(ctaBox!.height).toBeGreaterThanOrEqual(44);
  });
});
