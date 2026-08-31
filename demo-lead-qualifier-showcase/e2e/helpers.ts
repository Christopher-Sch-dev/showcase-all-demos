/**
 * E2E helpers — demo-lead-qualifier.
 * Utilidades compartidas por los specs Playwright. Nunca mock: consumen la app real servida.
 */
import type { Page } from '@playwright/test';

/** URL base de la build estática servida (producción real). */
export const BASE_URL = 'http://127.0.0.1:8080';

/** Calendly central (spec AC-3/AC-8): NUNCA mailto. */
export const CALENDLY = 'https://calendly.com/csch1305';

/** Clave de persistencia localStorage (spec AC-9). */
export const STORAGE_KEY = 'demo-lead-qualifier:v1';

/** Rellena el form de la demo con un lead RE válido (score alto). */
export async function fillLeadForm(
  page: Page,
  opts: Partial<{ name: string; email: string; phone: string; topic: string; budget: string }> = {},
) {
  await page.getByTestId('lf-name').fill(opts.name ?? 'Carla Mendez');
  await page.getByTestId('lf-email').fill(opts.email ?? 'carla@example.com');
  await page.getByTestId('lf-phone').fill(opts.phone ?? '555-0123');
  await page.getByTestId('lf-topic').fill(opts.topic ?? 'looking for a 4-bedroom house under $600k');
  await page.getByTestId('lf-budget').fill(opts.budget ?? '550000');
}

/** Escucha el popup target=_blank sin navegar el runner (Calendly es una página externa). */
export function capturePopup(page: Page): Promise<string> {
  return new Promise((resolve) => {
    page.once('popup', (popup) => {
      resolve(popup.url());
    });
  });
}
