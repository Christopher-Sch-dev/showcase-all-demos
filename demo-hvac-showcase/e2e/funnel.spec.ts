// E2E de PRODUCCIÓN REAL — FLUJO COMPLETO del prospecto (Gherkin lead-to-invoice.feature).
// Como usuario real contra el build estático servido. NUNCA mock.
// Flujo: Capture (LiveCallSimulator) → lead en LeadQueue → Qualify → Book → Assign
// tech → Dispatch → Start → Complete → Invoice, KPIs actualizados, y loop de
// auto-calificación (IA califica sola un lead sin acción).
import { test, expect, type Page } from '@playwright/test';

const BASE = process.env.E2E_BASE_URL ?? 'http://localhost:8080';

// rol: knob de demo → loop rápido (auto-qualify a los 4s), sin feed/emergencias automáticas.
// Es DI de la app real (getDemoLoopTiming), NO mock.
async function setLoopFast(page: Page) {
  await page.addInitScript(() => localStorage.setItem('demo-hvac:loop-speed', 'fast'));
}

async function readCallsCaptured(page: Page): Promise<number> {
  const el = page.locator('[data-kpi="Calls captured"]').first();
  const txt = (await el.innerText()).trim();
  const n = Number(txt.match(/\d+/)?.[0]);
  if (Number.isNaN(n)) throw new Error('KPI Calls captured no parseable: ' + txt);
  return n;
}

async function readRevenue(page: Page): Promise<number> {
  const el = page.locator('[data-kpi="Recovered revenue"]').first();
  const txt = (await el.innerText()).trim();
  const m = txt.match(/\$?([\d,]+(?:\.\d+)?)/);
  if (!m) throw new Error('KPI revenue no parseable: ' + txt);
  return Number(m[1].replace(/,/g, ''));
}

test.describe('Funnel Gherkin lead → invoiced (desktop)', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('captura, califica, agenda, despacha, completa y factura — KPIs suben', async ({ page }) => {
    await setLoopFast(page);
    await page.goto(BASE + '/');

    // GIVEN: dashboard operativo + baseline KPIs
    await expect(page.getByRole('heading', { name: 'Dispatch live' })).toBeVisible();
    await expect(page.getByTestId('kpi-bar')).toBeVisible();
    const callsBefore = await readCallsCaptured(page);
    const revenueBefore = await readRevenue(page);

    // WHEN: simular llamada perdida en LiveCallSimulator
    await expect(page.getByTestId('call-simulator')).toBeVisible();
    const captureBtn = page.getByRole('button', { name: 'Capture as lead' });
    await expect(captureBtn).toBeEnabled();
    await captureBtn.click();

    // THEN: +1 calls captured y el lead aparece en LeadQueue con botón Qualify
    await expect
      .poll(async () => readCallsCaptured(page), { timeout: 10_000 })
      .toBe(callsBefore + 1);
    const qualifyBtn = page.locator('[data-qualify-id]').first();
    await expect(qualifyBtn).toBeVisible();
    await expect(qualifyBtn).toHaveText(/Qualify/i);

    // WHEN: Qualify → THEN lead qualified
    await qualifyBtn.click();
    await expect(qualifyBtn).not.toBeAttached(); // ya no está sin calificar
    const bookBtn = page.locator('[data-book-id]').first();
    await expect(bookBtn).toBeVisible();
    await expect(bookBtn).toHaveText(/Book/i);

    // WHEN: Book → THEN el job booked aparece en DispatchBoard con Assign
    await bookBtn.click();
    const assignSelect = page.locator('[data-assign-id]').first();
    await expect(assignSelect).toBeVisible();

    // WHEN: Assign technician (primera opción: el técnico activo de la zona del job) → THEN scheduled
    await assignSelect.selectOption({ index: 1 }); // 0 = placeholder "Assign…" disabled
    const scheduledCard = page.locator('[data-assign-id]').first();
    await expect(scheduledCard).not.toBeVisible(); // select desaparece al pasar a scheduled

    // WHEN: Dispatch → THEN dispatched (botón Start disponible)
    const dispatchBtn = page.getByRole('button', { name: 'Dispatch', exact: true }).first();
    await expect(dispatchBtn).toBeVisible();
    await dispatchBtn.click();
    const startBtn = page.getByRole('button', { name: 'Start', exact: true }).first();
    await expect(startBtn).toBeVisible();

    // WHEN: Start → THEN in_progress (botón Complete disponible)
    await startBtn.click();
    const completeBtn = page.getByRole('button', { name: 'Complete', exact: true }).first();
    await expect(completeBtn).toBeVisible();

    // WHEN: Complete → THEN completed (botón Invoice disponible)
    await completeBtn.click();
    const invoiceBtn = page.locator('[data-invoice-id]').first();
    await expect(invoiceBtn).toBeVisible();
    await expect(invoiceBtn).toHaveText(/Invoice/i);

    // WHEN: Invoice → THEN invoiced (badge del job en el board)
    await invoiceBtn.click();
    await expect(page.getByText('INVOICED', { exact: true }).first()).toBeVisible();

    // THEN: revenue sube (el invoice de $2,200 se suma)
    await expect
      .poll(async () => readRevenue(page), { timeout: 10_000 })
      .toBe(revenueBefore + 2200);
  });

  test('loop de auto-calificación: la IA califica sola un lead sin acción (waitFor)', async ({ page }) => {
    await setLoopFast(page);
    await page.goto(BASE + '/');

    // WHEN: capturar un lead y NO hacerle nada
    const captureBtn = page.getByRole('button', { name: 'Capture as lead' });
    await captureBtn.click();
    const qualifyBtn = page.locator('[data-qualify-id]').first();
    await expect(qualifyBtn).toBeVisible();

    // THEN: la IA lo auto-califica (loop 1, knob fast → 4s) y pasa a Book sin input
    await expect(qualifyBtn).not.toBeVisible({ timeout: 15_000 });
    const bookBtn = page.locator('[data-book-id]').first();
    await expect(bookBtn).toBeVisible();
    // el lead calificado por IA debe tener score (90) y razón de auto-qualify
    const scoreEl = page.locator('[data-score]').first();
    await expect(scoreEl).toHaveText('90');
  });

  test('Reset restaura el seed limpio (Gherkin AC-8)', async ({ page }) => {
    await setLoopFast(page);
    await page.goto(BASE + '/');

    // mover 1 lead a invoiced
    const captureBtn = page.getByRole('button', { name: 'Capture as lead' });
    await captureBtn.click();
    await page.locator('[data-qualify-id]').first().click();
    await page.locator('[data-book-id]').first().click();
    await page.locator('[data-assign-id]').first().selectOption({ index: 1 });
    await page.getByRole('button', { name: 'Dispatch', exact: true }).first().click();
    await page.getByRole('button', { name: 'Start', exact: true }).first().click();
    await page.getByRole('button', { name: 'Complete', exact: true }).first().click();
    await page.locator('[data-invoice-id]').first().click();
    await expect(page.getByText('INVOICED', { exact: true }).first()).toBeVisible();

    // WHEN: Reset
    await page.getByRole('button', { name: 'Reset', exact: true }).click();

    // THEN: vuelve al seed (5 leads qualified del seed, 0 invoiced, revenue 0)
    await expect(page.getByTestId('kpi-bar')).toContainText('$0', { timeout: 10_000 });
    await expect(page.getByText('María González')).toBeVisible();
    // el estado persistido vuelve a ser el seed limpio (5 leads, 0 invoiced)
    const stored = await page.evaluate(() => {
      const raw = localStorage.getItem('demo-hvac:v1');
      return raw ? JSON.parse(raw) : null;
    });
    expect(stored).not.toBeNull();
    expect(stored.leads).toHaveLength(5);
    expect(stored.leads.every((l: { status: string }) => l.status === 'qualified')).toBe(true);
  });
});
