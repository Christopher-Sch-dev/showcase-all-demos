/**
 * DASHBOARD E2E — flujo Gherkin completo (producción real, NUNCA mock).
 * KPIs derivados → charts → tabla paginada + filtros → CRUD (crear/editar/eliminar) → persistencia.
 * Verifica que los KPIs cambian al mutar datos (respuesta en vivo, AC-1).
 * Best practices web: locators por rol/texto, web-first assertions, aislamiento por test.
 */
import { test, expect, type Page } from '@playwright/test';
import { resetStorage } from './helpers';

// ── helpers de localización (resilientes a cambios de DOM) ──

/** Card de un KPI por su label (ej. "Active patients"). */
function kpiCard(page: Page, label: string) {
  return page
    .locator('section[aria-label="Key performance indicators"]')
    .getByText(label, { exact: true })
    .locator('xpath=ancestor::div[contains(@class,"rounded-card")]');
}

/** Valor de un KPI tal como se muestra (el <p> con el número dentro de la card). */
async function kpiValue(page: Page, label: string): Promise<string> {
  return (await kpiCard(page, label).locator('p').first().textContent()) ?? '';
}

/**
 * Monto a número. El KPI se muestra formateado ("$12.345"), así que Number()
 * directo daba NaN y la comparación pasaba sin comparar nada.
 */
function toAmount(display: string): number {
  return Number(display.replace(/[^0-9.-]/g, ''));
}

/** Abre el form de nuevo paciente. */
async function openNewPatient(page: Page) {
  await page.getByRole('button', { name: '+ New patient' }).click();
  await expect(page.getByRole('form', { name: 'New patient' })).toBeVisible();
}

/** Llena el form con datos válidos y guarda. */
async function fillAndSave(page: Page, data: { nombre: string; email: string; phone: string }) {
  // Por id y no por label: la búsqueda de la tabla se anuncia como
  // "Search by name, ID or email…", así que getByLabel('Email') resuelve dos
  // inputs y entra en strict mode. Los ids del form son estables.
  await page.locator('#pf-nombre').fill(data.nombre);
  await page.locator('#pf-email').fill(data.email);
  await page.locator('#pf-phone').fill(data.phone);
  await page.getByRole('button', { name: 'Save patient' }).click();
}

test.beforeEach(async ({ page }) => {
  await resetStorage(page);
});

test.describe('Dashboard — flujo Gherkin completo', () => {
  test('KPIs derivados visibles con nota de honestidad', async ({ page }) => {
    await page.goto('/');

    // 6 KPIs derivados (AC-1).
    for (const label of [
      'Active patients',
      'No-show rate',
      'Total revenue',
      'Revenue / patient',
      'Scheduled',
      'Completed',
    ]) {
      await expect(kpiCard(page, label)).toBeVisible();
    }

    // Nota de honestidad en proyecciones (AC-7).
    await expect(page.getByText('Estimated based on industry averages').first()).toBeVisible();
  });

  test('charts por mes y por tratamiento', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Revenue by month' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Revenue by treatment' })).toBeVisible();
  });

  test('tabla paginada (8 filas) + filtros', async ({ page }) => {
    await page.goto('/');

    const table = page.getByRole('region', { name: 'Patients' });
    await expect(table).toBeVisible();

    // 9 pacientes seed → 8 por página → "1 of 2".
    await expect(table.getByText('1 of 2')).toBeVisible();
    await expect(table.locator('tbody tr')).toHaveCount(8);

    // Paginar → "2 of 2".
    await table.getByRole('button', { name: 'Next →' }).click();
    await expect(table.getByText('2 of 2')).toBeVisible();
    await expect(table.locator('tbody tr')).toHaveCount(1);

    // Volver a página 1.
    await table.getByRole('button', { name: '← Prev' }).click();
    await expect(table.getByText('1 of 2')).toBeVisible();

    // Filtro por estado: "Pending" → solo P8 y P9 (2 filas).
    await table.getByLabel('All statuses').selectOption('pendiente');
    await expect(table.locator('tbody tr')).toHaveCount(2);

    // Filtro por tratamiento: "Implante" → P4 (activo) + P9 (pendiente) = 2.
    await table.getByLabel('All statuses').selectOption('all');
    await table.getByLabel('All treatments').selectOption('Implante');
    await expect(table.locator('tbody tr')).toHaveCount(2);
  });

  test('CRUD crear paciente → aparece en tabla y KPIs cambian', async ({ page }) => {
    await page.goto('/');

    const activeBefore = await kpiValue(page, 'Active patients');
    // Antes de crear: si se lee después, la comparación es tautológica y no prueba nada.
    const revenueBefore = toAmount(await kpiValue(page, 'Total revenue'));

    await openNewPatient(page);
    await fillAndSave(page, {
      nombre: 'Test E2E Paciente',
      email: 'test.e2e@example.com',
      phone: '+56 9 1111 2222',
    });

    // Aparece en la tabla.
    await expect(page.getByRole('region', { name: 'Patients' }).getByText('Test E2E Paciente')).toBeVisible();

    // KPI "Active patients" sube en 1 (respuesta en vivo, AC-1).
    const activeAfter = await kpiValue(page, 'Active patients');
    expect(Number(activeAfter)).toBe(Number(activeBefore) + 1);

    // KPI "Total revenue" sube con el valor del tratamiento (Limpieza = 120).
    // Crear paciente genera una cita completed con valor, así que el revenue sube.
    const revenueAfter = toAmount(await kpiValue(page, 'Total revenue'));
    expect(Number.isFinite(revenueBefore)).toBe(true);
    expect(revenueAfter).toBeGreaterThan(revenueBefore);
  });

  test('CRUD editar paciente', async ({ page }) => {
    await page.goto('/');

    // Editar el primer paciente seed (María Fernández).
    await page.getByRole('button', { name: 'Edit María Fernández' }).click();
    await expect(page.getByRole('form', { name: 'Edit patient' })).toBeVisible();

    await page.locator('#pf-nombre').fill('María Fernández Editada');
    await page.getByRole('button', { name: 'Save patient' }).click();

    await expect(page.getByRole('region', { name: 'Patients' }).getByText('María Fernández Editada')).toBeVisible();
    await expect(page.getByRole('region', { name: 'Patients' }).getByText('María Fernández', { exact: true })).toHaveCount(0);
  });

  test('CRUD eliminar paciente', async ({ page }) => {
    await page.goto('/');

    // Aceptar el confirm() de eliminación.
    page.once('dialog', (d) => d.accept());
    await page.getByRole('button', { name: 'Delete María Fernández' }).click();

    await expect(page.getByRole('region', { name: 'Patients' }).getByText('María Fernández', { exact: true })).toHaveCount(0);
  });

  test('persistencia localStorage tras recargar', async ({ page }) => {
    await page.goto('/');

    await openNewPatient(page);
    await fillAndSave(page, {
      nombre: 'Persistido E2E',
      email: 'persistido@example.com',
      phone: '+56 9 3333 4444',
    });
    await expect(page.getByRole('region', { name: 'Patients' }).getByText('Persistido E2E')).toBeVisible();

    // Recargar → el paciente persiste (AC-9).
    await page.reload();
    await expect(page.getByRole('region', { name: 'Patients' }).getByText('Persistido E2E')).toBeVisible();
  });
});
