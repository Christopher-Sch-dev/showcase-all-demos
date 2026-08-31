import type { Niche } from './types';

/**
 * CONSTANTS — config centralizada del core (spec.md AC-3, AC-6, AC-8).
 * Única fuente de verdad de valores de dominio que antes se hardcodeaban
 * en seed/reducer (Calendly URL, nicho por defecto). NO tocar config Zod aún
 * (fase posterior); esto centraliza lo mínimo que el core exige hoy.
 */

/** URL de agendado Calendly del demo (AC-3/AC-8): NUNCA mailto. */
export const CALENDLY_URL = 'https://calendly.com/csch1305';

/** Nicho por defecto del demo (AC-6, DI): configuración, no hardcode en reducer. */
export const DEFAULT_NICHE: Niche = 'realestate';
