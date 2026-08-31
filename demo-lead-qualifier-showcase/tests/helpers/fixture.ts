/**
 * TEST FIXTURES — helpers para tests de islands/landing.
 * Usa la config Zod REAL (src/config) y tipos core reales (src/lib).
 * Consume el core; NO lo modifica.
 */
import { getNicheConfig } from '@/config';
import { strings } from '@/i18n/strings';
import type { Lang, UIStrings } from '@/i18n/strings';
import { createSeedState } from '@/lib/seed';
import { CALENDLY_URL } from '@/lib/constants';
import type { DemoState, Niche } from '@/lib/types';

/** Config real de un nicho (DI). */
export function cfg(niche: Niche) {
  const c = getNicheConfig(niche);
  if (!c) throw new Error(`No config for niche ${niche}`);
  return c;
}

/** Strings de UI para un idioma. */
export function t(lang: Lang = 'en'): UIStrings {
  return strings[lang];
}

/** Estado seed real del core (5 leads RE/Law). */
export function seed(): DemoState {
  return createSeedState();
}

/** Calendly central (AC-8). */
export const CALENDLY = CALENDLY_URL;
