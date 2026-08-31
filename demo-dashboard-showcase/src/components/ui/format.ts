/**
 * FORMAT HELPERS — presentación de números/fechas con Intl (i18n).
 * Moneda USD . Locale por idioma (en-US / es-CL).
 */
import type { Lang } from '../../i18n/strings';

const LOCALE: Record<Lang, string> = { en: 'en-US', es: 'es-CL' };

/** Formatea un número como moneda USD (Intl.NumberFormat). */
export function formatCurrency(value: number, lang: Lang = 'en'): string {
 return new Intl.NumberFormat(LOCALE[lang], {
 style: 'currency',
 currency: 'USD',
 maximumFractionDigits: 0,
 }).format(value);
}

/** Formatea un porcentaje (0-100) con 1 decimal. */
export function formatPercent(value: number, lang: Lang = 'en'): string {
 return new Intl.NumberFormat(LOCALE[lang], {
 style: 'percent',
 minimumFractionDigits: 1,
 maximumFractionDigits: 1,
 }).format(value / 100);
}

/** Formatea una fecha YYYY-MM-DD a formato legible por locale. */
export function formatDate(iso: string, lang: Lang = 'en'): string {
 if (!iso) return '—';
 const d = new Date(`${iso}T00:00:00`);
 if (Number.isNaN(d.getTime())) return iso;
 return new Intl.DateTimeFormat(LOCALE[lang], {
 year: 'numeric',
 month: 'short',
 day: 'numeric',
 }).format(d);
}
