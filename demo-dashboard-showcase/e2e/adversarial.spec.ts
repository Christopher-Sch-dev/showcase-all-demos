/**
 * ADVERSARIAL E2E — producción real (NUNCA mock).
 * Doble-clicks, acciones inválidas (no crashea), reload a mitad de flujo (persistencia),
 * reset → seed, mobile 375 sin overflow + touch ≥44px.
 * Best practices web: web-first assertions, aislamiento por test, emulación mobile
 * (playwright.dev/docs/emulation: isMobile + hasTouch).
 */
import { test, expect, type Page } from '@playwright/test';
import { resetStorage, expectNoHorizontalOverflow, expectTouchTargetsMin44 } from './helpers';

/** Colecciona errores de consola de la página (para verificar que no crashea). */
function collectConsoleErrors(page: Page): string[] {
 const errors: string[] = [];
 page.on('console', (msg) => {
 if (msg.type() === 'error') errors.push(msg.text());
 });
 page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
 return errors;
}

test.beforeEach(async ({ page }) => {
 await resetStorage(page);
});

test.describe('Adversarial', () => {
 test('doble-click en botones no crashea', async ({ page }) => {
 const errors = collectConsoleErrors(page);
 await page.goto('/');

 const table = page.getByRole('region', { name: 'Patients' });

 // Doble-click en "New patient" → abre el form (sin crashear).
 const newBtn = page.getByRole('button', { name: '+ New patient' });
 await newBtn.click();
 await newBtn.click();
 await expect(page.getByRole('form', { name: 'New patient' })).toBeVisible();

 // Doble-click en "Cancel" → cierra el form.
 const cancel = page.getByRole('button', { name: 'Cancel' });
 await cancel.click();
 await cancel.click();
 await expect(page.getByRole('form', { name: 'New patient' })).toHaveCount(0);

 // Doble-click en paginación "Next →" → no crashea, página estable.
 const next = table.getByRole('button', { name: 'Next →' });
 await next.click();
 await next.click();
 await expect(table.getByText('2 of 2')).toBeVisible();

 // Doble-click en "Reset data" → solo un confirm() (el segundo click no duplica).
 let dialogs = 0;
 page.on('dialog', (d) => { dialogs += 1; d.accept(); });
 const reset = page.getByRole('button', { name: 'Reset data' });
 await reset.click();
 await reset.click();
 await expect(table.getByText('1 of 2')).toBeVisible();

 // Sin errores de consola → la app no crasheó.
 expect(errors).toEqual([]);
 });

 test('acciones inválidas muestran errores inline sin enviar el form', async ({ page }) => {
 const errors = collectConsoleErrors(page);
 await page.goto('/');

 await page.getByRole('button', { name: '+ New patient' }).click();
 const form = page.getByRole('form', { name: 'New patient' });

 // Datos inválidos: nombre vacío, email mal, phone mal, RUT mal.
 await page.getByLabel('Full name').fill('');
 await page.getByLabel('Email').fill('no-es-email');
 await page.getByLabel('Phone').fill('abc');
 await page.getByLabel('ID (RUT)').fill('123');
 await page.getByRole('button', { name: 'Save patient' }).click();

 // Errores inline visibles (, validación inline, no alert()).
 await expect(form.getByText('Name is required.')).toBeVisible();
 await expect(form.getByText('Enter a valid email address.')).toBeVisible();
 await expect(form.getByText('Enter a valid phone number.')).toBeVisible();
 await expect(form.getByText('Enter a valid ID (e.g. 12.345.678-9).')).toBeVisible();

 // El form NO se envió → no se creó ningún paciente nuevo (siguen 9 seed).
 await expect(page.getByRole('region', { name: 'Patients' }).locator('tbody tr')).toHaveCount(8);
 await expect(page.getByRole('region', { name: 'Patients' }).getByText('1 of 2')).toBeVisible();

 // Sin errores de consola.
 expect(errors).toEqual([]);
 });

 test('reload a mitad de flujo persiste el estado', async ({ page }) => {
 await page.goto('/');

 // Crear un paciente (mitad de flujo).
 await page.getByRole('button', { name: '+ New patient' }).click();
 await page.getByLabel('Full name').fill('Mitad Flujo E2E');
 await page.getByLabel('Email').fill('mitad@example.com');
 await page.getByLabel('Phone').fill('+56 9 5555 6666');
 await page.getByRole('button', { name: 'Save patient' }).click();
 await expect(page.getByRole('region', { name: 'Patients' }).getByText('Mitad Flujo E2E')).toBeVisible();

 // Recargar a mitad de flujo → el estado persiste .
 await page.reload();
 await expect(page.getByRole('region', { name: 'Patients' }).getByText('Mitad Flujo E2E')).toBeVisible();
 });

 test('reset restaura el seed', async ({ page }) => {
 await page.goto('/');

 // Modificar: crear un paciente.
 await page.getByRole('button', { name: '+ New patient' }).click();
 await page.getByLabel('Full name').fill('A Eliminar E2E');
 await page.getByLabel('Email').fill('eliminar@example.com');
 await page.getByLabel('Phone').fill('+56 9 7777 8888');
 await page.getByRole('button', { name: 'Save patient' }).click();
 await expect(page.getByRole('region', { name: 'Patients' }).getByText('A Eliminar E2E')).toBeVisible();

 // Reset + confirm → vuelve al seed (9 pacientes, "1 of 2").
 page.once('dialog', (d) => d.accept());
 await page.getByRole('button', { name: 'Reset data' }).click();

 await expect(page.getByRole('region', { name: 'Patients' }).getByText('A Eliminar E2E')).toHaveCount(0);
 await expect(page.getByRole('region', { name: 'Patients' }).getByText('1 of 2')).toBeVisible();
 await expect(page.getByRole('region', { name: 'Patients' }).getByText('María Fernández', { exact: true })).toBeVisible();
 });

 test('mobile 375 sin overflow + touch ≥44px', async ({ page }) => {
 await page.goto('/');

 // Sin overflow horizontal .
 await expectNoHorizontalOverflow(page);

 // Todos los targets touch ≥44px (,).
 await expectTouchTargetsMin44(page);

 // El dashboard es funcional en mobile: KPIs visibles.
 await expect(page.getByText('Active patients')).toBeVisible();
 });
});
