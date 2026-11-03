/**
 * CONSTANTS — config centralizada del core (spec.md AC-8, AC-9).
 * Única fuente de verdad de valores de dominio que antes se hardcodeaban
 * en seed/reducer/storage (Calendly URL, clave de persistencia, versión).
 * NO tocar config Zod aún (fase posterior src/config/); esto centraliza lo
 * mínimo que el core exige hoy.
 */

/** URL de agendado Calendly del demo (AC-8): NUNCA mailto. */
export const CALENDLY_URL = 'https://calendly.com/csch1305';

/** Clave de persistencia versionada de la demo (AC-9). */
export const STORAGE_KEY = 'demo-dashboard:v1';

/** Versión del shape persistido (bump al cambiar el contrato de DemoState). */
export const CURRENT_VERSION = 1;

/** Valor de referencia por tratamiento (USD) — usado al crear un paciente para
 *  generar su primera cita completed (el revenue del dashboard se deriva de citas
 *  completed, spec §7.2). Fuente: valores del seed (Limpieza 120, Ortodoncia 400,
 *  Implante 1800, etc.). */
export const TRATAMIENTO_VALOR: Record<string, number> = {
  Limpieza: 120,
  Ortodoncia: 400,
  Blanqueamiento: 350,
  Implante: 1800,
  Endodoncia: 700,
};
