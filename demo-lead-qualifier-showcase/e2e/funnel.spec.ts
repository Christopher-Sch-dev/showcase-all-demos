/**
 * E2E FUNNEL — producción real servida (NUNCA mock). Flujo Gherkin completo:
 * GIVEN un demo limpio
 * WHEN el prospecto completa el form y lo envía
 * THEN lead se captura (estado new) → se califica solo (<60s, score+razón) →
 *      CTA agenda Calendly → lead booked en el dashboard → KPIs derivados cambian.
 */
import { test, expect } from '@playwright/test';
import { BASE_URL, CALENDLY, STORAGE_KEY, fillLeadForm, capturePopup } from './helpers';

/** Devuelve {label: value} de las cards de KPIs derivados (solo las 6 del grid de KPIs). */
async function readKpis(page: import('@playwright/test').Page) {
  // las 6 KPIs viven en el primer grid; el panel "Source" (métricas) NO tiene .text-2xl
  const grid = page.getByTestId('kpi-bar').locator('.grid');
  const cards = grid.locator('.rounded-lg.border');
  const out: Record<string, string> = {};
  for (let i = 0; i < (await cards.count()); i++) {
    const card = cards.nth(i);
    const label = (await card.locator('.text-xs').first().textContent())?.trim() ?? '';
    const value = (await card.locator('.text-2xl').first().textContent())?.trim() ?? '';
    out[label] = value;
  }
  return out;
}

test.describe('Funnel completo form→capture→qualify→book→dashboard→KPIs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL + '/');
    await page.evaluate((k) => localStorage.removeItem(k), STORAGE_KEY);
    await page.reload();
    await expect(page.getByTestId('demo-ready')).toBeVisible();
  });

  test('captura + calificación <60s + agendado Calendly + dashboard booked + KPIs', async ({ page }) => {
    // ── KPIs iniciales del seed (2 booked / 5 leads) ──
    const kpiBefore = await readKpis(page);
    expect(kpiBefore['Booked']).toBe('2');
    expect(kpiBefore['Total leads']).toBe('5');

    // ── WHEN: completar y enviar el form (capture_lead → estado new) ──
    const popupUrlP = capturePopup(page);
    await fillLeadForm(page, {
      name: 'Carla Mendez',
      email: 'carla@example.com',
      phone: '555-0123',
      topic: 'looking for a 4-bedroom house under $600k',
      budget: '550000',
    });
    await page.getByTestId('lf-submit').click();

    // ── THEN: lead capturado (QualifyCard muestra el nombre del lead activo) ──
    const qualifyCard = page.getByTestId('qualify-card');
    await expect(qualifyCard).toBeVisible();
    await expect(qualifyCard).toContainText('Carla Mendez');

    // ── THEN: auto-calificado determinista con score + razón (AC-2) ──
    await expect(page.getByTestId('score')).not.toBeEmpty();
    await expect(page.getByTestId('reason')).not.toBeEmpty();
    const score = Number(await page.getByTestId('score').textContent());
    expect(score).toBeGreaterThanOrEqual(60); // threshold config

    // ── THEN: speed-to-lead <60s (AC-1) ──
    await expect(page.getByTestId('timer')).toContainText('<60s');

    // ── THEN: CTA de agendar apunta a Calendly (AC-3/8, nunca mailto) ──
    const cta = qualifyCard.getByTestId('cta-calendly');
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute('href', CALENDLY);
    expect(await cta.getAttribute('href')).not.toMatch(/^mailto:/);

    // ── WHEN: hacer clic en el CTA → agenda (book) y abre Calendly ──
    await cta.click();
    const popupUrl = await popupUrlP;
    expect(popupUrl.startsWith(CALENDLY)).toBe(true);

    // ── THEN: el lead queda booked en el dashboard (AC-4) ──
    const bookingLink = page.getByTestId('booking-LEAD-6');
    await expect(bookingLink).toBeVisible();
    await expect(bookingLink).toHaveAttribute('href', CALENDLY);

    // ── THEN: KPIs derivados cambian (Total leads 6, Booked 3) ──
    const kpiAfter = await readKpis(page);
    expect(kpiAfter['Total leads']).toBe('6');
    expect(kpiAfter['Booked']).toBe('3');
  });
});
