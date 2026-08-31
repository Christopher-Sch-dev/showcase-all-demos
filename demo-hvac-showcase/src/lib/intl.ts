/**
 * Helpers de formateo internacional con Intl.*
 * Inglés (en-US) por defecto, con fallback a es-CL para locales no soportados.
 */

export const DEFAULT_LOCALE = 'en-US';
export const FALLBACK_LOCALE = 'es-CL';
export const CURRENCY = 'USD';

// rol: normalizar un locale; si no está soportado por el runtime, cae a es-CL
function resolveLocale(locale?: string): string {
  const loc = locale ?? DEFAULT_LOCALE;
  try {
    return Intl.NumberFormat.supportedLocalesOf([loc])[0] ?? FALLBACK_LOCALE;
  } catch {
    return FALLBACK_LOCALE;
  }
}

/** Formatea un monto como moneda (USD por defecto, locale-aware). */
export function formatCurrency(value: number, locale?: string): string {
  return new Intl.NumberFormat(resolveLocale(locale), {
    style: 'currency',
    currency: CURRENCY,
  }).format(value);
}

/** Formatea una fracción 0-1 como porcentaje (locale-aware). */
export function formatPercent(value: number, locale?: string): string {
  return new Intl.NumberFormat(resolveLocale(locale), { style: 'percent' }).format(value);
}

/** Formatea un timestamp (epoch ms) como fecha/hora (locale-aware). */
export function formatDateTime(epochMs: number, locale?: string): string {
  return new Intl.DateTimeFormat(resolveLocale(locale), {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(epochMs));
}
