/**
 * TEST HELPERS — render de islands con estado real.
 * Config Zod real (getNicheConfig('dental')) + strings i18n + seed real (createSeedState).
 */
import { render } from '@testing-library/react';
import { getNicheConfig } from '../../config';
import { getStrings } from '../../i18n/strings';
import { createSeedState } from '../../lib/seed';

/** Config Zod real del nicho dental. */
export const config = getNicheConfig('dental')!;

/** Strings i18n EN (default). */
export const strings = getStrings('en');

/** Estado seed real (9 pacientes + 15 citas). */
export const seedState = createSeedState();

/** Render helper tipado. */
export function renderWith(ui: React.ReactElement) {
 return render(ui);
}

/** Mock de localStorage (jsdom no lo provee por defecto en este setup). */
export function mockLocalStorage() {
 const store = new Map<string, string>();
 const ls = {
 getItem: (k: string) => store.get(k) ?? null,
 setItem: (k: string, v: string) => void store.set(k, v),
 removeItem: (k: string) => void store.delete(k),
 clear: () => store.clear(),
 };
 Object.defineProperty(window, 'localStorage', { value: ls, configurable: true });
 return ls;
}
