// E2E de PRODUCCIÓN REAL — CASOS DE USO Y CASOS EXTREMOS QUE FALTABAN.
// Escenarios que NO cubrían los specs previos:
//   1. canceled / no_show desde el DispatchBoard (AC-5, ramas no-dead-end) con
//      botones reales en la UI — y que quedan EXCLUIDOS de KPIs de revenue.
//   2. localStorage corrupto a nivel de contenido (status inválido) → la app cae
//      a seed sin crash (deep validation en storage.ts).
//   3. Sin técnico disponible en la zona (técnico inactivo) → el select no ofrece
//      opciones y el job no se puede despachar (guard de dominio).
// NUNCA mock: contra el build estático servido. La inyección de localStorage es
// DI del almacén real, no de la lógica de negocio.
import { test, expect, type Page } from '@playwright/test';

const BASE = process.env.E2E_BASE_URL ?? 'http://localhost:8080';

// rol: knob de demo → loop rápido determinista (sin feed/emergencias automáticas).
async function setLoopFast(page: Page) {
  await page.addInitScript(() => localStorage.setItem('demo-hvac:loop-speed', 'fast'));
}

// rol: construir un estado seed válido PERO con un job 'booked' (para poder
// cancel/no_show) o con el técnico de una zona inactivo. Se inyecta en
// localStorage ANTES del load del JS de la app (loadState lo valida y usa).
// Los overrides de técnico REEMPLAZAN por id (no duplican).
async function seedCustomState(page: Page, leads: unknown[], technicianOverrides?: unknown[]) {
  const defaults: Record<string, unknown>[] = [
    { id: 'tech-north', name: 'Carlos', color: '#2563EB', zone: 'north', active: true },
    { id: 'tech-central', name: 'Ana', color: '#9333EA', zone: 'central', active: true },
    { id: 'tech-south', name: 'Mike', color: '#0D9488', zone: 'south', active: true },
  ];
  const byId = new Map(defaults.map((t) => [String(t.id), t]));
  for (const o of technicianOverrides ?? []) {
    byId.set(String((o as { id: string }).id), o as Record<string, unknown>);
  }
  const seed = {
    version: 1,
    leads,
    technicians: [...byId.values()],
    callCounter: 20,
    seeded: true,
  };
  await page.addInitScript(
    (s) => localStorage.setItem('demo-hvac:v1', JSON.stringify(s)),
    seed,
  );
}

// rol: lead 'booked' válido en zona north (contrato completo).
function bookedLead(id: string, zone = 'north'): Record<string, unknown> {
  return {
    id,
    status: 'booked',
    customerName: `Client-${id}`,
    customerPhone: '555-0000',
    address: '1 Test St',
    city: 'City',
    issue: 'AC repair',
    zone,
    priority: 'high',
    capturedAt: 1_700_000_000_000,
    respondedAt: 1_700_000_000_100,
    bookedAt: 1_700_000_000_200,
    scheduledDate: '2026-08-21',
    scheduledTime: '09:00',
    timeline: [
      { status: 'lead', at: 1_700_000_000_000 },
      { status: 'qualified', at: 1_700_000_000_100, note: 'ok' },
      { status: 'booked', at: 1_700_000_000_200 },
    ],
    createdAt: 1_700_000_000_000,
    updatedAt: 1_700_000_000_200,
  };
}

test.describe('Casos de uso — canceled y no_show (AC-5, ramas no-dead-end)', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('Cancelar un job booked → CANCELED, excluido de revenue KPIs', async ({ page }) => {
    await setLoopFast(page);
    await seedCustomState(page, [bookedLead('B1')]);
    await page.goto(BASE + '/');

    // el job booked está en el board con botones Cancel/No-show
    const cancelBtn = page.locator('[data-cancel-id="B1"]');
    await expect(cancelBtn).toBeVisible();
    await expect(page.getByText('BOOKED', { exact: true }).first()).toBeVisible();

    // WHEN: Cancelar
    await cancelBtn.click();

    // THEN: el job pasa a CANCELED
    await expect(page.getByText('CANCELED', { exact: true }).first()).toBeVisible();

    // THEN: revenue se mantiene en 0 (canceled NO aporta)
    const rev = await page.locator('[data-kpi="Recovered revenue"]').first().innerText();
    expect(rev).toContain('$0');

    // THEN: no aparece ya como job activo en el board (ni botón de Cancel)
    await expect(page.locator('[data-cancel-id="B1"]')).toHaveCount(0);

    // THEN: persistido
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('demo-hvac:v1')!));
    expect(stored.leads.find((l: { id: string }) => l.id === 'B1')?.status).toBe('canceled');
  });

  test('No-show en un job scheduled → NO SHOW, excluido de revenue', async ({ page }) => {
    await setLoopFast(page);
    // job scheduled (con técnico asignado) → aún se puede marcar no_show
    const scheduled = { ...bookedLead('B2'), status: 'scheduled', technicianId: 'tech-north' };
    await seedCustomState(page, [scheduled]);
    await page.goto(BASE + '/');

    const noShowBtn = page.locator('[data-noshow-id="B2"]');
    await expect(noShowBtn).toBeVisible();

    await noShowBtn.click();

    await expect(page.getByText('NO SHOW', { exact: true }).first()).toBeVisible();
    const rev = await page.locator('[data-kpi="Recovered revenue"]').first().innerText();
    expect(rev).toContain('$0');
    // no_show se cuenta en el KPI de no_show (no aporta al funnel de revenue)
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('demo-hvac:v1')!));
    expect(stored.leads.find((l: { id: string }) => l.id === 'B2')?.status).toBe('no_show');
  });
});

test.describe('Caso extremo — localStorage corrupto a nivel de contenido', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('lead con status inválido en storage → la app cae a seed sin crash', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    // inyectar estado válido salvo 1 lead con status bogus
    const corrupt = {
      version: 1,
      leads: [{ ...bookedLead('X1'), status: 'bogus' }],
      technicians: [
        { id: 'tech-north', name: 'Carlos', color: '#2563EB', zone: 'north', active: true },
        { id: 'tech-central', name: 'Ana', color: '#9333EA', zone: 'central', active: true },
        { id: 'tech-south', name: 'Mike', color: '#0D9488', zone: 'south', active: true },
      ],
      callCounter: 10,
      seeded: true,
    };
    await page.addInitScript((s) => localStorage.setItem('demo-hvac:v1', JSON.stringify(s)), corrupt);
    await setLoopFast(page);
    await page.goto(BASE + '/');

    // la app NO crashea y cae a seed (5 leads qualified del seed)
    await expect(page.getByTestId('kpi-bar')).toBeVisible();
    await expect(page.getByText('María González')).toBeVisible();
    const callsCaptured = await page.locator('[data-kpi="Calls captured"]').first().innerText();
    expect(callsCaptured).toContain('5');
    expect(errors).toEqual([]);
  });
});

test.describe('Caso de uso — sin técnico disponible en la zona (inactivo)', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('job booked en zona north con Carlos inactivo → no se puede asignar ni despachar', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await setLoopFast(page);
    // técnico de la zona north inactivo
    await seedCustomState(page, [bookedLead('B3')], [
      { id: 'tech-north', name: 'Carlos', color: '#2563EB', zone: 'north', active: false },
    ]);
    await page.goto(BASE + '/');

    // el job booked existe pero el select de asignación NO ofrece Carlos (inactivo)
    const assignSelect = page.locator('[data-assign-id="B3"]');
    await expect(assignSelect).toBeVisible();
    // el placeholder "Assign…" está disabled; sin técnicos activos → solo placeholder
    const options = await assignSelect.locator('option').allTextContents();
    expect(options.filter((o) => o.includes('Carlos'))).toHaveLength(0);

    // no hay botón Dispatch (no se despacha sin técnico asignado)
    await expect(page.getByRole('button', { name: 'Dispatch', exact: true }).first()).toHaveCount(0);

    // la app NO crashea y el job permanece booked
    await expect(page.getByText('BOOKED', { exact: true }).first()).toBeVisible();
    expect(errors).toEqual([]);
  });
});
